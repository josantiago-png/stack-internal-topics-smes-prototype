<script lang="ts">
  import { page } from '$app/state';
  import type { Snippet } from 'svelte';
  import AnalyticsSidebar from '$lib/components/AnalyticsSidebar.svelte';

  let { children }: { children: Snippet } = $props();
  const currentPath = $derived(page.url.pathname);
</script>

<div class="an-layout">
  <AnalyticsSidebar {currentPath} />
  <main class="an-main">
    {@render children()}
  </main>
</div>

<style>
  .an-layout {
    display: flex;
    align-items: flex-start;
    min-height: 100vh;
  }

  .an-main {
    flex: 1;
    min-width: 0;
  }

  @media (max-width: 980px) {
    .an-layout {
      flex-direction: column;
    }
  }
</style>
