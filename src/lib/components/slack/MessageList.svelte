<script>
	/**
	 * @typedef {{ id: string, role: 'user'|'assistant', authorName: string, avatar: string, timestamp: string, text: string, isStreaming?: boolean }} ChatMessage
	 * @typedef {Object} Props
	 * @property {ChatMessage[]} messages
	 * @property {boolean} [dark]
	 * @property {boolean} [showAppInfo]
	 * @property {{ name: string, avatar?: string, description?: string }} [appInfo]
	 * @property {(message: ChatMessage) => void} [onThreadOpen]
	 * @property {(message: ChatMessage, action: { label: string }) => void} [onCardAction]
	 */

	import { renderMarkdown } from '$lib/utils/markdown.js';
	import { base } from '$app/paths';

	/** @type {Props} */
	let { messages, dark = false, showAppInfo = false, appInfo, onThreadOpen, onCardAction } = $props();

	const MENTION_NAMES = ['Lauren', 'Stack Internal'];

	/** @param {string} text */
	function renderWithMentions(text) {
		const html = renderMarkdown(text);
		const sorted = [...MENTION_NAMES].sort((a, b) => b.length - a.length);
		const pattern = sorted.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
		const regex = new RegExp(`@(${pattern})`, 'g');
		return html.replace(regex, '<span class="mention">@$1</span>');
	}

	/** @type {HTMLDivElement | null} */
	let listEl = $state(null);

	$effect(() => {
		// Scroll to bottom when messages change
		if (messages.length && listEl) {
			listEl.scrollTop = listEl.scrollHeight;
		}
	});
</script>

<div class="message-list" class:message-list--dark={dark} role="log" aria-label="Messages" bind:this={listEl}>
	<div class="message-list__inner">

		{#if showAppInfo && appInfo}
			<div class="app-info">
				{#if appInfo.avatar}
					<img src={appInfo.avatar} alt={appInfo.name} class="app-info__avatar" />
				{/if}
				<div class="app-info__meta">
					<span class="app-info__name">{appInfo.name}</span>
					<span class="app-badge">APP</span>
				</div>
				{#if appInfo.description}
					<p class="app-info__description">{appInfo.description}</p>
				{/if}
				<a href="#how-to-use" class="app-info__link">
					<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
						<path d="M10 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17M0 10a10 10 0 1 1 20 0 10 10 0 0 1-20 0m9.25-4.25a.75.75 0 0 1 .75-.75 3.25 3.25 0 0 1 .59 6.45v.3a.75.75 0 0 1-1.5 0v-.9a.75.75 0 0 1 .75-.75 1.75 1.75 0 1 0-1.75-1.75.75.75 0 0 1-1.5 0A3.25 3.25 0 0 1 10 5.75M10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
					</svg>
					How to use {appInfo.name}?
				</a>
			</div>
		{/if}

		{#each messages as message (message.id)}
			<article class="message" aria-label="Message from {message.authorName}">
				<div class="message__avatar-col">
					<img src={message.avatar} alt="" class="message__avatar" aria-hidden="true" />
				</div>
				<div class="message__content">
					<div class="message__meta">
						<span class="message__author">{message.authorName}</span>
						{#if message.role === 'assistant'}
							<span class="app-badge">APP</span>
						{/if}
						<time class="message__time" datetime="">{message.timestamp}</time>
					</div>
					<div class="message__body">
						{#if message.isStreaming && !message.text}
							<span class="typing-indicator">
								<span></span><span></span><span></span>
							</span>
						{:else}
							<div class="message__text">{@html renderWithMentions(message.text)}</div>
						{/if}

						{#if message.card}
							<div class="attachment">
								<div class="attachment__content">
									<div class="attachment__title">{message.card.title}</div>
									<p class="attachment__body">{message.card.body}</p>
									{#if message.card.sourceLabel}
										<div class="attachment__source">
											<span class="attachment__source-label">Source:</span>
											<a href={message.card.sourceHref ?? '#'} class="attachment__source-link">
												{message.card.sourceLabel}
											</a>
										</div>
									{/if}
									{#if message.card.actions?.length}
										<div class="attachment__actions">
											{#each message.card.actions as action}
												<button
													class="attachment__btn"
													class:attachment__btn--primary={action.variant === 'primary'}
													type="button"
													onclick={() => onCardAction?.(message, action)}
												>
													{action.label}
												</button>
											{/each}
										</div>
									{/if}
								</div>
							</div>
						{/if}
					</div>

					<div class="message__toolbar" role="toolbar" aria-label="Message actions">
						<button class="toolbar-action toolbar-action--app" aria-label="Ask Stack Internal" title="Ask Stack Internal">
							<img src="{base}/avatars/app-icon-stack.svg" alt="Stack Internal" class="toolbar-action__app-icon" />
						</button>
						<button class="toolbar-action" aria-label="Eyes" title="Eyes">👀</button>
						<button class="toolbar-action" aria-label="Raising hands" title="Raising hands">🙌</button>
						<button class="toolbar-action toolbar-action--icon" aria-label="Reply in thread" title="Reply in thread" onclick={() => onThreadOpen?.(message)}>
							<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
								<path d="M2 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7.414L4 18.414A.75.75 0 0 1 2.75 17.75V15A2 2 0 0 1 2 13V4zm2-.5a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h.75a.75.75 0 0 1 .75.75v1.69l2.72-2.72a.75.75 0 0 1 .53-.22H16a.5.5 0 0 0 .5-.5V4a.5.5 0 0 0-.5-.5H4z"/>
							</svg>
						</button>
						<button class="toolbar-action toolbar-action--icon" aria-label="Forward message" title="Forward message">
							<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
								<path d="M11.47 3.22a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06l3.97-3.97H6.75a3.75 3.75 0 0 0-3.75 3.75v.75a.75.75 0 0 1-1.5 0v-.75A5.25 5.25 0 0 1 6.75 8h8.69l-3.97-3.97a.75.75 0 0 1 0-1.06z"/>
							</svg>
						</button>
						<button class="toolbar-action toolbar-action--icon" aria-label="Save for later" title="Save for later">
							<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
								<path d="M4.25 4.25A2.75 2.75 0 0 1 7 1.5h6a2.75 2.75 0 0 1 2.75 2.75v12.793c0 1.114-1.346 1.671-2.134.884L10 14.31l-3.616 3.616c-.788.787-2.134.23-2.134-.884zM7 3c-.69 0-1.25.56-1.25 1.25v12.19l3.649-3.65a.85.85 0 0 1 1.202 0l3.649 3.65V4.25C14.25 3.56 13.69 3 13 3z"/>
							</svg>
						</button>
						<button class="toolbar-action toolbar-action--icon" aria-label="More actions" title="More actions">
							<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
								<path d="M10 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m0 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m0 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" fill-rule="evenodd"/>
							</svg>
						</button>
					</div>
				</div>
			</article>
		{/each}
	</div>
</div>

<style>
	.message-list {
		flex: 1;
		overflow-y: auto;
		background-color: white;
	}

	.message-list--dark {
		background-color: #1A1D21;
	}

	.message-list::-webkit-scrollbar { width: 8px; }
	.message-list::-webkit-scrollbar-track { background: transparent; }
	.message-list::-webkit-scrollbar-thumb {
		background: #E8E8E8;
		border-radius: 4px;
	}

	.message-list--dark::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.15);
	}

	.message-list__inner {
		padding: 16px 20px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-height: 100%;
		justify-content: flex-end;
	}

	/* ── App info card ── */
	.app-info {
		padding: 48px 0 0;
	}

	.app-info__avatar {
		width: 56px;
		height: 56px;
		border-radius: 12px;
		display: block;
		margin-bottom: 12px;
	}

	.app-info__meta {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 6px;
	}

	.app-info__name {
		font-size: 18px;
		font-weight: 700;
		color: #1D1C1D;
	}

	.app-info__description {
		font-size: 14px;
		color: #616061;
		margin: 0 0 10px;
		line-height: 1.5;
	}

	.app-info__link {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 13px;
		color: #0068A9;
		text-decoration: none;
	}

	.app-info__link:hover {
		text-decoration: underline;
	}

	/* ── App badge ── */
	.app-badge {
		display: inline-flex;
		align-items: center;
		padding: 1px 4px;
		border-radius: 3px;
		font-size: 10px;
		font-weight: 700;
		background-color: #E8E8E8;
		color: #616061;
		letter-spacing: 0.02em;
		line-height: 1.5;
	}

	/* ── Messages ── */
	.message {
		display: flex;
		gap: 10px;
		padding: 6px 0;
		border-radius: 6px;
		position: relative;
	}

	.message:hover {
		background-color: #F8F8F8;
		margin: 0 -8px;
		padding: 6px 8px;
	}

	.message__avatar-col {
		flex-shrink: 0;
		padding-top: 1px;
	}

	.message__avatar {
		width: 36px;
		height: 36px;
		border-radius: 6px;
		display: block;
	}

	.message__content {
		flex: 1;
		min-width: 0;
	}

	.message__meta {
		display: flex;
		align-items: baseline;
		gap: 6px;
		margin-bottom: 2px;
	}

	.message__author {
		font-size: 15px;
		font-weight: 700;
		color: #1D1C1D;
		line-height: 1.4;
	}

	.message__time {
		font-size: 12px;
		color: #616061;
		line-height: 1.4;
	}

	.message__body {
		font-size: 15px;
		color: #1D1C1D;
		line-height: 1.5;
	}

	.message__text {
		margin: 0;
		word-break: break-word;
	}

	.message__text :global(p) {
		margin: 0 0 4px;
		line-height: 1.5;
	}

	.message__text :global(p:last-child) { margin-bottom: 0; }

	.message__text :global(.mention) {
		background-color: rgba(29, 155, 209, 0.1);
		color: #1264A3;
		padding: 0 2px;
		border-radius: 3px;
		font-weight: 500;
		cursor: pointer;
	}

	.message__text :global(.mention:hover) {
		background-color: rgba(29, 155, 209, 0.18);
		text-decoration: underline;
	}

	.message__text :global(strong) { font-weight: 700; }
	.message__text :global(em) { font-style: italic; }
	.message__text :global(s) { text-decoration: line-through; }

	.message__text :global(code) {
		font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
		font-size: 12px;
		background: #F0F0F0;
		border: 1px solid #E0E0E0;
		border-radius: 3px;
		padding: 1px 4px;
	}

	.message__text :global(pre) {
		background: #F8F8F8;
		border: 1px solid #E8E8E8;
		border-radius: 4px;
		padding: 10px 12px;
		margin: 6px 0;
		overflow-x: auto;
	}

	.message__text :global(pre code) {
		background: none;
		border: none;
		padding: 0;
		font-size: 12.5px;
		line-height: 1.6;
	}

	.message__text :global(ul),
	.message__text :global(ol) {
		margin: 4px 0;
		padding-left: 20px;
	}

	.message__text :global(li) {
		margin-bottom: 2px;
		line-height: 1.5;
	}

	.message__text :global(blockquote) {
		border-left: 3px solid #E0E0E0;
		margin: 4px 0;
		padding: 2px 10px;
		color: #616061;
	}

	/* ── Attachment card (Slack-style) ── */
	.attachment {
		display: flex;
		margin-top: 6px;
		max-width: 560px;
		border-radius: 4px;
		overflow: hidden;
	}

	.attachment__content {
		flex: 1;
		padding: 10px 14px 12px;
		background-color: #FFFFFF;
		border: 1px solid #E8E8E8;
		border-radius: 4px;
	}

	.attachment__title {
		font-size: 15px;
		font-weight: 700;
		color: #1D1C1D;
		line-height: 1.4;
		margin-bottom: 4px;
	}

	.attachment__body {
		font-size: 15px;
		color: #1D1C1D;
		line-height: 1.5;
		margin: 0 0 8px;
	}

	.attachment__source {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 15px;
		color: #1D1C1D;
		line-height: 1.5;
		margin-bottom: 12px;
	}

	.attachment__source-link {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		color: #0068A9;
		text-decoration: none;
	}

	.attachment__source-link:hover {
		text-decoration: underline;
	}

	.attachment__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 4px;
	}

	.attachment__btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 6px 12px;
		border-radius: 4px;
		border: 1px solid #BDBDBD;
		background-color: white;
		color: #1D1C1D;
		font-size: 13px;
		font-weight: 700;
		line-height: 1.25;
		cursor: pointer;
		transition: background-color 0.1s ease, border-color 0.1s ease;
	}

	.attachment__btn:hover {
		background-color: #F5F5F5;
	}

	.attachment__btn--primary {
		background-color: #007A5A;
		border-color: #007A5A;
		color: white;
	}

	.attachment__btn--primary:hover {
		background-color: #148567;
		border-color: #148567;
	}

	/* ── Hover toolbar ── */
	.message__toolbar {
		position: absolute;
		top: -16px;
		right: 8px;
		display: flex;
		align-items: center;
		gap: 1px;
		background: white;
		border: 1px solid #E8E8E8;
		border-radius: 8px;
		padding: 3px 4px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.1s ease;
		white-space: nowrap;
	}

	.message:hover .message__toolbar {
		opacity: 1;
		pointer-events: auto;
	}

	.toolbar-action {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 5px;
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: 15px;
		color: #616061;
		transition: background-color 0.1s ease;
		position: relative;
	}

	.toolbar-action:hover {
		background-color: #F0F0F0;
	}

	.toolbar-action--app {
		padding: 2px;
	}

	.toolbar-action__app-icon {
		width: 20px;
		height: 20px;
		border-radius: 4px;
		display: block;
	}

	.toolbar-action--icon {
		color: #616061;
	}

	.toolbar-action--icon:hover {
		color: #1D1C1D;
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
