<script>
	import ApiKeyPopover from './ApiKeyPopover.svelte';

	/**
	 * @typedef {Object} Props
	 * @property {string} name
	 * @property {string} [status]
	 * @property {string} [avatar]
	 * @property {boolean} [isBot]
	 * @property {string} [activeTab]
	 * @property {(tab: string) => void} [onTabChange]
	 * @property {() => void} [onNewChat]
	 * @property {boolean} [keyPopoverOpen]
	 * @property {boolean} [hasApiKey]
	 * @property {string} [currentApiKey]
	 * @property {(key: string) => void} [onApiKeySave]
	 */

	/** @type {Props} */
	let {
		name, status, avatar, isBot = false,
		activeTab = 'chat', onTabChange, onNewChat,
		keyPopoverOpen = $bindable(false),
		hasApiKey = false,
		currentApiKey = '',
		onApiKeySave
	} = $props();

	const appTabs = ['Home', 'Chat', 'History', 'About'];
</script>

{#if isBot}
	<header class="app-header">
		<div class="app-header__top">
			<div class="app-header__left">
				<button class="icon-btn" aria-label="Star {name}">
					<!-- outlined star -->
					<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.27l-4.94 2.43.94-5.49-4-3.9 5.53-.8z" stroke-linejoin="round"/>
					</svg>
				</button>
				{#if avatar}
					<img src={avatar} alt="" class="app-header__avatar" aria-hidden="true" />
				{/if}
				<h1 class="app-header__name">{name}</h1>
			</div>
			<div class="app-header__right">
				<button class="new-chat-btn" aria-label="New Chat" onclick={() => onNewChat?.()}>
					<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
						<path d="M2.5 4.75A.75.75 0 0 1 3.25 4h13.5a.75.75 0 0 1 .75.75v10a.75.75 0 0 1-.75.75H11l-2.47 2.47a.75.75 0 0 1-1.28-.53V15.5H3.25a.75.75 0 0 1-.75-.75zM4 5.5v8.5h3.75a.75.75 0 0 1 .75.75v1.19l1.72-1.72a.75.75 0 0 1 .53-.22H16V5.5zM10 7a.75.75 0 0 1 .75.75v1.75h1.75a.75.75 0 0 1 0 1.5h-1.75v1.75a.75.75 0 0 1-1.5 0V11h-1.75a.75.75 0 0 1 0-1.5h1.75V7.75A.75.75 0 0 1 10 7"/>
					</svg>
					New Chat
				</button>
				<div class="key-btn-wrap">
					<button
						class="icon-btn"
						class:icon-btn--keyed={hasApiKey}
						aria-label="Set Anthropic API key"
						onclick={() => (keyPopoverOpen = !keyPopoverOpen)}
					>
						<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M8 1a5 5 0 1 0 3.355 8.645l.195.195V11h1.25a.75.75 0 0 1 .75.75v1.25h1.25a.75.75 0 0 1 .75.75V15.5h1.25a.75.75 0 0 1 .53 1.28l-1.5 1.5a.75.75 0 0 1-.53.22h-2.5a.75.75 0 0 1-.75-.75v-2.19l-2.855-2.855A5 5 0 0 1 8 1zm0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM8 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" clip-rule="evenodd"/>
						</svg>
					</button>
					{#if keyPopoverOpen}
						<ApiKeyPopover
							initialKey={currentApiKey}
							onSave={(key) => onApiKeySave?.(key)}
							onClose={() => (keyPopoverOpen = false)}
						/>
					{/if}
				</div>
				<button class="icon-btn" aria-label="Notifications">
					<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
						<path d="M10 1.5c.414 0 .75.336.75.75v.837a6 6 0 0 1 5.25 5.913v2.25l1.28 2.558a.75.75 0 0 1-.673 1.085H3.393a.75.75 0 0 1-.672-1.085L4 11.25V9a6 6 0 0 1 5.25-5.913V2.25c0-.414.336-.75.75-.75zM10 18a2 2 0 0 1-1.995-1.85L8 16h4a2 2 0 0 1-1.85 1.995L10 18z"/>
					</svg>
				</button>
				<button class="icon-btn" aria-label="More options">
					<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
						<circle cx="10" cy="4" r="1.5"/>
						<circle cx="10" cy="10" r="1.5"/>
						<circle cx="10" cy="16" r="1.5"/>
					</svg>
				</button>
			</div>
		</div>

		<div class="app-header__tabs" role="tablist">
			{#each appTabs as tab}
				<button
					role="tab"
					class="app-tab"
					class:app-tab--active={activeTab === tab.toLowerCase()}
					aria-selected={activeTab === tab.toLowerCase()}
					onclick={() => onTabChange?.(tab.toLowerCase())}
				>
					{tab}
				</button>
			{/each}
		</div>
	</header>
{:else}
	<header class="message-header">
		<div class="header-left">
			<div class="header-title-row">
				{#if avatar}
					<div class="header-avatar-wrap">
						<img src={avatar} alt="" class="header-avatar" aria-hidden="true" />
						{#if status}
							<span class="header-presence" class:header-presence--away={status === 'away'} class:header-presence--active={status === 'active'}></span>
						{/if}
					</div>
				{/if}
				<button class="channel-name-btn" aria-label="View {name} details">
					<h1 class="channel-name">{name}</h1>
				</button>
			</div>
		</div>

		<div class="header-actions">
			<div class="key-btn-wrap">
				<button
					class="header-action-icon"
					class:header-action-icon--keyed={hasApiKey}
					aria-label="Set Anthropic API key"
					onclick={() => (keyPopoverOpen = !keyPopoverOpen)}
				>
					<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M8 1a5 5 0 1 0 3.355 8.645l.195.195V11h1.25a.75.75 0 0 1 .75.75v1.25h1.25a.75.75 0 0 1 .75.75V15.5h1.25a.75.75 0 0 1 .53 1.28l-1.5 1.5a.75.75 0 0 1-.53.22h-2.5a.75.75 0 0 1-.75-.75v-2.19l-2.855-2.855A5 5 0 0 1 8 1zm0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM8 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" clip-rule="evenodd"/>
					</svg>
				</button>
				{#if keyPopoverOpen}
					<ApiKeyPopover
						initialKey={currentApiKey}
						onSave={(key) => onApiKeySave?.(key)}
						onClose={() => (keyPopoverOpen = false)}
					/>
				{/if}
			</div>
			<button class="header-action-icon" aria-label="Notifications">
				<svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor">
					<path d="M10 1.5c.414 0 .75.336.75.75v.837a6 6 0 0 1 5.25 5.913v2.25l1.28 2.558a.75.75 0 0 1-.673 1.085H3.393a.75.75 0 0 1-.672-1.085L4 11.25V9a6 6 0 0 1 5.25-5.913V2.25c0-.414.336-.75.75-.75zM10 18a2 2 0 0 1-1.995-1.85L8 16h4a2 2 0 0 1-1.85 1.995L10 18z"/>
				</svg>
			</button>
			<button class="header-action-icon" aria-label="Search">
				<svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor">
					<path d="M12.9 14.32a8 8 0 1 1 1.41-1.41l4.35 4.33-1.42 1.42zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12"/>
				</svg>
			</button>
			<button class="header-action-icon" aria-label="More options">
				<svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor">
					<path d="M10 6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m0 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m0 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" fill-rule="evenodd"/>
				</svg>
			</button>
		</div>
	</header>
{/if}

<style>
	/* ── App-style light header ── */
	.app-header {
		background-color: white;
		flex-shrink: 0;
		border-bottom: 1px solid #E8E8E8;
	}

	.app-header__top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 16px 8px;
	}

	.app-header__left {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.app-header__avatar {
		width: 24px;
		height: 24px;
		border-radius: 6px;
		display: block;
	}

	.app-header__name {
		font-size: 16px;
		font-weight: 700;
		color: #1D1C1D;
		margin: 0;
		line-height: 1.3;
	}

	.app-header__right {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.key-btn-wrap {
		position: relative;
	}

	.icon-btn {
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

	.icon-btn:hover {
		background-color: #F0F0F0;
		color: #1D1C1D;
	}

	.icon-btn--keyed {
		color: #616061;
	}

	.icon-btn--keyed:hover {
		color: #1D1C1D;
	}

	.new-chat-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		background-color: #007A5A;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		transition: background-color 0.1s ease;
	}

	.new-chat-btn:hover {
		background-color: #006048;
	}

	.app-header__tabs {
		display: flex;
		padding: 0 12px;
		gap: 4px;
	}

	.app-tab {
		padding: 8px 10px 7px;
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		color: #616061;
		font-size: 13px;
		font-weight: 400;
		cursor: pointer;
		transition: color 0.1s ease;
		line-height: 1.3;
	}

	.app-tab:hover {
		color: #1D1C1D;
	}

	.app-tab--active {
		color: #1D1C1D;
		font-weight: 700;
		border-bottom-color: #1D1C1D;
	}

	/* ── Regular channel/DM header ── */
	.message-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 20px;
		border-bottom: 1px solid #E8E8E8;
		background-color: white;
		flex-shrink: 0;
		min-height: 49px;
	}

	.header-left {
		display: flex;
		align-items: center;
		min-width: 0;
	}

	.header-title-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.header-avatar-wrap {
		position: relative;
		flex-shrink: 0;
	}

	.header-avatar {
		width: 24px;
		height: 24px;
		border-radius: 4px;
		display: block;
	}

	.header-presence {
		position: absolute;
		bottom: -2px;
		right: -2px;
		width: 9px;
		height: 9px;
		border-radius: 50%;
		border: 1.5px solid white;
	}

	.header-presence--active { background-color: #2BAC76; }
	.header-presence--away { background-color: transparent; border-color: #666; }

	.channel-name-btn {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}

	.channel-name-btn:hover .channel-name { text-decoration: underline; }

	.channel-name {
		font-size: 15px;
		font-weight: 700;
		color: #1D1C1D;
		margin: 0;
		line-height: 1.4;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;
	}

	.header-action-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: 1px solid #D6D6D6;
		border-radius: 8px;
		background: white;
		color: #1D1C1D;
		cursor: pointer;
		transition: background-color 0.1s ease, border-color 0.1s ease;
	}

	.header-action-icon:hover {
		background-color: #F0F0F0;
		border-color: #C0C0C0;
	}

	.header-action-icon--keyed {
		color: #1D1C1D;
		border-color: #D6D6D6;
	}

	.header-action-icon--keyed:hover {
		color: #1D1C1D;
		border-color: #C0C0C0;
	}
</style>
