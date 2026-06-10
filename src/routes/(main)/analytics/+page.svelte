<script lang="ts">
  import { BarChart, AreaChart, LineChart } from 'layerchart';
  import { curveMonotoneX } from 'd3-shape';
  import { Notice } from '@stackoverflow/stacks-svelte';

  let showDataGapNotice = $state(false);

  // --- Date controls ---
  type Granularity = 'year' | 'month' | 'week';
  let granularity = $state<Granularity>('month');
  let selectedDate = $state(new Date());
  let selectedDept = $state('all');

  const today = new Date();

  const divisions = [
    { value: 'all',           label: 'All departments' },
    { value: 'platform',      label: 'Platform Eng' },
    { value: 'devex',         label: 'Developer Exp' },
    { value: 'infra',         label: 'Infrastructure' },
    { value: 'sre',           label: 'Site Reliability' },
    { value: 'security',      label: 'App Security' },
    { value: 'data',          label: 'Data Eng' },
    { value: 'mobile',        label: 'Mobile' },
  ];

  function startOfWeek(d: Date): Date {
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const s = new Date(d);
    s.setDate(d.getDate() + diff);
    s.setHours(0, 0, 0, 0);
    return s;
  }

  function endOfWeek(d: Date): Date {
    const s = startOfWeek(d);
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    return e;
  }

  function formatMonth(d: Date): string {
    return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }

  function formatWeek(d: Date): string {
    const s = startOfWeek(d);
    const e = endOfWeek(d);
    const sm = s.toLocaleString('en-US', { month: 'short' });
    const em = e.toLocaleString('en-US', { month: 'short' });
    const sy = s.getFullYear();
    const ey = e.getFullYear();
    if (s.getMonth() === e.getMonth() && sy === ey) {
      return `${sm} ${s.getDate()} - ${e.getDate()}, ${ey}`;
    }
    return `${sm} ${s.getDate()}${sy !== ey ? ', ' + sy : ''} - ${em} ${e.getDate()}, ${ey}`;
  }

  const dateLabel = $derived(
    granularity === 'year'  ? String(selectedDate.getFullYear()) :
    granularity === 'month' ? formatMonth(selectedDate) :
                              formatWeek(selectedDate)
  );

  const canGoForward = $derived(
    granularity === 'year'
      ? selectedDate.getFullYear() < today.getFullYear()
      : granularity === 'month'
      ? selectedDate.getFullYear() < today.getFullYear() ||
        (selectedDate.getFullYear() === today.getFullYear() && selectedDate.getMonth() < today.getMonth())
      : endOfWeek(selectedDate) < endOfWeek(today)
  );

  function navigate(dir: -1 | 1) {
    const d = new Date(selectedDate);
    if (granularity === 'year') {
      d.setFullYear(d.getFullYear() + dir);
    } else if (granularity === 'month') {
      d.setDate(1);
      d.setMonth(d.getMonth() + dir);
    } else {
      d.setDate(d.getDate() + dir * 7);
    }
    selectedDate = d;
  }

  // --- Dept multipliers (share of total org activity) ---
  const deptMult: Record<string, number> = {
    all: 1, platform: 0.26, devex: 0.12, infra: 0.09,
    sre: 0.20, security: 0.07, data: 0.15, mobile: 0.11,
  };
  // Granularity multipliers relative to weekly baseline
  const granMult: Record<Granularity, number> = { year: 52, month: 4.3, week: 1 };

  function fmt(n: number) {
    return Math.round(n).toLocaleString('en-US');
  }

  // --- Stat cards (base weekly / all-dept values) ---
  const statBase = [
    { label: 'Total requests', baseVal: 12847, change: '+18%', up: true,  good: true,  percent: false,
      icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><path d="M14 14l2.5 2.5"/></svg>` },
    { label: 'Knowledge health', baseVal: 82,  change: '+12%', up: true,  good: true,  percent: true,
      icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2l1.5 4.5H15l-3.75 2.75L12.75 14 9 11.25 5.25 14l1.5-4.75L3 6.5h4.5z"/></svg>` },
    { label: 'Knowledge gaps', baseVal: 341,   change: '+2%',  up: true,  good: true,  percent: false,
      icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="4" height="6" rx="1"/><rect x="12" y="6" width="4" height="6" rx="1"/><path d="M6 9h6"/></svg>` },
    { label: 'Interruption rate', baseVal: 19, change: '-4%',  up: false, good: true,  percent: true,
      icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="6" r="3"/><path d="M3 16c0-3.314 2.686-6 6-6s6 2.686 6 6"/></svg>` },
  ];

  const stats = $derived(statBase.map(s => ({
    ...s,
    value: s.percent
      ? `${s.baseVal}%`
      : fmt(Math.round(s.baseVal * granMult[granularity] * (deptMult[selectedDept] ?? 1))),
  })));

  // --- Activity chart data ---
  // Year view: one bar per month
  const activityYearly = [
    { label: 'Jan', api: 2690, mcp: 1840, cli: 1260, chat: 800 },
    { label: 'Feb', api: 2850, mcp: 1950, cli: 1340, chat: 850 },
    { label: 'Mar', api: 3020, mcp: 2060, cli: 1420, chat: 905 },
    { label: 'Apr', api: 3190, mcp: 2180, cli: 1500, chat: 955 },
    { label: 'May', api: 1820, mcp: 1210, cli: 840,  chat: 520 },
    { label: 'Jun', api: 1950, mcp: 1310, cli: 910,  chat: 570 },
    { label: 'Jul', api: 2100, mcp: 1420, cli: 980,  chat: 620 },
    { label: 'Aug', api: 2250, mcp: 1530, cli: 1050, chat: 670 },
    { label: 'Sep', api: 2400, mcp: 1640, cli: 1120, chat: 720 },
    { label: 'Oct', api: 2580, mcp: 1760, cli: 1200, chat: 770 },
    { label: 'Nov', api: 2710, mcp: 1850, cli: 1270, chat: 810 },
    { label: 'Dec', api: 2540, mcp: 1730, cli: 1190, chat: 760 },
  ];

  // Week view: one bar per day of the week
  const activityWeekData = [
    { label: 'Mon', api: 108, mcp: 72, cli: 50, chat: 31 },
    { label: 'Tue', api: 118, mcp: 79, cli: 55, chat: 34 },
    { label: 'Wed', api: 125, mcp: 83, cli: 58, chat: 36 },
    { label: 'Thu', api: 121, mcp: 81, cli: 56, chat: 35 },
    { label: 'Fri', api: 112, mcp: 74, cli: 52, chat: 32 },
    { label: 'Sat', api: 64,  mcp: 42, cli: 30, chat: 18 },
    { label: 'Sun', api: 47,  mcp: 31, cli: 22, chat: 14 },
  ];

  const activitySeries = [
    { key: 'chat', label: 'Chat', value: 'chat', color: 'var(--black)' },
    { key: 'cli',  label: 'CLI',  value: 'cli',  color: 'var(--blue-400)' },
    { key: 'mcp',  label: 'MCP',  value: 'mcp',  color: 'var(--purple-400)' },
    { key: 'api',  label: 'API',  value: 'api',  color: '#FF5E00' },
  ];

  const activityData = $derived((() => {
    const m = deptMult[selectedDept] ?? 1;
    if (granularity === 'year') {
      return activityYearly.map(row => ({
        label: row.label,
        api:  Math.round(row.api  * m),
        mcp:  Math.round(row.mcp  * m),
        cli:  Math.round(row.cli  * m),
        chat: Math.round(row.chat * m),
      }));
    } else if (granularity === 'month') {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dow = new Date(year, month, day).getDay();
        const isWeekend = dow === 0 || dow === 6;
        const v = 1 + Math.sin(day * 1.7 + month * 0.5) * 0.25;
        const base = 108 * v * (isWeekend ? 0.35 : 1) * m;
        return {
          label: `${month + 1}/${day}`,
          api:  Math.round(base * 1.08),
          mcp:  Math.round(base * 0.72),
          cli:  Math.round(base * 0.50),
          chat: Math.round(base * 0.31),
        };
      });
    } else {
      return activityWeekData.map(row => ({
        label: row.label,
        api:  Math.round(row.api  * m),
        mcp:  Math.round(row.mcp  * m),
        cli:  Math.round(row.cli  * m),
        chat: Math.round(row.chat * m),
      }));
    }
  })());

  // --- Adoption by department ---
  const allDepartments = [
    { key: 'platform', name: 'Platform Eng',     users: 87,  total: 94,  color: '#FF5E00',           trackColor: 'var(--orange-100)' },
    { key: 'devex',    name: 'Developer Exp',    users: 41,  total: 45,  color: 'var(--blue-400)',   trackColor: 'var(--blue-100)' },
    { key: 'infra',    name: 'Infrastructure',   users: 28,  total: 30,  color: 'var(--purple-400)', trackColor: 'var(--purple-100)' },
    { key: 'sre',      name: 'Site Reliability', users: 63,  total: 110, color: 'var(--black)',      trackColor: 'var(--black-100)' },
    { key: 'security', name: 'App Security',     users: 19,  total: 24,  color: 'var(--green-500)',  trackColor: 'var(--green-100)' },
    { key: 'data',     name: 'Data Eng',         users: 22,  total: 38,  color: '#998B7A',           trackColor: 'rgba(153,139,122,0.2)' },
    { key: 'mobile',   name: 'Mobile',           users: 31,  total: 50,  color: 'var(--blue-600)',   trackColor: 'var(--blue-100)' },
  ];

  const departments = $derived(
    (selectedDept === 'all' ? allDepartments : allDepartments.filter(d => d.key === selectedDept))
      .slice()
      .sort((a, b) => (b.users / b.total) - (a.users / a.total))
  );

  const usageDepts = $derived((() => {
    const base = statBase[0].baseVal * granMult[granularity];
    const list = (selectedDept === 'all' ? allDepartments : allDepartments.filter(d => d.key === selectedDept))
      .map(d => ({ ...d, requests: Math.round(base * (deptMult[d.key] ?? 0)) }))
      .sort((a, b) => b.requests - a.requests);
    const maxRequests = Math.max(...list.map(d => d.requests));
    return { list, maxRequests };
  })());

  // --- Metric area charts ---
  type TrendPoint = { label: string; value: number };

  function makeTrend(start: number, end: number, noise = 0.04): TrendPoint[] {
    let labels: string[];
    if (granularity === 'year') {
      labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    } else if (granularity === 'month') {
      const m2 = selectedDate.getMonth() + 1;
      const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
      labels = Array.from({ length: daysInMonth }, (_, i) => `${m2}/${i + 1}`);
    } else {
      labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    }
    const n = labels.length;
    return labels.map((label, i) => {
      const t = i / (n - 1);
      const jitter = Math.sin(i * 2.3 + 1) * noise;
      return { label, value: Math.round((start + (end - start) * t + jitter * (end - start)) * 10) / 10 };
    });
  }

  function makeLineData(startA: number, endA: number, startB: number, endB: number, noise = 0.08) {
    let labels: string[];
    if (granularity === 'year') {
      labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    } else if (granularity === 'month') {
      const mo = selectedDate.getMonth() + 1;
      const days = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
      labels = Array.from({ length: days }, (_, i) => `${mo}/${i + 1}`);
    } else {
      labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    }
    const n = labels.length;
    return labels.map((label, i) => {
      const t = i / (n - 1);
      return {
        label,
        a: Math.round(startA + (endA - startA) * t + Math.sin(i * 2.3 + 1) * noise * (endA - startA)),
        b: Math.round(startB + (endB - startB) * t + Math.cos(i * 1.7 + 0.5) * noise * (endB - startB)),
      };
    });
  }

  const newKnowledgeSeries = [
    { key: 'a', label: 'New knowledge', value: 'a', color: '#FF5E00' },
    { key: 'b', label: 'Knowledge gaps', value: 'b', color: 'var(--blue-400)' },
  ];

  const deflectionSeries = [
    { key: 'a', label: 'Deflections', value: 'a', color: '#FF5E00' },
    { key: 'b', label: 'Escalations', value: 'b', color: 'var(--blue-400)' },
  ];

  const lineCharts = $derived([
    {
      title: 'Knowledge',
      series: newKnowledgeSeries,
      data: makeLineData(45, 82, 34, 18),
    },
    {
      title: 'Resolution rate',
      series: deflectionSeries,
      data: makeLineData(54, 78, 46, 22),
    },
  ]);

  const metricCharts = $derived([
    {
      slug: 'knowledge-health', title: 'Knowledge Health',
      badge: 'Good', badgeBg: '#dcfce7', badgeFc: '#15803d',
      current: '82%', change: '+12%', positive: true, color: '#16a34a',
      data: makeTrend(62, 82),
    },
    {
      slug: 'knowledge-gaps', title: 'Knowledge Gaps',
      badge: 'Improving', badgeBg: '#dbeafe', badgeFc: '#1d4ed8',
      current: '18%', change: '-47%', positive: true, color: '#0077cc',
      data: makeTrend(34, 18),
    },
    {
      slug: 'interruption-rate', title: 'Interruption Rate',
      badge: 'Stable', badgeBg: '#fef9c3', badgeFc: '#a16207',
      current: '19%', change: '-21%', positive: true, color: '#d97706',
      data: makeTrend(24, 19, 0.06),
    },
    {
      slug: 'user-feedback', title: 'User Feedback',
      badge: 'High', badgeBg: '#dcfce7', badgeFc: '#15803d',
      current: '84%', change: '+18%', positive: true, color: '#16a34a',
      data: makeTrend(71, 84),
    },
  ]);
</script>

<div class="dashboard">
  {#if showDataGapNotice}
    <Notice variant="warning" dismissible onDismiss={() => { showDataGapNotice = false; }} class="mb16">
      <strong>Some data is missing for April 18–19.</strong>&nbsp;&nbsp;A connector was offline. Historical totals may not reflect all activity.
    </Notice>
  {/if}

  <div class="dashboard-header">
    <h1 class="dashboard-title">Overview</h1>
    <div class="header-controls">
      <select class="header-select" bind:value={selectedDept} aria-label="Department">
        {#each divisions as div}
          <option value={div.value}>{div.label}</option>
        {/each}
      </select>

      <select class="header-select" bind:value={granularity} aria-label="Granularity">
        <option value="year">Year</option>
        <option value="month">Month</option>
        <option value="week">Week</option>
      </select>

      <div class="date-nav">
        <button class="date-nav-arrow" onclick={() => navigate(-1)} aria-label="Previous">‹</button>
        <span class="date-nav-label">{dateLabel}</span>
        <button class="date-nav-arrow" onclick={() => navigate(1)} disabled={!canGoForward} aria-label="Next">›</button>
      </div>
    </div>
  </div>

  <!-- Stat cards -->
  <div class="stats-grid">
    {#each stats as stat}
      <div class="stat-card bg-black-100" tabindex="0" role="figure" aria-label="{stat.label}: {stat.value}, {stat.change}">
        <span class="stat-label">{stat.label}</span>
        <div class="stat-value-row">
          <span class="stat-value">{stat.value}</span>
          <span class="stat-change" class:up={stat.good} class:down={!stat.good}>
            {#if stat.up}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 9V3M3 6l3-3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            {:else}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 3v6M9 6L6 9 3 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            {/if}
            {stat.change.replace(/^[+-]/, '')}
          </span>
        </div>
      </div>
    {/each}
  </div>

  <!-- Activity row (full width) -->
  <div class="chart-card" tabindex="0" role="figure" aria-label="Requests by channel">
    <div class="chart-header">
      <span class="chart-title">Requests by channel</span>
      <div class="chart-legend">
        {#each activitySeries as s}
          <span class="legend-item">
            <span class="legend-dot" style="background:{s.color}"></span>
            {s.label}
          </span>
        {/each}
      </div>
    </div>
    <div class="chart-body" style="height:240px">
      <BarChart
        data={activityData}
        x="label"
        series={activitySeries}
        seriesLayout="stack"
        bandPadding={0.3}
        padding={{ top: 0, right: 0, bottom: 0, left: 0 }}
        props={{
          bars: { radius: 3, stroke: 'none' },
          xAxis: { tickSize: 0, format: (d) => d },
          yAxis: { tickSize: 0, format: () => '' },
          grid: { y: { class: 'stroke-gray-100' } },
        }}
      />
    </div>
  </div>

  <!-- Two line charts side by side — hidden for now -->
  {#if false}
  <div class="two-col-grid">
    {#each lineCharts as chart}
      <div class="chart-card" tabindex="0" role="figure" aria-label={chart.title}>
        <div class="chart-header">
          <span class="chart-title">{chart.title}</span>
          <div class="chart-legend">
            {#each chart.series as s}
              <span class="legend-item">
                <span class="legend-dot" style="background:{s.color}"></span>
                {s.label}
              </span>
            {/each}
          </div>
        </div>
        <div class="chart-body">
          <LineChart
            data={chart.data}
            x="label"
            series={chart.series}
            yDomain={[null, null]}
            padding={{ top: 0, right: 0, bottom: 0, left: 0 }}
            props={{
              spline: { strokeWidth: 3, curve: curveMonotoneX },
              xAxis: { tickSize: 0, format: () => '' },
              yAxis: { tickSize: 0, format: () => '' },
              tooltip: { hideTotal: true },
            }}
          />
        </div>
      </div>
    {/each}
  </div>
  {/if}

  <!-- Adoption + Usage side by side -->
  <div class="two-col-grid">
    <div class="chart-card" tabindex="0" role="figure" aria-label="Adoption by Department">
      <div class="chart-header">
        <span class="chart-title">Adoption by Department</span>
        <span class="chart-subtitle">% of users active</span>
      </div>
      <div class="dept-list">
        {#each departments as dept}
          {@const pct = dept.users / dept.total}
          <div class="dept-row">
            <div class="dept-name">{dept.name}</div>
            <div class="dept-bar-wrap">
              <div class="dept-bar" style="background:{dept.trackColor}">
                <div class="dept-bar-fill" style="width:{(pct * 100).toFixed(0)}%; background:{dept.color}"></div>
              </div>
            </div>
            <div class="dept-pct">{(pct * 100).toFixed(0)}%</div>
          </div>
        {/each}
      </div>
    </div>

    <div class="chart-card" tabindex="0" role="figure" aria-label="Usage by Department">
      <div class="chart-header">
        <span class="chart-title">Usage by Department</span>
        <span class="chart-subtitle"># of requests</span>
      </div>
      <div class="dept-list">
        {#each usageDepts.list as dept}
          <div class="dept-row">
            <div class="dept-name">{dept.name}</div>
            <div class="dept-bar-wrap">
              <div class="dept-bar" style="background:{dept.trackColor}">
                <div class="dept-bar-fill" style="width:{(dept.requests / usageDepts.maxRequests * 100).toFixed(0)}%; background:{dept.color}"></div>
              </div>
            </div>
            <div class="dept-pct">{fmt(dept.requests)}</div>
          </div>
        {/each}
      </div>
    </div>
  </div>

</div>

<style>
  .dashboard {
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-height: 100%;
    box-sizing: border-box;
  }

  .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .dashboard-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--fc-dark);
    margin: 0;
    letter-spacing: -0.3px;
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-select {
    height: 32px;
    padding: 0 28px 0 10px;
    border: 1px solid var(--black-150);
    border-radius: 6px;
    background: var(--white) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23666' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 8px center;
    appearance: none;
    font-size: 13px;
    font-weight: 500;
    color: var(--fc-dark);
    cursor: pointer;
    font-family: inherit;
  }

  .header-select:focus { outline: none; border-color: var(--orange-500); }

  .date-nav {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 32px;
    border: 1px solid var(--black-150);
    border-radius: 6px;
    padding: 0 4px;
    background: var(--white);
    position: relative;
  }

  .date-nav-arrow {
    width: 24px;
    height: 24px;
    border: none;
    background: none;
    border-radius: 4px;
    font-size: 16px;
    line-height: 1;
    color: var(--fc-medium);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    font-family: inherit;
  }

  .date-nav-arrow:hover:not(:disabled) { background: var(--black-100); color: var(--fc-dark); }
  .date-nav-arrow:disabled { opacity: 0.35; cursor: default; }

  .date-nav-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--fc-dark);
    white-space: nowrap;
    padding: 0 6px;
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: default;
    min-width: 130px;
    justify-content: center;
  }

  .date-input-hidden {
    position: absolute;
    opacity: 0;
    pointer-events: none;
    width: 0;
    height: 0;
  }

  /* Stat cards */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  .stat-card {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border: none;
    border-radius: 4px;
    outline: none;
  }

  .stat-card:focus-visible {
    box-shadow: 0 0 0 2px var(--orange-500);
  }

  .stat-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--fc-medium);
  }

  .stat-icon {
    color: var(--fc-light);
    display: flex;
    align-items: center;
  }

  .stat-value-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 600;
    color: var(--fc-dark);
    letter-spacing: -0.5px;
    line-height: 1.1;
  }

  .stat-change {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 12px;
    font-weight: 600;
  }

  .stat-change.up   { color: var(--green-500); }
  .stat-change.down { color: var(--red-500); }

  /* Chart cards */
  .chart-card {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    outline: none;
    border-radius: 4px;
  }

  .chart-card:focus-visible {
    box-shadow: 0 0 0 2px var(--orange-500);
  }

  .chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .chart-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--fc-dark);
  }

  .chart-legend {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: var(--fc-medium);
  }

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .chart-body { height: 260px; }

  /* Department adoption */
  .chart-subtitle {
    font-size: 12px;
    color: var(--fc-light);
  }

  .dept-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .dept-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .dept-name {
    flex: 0 0 110px;
    font-size: 13px;
    font-weight: 500;
    color: var(--fc-dark);
  }

  .dept-bar-wrap { flex: 1; height: 8px; }

  .dept-bar {
    height: 100%;
    border-radius: 4px;
    overflow: hidden;
  }

  .dept-bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.4s ease;
  }

  .dept-pct {
    flex: 0 0 38px;
    text-align: right;
    font-size: 12px;
    font-weight: 600;
  }

  .dept-pct--high  { color: var(--green-500); }
  .dept-pct--mid   { color: var(--yellow-500); }
  .dept-pct--low   { color: var(--red-500); }

  .two-col-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  /* 2x2 metric area chart cards */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .metric-card {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow: hidden;
    border: none;
    border-radius: 4px;
  }

  .mc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .mc-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--fc-dark);
  }

  .mc-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 9px;
    border-radius: 20px;
  }

  .mc-metric {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .mc-value {
    font-size: 32px;
    font-weight: 600;
    color: var(--fc-dark);
    letter-spacing: -0.5px;
    line-height: 1;
  }

  .mc-change {
    font-size: 13px;
    font-weight: 600;
  }

  .mc-change.positive { color: var(--green-500); }
  .mc-change.negative { color: var(--red-500); }

  .mc-chart { height: 110px; }
</style>
