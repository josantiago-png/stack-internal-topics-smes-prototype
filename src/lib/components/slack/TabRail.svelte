<script>
	/**
	 * @typedef {Object} Props
	 * @property {{ name: string, icon: string }} workspace
	 * @property {string} [activeTab]
	 */

	/** @type {Props} */
	let { workspace, activeTab = 'home' } = $props();

	const tabs = [
		{
			id: 'home',
			label: 'Home',
			icon: `<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="m3 7.649-.33.223a.75.75 0 0 1-.84-1.244l7.191-4.852a1.75 1.75 0 0 1 1.958 0l7.19 4.852a.75.75 0 1 1-.838 1.244L17 7.649v7.011c0 2.071-1.679 3.84-3.75 3.84h-6.5C4.679 18.5 3 16.731 3 14.66zM11 11a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1z"/></svg>`
		},
		{
			id: 'dms',
			label: 'DMs',
			icon: `<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M7.675 6.468a4.75 4.75 0 1 1 8.807 3.441.75.75 0 0 0-.067.489l.379 1.896-1.896-.38a.75.75 0 0 0-.489.068 5 5 0 0 1-.648.273.75.75 0 1 0 .478 1.422q.314-.105.611-.242l2.753.55a.75.75 0 0 0 .882-.882l-.55-2.753A6.25 6.25 0 1 0 6.23 6.064a.75.75 0 1 0 1.445.404M6.5 8.5a5 5 0 0 0-4.57 7.03l-.415 2.073a.75.75 0 0 0 .882.882l2.074-.414A5 5 0 1 0 6.5 8.5m-3.5 5a3.5 3.5 0 1 1 1.91 3.119.75.75 0 0 0-.49-.068l-1.214.243.243-1.215a.75.75 0 0 0-.068-.488A3.5 3.5 0 0 1 3 13.5"/></svg>`
		},
		{
			id: 'activity',
			label: 'Activity',
			icon: `<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M9.357 3.256c-.157.177-.31.504-.36 1.062l-.05.558-.55.11c-1.024.204-1.691.71-2.145 1.662-.485 1.016-.736 2.566-.752 4.857l-.002.307-.217.217-2.07 2.077c-.145.164-.193.293-.206.374a.3.3 0 0 0 .034.199c.069.12.304.321.804.321h4.665l.07.672c.034.327.17.668.4.915.214.232.536.413 1.036.413.486 0 .802-.178 1.013-.41.227-.247.362-.588.396-.916l.069-.674h4.663c.5 0 .735-.202.804-.321a.3.3 0 0 0 .034-.199c-.013-.08-.061-.21-.207-.374l-2.068-2.077-.216-.217-.002-.307c-.015-2.291-.265-3.841-.75-4.857-.455-.952-1.123-1.458-2.147-1.663l-.549-.11-.05-.557c-.052-.558-.204-.885-.36-1.062C10.503 3.1 10.31 3 10 3s-.505.1-.643.256m-1.124-.994C8.689 1.746 9.311 1.5 10 1.5s1.31.246 1.767.762c.331.374.54.85.65 1.383 1.21.369 2.104 1.136 2.686 2.357.604 1.266.859 2.989.894 5.185l1.866 1.874.012.012.011.013c.636.7.806 1.59.372 2.342-.406.705-1.223 1.072-2.103 1.072H12.77c-.128.39-.336.775-.638 1.104-.493.538-1.208.896-2.12.896-.917 0-1.638-.356-2.136-.893A3 3 0 0 1 7.23 16.5H3.843c-.88 0-1.697-.367-2.104-1.072-.433-.752-.263-1.642.373-2.342l.011-.013.012-.012 1.869-1.874c.035-2.196.29-3.919.894-5.185.582-1.22 1.475-1.988 2.684-2.357.112-.533.32-1.009.651-1.383"/></svg>`
		},
		{
			id: 'files',
			label: 'Files',
			icon: `<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M5.25 2A2.25 2.25 0 0 0 3 4.25v9.5A2.25 2.25 0 0 0 5.25 16H6v.75A2.25 2.25 0 0 0 8.25 19h6.5A2.25 2.25 0 0 0 17 16.75v-9.5A2.25 2.25 0 0 0 14.75 5H14v-.75A2.25 2.25 0 0 0 11.75 2zM14 6.5v7.25c0 .414-.336.75-.75.75H5.25a.75.75 0 0 1-.75-.75V4.25c0-.414.336-.75.75-.75h6.5c.414 0 .75.336.75.75V6a.5.5 0 0 0 .5.5zm1.5.5v9.75a.75.75 0 0 1-.75.75h-6.5a.75.75 0 0 1-.75-.75V16h6.25A2.25 2.25 0 0 0 17 13.75V7z"/></svg>`
		},
		{
			id: 'later',
			label: 'Later',
			icon: `<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M4.25 4.25A2.75 2.75 0 0 1 7 1.5h6a2.75 2.75 0 0 1 2.75 2.75v12.793c0 1.114-1.346 1.671-2.134.884L10 14.31l-3.616 3.616c-.788.787-2.134.23-2.134-.884zM7 3c-.69 0-1.25.56-1.25 1.25v12.19l3.649-3.65a.85.85 0 0 1 1.202 0l3.649 3.65V4.25C14.25 3.56 13.69 3 13 3z"/></svg>`
		},
		{
			id: 'more',
			label: 'More',
			icon: `<svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M14.5 10a1.75 1.75 0 1 1 3.5 0 1.75 1.75 0 0 1-3.5 0m-6.25 0a1.75 1.75 0 1 1 3.5 0 1.75 1.75 0 0 1-3.5 0M2 10a1.75 1.75 0 1 1 3.5 0A1.75 1.75 0 0 1 2 10"/></svg>`
		}
	];
</script>

<nav class="tab-rail" aria-label="Main navigation">
	<div class="workspace-icon-wrap">
		<button class="workspace-icon-btn" title={workspace.name} aria-label={workspace.name}>
			<span class="workspace-letter-avatar">A</span>
		</button>
	</div>

	<div class="tab-rail__nav">
		{#each tabs as tab}
			<button
				class="tab-btn"
				class:tab-btn--active={activeTab === tab.id}
				title={tab.label}
				aria-label={tab.label}
				aria-current={activeTab === tab.id ? 'page' : undefined}
			>
				<span class="tab-icon" class:tab-icon--active={activeTab === tab.id}>
					{@html tab.icon}
				</span>
				<span class="tab-label">{tab.label}</span>
			</button>
		{/each}
	</div>
</nav>

<style>
	.tab-rail {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 60px;
		background-color: #EAEAEA;
		padding: 8px 0 12px;
		flex-shrink: 0;
		gap: 0;
	}

	/* Workspace icon */
	.workspace-icon-wrap {
		width: 100%;
		display: flex;
		justify-content: center;
		padding: 4px 0 16px;
	}

	.workspace-icon-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		border-radius: 12px;
		display: flex;
	}

	.workspace-letter-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 37px;
		height: 37px;
		border-radius: 10px;
		background-color: #3D3D3D;
		color: white;
		font-size: 18px;
		font-weight: 700;
		line-height: 1;
		letter-spacing: -0.5px;
	}

	/* Nav */
	.tab-rail__nav {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		gap: 4px;
	}

	.tab-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		width: 100%;
		padding: 4px 0;
		border: none;
		cursor: pointer;
		background: transparent;
		color: #1d1d1d;
		transition: color 0.1s ease;
	}

	.tab-btn:hover {
		color: #1d1d1d;
	}

	.tab-btn--active {
		color: #1d1d1d;
	}

	/* Icon pill — only the icon gets the bg when active */
	.tab-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 37px;
		height: 32px;
		border-radius: 8px;
		transition: background-color 0.1s ease;
	}

	.tab-btn:hover .tab-icon {
		background-color: rgba(0, 0, 0, 0.06);
	}

	.tab-icon--active {
		background-color: #D6D6D6;
	}

	.tab-btn:hover .tab-icon--active {
		background-color: #D0D0D0;
	}

	.tab-label {
		font-size: 8px;
		font-weight: 700;
		line-height: 1;
		letter-spacing: 0.01em;
	}
</style>
