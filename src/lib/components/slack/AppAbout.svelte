<script>
	import { base } from '$app/paths';
	const screenshots = [
		{ bg: '#E8D5C4', label: 'Search across docs' },
		{ bg: '#C4D5E8', label: 'Summarize threads' },
		{ bg: '#C4E8D5', label: 'Answer policy questions' },
		{ bg: '#E8C4D5', label: 'Pull metrics & reports' },
	];
</script>

<div class="about">
	<!-- Hero row -->
	<div class="hero">
		<div class="hero__left">
			<img src="{base}/avatars/app-icon-stack.svg" alt="Stack Internal" class="hero__avatar" />
			<button class="action-btn">Configuration</button>
			<button class="action-btn">App Homepage</button>
			<button class="action-btn">Add to VIP</button>
		</div>
		<div class="hero__right">
			<div class="hero__section">
				<h2 class="hero__heading">What can Stack Internal do?</h2>
				<p class="hero__sub">Your enterprise knowledge agent, connected to every source at Acme.</p>
			</div>
			<hr class="divider" />
			<div class="hero__section">
				<h2 class="hero__heading">More about Stack Internal</h2>
				<p class="hero__body">Stack Internal works across all of your connected organizational sources to give humans and agents decision-grade knowledge. Search internal docs, pull metrics, find policy answers, understand who owns what, and get clear answers to any Acme question — all without leaving Slack.</p>
				<p class="hero__body">Just send a message to Stack Internal, or tag it in any channel thread, for instant access without switching tools.</p>
				<p class="hero__body hero__body--disclaimer">Stack Internal may occasionally make mistakes. Please double-check critical information.</p>
			</div>
		</div>
	</div>

	<hr class="divider divider--full" />

	<!-- Screenshots -->
	<div class="screenshots">
		<h3 class="section-heading">Screenshots</h3>
		<div class="screenshots__grid">
			{#each screenshots as s}
				<div class="screenshot" style="background:{s.bg}">
					<div class="screenshot__lines">
						{#each [1,2,3,4,5] as _}
							<div class="screenshot__line"></div>
						{/each}
					</div>
					<div class="screenshot__icon">
						<img src="{base}/avatars/app-icon-stack.svg" alt="" style="width:20px;height:20px;border-radius:4px;opacity:0.7;" />
					</div>
				</div>
			{/each}
		</div>
	</div>

	<hr class="divider divider--full" />

	<!-- Permissions -->
	<div class="permissions">
		<h3 class="section-heading">Permissions</h3>
		<p class="permissions__managed">Managed by Platform Intelligence</p>
		<p class="permissions__body">For a full list of Stack Internal's permissions you can visit the App page of the Slack Marketplace.</p>
		<a href="#permissions" class="permissions__link">See all permissions</a>
	</div>
</div>

<style>
	.about {
		flex: 1;
		overflow-y: auto;
		background: white;
		font-size: 14px;
	}

	/* Hero */
	.hero {
		display: flex;
		gap: 32px;
		padding: 24px 28px 28px;
	}

	.hero__left {
		display: flex;
		flex-direction: column;
		gap: 10px;
		flex-shrink: 0;
		width: 200px;
	}

	.hero__avatar {
		width: 200px;
		height: 200px;
		border-radius: 16px;
		display: block;
		margin-bottom: 4px;
	}

	.action-btn {
		width: 100%;
		padding: 9px 14px;
		border: 1px solid #D0D0D0;
		border-radius: 6px;
		background: white;
		font-size: 14px;
		font-weight: 600;
		color: #1D1C1D;
		cursor: pointer;
		text-align: center;
		transition: background-color 0.1s ease;
	}

	.action-btn:hover {
		background: #F8F8F8;
	}

	.hero__right {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.hero__section {
		padding: 4px 0 20px;
	}

	.hero__heading {
		font-size: 16px;
		font-weight: 700;
		color: #1D1C1D;
		margin: 0 0 6px;
	}

	.hero__sub {
		font-size: 14px;
		color: #616061;
		margin: 0;
		line-height: 1.5;
	}

	.hero__body {
		font-size: 14px;
		color: #1D1C1D;
		margin: 0 0 12px;
		line-height: 1.6;
	}

	.hero__body:last-child {
		margin-bottom: 0;
	}

	.hero__body--disclaimer {
		color: #616061;
	}

	/* Dividers */
	.divider {
		border: none;
		border-top: 1px solid #E8E8E8;
		margin: 0 0 20px;
	}

	.divider--full {
		margin: 0;
	}

	/* Screenshots */
	.screenshots {
		padding: 24px 28px;
	}

	.section-heading {
		font-size: 15px;
		font-weight: 700;
		color: #1D1C1D;
		margin: 0 0 14px;
	}

	.screenshots__grid {
		display: flex;
		gap: 10px;
	}

	.screenshot {
		flex: 1;
		height: 120px;
		border-radius: 6px;
		overflow: hidden;
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding: 8px;
	}

	.screenshot__lines {
		position: absolute;
		top: 12px;
		left: 10px;
		right: 10px;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.screenshot__line {
		height: 7px;
		background: rgba(0,0,0,0.12);
		border-radius: 3px;
	}

	.screenshot__line:nth-child(2) { width: 80%; }
	.screenshot__line:nth-child(3) { width: 90%; }
	.screenshot__line:nth-child(4) { width: 60%; }
	.screenshot__line:nth-child(5) { width: 75%; }

	.screenshot__icon {
		position: absolute;
		bottom: 8px;
		right: 8px;
	}

	/* Permissions */
	.permissions {
		padding: 24px 28px 40px;
	}

	.permissions__managed {
		font-size: 13px;
		font-weight: 600;
		color: #616061;
		margin: 0 0 6px;
	}

	.permissions__body {
		font-size: 14px;
		color: #1D1C1D;
		margin: 0 0 8px;
		line-height: 1.5;
	}

	.permissions__link {
		font-size: 14px;
		color: #1D9BD1;
		text-decoration: none;
	}

	.permissions__link:hover {
		text-decoration: underline;
	}
</style>
