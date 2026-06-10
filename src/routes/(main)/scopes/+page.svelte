<script lang="ts">

  type Scope = {
    slug: string;
    name: string;
    description: string;
    members: { initials: string; bg: string }[];
    docCount: number;
    connectorCount: number;
    lastActivity: string;
    accentColor: string;
  };

  const scopes: Scope[] = [
    {
      slug: 'mcp',
      name: 'MCP',
      description: 'Everything the platform team knows about the Model Context Protocol — spec docs, server setup guides, transport patterns, and debugging techniques.',
      members: [
        { initials: 'LI', bg: '#F48024' },
        { initials: 'AP', bg: '#7F5EDB' },
        { initials: 'SS', bg: '#3B8EEA' },
        { initials: 'ER', bg: '#2D9B6F' },
      ],
      docCount: 7,
      connectorCount: 4,
      lastActivity: 'Apr 6, 2026',
      accentColor: '#7F5EDB',
    },
    {
      slug: 'mcp',
      name: 'Auth & Identity',
      description: 'Authentication patterns, OAuth 2.0 migration notes, service account management, and the ongoing auth-v2 cutover documentation.',
      members: [
        { initials: 'RP', bg: '#7F5EDB' },
        { initials: 'JK', bg: '#3B8EEA' },
        { initials: 'DK', bg: '#5a7fa0' },
      ],
      docCount: 12,
      connectorCount: 2,
      lastActivity: 'Apr 5, 2026',
      accentColor: '#3B8EEA',
    },
    {
      slug: 'mcp',
      name: 'Platform Engineering',
      description: 'Infrastructure runbooks, on-call playbooks, SLO definitions, and deployment standards for the core platform stack.',
      members: [
        { initials: 'AT', bg: '#998B7A' },
        { initials: 'SR', bg: '#F48024' },
        { initials: 'KM', bg: '#2D9B6F' },
        { initials: 'LI', bg: '#F48024' },
      ],
      docCount: 24,
      connectorCount: 6,
      lastActivity: 'Apr 4, 2026',
      accentColor: '#F48024',
    },
    {
      slug: 'mcp',
      name: 'Search',
      description: 'Indexing architecture, relevance tuning notes, and the unified search discovery work spanning Stack Internal, Slack, and the internal wiki.',
      members: [
        { initials: 'MC', bg: '#F48024' },
        { initials: 'AP', bg: '#7F5EDB' },
      ],
      docCount: 9,
      connectorCount: 3,
      lastActivity: 'Apr 3, 2026',
      accentColor: '#F48024',
    },
    {
      slug: 'mcp',
      name: 'Data & Analytics',
      description: 'The Atlas data lake migration, schema compatibility tracking, and pipeline documentation for the data platform team.',
      members: [
        { initials: 'ER', bg: '#2D9B6F' },
        { initials: 'DK', bg: '#5a7fa0' },
        { initials: 'AT', bg: '#998B7A' },
      ],
      docCount: 18,
      connectorCount: 5,
      lastActivity: 'Mar 31, 2026',
      accentColor: '#2D9B6F',
    },
    {
      slug: 'mcp',
      name: 'Security & Compliance',
      description: 'AppSec audit findings, rate limiting policies, Zscaler configuration notes, and the corporate root CA Dockerfile templates.',
      members: [
        { initials: 'DK', bg: '#5a7fa0' },
        { initials: 'JK', bg: '#3B8EEA' },
        { initials: 'KM', bg: '#2D9B6F' },
      ],
      docCount: 15,
      connectorCount: 2,
      lastActivity: 'Mar 28, 2026',
      accentColor: '#c43c3c',
    },
  ];
</script>

<div class="scopes-page">
  <h1 class="fs-headline1 fw-bold fc-black-900 mb32">Scopes</h1>

  <div class="scopes-grid">
    {#each scopes as scope}
      <a href="/scopes/{scope.slug}" class="scope-card">
        <div class="scope-card-body">
          <h2 class="scope-name">{scope.name}</h2>
          <p class="scope-description">{scope.description}</p>
          <div class="scope-footer">
            <div class="scope-members">
              {#each scope.members.slice(0, 4) as member}
                <div class="scope-avatar" style="background: {member.bg}">{member.initials}</div>
              {/each}
            </div>
            <div class="scope-stats">
              <span class="scope-stat">{scope.docCount} docs</span>
              <span class="scope-stat-sep">·</span>
              <span class="scope-stat">{scope.lastActivity}</span>
            </div>
          </div>
        </div>
      </a>
    {/each}
  </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Flow+Block&display=swap');

  .scopes-page {
    width: 100%;
    padding: 48px 24px;
  }

  .scopes-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .scope-card {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--black-100);
    border-radius: 8px;
    overflow: hidden;
    text-decoration: none;
    background: var(--white, #fff);
    transition: box-shadow 0.15s, border-color 0.15s;
  }

  .scope-card:hover {
    border-color: var(--black-200);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }


  .scope-card-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }

  .scope-name {
    font-family: 'Flow Block', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: var(--black-400);
    margin: 0;
    line-height: 1.3;
  }

  .scope-description {
    font-family: 'Flow Block', sans-serif;
    font-size: 13px;
    color: var(--black-400);
    margin: 0;
    line-height: 1.55;
    flex: 1;
  }

  .scope-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
  }

  .scope-members {
    display: flex;
    align-items: center;
  }

  .scope-avatar {
    width: 22px;
    height: 22px;
    border-radius: 3px;
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    letter-spacing: 0.02em;
    border: 2px solid #fff;
    margin-left: -5px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .scope-avatar:first-child {
    margin-left: 0;
  }

  .scope-stats {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .scope-stat {
    font-family: 'Flow Block', sans-serif;
    font-size: 12px;
    color: var(--black-400);
  }

  .scope-stat-sep {
    font-size: 12px;
    color: var(--black-300);
  }
</style>
