<script lang="ts">
  import {
    IconCompose, IconArrowUpRightBox, IconTrash, IconPlus,
    IconChevron12Left, IconDocument16, IconGlyph, IconAssistant,
    IconUser, IconServiceGoogleDrive, IconServiceGitHub,
    IconArrowUp,
  } from '@stackoverflow/stacks-icons/icons';
  import { Navigation, NavigationItem, Button } from '@stackoverflow/stacks-svelte';
  import PageWrapper from '$lib/components/PageWrapper.svelte';

  let activeTab = $state<'documents' | 'chat' | 'connectors'>('documents');

  const members = [
    { initials: 'LI', name: 'Lauren Ipsum',   bg: '#F48024' },
    { initials: 'AP', name: 'Amit Patel',      bg: '#7F5EDB' },
    { initials: 'SS', name: 'Sloane Sterlin',  bg: '#3B8EEA' },
    { initials: 'ER', name: 'Elena Rodriguez', bg: '#2D9B6F' },
  ];

  const activity = [
    { text: '2 new documents added', date: 'Apr 6, 2026' },
    { text: 'New chat session: "How do I expose our internal search as an MCP tool?"', date: 'Apr 6, 2026' },
    { text: 'MCP board — Linear connected as a source', date: 'Apr 3, 2026' },
  ];

  const googleDriveIcon = IconServiceGoogleDrive.replace('class="svg-icon', 'class="svg-icon native');
  const githubIcon = IconServiceGitHub.replace('class="svg-icon', 'class="svg-icon native');

  const documents = [
    { title: 'MCP integration request from engineering team',  author: 'Lauren Ipsum',   date: 'Apr 4, 2026',  sourceIconHtml: null,           sourceLabel: 'Email' },
    { title: 'MCP specification v1.0',                         author: 'Amit Patel',     date: 'Mar 28, 2026', sourceIconHtml: googleDriveIcon, sourceLabel: 'MCP Docs — Google Drive' },
    { title: 'Setting up an MCP server in Node.js',            author: 'Sloane Sterlin', date: 'Mar 14, 2026', sourceIconHtml: IconUser,        sourceLabel: 'Contributor' },
    { title: 'Tool and resource definition patterns',           author: 'Kofi Mensah',    date: 'Feb 22, 2026', sourceIconHtml: githubIcon,      sourceLabel: 'anthropics/anthropic-sdk' },
    { title: 'Connecting Stack Internal to Claude via MCP',    author: 'Elena Rodriguez', date: 'Feb 10, 2026', sourceIconHtml: IconArrowUp,    sourceLabel: 'Uploaded' },
  ];
</script>

<PageWrapper>
  <!-- Back button -->
  <div class="mb24" style="margin-left: -16px">
    <Button variant="clear" size="xs" href="/scopes">
      {#snippet children()}
        <span class="d-flex ai-center g4">
          {@html IconChevron12Left}
          Back
        </span>
      {/snippet}
    </Button>
  </div>

  <!-- Header -->
  <div class="row-spread mb12">
    <h1 class="fs-headline1 fw-bold fc-black-900 mb0">MCP</h1>
    <div class="d-flex ai-center g4">
      <button class="icon-action-btn">{@html IconCompose}</button>
      <button class="icon-action-btn">{@html IconArrowUpRightBox}</button>
      <button class="icon-action-btn">{@html IconTrash}</button>
    </div>
  </div>

  <!-- Description -->
  <p class="fs-body2 fc-black-400 mb24 lh-lg">
    Everything the platform team knows about MCP in one place. We've been building out our understanding of
    the Model Context Protocol since early 2026 — spec docs, server setup guides, transport patterns, and
    debugging techniques are all here. Most recently the team connected Linear as a source and shipped a guide
    on exposing internal search as an MCP tool.
  </p>

  <!-- Members row -->
  <div class="row-spread mb32">
    <div class="d-flex ai-center g12">
      <div class="d-flex ai-center member-avatars">
        {#each members as member, i}
          <div
            class="member-avatar d-flex ai-center jc-center fw-bold fc-white ff-sans"
            style="background: {member.bg}; z-index: {members.length - i}"
          >
            {member.initials}
          </div>
        {/each}
      </div>
      <span class="fs-body2 fc-black-600">
        {members.map(m => m.name).join(', ')}
      </span>
    </div>
    <Button variant="tonal">
      {#snippet children()}
        <span class="d-flex ai-center g4">
          {@html IconPlus}
          Invite
        </span>
      {/snippet}
    </Button>
  </div>

  <!-- Chat input -->
  <div class="chat-box mb40">
    <textarea
      class="chat-textarea"
      placeholder="Ask anything about MCP..."
      rows="3"
    ></textarea>
    <div class="row-spread px12 py12">
      <button class="s-btn s-btn__clear s-btn__sm s-btn__dropdown fw-bold">
        Claude Sonnet
      </button>
      <Button icon size="sm">
        {#snippet children()}
          {@html IconArrowUp}
        {/snippet}
      </Button>
    </div>
  </div>

  <!-- In this collection -->
  <h2 class="fs-title fw-bold fc-black-900 mb24 mt32">In this collection</h2>

  <div class="row-spread mb8">
    <span class="fs-caption fw-bold fc-black-400 tt-uppercase ls-loose">Since Apr 1, 2026</span>
    <a href="#" class="s-link fs-body2">View changelog</a>
  </div>
  <div class="mb28">
    {#each activity as item}
      <div class="row-spread py6">
        <div class="d-flex ai-start g8">
          <span class="activity-dot mt6"></span>
          <span class="fs-body2 fc-black-800">{item.text}</span>
        </div>
        <span class="fs-body2 fc-black-400 ws-nowrap ml24 fl-shrink0">{item.date}</span>
      </div>
    {/each}
  </div>

  <!-- Tabs -->
  <div class="mb20">
    <Navigation orientation="horizontal" label="Collection tabs">
      {#snippet children()}
        <NavigationItem
          text="Documents"
          icon={IconDocument16}
          selected={activeTab === 'documents'}
          onclick={() => activeTab = 'documents'}
        >
          {#snippet trailing()}
            <span class="s-badge s-badge__sm ml4">7</span>
          {/snippet}
        </NavigationItem>
        <NavigationItem
          text="Chat sessions"
          icon={IconAssistant}
          selected={activeTab === 'chat'}
          onclick={() => activeTab = 'chat'}
        >
          {#snippet trailing()}
            <span class="s-badge s-badge__sm ml4">4</span>
          {/snippet}
        </NavigationItem>
        <NavigationItem
          text="Connectors"
          icon={IconGlyph}
          selected={activeTab === 'connectors'}
          onclick={() => activeTab = 'connectors'}
        >
          {#snippet trailing()}
            <span class="s-badge s-badge__sm ml4">4</span>
          {/snippet}
        </NavigationItem>
      {/snippet}
    </Navigation>
  </div>

  <!-- Documents tab -->
  {#if activeTab === 'documents'}
    <div>
      {#each documents as doc, i}
        <div class="d-flex ai-start g12 py16">
          <span class="fc-black-300 mt2 fl-shrink0">{@html IconDocument16}</span>
          <div class="d-flex fd-column g4 fl-grow1 wmn0">
            <a href="#" class="s-link fw-semibold fs-body2 fc-black-900 td-none">{doc.title}</a>
            <div class="d-flex ai-center g6 fs-caption fc-black-400">
              <span class="d-flex ai-center g4">
                {@html IconUser}
                {doc.author}
              </span>
              <span>·</span>
              <span>{doc.date}</span>
              <span>·</span>
              <span class="d-flex ai-center g4">
                {#if doc.sourceIconHtml}
                  {@html doc.sourceIconHtml}
                {/if}
                {doc.sourceLabel}
              </span>
            </div>
          </div>
        </div>
      {/each}
    </div>

  {:else if activeTab === 'chat'}
    <p class="fc-black-400 fs-body2 py16">No chat sessions yet.</p>
  {:else}
    <p class="fc-black-400 fs-body2 py16">No connectors configured.</p>
  {/if}
</PageWrapper>

<style>
  /* Full-width flex row with space-between */
  .row-spread {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .member-avatars { gap: 0; }

  .member-avatar {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
    border: 2px solid white;
    margin-left: -8px;
    flex-shrink: 0;
  }
  .member-avatar:first-child { margin-left: 0; }

  .icon-action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 4px;
    color: var(--black-500);
    padding: 0;
  }
  .icon-action-btn:hover { background: var(--black-150); }
  .icon-action-btn :global(svg) { width: 18px; height: 18px; }

  .chat-box {
    background: var(--black-100);
    border-radius: 8px;
    overflow: hidden;
  }

  .chat-textarea {
    width: 100%;
    border: none;
    background: transparent;
    resize: none;
    padding: 16px;
    font-size: 15px;
    color: var(--black-800);
    box-shadow: none;
    outline: none;
    font-family: inherit;
    display: block;
    box-sizing: border-box;
  }
  .chat-textarea:focus { box-shadow: none; outline: none; }


  .activity-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--black-300);
    flex-shrink: 0;
    display: inline-block;
  }

  .lh-lg  { line-height: 1.65; }
  .py6    { padding-top: 6px; padding-bottom: 6px; }
  .mt6    { margin-top: 6px; }
  .mb28   { margin-bottom: 28px; }
  .mb20   { margin-bottom: 20px; }
  .ml24   { margin-left: 24px; }
.ls-loose { letter-spacing: 0.06em; }
</style>
