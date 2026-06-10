<script lang="ts">
  import { Avatar, Icon } from '@stackoverflow/stacks-svelte';
  import { IconAssistant, IconHome, IconQandA, IconSettings, IconChart, IconCommunity, IconGlyph, IconInbox, IconLogo } from '@stackoverflow/stacks-icons/icons';
  import { newChatSignal } from '$lib/stores/chat';
  import { selectedDemoId } from '$lib/stores/demo';
  import { base } from '$app/paths';

  interface Props {
    currentPath?: string;
    isDark?: boolean;
    collapsed?: boolean;
    mobileOpen?: boolean;
    onExpand?: () => void;
    onCollapse?: () => void;
    onToggleDark?: () => void;
  }

  let { currentPath = '/', isDark = false, collapsed = false, mobileOpen = false, onExpand, onCollapse, onToggleDark }: Props = $props();

  let milestone = $state<'july' | 'september'>(
    (typeof localStorage !== 'undefined' ? localStorage.getItem('si-milestone') as 'july' | 'september' : null) ?? 'july'
  );

  $effect(() => {
    localStorage.setItem('si-milestone', milestone);
  });

  const isSelected = (path: string) =>
    currentPath === path || currentPath.startsWith(path + '/');

  // Only match / exactly for Chat (not /community etc.)
  const isChatSelected = $derived(currentPath === '/');

  function handleSidebarClick(e: MouseEvent) {
    if (!collapsed) return;
    if (!(e.target as Element).closest('a, button')) {
      onExpand?.();
    }
  }

  // Body-level tooltip to avoid z-index stacking context issues
  let tooltipEl: HTMLDivElement | null = null;
  let tooltipTimer: ReturnType<typeof setTimeout> | null = null;

  function showTooltip(e: MouseEvent, label: string) {
    if (!collapsed) return;
    clearTooltip();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    tooltipTimer = setTimeout(() => {
      tooltipEl = document.createElement('div');
      tooltipEl.textContent = label;
      tooltipEl.style.cssText = [
        'position:fixed',
        'left:62px',
        `top:${rect.top + rect.height / 2}px`,
        'transform:translateY(-50%)',
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
</script>

<aside
  class="app-sidebar d-flex fd-column"
  class:collapsed
  class:mobile-open={mobileOpen}
  onclick={handleSidebarClick}
>
  <!-- Logo -->
  <div class="sidebar-logo d-flex ai-center g4 fl-shrink0">
    {#if collapsed}
      <!-- Collapsed: button shows glyph, on hover shows WindowSideLeft icon -->
      <button class="logo-toggle d-flex ai-center jc-center fl-shrink0 ps-relative" onclick={onExpand} aria-label="Expand sidebar">
        <span class="logo-mark d-flex ai-center jc-center"><Icon src={IconGlyph} class="sidebar-glyph-icon" /></span>
        <span class="logo-toggle-icon d-flex ai-center jc-center fc-black-400">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            <line x1="6" y1="1.5" x2="6" y2="14.5" stroke="currentColor" stroke-width="1.5"/>
            <rect x="2.25" y="2.25" width="3" height="11.5" rx="0.5" fill="currentColor"/>
          </svg>
        </span>
      </button>
    {:else}
      <!-- Expanded: Stack Overflow logo + collapse button -->
      <a href="{base}/" class="logo-link d-flex ai-center td-none fl-grow1 wmn0" aria-label="Stack Overflow home">
        <span class="logo-mark d-flex ai-center fl-shrink0"><Icon src={IconLogo} class="sidebar-logo-icon" /></span>
      </a>
      <button class="sidebar-toggle d-flex ai-center jc-center fl-shrink0 fc-black-400" onclick={onCollapse} aria-label="Collapse sidebar">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
          <line x1="6" y1="1.5" x2="6" y2="14.5" stroke="currentColor" stroke-width="1.5"/>
          <rect x="2.25" y="2.25" width="3" height="11.5" rx="0.5" fill="currentColor"/>
        </svg>
      </button>
    {/if}
  </div>

  <!-- Primary nav -->
  <nav class="sidebar-nav fl-grow1 p8 d-flex fd-column g4" aria-label="Primary">
    {#if milestone === 'september'}
      <a href="{base}/home" class="nav-item d-flex ai-center g8 px8 fc-black-600 td-none ff-sans"
         class:selected={isSelected('/home')}
         onmouseenter={(e) => showTooltip(e, 'Home')} onmouseleave={clearTooltip}>
        <span class="nav-icon d-flex ai-center jc-center fl-shrink0">{@html IconHome}</span>
        <span class="nav-label fl-grow1 wmn0 ws-nowrap" class:hidden={collapsed}>Home</span>
      </a>
      <a href="{base}/inbox" class="nav-item d-flex ai-center g8 px8 fc-black-600 td-none ff-sans"
         class:selected={isSelected('/inbox')}
         onmouseenter={(e) => showTooltip(e, 'Inbox')} onmouseleave={clearTooltip}>
        <span class="nav-icon d-flex ai-center jc-center fl-shrink0">{@html IconInbox}</span>
        <span class="nav-label fl-grow1 wmn0 ws-nowrap" class:hidden={collapsed}>Inbox</span>
      </a>
    {/if}

    <a href="{base}/" class="nav-item d-flex ai-center g8 px8 fc-black-600 td-none ff-sans"
       class:selected={isChatSelected}
       onclick={(e) => { if (isChatSelected) { e.preventDefault(); newChatSignal.update(n => n + 1); } }}
       onmouseenter={(e) => showTooltip(e, 'Chat')} onmouseleave={clearTooltip}>
      <span class="nav-icon d-flex ai-center jc-center fl-shrink0">{@html IconAssistant}</span>
      <span class="nav-label fl-grow1 wmn0 ws-nowrap" class:hidden={collapsed}>Chat</span>
    </a>

    {#if milestone === 'july'}
      <a href="{base}/community/question" class="nav-item d-flex ai-center g8 px8 fc-black-600 td-none ff-sans"
         class:selected={isSelected('/community')}
         onmouseenter={(e) => showTooltip(e, 'Community')} onmouseleave={clearTooltip}>
        <span class="nav-icon d-flex ai-center jc-center fl-shrink0">{@html IconQandA}</span>
        <span class="nav-label fl-grow1 wmn0 ws-nowrap" class:hidden={collapsed}>Community</span>
      </a>
      <a href="{base}/admin" class="nav-item d-flex ai-center g8 px8 fc-black-600 td-none ff-sans"
         class:selected={isSelected('/admin')}
         onmouseenter={(e) => showTooltip(e, 'Control Center')} onmouseleave={clearTooltip}>
        <span class="nav-icon d-flex ai-center jc-center fl-shrink0">{@html IconSettings}</span>
        <span class="nav-label fl-grow1 wmn0 ws-nowrap" class:hidden={collapsed}>Control Center</span>
      </a>
    {/if}


    {#if milestone === 'september'}
      <a href="{base}/scopes" class="nav-item d-flex ai-center g8 px8 fc-black-600 td-none ff-sans"
         class:selected={isSelected('/scopes')}
         onmouseenter={(e) => showTooltip(e, 'Scopes')} onmouseleave={clearTooltip}>
        <span class="nav-icon d-flex ai-center jc-center fl-shrink0">{@html IconCommunity}</span>
        <span class="nav-label fl-grow1 wmn0 ws-nowrap" class:hidden={collapsed}>Scopes</span>
      </a>

      {#if !collapsed}<div class="nav-divider"></div>{/if}
      <a href="{base}/community/question" class="nav-item d-flex ai-center g8 px8 fc-black-600 td-none ff-sans"
         class:selected={isSelected('/community')}
         onmouseenter={(e) => showTooltip(e, 'Community')} onmouseleave={clearTooltip}>
        <span class="nav-icon d-flex ai-center jc-center fl-shrink0">{@html IconQandA}</span>
        <span class="nav-label fl-grow1 wmn0 ws-nowrap" class:hidden={collapsed}>Community</span>
      </a>
    {/if}
  </nav>

  <!-- Bottom section: start, help, user row -->
  {#if true}
    <div class="sidebar-bottom p8 fl-shrink0 d-flex fd-column g4">
    {#if collapsed}
      {#if milestone === 'september'}
        <a href="{base}/analytics" class="nav-item d-flex ai-center jc-center fc-black-600 td-none"
           class:selected={isSelected('/analytics')}
           onmouseenter={(e) => showTooltip(e, 'Analytics')} onmouseleave={clearTooltip}>
          <span class="nav-icon d-flex ai-center jc-center fl-shrink0">{@html IconChart}</span>
        </a>
        <a href="{base}/admin" class="nav-item d-flex ai-center jc-center fc-black-600 td-none"
           class:selected={isSelected('/admin')}
           onmouseenter={(e) => showTooltip(e, 'Control Center')} onmouseleave={clearTooltip}>
          <span class="nav-icon d-flex ai-center jc-center fl-shrink0">{@html IconSettings}</span>
        </a>
      {/if}
      <Avatar
        href="{base}/settings"
        class={`user-avatar-collapsed td-none${isSelected('/settings') ? ' selected' : ''}`}
        name="Lauren Ipsum"
        letter="L"
        size={24}
      />
    {:else}
      {#if milestone === 'september'}
        <a href="{base}/analytics" class="nav-item d-flex ai-center g8 px8 fc-black-600 td-none ff-sans"
           class:selected={isSelected('/analytics')}
           onmouseenter={(e) => showTooltip(e, 'Analytics')} onmouseleave={clearTooltip}>
          <span class="nav-icon d-flex ai-center jc-center fl-shrink0">{@html IconChart}</span>
          <span class="nav-label fl-grow1 wmn0 ws-nowrap">Analytics</span>
        </a>
        <a href="{base}/admin" class="nav-item d-flex ai-center g8 px8 fc-black-600 td-none ff-sans"
           class:selected={isSelected('/admin')}
           onmouseenter={(e) => showTooltip(e, 'Control Center')} onmouseleave={clearTooltip}>
          <span class="nav-icon d-flex ai-center jc-center fl-shrink0">{@html IconSettings}</span>
          <span class="nav-label fl-grow1 wmn0 ws-nowrap">Control Center</span>
        </a>
      {/if}
      <div class="user-divider"></div>

      <a href="{base}/settings" class="user-row d-flex ai-center g12 p8 td-none" class:selected={isSelected('/settings')}>
        <Avatar class="user-avatar fl-shrink0" name="Lauren Ipsum" letter="L" size={32} />
        <div class="user-info wmn0">
          <div class="user-name fc-black-600 ff-sans ws-nowrap">Lauren Ipsum</div>
          <div class="user-org fc-black-400 ff-sans ws-nowrap">Acme</div>
        </div>
        <button class="theme-toggle d-flex ai-center jc-center fl-shrink0 fc-black-400" onclick={(e) => { e.stopPropagation(); e.preventDefault(); onToggleDark?.(); }} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {#if isDark}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          {:else}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M12.95 3.05l-1.06 1.06M4.11 11.89l-1.06 1.06" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          {/if}
        </button>
      </a>
    {/if}
  </div>
  {/if}

  <!-- Milestone switcher -->
  {#if !collapsed && !$selectedDemoId}
    <div class="milestone-switcher px8 pb12 fl-shrink0">
      <div class="seg-control d-flex">
        <button class="seg-btn fl-grow1 ff-sans" class:seg-active={milestone === 'july'} onclick={() => milestone = 'july'}>July</button>
        <button class="seg-btn fl-grow1 ff-sans" class:seg-active={milestone === 'september'} onclick={() => milestone = 'september'}>September</button>
      </div>
    </div>
  {/if}
</aside>

<style>
  /* Structural CSS — only what Stacks atomic classes don't cover */

  .app-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    width: 240px;
    height: 100vh;
    background-color: var(--black-100);
    z-index: 1002;
    overflow: hidden;
    transition: width 0.2s ease;
  }

  .app-sidebar.collapsed {
    width: 52px;
    cursor: w-resize;
    overflow: visible;
  }

  .sidebar-logo {
    padding: 16px;
  }

  .logo-mark {
    color: inherit;
    overflow: hidden;
  }

  .logo-mark :global(.sidebar-logo-icon) {
    width: 132px;
    height: 22px;
  }

  .logo-mark :global(.sidebar-glyph-icon) {
    width: 20px;
    height: 20px;
  }

  .app-sidebar.collapsed .sidebar-logo {
    padding: 16px 0;
    justify-content: center;
  }

  /* Collapse button (expanded mode, right of logo) */
  .sidebar-toggle {
    width: 28px;
    height: 28px;
    border: none;
    background: none;
    border-radius: 6px;
    cursor: w-resize;
    transition: background-color 0.1s;
    transform: translateY(2px);
  }

  .sidebar-toggle:hover {
    background-color: #e8e6e3;
    color: #201c1d;
  }

  /* Collapsed logo button (expand on click) */
  .logo-toggle {
    width: 36px;
    height: 28px;
    border: none;
    background: none;
    color: #201c1d;
    border-radius: 6px;
    cursor: w-resize;
    padding: 0;
    overflow: hidden;
  }

  .logo-toggle:hover {
    background-color: #e8e6e3;
  }

  .logo-toggle .logo-mark,
  .logo-toggle-icon {
    position: absolute;
    transition: opacity 0.1s;
  }

  .logo-toggle-icon {
    opacity: 0;
  }

  .logo-toggle:hover .logo-mark {
    opacity: 0;
  }

  .logo-toggle:hover .logo-toggle-icon {
    opacity: 1;
  }

  /* Nav */
  .sidebar-nav {
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0; /* allows flex child to shrink and scroll rather than overflow parent */
  }

  .app-sidebar.collapsed .sidebar-nav {
    align-items: center;
    padding: 8px 6px;
  }

  .sidebar-bottom,
  .milestone-switcher {
    position: relative;
    z-index: 1; /* sit above nav items (position:relative, no z-index) */
  }

  .app-sidebar.collapsed .sidebar-bottom {
    align-items: center;
    padding: 8px 6px;
  }

  .nav-item {
    height: 42px;
    flex-shrink: 0; /* prevent flex column from compressing item height */
    border-radius: 10px;
    font-size: 14px;
    transition: background-color 0.1s;
    cursor: pointer;
    position: relative;
  }

  .app-sidebar.collapsed .nav-item {
    width: 40px;
    justify-content: center;
    padding: 0;
  }

  .nav-item:link,
  .nav-item:visited {
    color: #201c1d;
  }

  .nav-item:hover {
    background-color: #e8e6e3;
  }

  .nav-item.selected {
    background-color: #e8e6e3;
    font-weight: 600;
  }

  .nav-icon {
    width: 20px;
    height: 20px;
    color: #201c1d;
  }

  .nav-label.hidden {
    display: none;
  }

  .nav-label {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Dividers */
  .nav-section-label {
    flex-shrink: 0;
  }

  .nav-divider {
    height: 1px;
    flex-shrink: 0;
    background-color: var(--black-200);
    margin: 12px 8px;
  }

  .user-divider {
    height: 1px;
    background-color: var(--black-200);
    margin: 8px 0 12px;
  }

  /* User row */
  .user-row {
    padding-bottom: 16px !important;
  }

  .user-avatar-collapsed {
    overflow: hidden;
    line-height: 0;
    margin-top: 4px;
    padding-bottom: 28px;
  }

  :global(.user-avatar),
  :global(.user-avatar-collapsed) {
    --_av-bg: #e87529;
  }

  .letter-avatar {
    width: 24px;
    height: 24px;
    border-radius: 1px;
    background: #e87529;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: 0.02em;
  }

  .user-name {
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-org {
    font-size: 12px;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .theme-toggle {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: none;
    background: none;
    cursor: pointer;
    margin-left: auto;
  }

  .theme-toggle:hover {
    background: #e8e6e3;
    color: #201c1d;
  }

  /* Dark mode overrides */
  :global(.app-shell.dark) .sidebar-toggle {
    color: #9a9a9a;
  }
  :global(.app-shell.dark) .sidebar-toggle:hover {
    background-color: #2a2a2a;
    color: #e3e3e3;
  }
  :global(.app-shell.dark) .logo-toggle {
    color: #e3e3e3;
  }
  :global(.app-shell.dark) .logo-toggle:hover {
    background-color: #2a2a2a;
  }
  :global(.app-shell.dark) .logo-toggle-icon {
    color: #9a9a9a;
  }
  .logo-link,
  .logo-link:visited {
    color: #201c1d !important;
  }

  :global(.app-shell.dark) .logo-link,
  :global(.app-shell.dark) .logo-link:visited {
    color: #e3e3e3 !important;
  }
  :global(.app-shell.community) .app-sidebar {
    background-color: var(--black-050);
    border-right: 1px solid var(--black-200);
  }
  :global(.app-shell.dark) .app-sidebar {
    background-color: #171717 !important;
  }
  :global(.app-shell.dark) .nav-item,
  :global(.app-shell.dark) .nav-item:link,
  :global(.app-shell.dark) .nav-item:visited {
    color: #e3e3e3;
  }
  :global(.app-shell.dark) .nav-item:hover {
    background-color: #2a2a2a;
  }
  :global(.app-shell.dark) .nav-item.selected {
    background-color: #2d2d2d;
  }
  :global(.app-shell.dark) .nav-icon,
  :global(.app-shell.dark) .nav-section-label {
    color: #9a9a9a;
  }
  :global(.app-shell.dark) .nav-divider,
  :global(.app-shell.dark) .user-divider {
    background-color: #333;
  }
  :global(.app-shell.dark) .user-name {
    color: #e3e3e3;
  }
  :global(.app-shell.dark) .user-org {
    color: #9a9a9a;
  }
  :global(.app-shell.dark) .theme-toggle {
    color: #9a9a9a;
  }
  :global(.app-shell.dark) .theme-toggle:hover {
    background: #2a2a2a;
    color: #e3e3e3;
  }

  /* Milestone segmented control */
  .seg-control {
    background: var(--black-150); /* matches selected nav item bg */
    border-radius: 8px;
    padding: 3px;
    gap: 2px;
  }

  .seg-btn {
    height: 28px;
    border: none;
    background: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    color: var(--black-400);
    transition: background-color 0.15s, color 0.15s;
  }

  .seg-btn.seg-active {
    background: var(--black-050);
    color: var(--black-600);
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  :global(.app-shell.dark) .seg-control {
    background: #2d2d2d; /* matches dark mode selected nav item */
  }

  :global(.app-shell.dark) .seg-btn {
    color: #9a9a9a;
  }

  :global(.app-shell.dark) .seg-btn.seg-active {
    background: #3c3c3c;
    color: #e3e3e3;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }


  @media (max-width: 767px) {
    /* Slide off-screen; delay visibility so it hides after the slide-out finishes */
    .app-sidebar {
      transform: translateX(-100%);
      visibility: hidden;
      pointer-events: none;
      transition: transform 0.25s ease, visibility 0s linear 0.25s !important;
    }

    /* Slide in: make visible immediately, then animate position */
    .app-sidebar.mobile-open {
      transform: translateX(0);
      visibility: visible;
      pointer-events: auto;
      width: 240px;
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.18);
      transition: transform 0.25s ease, visibility 0s linear 0s !important;
    }
  }
</style>
