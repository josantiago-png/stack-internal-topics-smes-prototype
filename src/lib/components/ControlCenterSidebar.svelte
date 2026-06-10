<script lang="ts">
  import { base } from '$app/paths';
  import {
    adminTopicsProgress,
    isAdminTopicsLoadingPhase,
  } from '$lib/stores/adminTopicsProgress';

  interface Props {
    currentPath?: string;
  }

  type Link = {
    showsProgress?: boolean;
    text: string;
    path: string;
  };

  type Group = {
    title?: string;
    links: Link[];
  };

  let { currentPath = '/admin' }: Props = $props();

  const groups: Group[] = [
    {
      links: [{ text: 'Get started', path: '/admin/start' }],
    },
    {
      title: 'Access',
      links: [
        { text: 'Identity', path: '/admin/identity' },
        { text: 'Roles', path: '/admin/roles' },
        { text: 'Policies', path: '/admin/policies' },
      ],
    },
    {
      title: 'Data sources',
      links: [
        { text: 'Connectors', path: '/admin/connectors' },
        { text: 'Integrations', path: '/admin/integrations' },
      ],
    },
    {
      title: 'Platform',
      links: [
        { text: 'Usage', path: '/admin/usage' },
        { text: 'Cost', path: '/admin/cost' },
        { text: 'Logs', path: '/admin/logs' },
      ],
    },
    {
      title: 'Manage',
      links: [
        { text: 'Topics and SMEs', path: '/admin/topics', showsProgress: true },
        { text: 'API Keys', path: '/admin/api-keys' },
      ],
    },
  ];

  const isSelected = (path: string) =>
    currentPath === path || currentPath.startsWith(path + '/');

  const topicsLoading = $derived(isAdminTopicsLoadingPhase($adminTopicsProgress.phase));
</script>

<aside id="control-center-sidebar" class="cc-sidebar" aria-label="Control Center">
  <div class="cc-sidebar__header">Control Center</div>

  <nav class="cc-sidebar__nav">
    {#each groups as group}
      <div class="cc-sidebar__group">
        {#if group.title}
          <div class="cc-sidebar__label">{group.title}</div>
        {/if}

        {#each group.links as link}
          <a
            class="cc-sidebar__link"
            class:active={isSelected(link.path)}
            aria-current={isSelected(link.path) ? 'page' : undefined}
            href="{base}{link.path}"
          >
            <span class="cc-sidebar__link-text">{link.text}</span>
            {#if link.showsProgress && topicsLoading}
              <span class="cc-sidebar__loader" aria-label="Topics processing">
                <span></span>
                <span></span>
                <span></span>
              </span>
            {/if}
          </a>
        {/each}
      </div>
    {/each}
  </nav>
</aside>

<style>
  .cc-sidebar {
    position: sticky;
    top: 0;
    width: 190px;
    height: 100vh;
    padding: 28px 20px 16px 30px;
    background: #fff;
    overflow-y: auto;
    scrollbar-width: none;
    flex-shrink: 0;
  }

  .cc-sidebar::-webkit-scrollbar {
    display: none;
  }

  .cc-sidebar__header {
    color: #201c1d;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.15;
    margin-bottom: 36px;
  }

  .cc-sidebar__nav,
  .cc-sidebar__group {
    display: flex;
    flex-direction: column;
  }

  .cc-sidebar__group {
    gap: 14px;
    margin-bottom: 27px;
  }

  .cc-sidebar__label {
    color: #858b95;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.1;
    margin-bottom: 0;
  }

  .cc-sidebar__link,
  .cc-sidebar__link:visited {
    align-items: center;
    color: #201c1d;
    display: flex;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 14px;
    font-weight: 400;
    gap: 8px;
    justify-content: space-between;
    line-height: 1.12;
    margin-left: -8px;
    min-height: 30px;
    padding: 0 8px;
    border-radius: 6px;
    text-decoration: none;
  }

  .cc-sidebar__link:hover {
    background: #f7f6f5;
    color: #000;
  }

  .cc-sidebar__link.active {
    background: #f0efed;
    font-weight: 700;
  }

  .cc-sidebar__link-text {
    min-width: 0;
    white-space: nowrap;
  }

  .cc-sidebar__loader {
    align-items: center;
    display: inline-flex;
    flex-shrink: 0;
    gap: 3px;
    height: 14px;
  }

  .cc-sidebar__loader span {
    animation: cc-sidebar-loading-dot 1.05s ease-in-out infinite;
    background: #201c1d;
    border-radius: 50%;
    display: block;
    height: 4px;
    width: 4px;
  }

  .cc-sidebar__loader span:nth-child(2) {
    animation-delay: 0.14s;
  }

  .cc-sidebar__loader span:nth-child(3) {
    animation-delay: 0.28s;
  }

  @keyframes cc-sidebar-loading-dot {
    0%,
    80%,
    100% {
      opacity: 0.35;
      transform: translateY(0) scale(0.85);
    }

    40% {
      opacity: 1;
      transform: translateY(-1px) scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cc-sidebar__loader span {
      animation: none;
      opacity: 1;
      transform: none;
    }
  }

  :global(.app-shell.dark) .cc-sidebar {
    background: #1b1b1b;
  }

  :global(.app-shell.dark) .cc-sidebar__header,
  :global(.app-shell.dark) .cc-sidebar__link,
  :global(.app-shell.dark) .cc-sidebar__link:visited {
    color: #e3e3e3;
  }

  :global(.app-shell.dark) .cc-sidebar__label {
    color: #9a9a9a;
  }

  :global(.app-shell.dark) .cc-sidebar__link:hover,
  :global(.app-shell.dark) .cc-sidebar__link.active {
    background: #2d2d2d;
  }

  :global(.app-shell.dark) .cc-sidebar__loader span {
    background: #e3e3e3;
  }

  @media (max-width: 1180px) {
    .cc-sidebar {
      width: 180px;
      padding-left: 24px;
      padding-right: 16px;
    }

    .cc-sidebar__header {
      font-size: 15px;
    }

    .cc-sidebar__label {
      font-size: 12px;
    }

    .cc-sidebar__link {
      font-size: 14px;
    }
  }

  @media (max-width: 980px) {
    .cc-sidebar {
      display: none;
    }
  }
</style>
