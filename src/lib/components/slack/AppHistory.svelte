<script>
	/** @type {{ onResume?: (text: string) => void }} */
	let { onResume } = $props();

	const history = [
		{
			date: 'Today',
			conversations: [
				{ id: '1', preview: "What's on the product roadmap for Q2?", time: '8:31 PM', turns: 4 },
			]
		},
		{
			date: 'Yesterday',
			conversations: [
				{ id: '2', preview: 'How do I request PTO in Workday?', time: '2:14 PM', turns: 3 },
				{ id: '3', preview: 'Who owns the payments service?', time: '11:02 AM', turns: 6 },
				{ id: '4', preview: "What's the SLA for P1 incidents?", time: '9:47 AM', turns: 2 },
			]
		},
		{
			date: 'Monday, Mar 30',
			conversations: [
				{ id: '5', preview: "Summarize last week's engineering all-hands", time: '4:55 PM', turns: 5 },
				{ id: '6', preview: 'How do I set up local dev for the auth service?', time: '1:30 PM', turns: 8 },
			]
		},
		{
			date: 'Friday, Mar 27',
			conversations: [
				{ id: '7', preview: "What are Acme's data retention policies?", time: '3:12 PM', turns: 3 },
				{ id: '8', preview: 'Who is the point of contact for enterprise accounts in EMEA?', time: '10:22 AM', turns: 2 },
			]
		},
	];
</script>

<div class="history">
	<div class="history__inner">
		{#each history as group}
			<div class="history__group">
				<h3 class="history__date">{group.date}</h3>
				<div class="history__list">
					{#each group.conversations as convo}
						<button class="convo-row" onclick={() => onResume?.(convo.preview)}>
							<div class="convo-row__icon">
								<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
									<path d="M2.5 4.75A.75.75 0 0 1 3.25 4h13.5a.75.75 0 0 1 .75.75v10a.75.75 0 0 1-.75.75H11l-2.47 2.47a.75.75 0 0 1-1.28-.53V15.5H3.25a.75.75 0 0 1-.75-.75zM4 5.5v8.5h3.75a.75.75 0 0 1 .75.75v1.19l1.72-1.72a.75.75 0 0 1 .53-.22H16V5.5z"/>
								</svg>
							</div>
							<div class="convo-row__content">
								<p class="convo-row__preview">{convo.preview}</p>
								<span class="convo-row__meta">{convo.turns} messages · {convo.time}</span>
							</div>
							<div class="convo-row__arrow">
								<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
									<path d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02z"/>
								</svg>
							</div>
						</button>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.history {
		flex: 1;
		overflow-y: auto;
		background: white;
	}

	.history__inner {
		padding: 24px 28px 40px;
		display: flex;
		flex-direction: column;
		gap: 28px;
		max-width: 640px;
	}

	.history__group {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.history__date {
		font-size: 11px;
		font-weight: 700;
		color: #868686;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0 0 6px;
		padding: 0 4px;
	}

	.history__list {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.convo-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 12px;
		border-radius: 8px;
		border: none;
		background: transparent;
		cursor: pointer;
		text-align: left;
		width: 100%;
		transition: background-color 0.1s ease;
	}

	.convo-row:hover {
		background: #F8F8F8;
	}

	.convo-row__icon {
		width: 28px;
		height: 28px;
		border-radius: 6px;
		background: #F0F0F0;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #868686;
		flex-shrink: 0;
	}

	.convo-row__content {
		flex: 1;
		min-width: 0;
	}

	.convo-row__preview {
		font-size: 14px;
		color: #1D1C1D;
		margin: 0 0 2px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.convo-row__meta {
		font-size: 12px;
		color: #868686;
	}

	.convo-row__arrow {
		color: #C0C0C0;
		flex-shrink: 0;
		transition: color 0.1s ease;
	}

	.convo-row:hover .convo-row__arrow {
		color: #868686;
	}
</style>
