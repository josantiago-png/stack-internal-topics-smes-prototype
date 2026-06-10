<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} [initialKey]
	 * @property {(key: string) => void} onSave
	 * @property {() => void} onClose
	 */

	/** @type {Props} */
	let { initialKey = '', onSave, onClose } = $props();

	let inputValue = $state('');
	$effect(() => { inputValue = initialKey; });

	function handleSave() {
		const trimmed = inputValue.trim();
		if (!trimmed) return;
		onSave(trimmed);
		onClose();
	}

	/** @param {KeyboardEvent} e */
	function handleKeydown(e) {
		if (e.key === 'Enter') handleSave();
		if (e.key === 'Escape') onClose();
	}

	/** @param {MouseEvent} e */
	function handleBackdropClick(e) {
		if (e.target === e.currentTarget) onClose();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="backdrop" onmousedown={handleBackdropClick}></div>
<div class="popover" role="dialog" aria-label="Anthropic API key">
		<p class="title">Anthropic API key</p>
		<p class="subtitle">Stored locally in your browser. Used to demo the chat experience.</p>
		<!-- svelte-ignore a11y_autofocus -->
		<input
			class="key-input"
			type="password"
			placeholder="sk-ant-..."
			bind:value={inputValue}
			onkeydown={handleKeydown}
			autofocus
		/>
		<div class="actions">
			<button class="save-btn" onclick={handleSave} disabled={!inputValue.trim()}>Save</button>
		</div>
	</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 199;
	}

	.popover {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		width: 300px;
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.14), 0 1px 4px rgba(0, 0, 0, 0.08);
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		z-index: 200;
	}

	.title {
		margin: 0;
		font-size: 15px;
		font-weight: 700;
		color: #1D1C1D;
		line-height: 1.3;
	}

	.subtitle {
		margin: 0 0 8px;
		font-size: 14px;
		color: #616061;
		line-height: 1.5;
	}

	.key-input {
		width: 100%;
		box-sizing: border-box;
		padding: 10px 12px;
		font-size: 14px;
		color: #1D1C1D;
		border: 1px solid #D6D6D6;
		border-radius: 8px;
		outline: none;
		font-family: inherit;
		transition: border-color 0.15s ease;
	}

	.key-input:focus {
		border-color: #1D1C1D;
	}

	.key-input::placeholder {
		color: #9e9e9e;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 4px;
	}

	.save-btn {
		padding: 10px 22px;
		background: #1D1C1D;
		color: white;
		border: none;
		border-radius: 999px;
		font-size: 14px;
		font-weight: 700;
		cursor: pointer;
		transition: opacity 0.15s ease;
	}

	.save-btn:hover:not(:disabled) {
		opacity: 0.85;
	}

	.save-btn:disabled {
		opacity: 0.4;
		cursor: default;
	}
</style>
