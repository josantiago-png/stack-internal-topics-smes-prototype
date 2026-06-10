<script lang="ts">
  import { tabsState } from '$lib/stores/tabs.svelte';
  import { Popover, PopoverReference, PopoverContent, Icon } from '@stackoverflow/stacks-svelte';
  import { IconMoreH } from '@stackoverflow/stacks-icons/icons';

  type Props = {
    ontabclick?: (id: number) => void;
    ontabclose?: (id: number) => void;
  };

  const { ontabclick, ontabclose }: Props = $props();

  const TAB_MIN = 80;   // minimum tab pill width (px)
  const TAB_MAX = 160;  // maximum tab pill width (px)
  const GAP = 4;        // gap between tabs (matches CSS gap)
  const OVERFLOW_W = 40; // width reserved for the overflow menu button

  let containerEl = $state<HTMLDivElement | null>(null);
  let containerWidth = $state(0);
  let overflowOpen = $state(false);

  $effect(() => {
    const el = containerEl;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      containerWidth = entries[0].contentRect.width;
    });
    ro.observe(el);
    return () => ro.disconnect();
  });

  const visibleCount = $derived.by(() => {
    const N = tabsState.tabs.length;
    const W = containerWidth;
    if (W <= 0 || N === 0) return N;

    // All tabs fit at min-width — show all (CSS will shrink them proportionally)
    const allShrunkWidth = N * TAB_MIN + (N - 1) * GAP;
    if (W >= allShrunkWidth) return N;

    // Some must overflow — reserve space for the +N button
    const available = W - OVERFLOW_W - GAP;
    return Math.max(1, Math.floor((available + GAP) / (TAB_MIN + GAP)));
  });

  const visibleTabs = $derived.by(() => {
    const tabs = tabsState.tabs;
    const count = visibleCount;
    if (count >= tabs.length) return tabs;

    // Always surface the active tab
    const activeIdx = tabs.findIndex(t => t.id === tabsState.activeTabId);
    if (activeIdx < count) return tabs.slice(0, count);

    // Active tab would overflow — swap last visible slot with it
    return [...tabs.slice(0, count - 1), tabs[activeIdx]];
  });

  const overflowTabs = $derived.by(() => {
    const visibleIds = new Set(visibleTabs.map(t => t.id));
    return tabsState.tabs.filter(t => !visibleIds.has(t.id));
  });
</script>

<div class="chat-tabs" bind:this={containerEl}>
  {#each visibleTabs as tab (tab.id)}
    <div class="tab-pill" class:selected-pill={tab.id === tabsState.activeTabId}>
      <button class="tab-label" onclick={() => ontabclick?.(tab.id)}>
        {tab.label}
      </button>
      {#if ontabclose}
        <button
          class="tab-close"
          aria-label="Close tab"
          onclick={(e) => { e.stopPropagation(); ontabclose?.(tab.id); }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      {/if}
    </div>
  {/each}

  {#if overflowTabs.length > 0}
    <Popover
      id="tab-overflow-popover"
      placement="bottom-start"
      strategy="fixed"
      visible={overflowOpen}
      onoutclick={() => (overflowOpen = false)}
    >
      <PopoverReference>
        <button class="overflow-btn" onclick={() => (overflowOpen = !overflowOpen)} aria-label="More tabs">
          <Icon src={IconMoreH} />
        </button>
      </PopoverReference>
      <PopoverContent role="menu" class="tab-overflow-menu">
        {#each overflowTabs as tab (tab.id)}
          <button
            class="overflow-item"
            class:overflow-item--active={tab.id === tabsState.activeTabId}
            onclick={() => { overflowOpen = false; ontabclick?.(tab.id); }}
          >
            {tab.label}
          </button>
        {/each}
      </PopoverContent>
    </Popover>
  {/if}
</div>

<style>
  .chat-tabs {
    align-items: center;
    display: flex;
    gap: 4px;
    justify-content: center;
    overflow: hidden;
    width: 100%;
  }

  .tab-pill {
    align-items: center;
    background: transparent;
    border-radius: 20px;
    display: flex;
    flex: 0 0 auto;
    gap: 2px;
    height: 28px;
    max-width: 160px;
    min-width: 80px;
    overflow: hidden;
    padding: 0 8px 0 12px;
  }

  .tab-pill.selected-pill {
    background: #f0efed;
  }

  .tab-label {
    background: none;
    border: none;
    color: #201c1d;
    cursor: pointer;
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    overflow: hidden;
    padding: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tab-close {
    align-items: center;
    background: none;
    border: none;
    border-radius: 4px;
    color: #6b6d73;
    cursor: pointer;
    display: flex;
    flex-shrink: 0;
    height: 16px;
    justify-content: center;
    max-width: 0;
    opacity: 0;
    overflow: hidden;
    padding: 0;
    transition: opacity 0.15s ease, max-width 0.15s ease;
    width: 16px;
  }

  .tab-close:hover {
    background: rgba(0, 0, 0, 0.08);
    color: #201c1d;
  }

  .tab-pill:hover .tab-close {
    max-width: 16px;
    opacity: 1;
  }

  .overflow-btn {
    align-items: center;
    background: none;
    border: none;
    border-radius: 20px;
    color: #201c1d;
    cursor: pointer;
    display: flex;
    flex-shrink: 0;
    height: 28px;
    justify-content: center;
    padding: 0 8px;
    width: 36px;
  }

  .overflow-btn:hover {
    background: #f0efed;
  }

  .overflow-btn :global(svg) {
    height: 16px;
    width: 16px;
  }

  :global(.tab-overflow-menu) {
    padding: 6px;
    width: max-content;
  }

  .overflow-item {
    background: none;
    border: none;
    border-radius: 6px;
    color: #201c1d;
    cursor: pointer;
    display: block;
    font-family: inherit;
    font-size: 13px;
    padding: 6px 10px;
    text-align: left;
    width: 100%;
  }

  .overflow-item:hover {
    background: #f0efed;
  }

  .overflow-item--active {
    font-weight: 600;
  }

  /* Dark mode */
  :global(.app-shell.dark) .tab-label {
    color: #e3e3e3;
  }

  :global(.app-shell.dark) .tab-pill.selected-pill {
    background: #2e2e2e;
  }

  :global(.app-shell.dark) .tab-close {
    color: #a0a0a0;
  }

  :global(.app-shell.dark) .tab-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #e3e3e3;
  }

  :global(.app-shell.dark) .overflow-btn {
    background: none;
    color: #e3e3e3;
  }

  :global(.app-shell.dark) .overflow-item {
    color: #e3e3e3;
  }

  :global(.app-shell.dark) .overflow-item:hover {
    background: #2e2e2e;
  }
</style>
