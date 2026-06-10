<script lang="ts">
  import { IconAlert, IconCheck } from '@stackoverflow/stacks-icons/icons';
  import { Icon } from '@stackoverflow/stacks-svelte';

  type Tone = 'verified' | 'caution';

  interface Props {
    label?: string;
    small?: boolean;
    tone?: Tone;
  }
  let { label = 'Verified', small = false, tone = 'verified' }: Props = $props();
</script>

<span class="verified-badge" class:small class:caution={tone === 'caution'}>
  <span class="check-icon" aria-hidden="true">
    <Icon src={tone === 'caution' ? IconAlert : IconCheck} />
  </span>
  <span class="label">{label}</span>
</span>

<style>
  .verified-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    height: 26px;
    padding: 4px 8px;
    background: var(--green-100);
    flex-shrink: 0;
  }

  .verified-badge:hover {
    background: #e0f0c6;
  }

  .verified-badge.caution {
    background: var(--yellow-100);
  }

  .verified-badge.caution:hover {
    background: var(--yellow-200);
  }

  .check-icon {
    display: flex;
    align-items: center;
    color: var(--green-500);
    flex-shrink: 0;
  }

  .caution .check-icon {
    color: var(--yellow-500);
  }

  .label {
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-weight: 400;
    color: var(--black-600);
    white-space: nowrap;
    line-height: 1;
  }

  .small {
    height: 21px;
    gap: 4px;
    padding: 0 6px 0 4px;
  }

  .small .label {
    font-size: 11px;
  }
</style>
