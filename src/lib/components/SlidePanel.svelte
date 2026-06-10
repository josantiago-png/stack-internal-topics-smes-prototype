<script lang="ts">
  import type { Snippet } from 'svelte';
  import { IconCross } from '@stackoverflow/stacks-icons/icons';

  interface Props {
    open: boolean;
    title: string;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    onclose: () => void;
    children: Snippet;
  }

  let {
    open,
    title,
    width = $bindable(360),
    minWidth = 240,
    maxWidth = 640,
    onclose,
    children,
  }: Props = $props();

  let isResizing = $state(false);

  function startResize(e: MouseEvent) {
    e.preventDefault();
    isResizing = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    const startX = e.clientX;
    const startWidth = width;

    function onMove(e: MouseEvent) {
      width = Math.max(minWidth, Math.min(maxWidth, startWidth + (startX - e.clientX)));
    }

    function onUp() {
      isResizing = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }
</script>

<aside
  class="slide-panel"
  class:slide-panel--visible={open}
  class:is-resizing={isResizing}
  style="--panel-width: {width}px"
  onclick={(e) => e.stopPropagation()}
>
  <div class="slide-panel-resize-handle" onmousedown={startResize} role="separator" aria-orientation="vertical" aria-label="Resize panel"></div>
  <div class="slide-panel-inner">
    <div class="slide-panel-header">
      <span class="slide-panel-title">{title}</span>
      <button class="slide-panel-close" onclick={onclose} aria-label="Close panel">
        {@html IconCross}
      </button>
    </div>
    <div class="slide-panel-body">
      {@render children()}
    </div>
  </div>
</aside>

<style>
  .slide-panel {
    --panel-width: 360px;
    max-width: 0;
    width: var(--panel-width);
    flex-shrink: 0;
    overflow: hidden;
    position: relative;
    transition: max-width 0.22s cubic-bezier(0, 0, 0.2, 1);
  }

  .slide-panel.is-resizing {
    transition: none;
  }

  .slide-panel--visible {
    max-width: var(--panel-width);
    border-left: 1px solid #dee0e3;
  }

  .slide-panel-resize-handle {
    position: absolute;
    left: 0;
    top: 0;
    width: 5px;
    height: 100%;
    cursor: col-resize;
    z-index: 10;
  }

  .slide-panel-resize-handle:hover,
  .is-resizing .slide-panel-resize-handle {
    background: #e87529;
    opacity: 0.4;
  }

  .slide-panel-inner {
    width: var(--panel-width);
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--white, #fff);
    transform: translateX(24px);
    opacity: 0;
    transition: transform 0.22s cubic-bezier(0, 0, 0.2, 1), opacity 0.18s ease;
  }

  .slide-panel.is-resizing .slide-panel-inner {
    transition: none;
  }

  .slide-panel--visible .slide-panel-inner {
    transform: translateX(0);
    opacity: 1;
  }

  .slide-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 20px 16px;
    flex-shrink: 0;
  }

  .slide-panel-title {
    font-size: 16px;
    font-weight: 600;
    color: #201c1d;
  }

  .slide-panel-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 6px;
    color: #6b6d73;
  }

  .slide-panel-close:hover {
    background: #f0efed;
    color: #201c1d;
  }

  .slide-panel-close :global(svg) {
    width: 18px;
    height: 18px;
  }

  .slide-panel-body {
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  :global(.app-shell.dark) .slide-panel-inner {
    background: #1b1b1b;
  }

  :global(.app-shell.dark) .slide-panel--visible {
    border-left-color: #333;
  }

  :global(.app-shell.dark) .slide-panel-title {
    color: #e3e3e3;
  }

  :global(.app-shell.dark) .slide-panel-close {
    color: #a0a0a0;
  }

  :global(.app-shell.dark) .slide-panel-close:hover {
    background: #2a2a2a;
    color: #e3e3e3;
  }
</style>
