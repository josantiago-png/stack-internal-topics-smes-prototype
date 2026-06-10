<script lang="ts">
  import { IconCross, IconServiceSlack, IconServiceJira, IconServiceConfluence, IconServiceGitHub, IconDocument } from '@stackoverflow/stacks-icons/icons';
  import { slide } from 'svelte/transition';
  import SlidePanel from '$lib/components/SlidePanel.svelte';

  type RelatedSource = 'slack' | 'jira' | 'confluence' | 'github' | 'doc';

  const native = (icon: string) => icon.replace('class="svg-icon', 'class="svg-icon native');
  const sourceIcons: Record<RelatedSource, string> = {
    slack: native(IconServiceSlack),
    jira: native(IconServiceJira),
    confluence: native(IconServiceConfluence),
    github: native(IconServiceGitHub),
    doc: IconDocument,
  };

  type InboxItem = {
    id: number;
    person: string;
    initials: string;
    avatarBg: string;
    tag: string;
    text: string;
    time: string;
    read: boolean;
    detail: {
      summary: string;
      why: string;
      related: { label: string; href: string; source: RelatedSource }[];
    };
  };

  let items = $state<InboxItem[]>([
    {
      id: 1,
      person: 'Alex Torres',
      initials: 'AT',
      avatarBg: '#998B7A',
      tag: 'mention',
      text: 'Mentioned you in #platform: "Drew has the most context on the Atlas migration timeline and current schema compatibility."',
      time: '5m ago',
      read: false,
      detail: {
        summary: 'Alex asked in #platform about the Atlas migration timeline and whether the new schema is backward-compatible with existing consumers. You were called out by name as the person with the most context.',
        why: 'The thread has 4 reactions and no response yet. A quick reply would unblock the discussion and position you as the go-to for Atlas migration questions.',
        related: [
          { label: 'Slack thread – #platform', href: '#', source: 'slack' },
          { label: 'Atlas migration plan', href: '#', source: 'confluence' },
          { label: 'Atlas schema changelog', href: '#', source: 'confluence' },
        ],
      },
    },
    {
      id: 2,
      person: 'Mia Chen',
      initials: 'MC',
      avatarBg: '#FF5E00',
      tag: 'reply',
      text: 'Replied to your question about the search infra epic: "Yes, the indexing layer is exactly what overlaps with our discovery scope."',
      time: '42m ago',
      read: false,
      detail: {
        summary: 'Mia confirmed that her unified search discovery work overlaps with the indexing layer your team is refactoring as part of the platform-eng search infra epic.',
        why: "You asked a direct question in the epic thread and Mia's reply creates a concrete action item — the two workstreams need to be coordinated to avoid duplicate infrastructure work.",
        related: [
          { label: 'Search Infra Epic – PLAT-1042', href: '#', source: 'jira' },
          { label: "Mia's discovery doc", href: '#', source: 'confluence' },
          { label: '#platform-eng', href: '#', source: 'slack' },
        ],
      },
    },
    {
      id: 3,
      person: 'Raj Patel',
      initials: 'RP',
      avatarBg: 'var(--purple-400)',
      tag: 'assigned',
      text: 'Assigned you to review the auth-v2 migration guide before the end-of-Q2 cutover deadline on June 30.',
      time: '2h ago',
      read: false,
      detail: {
        summary: 'Raj has assigned you as a reviewer on the auth-v2 migration guide. The legacy auth service (auth-v1) shuts down June 30, and all downstream teams need to validate the guide before that date.',
        why: 'Two services your team owns still reference auth-v1 endpoints. Your review will confirm whether the migration steps cover your specific integration patterns.',
        related: [
          { label: 'Auth v2 migration guide', href: '#', source: 'confluence' },
          { label: 'Deprecation timeline – PLAT-988', href: '#', source: 'jira' },
          { label: '#auth-migration', href: '#', source: 'slack' },
        ],
      },
    },
    {
      id: 4,
      person: 'Jordan Kim',
      initials: 'JK',
      avatarBg: 'var(--blue-400)',
      tag: 'review request',
      text: 'Requested your review on PR #4821: Add rate limiting policy for the API gateway service endpoint.',
      time: '3h ago',
      read: true,
      detail: {
        summary: "Jordan's PR adds a rate limiting policy to the API gateway service endpoint. The AppSec team flagged services without documented rate limiting during their ongoing audit.",
        why: "You're listed as a code owner for the API gateway. Approving or requesting changes on this PR will also address the open AppSec audit item for your team.",
        related: [
          { label: "Jordan's PR – #4821", href: '#', source: 'github' },
          { label: 'AppSec audit tracker', href: '#', source: 'jira' },
          { label: 'Rate limiting policy template', href: '#', source: 'confluence' },
        ],
      },
    },
    {
      id: 5,
      person: 'Dana Kim',
      initials: 'DK',
      avatarBg: '#5a7fa0',
      tag: 'mention',
      text: 'Mentioned you in the AppSec audit tracker as the DRI for the rate limiting policy review and implementation sign-off.',
      time: 'Yesterday',
      read: true,
      detail: {
        summary: "Dana added you as the DRI (Directly Responsible Individual) for the rate limiting policy review in the AppSec audit tracker. This formalizes your ownership of the sign-off process.",
        why: "As DRI you'll be the escalation point if the audit finds gaps. Jordan's open PR (#4821) is the most direct path to closing this item before the audit deadline.",
        related: [
          { label: 'AppSec audit tracker', href: '#', source: 'jira' },
          { label: 'Rate limiting policy template', href: '#', source: 'confluence' },
          { label: "Jordan's PR – #4821", href: '#', source: 'github' },
        ],
      },
    },
    {
      id: 6,
      person: 'SRE Team',
      initials: 'SR',
      avatarBg: '#FF5E00',
      tag: 'announcement',
      text: 'Updated the incident response playbook. On-call escalation paths for Platform Eng have changed — review before your next rotation.',
      time: 'Yesterday',
      read: true,
      detail: {
        summary: "The updated playbook consolidates P1 and P2 escalation paths and introduces a new 'watchdog' rotation for long-tail incidents. Platform Eng's on-call schedule has been updated in PagerDuty.",
        why: "You're scheduled for on-call next week. The escalation contacts and SLO thresholds for your services have changed in this revision — acting on stale information during an incident could delay response.",
        related: [
          { label: 'Incident response playbook v3', href: '#', source: 'confluence' },
          { label: 'PagerDuty schedule', href: '#', source: 'doc' },
          { label: '#sre-announcements', href: '#', source: 'slack' },
        ],
      },
    },
    {
      id: 7,
      person: 'Elena Rodriguez',
      initials: 'ER',
      avatarBg: '#15803d',
      tag: 'reply',
      text: 'Replied to the Atlas-Data-Lake connection thread: "The SSL cert propagation issue should be fully resolved after the Zscaler update."',
      time: '2 days ago',
      read: true,
      detail: {
        summary: 'Elena confirmed the SSL certificate propagation issue blocking the Atlas-Data-Lake connection will be resolved after the Zscaler configuration update rolls out.',
        why: 'Your team had a dependency on this connection being stable before the Atlas migration can complete. Elena\'s reply indicates the blocker is clearing and the migration timeline may be back on track.',
        related: [
          { label: 'Atlas-Data-Lake connection thread', href: '#', source: 'slack' },
          { label: 'Atlas migration plan', href: '#', source: 'confluence' },
          { label: 'Zscaler update – INFRA-311', href: '#', source: 'jira' },
        ],
      },
    },
    {
      id: 8,
      person: 'Kofi Mensah',
      initials: 'KM',
      avatarBg: 'var(--green-500, #16a34a)',
      tag: 'mention',
      text: 'Tagged you in #help-devops thread about Dockerfile templates for Python services using the corporate root CA.',
      time: '2 days ago',
      read: true,
      detail: {
        summary: "Kofi tagged you in a #help-devops thread asking whether there's a standard Dockerfile template for Python services that includes the corporate root CA certificate.",
        why: "You contributed to the internal base image documentation last quarter and were tagged as someone who might have a working example or know where the canonical template lives.",
        related: [
          { label: '#help-devops thread', href: '#', source: 'slack' },
          { label: 'Internal base image docs', href: '#', source: 'confluence' },
        ],
      },
    },
  ]);

  let selectedItem: InboxItem | null = $state(null);
  let panelOpen = $state(false);
  let panelWidth = $state(380);

  let tooltipEl: HTMLDivElement | null = null;
  let tooltipTimer: ReturnType<typeof setTimeout> | null = null;

  function showTooltip(e: MouseEvent, label: string) {
    clearTooltip();
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

  function clearTooltip() {
    if (tooltipTimer) { clearTimeout(tooltipTimer); tooltipTimer = null; }
    if (tooltipEl) { tooltipEl.remove(); tooltipEl = null; }
  }

  function dismiss(id: number, e: MouseEvent) {
    e.stopPropagation();
    items = items.filter(i => i.id !== id);
    if (selectedItem?.id === id) panelOpen = false;
  }

  function openItem(item: InboxItem) {
    items = items.map(i => i.id === item.id ? { ...i, read: true } : i);
    selectedItem = item;
    panelOpen = true;
  }

  function closePanel() {
    panelOpen = false;
  }
</script>

<div class="inbox-page">
  <div class="inbox-content" onclick={panelOpen ? closePanel : undefined}>
    <div class="inbox-inner">
      <div class="inbox-header">
        <h1 class="inbox-title">Inbox</h1>
        <span class="inbox-count">{items.filter(i => !i.read).length} unread</span>
      </div>

      <div class="inbox-list">
        {#each items as item (item.id)}
          <div
            class="inbox-item"
            class:inbox-item--unread={!item.read}
            class:inbox-item--active={selectedItem?.id === item.id && panelOpen}
            out:slide={{ duration: 200 }}
            role="button"
            tabindex="0"
            onclick={(e) => { e.stopPropagation(); openItem(item); }}
            onkeydown={(e) => e.key === 'Enter' && openItem(item)}
          >
            <div class="inbox-top">
              <div class="inbox-person">
                {#if !item.read}
                  <span class="unread-dot" aria-label="Unread"></span>
                {/if}
                <div class="inbox-avatar" style="background:{item.avatarBg}">{item.initials}</div>
                <span class="inbox-name">{item.person}</span>
                <span class="inbox-time">{item.time}</span>
              </div>
              <div class="inbox-meta">
                <button
                  class="inbox-dismiss"
                  onclick={(e) => dismiss(item.id, e)}
                  aria-label="Dismiss"
                  tabindex="-1"
                >
                  {@html IconCross}
                </button>
              </div>
            </div>
            <p class="inbox-text">{item.text}</p>
            <div class="inbox-bottom">
              <span class="s-tag s-tag__xs">{item.tag}</span>
              <div class="inbox-actions" role="toolbar" aria-label="Item actions" onclick={(e) => e.stopPropagation()}>
                <!-- Reply -->
                <button class="inbox-action" aria-label="Reply"
                  onmouseenter={(e) => showTooltip(e, 'Action')} onmouseleave={clearTooltip}>
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                    <path d="M2 9l5-5v3c5 0 8 2 9 7-2-3-4-4-9-4v3L2 9z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
                  </svg>
                </button>
                <!-- Mark read -->
                <button class="inbox-action" aria-label="Mark as read"
                  onclick={(e) => { e.stopPropagation(); items = items.map(i => i.id === item.id ? { ...i, read: true } : i); }}
                  onmouseenter={(e) => showTooltip(e, 'Action')} onmouseleave={clearTooltip}>
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                    <path d="M3 9l4 4 8-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <!-- Share -->
                <button class="inbox-action" aria-label="Share"
                  onmouseenter={(e) => showTooltip(e, 'Action')} onmouseleave={clearTooltip}>
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                    <circle cx="14" cy="3" r="2" stroke="currentColor" stroke-width="1.4"/>
                    <circle cx="14" cy="15" r="2" stroke="currentColor" stroke-width="1.4"/>
                    <circle cx="4" cy="9" r="2" stroke="currentColor" stroke-width="1.4"/>
                    <path d="M6 8l6-4M6 10l6 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <SlidePanel
    open={panelOpen}
    title="Title"
    bind:width={panelWidth}
    onclose={closePanel}
  >
    {#if selectedItem}
      <div class="inbox-panel">
        <div class="inbox-panel-person">
          <div class="inbox-avatar inbox-panel-avatar" style="background:{selectedItem.avatarBg}">{selectedItem.initials}</div>
          <span class="inbox-panel-name">{selectedItem.person}</span>
          <span class="inbox-panel-tag-spacer"></span>
          <span class="s-tag s-tag__xs">{selectedItem.tag}</span>
        </div>

        <p class="inbox-panel-quote">"{selectedItem.text}"</p>
        <span class="inbox-panel-time">{selectedItem.time}</span>

        <div class="inbox-panel-section">
          <h3 class="fs-heading fw-bold" style="margin:0">Summary</h3>
          <p class="inbox-panel-body">{selectedItem.detail.summary}</p>
        </div>

        <div class="inbox-panel-section">
          <h3 class="fs-heading fw-bold" style="margin:0">Why this is relevant to you</h3>
          <p class="inbox-panel-body">{selectedItem.detail.why}</p>
        </div>

        <div class="inbox-panel-section">
          <h3 class="fs-heading fw-bold" style="margin:0">Related</h3>
          <ul class="inbox-panel-links">
            {#each selectedItem.detail.related as link}
              <li class="inbox-panel-link-item">
                <span class="inbox-panel-link-icon">{@html sourceIcons[link.source]}</span>
                <a href={link.href} class="inbox-panel-link">{link.label}</a>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    {/if}
  </SlidePanel>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Flow+Block&display=swap');

  .inbox-page {
    display: flex;
    height: 100%;
    overflow: hidden;
  }

  .inbox-content {
    flex: 1;
    overflow-y: auto;
    min-width: 0;
  }

  .inbox-inner {
    max-width: 760px;
    margin: 0 auto;
    padding: 24px 24px 48px;
  }

  .inbox-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 24px;
  }

  .inbox-title {
    font-size: 28px;
    font-weight: 600;
    color: var(--fc-dark);
    letter-spacing: -0.3px;
    margin: 0;
  }

  .inbox-count {
    font-size: 13px;
    color: var(--fc-light);
  }

  .inbox-list {
    display: flex;
    flex-direction: column;
  }

  .inbox-item {
    position: relative;
    padding: 16px 0;
    border-bottom: 1px solid var(--black-075);
    cursor: pointer;
    outline: none;
    transition: background 0.1s;
    font-family: 'Flow Block', sans-serif;
  }

  .inbox-item:first-child {
    border-top: 1px solid var(--black-075);
  }

  .inbox-item:hover {
    background: var(--black-100);
    margin: 0 -12px;
    padding-left: 12px;
    padding-right: 12px;
    border-radius: 6px;
    border-color: transparent;
  }

  .inbox-item:hover + .inbox-item,
  .inbox-item:first-child:hover {
    border-top-color: transparent;
  }

  .inbox-item--active {
    background: var(--black-025);
    margin: 0 -12px;
    padding-left: 12px;
    padding-right: 12px;
    border-radius: 6px;
    border-color: transparent;
  }

  .inbox-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .inbox-person {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .unread-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--blue-500, #0077cc);
    flex-shrink: 0;
    margin-right: -4px;
  }

  .inbox-avatar {
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .inbox-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--black-400);
  }

  .inbox-time {
    font-size: 12px;
    color: var(--fc-light);
  }

  .inbox-meta {
    display: flex;
    align-items: center;
  }

  .inbox-dismiss {
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

  .inbox-dismiss :global(svg) {
    width: 16px;
    height: 16px;
  }

  .inbox-dismiss:hover {
    background: var(--black-150);
    color: var(--fc-dark);
  }

  .inbox-item:hover .inbox-dismiss {
    display: flex;
  }

  .inbox-text {
    font-size: 14px;
    color: var(--black-400);
    margin: 0 0 10px;
    line-height: 1.5;
  }

  .inbox-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .inbox-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    opacity: 0;
    transition: opacity 0.15s;
  }

  .inbox-item:hover .inbox-actions {
    opacity: 1;
  }

  .inbox-item:hover :global(.s-tag) {
    background-color: var(--black-050) !important;
  }

  .inbox-action {
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

  .inbox-action:hover {
    background: var(--black-150);
    color: var(--fc-dark);
  }

  /* Panel */
  .inbox-panel {
    padding: 0 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    font-family: 'Flow Block', sans-serif;
  }

  .inbox-panel-person {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .inbox-panel-avatar {
    width: 28px;
    height: 28px;
    font-size: 11px;
  }

  .inbox-panel-tag-spacer {
    flex: 1;
  }

  .inbox-panel-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--black-400);
  }

  .inbox-panel-quote {
    font-size: 14px;
    color: var(--black-400);
    line-height: 1.55;
    margin: 0;
    font-style: italic;
    border-left: 3px solid var(--black-150);
    padding-left: 12px;
  }

  .inbox-panel-time {
    font-size: 12px;
    color: var(--fc-light);
    margin-top: -12px;
  }

  .inbox-panel-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .inbox-panel-body {
    font-size: 13px;
    color: var(--black-400);
    line-height: 1.6;
    margin: 0;
  }

  .inbox-panel-links {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .inbox-panel-link-item {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .inbox-panel-link-icon {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    color: var(--fc-light);
  }

  .inbox-panel-link-icon :global(svg) {
    width: 14px;
    height: 14px;
  }

  .inbox-panel-link {
    font-size: 13px;
    color: var(--blue-600, #0077cc);
    text-decoration: none;
  }

  .inbox-panel-link:hover {
    text-decoration: underline;
  }
</style>
