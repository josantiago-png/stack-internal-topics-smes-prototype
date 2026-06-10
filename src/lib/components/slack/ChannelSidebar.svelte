<script>
	/**
	 * @typedef {{ id: string, label: string }} Scene
	 * @typedef {Object} Props
	 * @property {string} [workspaceName]
	 * @property {import('$lib/data/slack').channels} channels
	 * @property {import('$lib/data/slack').directMessages} directMessages
	 * @property {import('$lib/data/slack').apps} apps
	 * @property {string} activeId
	 * @property {(id: string, type: 'channel' | 'dm' | 'app') => void} onSelect
	 * @property {Scene[]} [scenes]
	 * @property {string | null} [activeScene]
	 * @property {(sceneId: string | null) => void} [onSceneSelect]
	 */

	/** @type {Props} */
	let {
		workspaceName = 'Acme',
		channels,
		directMessages,
		apps,
		activeId,
		onSelect,
		scenes = [],
		activeScene = null,
		onSceneSelect
	} = $props();

	let channelsCollapsed = $state(false);
	let appsCollapsed = $state(false);
	let searchQuery = $state('');
	let workspaceMenuOpen = $state(false);

	/** @param {MouseEvent} e */
	function handleWorkspaceClick(e) {
		e.stopPropagation();
		workspaceMenuOpen = !workspaceMenuOpen;
	}

	function closeWorkspaceMenu() {
		workspaceMenuOpen = false;
	}

	/** @param {string | null} sceneId */
	function pickScene(sceneId) {
		onSceneSelect?.(sceneId);
		workspaceMenuOpen = false;
	}

	const pinnedItems = [
		{
			id: 'threads',
			label: 'Threads',
			svg: `<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a7 7 0 1 0 3.394 13.124.75.75 0 0 1 .542-.074l2.794.68-.68-2.794a.75.75 0 0 1 .073-.542A7 7 0 0 0 10 3m-8.5 7a8.5 8.5 0 1 1 16.075 3.859l.904 3.714a.75.75 0 0 1-.906.906l-3.714-.904A8.5 8.5 0 0 1 1.5 10M6 8.25a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 6 8.25M6.75 11a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5z"/></svg>`
		},
		{
			id: 'drafts',
			label: 'Drafts & Sent',
			svg: `<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M2.5 3.75A.75.75 0 0 1 3.25 3h13.5a.75.75 0 0 1 .75.75v10a.75.75 0 0 1-.75.75H11l-2.47 2.47a.75.75 0 0 1-1.28-.53V14.5H3.25a.75.75 0 0 1-.75-.75zM4 4.5v8.5h3.75a.75.75 0 0 1 .75.75v1.19l1.72-1.72a.75.75 0 0 1 .53-.22H16V4.5z"/></svg>`
		},
	];
</script>

<svelte:window onclick={closeWorkspaceMenu} />

<aside class="channel-sidebar" aria-label="Channel sidebar">
	<div class="sidebar-header">
		<div class="workspace-menu-wrap">
			<button class="workspace-name-btn" aria-label="{workspaceName} menu" aria-expanded={workspaceMenuOpen} onclick={handleWorkspaceClick}>
				<span class="workspace-name">{workspaceName}</span>
				<svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
					<path d="M4 7l6 6 6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</button>
			{#if workspaceMenuOpen}
				<div class="workspace-menu" role="menu" onclick={(e) => e.stopPropagation()}>
					<button
						class="workspace-menu__item"
						class:workspace-menu__item--active={activeScene === null}
						role="menuitemradio"
						aria-checked={activeScene === null}
						onclick={() => pickScene(null)}
					>
						<span class="workspace-menu__check">
							{#if activeScene === null}
								<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M16.78 6.22a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06l2.97 2.97 6.97-6.97a.75.75 0 0 1 1.06 0"/></svg>
							{/if}
						</span>
						<span class="workspace-menu__label">Reset (no scene)</span>
					</button>
					{#if scenes.length}
						<div class="workspace-menu__divider"></div>
						{#each scenes as scene}
							<button
								class="workspace-menu__item"
								class:workspace-menu__item--active={activeScene === scene.id}
								role="menuitemradio"
								aria-checked={activeScene === scene.id}
								onclick={() => pickScene(scene.id)}
							>
								<span class="workspace-menu__check">
									{#if activeScene === scene.id}
										<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M16.78 6.22a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06l2.97 2.97 6.97-6.97a.75.75 0 0 1 1.06 0"/></svg>
									{/if}
								</span>
								<span class="workspace-menu__label">{scene.label}</span>
							</button>
						{/each}
					{/if}
				</div>
			{/if}
		</div>
		<div class="sidebar-header__actions">
			<button class="sidebar-header__btn" aria-label="Preferences" title="Preferences">
				<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
					<path d="M10 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17M0 10a10 10 0 1 1 20 0 10 10 0 0 1-20 0"/>
					<path d="M10 6.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7M5 10a5 5 0 1 1 10 0 5 5 0 0 1-10 0"/>
					<path d="M10 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"/>
					<path d="M9.25 1.5h1.5v3.25h-1.5zM9.25 15.25h1.5V18.5h-1.5zM1.5 9.25h3.25v1.5H1.5zM15.25 9.25H18.5v1.5h-3.25z"/>
				</svg>
			</button>
			<button class="sidebar-header__btn" aria-label="New message" title="New message">
				<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
					<path d="M3.25 4A.75.75 0 0 0 2.5 4.75v11.5c0 .41.34.75.75.75H5.5v2.47a.75.75 0 0 0 1.28.53L9.56 17H17.25a.75.75 0 0 0 .75-.75V4.75A.75.75 0 0 0 17.25 4zM1 4.75A2.25 2.25 0 0 1 3.25 2.5h14a2.25 2.25 0 0 1 2.25 2.25v11.5A2.25 2.25 0 0 1 17.25 18.5H10l-3.22 3.22A2.25 2.25 0 0 1 3 19.94V18.5A2.25 2.25 0 0 1 1 16.25zM10 7a.75.75 0 0 1 .75.75v2.5h2.5a.75.75 0 0 1 0 1.5h-2.5v2.5a.75.75 0 0 1-1.5 0v-2.5h-2.5a.75.75 0 0 1 0-1.5h2.5v-2.5A.75.75 0 0 1 10 7"/>
				</svg>
			</button>
		</div>
	</div>

	<div class="sidebar-content">
		<!-- Pinned nav items -->
		<ul class="nav-list" role="list">
			{#each pinnedItems as item}
				<li>
					<button
						class="nav-item"
						class:nav-item--active={activeId === item.id}
						onclick={() => onSelect(item.id, 'channel')}
					>
						<span class="nav-item__icon nav-item__icon--svg">{@html item.svg}</span>
						<span class="nav-item__label">{item.label}</span>
					</button>
				</li>
			{/each}
		</ul>

		<div class="sidebar-divider"></div>

		<!-- Direct Messages -->
		{#if directMessages.length > 0}
		<section class="sidebar-section">
			<div class="section-header">
				<button class="section-toggle" aria-label="Collapse Direct Messages">
					<svg class="chevron" width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
						<path d="M2 3l3 3 3-3" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
					</svg>
				</button>
				<span class="section-title">Direct Messages</span>
				<button class="section-action" aria-label="New direct message">
					<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
						<path d="M7 1a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2H8v4a1 1 0 1 1-2 0V8H2a1 1 0 1 1 0-2h4V2a1 1 0 0 1 1-1z"/>
					</svg>
				</button>
			</div>

			<ul class="nav-list" role="list">
				{#each directMessages as dm}
					<li>
						<button
							class="nav-item nav-item--dm"
							class:nav-item--active={activeId === dm.id}
							onclick={() => onSelect(dm.id, 'dm')}
						>
							<span class="dm-avatar-wrap">
								<img src={dm.avatar} alt="" class="dm-avatar" aria-hidden="true" />
								<span class="dm-presence" class:dm-presence--away={dm.status === 'away'} class:dm-presence--active={dm.status === 'active'}></span>
							</span>
							<span class="nav-item__label">{dm.name}</span>
						</button>
					</li>
				{/each}
			</ul>
		</section>
		{/if}

		<!-- Apps -->
		<section class="sidebar-section">
			<div class="section-header">
				<button
					class="section-toggle"
					aria-label={appsCollapsed ? 'Expand Apps' : 'Collapse Apps'}
					onclick={() => (appsCollapsed = !appsCollapsed)}
				>
					<svg class="chevron" class:chevron--collapsed={appsCollapsed} width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
						<path d="M2 3l3 3 3-3" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
					</svg>
				</button>
				<span class="section-title">Apps</span>
			</div>

			{#if !appsCollapsed}
				<ul class="nav-list" role="list">
					{#each apps as app}
						<li>
							<button
								class="nav-item nav-item--dm"
								class:nav-item--active={activeId === app.id}
								class:nav-item--unread={app.unread}
								onclick={() => onSelect(app.id, 'app')}
							>
								{#if app.avatar}
									<img src={app.avatar} alt="" class="dm-avatar" aria-hidden="true" />
								{:else}
									<span class="nav-item__icon nav-item__icon--hash">⚡</span>
								{/if}
								<span class="nav-item__label">{app.name}</span>
								{#if app.unread}
									<span class="unread-badge" aria-label="{app.unread} unread {app.unread === 1 ? 'message' : 'messages'}">{app.unread}</span>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<!-- Channels -->
		<section class="sidebar-section">
			<div class="section-header">
				<button
					class="section-toggle"
					aria-label={channelsCollapsed ? 'Expand Channels' : 'Collapse Channels'}
					onclick={() => (channelsCollapsed = !channelsCollapsed)}
				>
					<svg class="chevron" class:chevron--collapsed={channelsCollapsed} width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
						<path d="M2 3l3 3 3-3" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
					</svg>
				</button>
				<span class="section-title">Channels</span>
				<button class="section-action" aria-label="Browse or add channels">
					<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
						<path d="M7 1a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2H8v4a1 1 0 1 1-2 0V8H2a1 1 0 1 1 0-2h4V2a1 1 0 0 1 1-1z"/>
					</svg>
				</button>
			</div>

			{#if !channelsCollapsed}
				<ul class="nav-list" role="list">
					{#each channels as channel}
						<li>
							<button
								class="nav-item"
								class:nav-item--active={activeId === channel.id}
								onclick={() => onSelect(channel.id, 'channel')}
							>
								<span class="nav-item__icon nav-item__icon--hash">#</span>
								<span class="nav-item__label">{channel.name}</span>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>
</aside>

<style>
	.channel-sidebar {
		display: flex;
		flex-direction: column;
		width: 260px;
		flex-shrink: 0;
		background-color: #fdfdfd;
		color: #616061;
		overflow: hidden;
		box-shadow: -4px 0 14px rgba(0, 0, 0, 0.062);
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px 10px;
		flex-shrink: 0;
	}

	.workspace-menu-wrap {
		position: relative;
	}

	.workspace-name-btn {
		display: flex;
		align-items: center;
		gap: 5px;
		background: none;
		border: none;
		cursor: pointer;
		color: #1D1C1D;
		padding: 2px 4px;
		border-radius: 4px;
		transition: background-color 0.1s ease;
	}

	.workspace-menu {
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		min-width: 280px;
		background: #fff;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 8px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
		padding: 6px;
		z-index: 100;
	}

	.workspace-menu__item {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 8px 10px;
		border: none;
		background: transparent;
		color: #1D1C1D;
		font-size: 14px;
		text-align: left;
		border-radius: 6px;
		cursor: pointer;
		transition: background-color 0.1s ease;
	}

	.workspace-menu__item:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.workspace-menu__item--active {
		font-weight: 700;
	}

	.workspace-menu__check {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		color: #1D1C1D;
	}

	.workspace-menu__label {
		flex: 1;
	}

	.workspace-menu__divider {
		height: 1px;
		background-color: rgba(0, 0, 0, 0.08);
		margin: 4px 0;
	}

	.workspace-name-btn:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.workspace-name {
		font-size: 16px;
		font-weight: 700;
		line-height: 1.3;
	}

	.sidebar-header__actions {
		display: flex;
		align-items: center;
		gap: 2px;
	}

	.sidebar-header__btn {
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

	.sidebar-header__btn:hover {
		background-color: rgba(0, 0, 0, 0.05);
		color: #1D1C1D;
	}

	.sidebar-search {
		padding: 8px 12px;
		flex-shrink: 0;
	}

	.search-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		width: 100%;
		padding: 5px 10px;
		border-radius: 6px;
		border: none;
		background-color: rgba(0, 0, 0, 0.05);
		color: #616061;
		cursor: pointer;
		font-size: 13px;
		text-align: left;
		transition: background-color 0.1s ease;
	}

	.search-btn:hover {
		background-color: rgba(0, 0, 0, 0.08);
		color: #1D1C1D;
	}

	.sidebar-content {
		flex: 1;
		overflow-y: auto;
		padding: 4px 0;
		scrollbar-width: none;
	}

	.sidebar-content::-webkit-scrollbar {
		display: none;
	}

	.nav-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 6px;
		width: calc(100% - 16px);
		margin: 0 8px;
		padding: 4px 8px 4px 16px;
		border: none;
		background: transparent;
		color: #616061;
		cursor: pointer;
		font-size: 14px;
		line-height: 1.4;
		border-radius: 6px;
		text-align: left;
		transition: background-color 0.08s ease;
	}

	.nav-item:hover {
		background-color: rgba(0, 0, 0, 0.05);
		color: #1D1C1D;
	}

	.nav-item--unread {
		color: #1D1C1D;
		font-weight: 700;
	}

	.nav-item--unread .nav-item__icon--hash {
		color: #1D1C1D;
	}

	.nav-item--active {
		background-color: #1D1C1D;
		color: white;
		font-weight: 700;
	}

	.nav-item--active:hover {
		background-color: #1D1C1D;
		color: white;
	}

	.nav-item--dm {
		padding-left: 12px;
	}

	.nav-item__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.nav-item__icon--hash {
		width: 16px;
		font-size: 15px;
		color: #868686;
		font-weight: 400;
	}

	.nav-item--active .nav-item__icon--hash {
		color: white;
	}

	.nav-item__icon--svg {
		width: 18px;
		display: flex;
		align-items: center;
		color: #616061;
	}

	.nav-item--active .nav-item__icon--svg {
		color: white;
	}

	.nav-item__label {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.unread-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 18px;
		height: 18px;
		padding: 0 6px;
		border-radius: 9px;
		background-color: #CD2553;
		color: #fff;
		font-size: 12px;
		font-weight: 700;
		line-height: 1;
		flex-shrink: 0;
	}

	.dm-avatar-wrap {
		position: relative;
		flex-shrink: 0;
	}

	.dm-avatar {
		width: 18px;
		height: 18px;
		border-radius: 3px;
		display: block;
	}

	.dm-presence {
		position: absolute;
		bottom: -2px;
		right: -2px;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		border: 1.5px solid #fdfdfd;
	}

	.dm-presence--active {
		background-color: #2BAC76;
	}

	.dm-presence--away {
		background-color: transparent;
		border-color: #868686;
	}

	.sidebar-divider {
		height: 1px;
		background-color: rgba(0, 0, 0, 0.08);
		margin: 6px 12px;
	}

	.sidebar-section {
		margin-bottom: 4px;
	}

	.section-header {
		display: flex;
		align-items: center;
		padding: 4px 8px 4px 4px;
		gap: 2px;
	}

	.section-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		background: transparent;
		border: none;
		cursor: pointer;
		color: #868686;
		border-radius: 4px;
		flex-shrink: 0;
	}

	.section-toggle:hover {
		background-color: rgba(0, 0, 0, 0.05);
		color: #1D1C1D;
	}

	.chevron {
		transition: transform 0.15s ease;
	}

	.chevron--collapsed {
		transform: rotate(-90deg);
	}

	.section-title {
		flex: 1;
		font-size: 13px;
		font-weight: 700;
		color: #616061;
		cursor: default;
	}

	.section-action {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		background: transparent;
		border: none;
		cursor: pointer;
		color: #AAAAAA;
		border-radius: 4px;
		opacity: 0;
		transition: opacity 0.1s ease;
	}

	.section-header:hover .section-action {
		opacity: 1;
	}

	.section-action:hover {
		background-color: rgba(0, 0, 0, 0.05);
		color: #1D1C1D;
	}
</style>
