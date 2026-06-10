<script lang="ts">
  import '@stackoverflow/stacks/dist/css/stacks.min.css';
  import { page } from '$app/state';
  import { untrack } from 'svelte';
  import type { Snippet } from 'svelte';
  import { base } from '$app/paths';
  import { fade } from 'svelte/transition';
  import { IconLogo } from '@stackoverflow/stacks-icons/icons';
  import Sidebar from '$lib/components/Sidebar.svelte';

  let { children }: { children: Snippet } = $props();

  const normalizePath = (pathname: string) =>
    base && pathname.startsWith(base)
      ? pathname.slice(base.length) || '/'
      : pathname;

  const currentPath = $derived(normalizePath(page.url.pathname));
  const isCommunity = $derived(currentPath.startsWith('/community'));
  const isAdmin = $derived(currentPath.startsWith('/admin'));
  const isAnalytics = $derived(currentPath.startsWith('/analytics'));
  let isDark = $state(false);
  let sidebarCollapsed = $state(
    ['/community', '/admin', '/analytics'].some((path) =>
      normalizePath(page.url.pathname).startsWith(path)
    )
  );
  let collapsedByCommunity = $state(false);
  let mobileNavOpen = $state(false);

  // Auto-collapse at tablet breakpoint (768–1023px)
  $effect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const handler = (e: MediaQueryListEvent) => { sidebarCollapsed = e.matches; };
    sidebarCollapsed = mq.matches;
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  });

  // Collapse on community/admin routes; re-expand when leaving if we were the ones who collapsed it.
  $effect(() => {
    if (isCommunity || isAdmin || isAnalytics) {
      untrack(() => {
        if (!sidebarCollapsed) {
          collapsedByCommunity = true;
          sidebarCollapsed = true;
        }
      });
    } else {
      untrack(() => {
        if (collapsedByCommunity) {
          collapsedByCommunity = false;
          sidebarCollapsed = false;
        }
      });
    }
  });

  // Close mobile nav on any route change
  $effect(() => {
    void page.route.id;
    untrack(() => { mobileNavOpen = false; });
  });

  const collapsed = $derived(sidebarCollapsed);

  $effect(() => {
    if (isDark) {
      document.body.classList.add('theme-dark');
      document.body.classList.remove('theme-light');
    } else {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
    }
  });
</script>

<svelte:head>
  <title>Stack Internal</title>
</svelte:head>

<div
  class="app-shell"
  class:dark={isDark}
  class:community={isCommunity}
  class:admin={isAdmin}
  style="--stack-sidebar-width: {collapsed ? '52px' : '240px'}"
>
  <Sidebar
    {currentPath}
    {isDark}
    collapsed={mobileNavOpen ? false : collapsed}
    mobileOpen={mobileNavOpen}
    onExpand={() => sidebarCollapsed = false}
    onCollapse={() => { if (mobileNavOpen) { mobileNavOpen = false; } else { sidebarCollapsed = true; } }}
    onToggleDark={() => isDark = !isDark}
  />
  {#if mobileNavOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="mobile-nav-backdrop" transition:fade={{ duration: 200 }} onclick={() => mobileNavOpen = false}></div>
  {/if}
  {#key currentPath}
  <div class="app-content" class:collapsed>
    <div class="mobile-header">
      <button class="mobile-menu-btn" onclick={() => mobileNavOpen = !mobileNavOpen} aria-label="Open navigation">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
      <a href="{base}/" class="mobile-logo-link td-none" aria-label="Stack Internal home">
        {@html IconLogo}
      </a>
    </div>
    {@render children()}
  </div>
  {/key}
</div>

<style>
  /* Register --stack-sidebar-width as animatable so CSS variable transitions work */
  @property --stack-sidebar-width {
    syntax: '<length>';
    initial-value: 240px;
    inherits: true;
  }

  :global(body) {
    background-color: #fff !important;
    color: #201c1d !important;
  }

  :global(*) {
    scrollbar-color: gray transparent;
    scrollbar-width: thin;
  }

  :global(a:visited) {
    color: inherit;
  }

  .app-shell {
    display: flex;
    min-height: 100vh;
    background-color: #fff;
    color: #201c1d;
    transition: --stack-sidebar-width 0.2s ease;
  }

  .app-shell.dark {
    background-color: #1b1b1b;
    color: #e3e3e3;
  }

  .app-content {
    margin-left: 240px;
    flex: 1;
    min-width: 0;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    transition: margin-left 0.2s ease;
  }

  .app-content.collapsed {
    margin-left: 52px;
  }

  .app-shell.dark .app-content {
    background-color: #1b1b1b;
  }

  /* Mobile header — hidden on desktop, flex on mobile */
  .mobile-header {
    display: none;
    align-items: center;
    gap: 8px;
    height: 52px;
    padding: 0 8px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 900;
    background-color: var(--black-100);
    flex-shrink: 0;
  }


  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border: none;
    background: none;
    border-radius: 6px;
    cursor: pointer;
    color: #201c1d;
  }

  .mobile-menu-btn:hover {
    background-color: #e8e6e3;
  }

  .app-shell.dark .mobile-menu-btn {
    color: #e3e3e3;
  }

  .app-shell.dark .mobile-menu-btn:hover {
    background-color: #2a2a2a;
  }

  .mobile-logo-link :global(svg) {
    display: block;
    width: 132px;
    height: 22px;
    color: #201c1d;
  }

  .app-shell.dark .mobile-logo-link :global(svg) {
    color: #e3e3e3;
  }

  .mobile-nav-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 1001;
  }

  @media (max-width: 767px) {
    .mobile-header {
      display: flex;
    }

    .app-content,
    .app-content.collapsed {
      margin-left: 0 !important;
      padding-top: 52px;
    }

    .app-shell.community .mobile-header {
      display: none;
    }

    .app-shell.community .app-content,
    .app-shell.community .app-content.collapsed {
      padding-top: 0;
    }
  }

</style>
