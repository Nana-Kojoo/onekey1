import { NextRequest } from 'next/server';

export const runtime = 'edge'; // fast, low-latency streaming

function streamTextAsSSE(text: string) {
  const encoder = new TextEncoder();
  const chunks = text.match(/[\s\S]{1,140}/g) ?? [text];

  const stream = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        const payload = JSON.stringify({ choices: [{ delta: { content: chunk } }] });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}

function buildLocalFallbackCode(prompt: string) {
  const lower = prompt.toLowerCase();
  const isCurl = lower.includes('write a curl command') || lower.includes('rest/curl');
  const isPython = lower.includes('write python') || lower.includes('python 3');
  const isGithub = lower.includes('github') || lower.includes('gh ');

  const apiName = prompt.match(/for the\s+(.+?)\s+api/i)?.[1] ?? 'API';
  const task = prompt.match(/to:\s*(.+?)(?:\.\s|$)/i)?.[1] ?? 'perform a request';

  // GitHub API with Octokit (JavaScript/TypeScript)
  if (isGithub && !isPython) {
    const action = lower.includes('list') ? 'list repos' :
                   lower.includes('create') ? 'create issue' :
                   lower.includes('pr') || lower.includes('pull request') ? 'list pull requests' :
                   lower.includes('user') || lower.includes('profile') ? 'get authenticated user' :
                   'list repos';
    
    return `// npm install @octokit/rest
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function main() {
  try {
    // Goal: ${task}
    const { data } = await octokit.repos.listForAuthenticatedUser({
      sort: "updated",
      direction: "desc",
      per_page: 10,
    });
    
    console.log("Repositories:", data);
    data.forEach((repo) => {
      console.log(\`- \${repo.name}: \${repo.description || "No description"}\`);
    });
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();`;
  }

  // GitHub API with PyGithub (Python)
  if (isGithub && isPython) {
    return `# pip install PyGithub
from github import Github

# Authenticate with GitHub token
g = Github(login_or_token="YOUR_GITHUB_TOKEN")

# Or use environment variable
import os
g = Github(os.getenv("GITHUB_TOKEN"))

try:
    # Goal: ${task}
    user = g.get_user()
    print(f"Authenticated as: {user.login}")
    
    # List repositories
    for repo in user.get_repos():
        print(f"- {repo.name}: {repo.description or 'No description'}")
        print(f"  Stars: {repo.stargazers_count}, Forks: {repo.forks_count}")
        
except Exception as error:
    print(f"Error: {error}")
    exit(1)`;
  }

  if (isCurl) {
    return `# Fallback template (local mode)\ncurl -X GET "https://api.example.com/v1/resource" \\\n  -H "Authorization: Bearer $${apiName.toUpperCase().replace(/\W+/g, '_')}_API_KEY" \\\n  -H "Content-Type: application/json"\n\n# Goal: ${task}`;
  }

  if (isPython) {
    return `# pip install requests\nimport os\nimport requests\n\nAPI_KEY = os.environ.get("${apiName.toUpperCase().replace(/\W+/g, '_')}_API_KEY", "")\nBASE_URL = "https://api.example.com/v1"\n\nheaders = {\n    "Authorization": f"Bearer {API_KEY}",\n    "Content-Type": "application/json",\n}\n\n# Goal: ${task}\nresp = requests.get(f"{BASE_URL}/resource", headers=headers, timeout=30)\nresp.raise_for_status()\nprint(resp.json())\n`;
  }

  return `// npm install axios\nimport axios from 'axios';\n\nconst API_KEY = process.env.${apiName.toUpperCase().replace(/\W+/g, '_')}_API_KEY || '';\nconst client = axios.create({\n  baseURL: 'https://api.example.com/v1',\n  headers: {\n    Authorization: \`Bearer \${API_KEY}\`,\n    'Content-Type': 'application/json',\n  },\n  timeout: 30000,\n});\n\nasync function run() {\n  // Goal: ${task}\n  const { data } = await client.get('/resource');\n  console.log(data);\n}\n\nrun().catch((err) => {\n  console.error(err?.response?.data || err.message);\n  process.exit(1);\n});\n`;
}

function readUpstreamError(errText: string) {
  let message = errText;
  try {
    const parsed = JSON.parse(errText);
    message = parsed?.error?.message ?? parsed?.message ?? parsed?.detail ?? errText;
  } catch {}
  return message;
}

export async function POST(req: NextRequest) {
  const fallbackEnabled = process.env.LOCAL_AI_FALLBACK !== 'false';
  const apiKey = process.env.ANTHROPIC_API_KEY ?? process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    if (fallbackEnabled) {
      const body = await req.json();
      const prompt = body?.messages?.[0]?.content ?? 'generate starter integration code';
      return streamTextAsSSE(buildLocalFallbackCode(String(prompt)));
    }

    return new Response(JSON.stringify({ error: 'Missing AI API key. Set ANTHROPIC_API_KEY or OPENROUTER_API_KEY.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await req.json();
  const requestedModel = typeof body?.model === 'string' && body.model.trim()
    ? body.model.trim()
    : undefined;

  const useOpenRouter =
    process.env.AI_PROVIDER === 'openrouter' ||
    apiKey.startsWith('sk-or-v1-') ||
    !!process.env.OPENROUTER_API_KEY;

  if (useOpenRouter) {
    const messages = [
      ...(body.system ? [{ role: 'system', content: body.system }] : []),
      ...(Array.isArray(body.messages) ? body.messages : []),
    ];

    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.OPENROUTER_REFERER ?? 'http://localhost:3000',
        'X-Title': process.env.OPENROUTER_TITLE ?? 'API Directory',
      },
      body: JSON.stringify({
        model: requestedModel ?? process.env.OPENROUTER_MODEL ?? 'openrouter/auto',
        stream: true,
        max_tokens: 800,
        messages,
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      const upstreamMessage = readUpstreamError(errText);

      if (fallbackEnabled && upstream.status === 402) {
        const prompt = body?.messages?.[0]?.content ?? 'generate starter integration code';
        return streamTextAsSSE(buildLocalFallbackCode(String(prompt)));
      }

      const message =
        upstream.status === 402
          ? `OpenRouter billing/credits issue (402). ${upstreamMessage}`
          : upstreamMessage;

      return new Response(JSON.stringify({ error: message }), {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      },
    });
  }

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: requestedModel?.startsWith('claude-') ? requestedModel : 'claude-sonnet-4-20250514',
      max_tokens: 800,
      stream: true,
      ...body,
    }),
  });

  if (!upstream.ok) {
    const errText = await upstream.text();
    const upstreamMessage = readUpstreamError(errText);

    if (fallbackEnabled && upstream.status === 402) {
      const prompt = body?.messages?.[0]?.content ?? 'generate starter integration code';
      return streamTextAsSSE(buildLocalFallbackCode(String(prompt)));
    }

    return new Response(JSON.stringify({ error: upstreamMessage }), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Stream the SSE response directly back to the client
  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
