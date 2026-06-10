<!--
  KnowledgePipeline.svelte
  ========================
  A self-contained 5-step "Connecting your knowledge" pipeline flow.

  WHAT IT DOES
  ────────────
  Shows a vertically stacked, step-by-step pipeline that walks a user through
  how their connected knowledge sources are ingested and processed:

    Step 1 – Converting your knowledge  (sources + node counts)
    Step 2 – Breaking it into nodes     (chunks per source, shown as pills)
    Step 3 – Checking the source        (trust score per chunk, bar chart)
    Step 4 – Spotting what's stale      (stale vs current flagging)
    Step 5 – Finding disagreements      (conflict detection + resolution)

  Each step collapses to a one-line summary when complete. The active step
  shows a card with detail content, Back/Next buttons, and a footer summary.
  Completing the last step fires the `onComplete` callback.

  DEPENDENCIES
  ────────────
  1. @stackoverflow/stacks-icons/icons
       IconCheckFillCircle, IconAlertFill, IconLock, IconArrowRight,
       IconServiceSlack, IconServiceConfluence, IconServiceJira,
       IconServiceGoogleDrive
     → Used for source logos and status indicators.
     → If your project doesn't use Stacks icons, swap these with any icon
       system. The `Icon` component just renders an SVG string.

  2. @stackoverflow/stacks-svelte
       Icon    – renders a Stacks icon SVG
       Tag     – small pill/chip component (used in step 2)
       Popover, PopoverContent, PopoverReference – tooltip (used in step 4)
     → If your project doesn't use stacks-svelte, see the adaptation notes
       below for each component.

  3. Stacks CSS (global)
       The component uses Stacks utility classes for typography, spacing, and
       colour (e.g. fs-body2, fc-black-500, s-btn, s-badge, d-flex, g8, mb16).
       All layout and component-specific styles are in the <style> block.
     → If your project doesn't use Stacks CSS, replace the utility classes with
       your own system or inline styles. The <style> block handles the rest.

  ADAPTATION NOTES
  ────────────────
  • To remove the Stacks dependency entirely, replace:
      - `s-btn s-btn__primary s-btn__sm` → your primary button class
      - `s-btn s-btn__clear s-btn__sm`   → your secondary/ghost button class
      - `s-badge s-badge__bounty`        → a green badge component
      - `s-badge s-badge__muted`         → a muted/grey badge component
      - `fs-body2 fc-black-500 mb16`    → font-size, colour, margin utilities
      - `d-flex ai-center g8`            → flex layout utilities

  • `Tag` (step 2, chunking): renders a small pill with an icon + label.
    Replace with `<span class="your-pill-class">...</span>`.

  • `Popover` (step 4, staleness): shows a tooltip on the "Stale" badge.
    Replace with a native `<details>` element or any tooltip library.

  • The `onComplete` prop is called when the user clicks "All done" on step 5.
    Wire it up to whatever comes next in your app (e.g. navigate, show a modal).

  USAGE
  ─────
  <KnowledgePipeline onComplete={() => console.log('done!')} />

  Or with a custom "done" label:
  <KnowledgePipeline onComplete={goToChat} doneLabel="Start chatting" />
-->

<script lang="ts">
  import {
    IconServiceSlack, IconServiceConfluence, IconServiceJira, IconServiceGoogleDrive,
    IconCheckFillCircle, IconAlertFill, IconLock, IconArrowRight,
  } from '@stackoverflow/stacks-icons/icons';
  import { Icon, Tag, Popover, PopoverContent, PopoverReference } from '@stackoverflow/stacks-svelte';

  // ── Props ─────────────────────────────────────────────────────────────────────

  let {
    onComplete = () => {},
    doneLabel = 'All done',
  }: {
    onComplete?: () => void;
    doneLabel?: string;
  } = $props();

  // ── Stage definitions ─────────────────────────────────────────────────────────

  const STAGES = [
    { id: 'searching',  label: 'Converting your knowledge' },
    { id: 'chunking',   label: 'Breaking it into nodes' },
    { id: 'scoring',    label: 'Checking the source' },
    { id: 'staleness',  label: 'Spotting what\'s stale' },
    { id: 'conflicts',  label: 'Finding disagreements' },
  ] as const;

  type StageId = typeof STAGES[number]['id'];

  let currentIdx = $state(0);

  const isComplete = (i: number) => i < currentIdx;
  const isActive   = (i: number) => i === currentIdx;

  function next() { if (currentIdx < STAGES.length - 1) currentIdx++; }
  function back() { if (currentIdx > 0) currentIdx--; }
  function finish() { currentIdx = STAGES.length; }

  // ── Source data ───────────────────────────────────────────────────────────────
  //   Each source has: id, icon (Stacks SVG string or null), name, detail text,
  //   node count, and brand colour.

  const SOURCES = [
    { id: 'slack',      icon: IconServiceSlack,       name: 'Slack',       detail: '#engineering-platform', count: 1284, color: '#611f69' },
    { id: 'confluence', icon: IconServiceConfluence,   name: 'Confluence',  detail: 'Engineering Wiki',      count: 847,  color: '#0052cc' },
    { id: 'jira',       icon: IconServiceJira,         name: 'Jira',        detail: 'AUTH project',          count: 612,  color: '#0052cc' },
    { id: 'gdocs',      icon: IconServiceGoogleDrive,  name: 'Google Docs', detail: 'Architecture ADRs',     count: 394,  color: '#0f9d58' },
    { id: 'figma',      icon: null,                    name: 'Figma',       detail: 'Design System',         count: 203,  color: '#f24e1e' },
  ];

  // ── Chunk data ────────────────────────────────────────────────────────────────
  //   Each chunk is a discrete piece of knowledge from a source. Fields:
  //   id, source (matches SOURCES.id), text (excerpt), trust (0–100),
  //   stale (bool), conflict (bool), accessible (bool), sme (name or null).

  const CHUNKS = [
    { id: 'c1', source: 'confluence', text: '"All new services must use OAuth 2.0 with PKCE flow for user-facing authentication."',      trust: 94, stale: false, conflict: false, accessible: true,  sme: 'Ash Zade' },
    { id: 'c2', source: 'confluence', text: '"JWT tokens are deprecated as of Q4 2024 and must not be used for new implementations."',     trust: 91, stale: false, conflict: true,  accessible: true,  sme: 'Ash Zade' },
    { id: 'c3', source: 'confluence', text: '"Access token expiry must be 15 minutes; refresh tokens must not exceed 7 days."',            trust: 89, stale: false, conflict: false, accessible: true,  sme: 'Ash Zade' },
    { id: 'c4', source: 'gdocs',      text: '"Decision: Adopt OAuth 2.0 PKCE flow company-wide. All services to migrate by end of Q1."',  trust: 88, stale: false, conflict: false, accessible: true,  sme: null },
    { id: 'c5', source: 'slack',      text: '"We moved away from JWT last quarter — use the OAuth 2.0 PKCE flow, see the Confluence doc."', trust: 72, stale: false, conflict: false, accessible: true,  sme: null },
    { id: 'c6', source: 'jira',       text: 'AUTH-147: "Migrate auth service to OAuth 2.0 — replace JWT token issuance with PKCE flow."',  trust: 68, stale: false, conflict: false, accessible: true,  sme: null },
    { id: 'c7', source: 'slack',      text: '"AUTH-147 is tracking this — should be done by Q1. Ping Ash if you need unblocked."',         trust: 62, stale: false, conflict: false, accessible: true,  sme: null },
    { id: 'c8', source: 'gdocs',      text: '"JWT will remain supported until the full migration is complete."',                           trust: 45, stale: true,  conflict: true,  accessible: true,  sme: null },
    { id: 'c9', source: 'figma',      text: 'Login & SSO Flow v3 — wireframe showing OAuth 2.0 and SSO entry points.',                   trust: 55, stale: true,  conflict: false, accessible: false, sme: null },
  ];

  // ── Helpers ───────────────────────────────────────────────────────────────────

  const TRUST_COLOR = (t: number) => t >= 80 ? 'green' : t >= 60 ? 'yellow' : 'red';
  const sourceOf    = (id: string) => SOURCES.find(s => s.id === id)!;

  const staleReason: Record<string, string> = {
    gdocs: 'Last updated 14 months ago — predates the Q4 2024 deprecation decision.',
    figma: 'Last updated 8 months ago — wireframe hasn\'t tracked the OAuth migration.',
  };

  const SUMMARIES: Record<StageId, string> = {
    searching: '3,340 nodes found across 5 sources',
    chunking:  '9 nodes extracted and stored',
    scoring:   '6 pieces scored high or medium trust',
    staleness: '2 nodes flagged as stale',
    conflicts: '1 conflict found and resolved',
  };
</script>

<!-- ── Heading ─────────────────────────────────────────────────────────────── -->
<div class="section-heading">
  <h1 class="fs-headline1 fw-bold fc-black-900 mb0">Get started</h1>
</div>

<!-- ── Pipeline ───────────────────────────────────────────────────────────── -->
<div class="pipeline">
  {#each STAGES as stage, i}
    {@const complete = isComplete(i)}
    {@const active   = isActive(i)}
    <div class="stage-row" class:active class:complete>

      <!-- Step indicator: number dot + connector line -->
      <div class="step-indicator">
        <div class="step-dot" class:active class:complete>
          {#if complete}
            <Icon src={IconCheckFillCircle} class="fc-green-400" />
          {:else}
            <span class="step-number fs-caption fw-bold">{i + 1}</span>
          {/if}
        </div>
        {#if i < STAGES.length - 1}
          <div class="step-line" class:complete></div>
        {/if}
      </div>

      <!-- Stage content -->
      <div class="stage-content">

        <!-- Collapsed (completed) state -->
        {#if complete}
          <div class="stage-collapsed">
            <span class="fs-body2 fw-bold fc-black-700">{stage.label}</span>
            <span class="fs-caption fc-black-400 ml8">— {SUMMARIES[stage.id]}</span>
          </div>

        <!-- Active state -->
        {:else if active}
          <div class="stage-card">
            <div class="stage-card-header">
              <h2 class="fs-title fw-bold fc-black-900 mb4">{stage.label}</h2>
            </div>

            <!-- ── STEP 1: SEARCHING ────────────────────────────────────────── -->
            {#if stage.id === 'searching'}
              <p class="fs-body2 fc-black-500 mb16">Scanning every connected source for nodes of knowledge.</p>
              <div class="sources-grid">
                {#each SOURCES as src, si}
                  <div class="source-card" style="animation-delay: {si * 120}ms">
                    <div class="source-icon" style="background-color: {src.color}15; color: {src.color}">
                      {#if src.icon}
                        <Icon src={src.icon} />
                      {:else}
                        <!-- Figma has no Stacks icon — render a branded letter -->
                        <span class="figma-icon fw-bold fs-caption" style="color:{src.color}">F</span>
                      {/if}
                    </div>
                    <div class="source-info">
                      <span class="fs-body2 fw-bold fc-black-800">{src.name}</span>
                      <span class="fs-caption fc-black-400">{src.detail}</span>
                    </div>
                    <div class="source-count">
                      <span class="fs-caption fw-bold fc-green-600">{src.count.toLocaleString()} nodes</span>
                    </div>
                  </div>
                {/each}
              </div>
              <div class="stage-footer">
                <span class="fs-caption fc-black-400">3,340 nodes found across 5 sources</span>
                <button class="s-btn s-btn__primary s-btn__sm" onclick={next}>Next step <Icon src={IconArrowRight} /></button>
              </div>

            <!-- ── STEP 2: CHUNKING ─────────────────────────────────────────── -->
            {:else if stage.id === 'chunking'}
              <p class="fs-body2 fc-black-500 mb16">Each source is broken into individual, searchable nodes and stored in Stack Internal.</p>
              <div class="chunk-grid">
                {#each SOURCES as src}
                  {@const srcChunks = CHUNKS.filter(c => c.source === src.id)}
                  {#if srcChunks.length}
                    <div class="chunk-source-row">
                      <div class="chunk-pills">
                        {#each srcChunks as _, ci}
                          <Tag style="animation-delay: {ci * 80}ms">
                            {#if src.icon}
                              <Icon src={src.icon} class="fc-black-500" />
                            {:else}
                              <span class="fw-bold fs-caption" style="color:{src.color}">F</span>
                            {/if}
                            node {ci + 1}
                          </Tag>
                        {/each}
                      </div>
                    </div>
                  {/if}
                {/each}
              </div>
              <div class="stage-footer">
                <span class="fs-caption fc-black-400">9 nodes extracted and stored</span>
                <div class="d-flex g8">
                  <button class="s-btn s-btn__clear s-btn__sm" onclick={back}>Back</button>
                  <button class="s-btn s-btn__primary s-btn__sm" onclick={next}>Next step <Icon src={IconArrowRight} /></button>
                </div>
              </div>

            <!-- ── STEP 3: SCORING ─────────────────────────────────────────── -->
            {:else if stage.id === 'scoring'}
              <p class="fs-body2 fc-black-500 mb16">Each piece is scored based on who wrote it, how often it's been validated, and how widely it's cited. High scores mean you can act on it; low scores mean you should verify first.</p>
              <div class="score-list">
                {#each CHUNKS as chunk, ci}
                  {@const src = sourceOf(chunk.source)}
                  <div class="score-row" style="animation-delay: {ci * 80}ms">
                    <div class="score-source">
                      {#if src.icon}
                        <Icon src={src.icon} class="fc-black-400" />
                      {:else}
                        <span class="fw-bold fs-caption" style="color:{src.color}">F</span>
                      {/if}
                    </div>
                    <div class="score-text">
                      <span class="fs-caption fc-black-600">{chunk.text.slice(0, 72)}…</span>
                      {#if chunk.sme}
                        <span class="fs-caption fc-black-400 ml4">· SME: {chunk.sme}</span>
                      {/if}
                    </div>
                    <div class="score-bar-wrap">
                      <div class="score-bar score-bar--{TRUST_COLOR(chunk.trust)}" style="width: {chunk.trust}%"></div>
                    </div>
                    <span class="fs-caption fw-bold fc-{TRUST_COLOR(chunk.trust)}-600">{chunk.trust}</span>
                  </div>
                {/each}
              </div>
              <div class="stage-footer">
                <span class="fs-caption fc-black-400">6 pieces at 60+ trust; 3 below threshold</span>
                <div class="d-flex g8">
                  <button class="s-btn s-btn__clear s-btn__sm" onclick={back}>Back</button>
                  <button class="s-btn s-btn__primary s-btn__sm" onclick={next}>Next step <Icon src={IconArrowRight} /></button>
                </div>
              </div>

            <!-- ── STEP 4: STALENESS ───────────────────────────────────────── -->
            {:else if stage.id === 'staleness'}
              <p class="fs-body2 fc-black-500 mb16">Nodes that haven't been updated in a while may no longer reflect how things work. We flag them as stale so they don't quietly mislead you.</p>
              <div class="stale-list">
                <!-- Stale nodes first -->
                {#each CHUNKS.filter(c => c.stale) as chunk}
                  {@const src = sourceOf(chunk.source)}
                  <div class="stale-row stale-row--flagged">
                    <div class="stale-flag">
                      <!-- Popover shows the reason this chunk was flagged stale.
                           If you don't have a Popover component, replace with a
                           <details> element or a native title="" tooltip. -->
                      <Popover>
                        <PopoverReference>
                          <button class="stale-badge-btn">
                            <Icon src={IconAlertFill} class="fc-yellow-600" />
                            <span class="fs-caption fw-bold fc-yellow-700">Stale</span>
                          </button>
                        </PopoverReference>
                        <PopoverContent>
                          <p class="fs-caption fc-black-600 mb0">{staleReason[chunk.source]}</p>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div class="stale-source d-flex ai-center g4">
                      {#if src.icon}<Icon src={src.icon} class="fc-black-400" />{:else}<span class="fw-bold fs-caption" style="color:{src.color}">F</span>{/if}
                      <span class="fs-caption fw-bold fc-black-600">{src.name}</span>
                    </div>
                    <p class="fs-caption fc-black-500 mb0">{chunk.text}</p>
                  </div>
                {/each}
                <!-- Current (non-stale, accessible) nodes -->
                {#each CHUNKS.filter(c => !c.stale && c.accessible) as chunk}
                  {@const src = sourceOf(chunk.source)}
                  <div class="stale-row stale-row--ok">
                    <div class="stale-flag">
                      <Icon src={IconCheckFillCircle} class="fc-green-400" />
                      <span class="fs-caption fw-bold fc-green-700">Current</span>
                    </div>
                    <div class="stale-source d-flex ai-center g4">
                      {#if src.icon}<Icon src={src.icon} class="fc-black-400" />{:else}<span class="fw-bold fs-caption" style="color:{src.color}">F</span>{/if}
                      <span class="fs-caption fw-bold fc-black-600">{src.name}</span>
                    </div>
                    <p class="fs-caption fc-black-500 mb0">{chunk.text.slice(0, 80)}…</p>
                  </div>
                {/each}
              </div>
              <div class="stage-footer">
                <span class="fs-caption fc-black-400">2 nodes flagged as stale and down-weighted</span>
                <div class="d-flex g8">
                  <button class="s-btn s-btn__clear s-btn__sm" onclick={back}>Back</button>
                  <button class="s-btn s-btn__primary s-btn__sm" onclick={next}>Next step <Icon src={IconArrowRight} /></button>
                </div>
              </div>

            <!-- ── STEP 5: CONFLICTS ───────────────────────────────────────── -->
            {:else if stage.id === 'conflicts'}
              <p class="fs-body2 fc-black-500 mb16">When sources find different things, we decide when to surface a disagreement based on our trust signals.</p>
              <div class="conflict-box">
                <div class="conflict-header">
                  <Icon src={IconAlertFill} class="fc-orange-500" />
                  <span class="fs-body2 fw-bold fc-orange-700">Conflict detected · JWT deprecation</span>
                </div>
                <div class="conflict-sides">
                  <!-- Winning (higher trust) side -->
                  <div class="conflict-side conflict-side--winner">
                    <div class="conflict-side-label">
                      <Icon src={IconServiceConfluence} class="fc-black-400" />
                      <span class="fs-caption fw-bold fc-black-600">Confluence · Auth Standards v2.1</span>
                      <span class="s-badge s-badge__bounty ml-auto">Trust 91</span>
                    </div>
                    <p class="fs-body2 fc-black-700 mb0">"JWT tokens are deprecated as of Q4 2024 and must not be used for new implementations."</p>
                    <p class="fs-caption fc-black-400 mt4 mb0">Updated 2 weeks ago · SME-validated by Ash Zade</p>
                  </div>
                  <div class="conflict-vs">vs</div>
                  <!-- Losing (lower trust) side -->
                  <div class="conflict-side conflict-side--loser">
                    <div class="conflict-side-label">
                      <Icon src={IconServiceGoogleDrive} class="fc-black-400" />
                      <span class="fs-caption fw-bold fc-black-600">Google Docs · Auth ADR</span>
                      <span class="s-badge s-badge__muted ml-auto">Trust 45</span>
                    </div>
                    <p class="fs-body2 fc-black-500 mb0">"JWT will remain supported until the full migration is complete."</p>
                    <p class="fs-caption fc-black-400 mt4 mb0">Updated 14 months ago · predates the deprecation decision</p>
                  </div>
                </div>
                <div class="conflict-resolution">
                  <Icon src={IconCheckFillCircle} class="fc-green-400" />
                  <p class="fs-caption fc-black-600 mb0"><strong>Resolved:</strong> The Confluence statement is newer, higher trust, and SME-validated. The Google Docs statement is treated as superseded. We'll flag both in the answer so you can judge for yourself.</p>
                </div>
              </div>
              <div class="stage-footer">
                <span class="fs-caption fc-black-400">1 conflict found and resolved</span>
                <div class="d-flex g8">
                  <button class="s-btn s-btn__clear s-btn__sm" onclick={back}>Back</button>
                  <button class="s-btn s-btn__primary s-btn__md" onclick={finish}>Done</button>
                </div>
              </div>
            {/if}

          </div><!-- stage-card -->
        {/if}

      </div><!-- stage-content -->
    </div><!-- stage-row -->
  {/each}
</div><!-- pipeline -->

<style>
  .section-heading { margin-bottom: 32px; }

  /* ── Pipeline container ─────────────────────────────────────────────────── */
  .pipeline { display: flex; flex-direction: column; width: 100%; }

  .stage-row {
    display: flex;
    gap: 16px;
    min-height: 32px;
    width: 100%;
    min-width: 0;
  }

  /* ── Step indicator (dot + vertical line) ───────────────────────────────── */
  .step-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    width: 28px;
  }

  .step-dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid var(--black-200);
    background: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: border-color 0.2s, background 0.2s;
  }
  .step-dot.active   { border-color: var(--blue-500); }
  .step-dot.complete { border-color: transparent; }

  .step-number { color: var(--black-400); font-size: 11px; }

  .step-line {
    width: 2px;
    flex: 1;
    min-height: 16px;
    background: var(--black-200);
    transition: background 0.4s;
    margin: 3px 0;
  }
  .step-line.complete { background: var(--green-400); }

  /* ── Stage content area ─────────────────────────────────────────────────── */
  .stage-content {
    flex: 1;
    padding-bottom: 8px;
    min-width: 0;
    overflow: hidden;
  }

  .stage-collapsed {
    padding: 6px 0 16px;
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0;
  }

  .stage-card {
    background: var(--white);
    border: 1px solid var(--black-150);
    border-left: 3px solid var(--blue-500);
    border-radius: 0 8px 8px 0;
    padding: 20px 24px;
    margin-bottom: 16px;
    animation: slideIn 0.25s ease;
    width: 100%;
    box-sizing: border-box;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .stage-card-header { margin-bottom: 4px; }

  .stage-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--black-100);
    flex-wrap: wrap;
    gap: 8px;
  }

  /* ── Step 1: Searching / sources grid ───────────────────────────────────── */
  .sources-grid { display: flex; flex-direction: column; gap: 8px; }

  .source-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: var(--black-100);
    animation: fadeUp 0.3s ease both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .source-icon {
    width: 34px; height: 34px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .figma-icon { font-size: 14px; font-weight: 700; }

  .source-info  { flex: 1; display: flex; flex-direction: column; }
  .source-count { text-align: right; white-space: nowrap; }

  /* ── Step 2: Chunking / pill grid ───────────────────────────────────────── */
  .chunk-grid        { display: flex; flex-direction: column; gap: 10px; }
  .chunk-source-row  { display: flex; flex-wrap: wrap; }
  .chunk-pills       { display: flex; flex-wrap: wrap; gap: 6px; }

  /* ── Step 3: Scoring / trust bars ───────────────────────────────────────── */
  .score-list { display: flex; flex-direction: column; gap: 8px; }

  .score-row {
    display: grid;
    grid-template-columns: 20px 1fr 100px 28px;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid var(--black-100);
    animation: fadeUp 0.25s ease both;
  }

  .score-text   { min-width: 0; }
  .score-source { display: flex; align-items: center; }

  .score-bar-wrap {
    height: 6px;
    background: var(--black-150);
    overflow: hidden;
  }

  .score-bar            { height: 100%; transition: width 0.6s ease; }
  .score-bar--green     { background: var(--green-400); }
  .score-bar--yellow    { background: var(--yellow-300); }
  .score-bar--red       { background: var(--red-400); }

  /* ── Step 4: Staleness ──────────────────────────────────────────────────── */
  .stale-list { display: flex; flex-direction: column; gap: 8px; }

  .stale-row {
    display: grid;
    grid-template-columns: 90px 100px 1fr;
    align-items: start;
    gap: 10px;
    padding: 10px 12px;
  }

  .stale-row--flagged { background: var(--yellow-100); }
  .stale-row--ok      { background: var(--black-100); opacity: 0.8; }

  .stale-flag { display: flex; align-items: center; gap: 4px; }

  .stale-badge-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: inherit;
    text-decoration: underline dotted;
    text-underline-offset: 2px;
  }

  @media (max-width: 520px) {
    .stale-row { grid-template-columns: 1fr; }
  }

  /* ── Step 5: Conflicts ──────────────────────────────────────────────────── */
  .conflict-box {
    border: 1px solid var(--black-200);
    overflow: hidden;
  }

  .conflict-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: var(--black-100);
    border-bottom: 1px solid var(--black-200);
  }

  .conflict-sides {
    display: grid;
    grid-template-columns: 1fr 32px 1fr;
    gap: 0;
  }

  .conflict-side {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .conflict-side--winner { background: var(--black-050); }
  .conflict-side--loser  { background: var(--white); opacity: 0.75; }

  .conflict-side-label {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .conflict-vs {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--black-100);
    font-size: 11px;
    font-weight: 700;
    color: var(--black-400);
    border-left: 1px solid var(--black-150);
    border-right: 1px solid var(--black-150);
  }

  .conflict-resolution {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 16px;
    background: var(--black-075);
    border-top: 1px solid var(--black-200);
  }

  /* ── Dark mode overrides for white backgrounds ──────────────────────────── */
  :global(body.theme-dark) .step-dot { background: var(--black-100); }
  :global(body.theme-dark) .stage-card { background: var(--black-075); }
  :global(body.theme-dark) .conflict-side--loser { background: var(--black-075); }
</style>
