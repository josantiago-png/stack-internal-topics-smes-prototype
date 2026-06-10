import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { apiKey: clientKey, ...anthropicBody } = body;

  // Prefer server-side key; only fall back to client-provided key if none is configured
  const apiKey = env.ANTHROPIC_API_KEY || clientKey;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'No API key provided' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(anthropicBody),
  });

  // Stream the response straight through
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') ?? 'text/event-stream',
      'cache-control': 'no-cache',
    },
  });
};
