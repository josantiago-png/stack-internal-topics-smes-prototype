<script>
	/**
	 * @typedef {{ id: string, authorName: string, avatar: string, timestamp: string, text: string, reactions?: { emoji: string, count: number }[], threadReplies?: any[] }} ChannelMessage
	 * @typedef {Object} Props
	 * @property {string} channelName
	 * @property {ChannelMessage[]} messages
	 * @property {string[]} [mentionNames]
	 * @property {(message: ChannelMessage) => void} [onThreadOpen]
	 */

	import { highlightMentions } from '$lib/utils/mentions.js';
	import { base } from '$app/paths';

	/** @type {Props} */
	let { channelName, messages, mentionNames = [], onThreadOpen } = $props();

	/** @type {HTMLDivElement | null} */
	let el = $state(null);

	$effect(() => {
		// Scroll to bottom whenever the channel changes or a new message is added
		channelName;
		messages.length;
		if (el) el.scrollTop = el.scrollHeight;
	});
</script>

<div class="channel-view" role="log" aria-label="Messages" bind:this={el}>
	<div class="channel-view__inner">

		<!-- Channel intro header -->
		<div class="channel-intro">
			<div class="channel-intro__hash">#</div>
			<h2 class="channel-intro__name">{channelName}</h2>
			<p class="channel-intro__desc">This is the beginning of the <strong>#{channelName}</strong> channel. Use this space to collaborate, share updates, and discuss anything related to {channelName}.</p>
		</div>

		<!-- Date divider -->
		<div class="date-divider" role="separator">
			<span class="date-divider__label">Today</span>
		</div>

		<!-- Messages -->
		{#each messages as message (message.id)}
			<article class="message" aria-label="Message from {message.authorName}">
				<div class="message__avatar-col">
					<img src={message.avatar} alt="" class="message__avatar" aria-hidden="true" />
				</div>
				<div class="message__content">
					<div class="message__meta">
						<span class="message__author">{message.authorName}</span>
						<time class="message__time">{message.timestamp}</time>
					</div>
					<p class="message__text">{@html highlightMentions(message.text, mentionNames)}</p>
					{#if message.reactions?.length}
						<div class="message__reactions">
							{#each message.reactions as r}
								<button class="reaction-pill" aria-label="reaction {r.count}">
									{#if r.emoji.startsWith('/')}
										<img src={r.emoji} alt="" class="reaction-pill__app-icon" />
									{:else}
										{r.emoji}
									{/if}
									<span class="reaction-pill__count">{r.count}</span>
								</button>
							{/each}
						</div>
					{/if}

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
				{#if message.threadReplies?.length}
					<button class="thread-footer" onclick={() => onThreadOpen?.(message)}>
						<img src={message.threadReplies[message.threadReplies.length - 1].avatar} alt="" class="thread-footer__avatar" />
						<span class="thread-footer__count">{message.threadReplies.length} {message.threadReplies.length === 1 ? 'reply' : 'replies'}</span>
						<span class="thread-footer__time">Today at {message.threadReplies[message.threadReplies.length - 1].timestamp}</span>
					</button>
				{/if}
			</div>
		</article>
		{/each}

	</div>
</div>

<style>
	.channel-view {
		flex: 1;
		overflow-y: auto;
		background: white;
	}

	.channel-view::-webkit-scrollbar { width: 8px; }
	.channel-view::-webkit-scrollbar-track { background: transparent; }
	.channel-view::-webkit-scrollbar-thumb { background: #E8E8E8; border-radius: 4px; }

	.channel-view__inner {
		padding: 0 20px 24px;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	/* Intro */
	.channel-intro {
		padding: 32px 0 16px;
	}

	.channel-intro__hash {
		font-size: 48px;
		font-weight: 900;
		color: #1D1C1D;
		line-height: 1;
		margin-bottom: 8px;
	}

	.channel-intro__name {
		font-size: 22px;
		font-weight: 700;
		color: #1D1C1D;
		margin: 0 0 6px;
	}

	.channel-intro__desc {
		font-size: 14px;
		color: #616061;
		margin: 0;
		line-height: 1.5;
	}

	/* Date divider */
	.date-divider {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 0 8px;
	}

	.date-divider::before,
	.date-divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: #E8E8E8;
	}

	.date-divider__label {
		font-size: 12px;
		font-weight: 700;
		color: #616061;
		white-space: nowrap;
		padding: 2px 8px;
		border: 1px solid #E8E8E8;
		border-radius: 12px;
	}

	/* Messages */
	.message {
		display: flex;
		gap: 10px;
		padding: 4px 0;
		border-radius: 6px;
		position: relative;
	}

	.message:hover {
		background-color: #F8F8F8;
		margin: 0 -8px;
		padding: 4px 8px;
	}

	.message__avatar-col {
		flex-shrink: 0;
		padding-top: 2px;
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
		padding-top: 1px;
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
	}

	.message__time {
		font-size: 12px;
		color: #616061;
	}

	.message__text {
		font-size: 14px;
		color: #1D1C1D;
		margin: 0;
		line-height: 1.5;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.message__text :global(.mention) {
		color: #0068A9;
		font-weight: 600;
		background: #E1F8FE;
		border-radius: 3px;
		padding: 0 2px;
	}

	/* Reactions */
	.message__reactions {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-top: 6px;
	}

	.reaction-pill {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 2px 8px;
		border: 1px solid #E8E8E8;
		border-radius: 12px;
		background: #F8F8F8;
		cursor: pointer;
		font-size: 13px;
		transition: background-color 0.1s ease, border-color 0.1s ease;
	}

	.reaction-pill:hover {
		background: #E8E8E8;
		border-color: #C0C0C0;
	}

	.reaction-pill__count {
		font-size: 12px;
		font-weight: 600;
		color: #616061;
	}

	.reaction-pill__app-icon {
		width: 14px;
		height: 14px;
		border-radius: 3px;
		display: block;
		flex-shrink: 0;
	}

	/* Thread footer */
	.thread-footer {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 4px;
		padding: 4px 6px;
		background: none;
		border: 1px solid transparent;
		border-radius: 6px;
		cursor: pointer;
		text-align: left;
	}

	.thread-footer:hover {
		background: #F8F8F8;
		border-color: #E8E8E8;
	}

	.thread-footer__avatar {
		width: 20px;
		height: 20px;
		border-radius: 4px;
		display: block;
		flex-shrink: 0;
	}

	.thread-footer__count {
		font-size: 13px;
		font-weight: 700;
		color: #0068A9;
	}

	.thread-footer__time {
		font-size: 12px;
		color: #616061;
	}

	.thread-footer:hover .thread-footer__count {
		text-decoration: underline;
	}

	/* Hover toolbar */
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
</style>
