<script lang="ts">
  import { IconGlyph, IconServiceSlack, IconServiceJira, IconServiceConfluence, IconServiceGitHub, IconDocument, IconAssistant, IconPlus, IconQuestion, IconUser, IconStackBoxes, IconCross } from '@stackoverflow/stacks-icons/icons';

  type RelatedSource = 'slack' | 'jira' | 'confluence' | 'github' | 'doc';
  const native = (icon: string) => icon.replace('class="svg-icon', 'class="svg-icon native');
  const sourceIcons: Record<RelatedSource, string> = {
    slack: native(IconServiceSlack),
    jira: native(IconServiceJira),
    confluence: native(IconServiceConfluence),
    github: native(IconServiceGitHub),
    doc: IconDocument,
  };
  import SlidePanel from '$lib/components/SlidePanel.svelte';
  import { slide, fade } from 'svelte/transition';
  import { goto } from '$app/navigation';

  let insightFeedback = $state<Record<number, 'up' | 'down'>>({});
  let homeInputValue = $state('');

  function submitToChat(text: string) {
    if (!text.trim()) return;
    goto('/?q=' + encodeURIComponent(text.trim()));
  }

  let tooltipEl: HTMLDivElement | null = null;
  let tooltipTimer: ReturnType<typeof setTimeout> | null = null;

  function showActionTooltip(e: MouseEvent, label: string) {
    clearActionTooltip();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    tooltipTimer = setTimeout(() => {
      tooltipEl = document.createElement('div');
      tooltipEl.textContent = label;
      tooltipEl.style.cssText = [
        'position:fixed',
        `left:${rect.left + rect.width / 2}px`,
        `top:${rect.bottom + 6}px`,
        'transform:translateX(-50%)',
        'background:#3c3f44',
        'color:#fff',
        'font-size:12px',
        "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
        'white-space:nowrap',
        'padding:5px 8px',
        'border-radius:5px',
        'pointer-events:none',
        'z-index:9999',
      ].join(';');
      document.body.appendChild(tooltipEl);
    }, 300);
  }

  function clearActionTooltip() {
    if (tooltipTimer) { clearTimeout(tooltipTimer); tooltipTimer = null; }
    if (tooltipEl) { tooltipEl.remove(); tooltipEl = null; }
  }

  const slackIcon = IconServiceSlack.replace('class="svg-icon', 'class="svg-icon native');

  type Insight = {
    id: number;
    person: string;
    initials: string;
    avatarBg: string;
    tag: string;
    tagBg: string;
    tagFc: string;
    text: string;
    time: string;
    detail: {
      summary: string;
      why: string;
      related: { label: string; href: string; source: RelatedSource }[];
    };
  };

  let insights: Insight[] = $state([
    {
      id: 1,
      person: 'Mia Chen',
      initials: 'MC',
      avatarBg: '#FF5E00',
      tag: 'discovery',
      tagBg: '#eff6ff',
      tagFc: '#1d4ed8',
      text: "Running discovery on unified search UX — may overlap with the search infra work you're contributing to in #platform-eng.",
      time: '2h ago',
      detail: {
        summary: "Mia is scoping a unified search experience across Stack Internal, Slack, and the internal wiki. Her discovery work touches the same indexing layer your team is refactoring.",
        why: "You're listed as a contributor on the platform-eng search infra epic. Mia's work may create overlapping requirements or a chance to share infrastructure.",
        related: [
          { label: 'Search Infra Epic – PLAT-1042', href: '#', source: 'jira' },
          { label: "Mia's discovery doc", href: '#', source: 'confluence' },
          { label: '#platform-eng', href: '#', source: 'slack' },
        ],
      },
    },
    {
      id: 2,
      person: 'Raj Patel',
      initials: 'RP',
      avatarBg: 'var(--purple-400)',
      tag: 'decision',
      tagBg: '#fff7ed',
      tagFc: '#c2410c',
      text: "Platform team decided to deprecate the legacy auth service by end of Q2. Downstream teams should audit their dependencies before the cutover.",
      time: '4h ago',
      detail: {
        summary: "The legacy auth service (auth-v1) will be shut down by June 30. The platform team has published a migration guide to auth-v2, which supports OAuth 2.0 and service account tokens.",
        why: "Two services in your team's ownership still reference auth-v1 endpoints. You'll need to migrate before the Q2 cutover to avoid an outage.",
        related: [
          { label: 'Auth v2 migration guide', href: '#', source: 'confluence' },
          { label: 'Deprecation timeline – PLAT-988', href: '#', source: 'jira' },
          { label: '#auth-migration', href: '#', source: 'slack' },
        ],
      },
    },
    {
      id: 3,
      person: 'Dana Kim',
      initials: 'DK',
      avatarBg: 'var(--blue-400)',
      tag: 'heads-up',
      tagBg: '#fefce8',
      tagFc: '#a16207',
      text: "Security is auditing API rate limiting policies after a third-party report. Jordan's PR in #engineering may be relevant to your service.",
      time: 'Yesterday',
      detail: {
        summary: "Following an external security report, the AppSec team is reviewing all services that expose public-facing APIs. Services without explicit rate limiting policies will be flagged.",
        why: "Your team's API gateway doesn't have a rate limiting policy documented in the service registry. Jordan's open PR adds one — you may want to coordinate.",
        related: [
          { label: "Jordan's PR – #4821", href: '#', source: 'github' },
          { label: 'AppSec audit tracker', href: '#', source: 'jira' },
          { label: 'Rate limiting policy template', href: '#', source: 'confluence' },
        ],
      },
    },
    {
      id: 4,
      person: 'Alex Torres',
      initials: 'AT',
      avatarBg: '#998B7A',
      tag: 'question',
      tagBg: '#f5f3ff',
      tagFc: '#6d28d9',
      text: "Asked about the Atlas migration timeline in #platform — you were mentioned as someone who knows the current state.",
      time: 'Yesterday',
      detail: {
        summary: "Alex asked in #platform about when the Atlas data migration is expected to complete, and whether the new schema is backward-compatible with existing consumers.",
        why: "You were mentioned by name in the thread as someone with context on the migration. The question has 4 reactions and no answer yet.",
        related: [
          { label: 'Slack thread – #platform', href: '#', source: 'slack' },
          { label: 'Atlas migration plan', href: '#', source: 'confluence' },
          { label: 'Atlas schema changelog', href: '#', source: 'confluence' },
        ],
      },
    },
    {
      id: 5,
      person: 'SRE Team',
      initials: 'SR',
      avatarBg: '#FF5E00',
      tag: 'announcement',
      tagBg: '#f0fdf4',
      tagFc: '#15803d',
      text: "SRE published an updated incident response playbook. On-call escalation paths for Platform Eng have changed — review before your next rotation.",
      time: '2 days ago',
      detail: {
        summary: "The updated playbook consolidates the P1 and P2 escalation paths and introduces a new 'watchdog' rotation for catching long-tail incidents. Platform Eng's on-call schedule has been updated in PagerDuty.",
        why: "You're scheduled for on-call next week. The escalation contacts and SLO thresholds for your services have changed in this revision.",
        related: [
          { label: 'Incident response playbook v3', href: '#', source: 'confluence' },
          { label: 'PagerDuty schedule', href: '#', source: 'doc' },
          { label: '#sre-announcements', href: '#', source: 'slack' },
        ],
      },
    },
  ]);

  let selectedInsight: Insight | null = $state(null);
  let panelOpen = $state(false);
  let panelWidth = $state(380);
  let activeTab: 'insights' | 'recent' = $state('insights');

  type RecentChat = { id: number; title: string; preview: string; time: string };
  const recentChats: RecentChat[] = [
    { id: 1, title: 'Atlas migration timeline', preview: "Can you summarize the current state of the Atlas migration and what's still outstanding?", time: '1h ago' },
    { id: 2, title: 'What changed in auth-v2?', preview: 'Walk me through the key differences between auth-v1 and auth-v2 endpoints.', time: '3h ago' },
    { id: 3, title: 'Platform Eng sprint summary', preview: "Here's a summary of what shipped in sprint 42 across the platform engineering team.", time: 'Yesterday' },
    { id: 4, title: 'Who owns the rate limiter?', preview: 'Based on the service registry, the rate limiter is owned by the API gateway team.', time: 'Yesterday' },
    { id: 5, title: 'Catch me up on the week', preview: "Here's what happened across Acme this week — decisions made, things shipped, and threads worth reading.", time: '2 days ago' },
  ];

  function openInsight(insight: Insight) {
    selectedInsight = insight;
    panelOpen = true;
  }

  function closePanel() {
    panelOpen = false;
  }

  function dismiss(id: number, e: MouseEvent) {
    e.stopPropagation();
    insights = insights.filter(i => i.id !== id);
    if (selectedInsight?.id === id) panelOpen = false;
  }
</script>

<div class="home-page">
  <div class="home-content" onclick={panelOpen ? closePanel : undefined}>
    <div class="home-header">
      <div class="footer-inner">
        <div class="home-title-row">
          <h1 class="home-title">What's on your mind, Lauren?</h1>
          <div class="source-meta">
            <span class="source-icons" aria-label="Connected sources">
              <span class="source-icon-box">{@html IconGlyph}</span>
              <span class="source-icon">{@html slackIcon}</span>
              <span class="source-icon">{@html IconDocument}</span>
            </span>
            <span class="source-count">86 sources</span>
            <button class="source-chevron" aria-label="View sources">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M4 2l4 4-4 4" stroke="#6b6d73" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="input-bar">
          <button class="input-attach" aria-label="New chat">{@html IconPlus}</button>
          <input class="input-field" type="text" placeholder="Ask anything about Acme..."
            bind:value={homeInputValue}
            onkeydown={(e) => { if (e.key === 'Enter') submitToChat(homeInputValue); }}
          />
          {#if homeInputValue.trim()}
            <button class="send-btn" aria-label="Send" onclick={() => submitToChat(homeInputValue)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 13V3M3 8l5-5 5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          {/if}
        </div>

        <div class="cue-pills">
          <button class="cue-pill" onclick={() => submitToChat('Ask a question')}>
            <span class="cue-icon cue-icon--orange">{@html IconQuestion}</span>
            Ask a question
          </button>
          <button class="cue-pill" onclick={() => submitToChat('Find an expert')}>
            <span class="cue-icon cue-icon--blue">{@html IconUser}</span>
            Find an expert
          </button>
          <button class="cue-pill" onclick={() => submitToChat('Explore a topic')}>
            <span class="cue-icon cue-icon--muted">{@html IconStackBoxes}</span>
            Explore a topic
          </button>
        </div>
      </div>
    </div>

    <!-- Insights / Recent section -->
    <div class="insights-section">
      <div class="footer-inner">
        <div class="section-tabs">
          <nav aria-label="Section tabs">
            <ul class="s-navigation">
              <li>
                <button
                  class="s-navigation--item"
                  class:is-selected={activeTab === 'insights'}
                  onclick={() => activeTab = 'insights'}
                >
                  <span class="s-navigation--item-text" data-text="Insights">Insights</span>
                </button>
              </li>
              <li>
                <button
                  class="s-navigation--item"
                  class:is-selected={activeTab === 'recent'}
                  onclick={() => activeTab = 'recent'}
                >
                  <span class="s-navigation--item-text" data-text="Recent">Recent</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {#key activeTab}
        <div in:fade={{ duration: 150 }}>
        {#if activeTab === 'insights'}
        <div class="insights-list">
          {#each insights as insight (insight.id)}
            <div
              class="insight-item"
              class:insight-item--active={selectedInsight?.id === insight.id && panelOpen}
              role="button"
              tabindex="0"
              out:slide={{ duration: 200 }}
              onclick={(e) => { e.stopPropagation(); openInsight(insight); }}
              onkeydown={(e) => e.key === 'Enter' && openInsight(insight)}
              aria-label="View insight from {insight.person}"
            >
              <div class="insight-top">
                <div class="insight-person">
                  <div class="insight-avatar" style="background:{insight.avatarBg}">{insight.initials}</div>
                  <span class="insight-name">{insight.person}</span>
                  <span class="insight-time">{insight.time}</span>
                </div>
                <div class="insight-meta">
                  <button
                    class="insight-dismiss"
                    onclick={(e) => dismiss(insight.id, e)}
                    aria-label="Dismiss insight"
                    tabindex="-1"
                  >
                    {@html IconCross}
                  </button>
                </div>
              </div>
              <p class="insight-text">{insight.text}</p>
              <div class="insight-bottom">
                <span class="s-tag s-tag__xs">{insight.tag}</span>
                <div class="insight-actions" role="toolbar" aria-label="Insight actions" onclick={(e) => e.stopPropagation()}>
                  <button class="insight-action" class:feedback-active={insightFeedback[insight.id] === 'up'} aria-label="This is helpful"
                    onclick={() => { insightFeedback[insight.id] = insightFeedback[insight.id] === 'up' ? undefined as any : 'up'; }}
                    onmouseenter={(e) => showActionTooltip(e, 'This is helpful')} onmouseleave={clearActionTooltip}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                    </svg>
                  </button>
                  <button class="insight-action" class:feedback-active={insightFeedback[insight.id] === 'down'} aria-label="This is not helpful"
                    onclick={() => { insightFeedback[insight.id] = insightFeedback[insight.id] === 'down' ? undefined as any : 'down'; }}
                    onmouseenter={(e) => showActionTooltip(e, 'This is not helpful')} onmouseleave={clearActionTooltip}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
                      <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                    </svg>
                  </button>
                  <button class="insight-action" aria-label="Share"
                    onmouseenter={(e) => showActionTooltip(e, 'Share')} onmouseleave={clearActionTooltip}>
                    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                      <circle cx="14" cy="3" r="2" stroke="currentColor" stroke-width="1.4"/>
                      <circle cx="14" cy="15" r="2" stroke="currentColor" stroke-width="1.4"/>
                      <circle cx="4" cy="9" r="2" stroke="currentColor" stroke-width="1.4"/>
                      <path d="M6 8l6-4M6 10l6 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                    </svg>
                  </button>
                  <button class="insight-action" aria-label="Copy"
                    onmouseenter={(e) => showActionTooltip(e, 'Copy')} onmouseleave={clearActionTooltip}>
                    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                      <rect x="6" y="6" width="9" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
                      <path d="M4 12H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
        {:else}
        <div class="recent-list">
          {#each recentChats as chat (chat.id)}
            <a href="#" class="recent-item">
              <div class="recent-item-main">
                <div class="recent-item-header">
                  <span class="recent-item-title">{chat.title}</span>
                  <span class="recent-item-time">{chat.time}</span>
                </div>
                <span class="recent-item-preview">{chat.preview}</span>
              </div>
            </a>
          {/each}
        </div>
        {/if}
        </div>
        {/key}
      </div>
    </div>
  </div>

  <SlidePanel
    open={panelOpen}
    title="Insight"
    bind:width={panelWidth}
    onclose={closePanel}
  >
    {#if selectedInsight}
      <div class="insight-panel">
        <div class="insight-panel-person">
          <div class="insight-avatar" style="background:{selectedInsight.avatarBg}">{selectedInsight.initials}</div>
          <span class="insight-panel-name">{selectedInsight.person}</span>
          <span class="insight-panel-tag-spacer"></span>
          <span class="s-tag s-tag__xs">{selectedInsight.tag}</span>
        </div>

        <p class="insight-panel-quote">"{selectedInsight.text}"</p>
        <span class="insight-panel-time">{selectedInsight.time}</span>

        <div class="insight-panel-section">
          <h3 class="fs-heading fw-bold" style="margin:0">Summary</h3>
          <p class="insight-panel-body">{selectedInsight.detail.summary}</p>
        </div>

        <div class="insight-panel-section">
          <h3 class="fs-heading fw-bold" style="margin:0">Why this is relevant to you</h3>
          <p class="insight-panel-body">{selectedInsight.detail.why}</p>
        </div>

        <div class="insight-panel-section">
          <h3 class="fs-heading fw-bold" style="margin:0">Related</h3>
          <ul class="insight-panel-links">
            {#each selectedInsight.detail.related as link}
              <li class="insight-panel-link-item">
                <span class="insight-panel-link-icon">{@html sourceIcons[link.source]}</span>
                <a href={link.href} class="insight-panel-link">{link.label}</a>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    {/if}
  </SlidePanel>
</div>


<style>
  .home-page {
    display: flex;
    height: 100%;
    overflow: hidden;
  }

  .home-content {
    flex: 1;
    overflow-y: auto;
    min-width: 0;
  }

  .home-header {
    padding: 24px 0 0;
  }

  .footer-inner {
    max-width: 760px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .home-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .home-title {
    font-size: 28px;
    font-weight: 600;
    color: var(--fc-dark);
    letter-spacing: -0.3px;
    margin: 0;
  }

  .source-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 12px;
  }

  .source-icons {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .source-icon-box {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    background-color: #ff5e00;
    color: #fff;
    flex-shrink: 0;
  }

  .source-icon-box :global(svg) {
    width: 12px;
    height: 12px;
  }

  .source-icon {
    display: inline-flex;
    align-items: center;
    color: #6b6d73;
  }

  .source-icon :global(svg) {
    width: 18px;
    height: 18px;
  }

  .source-count {
    font-size: 13px;
    color: #6b6d73;
  }

  .source-chevron {
    background: none;
    border: none;
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 2px;
  }

  .input-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 8px;
    background: #f7f6f5;
    border: none;
    border-radius: 10px;
    margin-top: 0;
  }

  .input-attach {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 20px;
    border: none;
    background: none;
    cursor: pointer;
    flex-shrink: 0;
    color: #6b6d73;
  }

  .input-attach:hover { color: #201c1d; }

  .send-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: #201c1d;
    color: #fff;
    cursor: pointer;
    flex-shrink: 0;
  }

  .input-field {
    flex: 1;
    font-size: 16px;
    color: #201c1d;
    background: transparent;
    border: none;
    outline: none;
    font-family: inherit;
  }

  .input-field::placeholder { color: #46484d; }

  .cue-pills {
    display: flex;
    gap: 12px;
    margin-top: 12px;
  }

  .cue-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: #fff;
    border: 1px solid #dee0e3;
    border-radius: 10px;
    flex: 1;
    color: #201c1d;
    font-size: 14px;
    cursor: pointer;
    font-family: inherit;
    transition: background-color 0.1s;
  }

  .cue-pill:hover { background: #f7f6f5; }

  .cue-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .cue-icon :global(svg) {
    width: 18px;
    height: 18px;
  }

  .cue-icon--orange { color: #FF5E00; }
  .cue-icon--blue   { color: #0077cc; }
  .cue-icon--muted  { color: #998B7A; }

  /* Insights */
  .insights-section {
    padding: 24px 0 48px;
  }

  .section-tabs {
    margin-bottom: 16px;
  }

  .section-tabs button.s-navigation--item {
    border: none;
    cursor: pointer;
    background: transparent;
  }

  .recent-list {
    border-top: 1px solid var(--black-075);
  }

  .recent-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 14px 0;
    border-bottom: 1px solid var(--black-075);
    cursor: pointer;
    transition: background 0.1s;
    text-decoration: none;
  }

  .recent-item:hover {
    background: var(--black-100);
    margin: 0 -12px;
    padding-left: 12px;
    padding-right: 12px;
    border-color: transparent;
  }

  .recent-item:hover + .recent-item {
    border-top-color: transparent;
  }

  .recent-item-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    color: var(--black-600);
    margin-top: 1px;
  }

  .recent-item-icon :global(svg) {
    width: 32px;
    height: 32px;
  }

  .recent-item-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .recent-item-header {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .recent-item-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--fc-dark);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .recent-item-preview {
    font-size: 13px;
    color: var(--fc-light);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .recent-item-time {
    font-size: 12px;
    color: var(--fc-light);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .insights-list {
    display: flex;
    flex-direction: column;
  }

  .insight-item {
    position: relative;
    padding: 16px 0;
    border-bottom: 1px solid var(--black-075);
    cursor: pointer;
    outline: none;
    transition: background 0.1s;
  }

  .insight-item:first-child {
    border-top: 1px solid var(--black-075);
  }

  .insight-item:hover {
    background: var(--black-100);
    margin: 0 -12px;
    padding-left: 12px;
    padding-right: 12px;
    border-radius: 6px;
    border-color: transparent;
  }

  .insight-item:hover + .insight-item,
  .insight-item:first-child:hover {
    border-top-color: transparent;
  }

  .insight-item--active {
    background: var(--black-025);
    margin: 0 -12px;
    padding-left: 12px;
    padding-right: 12px;
    border-radius: 6px;
    border-color: transparent;
  }

  .insight-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .insight-person {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .insight-avatar {
    width: 24px;
    height: 24px;
    border-radius: 1px;
    color: #fff;
    font-size: 10px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    letter-spacing: 0.02em;
  }

  .insight-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--fc-dark);
  }

  .insight-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .insight-dismiss {
    display: none;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border: none;
    background: none;
    border-radius: 6px;
    cursor: pointer;
    color: var(--fc-light);
    padding: 0;
  }

  .insight-dismiss :global(svg) {
    width: 16px;
    height: 16px;
  }

  .insight-dismiss:hover {
    background: var(--black-150);
    color: var(--fc-dark);
  }

  .insight-item:hover .insight-dismiss {
    display: flex;
  }

  .insight-text {
    font-size: 14px;
    color: var(--fc-dark);
    margin: 0 0 10px;
    line-height: 1.5;
  }

  .insight-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .insight-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    opacity: 0;
    transition: opacity 0.15s;
  }

  .insight-item:hover .insight-actions {
    opacity: 1;
  }

  .insight-item:hover :global(.s-tag) {
    background-color: var(--black-050) !important;
  }

  .insight-action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 6px;
    color: var(--fc-light);
    padding: 0;
  }

  .insight-action:hover {
    background: var(--black-150);
    color: var(--fc-dark);
  }

  .insight-action.feedback-active svg {
    fill: var(--black-200);
    stroke: var(--fc-dark);
  }

  .insight-time {
    font-size: 12px;
    color: var(--fc-light);
  }

  /* Insight panel */
  .insight-panel-person {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .insight-panel-tag-spacer {
    flex: 1;
  }

  .insight-panel-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--fc-dark);
  }

  .insight-panel {
    padding: 0 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .insight-panel-quote {
    font-size: 14px;
    color: var(--fc-dark);
    line-height: 1.55;
    margin: 0;
    font-style: italic;
    border-left: 3px solid var(--black-150);
    padding-left: 12px;
  }

  .insight-panel-time {
    font-size: 12px;
    color: var(--fc-light);
    margin-top: -12px;
  }

  .insight-panel-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }


  .insight-panel-body {
    font-size: 13px;
    color: var(--fc-dark);
    line-height: 1.6;
    margin: 0;
  }

  .insight-panel-links {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .insight-panel-link-item {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .insight-panel-link-icon {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    color: var(--fc-light);
  }

  .insight-panel-link-icon :global(svg) {
    width: 14px;
    height: 14px;
  }

  .insight-panel-link {
    font-size: 13px;
    color: var(--blue-600, #0077cc);
    text-decoration: none;
  }

  .insight-panel-link:hover {
    text-decoration: underline;
  }

  /* Dark mode */

  :global(.app-shell.dark) .insight-avatar { color: #201c1d; }

  :global(.app-shell.dark) .source-count,
  :global(.app-shell.dark) .source-chevron svg path { color: #a0a0a0; stroke: #a0a0a0; }
  :global(.app-shell.dark) .source-icon { color: #a0a0a0; }

  :global(.app-shell.dark) .input-bar { background: #2a2a2a; }
  :global(.app-shell.dark) .input-field { color: #e3e3e3; }
  :global(.app-shell.dark) .input-field::placeholder { color: #6b6d73; }

  :global(.app-shell.dark) .cue-pill {
    background: #2a2a2a;
    border-color: #333;
    color: #e3e3e3;
  }

  :global(.app-shell.dark) .cue-pill:hover { background: #333; }
</style>
