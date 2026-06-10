<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  const SOURCES = [
    { key: 'stack', label: 'Stack Internal Community' },
    { key: 'docs',  label: 'Google Docs' },
    { key: 'slack', label: 'Slack' },
  ] as const;

  const DISPLAY_MS = 500;
  const FADE_MS    = 280;

  let sourceIndex     = $state(0);
  let sourceVisible   = $state(false);
  let blockVisible    = $state(false);
  let showThinking    = $state(false);
  let thinkingVisible = $state(false);

  const timers: ReturnType<typeof setTimeout>[] = [];
  const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));

  onMount(() => {
    let t = 60;

    later(() => { blockVisible = true; sourceVisible = true; }, t);

    for (let i = 0; i < SOURCES.length; i++) {
      t += DISPLAY_MS;
      later(() => { sourceVisible = false; }, t);

      if (i < SOURCES.length - 1) {
        const next = i + 1;
        later(() => { sourceIndex = next; sourceVisible = true; }, t + FADE_MS);
        t += FADE_MS;
      } else {
        later(() => { blockVisible = false; }, t + FADE_MS);
        later(() => { showThinking = true;   }, t + FADE_MS);
        later(() => { thinkingVisible = true; }, t + FADE_MS + 50);
      }
    }
  });

  onDestroy(() => timers.forEach(clearTimeout));
</script>

<div class="si-root">
  {#if !showThinking}
    <div class="si-searching" class:si-visible={blockVisible}>
      <span class="si-dot"></span><span class="si-dot"></span><span class="si-dot"></span>
      <span class="si-text">
        Searching across
        <span class="si-source" class:si-visible={sourceVisible}>
          {#if SOURCES[sourceIndex].key === 'stack'}
            <span class="si-stack-icon" aria-hidden="true">
              <img src="/logo-stack-internal-community.svg" alt="" />
            </span>
          {:else if SOURCES[sourceIndex].key === 'docs'}
            <img class="si-icon" src="/icon-google-docs.svg" alt="" aria-hidden="true" />
          {:else}
            <img class="si-icon" src="/icon-slack.svg" alt="" aria-hidden="true" />
          {/if}
          {SOURCES[sourceIndex].label}
        </span>
      </span>
    </div>
  {:else}
    <div class="si-thinking" class:si-visible={thinkingVisible}>Thinking</div>
  {/if}
</div>

<style>
  .si-root {
    display: flex;
    align-items: center;
    min-height: 18px;
  }

  /* ---- searching block ---- */
  .si-searching {
    display: flex;
    align-items: center;
    gap: 10px;
    opacity: 0;
    transition: opacity 280ms ease;
  }

  /* ---- dots ---- */
  .si-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #6b6d73;
    animation: si-pulse 1.2s ease-in-out infinite;
    flex-shrink: 0;
  }
  .si-dot:nth-child(2) { animation-delay: 0.2s; }
  .si-dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes si-pulse {
    0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
    30%           { opacity: 1;   transform: scale(1);   }
  }

  /* ---- text + source ---- */
  .si-text {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 16px;
    color: #6b6d73;
    white-space: nowrap;
  }

  .si-source {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    opacity: 0;
    transition: opacity 280ms ease;
    color: #3b3e45;
    font-weight: 500;
  }

  /* ---- icons ---- */
  .si-icon {
    width: 14px;
    height: 14px;
    display: block;
    flex-shrink: 0;
  }

  .si-stack-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 3px;
    background: #f48024;
    flex-shrink: 0;
  }
  .si-stack-icon img {
    width: 10px;
    height: 10px;
  }

  /* ---- thinking ---- */
  .si-thinking {
    font-size: 16px;
    color: #6b6d73;
    opacity: 0;
    transition: opacity 280ms ease;
  }

  /* shared visible state */
  .si-visible {
    opacity: 1;
  }
</style>
