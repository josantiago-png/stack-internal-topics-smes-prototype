<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();
</script>

<div class="page-wrapper">
  {@render children()}
</div>

<style>
  .page-wrapper {
    width: 100%;
    max-width: 760px;
    margin: 0 auto;
    padding: 48px 24px;
  }
</style>
