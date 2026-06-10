<script lang="ts">
  import { SpotConversation } from '@stackoverflow/stacks-icons/spots';
  import { IconChevron12Down, IconCompose, IconCompany, IconGlyph, IconMoreV, IconPlay, IconSearch, IconServiceMCP, IconQuestion, IconStackBoxes, IconTrash, IconUser } from '@stackoverflow/stacks-icons/icons';
  import { Notice, Modal, Button, Popover, PopoverReference, PopoverContent, Icon } from '@stackoverflow/stacks-svelte';
  import VerifiedBadge from '$lib/components/VerifiedBadge.svelte';
  import { marked } from 'marked';
  import { untrack, tick } from 'svelte';
  import { newChatSignal } from '$lib/stores/chat';
  import { selectedDemoId } from '$lib/stores/demo';
  import { tabsState } from '$lib/stores/tabs.svelte';
  import SlidePanel from '$lib/components/SlidePanel.svelte';
  import ChatTabs from '$lib/components/ChatTabs.svelte';
  import SearchingIndicator from '$lib/components/SearchingIndicator.svelte';
  import { goto } from '$app/navigation';

  // Configure marked for clean output
  marked.setOptions({ breaks: false });

  function renderMarkdown(text: string): string {
    return marked.parse(text) as string;
  }

  // Add `native` class so Stacks CSS doesn't override the spot's hardcoded fill colors
  const conversationSpot = SpotConversation.replace('class="svg-spot', 'class="svg-spot native');

  // --- Chat state ---
  type Message = { role: 'user' | 'assistant'; content: string };

  // Messages stored per tab id; tab metadata lives in the shared tabsState store
  let tabMessages = $state<Record<number, Message[]>>({
    1: [],
  });

  let messages = $state<Message[]>([]);
  let inputValue = $state('');
  let isLoading = $state(false);
  let firstReplyDone = $state(false);
  let streamingContent = $state('');
  let messagesEl = $state<HTMLDivElement | null>(null);
  let textareaEl = $state<HTMLTextAreaElement | null>(null);
  let singleLineHeight = 0;
  let narrowWidth = 0; // textarea width in compact (row) layout
  let isExpanded = $state(false);
  let streamController: AbortController | null = null;

  $effect(() => {
    inputValue; // track reactive changes
    if (!textareaEl) return;

    // Measure single-line height once (in compact layout, no text)
    if (!singleLineHeight) {
      textareaEl.style.height = 'auto';
      singleLineHeight = textareaEl.scrollHeight;
    }

    // Capture the narrow width only while in compact layout
    if (!isExpanded && textareaEl.offsetWidth > 0) {
      narrowWidth = textareaEl.offsetWidth;
    }

    // Always measure wrapping against the narrow width, even when expanded.
    // Synchronous — no paint occurs between the set and restore.
    let wrapsAtNarrow = false;
    if (narrowWidth > 0) {
      textareaEl.style.width = narrowWidth + 'px';
      textareaEl.style.height = 'auto';
      wrapsAtNarrow = textareaEl.scrollHeight > singleLineHeight;
      textareaEl.style.width = ''; // always restore cleanly; CSS takes over
    }

    // Set height based on current layout width (CSS now controls width after restore)
    textareaEl.style.height = 'auto';
    textareaEl.style.height = textareaEl.scrollHeight + 'px';
    // Reset scroll only when content fits — once max-height kicks in, let the
    // browser keep the cursor visible rather than snapping back to the top.
    if (textareaEl.scrollHeight <= textareaEl.clientHeight) {
      textareaEl.scrollTop = 0;
    }

    isExpanded = wrapsAtNarrow;
  });

  // Abort any in-flight stream when navigating away
  $effect(() => {
    return () => { streamController?.abort(); };
  });
  let messageFeedback = $state<Record<number, 'up' | 'down'>>({});

  // --- API key state ---
  let showKeyPopover = $state(false);
  let keyInput = $state('');
  let savedKey = $state('');

  $effect(() => {
    savedKey = localStorage.getItem('anthropic_api_key') || '';
    keyInput = savedKey;
  });

  // Auto-send message passed via ?q= from the Home page
  let _autoSendDone = false;
  $effect(() => {
    if (_autoSendDone) return;
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) {
      _autoSendDone = true;
      history.replaceState({}, '', '/');
      sendMessage(q);
    }
  });

  // Trigger new chat when sidebar Chat link is clicked
  let _signalInit = false;
  $effect(() => {
    const val = $newChatSignal;
    if (!_signalInit) { _signalInit = true; return; }
    void val;
    untrack(() => newChat());
  });

  function clearInputValue() {
    inputValue = '';
  }

  function getApiKey(): string {
    return savedKey;
  }

  function saveApiKey() {
    localStorage.setItem('anthropic_api_key', keyInput.trim());
    savedKey = keyInput.trim();
    showKeyPopover = false;
  }

  function clearApiKey() {
    localStorage.removeItem('anthropic_api_key');
    savedKey = '';
    keyInput = '';
  }

  const DEMO_RESPONSE = `## This Sprint's Shipping Plan (Sprint 47 — Jan 20–31)

Based on the latest updates from the Product & Engineering sync yesterday, here's what's rolling out:

### Core Releases

- **Dashboard v3.2** — New analytics widgets and improved load times. QA sign-off complete; targeting Tuesday deployment.
- **API Rate Limiting (v2)** — Graduated rollout to enterprise tier customers. Engineering team (led by Marco) finishing stress tests this week.
- **Onboarding Flow Redesign** — Mobile-first UX refresh. Going live Thursday morning with a 10% canary before full release Friday.

### Supporting Updates

- Security patches for the auth service (CVE backlog)
- Database migration for the reporting pipeline (running overnight Jan 29)
- Docs refresh for the new webhook integrations

**Status:** Two features are on track, one (the notification preferences refactor) slipped to Sprint 48 due to scope creep on the design side. No blockers currently.

Check the [#sprint-47-status](#) Slack channel for daily standups, or ping the Product team if you need more details on timeline or rollback plans.`;

  const demoVerifiedLabel = 'Corroborated by 2 sources from 6 weeks ago, plus 3 others';
  const demoVerifiedSourceTitle = 'Project Yak brief';
  const demoVerifiedSourceAuthor = 'Giamir Buoncristiani';
  const demoVerifiedSourceDate = 'April 22, 2026';

  let demoVerifiedOpen = $state(false);
  let demoVerifiedCloseTimer: ReturnType<typeof setTimeout> | null = null;

  function isBoilerplateResponse(content: string) {
    return content === DEMO_RESPONSE;
  }

  function openDemoVerified() {
    if (demoVerifiedCloseTimer) {
      clearTimeout(demoVerifiedCloseTimer);
      demoVerifiedCloseTimer = null;
    }
    demoVerifiedOpen = true;
  }

  function closeDemoVerifiedWithDelay() {
    if (demoVerifiedCloseTimer) clearTimeout(demoVerifiedCloseTimer);
    demoVerifiedCloseTimer = setTimeout(() => {
      demoVerifiedOpen = false;
      demoVerifiedCloseTimer = null;
    }, 120);
  }

  async function simulateResponse(signal: AbortSignal, initialDelayMs = 800) {
    await new Promise(resolve => setTimeout(resolve, initialDelayMs));
    if (signal.aborted) return;

    // Stream the demo response character by character
    const chunkSize = 3;
    const delay = 18;
    for (let i = 0; i < DEMO_RESPONSE.length; i += chunkSize) {
      if (signal.aborted) return;
      streamingContent += DEMO_RESPONSE.slice(i, i + chunkSize);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    if (!signal.aborted) {
      messages = [...messages, { role: 'assistant', content: streamingContent }];
      streamingContent = '';
    }
  }

  function generateDemoTabLabel(userText: string): string {
    const words = userText.trim().split(/\s+/).slice(0, 4).join(' ');
    return words.length > 30 ? words.slice(0, 30) : words;
  }

  async function callAnthropicProxy(apiKey: string, msgs: Message[], signal?: AbortSignal): Promise<Response> {
    const anthropicBody = {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      stream: true,
      system: `You are Stack, an AI assistant embedded in Acme's internal knowledge base. Your job is to demo what a verified, AI-powered answer looks like inside a knowledge management product.

For every question, respond as if you have full access to Acme's internal documents, Slack channels, wikis, and project history — and you always find a relevant answer. Make up realistic, specific, plausible details (names, project codenames, team names, dates, decisions) that feel like they came from a real company. Never say you don't know or that you lack access — always produce a confident, helpful answer.

Keep responses concise (2–4 short paragraphs or a short bulleted list). Write in a clear, professional tone. Format with markdown where it helps readability.`,
      messages: msgs.map((m) => ({ role: m.role, content: m.content })),
    };

    // Try server proxy first — server uses its own ANTHROPIC_API_KEY env var.
    // Client key is sent as fallback for local dev when no server key is configured.
    try {
      const proxyRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ apiKey, ...anthropicBody }),
        signal,
      });
      if (proxyRes.status !== 404) return proxyRes;
    } catch {
      // proxy not available — try direct
    }

    // Direct fallback (requires a client key; works only if org allows browser access)
    if (!apiKey) throw new Error('no-key');
    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(anthropicBody),
      signal,
    });
  }

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;

    const apiKey = getApiKey();

    const isFirstMessage = messages.length === 0;
    const isFirstReply = !firstReplyDone;
    const tabIdAtSend = tabsState.activeTabId;

    const userMsg: Message = { role: 'user', content: text.trim() };
    messages = [...messages, userMsg];
    clearInputValue();
    isLoading = true;
    const loadStart = Date.now();
    const waitMinLoad = () => {
      if (!isFirstReply) return Promise.resolve();
      const remaining = 3000 - (Date.now() - loadStart);
      return remaining > 0 ? new Promise<void>(r => setTimeout(r, remaining)) : Promise.resolve();
    };

    // Scroll so the new user message sits 8px below the sticky header
    await tick();
    requestAnimationFrame(() => {
      if (!messagesEl) return;
      const userMessages = messagesEl.querySelectorAll('.message-user');
      const lastUserMsg = userMessages[userMessages.length - 1] as HTMLElement | undefined;
      if (lastUserMsg) {
        const headerEl = messagesEl.querySelector('header');
        const headerBottom = headerEl ? headerEl.getBoundingClientRect().bottom : 0;
        const scrollDelta = lastUserMsg.getBoundingClientRect().top - headerBottom - 8;
        messagesEl.scrollTo({ top: messagesEl.scrollTop + scrollDelta, behavior: 'instant' });
      }
    });
    streamingContent = '';

    streamController?.abort();
    streamController = new AbortController();
    const { signal } = streamController;

    // Fire label generation on first message of a tab (non-blocking)
    if (isFirstMessage) {
      generateTabLabel(text.trim(), tabIdAtSend);
    }

    try {
      const response = await callAnthropicProxy(apiKey, messages, signal);

      if (response.status === 401) {
        // No valid key available — fall back to demo simulation
        await simulateResponse(signal, isFirstReply ? 3000 : 800);
        if (isFirstMessage && !signal.aborted) {
          tabsState.renameTab(tabIdAtSend, generateDemoTabLabel(text.trim()));
        }
        return;
      }
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API error ${response.status}: ${errorBody}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let firstToken = true;

      while (!signal.aborted) {
        const { done, value } = await reader.read();
        if (done || signal.aborted) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
                if (firstToken) { await waitMinLoad(); firstToken = false; }
                streamingContent += parsed.delta.text;
              }
            } catch {
              // ignore parse errors on SSE chunks
            }
          }
        }
      }

      messages = [...messages, { role: 'assistant', content: streamingContent }];
      streamingContent = '';
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      // API unavailable (no key, network error, etc.) — fall back to demo simulation
      await simulateResponse(signal, isFirstReply ? 3000 : 800);
      if (isFirstMessage && !signal.aborted) {
        tabsState.renameTab(tabIdAtSend, generateDemoTabLabel(text.trim()));
      }
    } finally {
      if (streamingContent) {
        messages = [...messages, { role: 'assistant', content: streamingContent }];
        streamingContent = '';
      }
      isLoading = false;
      firstReplyDone = true;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitChatInput();
    }
  }

  function submitChatInput() {
    if (!inputValue.trim() || isLoading) return;
    if (!hasMessages) {
      navigateToDemo1();
      return;
    }
    sendMessage(inputValue);
  }

  function saveActiveTab() {
    tabMessages = { ...tabMessages, [tabsState.activeTabId]: [...messages] };
  }

  function switchTab(id: number) {
    saveActiveTab();
    tabsState.setActiveTab(id);
    messages = [...(tabMessages[id] ?? [])];
    streamingContent = '';
    isLoading = false;
    showSources = false;
  }

  function newChat() {
    saveActiveTab();
    const id = tabsState.newTab();
    tabMessages = { ...tabMessages, [id]: [] };
    messages = [];
    streamingContent = '';
    clearInputValue();
    isLoading = false;
    firstReplyDone = false;
    showSources = false;
  }

  function closeTab(id: number) {
    const isActive = id === tabsState.activeTabId;
    if (tabsState.tabs.length === 1) {
      // Last tab — just clear it instead of removing
      messages = [];
      streamingContent = '';
      clearInputValue();
      isLoading = false;
      showSources = false;
      tabsState.renameTab(id, 'New chat');
      tabMessages = { ...tabMessages, [id]: [] };
      return;
    }
    const newActiveId = tabsState.closeTab(id);
    const { [id]: _, ...rest } = tabMessages;
    tabMessages = rest;
    if (isActive) {
      messages = [...(tabMessages[newActiveId] ?? [])];
      streamingContent = '';
      isLoading = false;
      showSources = false;
    }
  }

  async function generateTabLabel(userText: string, tabId: number) {
    const apiKey = getApiKey();
    if (!apiKey) return;
    const body = {
      apiKey,
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 12,
      stream: false,
      system: 'Create a 2–4 word title for this chat topic. Reply with ONLY the title — no punctuation, no quotes.',
      messages: [{ role: 'user', content: userText }],
    };
    try {
      let res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 404) {
        const { apiKey: _k, ...direct } = body;
        res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json', 'anthropic-dangerous-direct-browser-access': 'true' },
          body: JSON.stringify(direct),
        });
      }
      if (res.ok) {
        const data = await res.json();
        const label = data.content?.[0]?.text?.trim() || 'Chat';
        tabsState.renameTab(tabId, label);
      }
    } catch {
      // ignore — label stays as "New chat"
    }
  }

  async function navigateToDemo1() {
    if (isPlayingDemo) return;
    isPlayingDemo = true;
    inputValue = '';
    for (const ch of 'Who is leading project Yak?') {
      inputValue += ch;
      await new Promise((r) => setTimeout(r, 40));
    }
    await new Promise((r) => setTimeout(r, 500));
    await goto('/demo/1?autoplay=1');
  }

  const hasMessages = $derived(messages.length > 0 || isLoading);

  // Auto-hide header on mobile when scrolling down through messages
  let headerHidden = $state(false);
  let _lastScrollY = 0;

  $effect(() => {
    if (!hasMessages) { headerHidden = false; _lastScrollY = 0; }
  });

  function handleContentScroll(e: Event) {
    const el = e.currentTarget as HTMLDivElement;
    const y = el.scrollTop;
    if (y <= 10) {
      headerHidden = false;
    } else if (y > _lastScrollY + 4) {
      headerHidden = true;
    } else if (y < _lastScrollY - 4) {
      headerHidden = false;
    }
    _lastScrollY = y;
  }

  let showErrorNotice = $state(false);
  let showAboutModal = $state(false);

  $effect(() => {
    if (!sessionStorage.getItem('about-modal-seen')) {
      showAboutModal = true;
      sessionStorage.setItem('about-modal-seen', '1');
    }
  });

  // Side panels
  let showSources = $state(false);
  let sourcesWidth = $state(360);
  let showHistory = $state(false);
  let historyWidth = $state(360);

  // History items (static demo data)
  type HistoryItem = { id: number; label: string; date: string };
  let historyItems = $state<HistoryItem[]>([
    { id: 1, label: 'Who is leading project Yak?', date: 'Today' },
    { id: 2, label: 'Is there a Project Yak prototype?', date: 'Today' },
    { id: 3, label: 'Q3 OKR progress update', date: 'Yesterday' },
    { id: 4, label: 'Oncall rotation for infra team', date: 'Yesterday' },
    { id: 5, label: 'How does our SSO setup work?', date: 'May 1' },
    { id: 6, label: 'Engineering hiring plan FY27', date: 'Apr 30' },
    { id: 7, label: 'Design system migration status', date: 'Apr 28' },
  ]);
  let historyMenuOpenId = $state<number | null>(null);
  let historyRenameId = $state<number | null>(null);
  let historyRenameValue = $state('');
  let historySearch = $state('');

  function startRename(item: HistoryItem) {
    historyMenuOpenId = null;
    historyRenameId = item.id;
    historyRenameValue = item.label;
  }

  function saveRename() {
    if (!historyRenameValue.trim() || !historyRenameId) return;
    historyItems = historyItems.map(h =>
      h.id === historyRenameId ? { ...h, label: historyRenameValue.trim() } : h
    );
    historyRenameId = null;
  }
  const filteredHistory = $derived(
    historySearch.trim()
      ? historyItems.filter(h => h.label.toLowerCase().includes(historySearch.toLowerCase()))
      : historyItems
  );

  // Demo selector
  let demoMenuOpen = $state(false);
  let selectedDemo = $state<string | null>(null);
  let isPlayingDemo = $state(false);

  function selectDemo(id: string) {
    selectedDemo = id;
    selectedDemoId.set(id);
    demoMenuOpen = false;
  }

  const demoConfig: Record<string, { firstQuestion: string; route: string }> = {
    'investigate-project': {
      firstQuestion: 'Who is leading project Yak?',
      route: '/demo/1?autoplay=1',
    },
    'scene-product-prototype': {
      firstQuestion: 'Is there a Project Yak prototype?',
      route: '/demo/2?autoplay=1',
    },
  };

  async function playDemo() {
    if (isPlayingDemo || !selectedDemo) return;
    const config = demoConfig[selectedDemo];
    if (!config) return;
    isPlayingDemo = true;
    inputValue = '';
    for (const ch of config.firstQuestion) {
      inputValue += ch;
      await new Promise((r) => setTimeout(r, 40));
    }
    await new Promise((r) => setTimeout(r, 500));
    await goto(config.route);
  }
  let sourceFilters = $state<Record<string, boolean>>({
    stack: true,
    docs: true,
    slack: true,
    stackoverflow: false,
  });

  const activeSources = [
    {
      type: 'stack',
      sourceName: 'Stack Internal Community',
      title: 'Standard Dockerfile templates for Python services using Corporate Root CA',
      author: 'Sloane Sterlin',
      date: 'Feb 9, 2026',
    },
    {
      type: 'stack',
      sourceName: 'Stack Internal Community',
      title: 'How do I resolve SSL: CERTIFICATE_VERIFY_FAILED when connecting to the Atlas-Data-Lake internal API from a local Docker container?',
      author: 'Amit Patel',
      date: 'Nov 11, 2025',
    },
    {
      type: 'docs',
      sourceName: 'Google Docs',
      title: 'Zscaler certificate propagation notes for local development',
      author: 'Kofi Mensah',
      date: 'Sep 2, 2025',
    },
    {
      type: 'docs',
      sourceName: 'Google Docs',
      title: 'Atlas-Data-Lake internal API connection strings',
      author: 'Elena Rodriguez',
      date: 'Jul 16, 2025',
    },
  ];

  const sourceOptions = [
    { id: 'stack', label: 'Stack Internal Community', icon: 'stack' },
    { id: 'docs', label: 'Google Docs', icon: 'docs' },
    { id: 'slack', label: 'Slack', icon: 'slack' },
    { id: 'stackoverflow', label: 'Stack Overflow', icon: 'stackoverflow' },
  ];
  const selectedSourceOptions = $derived(sourceOptions.filter(source => sourceFilters[source.id]));
  const selectedSourceCount = $derived(selectedSourceOptions.length);
  const filteredSources = $derived(activeSources.filter(source => sourceFilters[source.type]));

  function isLastSelectedSource(sourceId: string) {
    return Boolean(sourceFilters[sourceId] && selectedSourceCount === 1);
  }
</script>

<div class="chat-page">
  <div class="chat-left">
  <!-- Body: chat content + sources panel side by side -->
  <div class="chat-body" onclick={() => { showSources = false; showHistory = false; }}>
    <div class="chat-content" bind:this={messagesEl} onscroll={handleContentScroll}>
  <!-- Page header bar -->
  <header class="chat-header" class:header-hidden={headerHidden && hasMessages}>
    <div class="header-left">
      <Popover id="demo-selector-popover" placement="bottom-start" strategy="fixed" visible={demoMenuOpen} onoutclick={() => (demoMenuOpen = false)}>
        <PopoverReference>
          <button type="button" class="s-btn s-btn__clear org-trigger" onclick={(e) => { e.stopPropagation(); demoMenuOpen = !demoMenuOpen; }}>
            <Icon src={IconCompany} class="org-icon" />
            <span class="org-name">Acme Demo</span>
            <Icon src={IconChevron12Down} class="org-chevron fc-black-400" />
          </button>
        </PopoverReference>
        <PopoverContent role="menu" class="demo-selector-popover">
          <button
            type="button"
            class="demo-menu-item"
            class:demo-menu-item--selected={selectedDemo === 'investigate-project'}
            onclick={() => selectDemo('investigate-project')}
          >
            Scene: Technical lead wants to investigate a project they heard about in a meeting
          </button>
          <button
            type="button"
            class="demo-menu-item"
            class:demo-menu-item--selected={selectedDemo === 'scene-product-prototype'}
            onclick={() => selectDemo('scene-product-prototype')}
          >
            Scene: Product lead wants to know if there's a prototype they can access, then asks a follow-up question
          </button>
        </PopoverContent>
      </Popover>
      {#if selectedDemo}
        <Button weight="clear" size="sm" iconOnly aria-label="Play demo" onclick={playDemo} disabled={isPlayingDemo}>
          <Icon src={IconPlay} class="play-demo-icon" />
        </Button>
      {/if}
    </div>

    <div class="header-center">
      <ChatTabs
        ontabclick={(id) => switchTab(id)}
        ontabclose={(id) => closeTab(id)}
      />
    </div>

    <div class="header-right">
      <button class="s-btn s-btn__clear d-flex ai-center g6" aria-label="Chat history" onclick={(e) => { e.stopPropagation(); showHistory = !showHistory; }}>
        <svg aria-hidden="true" class="svg-icon iconClock" width="18" height="18" viewBox="0 0 18 18"><path d="M9 17c-4.36 0-8-3.64-8-8s3.64-8 8-8 8 3.64 8 8-3.64 8-8 8m0-2c3.27 0 6-2.73 6-6s-2.73-6-6-6-6 2.73-6 6 2.73 6 6 6M8 5h1.01L9 9.36l3.22 2.1-.6.93L8 10z"/></svg>
        <span>History</span>
      </button>

      <button class="new-chat-btn" onclick={newChat}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span class="new-chat-label">New chat</span>
      </button>
    </div>
  </header>

    <div class="chat-centered">

  <!-- Main content -->
  <main class="chat-main" class:chat-main--messages={hasMessages}>
    {#if !hasMessages}
      <!-- Hero state -->
      <div class="hero">
        <div class="spot-illustration" aria-hidden="true">{@html conversationSpot}</div>
        <h1 class="hero-title">Get trusted answers</h1>
        <p class="hero-subtitle">
          Stack Internal works across your connected sources<br>
          to give humans and agents decision-grade knowledge.
        </p>
        <div class="hero-ctas">
          <button class="cta-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 7l-3 3 3 3M15 7l3 3-3 3M12 4l-4 12" stroke="#FF5E00" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Install the CLI
          </button>
          <button class="cta-btn">
            <span class="cta-icon">{@html IconServiceMCP}</span>
            Add the MCP
          </button>
        </div>
        {#if !selectedDemo}
          <button class="about-btn" onclick={() => showAboutModal = true}>About this prototype</button>
        {/if}
      </div>
    {:else}
      <!-- Chat messages -->
      <div class="messages-inner">
          {#each messages as message, i (message)}
            <div class="message" class:message-user={message.role === 'user'} class:message-assistant={message.role === 'assistant'}>
              {#if message.role === 'assistant'}
                <div class="message-body">
                <div class="message-bubble md">{@html renderMarkdown(message.content)}</div>
                <!-- Response footer -->
                <div class="response-footer">
                  <div class="response-footer-left">
                    {#if isBoilerplateResponse(message.content)}
                      <Popover id={`response-verified-popover-${i}`} placement="top-start" visible={demoVerifiedOpen}>
                        <PopoverReference>
                          <button
                            type="button"
                            class="verified-badge-trigger"
                            aria-label={demoVerifiedLabel}
                            onmouseenter={openDemoVerified}
                            onmouseleave={closeDemoVerifiedWithDelay}
                            onfocus={openDemoVerified}
                            onblur={closeDemoVerifiedWithDelay}
                            onclick={openDemoVerified}
                          >
                            <VerifiedBadge label={demoVerifiedLabel} />
                          </button>
                        </PopoverReference>
                        <PopoverContent class="verified-sources-popover" role="dialog">
                          <div
                            class="d-flex fd-column"
                            role="presentation"
                            onmouseenter={openDemoVerified}
                            onmouseleave={closeDemoVerifiedWithDelay}
                            onfocusin={openDemoVerified}
                            onfocusout={closeDemoVerifiedWithDelay}
                          >
                            <div class="verified-checks-section d-flex fd-column g12">
                              <div class="fs-body1 fw-bold fc-black-800">Checks</div>
                              <div class="d-flex fd-column g6">
                                <div class="d-flex ai-center g6">
                                  <Icon src={IconCheck} class="verified-check-icon" />
                                  <span class="fs-body1 verified-check-label">2 sources from 6 weeks ago</span>
                                </div>
                                <div class="d-flex ai-center g6">
                                  <Icon src={IconCheck} class="verified-check-icon" />
                                  <span class="fs-body1 verified-check-label">Authored by Giamir Buoncristiani (Staff Developer)</span>
                                </div>
                              </div>
                            </div>
                            <div class="verified-sources-section d-flex fd-column g16">
                              <div class="verified-sources-heading fs-body1 fw-bold fc-black-800">Sources</div>
                              <a
                                class="verified-source-item d-flex fd-column g6 td-none"
                                href="https://docs.google.com/document/d/1mkO6TcOXCQs9G_MQl1udGMVnwSVA7Blda6wDpkoiSts/edit?usp=sharing"
                                target="_blank"
                                rel="noreferrer"
                              >
                                <div class="d-flex ai-center g6">
                                  <img class="inline-source-logo" src="/icon-google-docs.svg" alt="" aria-hidden="true" />
                                  <span class="fs-caption fw-bold fc-black-600 lh-sm">{demoVerifiedSourceTitle}</span>
                                </div>
                                <div class="d-flex ai-center g6 fs-caption fc-black-600">
                                  <Icon src={IconUser} class="inline-source-meta-icon fc-black-400" />
                                  <span>{demoVerifiedSourceAuthor}</span>
                                  <Icon src={IconCalendar} class="inline-source-meta-icon inline-source-date-icon fc-black-400" />
                                  <span>{demoVerifiedSourceDate}</span>
                                </div>
                              </a>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    {:else}
                      <span class="verified-badge"><VerifiedBadge /></span>
                    {/if}
                    <Popover id={`response-good-tooltip-${i}`} placement="bottom" tooltip>
                      <PopoverReference>
                        <button class="response-action" class:feedback-active={messageFeedback[i] === 'up'} aria-label="Upvote"
                          onclick={() => { messageFeedback[i] = messageFeedback[i] === 'up' ? undefined as any : 'up'; }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                          </svg>
                        </button>
                      </PopoverReference>
                      <PopoverContent class="response-tooltip">Good response</PopoverContent>
                    </Popover>
                    <Popover id={`response-bad-tooltip-${i}`} placement="bottom" tooltip>
                      <PopoverReference>
                        <button class="response-action" class:feedback-active={messageFeedback[i] === 'down'} aria-label="Downvote"
                          onclick={() => { messageFeedback[i] = messageFeedback[i] === 'down' ? undefined as any : 'down'; }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
                            <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                          </svg>
                        </button>
                      </PopoverReference>
                      <PopoverContent class="response-tooltip">Bad response</PopoverContent>
                    </Popover>
                    <Popover id={`response-copy-tooltip-${i}`} placement="bottom" tooltip>
                      <PopoverReference>
                        <button class="response-action" aria-label="Copy">
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="6" y="6" width="9" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
                            <path d="M4 12H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                          </svg>
                        </button>
                      </PopoverReference>
                      <PopoverContent class="response-tooltip">Copy response</PopoverContent>
                    </Popover>
                  </div>
                </div>
                </div><!-- end .message-body -->
              {:else}
                <div class="message-bubble">{message.content}</div>
              {/if}
            </div>
          {/each}

          {#if streamingContent}
            <div class="message message-assistant">
              <div class="message-bubble md">{@html renderMarkdown(streamingContent)}<span class="cursor" aria-hidden="true">▋</span></div>
            </div>
          {:else if isLoading}
            <div class="message message-assistant">
              <div class="message-bubble">
                {#if !firstReplyDone}
                  <SearchingIndicator />
                {:else}
                  <div class="message-loading">
                    <span></span><span></span><span></span>
                    <span class="loading-label">Thinking</span>
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        </div>
    {/if}
  </main>

  <!-- Bottom input area -->
  <footer class="chat-footer">
    <div class="footer-inner">
      <!-- Input bar -->
      <div class="input-bar" class:expanded={isExpanded}>
        <textarea
          class="input-field"
          rows="1"
          placeholder={hasMessages ? 'Ask a follow up...' : 'Ask anything about Acme...'}
          bind:value={inputValue}
          bind:this={textareaEl}
          onkeydown={handleKeydown}
        ></textarea>
        <div class="input-actions">
          <div class="input-sources">
            <Popover id="input-sources-popover" placement="top-end">
              <PopoverReference>
                <Button weight="clear" class="source-meta input-source-button fw-normal h:bg-black-150" aria-label="Sources">
                  {#if selectedSourceOptions.length}
                    <span class="source-icons" aria-label="Connected sources">
                      {#each selectedSourceOptions as source (source.id)}
                        {#if source.icon === 'stack'}
                          <span class="stack-source-icon" aria-hidden="true">
                            <img class="source-glyph source-glyph-trigger" src="/logo-stack-internal-community.svg" alt="" />
                          </span>
                        {:else if source.icon === 'slack'}
                          <img class="source-docs-icon" src="/icon-slack.svg" alt="" aria-hidden="true" />
                        {:else if source.icon === 'stackoverflow'}
                          <Icon src={IconGlyph} class="source-docs-icon" aria-hidden="true" />
                        {:else}
                          <img class="source-docs-icon" src="/icon-google-docs.svg" alt="" aria-hidden="true" />
                        {/if}
                      {/each}
                    </span>
                  {/if}
                  <span>Sources</span>
                  <Icon src={IconChevron12Down} class="source-caret fc-black-400" />
                </Button>
              </PopoverReference>
              <PopoverContent role="menu" class="sources-popover">
                <div class="d-flex fd-column g8">
                  <div class="fs-body2 fw-bold fc-black-600 px8 pt4">Sources</div>
                  {#each sourceOptions as source (source.id)}
                    <label class="source-toggle-row d-flex ai-center jc-between g8 p8" for={`source-toggle-input-${source.id}`}>
                      <span class="source-toggle-copy d-flex ai-center g8">
                        {#if source.icon === 'stack'}
                          <span class="stack-source-icon" aria-hidden="true">
                            <img class="source-glyph source-glyph-trigger" src="/logo-stack-internal-community.svg" alt="" />
                          </span>
                        {:else if source.icon === 'slack'}
                          <img class="source-docs-icon" src="/icon-slack.svg" alt="" aria-hidden="true" />
                        {:else if source.icon === 'stackoverflow'}
                          <Icon src={IconGlyph} class="source-docs-icon" aria-hidden="true" />
                        {:else}
                          <img class="source-docs-icon" src="/icon-google-docs.svg" alt="" aria-hidden="true" />
                        {/if}
                        <span class="fs-body1 fw-normal fc-black-600 ws-nowrap">{source.label}</span>
                      </span>
                      <span class="source-toggle-sm">
                        <input
                          id={`source-toggle-input-${source.id}`}
                          class="s-toggle-switch"
                          type="checkbox"
                          bind:checked={sourceFilters[source.id]}
                          disabled={isLastSelectedSource(source.id)}
                          onclick={(e) => e.stopPropagation()}
                        />
                      </span>
                    </label>
                  {/each}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          {#if isLoading}
            <button class="send-btn stop-btn" aria-label="Stop" onclick={() => streamController?.abort()}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="10" height="10" rx="1.5"/>
              </svg>
            </button>
          {:else if inputValue.trim()}
            <button class="send-btn" aria-label="Send" onclick={submitChatInput}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 13V3M3 8l5-5 5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          {/if}
        </div>
      </div>

      {#if showErrorNotice}
        <Notice variant="danger" dismissible onDismiss={() => { showErrorNotice = false; }} class="mt8">
          <strong>We couldn't send your message.</strong>&nbsp;&nbsp;Check your connection and try again.
        </Notice>
      {/if}

      {#if !hasMessages}
        <!-- Cue pills — only shown before first message -->
        <div class="cue-pills" style="max-width: 760px; margin-left: auto; margin-right: auto; width: 100%;">
          <button class="cue-pill" onclick={navigateToDemo1}>
            <span class="cue-icon cue-icon--orange">{@html IconQuestion}</span>
            Ask a question
          </button>
          <button class="cue-pill" onclick={navigateToDemo1}>
            <span class="cue-icon cue-icon--blue">{@html IconUser}</span>
            Find an expert
          </button>
          <button class="cue-pill" onclick={navigateToDemo1}>
            <span class="cue-icon cue-icon--muted">{@html IconStackBoxes}</span>
            Explore a topic
          </button>
        </div>
      {/if}
    </div>
  </footer>

    </div><!-- end .chat-centered -->
    </div><!-- end .chat-content -->

  </div><!-- end .chat-body -->
  </div><!-- end .chat-left -->

  <!-- Sources panel -->
  <SlidePanel open={showSources} title="Sources" bind:width={sourcesWidth} onclose={() => (showSources = false)}>
    <div class="sources-panel-list">
      {#each filteredSources as source}
        <div class="source-card">
          <div class="source-card-meta">
            {#if source.type === 'stack'}
              <span class="stack-source-icon stack-source-icon--sm bg-orange-400" aria-hidden="true">
                <img class="source-glyph source-glyph--sm" src="/logo-stack-internal-community.svg" alt="" />
              </span>
            {:else}
              <img class="source-docs-icon source-docs-icon--sm" src="/icon-google-docs.svg" alt="" aria-hidden="true" />
            {/if}
            <span class="source-card-origin">{source.sourceName}</span>
          </div>
          <a href="#" class="source-card-title">{source.title}</a>
          <div class="source-card-byline">
            <span class="source-card-author-icon">{@html IconUser}</span>
            <span class="source-card-author">{source.author}</span>
            <span class="source-card-dot">·</span>
            <span class="source-card-date">{source.date}</span>
            <span class="source-card-verified"><VerifiedBadge /></span>
          </div>
        </div>
      {/each}
      {#if filteredSources.length === 0}
        <p class="fs-body1 fc-black-500 m0 p16">No sources selected.</p>
      {/if}
    </div>
  </SlidePanel>

  <!-- History panel -->
  <SlidePanel open={showHistory} title="History" bind:width={historyWidth} onclose={() => (showHistory = false)}>
    <div class="history-search-wrap">
      <svg class="history-search-icon" width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
        <path d="M18 16.5l-5.14-5.18h-.35a7 7 0 1 0-1.19 1.19v.35L16.5 18l1.5-1.5zM12 7A5 5 0 1 1 2 7a5 5 0 0 1 10 0z"/>
      </svg>
      <input
        class="s-input history-search-input"
        type="search"
        placeholder="Search history…"
        bind:value={historySearch}
        autocomplete="off"
      />
    </div>
    <div class="history-panel-list">
      {#if filteredHistory.length === 0}
        <p class="history-empty">{historySearch ? 'No results.' : 'No previous conversations yet.'}</p>
      {:else}
        {#each filteredHistory as item, i (item.id)}
          {#if i === 0 || filteredHistory[i - 1].date !== item.date}
            <div class="history-group-label">{item.date}</div>
          {/if}
          <div class="history-item" id="history-item-{item.id}">
            <button class="history-item-label" onclick={() => (showHistory = false)}>
              {item.label}
            </button>
            <Popover
              id="history-menu-{item.id}"
              placement="bottom-end"
              strategy="fixed"
              visible={historyMenuOpenId === item.id}
              onoutclick={() => (historyMenuOpenId = null)}
            >
              <PopoverReference>
                <Button
                  weight="clear"
                  size="sm"
                  icon
                  aria-label="More options"
                  class="history-item-menu-btn"
                  onclick={(e) => { e.stopPropagation(); historyMenuOpenId = historyMenuOpenId === item.id ? null : item.id; }}
                >
                  <Icon src={IconMoreV} />
                </Button>
              </PopoverReference>
              <PopoverContent role="menu" class="history-item-menu">
                <button class="history-menu-action" onclick={() => startRename(item)}>
                  <Icon src={IconCompose} />
                  Rename chat
                </button>
                <button
                  class="history-menu-action history-menu-action--danger"
                  onclick={() => { historyItems = historyItems.filter(h => h.id !== item.id); historyMenuOpenId = null; }}
                >
                  <Icon src={IconTrash} />
                  Delete chat
                </button>
              </PopoverContent>
            </Popover>
          </div>
          <Popover
            id="history-rename-{item.id}"
            placement="bottom-start"
            strategy="fixed"
            visible={historyRenameId === item.id}
            onoutclick={() => (historyRenameId = null)}
          >
            <PopoverReference elementId="history-item-{item.id}" />
            <PopoverContent class="history-rename-popover">
              <input
                class="s-input s-input__sm"
                value={historyRenameValue}
                oninput={(e) => (historyRenameValue = e.currentTarget.value)}
                onkeydown={(e) => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') historyRenameId = null; }}
              />
              <div class="d-flex g8 mt8 jc-end">
                <Button size="sm" weight="clear" onclick={() => (historyRenameId = null)}>Cancel</Button>
                <Button size="sm" onclick={saveRename}>Save</Button>
              </div>
            </PopoverContent>
          </Popover>
        {/each}
      {/if}
    </div>
  </SlidePanel>

</div>

<Modal id="about-prototype-modal" visible={showAboutModal} onclose={() => showAboutModal = false} class="s-modal__full">
  {#snippet header()}
    Stack Internal Prototype
  {/snippet}
  {#snippet body()}
    <p class="about-modal-body">This prototype represents a high-level design direction for the Stack Internal web UI (not a final specification). It's meant to communicate intent: how the product might feel, how information could be organized, and where key interactions might live.</p>
    <p class="about-modal-body">It is not a prescriptive blueprint. Details will change, components will evolve, and individual teams are expected to adapt what's here to fit the specific problems they're solving.</p>
    <p class="about-modal-body" style="margin-bottom:0"><strong>Use this as a starting point.</strong> Explore, diverge, and make it your own. The goal is to give teams a shared reference point — something concrete enough to react to, loose enough to build on.</p>
  {/snippet}
  {#snippet footer()}
    <div class="d-flex jc-end">
      <button class="s-btn s-btn__primary" onclick={() => showAboutModal = false}>Got it</button>
    </div>
  {/snippet}
</Modal>

<style>
  :global(.play-demo-icon) {
    height: 14px;
    padding: 0;
    width: 14px;
  }

  :global(.play-demo-icon svg) {
    height: 14px;
    width: 14px;
  }

  .chat-page {
    display: flex;
    flex-direction: row;
    height: 100vh;
    background-color: #fff;
    color: #201c1d;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .chat-left {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  /* Header */
  .chat-header {
    align-items: center;
    display: grid;
    grid-template-columns: auto 1fr auto;
    padding: 12px 24px;
    min-height: 64px;
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: #fff;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #201c1d;
    font-size: 14px;
  }

  :global(.org-icon) {
    height: 18px;
    width: 18px;
  }

  .org-name {
    font-size: 14px;
    font-weight: 600;
    color: #201c1d;
  }

  .org-trigger {
    align-items: center;
    background: none;
    border: none;
    border-radius: 6px;
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    gap: 6px;
    padding: 4px 6px;
  }

  .org-trigger:hover {
    background: var(--black-100);
  }

  :global(.org-chevron) {
    height: 12px;
    width: 12px;
  }

  :global(.demo-selector-popover) {
    max-width: 360px;
    padding: 6px;
    width: 320px;
  }

  .demo-menu-item {
    background: none;
    border: none;
    border-radius: 6px;
    color: var(--black-700);
    cursor: pointer;
    display: block;
    font: inherit;
    font-size: 13px;
    line-height: 1.4;
    padding: 8px 10px;
    text-align: left;
    width: 100%;
  }

  .demo-menu-item:hover {
    background: var(--black-100);
  }

  .demo-menu-item--selected {
    background: var(--black-075);
    font-weight: 600;
  }

  .header-center {
    align-items: center;
    display: flex;
    justify-content: center;
    min-width: 0;
    overflow: hidden;
    padding: 0 16px;
  }

  .pill-btn {
    height: 28px;
    padding: 0 12px;
    border-radius: 20px;
    border: none;
    background: #f0efed;
    color: #201c1d;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
  }

  .text-btn {
    background: none;
    border: none;
    font-size: 14px;
    color: #201c1d;
    cursor: pointer;
    font-family: inherit;
    padding: 0;
  }

  .icon-btn {
    background: none;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 4px;
    color: #6b6d73;
    border-radius: 6px;
  }

  .icon-btn:hover {
    background: #f0efed;
  }

  .header-right {
    align-items: center;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  /* Key button */
  .key-btn-wrapper {
    position: relative;
  }

  .key-btn {
    width: 32px;
    height: 32px;
  }

  .key-btn.key-active {
    background: #f0efed;
  }

  .key-icon {
    display: flex;
    align-items: center;
  }

  .key-icon :global(svg) {
    width: 18px;
    height: 18px;
    color: #6b6d73;
  }

/* Key popover */
  .popover-overlay {
    position: fixed;
    inset: 0;
    z-index: 99;
  }

  .key-popover {
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    width: 280px;
    background: #fff;
    border: 1px solid #dee0e3;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    z-index: 100;
  }

  .popover-label {
    font-size: 13px;
    font-weight: 600;
    color: #201c1d;
    margin: 0 0 4px;
  }

  .popover-hint {
    font-size: 12px;
    color: #6b6d73;
    margin: 0 0 12px;
    line-height: 1.5;
  }

  .popover-input {
    width: 100%;
    height: 36px;
    padding: 0 10px;
    font-size: 13px;
    font-family: inherit;
    border: 1px solid #dee0e3;
    border-radius: 4px;
    outline: none;
    color: #201c1d;
    background: #fff;
    box-sizing: border-box;
  }

  .popover-input:focus {
    border-color: #201c1d;
  }

  .popover-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 10px;
  }

  .popover-save {
    height: 30px;
    padding: 0 14px;
    background: #201c1d;
    color: #fff;
    border: none;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
  }

  .popover-clear {
    height: 30px;
    padding: 0 14px;
    background: none;
    color: #6b6d73;
    border: 1px solid #dee0e3;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    font-family: inherit;
  }

  .popover-clear:hover {
    color: #c02d2e;
    border-color: #c02d2e;
  }


  .new-chat-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 40px;
    padding: 0 16px;
    border-radius: 20px;
    border: none;
    background: #201c1d;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .new-chat-label {
    transition: opacity 0.15s ease;
  }

  /* Main content */
  .chat-main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chat-main--messages {
    align-items: flex-start;
    justify-content: flex-start;
  }

  /* Hero */
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 560px;
  }

  .spot-illustration {
    margin-bottom: 24px;
    width: 128px;
    height: 128px;
    --black-150: #fff;
  }

  .spot-illustration :global(svg) {
    width: 128px;
    height: 128px;
  }

  .cta-icon {
    display: flex;
    align-items: center;
    color: #998B7A;
  }

  .cta-icon :global(svg) {
    width: 20px;
    height: 20px;
  }

  .hero-title {
    font-size: 42px;
    font-weight: 600;
    color: #201c1d;
    margin: 0 0 16px;
    line-height: 1.2;
    letter-spacing: -0.5px;
    font-family: inherit;
  }

  .hero-subtitle {
    font-size: 16px;
    color: #46484d;
    line-height: 1.5;
    margin: 0 0 16px;
  }

  .hero-ctas {
    display: flex;
    gap: 16px;
  }

  .cta-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 47px;
    padding: 0 24px;
    border: 1px solid #dee0e3;
    border-radius: 10px;
    background: #fff;
    color: #201c1d;
    font-size: 14px;
    cursor: pointer;
    font-family: inherit;
  }

  .cta-btn:hover {
    background: #f7f6f5;
  }

  .about-btn {
    background: none;
    border: none;
    font-size: 13px;
    color: var(--fc-light);
    cursor: pointer;
    font-family: inherit;
    margin-top: 20px;
    padding: 4px 8px;
    border-radius: 6px;
    transition: color 0.1s, background 0.1s;
  }

  .about-btn:hover {
    color: var(--fc-dark);
    background: var(--black-075);
  }

  :global(.about-modal-body) {
    font-size: 14px;
    line-height: 1.6;
    color: var(--fc-dark);
    margin: 0 0 14px;
  }


  /* Chat body layout */
  .chat-body {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .chat-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .chat-centered {
    max-width: 808px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  /* History panel content */
  .history-search-wrap {
    margin: 0 8px 12px;
    position: relative;
  }

  .history-search-icon {
    color: #6b6d73;
    fill: currentColor;
    left: 9px;
    pointer-events: none;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  .history-search-input {
    padding-left: 32px !important;
    width: 100%;
  }

  .history-panel-list {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 0 8px 20px;
  }

  .history-empty {
    color: #6b6d73;
    font-size: 14px;
    margin: 0;
    padding: 4px 12px 0;
  }

  .history-group-label {
    color: #6b6d73;
    font-size: 11px;
    font-weight: 600;
    margin-top: 16px;
    padding: 0 12px 4px;
  }

  .history-group-label:first-child {
    margin-top: 0;
  }

  .history-item {
    align-items: center;
    border-radius: 8px;
    display: flex;
    gap: 4px;
    padding: 2px 4px 2px 12px;
  }

  .history-item:hover {
    background: #f0efed;
  }

  .history-item-label {
    background: none;
    border: none;
    color: #201c1d;
    cursor: pointer;
    flex: 1;
    font-family: inherit;
    font-size: 13px;
    min-width: 0;
    overflow: hidden;
    padding: 6px 0;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :global(.history-item-menu-btn) {
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.1s;
  }

  .history-item:hover :global(.history-item-menu-btn),
  .history-item:focus-within :global(.history-item-menu-btn) {
    opacity: 1;
  }

  :global(.history-item-menu) {
    min-width: 140px;
    padding: 4px;
  }

  .history-menu-action {
    align-items: center;
    background: none;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    font-family: inherit;
    font-size: 13px;
    gap: 8px;
    padding: 6px 10px;
    text-align: left;
    width: 100%;
  }

  .history-menu-action--danger {
    color: #c02d2d;
  }

  .history-menu-action--danger:hover {
    background: #fdf2f2;
  }

  .history-menu-action :global(svg),
  .history-menu-action--danger :global(svg) {
    flex-shrink: 0;
    height: 16px;
    width: 16px;
  }

  .history-menu-action:hover {
    background: #f0efed;
  }

  :global(.history-rename-popover) {
    padding: 12px;
    width: 260px;
  }

  /* Sources panel content */
  .sources-panel-list {
    overflow-y: auto;
    flex: 1;
    padding: 0 20px 20px;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .source-card {
    padding: 16px 0;
    border-bottom: 1px solid #f0efed;
  }

  .source-card:last-child {
    border-bottom: none;
  }

  .source-card-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
  }

  .source-card-origin {
    font-size: 12px;
    font-weight: 600;
    color: #46484d;
  }

  .source-card-title {
    display: block;
    font-size: 14px;
    font-weight: 400;
    color: #201c1d;
    line-height: 1.4;
    margin: 0 0 8px;
    text-decoration: underline;
  }

  .source-card-byline {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #6b6d73;
    flex-wrap: wrap;
  }

  .source-card-author-icon {
    display: flex;
    align-items: center;
    color: #6b6d73;
  }

  .source-card-author-icon :global(svg) {
    width: 14px;
    height: 14px;
  }

  .source-card-dot {
    color: #dee0e3;
  }

  .source-card-verified {
    display: flex;
    align-items: center;
    margin-left: auto;
    flex-shrink: 0;
  }


  /* Response footer */
  .response-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;
    width: 100%;
  }

  .response-footer-left {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .verified-badge {
    display: flex;
    align-items: center;
    margin-right: 8px;
    flex-shrink: 0;
  }

  .verified-badge-trigger {
    background: none;
    border: none;
    cursor: pointer;
    margin-right: 8px;
    padding: 0;
  }

  .verified-badge :global(svg) {
    display: block;
  }

  .inline-source-logo {
    display: block;
    height: 18px;
    width: 18px;
  }

  :global(.inline-source-meta-icon) {
    height: 13px;
    width: 13px;
  }

  :global(.inline-source-date-icon) {
    margin-left: 4px;
  }

  :global(.verified-sources-popover) {
    max-width: 360px;
    width: 340px;
  }

  .verified-checks-section {
    border-bottom: 1px solid var(--black-200);
    margin: 0 -12px;
    padding: 0 12px 12px;
  }

  :global(.verified-check-icon) {
    color: var(--green-600);
    flex-shrink: 0;
    height: 16px;
    width: 16px;
  }

  :global(.verified-check-icon svg) {
    height: 16px;
    width: 16px;
  }

  .verified-check-label {
    color: var(--green-600);
  }

  .verified-sources-section:not(:first-child) .verified-sources-heading {
    padding-top: 12px;
  }

  .verified-source-item,
  .verified-source-item:visited {
    color: inherit;
  }

  .verified-source-item:hover {
    opacity: 0.82;
  }

  :global(.s-popover.response-tooltip) {
    background: #3c3f44;
    border: none;
    border-radius: 5px;
    box-shadow: none;
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 12px;
    padding: 5px 8px;
    white-space: nowrap;
  }

  :global(.s-popover.response-tooltip .s-popover--content) {
    margin: 0;
    padding: 0;
  }

  .response-action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 6px;
    color: #3d3d3d;
  }

  .response-action:hover {
    background: #f0efed;
    color: #201c1d;
  }

  .response-action :global(svg) {
    width: 18px;
    height: 18px;
  }

  .response-action.feedback-active :global(svg) {
    fill: #e0e0e0;
    stroke: #3d3d3d;
  }

  :global(.sources-trigger) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .sources-trigger-icons {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  :global(.source-caret) {
    flex-shrink: 0;
    height: 12px;
    transform: translateY(2px);
    width: 12px;
  }

  .source-glyph,
  .source-docs-icon {
    display: inline-block;
    flex-shrink: 0;
    height: 18px;
    object-fit: contain;
    width: 18px;
  }

  .stack-source-icon {
    align-items: center;
    display: inline-flex;
    flex-shrink: 0;
    height: 20px;
    justify-content: center;
    width: 20px;
  }

  .stack-source-icon .source-glyph {
    height: 13px;
    width: 13px;
  }

  .stack-source-icon .source-glyph-trigger {
    height: 18px;
    width: 18px;
  }

  .source-glyph--sm,
  .source-docs-icon--sm {
    height: 16px;
    width: 16px;
  }

  .stack-source-icon--sm {
    height: 18px;
    width: 18px;
  }

  .stack-source-icon--sm .source-glyph--sm {
    height: 12px;
    width: 12px;
  }

  :global(.sources-popover) {
    max-width: calc(100vw - 32px);
    min-width: 0;
    width: 320px;
  }

  .source-toggle-row {
    border-radius: 6px;
    cursor: pointer;
    width: 100%;
  }

  .source-toggle-row:hover {
    background: #f7f6f5;
  }

  .source-toggle-copy {
    flex: 1;
    justify-content: flex-start;
    min-width: 0;
  }

  .source-toggle-sm {
    display: inline-flex;
    height: 18px;
    margin-left: auto;
    transform: scale(0.75);
    transform-origin: right center;
    width: 34px;
  }

  /* Messages */

  .messages-inner {
    width: 100%;
    padding: 8px 24px 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .message {
    display: flex;
    gap: 0;
    align-items: flex-start;
  }

  .message-user {
    flex-direction: row-reverse;
  }

  .message-body {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .message-bubble {
    max-width: 80%;
    font-size: 15px;
    line-height: 1.6;
    color: #201c1d;
    word-break: break-word;
  }

  .message-assistant .message-bubble {
    max-width: 100%;
  }

  .message-user .message-bubble {
    background: #f0efed;
    padding: 10px 14px;
    border-radius: 16px 16px 4px 16px;
  }

  /* Markdown content */
  .message-bubble.md :global(p) {
    margin: 0 0 1.5em;
  }
  .message-bubble.md :global(p:last-child) {
    margin-bottom: 0;
  }
  .message-bubble.md :global(h1),
  .message-bubble.md :global(h2),
  .message-bubble.md :global(h3),
  .message-bubble.md :global(h4) {
    font-weight: 600;
    margin: 1.2em 0 0.6em;
    line-height: 1.3;
  }
  .message-bubble.md :global(h1) { font-size: 1.2em; }
  .message-bubble.md :global(h2) { font-size: 1.1em; }
  .message-bubble.md :global(h3),
  .message-bubble.md :global(h4) { font-size: 1em; }
  .message-bubble.md :global(ul),
  .message-bubble.md :global(ol) {
    margin: 0.4em 0 0.75em;
    padding-left: 1.4em;
  }
  .message-bubble.md :global(li) {
    margin-bottom: 0.25em;
  }
  /* Suppress paragraph margins inside list items (loose lists) */
  .message-bubble.md :global(li p) {
    margin: 0;
  }
  /* Suppress stray <br> elements between blocks */
  .message-bubble.md :global(br) {
    display: none;
  }
  .message-bubble.md :global(code) {
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 0.875em;
    background: rgba(0,0,0,0.06);
    padding: 0.1em 0.35em;
    border-radius: 3px;
  }
  .message-bubble.md :global(pre) {
    background: #f3f2f0;
    border-radius: 6px;
    padding: 12px 14px;
    overflow-x: auto;
    margin: 0.6em 0;
  }
  .message-bubble.md :global(pre code) {
    background: none;
    padding: 0;
    font-size: 0.85em;
  }
  .message-bubble.md :global(blockquote) {
    border-left: 3px solid #dee0e3;
    margin: 0.6em 0;
    padding: 0 0 0 1em;
    color: #6b6d73;
  }
  .message-bubble.md :global(hr) {
    border: none;
    border-top: 1px solid #dee0e3;
    margin: 0.75em 0;
  }
  .message-bubble.md :global(a) {
    color: #201c1d;
    text-decoration: underline;
  }
  .message-bubble.md :global(a:hover) {
    opacity: 0.7;
  }
  .message-bubble.md :global(strong) {
    font-weight: 600;
  }
  .message-bubble.md :global(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 0.6em 0;
    font-size: 0.9em;
  }
  .message-bubble.md :global(th),
  .message-bubble.md :global(td) {
    border: 1px solid #dee0e3;
    padding: 6px 10px;
    text-align: left;
  }
  .message-bubble.md :global(th) {
    background: #f7f6f5;
    font-weight: 600;
  }

  /* Dark mode markdown */
  :global(.app-shell.dark) .message-bubble.md :global(code) {
    background: rgba(255,255,255,0.08);
  }
  :global(.app-shell.dark) .message-bubble.md :global(pre) {
    background: #1b1b1b;
  }
  :global(.app-shell.dark) .message-bubble.md :global(blockquote) {
    border-color: #444;
    color: #9a9a9a;
  }
  :global(.app-shell.dark) .message-bubble.md :global(hr) {
    border-color: #333;
  }
  :global(.app-shell.dark) .message-bubble.md :global(th) {
    background: #2a2a2a;
  }
  :global(.app-shell.dark) .message-bubble.md :global(th),
  :global(.app-shell.dark) .message-bubble.md :global(td) {
    border-color: #333;
  }
  :global(.app-shell.dark) .message-bubble.md :global(a) {
    color: #e3e3e3;
  }

  .message-loading {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    gap: 5px;
    padding: 14px 0 6px;
  }

  .message-loading span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #6b6d73;
    animation: dot-pulse 1.2s ease-in-out infinite;
  }

  .message-loading span:nth-child(2) { animation-delay: 0.2s; }
  .message-loading span:nth-child(3) { animation-delay: 0.4s; }

  .loading-label {
    font-size: 16px;
    color: #6b6d73;
    margin-left: 2px;
    width: auto;
    height: auto;
    background: none;
    border-radius: 0;
    animation: none;
    white-space: nowrap;
  }

  @keyframes dot-pulse {
    0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
    30% { opacity: 1; transform: scale(1); }
  }

  /* Cursor blink */
  .cursor {
    animation: blink 0.8s step-end infinite;
    color: #6b6d73;
  }

  @keyframes blink {
    50% { opacity: 0; }
  }

  /* Footer */
  .chat-footer {
    position: sticky;
    bottom: 0;
    background: #fff;
    padding: 0 0 24px;
    z-index: 10;
  }

  .footer-inner {
    width: 100%;
    padding: 0 24px;
  }

  :global(.source-meta) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .source-icons {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* Input bar */
  .input-bar {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 8px;
    background: #f7f6f5;
    border: none;
    border-radius: 10px;
    margin-top: 16px;
    transition: box-shadow 0.1s ease-in;
  }

  .input-bar:has(.input-field:focus) {
    box-shadow:
      0 0 0 2px var(--focus-neutral),
      0 0 0 4px var(--theme-secondary-400);
  }

  .input-field {
    flex: 1;
    line-height: 1.35;
    min-height: 32px;
    max-height: 130px;
    min-width: 0;
    overflow-x: hidden;
    overflow-y: auto;
    resize: none;
    padding: 0 0 0 10px;
    font-size: 16px;
    color: #201c1d;
    background: transparent;
    border: none;
    outline: none;
    font-family: inherit;
  }

  .input-field::placeholder {
    color: #46484d;
  }

  .input-actions {
    align-items: center;
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    margin-left: auto;
  }

  .input-sources {
    align-items: center;
    display: flex;
    flex-shrink: 0;
  }

  /* Expanded state: text has wrapped — textarea moves to its own full-width row */
  .input-bar.expanded {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }

  .input-bar.expanded .input-field {
    width: 100%;
    flex: none; /* let explicit style.height govern size, not flex-grow */
    padding-top: 10px;
    padding-right: 10px;
  }

  .input-bar.expanded .input-actions {
    margin-left: 0;
    justify-content: flex-end;
  }

  :global(.input-source-button) {
    white-space: nowrap;
  }

  .send-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: #201c1d;
    color: #fff;
    cursor: pointer;
    flex-shrink: 0;
    transition: opacity 0.15s;
  }

  .send-btn:disabled {
    cursor: not-allowed;
    opacity: 0.35;
  }


  /* Cue pills */
  .cue-pills {
    display: flex;
    gap: 12px;
    margin-top: 12px;
  }

  .cue-pill {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px;
    background: #fff;
    border: 1px solid #dee0e3;
    border-radius: 10px;
    flex: 1;
    color: #201c1d;
    font-size: 14px;
    cursor: pointer;
    font-family: inherit;
    transition: background-color 0.1s;
  }

  .cue-pill:hover {
    background: #f7f6f5;
  }

  .cue-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .cue-icon :global(svg) {
    width: 18px;
    height: 18px;
  }

  .cue-icon--orange { color: #FF5E00; }
  .cue-icon--blue   { color: #0077cc; }
  .cue-icon--muted  { color: #998B7A; }

  /* Dark mode overrides */
  :global(.app-shell.dark) .sources-panel {
    background: #1b1b1b;
  }

  :global(.app-shell.dark) .sources-panel--visible {
    border-color: #333;
  }

  :global(.app-shell.dark) .sources-panel-title {
    color: #e3e3e3;
  }

  :global(.app-shell.dark) .source-card {
    border-color: #2a2a2a;
  }

  :global(.app-shell.dark) .source-card-title {
    color: #e3e3e3;
  }

  :global(.app-shell.dark) .response-footer {
    border-color: #2a2a2a;
  }

  :global(.app-shell.dark) .response-action:hover,
  :global(.app-shell.dark) .sources-trigger:hover,
  :global(.app-shell.dark) .sources-panel-close:hover {
    background: #2a2a2a;
  }

  :global(.app-shell.dark) .sources-trigger {
    color: #e3e3e3;
  }

  :global(.app-shell.dark) .chat-page {
    background-color: #1b1b1b;
    color: #e3e3e3;
  }

  :global(.app-shell.dark) .chat-header {
    background-color: #1b1b1b;
  }

  :global(.app-shell.dark) .chat-footer {
    background: #1b1b1b;
  }


  :global(.app-shell.dark) .org-name,
  :global(.app-shell.dark) .header-left {
    color: #e3e3e3;
  }

  :global(.app-shell.dark) .text-btn {
    color: #e3e3e3;
  }

  :global(.app-shell.dark) .pill-btn {
    background: #2a2a2a;
    color: #e3e3e3;
  }

  :global(.app-shell.dark) .icon-btn:hover {
    background: #2a2a2a;
  }


  :global(.app-shell.dark) .new-chat-btn {
    background: #e3e3e3;
    color: #201c1d;
  }

  :global(.app-shell.dark) .hero-title {
    color: #e3e3e3;
  }

  :global(.app-shell.dark) .hero-subtitle {
    color: #9a9a9a;
  }

  :global(.app-shell.dark) .cta-btn {
    background: #2a2a2a;
    border-color: #333;
    color: #e3e3e3;
  }

  :global(.app-shell.dark) .cta-btn:hover {
    background: #333;
  }

  :global(.app-shell.dark) .cue-pill {
    background: #2a2a2a;
    border-color: #333;
    color: #e3e3e3;
  }

  :global(.app-shell.dark) .cue-pill:hover {
    background: #333;
  }

  :global(.app-shell.dark) .input-bar {
    background: #2a2a2a;
  }

  :global(.app-shell.dark) .input-field {
    color: #e3e3e3;
  }

  :global(.app-shell.dark) .input-field::placeholder {
    color: #6b6d73;
  }

  :global(.app-shell.dark) .icon-btn svg path {
    stroke: #9a9a9a;
  }

  :global(.app-shell.dark) .message-bubble {
    color: #e3e3e3;
  }

  :global(.app-shell.dark) .message-user .message-bubble {
    background: #2a2a2a;
  }

:global(.app-shell.dark) .key-popover {
    background: #242424;
    border-color: #333;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  }

  :global(.app-shell.dark) .popover-label {
    color: #e3e3e3;
  }

  :global(.app-shell.dark) .popover-input {
    background: #1b1b1b;
    border-color: #444;
    color: #e3e3e3;
  }

  :global(.app-shell.dark) .popover-input:focus {
    border-color: #e3e3e3;
  }

  :global(.app-shell.dark) .popover-save {
    background: #e3e3e3;
    color: #201c1d;
  }

  :global(.app-shell.dark) .send-btn {
    background: #e3e3e3;
    color: #201c1d;
  }

  /* ─── Responsive ────────────────────────────────────────────── */

  /* Tablet (768–1023px): tighten horizontal spacing */
  @media (min-width: 768px) and (max-width: 1023px) {
    .chat-header {
      padding: 12px 16px;
    }
    .chat-footer {
      padding: 0 0 20px;
    }
    .footer-inner {
      padding: 0 16px;
    }
    .messages-inner {
      padding: 8px 16px 16px;
    }
    .hero-title {
      font-size: 32px;
    }
    .new-chat-label {
      display: none;
    }
    .new-chat-btn {
      padding: 0 12px;
      gap: 0;
    }
  }

  /* Mobile (≤767px) */
  @media (max-width: 767px) {
    /* Account for the 52px fixed layout topbar */
    .chat-page {
      height: calc(100vh - 52px);
    }

    /* Header */
    .chat-header {
      padding: 12px;
      height: 52px;
      gap: 8px;
      transition: transform 0.25s ease;
    }

    .chat-header.header-hidden {
      transform: translateY(-100%);
    }

    /* Hide tabs area on mobile; show space name */
    .header-center {
      display: none;
    }

    .header-left {
      flex-shrink: 0;
    }

    /* Compact "New chat" button — icon only */
    .new-chat-btn {
      padding: 0 12px;
      gap: 0;
    }
    .new-chat-label {
      display: none;
    }

    /* Hero */
    .chat-main {
      padding: 24px 16px;
    }

    .spot-illustration,
    .spot-illustration :global(svg) {
      width: 80px;
      height: 80px;
    }

    .hero-title {
      font-size: 26px;
      letter-spacing: -0.3px;
    }

    .hero-subtitle {
      font-size: 14px;
      margin-bottom: 24px;
    }

    .hero-ctas {
      flex-direction: column;
      width: 100%;
    }

    .cta-btn {
      width: 100%;
      justify-content: center;
    }

    /* Messages */
    .messages-inner {
      padding: 8px 12px 16px;
    }

    .message-bubble {
      max-width: 90%;
      font-size: 15px;
    }

    .message-assistant .message-bubble {
      max-width: 100%;
    }

    .response-footer {
      flex-wrap: wrap;
      gap: 6px;
    }

    /* Footer */
    .chat-footer {
      padding: 0 0 16px;
    }
    .footer-inner {
      padding: 0 12px;
    }

    /* Cue pills: scroll horizontally on mobile */
    .cue-pills {
      flex-wrap: nowrap;
      overflow-x: auto;
      scrollbar-width: none;
      padding-bottom: 4px;
      -webkit-overflow-scrolling: touch;
    }
    .cue-pills::-webkit-scrollbar {
      display: none;
    }
    .cue-pill {
      flex: 0 0 auto;
      white-space: nowrap;
    }

    /* Sources panel: full-screen overlay on mobile */
    .sources-panel {
      position: fixed;
      inset: 0;
      max-width: 0;
      width: 100%;
      z-index: 300;
      border-left: none;
    }

    .sources-panel--visible {
      max-width: 100%;
      border-left: none;
    }

    /* Key popover: full width on mobile */
    .key-popover {
      width: calc(100vw - 24px);
      right: -12px;
    }
  }
</style>
