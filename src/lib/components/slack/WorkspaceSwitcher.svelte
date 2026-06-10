<script>
	/** @type {{ workspace: import('$lib/data/slack').workspace }} */
	let { workspace } = $props();
</script>

<div class="workspace-switcher">
	<button class="workspace-btn active" title={workspace.name} aria-label={workspace.name}>
		<img src={workspace.icon} alt={workspace.name} class="workspace-icon" />
	</button>

	<div class="divider"></div>

	<button class="workspace-btn add-btn" title="Add a workspace" aria-label="Add a workspace">
		<svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
			<path d="M9 1a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H2a1 1 0 1 1 0-2h6V2a1 1 0 0 1 1-1z"/>
		</svg>
	</button>
</div>

<style>
	.workspace-switcher {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 8px 0;
		width: 60px;
		background-color: #1A1D21;
		flex-shrink: 0;
	}

	.workspace-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 8px;
		border: none;
		cursor: pointer;
		background-color: transparent;
		color: rgba(255, 255, 255, 0.7);
		transition: border-radius 0.15s ease;
		padding: 0;
	}

	.workspace-btn:hover {
		border-radius: 12px;
	}

	.workspace-btn.active {
		box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
		border-radius: 12px;
	}

	.workspace-icon {
		width: 36px;
		height: 36px;
		border-radius: 8px;
		object-fit: cover;
	}

	.add-btn {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.add-btn:hover {
		background-color: rgba(255, 255, 255, 0.2);
		color: white;
	}

	.divider {
		width: 28px;
		height: 1px;
		background-color: rgba(255, 255, 255, 0.2);
		margin: 4px 0;
	}
</style>
