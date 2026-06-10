const SYSTEM_PROMPT = `You are Stack Internal, an enterprise knowledge agent with access to all of Acme's internal systems — docs, wikis, engineering, HR, comms, and analytics. Answer every question with a single definitive answer. Never hedge, qualify, or say "it depends." If there are multiple options, pick the best one and state it. Keep responses to 1-3 sentences for simple questions; a tight bullet list for complex ones. Never use filler phrases.`;

/**
 * Stream a chat completion via a proxy endpoint or directly from the Anthropic API.
 * Pass `endpoint = '/api/chat'` to route through the SvelteKit server (avoids CORS).
 * Pass `endpoint = null` to call Anthropic directly from the browser.
 * @param {string} apiKey - only used for direct (non-proxy) calls
 * @param {{ role: string, content: string }[]} messages
 * @param {string | null} [endpoint]
 * @returns {AsyncGenerator<string>}
 */
export async function* streamChat(apiKey, messages, endpoint = null) {
	const useProxy = endpoint !== null;
	const url = useProxy ? endpoint : 'https://api.anthropic.com/v1/messages';

	const headers = /** @type {Record<string, string>} */ ({
		'Content-Type': 'application/json'
	});
	if (!useProxy) {
		headers['x-api-key'] = apiKey;
		headers['anthropic-version'] = '2023-06-01';
		headers['anthropic-dangerous-direct-browser-access'] = 'true';
	}

	const response = await fetch(url, {
		method: 'POST',
		headers,
		body: JSON.stringify({
			model: 'claude-opus-4-6',
			max_tokens: 1024,
			system: SYSTEM_PROMPT,
			messages,
			stream: true
		})
	});

	if (!response.ok) {
		// Proxy not available (static deployment) — retry directly from the browser
		if (useProxy && response.status === 404) {
			yield* streamChat(apiKey, messages, null);
			return;
		}
		const errText = await response.text();
		throw new Error(`Anthropic API error ${response.status}: ${errText}`);
	}

	const reader = response.body?.getReader();
	if (!reader) return;

	const decoder = new TextDecoder();
	let buffer = '';

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		buffer += decoder.decode(value, { stream: true });
		const lines = buffer.split('\n');
		buffer = lines.pop() ?? '';

		for (const line of lines) {
			if (!line.startsWith('data: ')) continue;
			const payload = line.slice(6);
			try {
				const event = JSON.parse(payload);
				if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
					yield event.delta.text;
				}
			} catch { /* ignore parse errors */ }
		}
	}
}
