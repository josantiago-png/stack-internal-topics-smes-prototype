<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();

  $effect(() => {
    const prev = {
      bg: document.body.style.backgroundColor,
      color: document.body.style.color,
      font: document.body.style.fontFamily,
      fontSize: document.body.style.fontSize,
      lineHeight: document.body.style.lineHeight,
    };
    document.body.style.backgroundColor = '#1A1D21';
    document.body.style.color = '#1D1C1D';
    document.body.style.fontFamily =
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif";
    document.body.style.fontSize = '15px';
    document.body.style.lineHeight = '1.46667';
    return () => {
      document.body.style.backgroundColor = prev.bg;
      document.body.style.color = prev.color;
      document.body.style.fontFamily = prev.font;
      document.body.style.fontSize = prev.fontSize;
      document.body.style.lineHeight = prev.lineHeight;
    };
  });
</script>

<div class="slack-root">
  {@render children()}
</div>

<style>
  :global(body:has(.slack-root)) {
    height: 100%;
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .slack-root {
    height: 100vh;
    display: contents;
  }

  .slack-root :global(*),
  .slack-root :global(*::before),
  .slack-root :global(*::after) {
    box-sizing: border-box;
  }

  .slack-root :global(button) {
    font-family: inherit;
    font-size: inherit;
  }

  .slack-root :global(a) {
    color: #0068a9;
    text-decoration: none;
  }

  .slack-root :global(a:hover) {
    text-decoration: underline;
  }
</style>
