<script>
	/** @type {{ onPrompt?: (text: string) => void }} */
	let { onPrompt } = $props();

	const suggestions = [
		{ icon: '📋', label: "What's on the product roadmap for Q2?" },
		{ icon: '📊', label: "Show me last month's key metrics" },
		{ icon: '🔐', label: "What's our password rotation policy?" },
	];

	const forYou = [
		{
			id: 'fy1',
			type: 'discovery',
			channel: 'product',
			avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Mia&backgroundColor=ffd5dc',
			author: 'Mia Chen',
			team: 'Product',
			summary: 'Running discovery on unified search UX — may overlap with the search infra work in #engineering.',
			time: '2h ago',
			prompt: 'What is the product team discovering about unified search?'
		},
		{
			id: 'fy2',
			type: 'decision',
			channel: 'platform',
			avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Raj&backgroundColor=c0aede',
			author: 'Raj Patel',
			team: 'Platform',
			summary: 'Platform team decided to deprecate the legacy auth service by end of Q2. Downstream teams should audit dependencies.',
			time: '4h ago',
			prompt: 'Which teams depend on the legacy auth service?'
		},
		{
			id: 'fy3',
			type: 'risk',
			channel: 'security',
			avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Dana&backgroundColor=d1f4e0',
			author: 'Dana Kim',
			team: 'Security',
			summary: "Security is auditing API rate limiting policies after a third-party report. Jordan's PR in #engineering may be relevant.",
			time: 'Yesterday',
			prompt: "What is the security team's API rate limiting audit about?"
		},
	];

	const typeConfig = {
		discovery: { label: 'discovery' },
		decision:  { label: 'decision' },
		risk:      { label: 'heads-up' },
	};
</script>

<div class="home">
	<div class="home__inner">
		<section class="welcome">
			<h2 class="welcome__title">Welcome to Stack Internal 👋</h2>
			<p class="welcome__sub">Stack Internal works across your connected sources to give humans and agents decision-grade knowledge.</p>
		</section>

		<section>
			<h3 class="section-title">Try asking</h3>
			<div class="suggestions__grid">
				{#each suggestions as s}
					<button class="suggestion-card" onclick={() => onPrompt?.(s.label)}>
						<span class="suggestion-card__icon">{s.icon}</span>
						<span class="suggestion-card__label">{s.label}</span>
					</button>
				{/each}
			</div>
		</section>

		<section>
			<h3 class="section-title">For You</h3>
			<p class="section-sub">Things happening across Acme that might be relevant to you.</p>
			<div class="for-you__list">
				{#each forYou as item}
					{@const cfg = typeConfig[item.type]}
					<button class="fy-card" onclick={() => onPrompt?.(item.prompt)}>
						<div class="fy-card__top">
							<img src={item.avatar} alt={item.author} class="fy-card__avatar" />
							<div class="fy-card__meta">
								<span class="fy-card__author">{item.author}</span>
							</div>
							<code class="fy-card__badge">{cfg.label}</code>
						</div>
						<p class="fy-card__summary">{item.summary}</p>
						<span class="fy-card__time">{item.time}</span>
					</button>
				{/each}
			</div>
		</section>
	</div>
</div>

<style>
	.home {
		flex: 1;
		overflow-y: auto;
		background: white;
	}

	.home__inner {
		max-width: 640px;
		padding: 32px 28px 40px;
		display: flex;
		flex-direction: column;
		gap: 28px;
	}

	.welcome__title {
		font-size: 22px;
		font-weight: 700;
		color: #1D1C1D;
		margin: 0 0 6px;
	}

	.welcome__sub {
		font-size: 14px;
		color: #616061;
		margin: 0;
		line-height: 1.5;
	}

	.section-title {
		font-size: 12px;
		font-weight: 700;
		color: #1D1C1D;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0 0 8px;
	}

	.section-sub {
		font-size: 13px;
		color: #1D1C1D;
		margin: 0 0 10px;
	}

	/* Suggestions */
	.suggestions__grid {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.suggestion-card {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 14px;
		background: #F8F8F8;
		border: 1px solid #E8E8E8;
		border-radius: 8px;
		cursor: pointer;
		text-align: left;
		transition: background-color 0.1s ease, border-color 0.1s ease;
		width: 100%;
	}

	.suggestion-card:hover {
		background: #F0F0F0;
		border-color: #D0D0D0;
	}

	.suggestion-card__icon {
		font-size: 16px;
		flex-shrink: 0;
	}

	.suggestion-card__label {
		font-size: 14px;
		color: #1D1C1D;
		line-height: 1.4;
	}

	/* For You */
	.for-you__list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.fy-card {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 12px 0;
		background: white;
		border: none;
		border-bottom: 1px solid #E8E8E8;
		border-radius: 0;
		cursor: pointer;
		text-align: left;
		width: 100%;
		transition: background-color 0.1s ease;
	}

	.fy-card:hover {
		background: #F8F8F8;
	}

	.fy-card__top {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.fy-card__avatar {
		width: 20px;
		height: 20px;
		border-radius: 4px;
		flex-shrink: 0;
	}

	.fy-card__meta {
		flex: 1;
		font-size: 12px;
		color: #1D1C1D;
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.fy-card__author {
		font-weight: 700;
		color: #1D1C1D;
	}

	.fy-card__channel {
		color: #1D9BD1;
	}

	.fy-card__badge {
		font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
		font-size: 11px;
		padding: 2px 5px;
		border-radius: 3px;
		background: #F0F0F0;
		color: #CC0000;
		border: 1px solid #D0D0D0;
		flex-shrink: 0;
		white-space: nowrap;
	}

	.fy-card__summary {
		font-size: 13px;
		color: #1D1C1D;
		margin: 0;
		line-height: 1.5;
	}

	.fy-card__time {
		font-size: 11px;
		color: #1D1C1D;
	}
</style>
