<script>
	/**
	 * @typedef {{ id: string, name: string, avatar: string, type?: string }} MentionTarget
	 * @type {{ placeholder?: string, dark?: boolean, onSend?: (text: string) => void, isLoading?: boolean, mentions?: MentionTarget[] }}
	 */
	let { placeholder = 'Message', dark = false, onSend, isLoading = false, mentions = [] } = $props();

	let messageText = $state('');
	let editorEl = $state(/** @type {HTMLDivElement | null} */(null));
	/** @type {string | null} */
	let mentionQuery = $state(null);
	let selectedIndex = $state(0);

	const mentionFilter = $derived(
		mentionQuery === null
			? []
			: mentions.filter((m) => m.name.toLowerCase().startsWith(mentionQuery.toLowerCase()))
	);

	$effect(() => {
		// Reset selection index when filtered list changes
		if (mentionFilter) selectedIndex = 0;
	});

	function detectMentionQuery() {
		if (!mentions.length) return;
		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0) { mentionQuery = null; return; }
		const range = sel.getRangeAt(0);
		if (!range.collapsed || range.startContainer.nodeType !== Node.TEXT_NODE) {
			mentionQuery = null; return;
		}
		const textBefore = (range.startContainer.textContent ?? '').slice(0, range.startOffset);
		const match = textBefore.match(/@(\w*)$/);
		mentionQuery = match ? match[1] : null;
	}

	/** @param {MentionTarget} mention */
	function selectMention(mention) {
		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0 || !editorEl) return;

		const range = sel.getRangeAt(0);
		if (range.startContainer.nodeType === Node.TEXT_NODE) {
			const textBefore = (range.startContainer.textContent ?? '').slice(0, range.startOffset);
			const atIndex = textBefore.search(/@\w*$/);
			if (atIndex >= 0) {
				const del = range.cloneRange();
				del.setStart(range.startContainer, atIndex);
				del.setEnd(range.startContainer, range.startOffset);
				del.deleteContents();
			}
		}

		const span = document.createElement('span');
		span.className = 'mention';
		span.contentEditable = 'false';
		span.textContent = `@${mention.name}`;
		const space = document.createTextNode('\u00A0');

		const frag = document.createDocumentFragment();
		frag.appendChild(span);
		frag.appendChild(space);

		const insertRange = sel.getRangeAt(0);
		insertRange.insertNode(frag);

		const newRange = document.createRange();
		newRange.setStartAfter(space);
		newRange.collapse(true);
		sel.removeAllRanges();
		sel.addRange(newRange);

		mentionQuery = null;
		messageText = editorEl.textContent ?? '';
	}

	function handleKeydown(/** @type {KeyboardEvent} */ e) {
		if (mentionFilter.length > 0) {
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				selectedIndex = (selectedIndex + 1) % mentionFilter.length;
				return;
			}
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				selectedIndex = (selectedIndex - 1 + mentionFilter.length) % mentionFilter.length;
				return;
			}
			if (e.key === 'Enter') {
				e.preventDefault();
				selectMention(mentionFilter[selectedIndex]);
				return;
			}
			if (e.key === 'Escape') {
				e.preventDefault();
				mentionQuery = null;
				return;
			}
		}
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}

	function sendMessage() {
		if (!messageText.trim() || isLoading) return;
		const text = (editorEl?.textContent ?? '').replace(/\u00A0/g, ' ').trim();
		if (!text) return;
		messageText = '';
		if (editorEl) editorEl.innerHTML = '';
		onSend?.(text);
	}

	function handleInput() {
		messageText = editorEl?.textContent ?? '';
		detectMentionQuery();
	}

	const formatButtons = [
		{
			label: 'Bold',
			shortcut: '⌘B',
			svg: `<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M4 2.75A.75.75 0 0 1 4.75 2h6.343a3.91 3.91 0 0 1 3.88 3.449A2 2 0 0 1 15 5.84l.001.067a3.9 3.9 0 0 1-1.551 3.118A4.627 4.627 0 0 1 11.875 18H4.75a.75.75 0 0 1-.75-.75V9.5a.8.8 0 0 1 .032-.218A.8.8 0 0 1 4 9.065zm2.5 5.565h3.593a2.157 2.157 0 1 0 0-4.315H6.5zm4.25 1.935H6.5v5.5h4.25a2.75 2.75 0 1 0 0-5.5"/></svg>`
		},
		{
			label: 'Italic',
			shortcut: '⌘I',
			svg: `<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M7 2.75A.75.75 0 0 1 7.75 2h7.5a.75.75 0 0 1 0 1.5H12.3l-2.6 13h2.55a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5H7.7l2.6-13H7.75A.75.75 0 0 1 7 2.75"/></svg>`
		},
		{
			label: 'Strikethrough',
			shortcut: '⌘⇧X',
			svg: `<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M11.721 3.84c-.91-.334-2.028-.36-3.035-.114-1.51.407-2.379 1.861-2.164 3.15C6.718 8.051 7.939 9.5 11.5 9.5l.027.001h5.723a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5h3.66c-.76-.649-1.216-1.468-1.368-2.377-.347-2.084 1.033-4.253 3.265-4.848l.007-.002.007-.002c1.252-.307 2.68-.292 3.915.16 1.252.457 2.337 1.381 2.738 2.874a.75.75 0 0 1-1.448.39c-.25-.925-.91-1.528-1.805-1.856m2.968 9.114a.75.75 0 1 0-1.378.59c.273.64.186 1.205-.13 1.674-.333.492-.958.925-1.82 1.137-.989.243-1.991.165-3.029-.124-.93-.26-1.613-.935-1.858-1.845a.75.75 0 0 0-1.448.39c.388 1.441 1.483 2.503 2.903 2.9 1.213.338 2.486.456 3.79.135 1.14-.28 2.12-.889 2.704-1.753.6-.888.743-1.992.266-3.104"/></svg>`
		},
		{
			label: 'Link',
			shortcut: '⌘K',
			svg: `<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M12.306 3.756a2.75 2.75 0 0 1 3.889 0l.05.05a2.75 2.75 0 0 1 0 3.889l-3.18 3.18a2.75 2.75 0 0 1-3.98-.095l-.03-.034a.75.75 0 0 0-1.11 1.009l.03.034a4.25 4.25 0 0 0 6.15.146l3.18-3.18a4.25 4.25 0 0 0 0-6.01l-.05-.05a4.25 4.25 0 0 0-6.01 0L9.47 4.47a.75.75 0 1 0 1.06 1.06zm-4.611 12.49a2.75 2.75 0 0 1-3.89 0l-.05-.051a2.75 2.75 0 0 1 0-3.89l3.18-3.179a2.75 2.75 0 0 1 3.98.095l.03.034a.75.75 0 1 0 1.11-1.01l-.03-.033a4.25 4.25 0 0 0-6.15-.146l-3.18 3.18a4.25 4.25 0 0 0 0 6.01l.05.05a4.25 4.25 0 0 0 6.01 0l1.775-1.775a.75.75 0 0 0-1.06-1.06z"/></svg>`
		},
		{
			label: 'Ordered list',
			svg: `<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M3.792 2.094A.5.5 0 0 1 4 2.5V6h1a.5.5 0 1 1 0 1H2a.5.5 0 1 1 0-1h1V3.194l-.842.28a.5.5 0 0 1-.316-.948l1.5-.5a.5.5 0 0 1 .45.068M7.75 3.5a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5zM7 10.75a.75.75 0 0 1 .75-.75h10a.75.75 0 0 1 0 1.5h-10a.75.75 0 0 1-.75-.75m0 6.5a.75.75 0 0 1 .75-.75h10a.75.75 0 0 1 0 1.5h-10a.75.75 0 0 1-.75-.75m-4.293-3.36a1 1 0 0 1 .793-.39c.49 0 .75.38.75.75 0 .064-.033.194-.173.409a5 5 0 0 1-.594.711c-.256.267-.552.548-.87.848l-.088.084a42 42 0 0 0-.879.845A.5.5 0 0 0 2 18h3a.5.5 0 0 0 0-1H3.242l.058-.055c.316-.298.629-.595.904-.882a6 6 0 0 0 .711-.859c.18-.277.335-.604.335-.954 0-.787-.582-1.75-1.75-1.75a2 2 0 0 0-1.81 1.147.5.5 0 1 0 .905.427 1 1 0 0 1 .112-.184"/></svg>`
		},
		{
			label: 'Bulleted list',
			svg: `<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a.75.75 0 0 1 .75-.75h10a.75.75 0 0 1 0 1.5h-10A.75.75 0 0 1 7 3m.75 6.25a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5zm0 7a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5zM3 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/></svg>`
		},
		{
			label: 'Code',
			shortcut: '⌘⇧C',
			svg: `<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M12.058 3.212c.396.12.62.54.5.936L8.87 16.29a.75.75 0 1 1-1.435-.436l3.686-12.143a.75.75 0 0 1 .936-.5M5.472 6.24a.75.75 0 0 1 .005 1.06l-2.67 2.693 2.67 2.691a.75.75 0 1 1-1.065 1.057l-3.194-3.22a.75.75 0 0 1 0-1.056l3.194-3.22a.75.75 0 0 1 1.06-.005m9.044 1.06a.75.75 0 1 1 1.065-1.056l3.194 3.221a.75.75 0 0 1 0 1.057l-3.194 3.219a.75.75 0 0 1-1.065-1.057l2.67-2.69z"/></svg>`
		}
	];
</script>

<div class="composer" class:composer--dark={dark}>
	{#if mentionFilter.length > 0}
		<div class="mention-popover" role="listbox">
			{#each mentionFilter as mention, i}
				<button
					class="mention-option"
					class:mention-option--active={i === selectedIndex}
					role="option"
					aria-selected={i === selectedIndex}
					onmousedown={(e) => { e.preventDefault(); selectMention(mention); }}
				>
					<img src={mention.avatar} alt="" class="mention-option__avatar" />
					<span class="mention-option__name">{mention.name}</span>
					{#if mention.type === 'app'}
						<span class="mention-option__badge">APP</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
	<div class="composer__box">
		<div class="composer__toolbar">
			{#each formatButtons as btn}
				<button
					class="toolbar-btn"
					title="{btn.label}{btn.shortcut ? ' (' + btn.shortcut + ')' : ''}"
					aria-label={btn.label}
					type="button"
				>
					{@html btn.svg}
				</button>
			{/each}
		</div>

		<div
			class="composer__input"
			contenteditable="true"
			role="textbox"
			aria-multiline="true"
			aria-label={placeholder}
			tabindex="0"
			bind:this={editorEl}
			oninput={handleInput}
			onkeydown={handleKeydown}
			data-placeholder={placeholder}
		></div>

		<div class="composer__actions">
			<div class="composer__media-btns">
				<button class="action-btn" aria-label="Attach files" title="Attach files">
					<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
						<path d="M15.25 2a2.75 2.75 0 0 1 2.75 2.75v10.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25V4.75A2.75 2.75 0 0 1 4.75 2zm0 1.5H4.75c-.69 0-1.25.56-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25V4.75c0-.69-.56-1.25-1.25-1.25zM10 5.75a.75.75 0 0 1 .75.75v2.75h2.75a.75.75 0 0 1 0 1.5h-2.75v2.75a.75.75 0 0 1-1.5 0v-2.75H6.5a.75.75 0 0 1 0-1.5h2.75V6.5a.75.75 0 0 1 .75-.75"/>
					</svg>
				</button>
				<button class="action-btn" aria-label="Emoji" title="Emoji">
					<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
						<path d="M2.5 10a7.5 7.5 0 1 1 15 0 7.5 7.5 0 0 1-15 0M10 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18M7.5 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M14 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m-6.385 3.766a.75.75 0 1 0-1.425.468C6.796 14.08 8.428 15 10.027 15s3.23-.92 3.838-2.766a.75.75 0 1 0-1.425-.468c-.38 1.155-1.38 1.734-2.413 1.734s-2.032-.58-2.412-1.734"/>
					</svg>
				</button>
				<button class="action-btn" aria-label="Mention someone" title="Mention someone">
					<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
						<path d="M10 2a8 8 0 1 0 4.42 14.779.75.75 0 1 0-.83-1.249A6.5 6.5 0 1 1 16.5 10v1a1 1 0 0 1-2 0V7.5a.75.75 0 0 0-1.5 0v.2A3.5 3.5 0 1 0 13.5 11v1a2.5 2.5 0 0 0 5 0v-1A8 8 0 0 0 10 2m1.5 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0"/>
					</svg>
				</button>
			</div>
			<div class="composer__send-area">
				<button
					class="send-btn"
					class:send-btn--active={messageText.trim().length > 0 && !isLoading}
					aria-label="Send message"
					title="Send message (Enter)"
					onclick={sendMessage}
					disabled={!messageText.trim() || isLoading}
				>
					<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
						<path d="M1.856 1.612a.75.75 0 0 1 .73-.033l15.5 7.75a.75.75 0 0 1 0 1.342l-15.5 7.75A.75.75 0 0 1 1.5 17.75v-6.046c0-.68.302-1.29.78-1.704a2.25 2.25 0 0 1-.78-1.704V2.25a.75.75 0 0 1 .356-.638M3 3.464v4.832a.75.75 0 0 0 .727.75l6.546.204a.75.75 0 0 1 0 1.5l-6.546.204a.75.75 0 0 0-.727.75v4.833L16.073 10z"/>
					</svg>
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.composer {
		position: relative;
		padding: 4px 20px 20px;
		background-color: white;
		flex-shrink: 0;
	}

	/* ── Mention popover ── */
	.mention-popover {
		position: absolute;
		bottom: calc(100% - 4px);
		left: 20px;
		right: 20px;
		background: white;
		border: 1px solid #E0E0E0;
		border-radius: 8px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.14);
		overflow: hidden;
		z-index: 100;
	}

	.mention-option {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 8px 12px;
		border: none;
		background: transparent;
		cursor: pointer;
		text-align: left;
		transition: background-color 0.08s ease;
	}

	.mention-option--active,
	.mention-option:hover {
		background-color: #F8F8F8;
	}

	.mention-option--active {
		background-color: #EBF5FB;
	}

	.mention-option__avatar {
		width: 20px;
		height: 20px;
		border-radius: 4px;
		flex-shrink: 0;
	}

	.mention-option__name {
		font-size: 14px;
		font-weight: 600;
		color: #1D1C1D;
		flex: 1;
	}

	.mention-option__badge {
		font-size: 10px;
		font-weight: 700;
		background: #E8E8E8;
		color: #616061;
		padding: 1px 4px;
		border-radius: 3px;
		letter-spacing: 0.02em;
	}

	/* ── Mention chips in editor ── */
	.composer__input :global(.mention) {
		color: #0068A9;
		font-weight: 600;
		background: #E1F8FE;
		border-radius: 3px;
		padding: 0 2px;
		cursor: default;
	}

	.composer--dark {
		background-color: #1A1D21;
	}

	.composer__box {
		border: 1px solid #E8E8E8;
		border-radius: 8px;
		overflow: hidden;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.composer--dark .composer__box {
		border-color: rgba(255, 255, 255, 0.15);
		background-color: #222529;
	}

	.composer__box:focus-within {
		border-color: #1D9BD1;
		box-shadow: 0 0 0 2px rgba(29, 155, 209, 0.15);
	}

	.composer__toolbar {
		display: flex;
		align-items: center;
		padding: 4px 8px;
		border-bottom: 1px solid #F0F0F0;
		gap: 2px;
		background-color: #F4F4F4;
	}

	.composer--dark .composer__toolbar {
		border-bottom-color: rgba(255, 255, 255, 0.1);
	}

	.toolbar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		border-radius: 4px;
		border: none;
		background: transparent;
		color: #616061;
		cursor: pointer;
		font-size: 13px;
		transition: background-color 0.1s ease;
	}

	.composer--dark .toolbar-btn {
		color: rgba(255, 255, 255, 0.5);
	}

	.toolbar-btn:hover {
		background-color: #F0F0F0;
		color: #1D1C1D;
	}

	.composer--dark .toolbar-btn:hover {
		background-color: rgba(255, 255, 255, 0.08);
		color: rgba(255, 255, 255, 0.9);
	}

	.composer__input {
		padding: 11px 12px;
		min-height: 40px;
		max-height: 300px;
		overflow-y: auto;
		font-size: 15px;
		line-height: 1.46667;
		color: #1D1C1D;
		outline: none;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.composer--dark .composer__input {
		color: rgba(255, 255, 255, 0.9);
	}

	.composer__input:empty::before {
		content: attr(data-placeholder);
		color: #868686;
		pointer-events: none;
	}

	.composer--dark .composer__input:empty::before {
		color: rgba(255, 255, 255, 0.35);
	}

	.composer__actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 8px;
		border-top: none;
	}

	.composer--dark .composer__actions {
		border-top-color: rgba(255, 255, 255, 0.1);
	}

	.composer__media-btns {
		display: flex;
		gap: 2px;
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 4px;
		border: none;
		background: transparent;
		color: #616061;
		cursor: pointer;
		transition: background-color 0.1s ease;
	}

	.composer--dark .action-btn {
		color: rgba(255, 255, 255, 0.5);
	}

	.action-btn:hover {
		background-color: #F0F0F0;
		color: #1D1C1D;
	}

	.composer--dark .action-btn:hover {
		background-color: rgba(255, 255, 255, 0.08);
		color: rgba(255, 255, 255, 0.9);
	}

	.composer__send-area {
		display: flex;
		align-items: center;
	}

	.send-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 4px;
		border: none;
		background: transparent;
		color: #AAAAAA;
		cursor: not-allowed;
		transition: color 0.15s ease;
	}

	.send-btn--active {
		color: #007A5A;
		cursor: pointer;
	}

	.send-btn--active:hover {
		color: #006048;
	}
</style>
