'use client';

import { useEffect, useState, useRef } from 'react';
import type { Api, Language } from '@/lib/types';
import { AI_SUGGESTIONS } from '@/lib/data';
import { CheckIcon, CopyIcon, SparklesIcon } from '@/components/ui/Icons';

const LANGS: { key: Language; label: string }[] = [
  { key: 'javascript', label: 'JavaScript' },
  { key: 'python',     label: 'Python'     },
  { key: 'curl',       label: 'cURL'       },
];

interface SavedSnippet {
  id: string;
  createdAt: number;
  lang: Language;
  task: string;
  errorContext: string;
  output: string;
}

interface AICodePanelProps {
  api: Api;
}

interface SandboxResult {
  ok: boolean;
  status: number;
  statusText: string;
  durationMs: number;
  headers: Record<string, string>;
  body: string;
  truncated: boolean;
}

function extractExampleRequest(code: string) {
  const url = code.match(/https?:\/\/[^\s"'`\\]+/)?.[0] ?? '';

  let method = 'GET';
  method = code.match(/curl\s+-X\s+([A-Z]+)/i)?.[1]?.toUpperCase() ?? method;
  method = code.match(/fetch\([^,]+,\s*\{[\s\S]*?method\s*:\s*['"]([A-Z]+)['"]/i)?.[1]?.toUpperCase() ?? method;
  method = code.match(/requests\.(get|post|put|patch|delete|head|options)\(/i)?.[1]?.toUpperCase() ?? method;
  method = code.match(/axios\.(get|post|put|patch|delete|head|options)\(/i)?.[1]?.toUpperCase() ?? method;

  return { method, url };
}

function parseMockEnv(raw: string) {
  const map: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [key, ...rest] = trimmed.split('=');
    map[key.trim()] = rest.join('=').trim();
  }
  return map;
}

function interpolateMockEnv(input: string, envMap: Record<string, string>) {
  return input
    .replace(/process\.env\.([A-Z0-9_]+)/gi, (_, key: string) => envMap[key] ?? '')
    .replace(/\$\{([A-Z0-9_]+)\}/gi, (_, key: string) => envMap[key] ?? '')
    .replace(/\$([A-Z0-9_]+)/gi, (_, key: string) => envMap[key] ?? '');
}

export function AICodePanel({ api }: AICodePanelProps) {
  const [lang, setLang]       = useState<Language>('javascript');
  const [task, setTask]       = useState('');
  const [errorContext, setErrorContext] = useState('');
  const [output, setOutput]   = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError]     = useState('');
  const [copied, setCopied]   = useState(false);
  const [saved, setSaved]     = useState<SavedSnippet[]>([]);
  const [sandboxMethod, setSandboxMethod] = useState('GET');
  const [sandboxUrl, setSandboxUrl] = useState('');
  const [sandboxHeaders, setSandboxHeaders] = useState('{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer ${API_KEY}"\n}');
  const [sandboxBody, setSandboxBody] = useState('');
  const [sandboxEnv, setSandboxEnv] = useState('API_KEY=demo_api_key_123');
  const [sandboxRunning, setSandboxRunning] = useState(false);
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([]);
  const [sandboxResult, setSandboxResult] = useState<SandboxResult | null>(null);
  const outputRef             = useRef('');

  const suggestions = AI_SUGGESTIONS[api.id] ?? [
    'make an API call', 'list resources', 'create a record', 'handle errors',
  ];

  const storageKey = `onekey:snippets:${api.id}`;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as SavedSnippet[];
      if (Array.isArray(parsed)) setSaved(parsed);
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    if (!output.trim()) return;
    const guessed = extractExampleRequest(output);

    if (guessed.url && !sandboxUrl) setSandboxUrl(guessed.url);
    if (guessed.method && sandboxMethod === 'GET') setSandboxMethod(guessed.method);
  }, [output, sandboxMethod, sandboxUrl]);

  const persistSaved = (next: SavedSnippet[]) => {
    setSaved(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
  };

  const saveSnippet = (code: string) => {
    const text = code.trim();
    if (!text) return;

    const item: SavedSnippet = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
      lang,
      task: task.trim() || 'Generated snippet',
      errorContext: errorContext.trim(),
      output: text,
    };

    const next = [item, ...saved].slice(0, 8);
    persistSaved(next);
  };

  const loadSnippet = (item: SavedSnippet) => {
    setLang(item.lang);
    setTask(item.task);
    setErrorContext(item.errorContext || '');
    setOutput(item.output);
    outputRef.current = item.output;
    setError('');
  };

  const run = async (mode: 'generate' | 'fix' = 'generate') => {
    if (!task.trim() || streaming) return;
    if (mode === 'fix' && !errorContext.trim()) {
      setError('Paste an error message first, then click Fix Error.');
      return;
    }
    setStreaming(true);
    setError('');
    setOutput('');
    outputRef.current = '';

    const pkgInfo =
      lang === 'curl'       ? 'REST/cURL (no SDK)' :
      lang === 'javascript' ? `npm package: ${api.pkg.js}` :
                              `pip package: ${api.pkg.python}`;

    const basePrompt =
      lang === 'curl'
        ? `Write a cURL command for the ${api.name} API to: ${task}. Use realistic values and include required auth headers/params.`
        : `Write ${lang === 'javascript' ? 'modern JavaScript (ESM, async/await)' : 'Python 3'} code using ${pkgInfo} to: ${task} with the ${api.name} API.\nInstall: ${lang === 'javascript' ? api.pkg.note.split('/')[0].trim() : api.pkg.note.split('/')[1]?.trim() ?? api.pkg.note}\nInclude a brief install comment at the top.`;

    const prompt =
      mode === 'fix'
        ? `${basePrompt}\n\nFix the existing code below based on this runtime/build error.\nReturn the full corrected code only.\n\nError:\n${errorContext.trim()}\n\nExisting code:\n${(output || '').trim() || '// No prior code was provided. Generate a best-effort working version.'}`
        : basePrompt;

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: `You are an expert developer writing concise, production-quality API integration code.
Output ONLY raw code — no markdown, no backticks, no explanation, no preamble.
Write clean, realistic, idiomatic code that a senior developer would be proud to ship.
Include 1-2 line comments only where genuinely helpful.
Use environment variables for secrets (process.env.* for JS, os.environ[] for Python).
If an error is provided, prioritize fixing that error with minimal necessary edits while keeping the code idiomatic.`,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!res.ok) {
        const raw = await res.text();
        let details = raw;

        try {
          const parsed = JSON.parse(raw);
          details = parsed?.error ?? parsed?.message ?? raw;
        } catch {}

        throw new Error(details || `Server error ${res.status}`);
      }

      const reader = res.body!.getReader();
      const dec    = new TextDecoder();
      let   buf    = '';
      let receivedAnyToken = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const raw = line.slice(5).trim();
          if (raw === '[DONE]') break;
          try {
            const evt = JSON.parse(raw);
            const anthropicDelta = evt.type === 'content_block_delta' ? evt.delta?.text : undefined;
            const openaiDelta = evt.choices?.[0]?.delta?.content;
            const delta = anthropicDelta ?? openaiDelta;

            if (typeof delta === 'string' && delta.length > 0) {
              receivedAnyToken = true;
              outputRef.current += delta;
              setOutput(outputRef.current);
            }
          } catch {}
        }
      }

      if (!receivedAnyToken) {
        throw new Error('No output was returned by the model. Try again with a shorter prompt.');
      }

      saveSnippet(outputRef.current);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Generation failed. Check your AI API key configuration.');
    } finally {
      setStreaming(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const addSandboxLog = (line: string) => {
    const stamp = new Date().toLocaleTimeString();
    setSandboxLogs((prev) => [`[${stamp}] ${line}`, ...prev].slice(0, 24));
  };

  const runExampleRequest = async () => {
    if (sandboxRunning) return;
    if (!sandboxUrl.trim()) {
      addSandboxLog('Missing URL. Paste or generate code with a request URL first.');
      return;
    }

    const envMap = parseMockEnv(sandboxEnv);
    const url = interpolateMockEnv(sandboxUrl.trim(), envMap);
    const headersText = interpolateMockEnv(sandboxHeaders.trim(), envMap);
    const bodyText = interpolateMockEnv(sandboxBody.trim(), envMap);

    let parsedHeaders: Record<string, string>;
    try {
      parsedHeaders = headersText ? JSON.parse(headersText) : {};
    } catch {
      addSandboxLog('Headers JSON is invalid.');
      return;
    }

    let parsedBody: unknown = undefined;
    if (bodyText) {
      const contentType = (parsedHeaders['Content-Type'] || parsedHeaders['content-type'] || '').toLowerCase();
      if (contentType.includes('application/json')) {
        try {
          parsedBody = JSON.parse(bodyText);
        } catch {
          addSandboxLog('Body is not valid JSON while Content-Type is application/json.');
          return;
        }
      } else {
        parsedBody = bodyText;
      }
    }

    setSandboxRunning(true);
    setSandboxResult(null);
    addSandboxLog(`Running ${sandboxMethod} ${url}`);

    try {
      const res = await fetch('/api/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          method: sandboxMethod,
          headers: parsedHeaders,
          body: parsedBody,
        }),
      });

      const raw = await res.text();
      let payload: SandboxResult | { error?: string } = { error: raw };

      try {
        payload = JSON.parse(raw) as SandboxResult | { error?: string };
      } catch {}

      if (!res.ok || 'error' in payload) {
        const message = 'error' in payload ? (payload.error || 'Sandbox request failed.') : 'Sandbox request failed.';
        addSandboxLog(`Run failed: ${message}`);
        return;
      }

      setSandboxResult(payload);
      addSandboxLog(`Response ${payload.status} ${payload.statusText} in ${payload.durationMs}ms`);
      if (payload.truncated) addSandboxLog('Response was truncated for display.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sandbox request failed.';
      addSandboxLog(`Run failed: ${message}`);
    } finally {
      setSandboxRunning(false);
    }
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <h2 style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 700 }}>AI Code Generator</h2>
        <span className="badge badge-dark" style={{ fontSize: 9, letterSpacing: 1, gap: 4 }}>
          <SparklesIcon size={10} /> AI Assist
        </span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 14 }}>
        Describe what you want to do and the assistant will write working{' '}
        <strong>{api.pkg.note}</strong> code for you in real-time.
      </p>

      {/* Suggestion chips */}
      <div className="chip-row" style={{ marginBottom: 14 }}>
        {suggestions.map((s) => (
          <button key={s} className="chip" onClick={() => setTask(s)}>{s}</button>
        ))}
      </div>

      <div className="ai-panel">
        {/* Language tabs */}
        <div className="ai-lang-tabs">
          {LANGS.map(({ key, label }) => (
            <button
              key={key}
              className={`ai-lang-tab ${lang === key ? 'active' : ''}`}
              onClick={() => setLang(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="ai-subbar">
          <span className="ai-helper-text">Tip: Generate first, then paste an error and press Fix Error.</span>
          <button
            className="ai-mini-btn"
            onClick={() => saveSnippet(output)}
            disabled={streaming || !output.trim()}
            type="button"
          >
            Save
          </button>
          <button
            className="ai-mini-btn"
            onClick={run}
            disabled={streaming || !task.trim()}
            type="button"
          >
            Regenerate
          </button>
          <button
            className="ai-mini-btn"
            onClick={() => run('fix')}
            disabled={streaming || !task.trim() || !errorContext.trim()}
            type="button"
          >
            Fix Error
          </button>
        </div>

        {/* Input row */}
        <div className="ai-input-wrap">
          <input
            className="ai-input"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') run(); }}
            placeholder={`Describe what to build with ${api.name}…`}
          />
          <button className="ai-run-btn" onClick={run} disabled={streaming || !task.trim()}>
            {streaming ? 'Generating…' : '▶ Generate'}
          </button>
        </div>

        <div className="ai-fix-wrap">
          <div className="ai-field-label">Error context for auto-fix</div>
          <textarea
            className="ai-fix-input"
            value={errorContext}
            onChange={(e) => setErrorContext(e.target.value)}
            placeholder="Paste API/compiler/runtime error here to auto-fix generated code…"
          />
        </div>

        {/* Output */}
        {error && (
          <div style={{ padding: '14px 20px', color: '#fca5a5', fontFamily: 'var(--mono)', fontSize: 12 }}>
            {error}
          </div>
        )}

        {streaming && !output && (
          <div className="ai-thinking">
            Generating{' '}
            <div className="ai-dots"><span /><span /><span /></div>
          </div>
        )}

        {output && (
          <div style={{ position: 'relative' }}>
            <div className="ai-output">
              {output}
              {streaming && <span className="cursor" />}
            </div>
            {!streaming && (
              <button className="copy-btn" onClick={copy}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </span>
              </button>
            )}
          </div>
        )}

        {!output && !streaming && !error && (
          <div style={{ padding: '20px', color: '#4b5563', fontFamily: 'var(--mono)', fontSize: 12 }}>
            {'// Generated code will appear here…'}
          </div>
        )}
      </div>

      {saved.length > 0 && (
        <div className="ai-saved-wrap">
          <div className="ai-saved-head">Saved snippets</div>
          <div className="ai-saved-list">
            {saved.map((item) => (
              <button
                key={item.id}
                className="ai-saved-item"
                onClick={() => loadSnippet(item)}
                type="button"
              >
                <span className="ai-saved-title">{item.task}</span>
                <span className="ai-saved-meta">{item.lang} · {new Date(item.createdAt).toLocaleTimeString()}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="ai-sandbox-wrap">
        <div className="ai-sandbox-head">
          <h3 className="ai-sandbox-title">Runtime Test Sandbox</h3>
          <button
            className="ai-mini-btn"
            onClick={runExampleRequest}
            disabled={sandboxRunning}
            type="button"
          >
            {sandboxRunning ? 'Running…' : 'Run Example Request'}
          </button>
        </div>

        <div className="ai-sandbox-grid ai-sandbox-grid-request">
          <select
            className="ai-input ai-sandbox-method"
            value={sandboxMethod}
            onChange={(e) => setSandboxMethod(e.target.value)}
          >
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>PATCH</option>
            <option>DELETE</option>
          </select>
          <input
            className="ai-input"
            value={sandboxUrl}
            onChange={(e) => setSandboxUrl(e.target.value)}
            placeholder="https://api.example.com/v1/resource"
          />
        </div>

        <div className="ai-sandbox-grid ai-sandbox-grid-editors">
          <textarea
            className="ai-fix-input"
            value={sandboxHeaders}
            onChange={(e) => setSandboxHeaders(e.target.value)}
            placeholder='{"Authorization":"Bearer ${API_KEY}"}'
          />
          <textarea
            className="ai-fix-input"
            value={sandboxBody}
            onChange={(e) => setSandboxBody(e.target.value)}
            placeholder='{"sample": true}'
          />
        </div>

        <textarea
          className="ai-fix-input"
          value={sandboxEnv}
          onChange={(e) => setSandboxEnv(e.target.value)}
          placeholder={'API_KEY=demo_api_key_123\nACCOUNT_ID=demo_account'}
        />

        <div className="ai-sandbox-results">
          <div className="ai-sandbox-card">
            <div className="ai-sandbox-card-title">Response</div>
            {sandboxResult ? (
              <>
                <div className="ai-sandbox-status">
                  Status: {sandboxResult.status} {sandboxResult.statusText} · {sandboxResult.durationMs}ms
                </div>
                <pre className="ai-sandbox-pre">{sandboxResult.body || '// Empty response body'}</pre>
              </>
            ) : (
              <div className="ai-sandbox-empty">Run a request to see response output here.</div>
            )}
          </div>
          <div className="ai-sandbox-card">
            <div className="ai-sandbox-card-title">Logs</div>
            {sandboxLogs.length > 0 ? (
              <pre className="ai-sandbox-pre">{sandboxLogs.join('\n')}</pre>
            ) : (
              <div className="ai-sandbox-empty">Sandbox logs will appear here.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
