<script>
	import { renderMarkdown } from '$lib/utils/markdown.js';
	import { highlightMentions } from '$lib/utils/mentions.js';
	import MessageComposer from '$lib/components/slack/MessageComposer.svelte';

	/**
	 * @typedef {{ id: string, role?: string, authorName: string, avatar: string, timestamp: string, text: string, isStreaming?: boolean }} ThreadMessage
	 * @typedef {Object} Props
	 * @property {ThreadMessage} message
	 * @property {ThreadMessage[]} [replies]
	 * @property {string[]} [mentionNames]
	 * @property {(text: string) => void} [onReply]
	 * @property {() => void} onClose
	 */

	/** @type {Props} */
	let { message, replies = [], mentionNames = [], onReply, onClose } = $props();

	/** @type {HTMLDivElement | null} */
	let bodyEl = $state(null);

	$effect(() => {
		// Scroll to bottom when new replies arrive
		replies.length;
		if (bodyEl) bodyEl.scrollTop = bodyEl.scrollHeight;
	});

	$effect(() => {
		// Scroll to top when a different thread is opened (runs after, wins over the above)
		message.id;
		if (bodyEl) bodyEl.scrollTop = 0;
	});
</script>

<aside class="thread-panel">
	<header class="thread-header">
		<h2 class="thread-title">Thread</h2>
		<div class="thread-header-actions">
			<button class="thread-icon-btn" aria-label="Filter">
				<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
					<path d="M3 5.75A.75.75 0 0 1 3.75 5h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 5.75zm2 4A.75.75 0 0 1 5.75 9h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 5 9.75zm2 4a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75z"/>
				</svg>
			</button>
			<button class="thread-icon-btn" aria-label="More options">
				<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
					<path d="M10 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m0 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m0 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" fill-rule="evenodd"/>
				</svg>
			</button>
			<button class="thread-icon-btn" aria-label="Close thread" onclick={onClose}>
				<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
					<path d="M4.22 4.22a.75.75 0 0 1 1.06 0L10 8.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L11.06 10l4.72 4.72a.75.75 0 1 1-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 0 1 0-1.06z"/>
				</svg>
			</button>
		</div>
	</header>

	<div class="thread-body" bind:this={bodyEl}>
		<article class="thread-original">
			<img src={message.avatar} alt="" class="thread-avatar" aria-hidden="true" />
			<div class="thread-message-content">
				<div class="thread-message-meta">
					<span class="thread-message-author">{message.authorName}</span>
					<time class="thread-message-time">{message.timestamp}</time>
				</div>
				<div class="thread-message-text">{@html highlightMentions(message.text, mentionNames)}</div>
			</div>
		</article>

		{#if replies.length}
			<div class="thread-replies">
				{#each replies as reply (reply.id)}
					<article class="thread-reply">
						<img src={reply.avatar} alt="" class="thread-avatar" aria-hidden="true" />
						<div class="thread-message-content">
							<div class="thread-message-meta">
								<span class="thread-message-author">{reply.authorName}</span>
								<time class="thread-message-time">{reply.timestamp}</time>
							</div>
							<div class="thread-message-text">
								{#if reply.isStreaming && !reply.text}
									<span class="typing-indicator">
										<span></span><span></span><span></span>
									</span>
								{:else}
									{@html renderMarkdown(reply.text)}
								{/if}
							</div>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</div>

	<MessageComposer placeholder="Reply..." onSend={onReply} />
</aside>

<style>
	.thread-panel {
		width: 360px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		border-left: 1px solid #E8E8E8;
		background: white;
		overflow: hidden;
	}

	/* ── Header ── */
	.thread-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		border-bottom: 1px solid #E8E8E8;
		flex-shrink: 0;
	}

	.thread-title {
		font-size: 18px;
		font-weight: 700;
		color: #1D1C1D;
		margin: 0;
	}

	.thread-header-actions {
		display: flex;
		align-items: center;
		gap: 2px;
	}

	.thread-icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: none;
		border: none;
		cursor: pointer;
		color: #616061;
		border-radius: 6px;
		transition: background-color 0.1s ease, color 0.1s ease;
	}

	.thread-icon-btn:hover {
		background-color: #F0F0F0;
		color: #1D1C1D;
	}

	/* ── Body ── */
	.thread-body {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
	}

	.thread-original {
		display: flex;
		gap: 10px;
		padding-bottom: 16px;
	}

	.thread-avatar {
		width: 36px;
		height: 36px;
		border-radius: 6px;
		flex-shrink: 0;
	}

	.thread-message-content {
		flex: 1;
		min-width: 0;
	}

	.thread-message-meta {
		display: flex;
		align-items: baseline;
		gap: 6px;
		margin-bottom: 3px;
	}

	.thread-message-author {
		font-size: 15px;
		font-weight: 700;
		color: #1D1C1D;
	}

	.thread-message-time {
		font-size: 12px;
		color: #616061;
	}

	.thread-message-text {
		font-size: 14px;
		color: #1D1C1D;
		line-height: 1.5;
		word-break: break-word;
	}

	.thread-message-text :global(.mention) {
		color: #0068A9;
		font-weight: 600;
		background: #E1F8FE;
		border-radius: 3px;
		padding: 0 2px;
	}

	.thread-message-text :global(p) { margin: 0 0 4px; }
	.thread-message-text :global(p:last-child) { margin-bottom: 0; }
	.thread-message-text :global(strong) { font-weight: 700; }
	.thread-message-text :global(em) { font-style: italic; }
	.thread-message-text :global(code) {
		font-family: 'Menlo', monospace;
		font-size: 12px;
		background: #F0F0F0;
		border: 1px solid #E0E0E0;
		border-radius: 3px;
		padding: 1px 4px;
	}

	/* ── Replies ── */
	.thread-replies {
		border-top: 1px solid #E8E8E8;
		padding-top: 12px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.thread-reply {
		display: flex;
		gap: 10px;
	}

	/* ── Typing indicator ── */
	.typing-indicator {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		padding: 4px 0;
	}

	.typing-indicator span {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: #868686;
		animation: bounce 1.2s infinite;
	}

	.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
	.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

	@keyframes bounce {
		0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
		30% { transform: translateY(-4px); opacity: 1; }
	}
</style>
