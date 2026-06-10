<script lang="ts">
  import { base } from '$app/paths';
  import { IconCheck, IconKey, IconShare } from '@stackoverflow/stacks-icons/icons';
  import { adminTopicsProgress } from '$lib/stores/adminTopicsProgress';

  type Source = {
    name: string;
    description: string;
    icon: string;
    selected?: boolean;
    stack?: boolean;
  };

  const sources: Source[] = [
    {
      name: 'Stack Internal Community',
      description: 'Use your existing community as a trusted knowledge source.',
      icon: `${base}/stack-internal-glyph.svg`,
      selected: true,
      stack: true,
    },
    {
      name: 'Google Docs',
      description: 'Choose folders to make docs searchable and citable.',
      icon: `${base}/icon-google-docs.svg`,
      selected: true,
    },
    {
      name: 'Slack',
      description: 'Pull in conversations to capture informal knowledge.',
      icon: `${base}/icon-slack.svg`,
      selected: true,
    },
  ];

  const contentScanPercent = $derived(
    getPercent($adminTopicsProgress.itemsScanned, $adminTopicsProgress.totalItems)
  );
  const topicMappingPercent = $derived(
    getPercent($adminTopicsProgress.mappedTopics, $adminTopicsProgress.totalTopics)
  );
  const contentRemaining = $derived(
    Math.max(0, $adminTopicsProgress.totalItems - $adminTopicsProgress.itemsScanned)
  );
  const topicsRemaining = $derived(
    Math.max(0, $adminTopicsProgress.totalTopics - $adminTopicsProgress.mappedTopics)
  );

  function getPercent(value: number, total: number) {
    if (!total) {
      return 0;
    }

    return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
  }

  function formatTimeEstimate(ms: number) {
    const seconds = Math.ceil(ms / 1000);

    if (seconds <= 1) {
      return 'Less than 1s remaining';
    }

    return `About ${seconds}s remaining`;
  }

  function pluralize(count: number, singular: string, plural = `${singular}s`) {
    return `${count.toLocaleString()} ${count === 1 ? singular : plural}`;
  }
</script>

<svelte:head>
  <title>Get started - Stack Internal</title>
</svelte:head>

<section class="onboarding" aria-labelledby="onboarding-title">
  <h1 id="onboarding-title">Get started with Stack Internal</h1>

  <div class="steps">
    <section class="step step--complete">
      <div class="step-marker step-marker--complete" aria-label="Complete">
        {@html IconCheck}
      </div>

      <div class="step-content">
        <h2>Enable SSO</h2>
        <p>Allow employees to securely sign in with their company identity provider and test access.</p>

        <div class="status-card">
          <div class="status-card__icon" aria-hidden="true">
            {@html IconKey}
          </div>
          <div class="status-card__copy">
            <h3>Single sign-on enabled</h3>
            <p>Users from <strong>Acme Corp</strong> can log in with <strong>Okta</strong> using <strong>SAML</strong>.</p>
          </div>
          <button class="pill-button" type="button">Test access</button>
        </div>
      </div>
    </section>

    <section
      class="step"
      class:step--active={$adminTopicsProgress.phase !== 'complete'}
      class:step--complete={$adminTopicsProgress.phase === 'complete'}
    >
      <div
        class="step-marker"
        class:step-marker--active={$adminTopicsProgress.phase !== 'complete'}
        class:step-marker--complete={$adminTopicsProgress.phase === 'complete'}
        aria-label={$adminTopicsProgress.phase === 'complete' ? 'Complete' : 'Current step'}
      >
        {#if $adminTopicsProgress.phase === 'complete'}
          {@html IconCheck}
        {:else}
          2
        {/if}
      </div>

      <div class="step-content">
        <h2>Connect data sources</h2>
        <p>Connect your knowledge sources so Stack Internal can surface trusted answers across your AI tools.</p>

        <div class="source-grid">
          {#each sources as source}
            <button
              class="source-card"
              class:selected={source.selected}
              type="button"
              aria-pressed={source.selected ? 'true' : 'false'}
            >
              <span class="source-card__state" class:selected={source.selected}>
                {#if source.selected}
                  {@html IconCheck}
                {/if}
              </span>
              <span class:source-card__stack-icon={source.stack} class:source-card__icon={!source.stack}>
                <img src={source.icon} alt="" />
              </span>
              <span class="source-card__copy">
                <span class="source-card__name">{source.name}</span>
                <span class="source-card__description">{source.description}</span>
              </span>
            </button>
          {/each}
        </div>

        <div
          class="indexing-status"
          class:indexing-status--complete={$adminTopicsProgress.phase === 'complete'}
          role="status"
          aria-live="polite"
        >
          {#if $adminTopicsProgress.phase === 'complete'}
            <span class="indexing-status__complete-icon" aria-hidden="true">
              {@html IconCheck}
            </span>
          {:else}
            <span class="indexing-status__loader" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </span>
          {/if}
          <div class="indexing-status__body">
            <p class="indexing-status__copy">
              {#if $adminTopicsProgress.phase === 'indexing'}
                Syncing in progress and preparing to detect topics.
              {:else if $adminTopicsProgress.phase === 'detecting'}
                Detecting topics from ingested content. <strong>{$adminTopicsProgress.topicsDetected.toLocaleString()}</strong> topics detected.
              {:else if $adminTopicsProgress.phase === 'mapping'}
                Mapping SMEs to topics.
              {:else}
                Topic detection and SME mapping are done.
              {/if}
            </p>

            {#if $adminTopicsProgress.phase === 'detecting'}
              <div class="progress-detail" aria-label="Content scanned for topic detection">
                <div class="progress-detail__header">
                  <span>Content scanned for topics</span>
                  <span>{$adminTopicsProgress.itemsScanned.toLocaleString()} of {$adminTopicsProgress.totalItems.toLocaleString()}</span>
                </div>
                <div
                  class="progress-bar"
                  role="progressbar"
                  aria-valuemin="0"
                  aria-valuemax={$adminTopicsProgress.totalItems}
                  aria-valuenow={$adminTopicsProgress.itemsScanned}
                  aria-label="Content scanned for topics"
                >
                  <span style={`width: ${contentScanPercent}%`}></span>
                </div>
                <div class="progress-detail__meta">
                  <span>{pluralize(contentRemaining, 'item')} remaining</span>
                  <span>{formatTimeEstimate($adminTopicsProgress.phaseRemainingMs)}</span>
                </div>
              </div>
            {:else if $adminTopicsProgress.phase === 'mapping'}
              <div class="progress-detail" aria-label="Topics mapped to SMEs">
                <div class="progress-detail__header">
                  <span>Topics mapped to SMEs</span>
                  <span>{$adminTopicsProgress.mappedTopics.toLocaleString()} of {$adminTopicsProgress.totalTopics.toLocaleString()}</span>
                </div>
                <div
                  class="progress-bar"
                  role="progressbar"
                  aria-valuemin="0"
                  aria-valuemax={$adminTopicsProgress.totalTopics}
                  aria-valuenow={$adminTopicsProgress.mappedTopics}
                  aria-label="Topics mapped to SMEs"
                >
                  <span style={`width: ${topicMappingPercent}%`}></span>
                </div>
                <div class="progress-detail__meta">
                  <span>{pluralize(topicsRemaining, 'topic')} left</span>
                  <span>{formatTimeEstimate($adminTopicsProgress.phaseRemainingMs)}</span>
                </div>
              </div>
            {/if}
          </div>
          <a class="indexing-status__link" href="{base}/admin/topics">
            {$adminTopicsProgress.phase === 'complete' ? 'Review' : 'See progress'}
          </a>
        </div>
      </div>
    </section>

    <section class="step" class:step--active={$adminTopicsProgress.phase === 'complete'}>
      <div
        class="step-marker"
        class:step-marker--active={$adminTopicsProgress.phase === 'complete'}
        aria-label={$adminTopicsProgress.phase === 'complete' ? 'Current step' : undefined}
        aria-hidden={$adminTopicsProgress.phase === 'complete' ? undefined : 'true'}
      >3</div>

      <div class="step-content">
        <h2>Invite your team</h2>
        <p>Invite employees when your workspace is ready, or start with a small pilot group.</p>

        <div class="share-card">
          <div class="share-card__icon" aria-hidden="true">
            {@html IconShare}
          </div>
          <div class="share-card__copy">
            <h3>Share your workspace</h3>
            <p>https://www.stackinternal.com/acme</p>
          </div>
          <button class="soft-button" type="button">Copy link</button>
        </div>
      </div>
    </section>

    <section class="step step--last">
      <div class="step-marker" aria-hidden="true">4</div>

      <div class="step-content">
        <h2>Assign user roles</h2>
        <p>Control who can manage settings, connect sources, and access the workspace.</p>

        <div class="share-card">
          <div class="share-card__icon" aria-hidden="true">
            {@html IconShare}
          </div>
          <div class="share-card__copy">
            <h3>Share your workspace</h3>
            <p>https://www.stackinternal.com/acme</p>
          </div>
          <button class="soft-button" type="button">Copy link</button>
        </div>
      </div>
    </section>
  </div>
</section>

<style>
  .onboarding {
    width: min(100%, 920px);
    color: #201c1d;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  h1,
  h2,
  h3,
  p {
    margin: 0;
  }

  h1 {
    font-size: 30px;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 12px;
  }

  .steps {
    display: flex;
    flex-direction: column;
  }

  .step {
    display: grid;
    grid-template-columns: 41px minmax(0, 1fr);
    position: relative;
  }

  .step:not(.step--last) {
    padding-bottom: 40px;
  }

  .step::after {
    background: #d7d9de;
    bottom: -2px;
    content: "";
    left: 13px;
    position: absolute;
    top: 27px;
    width: 2px;
    z-index: 0;
  }

  .step--complete::after {
    background: #4d7c05;
  }

  .step--last::after {
    display: none;
  }

  .step-marker {
    align-items: center;
    background: #fff;
    border: 2px solid #d7d9de;
    border-radius: 50%;
    color: #8b9098;
    display: flex;
    font-size: 13px;
    font-weight: 700;
    height: 28px;
    justify-content: center;
    line-height: 1;
    position: relative;
    width: 28px;
    z-index: 1;
  }

  .step-marker--complete {
    background: #4d7c05;
    border-color: #4d7c05;
    color: #fff;
  }

  .step-marker--active {
    border-color: #201c1d;
    box-shadow: 0 0 0 3px #f5f4f3;
    color: #201c1d;
  }

  .step-marker :global(svg) {
    height: 16px;
    width: 16px;
  }

  .step-content {
    min-width: 0;
    padding-top: 2px;
  }

  .step-content h2 {
    color: #201c1d;
    font-size: 20px;
    font-weight: 800;
    line-height: 1.15;
    margin-bottom: 7px;
  }

  .step-content > p {
    color: #4b4f58;
    font-size: 15px;
    font-weight: 400;
    line-height: 1.35;
  }

  .status-card,
  .share-card {
    align-items: center;
    border: 2px solid #d7d9de;
    border-radius: 8px;
    display: grid;
    gap: 12px;
    grid-template-columns: 24px minmax(0, 1fr) auto;
    margin-top: 26px;
    min-height: 92px;
    padding: 16px 18px;
  }

  .status-card__icon,
  .share-card__icon {
    align-self: start;
    color: #201c1d;
    display: flex;
    height: 20px;
    justify-content: center;
    margin-top: 3px;
    width: 20px;
  }

  .status-card__icon :global(svg),
  .share-card__icon :global(svg) {
    height: 18px;
    width: 18px;
  }

  .status-card__copy,
  .share-card__copy {
    min-width: 0;
  }

  .status-card h3,
  .share-card h3 {
    color: #201c1d;
    font-size: 18px;
    font-weight: 800;
    line-height: 1.15;
    margin-bottom: 6px;
  }

  .status-card p,
  .share-card p {
    color: #4b4f58;
    font-size: 14px;
    line-height: 1.35;
  }

  .status-card strong {
    color: #41444c;
    font-weight: 800;
  }

  .pill-button,
  .soft-button {
    border: 0;
    border-radius: 999px;
    color: #111;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    font-weight: 800;
    line-height: 1;
    min-height: 42px;
    padding: 0 18px;
    white-space: nowrap;
  }

  .pill-button {
    background: #f5f4f3;
    box-shadow: inset 0 0 0 2px #111, inset 0 0 0 4px #f5f4f3;
    min-width: 120px;
  }

  .soft-button {
    background: #f0efed;
    min-width: 100px;
  }

  .pill-button:hover,
  .soft-button:hover {
    background: #e8e6e3;
  }

  .source-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-top: 26px;
  }

  .source-card {
    background: #fff;
    border: 2px solid #d7d9de;
    border-radius: 8px;
    color: #201c1d;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    font-family: inherit;
    min-height: 168px;
    padding: 14px 16px 16px;
    position: relative;
    text-align: left;
    transition: border-color 0.12s ease, box-shadow 0.12s ease;
  }

  .source-card:hover {
    border-color: #aeb3bd;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }

  .source-card.selected {
    border-color: #ccd0d6;
  }

  .source-card__state {
    align-items: center;
    border: 2px solid #d7d9de;
    border-radius: 50%;
    color: #fff;
    display: flex;
    height: 18px;
    justify-content: center;
    position: absolute;
    right: 16px;
    top: 14px;
    width: 18px;
  }

  .source-card__state.selected {
    background: #4d7c05;
    border-color: #4d7c05;
  }

  .source-card__state :global(svg) {
    height: 12px;
    width: 12px;
  }

  .source-card__stack-icon,
  .source-card__icon {
    align-items: center;
    display: flex;
    height: 28px;
    justify-content: center;
    margin-bottom: 34px;
    width: 28px;
  }

  .source-card__stack-icon {
    background: #f56800;
  }

  .source-card__stack-icon img {
    height: 16px;
    width: 14px;
  }

  .source-card__icon img {
    display: block;
    max-height: 28px;
    max-width: 28px;
  }

  .source-card__copy {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .source-card__name {
    color: #201c1d;
    display: block;
    font-size: 16px;
    font-weight: 800;
    line-height: 1.15;
  }

  .source-card__description {
    color: #4b4f58;
    display: block;
    font-size: 14px;
    line-height: 1.32;
  }

  .indexing-status {
    align-items: start;
    background: #f5f4f3;
    color: #201c1d;
    display: grid;
    gap: 16px;
    grid-template-columns: auto minmax(0, 1fr) auto;
    margin-top: 18px;
    min-height: 46px;
    padding: 10px 18px;
  }

  .indexing-status--complete {
    background: #eef8e9;
    color: #214b05;
  }

  .indexing-status--complete .indexing-status__copy,
  .indexing-status--complete .indexing-status__link,
  .indexing-status--complete .indexing-status__link:visited {
    color: #214b05;
  }

  .indexing-status__complete-icon {
    align-items: center;
    background: #4d7c05;
    border-radius: 50%;
    color: #fff;
    display: inline-flex;
    height: 20px;
    justify-content: center;
    margin-top: 1px;
    width: 20px;
  }

  .indexing-status__complete-icon :global(svg) {
    height: 14px;
    width: 14px;
  }

  .indexing-status__loader {
    align-items: center;
    display: inline-flex;
    gap: 4px;
    height: 20px;
    justify-content: center;
    margin-top: 1px;
    width: 30px;
  }

  .indexing-status__loader span {
    animation: indexing-dot 1.05s ease-in-out infinite;
    background: #111;
    border-radius: 50%;
    display: block;
    height: 5px;
    width: 5px;
  }

  .indexing-status__loader span:nth-child(2) {
    animation-delay: 0.14s;
  }

  .indexing-status__loader span:nth-child(3) {
    animation-delay: 0.28s;
  }

  .indexing-status__body {
    display: grid;
    gap: 9px;
    min-width: 0;
  }

  .indexing-status__copy {
    color: #201c1d;
    font-size: 15px;
    line-height: 1.35;
    min-width: 0;
  }

  .indexing-status__copy strong {
    font-weight: 800;
  }

  .progress-detail {
    display: grid;
    gap: 6px;
    max-width: 520px;
  }

  .progress-detail__header,
  .progress-detail__meta {
    align-items: center;
    display: flex;
    gap: 12px;
    justify-content: space-between;
    min-width: 0;
  }

  .progress-detail__header {
    color: #201c1d;
    font-size: 13px;
    font-weight: 800;
    line-height: 1.25;
  }

  .progress-detail__header span:last-child,
  .progress-detail__meta {
    color: #6a707c;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.25;
  }

  .progress-bar {
    background: #dedcda;
    border-radius: 999px;
    height: 8px;
    overflow: hidden;
    width: 100%;
  }

  .progress-bar span {
    background: #201c1d;
    border-radius: inherit;
    display: block;
    height: 100%;
    transition: width 0.16s linear;
  }

  .indexing-status__link,
  .indexing-status__link:visited {
    color: #201c1d;
    font-size: 15px;
    line-height: 1.35;
    text-decoration: underline;
    text-underline-offset: 2px;
    white-space: nowrap;
  }

  .indexing-status__link:hover {
    color: #000;
  }

  @keyframes indexing-dot {
    0%,
    80%,
    100% {
      opacity: 0.35;
      transform: translateY(0) scale(0.85);
    }

    40% {
      opacity: 1;
      transform: translateY(-2px) scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .indexing-status__loader span {
      animation: none;
      opacity: 1;
      transform: none;
    }

    .progress-bar span {
      transition: none;
    }
  }

  .share-card {
    margin-top: 26px;
  }

  @media (max-width: 1280px) {
    h1 {
      font-size: 28px;
    }

    .step-content h2 {
      font-size: 19px;
    }

    .step-content > p,
    .status-card p,
    .share-card p,
    .source-card__description {
      font-size: 14px;
    }

    .status-card h3,
    .share-card h3,
    .source-card__name {
      font-size: 16px;
    }

    .pill-button,
    .soft-button {
      font-size: 14px;
      min-height: 40px;
    }
  }

  @media (max-width: 980px) {
    .onboarding {
      width: 100%;
    }

    h1 {
      font-size: 28px;
    }

    .step {
      grid-template-columns: 40px minmax(0, 1fr);
    }

    .step:not(.step--last) {
      padding-bottom: 36px;
    }

    .step::after {
      left: 13px;
    }

    .step-marker {
      font-size: 13px;
      height: 28px;
      width: 28px;
    }

    .source-grid {
      grid-template-columns: 1fr;
    }

    .indexing-status {
      grid-template-columns: auto minmax(0, 1fr);
    }

    .indexing-status__link {
      grid-column: 2;
      justify-self: start;
    }

    .progress-detail {
      max-width: none;
    }

    .source-card {
      min-height: 150px;
    }

    .source-card__stack-icon,
    .source-card__icon {
      margin-bottom: 28px;
    }

    .status-card,
    .share-card {
      grid-template-columns: 24px minmax(0, 1fr);
    }

    .pill-button,
    .soft-button {
      grid-column: 1 / -1;
      justify-self: start;
    }
  }

  @media (max-width: 560px) {
    h1 {
      font-size: 27px;
    }

    .step {
      grid-template-columns: 1fr;
    }

    .step::after,
    .step-marker {
      display: none;
    }

    .step-content h2 {
      font-size: 20px;
    }

    .step-content > p,
    .status-card p,
    .share-card p,
    .source-card__description {
      font-size: 15px;
    }

    .status-card,
    .share-card {
      padding: 16px;
    }

    .indexing-status {
      align-items: flex-start;
      gap: 8px 12px;
      padding: 12px 14px;
    }

    .indexing-status__copy,
    .indexing-status__link {
      font-size: 14px;
    }

    .progress-detail__header,
    .progress-detail__meta {
      align-items: flex-start;
      flex-direction: column;
      gap: 3px;
    }
  }
</style>
