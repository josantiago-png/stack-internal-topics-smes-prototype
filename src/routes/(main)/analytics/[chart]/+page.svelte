<script lang="ts">
  import { page } from '$app/state';

  const titles: Record<string, string> = {
    'knowledge-health':  'Knowledge Health',
    'knowledge-gaps':    'Knowledge Gaps',
    'interruption-rate': 'Interruption Rate',
    'user-feedback':     'User Feedback',
    'activity':          'Activity',
    'adoption':          'Adoption by Department',
    'usage':             'Usage',
    'users':             'Users',
    'api':               'API Usage',
    'mcp':               'MCP Usage',
    'cli':               'CLI Usage',
    'chat':              'Chat Usage',
    'connector-health':  'Connector Health',
    'engagement':        'Engagement',
  };

  const title = $derived(titles[page.params.chart] ?? page.params.chart);
</script>

<div class="page">
  <h1 class="title">{title}</h1>
</div>

<style>
  .page {
    padding: 32px;
  }

  .title {
    font-size: 24px;
    font-weight: 600;
    color: var(--fc-dark);
    margin: 0;
    letter-spacing: -0.3px;
  }
</style>
