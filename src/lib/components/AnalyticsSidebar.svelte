<script lang="ts">
  import { Navigation, NavigationItem } from '@stackoverflow/stacks-svelte';
  import { base } from '$app/paths';

  interface Props {
    currentPath?: string;
  }

  let { currentPath = '/analytics' }: Props = $props();

  const isSelected = (path: string) =>
    currentPath === path || currentPath.startsWith(path + '/');
</script>

<aside id="analytics-sidebar" class="an-sidebar">
  <div class="an-sidebar--header">
    <span class="fs-body2 fw-bold fc-black-600 ff-sans">Analytics</span>
  </div>

  <div class="an-sidebar--content">
    <nav aria-label="Analytics">
      <Navigation label="Top" orientation="vertical" class="nav-links">
        <NavigationItem
          text="Overview"
          href="{base}/analytics"
          selected={currentPath === '/analytics'}
        />
      </Navigation>

      <Navigation label="Metrics" orientation="vertical" class="nav-links">
        <NavigationItem
          text="Usage"
          href="{base}/analytics/usage"
          selected={isSelected('/analytics/usage')}
        />
        <NavigationItem
          text="Knowledge Health"
          href="{base}/analytics/knowledge-health"
          selected={isSelected('/analytics/knowledge-health')}
        />
        <NavigationItem
          text="Connector Health"
          href="{base}/analytics/connector-health"
          selected={isSelected('/analytics/connector-health')}
        />
        <NavigationItem
          text="Adoption"
          href="{base}/analytics/adoption"
          selected={isSelected('/analytics/adoption')}
        />
        <NavigationItem
          text="Engagement"
          href="{base}/analytics/engagement"
          selected={isSelected('/analytics/engagement')}
        />
        <NavigationItem
          text="Users"
          href="{base}/analytics/users"
          selected={isSelected('/analytics/users')}
        />
      </Navigation>
    </nav>
  </div>
</aside>

<style>
  .an-sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
    width: fit-content;
    min-width: 160px;
    margin-left: 24px;
    background-color: transparent;
    overflow-y: auto;
    scrollbar-width: none;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
  }

  .an-sidebar::-webkit-scrollbar { display: none; }

  .an-sidebar--header {
    display: flex;
    align-items: center;
    padding: 20px 8px 16px;
    flex-shrink: 0;
  }

  .an-sidebar--content {
    padding: 10px 0 8px;
    flex: 1;
    overflow-y: auto;
    scrollbar-width: none;
  }

  .an-sidebar--content::-webkit-scrollbar { display: none; }

  .nav-divider {
    height: 1px;
    background-color: var(--black-050);
    margin: 12px 0;
  }

  :global(#analytics-sidebar .s-navigation) {
    gap: 0;
  }

  :global(#analytics-sidebar .s-navigation--item) {
    padding: 10px 8px;
    border-radius: 10px;
    font-size: 14px;
    color: var(--black-600);
    margin-top: 4px;
  }

  :global(#analytics-sidebar .s-navigation--item .s-navigation--icon) {
    margin-right: 8px;
    color: var(--black-350);
  }

  :global(#analytics-sidebar .s-navigation--item:hover) {
    background-color: var(--black-100);
  }

  :global(body.theme-light) :global(#analytics-sidebar .s-navigation--item:hover) {
    background-color: var(--black-150);
  }

  :global(#analytics-sidebar .s-navigation--item.is-selected) {
    font-weight: bold;
    background-color: var(--black-100);
    color: var(--black-600);
  }

  :global(body.theme-light) :global(#analytics-sidebar .s-navigation--item.is-selected) {
    background-color: var(--black-150);
  }

  :global(#analytics-sidebar .s-navigation--item.is-selected .s-navigation--icon) {
    color: var(--black-600);
  }

  :global(#analytics-sidebar a.s-navigation--item:link),
  :global(#analytics-sidebar a.s-navigation--item:visited) {
    color: var(--black-600);
  }

  :global(#analytics-sidebar .nav-section-title) {
    font-size: 12px !important;
    color: var(--black-350) !important;
    font-weight: 400 !important;
    text-transform: none !important;
    padding: 4px 8px 8px !important;
    border: none !important;
  }

  :global(.app-shell.dark) .nav-divider {
    background-color: #333;
  }

  @media (max-width: 980px) {
    .an-sidebar {
      display: none;
    }
  }
</style>
