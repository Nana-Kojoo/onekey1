import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']);

interface SandboxRequestBody {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

export async function POST(req: NextRequest) {
  let payload: SandboxRequestBody;

  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = typeof payload.url === 'string' ? payload.url.trim() : '';
  const method = (typeof payload.method === 'string' ? payload.method.toUpperCase() : 'GET').trim();
  const headers = payload.headers && typeof payload.headers === 'object' ? payload.headers : {};

  if (!url) {
    return new Response(JSON.stringify({ error: 'URL is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    new URL(url);
  } catch {
    return new Response(JSON.stringify({ error: 'URL is invalid.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!ALLOWED_METHODS.has(method)) {
    return new Response(JSON.stringify({ error: `Method ${method} is not allowed.` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const startedAt = Date.now();

  try {
    const upstream = await fetch(url, {
      method,
      headers,
      body: method === 'GET' || method === 'HEAD' ? undefined : (payload.body as BodyInit | null | undefined),
      redirect: 'follow',
    });

    const responseText = await upstream.text();
    const durationMs = Date.now() - startedAt;
    const responseHeaders = Object.fromEntries(upstream.headers.entries());

    return new Response(JSON.stringify({
      ok: upstream.ok,
      status: upstream.status,
      statusText: upstream.statusText,
      durationMs,
      headers: responseHeaders,
      body: responseText.slice(0, 12000),
      truncated: responseText.length > 12000,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Request failed.';

    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
