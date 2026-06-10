<script lang="ts">
  import { page } from '$app/state';
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { IconCheck, IconCross } from '@stackoverflow/stacks-icons/icons';
  import ControlCenterSidebar from '$lib/components/ControlCenterSidebar.svelte';
  import { adminTopicsProgress, startAdminTopicsProgress } from '$lib/stores/adminTopicsProgress';

  let { children }: { children: Snippet } = $props();
  let completionBannerDismissed = $state(false);
  const currentPath = $derived(
    base && page.url.pathname.startsWith(base)
      ? page.url.pathname.slice(base.length) || '/admin'
      : page.url.pathname
  );
  const showCompletionBanner = $derived(
    $adminTopicsProgress.phase === 'complete' && !completionBannerDismissed
  );

  onMount(() => {
    startAdminTopicsProgress();
  });
</script>

{#if showCompletionBanner}
  <div class="completion-banner" role="status" aria-live="polite">
    <span class="completion-banner__icon" aria-hidden="true">
      {@html IconCheck}
    </span>
    <span class="completion-banner__copy">
      Topic detection and SME mapping are done.
      <a class="completion-banner__review" href="{base}/admin/topics">Review</a>
    </span>
    <button
      class="completion-banner__dismiss"
      type="button"
      aria-label="Dismiss topic detection confirmation"
      onclick={() => (completionBannerDismissed = true)}
    >
      {@html IconCross}
    </button>
  </div>
{/if}

<div class="cc-layout" class:cc-layout--has-banner={showCompletionBanner}>
  <ControlCenterSidebar {currentPath} />
  <main class="cc-main">
    {@render children()}
  </main>
</div>

<style>
  .cc-layout {
    display: flex;
    align-items: flex-start;
    min-height: 100vh;
    background: #fff;
  }

  .cc-layout--has-banner {
    padding-top: 44px;
  }

  .cc-main {
    flex: 1;
    min-width: 0;
    padding: 52px 24px 44px 29px;
  }

  .completion-banner {
    align-items: center;
    background: #eef8e9;
    border-bottom: 1px solid #cfe8c0;
    color: #214b05;
    display: grid;
    gap: 10px;
    grid-template-columns: auto minmax(0, 1fr) auto;
    left: 0;
    min-height: 44px;
    padding: 8px 14px;
    position: fixed;
    right: 0;
    top: 0;
    z-index: 1200;
  }

  .completion-banner__icon {
    align-items: center;
    background: #4d7c05;
    border-radius: 50%;
    color: #fff;
    display: inline-flex;
    height: 20px;
    justify-content: center;
    width: 20px;
  }

  .completion-banner__icon :global(svg) {
    height: 14px;
    width: 14px;
  }

  .completion-banner__copy {
    font-size: 15px;
    font-weight: 400;
    line-height: 1.35;
    min-width: 0;
  }

  .completion-banner__review {
    color: #214b05;
    display: inline;
    font-weight: 400;
    margin-left: 4px;
    text-decoration: underline;
    text-underline-offset: 2px;
    white-space: nowrap;
  }

  .completion-banner__review:hover,
  .completion-banner__review:focus-visible {
    color: #152f03;
    outline: 0;
  }

  .completion-banner__dismiss {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: 50%;
    color: #214b05;
    cursor: pointer;
    display: inline-flex;
    height: 28px;
    justify-content: center;
    padding: 0;
    width: 28px;
  }

  .completion-banner__dismiss:hover,
  .completion-banner__dismiss:focus-visible {
    background: #dff0d4;
    outline: 0;
  }

  .completion-banner__dismiss :global(svg) {
    height: 13px;
    width: 13px;
  }

  :global(.app-shell.dark) .cc-layout {
    background: #1b1b1b;
  }

  @media (max-width: 980px) {
    .cc-layout {
      flex-direction: column;
    }

    .cc-main {
      padding: 40px 20px 56px;
      width: 100%;
    }
  }
</style>
