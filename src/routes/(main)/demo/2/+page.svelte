<script lang="ts">
  import {
    IconAlert,
    IconCalendar,
    IconCheck,
    IconChevron12Down,
    IconDocument16,
    IconUser,
  } from '@stackoverflow/stacks-icons/icons';
  import { IconCompany, IconGlyph, IconServiceSlack } from '@stackoverflow/stacks-icons/icons';
  import { Button, Icon, Notice, Popover, PopoverContent, PopoverReference } from '@stackoverflow/stacks-svelte';
  import VerifiedBadge from '$lib/components/VerifiedBadge.svelte';
  import SearchingIndicator from '$lib/components/SearchingIndicator.svelte';
  import { marked } from 'marked';
  import { goto } from '$app/navigation';
  import { tick } from 'svelte';
  import { tabsState } from '$lib/stores/tabs.svelte';
  import ChatTabs from '$lib/components/ChatTabs.svelte';
  import AskReviewerModal from '$lib/components/AskReviewerModal.svelte';
  import {
    ASK_REVIEW_DESTINATIONS,
    ASK_GIAMIR_REASON_QUESTION,
    ASK_LOW_TRUST_QUESTION,
    findAskReviewDestination,
    formatAskAlternativesList,
    formatAskGiamirEditForm,
    getAskGiamirReasonPrompt,
    getAskLowTrustPrompt,
    getAskReviewDefaultIntro,
    getIntroPrompt,
    getInvalidMenuChoicePrompt,
    getSentConfirmation,
    isAskGiamirCommand,
    isAskGiamirReasonQuestion,
    isAskLowTrustQuestion,
    isMenuEditChoice,
    isMenuSendChoice,
    isMenuWhoElseChoice,
    type AskReviewDestination,
    type AskReviewSource,
    type AskGiamirChatStep,
  } from '$lib/askGiamirFlow';

  type AskGiamirRequest = {
    message: string;
    question: string;
    answer: string;
    shareFullHistory: boolean;
    destination: AskReviewDestination;
  };

  const defaultAskDestination = ASK_REVIEW_DESTINATIONS[0];
  const askSmeDestinations = ASK_REVIEW_DESTINATIONS.filter((destination) => destination.kind === 'sme');
  const askChannelDestinations = ASK_REVIEW_DESTINATIONS.filter((destination) => destination.kind === 'channel');

  marked.setOptions({ breaks: false });
  function renderMarkdown(text: string): string {
    return marked.parse(text) as string;
  }

  function countVisibleChars(html: string): number {
    if (typeof DOMParser === 'undefined') return html.length;
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
    return doc.body.firstChild?.textContent?.length ?? 0;
  }

  function progressiveHTML(html: string, visibleChars: number): string {
    if (typeof DOMParser === 'undefined') return html;
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
    const root = doc.body.firstChild as HTMLElement;
    let remaining = visibleChars;
    function walk(node: Node) {
      const children = Array.from(node.childNodes);
      for (const child of children) {
        if (remaining <= 0) {
          node.removeChild(child);
          continue;
        }
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent ?? '';
          if (text.length <= remaining) {
            remaining -= text.length;
          } else {
            child.textContent = text.slice(0, remaining);
            remaining = 0;
          }
        } else {
          walk(child);
        }
      }
    }
    walk(root);
    return root.innerHTML;
  }

  const t1Question = 'Is there a Project Yak prototype?';
  const t2Question = 'Take me to it.';
  const t3Question = 'How are we getting the data?';
  const t4Question = 'How are we getting telemetry data?';
  const aiGeneratedTelemetryReviewQuestion = 'Based on the shared Project Yak chat history, can you confirm whether the team is using Icarus telemetry for yak migration data, whether that plan moved forward after the Dec. 2025 discussion, and what the current data approach should be?';

  const turn1Response = `Yes, at [${'yak-proto.pages.github.io'}](https://yak-proto.pages.github.io).`;
  const turn2Response = `Just click on this link: [${'yak-proto.pages.github.io'}](https://yak-proto.pages.github.io).`;
  const turn3Response = `Could you help me narrow this down? **Data** in Project Yak can mean **telemetry**, **migration data pipelines**, or **test data in the prototype**. Which are you asking about?`;
  const turn4Response = `**Giamir Buoncristiani** proposed using **Icarus telemetry** for yak migrations, with **Sander van Vliet** agreeing the data could expand to other species. However, this is only coming from one source from 6 months ago (**Dec. 2025**). Since I couldn't find any later follow-ups, it would be good to ask around to see if this plan actually moved forward.`;

  const turnHtml: Record<number, string> = {
    1: renderMarkdown(turn1Response),
    2: renderMarkdown(turn2Response),
    3: renderMarkdown(turn3Response),
    4: renderMarkdown(turn4Response),
  };

  const prototypeUrl = 'yak-proto.pages.github.io';
  const prototypeHref = `https://${prototypeUrl}`;

  const briefSource = {
    title: 'Project Yak brief',
    author: 'Drew Meacham',
    date: 'April 22, 2026',
    href: 'https://docs.google.com/document/d/1mkO6TcOXCQs9G_MQl1udGMVnwSVA7Blda6wDpkoiSts/edit?usp=sharing',
    logo: '/icon-google-docs.svg',
  };
  const designDocSource = {
    title: 'Design documentation',
    author: 'Drew Meacham',
    role: 'Staff Designer',
    date: 'April 22, 2026',
    href: 'https://stackoverflow.design',
    logo: '/logo-stack-internal-community.svg',
  };
  const testDriveSource = {
    title: 'Test-drive Yak',
    collaborators: '2 collaborators',
    date: 'March 28, 2026',
    href: 'https://stackoverflow.design',
    logo: '/logo-stack-internal-community.svg',
  };
  const yakSpikeSource = {
    title: 'Yak migrations spike',
    author: 'Giamir Buoncristiani',
    date: 'Oct. 12, 2025',
    href: 'https://docs.google.com/document/d/1mkO6TcOXCQs9G_MQl1udGMVnwSVA7Blda6wDpkoiSts/edit?usp=sharing',
    logo: '/icon-google-docs.svg',
  };
  const checkInSource = {
    title: 'Next check-in meeting',
    author: 'Brandon Rosage',
    collaborators: '2 collaborators',
    date: 'Dec. 5, 2025',
    href: 'https://docs.google.com/document/d/1mkO6TcOXCQs9G_MQl1udGMVnwSVA7Blda6wDpkoiSts/edit?usp=sharing',
    logo: '/icon-google-docs.svg',
  };

  const askGiamirPreviewSources: AskReviewSource[] = [
    {
      title: checkInSource.title,
      author: checkInSource.collaborators,
      date: checkInSource.date,
      icon: checkInSource.logo,
    },
  ];

  const prototypeSources = [briefSource, designDocSource, testDriveSource, yakSpikeSource];
  const linkSources = [designDocSource, checkInSource];

  const sourceOptions = [
    { id: 'stack-internal', label: 'Stack Internal', icon: 'stack' },
    { id: 'google-docs', label: 'Google Docs', icon: 'docs' },
    { id: 'slack', label: 'Slack', icon: 'slack' },
    { id: 'stackoverflow', label: 'Stack Overflow', icon: 'stackoverflow' },
  ];

  let inputValue = $state('');
  let sourceFilters = $state<Record<string, boolean>>({
    'stack-internal': true,
    'google-docs': true,
    'slack': true,
    'stackoverflow': false,
  });
  const selectedSourceOptions = $derived(sourceOptions.filter((source) => sourceFilters[source.id]));

  function makePopoverState() {
    let open = $state(false);
    let timer: ReturnType<typeof setTimeout> | null = null;
    return {
      get open() { return open; },
      openNow() {
        if (timer) { clearTimeout(timer); timer = null; }
        open = true;
      },
      closeWithDelay() {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => { open = false; timer = null; }, 350);
      },
      closeNow() {
        if (timer) { clearTimeout(timer); timer = null; }
        open = false;
      },
    };
  }

  const t1Brief = makePopoverState();
  const t1Task = makePopoverState();
  const t1Verified = makePopoverState();
  const t2Design = makePopoverState();
  const t2Verified = makePopoverState();
  const t4Verified = makePopoverState();
  const t4AskGiamir = makePopoverState();
  const t4AskGiamirProfile = makePopoverState();
  let askGiamirSent = $state(false);
  let askGiamirModalOpen = $state(false);
  let askGiamirRequest = $state<AskGiamirRequest | null>(null);
  let askGiamirDestination = $state<AskReviewDestination>(defaultAskDestination);
  type AskGiamirMessageAction = 'preview-choice' | 'edit-form' | 'destination-list';
  type AskGiamirChoice = { value: string; label: string; emphasis?: boolean };
  type ChatMessage = { role: 'user' | 'assistant'; content: string; action?: AskGiamirMessageAction };
  let askGiamirChatMessages = $state<ChatMessage[]>([]);
  let askGiamirChatStep = $state<AskGiamirChatStep>('idle');
  let askGiamirChatIntro = $state(getAskReviewDefaultIntro(defaultAskDestination));
  let askGiamirChatQuestion = $state(aiGeneratedTelemetryReviewQuestion);
  let askGiamirChatShareFullHistory = $state(true);
  let askGiamirReasonAnswered = $state(false);
  let lowTrustAnswered = $state(false);

  type SuggestedReply = { label: string; value: string };

  function openAskGiamirModal(destination = defaultAskDestination) {
    askGiamirDestination = destination;
    t4AskGiamir.closeNow();
    t4AskGiamirProfile.closeNow();
    askGiamirModalOpen = true;
  }

  function toggleAskGiamirMenu(event: MouseEvent) {
    event.stopPropagation();
    if (askGiamirSent) return;
    t4AskGiamirProfile.closeNow();
    if (t4AskGiamir.open) {
      t4AskGiamir.closeNow();
    } else {
      t4AskGiamir.openNow();
    }
  }

  async function sendAskGiamir(payload: Omit<AskGiamirRequest, 'destination'>) {
    askGiamirRequest = { ...payload, destination: askGiamirDestination };
    askGiamirSent = true;
    askGiamirModalOpen = false;
    t4AskGiamir.closeNow();
    t4AskGiamirProfile.closeNow();
    await tick();
    document.querySelector('.ask-giamir-notice')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  async function scrollConversationToBottom() {
    await tick();
    const scroller = document.querySelector('.demo-chat-page');
    scroller?.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
  }

  async function addChatAssistantMessage(content: string, action?: AskGiamirMessageAction) {
    askGiamirChatMessages = [...askGiamirChatMessages, { role: 'assistant', content, action }];
    await scrollConversationToBottom();
  }

  function getAskGiamirChoices(): AskGiamirChoice[] {
    return [
      { value: '1', label: '1. Send message', emphasis: true },
      { value: '2', label: '2. Edit message' },
    ];
  }

  function getSuggestedAskReplies(): SuggestedReply[] {
    if (askGiamirSent || askGiamirModalOpen) return [];

    if (askGiamirChatStep !== 'idle') return [];

    if (step >= 8) {
      const replies: SuggestedReply[] = [
        { label: 'Ask Giamir', value: 'ask giamir' },
        { label: 'Who else can I ask?', value: 'who else can i ask' },
      ];
      if (!askGiamirReasonAnswered) {
        replies.push({ label: ASK_GIAMIR_REASON_QUESTION, value: ASK_GIAMIR_REASON_QUESTION });
      }
      if (!lowTrustAnswered) {
        replies.push({ label: ASK_LOW_TRUST_QUESTION, value: ASK_LOW_TRUST_QUESTION });
      }
      return replies;
    }

    return [];
  }

  function isChatActionActive(msg: ChatMessage, messageIndex: number) {
    if (msg.role !== 'assistant' || !msg.action) return false;
    const lastActionIndex = askGiamirChatMessages.reduce((lastIndex, current, index) => {
      return current.role === 'assistant' && current.action ? index : lastIndex;
    }, -1);
    if (messageIndex !== lastActionIndex) return false;

    return msg.action === 'preview-choice' && askGiamirChatStep === 'preview';
  }

  async function submitChatChoice(value: string, label: string) {
    askGiamirChatMessages = [...askGiamirChatMessages, { role: 'user', content: label }];
    await handleAskGiamirChatFlow(value);
  }

  async function showSelectedDestinationPreview(destination: AskReviewDestination) {
    askGiamirDestination = destination;
    askGiamirChatIntro = getAskReviewDefaultIntro(destination);
    askGiamirChatStep = 'preview';
    await addChatAssistantMessage(`<p>Okay, I'll ask ${destination.label}.</p>${getIntroPrompt({
      intro: askGiamirChatIntro,
      question: askGiamirChatQuestion,
      answer: turn4Response,
      shareFullHistory: askGiamirChatShareFullHistory,
      destination: askGiamirDestination,
      sources: askGiamirPreviewSources,
    })}`, 'preview-choice');
  }

  async function handleChatPreviewAction(event: MouseEvent, msg: ChatMessage, messageIndex: number) {
    const target = event.target as HTMLElement | null;
    if (msg.role !== 'assistant' || !msg.action) return;
    const lastActionIndex = askGiamirChatMessages.reduce((lastIndex, current, index) => {
      return current.role === 'assistant' && current.action ? index : lastIndex;
    }, -1);
    if (messageIndex !== lastActionIndex) return;

    const destinationButton = target?.closest<HTMLElement>('[data-ask-giamir-destination]');
    if (destinationButton && msg.action === 'destination-list' && askGiamirChatStep === 'preview') {
      event.preventDefault();
      const destination = findAskReviewDestination(destinationButton.dataset.askGiamirDestination ?? '');
      if (!destination) return;
      askGiamirChatMessages = [...askGiamirChatMessages, { role: 'user', content: `Ask ${destination.handle}` }];
      await showSelectedDestinationPreview(destination);
      return;
    }

    const actionButton = target?.closest<HTMLElement>('[data-ask-giamir-action]');
    if (!actionButton) return;
    event.preventDefault();

    if (actionButton.dataset.askGiamirAction === 'save-edits' && msg.action === 'edit-form' && askGiamirChatStep === 'edit') {
      const form = actionButton.closest<HTMLElement>('.ask-giamir-edit-form');
      const intro = form?.querySelector<HTMLTextAreaElement>('[data-ask-giamir-field="intro"]')?.value.trim();
      const question = form?.querySelector<HTMLTextAreaElement>('[data-ask-giamir-field="question"]')?.value.trim();
      if (!intro || !question) return;

      askGiamirChatIntro = intro;
      askGiamirChatQuestion = question;
      askGiamirChatStep = 'preview';
      askGiamirChatMessages = [...askGiamirChatMessages, { role: 'user', content: 'Save edits' }];
      await addChatAssistantMessage(getIntroPrompt({
        intro: askGiamirChatIntro,
        question: askGiamirChatQuestion,
        answer: turn4Response,
        shareFullHistory: askGiamirChatShareFullHistory,
        destination: askGiamirDestination,
        sources: askGiamirPreviewSources,
      }), 'preview-choice');
    }

    if (actionButton.dataset.askGiamirAction === 'cancel-edits' && msg.action === 'edit-form' && askGiamirChatStep === 'edit') {
      askGiamirChatStep = 'preview';
      askGiamirChatMessages = [...askGiamirChatMessages, { role: 'user', content: 'Cancel edits' }];
      await addChatAssistantMessage(getIntroPrompt({
        intro: askGiamirChatIntro,
        question: askGiamirChatQuestion,
        answer: turn4Response,
        shareFullHistory: askGiamirChatShareFullHistory,
        destination: askGiamirDestination,
        sources: askGiamirPreviewSources,
      }), 'preview-choice');
    }
  }

  function markAskGiamirSentFromChat() {
    askGiamirRequest = {
      message: askGiamirChatIntro,
      question: askGiamirChatQuestion,
      answer: turn4Response,
      shareFullHistory: askGiamirChatShareFullHistory,
      destination: askGiamirDestination,
    };
    askGiamirSent = true;
    askGiamirModalOpen = false;
    t4AskGiamir.closeNow();
  }

  async function handleAskGiamirChatFlow(text: string) {
    if (isAskGiamirReasonQuestion(text)) {
      askGiamirReasonAnswered = true;
      await addChatAssistantMessage(getAskGiamirReasonPrompt());
      return;
    }

    if (isAskLowTrustQuestion(text)) {
      lowTrustAnswered = true;
      await addChatAssistantMessage(getAskLowTrustPrompt());
      return;
    }

    if (askGiamirChatStep === 'idle') {
      if (isMenuWhoElseChoice(text)) {
        askGiamirChatIntro = getAskReviewDefaultIntro(defaultAskDestination);
        askGiamirChatQuestion = aiGeneratedTelemetryReviewQuestion;
        askGiamirChatShareFullHistory = true;
        askGiamirDestination = defaultAskDestination;
        askGiamirChatStep = 'preview';
        await addChatAssistantMessage(formatAskAlternativesList(), 'destination-list');
        return;
      }

      if (!isAskGiamirCommand(text)) {
        await addChatAssistantMessage('Type `ask giamir` when you want me to prepare a Slack review request for this answer.');
        return;
      }
      askGiamirChatIntro = getAskReviewDefaultIntro(defaultAskDestination);
      askGiamirChatQuestion = aiGeneratedTelemetryReviewQuestion;
      askGiamirChatShareFullHistory = true;
      askGiamirDestination = defaultAskDestination;
      askGiamirChatStep = 'preview';
      await addChatAssistantMessage(getIntroPrompt({
        intro: askGiamirChatIntro,
        question: askGiamirChatQuestion,
        answer: turn4Response,
        shareFullHistory: askGiamirChatShareFullHistory,
        destination: askGiamirDestination,
        sources: askGiamirPreviewSources,
      }), 'preview-choice');
      return;
    }

    if (askGiamirChatStep === 'preview') {
      if (isMenuSendChoice(text)) {
        markAskGiamirSentFromChat();
        askGiamirChatStep = 'idle';
        await addChatAssistantMessage(getSentConfirmation(askGiamirDestination.label));
        await tick();
        document.querySelector('.ask-giamir-notice')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        return;
      }

      if (isMenuEditChoice(text)) {
        askGiamirChatStep = 'edit';
        await addChatAssistantMessage(formatAskGiamirEditForm({
          intro: askGiamirChatIntro,
          question: askGiamirChatQuestion,
          answer: turn4Response,
          destination: askGiamirDestination,
        }), 'edit-form');
        return;
      }

      const destination = findAskReviewDestination(text);
      if (destination) {
        await showSelectedDestinationPreview(destination);
        return;
      }

      await addChatAssistantMessage(getInvalidMenuChoicePrompt());
      return;
    }

    if (askGiamirChatStep === 'edit') {
      await addChatAssistantMessage('Use the edit fields above, then choose `Save and preview`.');
      return;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  }

  async function sendChatMessage() {
    const text = inputValue.trim();
    if (!text) return;
    inputValue = '';
    t4AskGiamir.closeNow();
    t4AskGiamirProfile.closeNow();
    askGiamirChatMessages = [...askGiamirChatMessages, { role: 'user', content: text }];
    await handleAskGiamirChatFlow(text);
  }

  async function submitSuggestedAskReply(text: string) {
    inputValue = text;
    await tick();
    await sendChatMessage();
  }

  // Autoplay: step 0 nothing, 1 user1, 2 +assistant1, 3 +user2, 4 +assistant2,
  // 5 +user3, 6 +assistant3, 7 +user4, 8 +assistant4
  let step = $state(8);
  let streamingTurn = $state(0);

  // Rename the active tab to reflect this conversation
  tabsState.renameTab(tabsState.activeTabId, 'Project Yak prototype');
  let streamingChars = $state(0);
  let loadingTurn = $state(0);
  let autoplayStarted = false;

  $effect(() => {
    if (autoplayStarted) return;
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('autoplay') === '1') {
      autoplayStarted = true;
      step = 0;
      history.replaceState({}, '', '/demo/2');
      runAutoplay();
    }
  });

  function delay(ms: number) {
    return new Promise<void>((r) => setTimeout(r, ms));
  }

  async function typeIntoInput(text: string) {
    inputValue = '';
    for (const ch of text) {
      inputValue += ch;
      await delay(40);
    }
  }

  async function streamResponse(turn: number, _markdown: string) {
    loadingTurn = turn;
    await delay(turn === 1 ? 3000 : 900);
    loadingTurn = 0;
    streamingTurn = turn;
    streamingChars = 0;
    const totalChars = countVisibleChars(turnHtml[turn]);
    const chunkSize = 3;
    const charDelay = 18;
    for (let i = 0; i <= totalChars; i += chunkSize) {
      streamingChars = Math.min(i, totalChars);
      await delay(charDelay);
    }
    await delay(150);
    streamingTurn = 0;
    streamingChars = 0;
  }

  async function runAutoplay() {
    await delay(300);
    step = 1;
    await delay(600);
    await streamResponse(1, turn1Response);
    step = 2;

    await delay(1600);
    await typeIntoInput(t2Question);
    await delay(450);
    inputValue = '';
    step = 3;
    await delay(500);
    await streamResponse(2, turn2Response);
    step = 4;

    await delay(1800);
    await typeIntoInput(t3Question);
    await delay(450);
    inputValue = '';
    step = 5;
    await delay(500);
    await streamResponse(3, turn3Response);
    step = 6;

    await delay(1800);
    await typeIntoInput(t4Question);
    await delay(450);
    inputValue = '';
    step = 7;
    await delay(500);
    await streamResponse(4, turn4Response);
    step = 8;
    await tick();
    const scroller = document.querySelector('.demo-chat-page');
    scroller?.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
  }
</script>

<svelte:head>
  <title>Demo chat detail 2</title>
</svelte:head>

<div class="demo-chat-page">
  <header class="chat-header">
    <div class="header-left">
      <button type="button" class="s-btn s-btn__clear org-trigger">
        <Icon src={IconCompany} class="org-icon" />
        <span class="org-name">Acme Demo</span>
        <Icon src={IconChevron12Down} class="org-chevron fc-black-400" />
      </button>
    </div>
    <div class="header-center">
      <ChatTabs ontabclick={(id) => { if (id !== tabsState.activeTabId) goto('/'); }} />
    </div>
    <div class="header-right">
      <button class="s-btn s-btn__clear d-flex ai-center g6" aria-label="Chat history">
        <svg aria-hidden="true" class="svg-icon iconClock" width="18" height="18" viewBox="0 0 18 18"><path d="M9 17c-4.36 0-8-3.64-8-8s3.64-8 8-8 8 3.64 8 8-3.64 8-8 8m0-2c3.27 0 6-2.73 6-6s-2.73-6-6-6-6 2.73-6 6 2.73 6 6 6M8 5h1.01L9 9.36l3.22 2.1-.6.93L8 10z"/></svg>
        <span>History</span>
      </button>
      <button class="new-chat-btn" onclick={() => goto('/')}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span class="new-chat-label">New chat</span>
      </button>
    </div>
  </header>
  <div class="demo-chat-centered">
    <main class="demo-chat-main" aria-label="Demo chat detail">
      <div class="messages-inner">
        <!-- Turn 1: prototype lookup -->
        {#if step >= 1}
        <div class="message message-user">
          <div class="message-bubble">Is there a Project Yak prototype?</div>
        </div>
        {/if}

        {#if loadingTurn === 1}
          <div class="message message-assistant">
            <div class="message-bubble">
              <SearchingIndicator />
            </div>
          </div>
        {:else if streamingTurn === 1}
          <div class="message message-assistant">
            <div class="message-body">
              <div class="message-bubble md d-flex fd-column g8 streaming-bubble">{@html progressiveHTML(turnHtml[streamingTurn], streamingChars)}<span class="cursor" aria-hidden="true">▋</span></div>
            </div>
          </div>
        {/if}

        {#if step >= 2}
        <div class="message message-assistant">
          <div class="message-body">
            <div class="message-bubble md d-flex fd-column g8">
              <div class="response-paragraph">
                Yes, at <a class="prototype-link" href={prototypeHref} target="_blank" rel="noreferrer">{prototypeUrl}</a>.
              </div>
              <div class="response-paragraph">
                Project Yak's <strong>project brief</strong> mentions this "interactive prototype."
                <Popover id="demo2-inline-source-brief" placement="bottom" visible={t1Brief.open} tooltip>
                  <PopoverReference>
                    <button
                      type="button"
                      class="s-badge inline-source-badge"
                      aria-label="{briefSource.title} ({briefSource.date}) - by {briefSource.author}"
                      onmouseenter={t1Brief.openNow}
                      onmouseleave={t1Brief.closeWithDelay}
                      onfocus={t1Brief.openNow}
                      onblur={t1Brief.closeWithDelay}
                      onclick={t1Brief.openNow}
                    >
                      <Icon src={IconDocument16} class="inline-source-badge-icon" />
                    </button>
                  </PopoverReference>
                  <PopoverContent class="inline-source-popover" role="tooltip">
                    <a
                      class="inline-source-card d-flex fd-column g6 td-none"
                      href={briefSource.href}
                      target="_blank"
                      rel="noreferrer"
                      onmouseenter={t1Brief.openNow}
                      onmouseleave={t1Brief.closeWithDelay}
                      onfocus={t1Brief.openNow}
                      onblur={t1Brief.closeWithDelay}
                    >
                      <div class="d-flex ai-center g6">
                        <img class="inline-source-logo" src={briefSource.logo} alt="" aria-hidden="true" />
                        <span class="fs-caption fw-bold fc-black-600 lh-sm">{briefSource.title}</span>
                      </div>
                      <div class="d-flex ai-center g6 fs-caption fc-black-600">
                        <Icon src={IconUser} class="inline-source-meta-icon fc-black-400" />
                        <span>{briefSource.author}</span>
                        <Icon src={IconCalendar} class="inline-source-meta-icon inline-source-date-icon fc-black-400" />
                        <span>{briefSource.date}</span>
                      </div>
                    </a>
                  </PopoverContent>
                </Popover>
              </div>
              <div class="response-paragraph">
                The Project Yak space also includes a <strong>completed task</strong> referring to this "prototype."
                <Popover id="demo2-inline-source-task" placement="bottom" visible={t1Task.open} tooltip>
                  <PopoverReference>
                    <button
                      type="button"
                      class="s-badge inline-source-badge"
                      aria-label="{testDriveSource.title} ({testDriveSource.date}) - {testDriveSource.collaborators}"
                      onmouseenter={t1Task.openNow}
                      onmouseleave={t1Task.closeWithDelay}
                      onfocus={t1Task.openNow}
                      onblur={t1Task.closeWithDelay}
                      onclick={t1Task.openNow}
                    >
                      <Icon src={IconDocument16} class="inline-source-badge-icon" />
                    </button>
                  </PopoverReference>
                  <PopoverContent class="inline-source-popover" role="tooltip">
                    <a
                      class="inline-source-card d-flex fd-column g6 td-none"
                      href={testDriveSource.href}
                      target="_blank"
                      rel="noreferrer"
                      onmouseenter={t1Task.openNow}
                      onmouseleave={t1Task.closeWithDelay}
                      onfocus={t1Task.openNow}
                      onblur={t1Task.closeWithDelay}
                    >
                      <div class="d-flex ai-center g6">
                        <img class="inline-source-logo" src={testDriveSource.logo} alt="" aria-hidden="true" />
                        <span class="fs-caption fw-bold fc-black-600 lh-sm">{testDriveSource.title}</span>
                      </div>
                      <div class="d-flex ai-center g6 fs-caption fc-black-600">
                        <Icon src={IconUser} class="inline-source-meta-icon fc-black-400" />
                        <span>{testDriveSource.collaborators}</span>
                        <Icon src={IconCalendar} class="inline-source-meta-icon inline-source-date-icon fc-black-400" />
                        <span>{testDriveSource.date}</span>
                      </div>
                    </a>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div class="response-footer">
              <div class="response-footer-left">
                <Popover id="demo2-prototype-verified-popover" placement="top-start" visible={t1Verified.open}>
                  <PopoverReference>
                    <button
                      type="button"
                      class="verified-badge-trigger"
                      aria-label="Corroborated by 2 sources from 6 weeks ago, plus 3 others"
                      onmouseenter={t1Verified.openNow}
                      onmouseleave={t1Verified.closeWithDelay}
                      onfocus={t1Verified.openNow}
                      onblur={t1Verified.closeWithDelay}
                      onclick={t1Verified.openNow}
                    >
                      <VerifiedBadge label="Corroborated by 2 sources from 6 weeks ago, plus 3 others" />
                    </button>
                  </PopoverReference>
                  <PopoverContent class="verified-sources-popover" role="dialog">
                    <div
                      class="d-flex fd-column"
                      role="presentation"
                      onmouseenter={t1Verified.openNow}
                      onmouseleave={t1Verified.closeWithDelay}
                      onfocusin={t1Verified.openNow}
                      onfocusout={t1Verified.closeWithDelay}
                    >
                      <div class="verified-checks-section d-flex fd-column g12">
                        <div class="fs-body1 fw-bold fc-black-800">Checks</div>
                        <div class="d-flex fd-column g6">
                          <div class="d-flex ai-center g6">
                            <Icon src={IconCheck} class="verified-check-icon" />
                            <span class="fs-body1 verified-check-label">2 sources from 6 weeks ago (April 22, 2026)</span>
                          </div>
                          <div class="d-flex ai-center g6">
                            <Icon src={IconCheck} class="verified-check-icon" />
                            <span class="fs-body1 verified-check-label">Corroborated by multiple sources</span>
                          </div>
                        </div>
                      </div>
                      <div class="verified-sources-section d-flex fd-column g16">
                        <div class="verified-sources-heading fs-body1 fw-bold fc-black-800">Sources</div>
                        {#each prototypeSources as source (source.title)}
                          <a
                            class="verified-source-item d-flex fd-column g6 td-none"
                            href={source.href}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <div class="d-flex ai-center g6">
                              <img class="inline-source-logo" src={source.logo} alt="" aria-hidden="true" />
                              <span class="fs-caption fw-bold fc-black-600 lh-sm">{source.title}</span>
                            </div>
                            <div class="d-flex ai-center g6 fs-caption fc-black-600">
                              <Icon src={IconUser} class="inline-source-meta-icon fc-black-400" />
                              <span>{source.author ?? source.collaborators}</span>
                              <Icon src={IconCalendar} class="inline-source-meta-icon inline-source-date-icon fc-black-400" />
                              <span>{source.date}</span>
                            </div>
                          </a>
                        {/each}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Popover id="demo2-t1-good-tooltip" placement="bottom" tooltip>
                  <PopoverReference>
                    <button class="response-action" aria-label="Upvote">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                      </svg>
                    </button>
                  </PopoverReference>
                  <PopoverContent class="response-tooltip">Good response</PopoverContent>
                </Popover>
                <Popover id="demo2-t1-bad-tooltip" placement="bottom" tooltip>
                  <PopoverReference>
                    <button class="response-action" aria-label="Downvote">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
                        <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                      </svg>
                    </button>
                  </PopoverReference>
                  <PopoverContent class="response-tooltip">Bad response</PopoverContent>
                </Popover>
                <Popover id="demo2-t1-copy-tooltip" placement="bottom" tooltip>
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
          </div>
        </div>
        {/if}

        <!-- Turn 2: take me to it -->
        {#if step >= 3}
        <div class="message message-user">
          <div class="message-bubble">Take me to it.</div>
        </div>
        {/if}

        {#if loadingTurn === 2}
          <div class="message message-assistant">
            <div class="message-bubble message-loading">
              <span></span><span></span><span></span>
            </div>
          </div>
        {:else if streamingTurn === 2}
          <div class="message message-assistant">
            <div class="message-body">
              <div class="message-bubble md d-flex fd-column g8 streaming-bubble">{@html progressiveHTML(turnHtml[streamingTurn], streamingChars)}<span class="cursor" aria-hidden="true">▋</span></div>
            </div>
          </div>
        {/if}

        {#if step >= 4}
        <div class="message message-assistant">
          <div class="message-body">
            <div class="message-bubble md d-flex fd-column g8">
              <div class="response-paragraph">
                Just click on this link: <a class="prototype-link" href={prototypeHref} target="_blank" rel="noreferrer">{prototypeUrl}</a>.
              </div>
              <div class="response-paragraph">
                Expect an authentication requirement. The Project Yak design documentation says the prototype is <strong>"Okta-gated via Better Auth"</strong> and unauthenticated users get a login prompt.
                <Popover id="demo2-inline-source-design" placement="bottom" visible={t2Design.open} tooltip>
                  <PopoverReference>
                    <button
                      type="button"
                      class="s-badge inline-source-badge"
                      aria-label="{designDocSource.title} ({designDocSource.date}) - by {designDocSource.author}"
                      onmouseenter={t2Design.openNow}
                      onmouseleave={t2Design.closeWithDelay}
                      onfocus={t2Design.openNow}
                      onblur={t2Design.closeWithDelay}
                      onclick={t2Design.openNow}
                    >
                      <Icon src={IconDocument16} class="inline-source-badge-icon" />
                    </button>
                  </PopoverReference>
                  <PopoverContent class="inline-source-popover" role="tooltip">
                    <a
                      class="inline-source-card d-flex fd-column g6 td-none"
                      href={designDocSource.href}
                      target="_blank"
                      rel="noreferrer"
                      onmouseenter={t2Design.openNow}
                      onmouseleave={t2Design.closeWithDelay}
                      onfocus={t2Design.openNow}
                      onblur={t2Design.closeWithDelay}
                    >
                      <div class="d-flex ai-center g6">
                        <img class="inline-source-logo" src={designDocSource.logo} alt="" aria-hidden="true" />
                        <span class="fs-caption fw-bold fc-black-600 lh-sm">{designDocSource.title}</span>
                      </div>
                      <div class="d-flex ai-center g6 fs-caption fc-black-600">
                        <Icon src={IconUser} class="inline-source-meta-icon fc-black-400" />
                        <span>{designDocSource.author}</span>
                        <Icon src={IconCalendar} class="inline-source-meta-icon inline-source-date-icon fc-black-400" />
                        <span>{designDocSource.date}</span>
                      </div>
                    </a>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div class="response-footer">
              <div class="response-footer-left">
                <Popover id="demo2-link-verified-popover" placement="top-start" visible={t2Verified.open}>
                  <PopoverReference>
                    <button
                      type="button"
                      class="verified-badge-trigger"
                      aria-label="From Giamir Buoncristiani a week ago"
                      onmouseenter={t2Verified.openNow}
                      onmouseleave={t2Verified.closeWithDelay}
                      onfocus={t2Verified.openNow}
                      onblur={t2Verified.closeWithDelay}
                      onclick={t2Verified.openNow}
                    >
                      <VerifiedBadge label="From Giamir Buoncristiani a week ago" />
                    </button>
                  </PopoverReference>
                  <PopoverContent class="verified-sources-popover" role="dialog">
                    <div
                      class="d-flex fd-column"
                      role="presentation"
                      onmouseenter={t2Verified.openNow}
                      onmouseleave={t2Verified.closeWithDelay}
                      onfocusin={t2Verified.openNow}
                      onfocusout={t2Verified.closeWithDelay}
                    >
                      <div class="verified-checks-section d-flex fd-column g12">
                        <div class="fs-body1 fw-bold fc-black-800">Checks</div>
                        <div class="d-flex fd-column g6">
                          <div class="d-flex ai-center g6">
                            <Icon src={IconCheck} class="verified-check-icon" />
                            <span class="fs-body1 verified-check-label">Source from a week ago</span>
                          </div>
                          <div class="d-flex ai-center g6">
                            <Icon src={IconCheck} class="verified-check-icon" />
                            <span class="fs-body1 verified-check-label">Authored by Giamir Buoncristiani (Staff Developer)</span>
                          </div>
                        </div>
                      </div>
                      <div class="verified-sources-section d-flex fd-column g16">
                        <div class="verified-sources-heading fs-body1 fw-bold fc-black-800">Sources</div>
                        {#each linkSources as source (source.title)}
                          <a
                            class="verified-source-item d-flex fd-column g6 td-none"
                            href={source.href}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <div class="d-flex ai-center g6">
                              <img class="inline-source-logo" src={source.logo} alt="" aria-hidden="true" />
                              <span class="fs-caption fw-bold fc-black-600 lh-sm">{source.title}</span>
                            </div>
                            <div class="d-flex ai-center g6 fs-caption fc-black-600">
                              <Icon src={IconUser} class="inline-source-meta-icon fc-black-400" />
                              <span>{source.author ?? source.collaborators}</span>
                              <Icon src={IconCalendar} class="inline-source-meta-icon inline-source-date-icon fc-black-400" />
                              <span>{source.date}</span>
                            </div>
                          </a>
                        {/each}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Popover id="demo2-t2-good-tooltip" placement="bottom" tooltip>
                  <PopoverReference>
                    <button class="response-action" aria-label="Upvote">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                      </svg>
                    </button>
                  </PopoverReference>
                  <PopoverContent class="response-tooltip">Good response</PopoverContent>
                </Popover>
                <Popover id="demo2-t2-bad-tooltip" placement="bottom" tooltip>
                  <PopoverReference>
                    <button class="response-action" aria-label="Downvote">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
                        <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                      </svg>
                    </button>
                  </PopoverReference>
                  <PopoverContent class="response-tooltip">Bad response</PopoverContent>
                </Popover>
                <Popover id="demo2-t2-copy-tooltip" placement="bottom" tooltip>
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
          </div>
        </div>
        {/if}

        <!-- Turn 3: clarification -->
        {#if step >= 5}
        <div class="message message-user">
          <div class="message-bubble">How are we getting the data?</div>
        </div>
        {/if}

        {#if loadingTurn === 3}
          <div class="message message-assistant">
            <div class="message-bubble message-loading">
              <span></span><span></span><span></span>
            </div>
          </div>
        {:else if streamingTurn === 3}
          <div class="message message-assistant">
            <div class="message-body">
              <div class="message-bubble md d-flex fd-column g8 streaming-bubble">{@html progressiveHTML(turnHtml[streamingTurn], streamingChars)}<span class="cursor" aria-hidden="true">▋</span></div>
            </div>
          </div>
        {/if}

        {#if step >= 6}
        <div class="message message-assistant">
          <div class="message-body">
            <div class="message-bubble md d-flex fd-column g8">
              <div class="response-paragraph">
                Could you help me narrow this down? <strong>Data</strong> in Project Yak can mean <strong>telemetry</strong>, <strong>migration data pipelines</strong>, or <strong>test data in the prototype</strong>. Which are you asking about?
              </div>
            </div>
            <div class="response-footer">
              <div class="response-footer-left">
                <Popover id="demo2-t3-good-tooltip" placement="bottom" tooltip>
                  <PopoverReference>
                    <button class="response-action" aria-label="Upvote">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                      </svg>
                    </button>
                  </PopoverReference>
                  <PopoverContent class="response-tooltip">Good response</PopoverContent>
                </Popover>
                <Popover id="demo2-t3-bad-tooltip" placement="bottom" tooltip>
                  <PopoverReference>
                    <button class="response-action" aria-label="Downvote">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
                        <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                      </svg>
                    </button>
                  </PopoverReference>
                  <PopoverContent class="response-tooltip">Bad response</PopoverContent>
                </Popover>
                <Popover id="demo2-t3-copy-tooltip" placement="bottom" tooltip>
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
          </div>
        </div>
        {/if}

        <!-- Turn 4: telemetry caution -->
        {#if step >= 7}
        <div class="message message-user">
          <div class="message-bubble">How are we getting telemetry data?</div>
        </div>
        {/if}

        {#if loadingTurn === 4}
          <div class="message message-assistant">
            <div class="message-bubble message-loading">
              <span></span><span></span><span></span>
            </div>
          </div>
        {:else if streamingTurn === 4}
          <div class="message message-assistant">
            <div class="message-body">
              <div class="message-bubble md d-flex fd-column g8 streaming-bubble">{@html progressiveHTML(turnHtml[streamingTurn], streamingChars)}<span class="cursor" aria-hidden="true">▋</span></div>
            </div>
          </div>
        {/if}

        {#if step >= 8}
        <div class="message message-assistant">
          <div class="message-body">
            <div class="message-bubble md d-flex fd-column g8">
              <div class="response-paragraph">
                <strong>Giamir Buoncristiani</strong> proposed using <strong>Icarus telemetry</strong> for yak migrations, with <strong>Sander van Vliet</strong> agreeing the data could expand to other species. However, this is only coming from one source from 6 months ago (<strong>Dec. 2025</strong>). Since I couldn't find any later follow-ups, it would be good to ask around to see if this plan actually moved forward.
              </div>
            </div>
            <div class="response-footer">
              <div class="response-footer-left">
                <Popover id="demo2-telemetry-verified-popover" placement="top-start" visible={t4Verified.open}>
                  <PopoverReference>
                    <button
                      type="button"
                      class="verified-badge-trigger"
                      aria-label="1 source from 6 months ago"
                      onmouseenter={t4Verified.openNow}
                      onmouseleave={t4Verified.closeWithDelay}
                      onfocus={t4Verified.openNow}
                      onblur={t4Verified.closeWithDelay}
                      onclick={t4Verified.openNow}
                    >
                      <VerifiedBadge tone="caution" label="1 source from 6 months ago" />
                    </button>
                  </PopoverReference>
                  <PopoverContent class="verified-sources-popover" role="dialog">
                    <div
                      class="d-flex fd-column"
                      role="presentation"
                      onmouseenter={t4Verified.openNow}
                      onmouseleave={t4Verified.closeWithDelay}
                      onfocusin={t4Verified.openNow}
                      onfocusout={t4Verified.closeWithDelay}
                    >
                      <div class="verified-sources-section d-flex fd-column g16">
                        <div class="verified-sources-heading fs-body1 fw-bold fc-black-800">Sources</div>
                        <a
                          class="verified-source-item d-flex fd-column g6 td-none"
                          href={checkInSource.href}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div class="d-flex ai-center g6">
                            <img class="inline-source-logo" src={checkInSource.logo} alt="" aria-hidden="true" />
                            <span class="fs-caption fw-bold fc-black-600 lh-sm">{checkInSource.title}</span>
                          </div>
                          <div class="d-flex ai-center g6 fs-caption fc-black-600">
                            <Icon src={IconUser} class="inline-source-meta-icon fc-black-400" />
                            <span>{checkInSource.collaborators}</span>
                            <Icon src={IconCalendar} class="inline-source-meta-icon inline-source-date-icon fc-black-400" />
                            <span>{checkInSource.date}</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <div class="ask-giamir-split" class:ask-giamir-split--disabled={askGiamirSent}>
                  <Popover id="demo2-t4-ask-giamir-profile-popover" placement="top" strategy="fixed" visible={t4AskGiamirProfile.open}>
                    <PopoverReference>
                      <button
                        type="button"
                        class="ask-giamir-btn ask-giamir-btn--main d-inline-flex ai-center g6"
                        onmouseenter={t4AskGiamirProfile.openNow}
                        onmouseleave={t4AskGiamirProfile.closeWithDelay}
                        onfocus={t4AskGiamirProfile.openNow}
                        onblur={t4AskGiamirProfile.closeWithDelay}
                        onclick={() => openAskGiamirModal(defaultAskDestination)}
                        disabled={askGiamirSent}
                      >
                        <Icon src={IconServiceSlack} native class="ask-giamir-icon" />
                        <span>{askGiamirSent ? 'Message sent' : 'Ask @giamir'}</span>
                      </button>
                    </PopoverReference>
                    <PopoverContent class="ask-giamir-profile-popover" role="tooltip">
                      <div
                        class="ask-giamir-profile"
                        role="presentation"
                        onmouseenter={t4AskGiamirProfile.openNow}
                        onmouseleave={t4AskGiamirProfile.closeWithDelay}
                      >
                        <img class="ask-giamir-profile__photo" src="/community-embed/Home%20-%20Stack%20Overflow%20Demo%20Site_files/user.svg" alt="" />
                        <div class="ask-giamir-profile__copy">
                          <span class="ask-giamir-profile__name">Giamir Buoncristiani</span>
                          <span class="ask-giamir-profile__role">Staff Developer</span>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Popover id="demo2-t4-ask-giamir-menu-popover" placement="top" strategy="fixed" visible={t4AskGiamir.open}>
                    <PopoverReference>
                      <button
                        type="button"
                        class="ask-giamir-btn ask-giamir-btn--chevron"
                        aria-label="Choose another SME or Slack channel"
                        aria-haspopup="menu"
                        aria-expanded={t4AskGiamir.open}
                        onclick={toggleAskGiamirMenu}
                        disabled={askGiamirSent}
                      >
                        <span class="ask-giamir-dropdown-caret" aria-hidden="true"></span>
                      </button>
                    </PopoverReference>
                    <PopoverContent class="ask-giamir-popover" role="menu">
                      <div class="ask-destination-menu">
                        <div class="ask-destination-menu__label">SMEs</div>
                        {#each askSmeDestinations as destination (destination.value)}
                          <button
                            type="button"
                            class="ask-destination-item"
                            role="menuitem"
                            onclick={() => openAskGiamirModal(destination)}
                          >
                            <span class="ask-destination-avatar" aria-hidden="true">{destination.label.slice(0, 1)}</span>
                            <span class="ask-destination-copy">
                              <span class="ask-destination-name">{destination.label}</span>
                              <span class="ask-destination-meta">{destination.handle} · {destination.description}</span>
                            </span>
                          </button>
                        {/each}
                        <div class="ask-destination-menu__label">Public channels</div>
                        {#each askChannelDestinations as destination (destination.value)}
                          <button
                            type="button"
                            class="ask-destination-item"
                            role="menuitem"
                            onclick={() => openAskGiamirModal(destination)}
                          >
                            <span class="ask-destination-channel" aria-hidden="true">#</span>
                            <span class="ask-destination-copy">
                              <span class="ask-destination-name">{destination.label}</span>
                              <span class="ask-destination-meta">{destination.description}</span>
                            </span>
                          </button>
                        {/each}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Popover id="demo2-t4-good-tooltip" placement="bottom" tooltip>
                  <PopoverReference>
                    <button class="response-action" aria-label="Upvote">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                      </svg>
                    </button>
                  </PopoverReference>
                  <PopoverContent class="response-tooltip">Good response</PopoverContent>
                </Popover>
                <Popover id="demo2-t4-bad-tooltip" placement="bottom" tooltip>
                  <PopoverReference>
                    <button class="response-action" aria-label="Downvote">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
                        <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                      </svg>
                    </button>
                  </PopoverReference>
                  <PopoverContent class="response-tooltip">Bad response</PopoverContent>
                </Popover>
                <Popover id="demo2-t4-copy-tooltip" placement="bottom" tooltip>
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
            {#if askGiamirSent}
              <Notice
                variant="success"
                class="ask-giamir-notice"
              >
                <div class="ask-giamir-notice-copy">
                  <div>Pinged&nbsp;<a href="/slack?scene=telemetry">{askGiamirRequest?.destination.handle ?? '@giamir'}</a>&nbsp;on Slack to verify this answer. You'll be notified when they reply.</div>
                </div>
              </Notice>
            {/if}
          </div>
        </div>
        {/if}

        {#each askGiamirChatMessages as msg, i (i)}
          <div class="message" class:message-user={msg.role === 'user'} class:message-assistant={msg.role === 'assistant'}>
            {#if msg.role === 'assistant'}
              <div class="message-body">
                <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
                <div class="message-bubble md" role="presentation" onclick={(event) => handleChatPreviewAction(event, msg, i)}>{@html renderMarkdown(msg.content)}</div>
                {#if msg.action && isChatActionActive(msg, i)}
                  <div class="message-choice-row" aria-label="Choose next step">
                    {#each getAskGiamirChoices() as option (option.value)}
                      <button
                        class={`s-btn message-choice-btn ${option.emphasis ? 's-btn__primary message-choice-btn--primary' : 's-btn__secondary-outline'}`}
                        type="button"
                        onclick={() => submitChatChoice(option.value, option.label)}
                      >
                        {option.label}
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
            {:else}
              <div class="message-bubble">{msg.content}</div>
            {/if}
          </div>
        {/each}
      </div>
    </main>

    <footer class="chat-footer">
      <div class="footer-inner">
        {#if getSuggestedAskReplies().length > 0}
          <div class="suggested-replies" aria-label="Suggested replies">
            {#each getSuggestedAskReplies() as reply}
              <button class="suggested-reply" type="button" onclick={() => submitSuggestedAskReply(reply.value)}>{reply.label}</button>
            {/each}
          </div>
        {/if}
        <div class="input-bar">
          <input
            class="input-field"
            type="text"
            placeholder="Ask a follow up..."
            bind:value={inputValue}
            onkeydown={handleKeydown}
          />
          <div class="input-actions">
            <div class="input-sources">
              <Popover id="demo2-input-sources-popover" placement="top-end">
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
                      <label class="source-toggle-row d-flex ai-center jc-between g8 p8" for={`demo2-input-source-toggle-${source.id}`}>
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
                            id={`demo2-input-source-toggle-${source.id}`}
                            class="s-toggle-switch"
                            type="checkbox"
                            bind:checked={sourceFilters[source.id]}
                            onclick={(e) => e.stopPropagation()}
                          />
                        </span>
                      </label>
                    {/each}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {#if inputValue.trim()}
              <button class="send-btn" onclick={sendChatMessage} aria-label="Send">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 13V3M3 8l5-5 5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            {/if}
          </div>
        </div>
      </div>
    </footer>
  </div>
</div>

<AskReviewerModal
  visible={askGiamirModalOpen}
  reviewerName={askGiamirDestination.label}
  defaultMessage={getAskReviewDefaultIntro(askGiamirDestination)}
  question={aiGeneratedTelemetryReviewQuestion}
  answer={turn4Response}
  destinations={ASK_REVIEW_DESTINATIONS}
  selectedDestinationValue={askGiamirDestination.value}
  sources={askGiamirPreviewSources}
  onCancel={() => { askGiamirModalOpen = false; }}
  onSend={sendAskGiamir}
/>

<style>
  .demo-chat-page {
    background: #fff;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow-y: auto;
  }

  .demo-chat-centered {
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    max-width: 808px;
    min-height: 100vh;
    width: 100%;
  }

  .chat-header {
    align-items: center;
    background-color: #fff;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    min-height: 64px;
    padding: 12px 24px;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .header-left {
    align-items: center;
    color: #201c1d;
    display: flex;
    font-size: 14px;
    gap: 8px;
  }

  :global(.org-icon) {
    height: 18px;
    width: 18px;
  }

  .org-name {
    color: #201c1d;
    font-size: 14px;
    font-weight: 600;
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

  .header-center {
    align-items: center;
    display: flex;
    justify-content: center;
    min-width: 0;
    overflow: hidden;
    padding: 0 16px;
  }

  .header-right {
    align-items: center;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .new-chat-btn {
    align-items: center;
    background: #201c1d;
    border: none;
    border-radius: 20px;
    color: #fff;
    cursor: pointer;
    display: flex;
    flex-shrink: 0;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    gap: 6px;
    height: 40px;
    padding: 0 16px;
    white-space: nowrap;
  }

  .demo-chat-main {
    align-items: flex-start;
    display: flex;
    flex: 1;
    justify-content: flex-start;
  }

  .messages-inner {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 8px 24px 120px;
    width: 100%;
  }

  .message {
    align-items: flex-start;
    display: flex;
    gap: 0;
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
    color: #201c1d;
    font-size: 16px;
    line-height: 1.6;
    max-width: 80%;
    word-break: break-word;
  }

  .message-assistant .message-bubble {
    max-width: 100%;
  }

  .message-user .message-bubble {
    background: #f0efed;
    border-radius: 16px 16px 4px 16px;
    padding: 10px 14px;
  }

  :global(.ask-giamir-preview) {
    display: flex;
    flex-direction: column;
    gap: 14px;
    max-width: 760px;
  }

  :global(.ask-giamir-preview__intro) {
    margin: 0;
    color: #3b4045;
    font-size: 16px;
    line-height: 1.5;
  }

  :global(.ask-giamir-preview__lead) {
    margin: 0;
    color: #3b4045;
    font-size: 16px;
    line-height: 1.5;
  }

  :global(.ask-giamir-preview__slack-label) {
    margin: 0 0 -4px;
    color: var(--fc-dark, #232629);
    font-size: 14px;
    font-weight: 700;
    line-height: 1.25;
  }

  :global(.ask-giamir-preview__payload) {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  :global(.ask-giamir-alternatives) {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 760px;
  }

  :global(.ask-giamir-alternatives__intro) {
    margin: 0;
    color: #3b4045;
    font-size: 16px;
    line-height: 1.5;
  }

  :global(.ask-giamir-alternatives__prompt) {
    margin: -2px 0 0;
    color: var(--fc-dark, #232629);
    font-size: 15px;
    font-weight: 700;
    line-height: 1.35;
  }

  :global(.ask-giamir-alternatives__section) {
    padding: 12px 14px;
    border: 1px solid var(--bc-black-100, #e3e6e8);
    border-radius: 8px;
    background: #fff;
  }

  :global(.ask-giamir-alternatives__heading) {
    margin: 2px 0 -6px;
    color: var(--fc-dark, #232629);
    font-size: 14px;
    font-weight: 700;
    line-height: 1.25;
  }

  :global(.ask-giamir-alternatives__section ul) {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  :global(.ask-giamir-alternatives__section li) {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  :global(.ask-giamir-alternatives__option) {
    width: 100%;
    display: flex;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font: inherit;
    padding: 8px;
    text-align: left;
  }

  :global(.ask-giamir-alternatives__option:hover) {
    background: #f7f6f5;
  }

  :global(.ask-giamir-alternatives__option-main) {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  :global(.ask-giamir-alternatives__section strong) {
    color: var(--fc-dark, #232629);
    font-size: 14px;
    line-height: 1.25;
  }

  :global(.ask-giamir-alternatives__section span) {
    color: var(--fc-black-500, #6a737c);
    font-size: 13px;
    line-height: 1.35;
  }

  :global(.ask-giamir-preview__field h3),
  :global(.ask-giamir-preview__message h3) {
    margin: 0 0 8px;
    color: var(--fc-dark, #232629);
    font-size: 15px;
    font-weight: 700;
    line-height: 1.25;
  }

  :global(.ask-giamir-preview__field p),
  :global(.ask-giamir-preview__answer p),
  :global(.ask-giamir-preview__message p) {
    margin: 0;
    color: var(--fc-black-700, #3b4045);
    font-size: 16px;
    line-height: 1.6;
    overflow-wrap: anywhere;
    white-space: pre-line;
  }

  :global(.ask-giamir-preview__answer p + p) {
    margin-top: 12px;
  }

  :global(.ask-giamir-preview__history) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 14px;
    border: 1px solid var(--bc-black-100, #e3e6e8);
    border-radius: 6px;
    background: #fff;
  }

  :global(.ask-giamir-preview__history-title) {
    color: var(--fc-dark, #232629);
    font-size: 14px;
    font-weight: 700;
    line-height: 1.25;
  }

  :global(.ask-giamir-preview__history-copy) {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 3px;
  }

  :global(.ask-giamir-preview__history-desc) {
    color: var(--fc-black-500, #6a737c);
    font-size: 13px;
    line-height: 1.35;
  }

  :global(.ask-giamir-preview__toggle) {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 7px;
    color: var(--fc-black-600, #525960);
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
  }

  :global(.ask-giamir-preview__toggle-switch) {
    pointer-events: none;
  }

  :global(.ask-giamir-edit-form) {
    display: flex;
    flex-direction: column;
    gap: 14px;
    max-width: 760px;
  }

  :global(.ask-giamir-edit-form__textarea) {
    width: 100%;
    box-sizing: border-box;
    min-height: 96px;
    border: none;
    border-radius: 10px;
    background: #fff;
    color: #201c1d;
    font: inherit;
    line-height: 1.6;
    outline: none;
    padding: 10px 12px;
    resize: vertical;
  }

  :global(.ask-giamir-edit-form__textarea:focus) {
    box-shadow:
      0 0 0 2px var(--focus-neutral),
      0 0 0 4px var(--theme-secondary-400);
  }

  :global(.ask-giamir-edit-form__actions) {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  :global(.s-btn.s-btn__secondary-outline:not(.s-btn__danger):not(.s-btn__featured):not(.s-btn__tonal):not(.s-btn__link):not(.s-btn__unset):not(.s-btn__facebook):not(.s-btn__github):not(.s-btn__google)) {
    --_bu-bg: var(--white, #fff);
    --_bu-bg-disabled: var(--black-025, #f8f9f9);
    --_bu-bg-hover: var(--black-050, #eff0f1);
    --_bu-bg-selected: var(--black-100, #e3e6e8);
    --_bu-bc: var(--bc-black-200, #d6d9dc);
    --_bu-bc-disabled: var(--bc-black-100, #e3e6e8);
    --_bu-fc: var(--fc-black-600, #525960);
    --_bu-fc-disabled: var(--fc-black-300, #9199a1);
    --_bu-fc-hover: var(--fc-dark, #232629);
  }

  :global(.ask-giamir-preview__message),
  :global(.ask-giamir-preview__field) {
    padding: 12px 14px;
    border-radius: 10px;
    background: #f7f6f5;
  }

  :global(.ask-giamir-preview__field--answer) {
    border: 1px solid var(--bc-black-200, #d6d9dc);
    background: #fff;
  }

  :global(.ask-giamir-preview__message-header) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }

  :global(.ask-giamir-preview__field-header) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }

  :global(.ask-giamir-preview__message-header h3) {
    margin-bottom: 0;
  }

  :global(.ask-giamir-preview__field-header h3) {
    margin-bottom: 0;
  }

  :global(.ask-giamir-preview__edit) {
    width: 30px;
    height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: #6a737c;
    cursor: pointer;
  }

  :global(.ask-giamir-preview__edit:hover) {
    background: #e9e7e5;
    color: #232629;
  }

  :global(.ask-giamir-preview__edit svg) {
    width: 16px;
    height: 16px;
    display: block;
  }

  .message-choice-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
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
    animation: dot-pulse 1.2s ease-in-out infinite;
    background: #6b6d73;
    border-radius: 50%;
    height: 6px;
    width: 6px;
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

  .cursor {
    animation: blink 0.8s step-end infinite;
    color: #6b6d73;
  }

  @keyframes blink {
    50% { opacity: 0; }
  }

  .streaming-bubble :global(p) {
    margin: 0;
  }

  .streaming-bubble :global(a) {
    color: var(--theme-primary-500);
    text-decoration: underline;
    text-underline-offset: 2px;
    word-break: break-all;
  }

  .streaming-bubble :global(a:visited) {
    color: #201c1d;
  }

  .response-paragraph {
    margin: 0;
  }

  .prototype-link {
    color: var(--theme-primary-500);
    text-decoration: underline;
    text-underline-offset: 2px;
    word-break: break-all;
  }

  :global(a.prototype-link:visited) {
    color: #201c1d;
  }

  .prototype-link:hover {
    color: var(--theme-primary-700);
  }

  :global(.inline-source-badge) {
    align-items: center;
    border: none;
    cursor: pointer;
    display: inline-flex;
    gap: 2px;
    justify-content: center;
    margin: 0 2px;
    padding: 0;
    transform: translateY(-1px);
    vertical-align: middle;
  }

  :global(.inline-source-badge .inline-source-badge-icon) {
    color: var(--black-400);
    display: block;
    flex-shrink: 0;
    height: 16px;
    padding: 2px;
    width: 16px;
  }

  :global(.inline-source-popover) {
    max-width: 320px;
    white-space: normal;
    width: 300px;
  }

  .inline-source-card,
  .inline-source-card:visited {
    color: inherit;
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

  .response-footer {
    align-items: center;
    animation: response-footer-fade-in 240ms ease-out;
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
    width: 100%;
  }

  @keyframes response-footer-fade-in {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .response-footer-left {
    align-items: center;
    display: flex;
    gap: 2px;
  }

  .verified-badge {
    align-items: center;
    display: flex;
    flex-shrink: 0;
    margin-right: 8px;
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

  :global(.caution-icon) {
    color: var(--yellow-500);
    flex-shrink: 0;
    height: 16px;
    width: 16px;
  }

  :global(.caution-icon svg) {
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

  .ask-giamir-split {
    display: inline-flex;
    align-items: center;
    margin-right: 8px;
  }

  .ask-giamir-btn {
    align-items: center;
    background: var(--black-100);
    border: none;
    color: var(--black-700);
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    height: 26px;
  }

  .ask-giamir-btn--main {
    border-radius: 999px 0 0 999px;
    padding: 0 9px 0 8px;
  }

  .ask-giamir-btn--chevron {
    border-left: 1px solid rgba(12, 13, 14, 0.08);
    border-radius: 0 999px 999px 0;
    justify-content: center;
    padding: 0;
    width: 30px;
  }

  .ask-giamir-btn:hover:not(:disabled) {
    background: var(--black-150);
    color: var(--black-700);
  }

  .ask-giamir-btn:disabled {
    cursor: default;
    opacity: 0.7;
  }

  .ask-giamir-split--disabled {
    opacity: 0.85;
  }

  :global(.ask-giamir-notice) {
    animation: ask-giamir-slide-in 260ms cubic-bezier(0.2, 0.7, 0.2, 1);
    margin-top: 12px;
  }

  :global(.ask-giamir-notice a) {
    color: inherit;
    text-decoration: underline;
  }

  .ask-giamir-notice-copy {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  @keyframes ask-giamir-slide-in {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  :global(.ask-giamir-icon) {
    flex-shrink: 0;
    height: 14px;
    width: 14px;
  }

  .ask-giamir-dropdown-caret {
    width: 0;
    height: 0;
    display: block;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 6px solid currentColor;
    transform: translateY(1px);
  }

  :global(.s-popover.ask-giamir-popover) {
    max-width: 340px;
    min-width: 0;
    padding: 8px;
    width: 320px;
  }

  :global(.s-popover.ask-giamir-profile-popover) {
    max-width: 280px;
    min-width: 0;
    padding: 12px;
    width: auto;
  }

  .ask-giamir-profile {
    align-items: center;
    display: flex;
    gap: 12px;
  }

  .ask-giamir-profile__photo {
    background: var(--black-050, #eff0f1);
    border-radius: 8px;
    display: block;
    flex: 0 0 auto;
    height: 32px;
    object-fit: cover;
    padding: 8px;
    width: 32px;
  }

  .ask-giamir-profile__copy {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .ask-giamir-profile__name {
    color: var(--fc-dark, #232629);
    font-size: 14px;
    font-weight: 700;
    line-height: 1.25;
    white-space: nowrap;
  }

  .ask-giamir-profile__role {
    color: var(--fc-black-500, #6a737c);
    font-size: 12px;
    line-height: 1.25;
    white-space: nowrap;
  }

  .ask-destination-menu {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ask-destination-menu__label {
    color: var(--fc-black-500, #6a737c);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.03em;
    padding: 6px 8px 2px;
    text-transform: uppercase;
  }

  .ask-destination-item {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: 6px;
    color: var(--fc-dark, #232629);
    cursor: pointer;
    display: flex;
    gap: 10px;
    padding: 8px;
    text-align: left;
    width: 100%;
  }

  .ask-destination-item:hover {
    background: var(--black-050, #eff0f1);
  }

  .ask-destination-avatar,
  .ask-destination-channel {
    align-items: center;
    background: var(--orange-500);
    border-radius: 6px;
    color: #fff;
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 13px;
    font-weight: 700;
    height: 28px;
    justify-content: center;
    width: 28px;
  }

  .ask-destination-channel {
    background: var(--theme-primary-500);
  }

  .ask-destination-copy {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .ask-destination-name {
    color: var(--fc-dark, #232629);
    font-size: 13px;
    font-weight: 700;
    line-height: 1.2;
  }

  .ask-destination-meta {
    color: var(--fc-black-500, #6a737c);
    font-size: 12px;
    line-height: 1.25;
  }

  .response-action {
    align-items: center;
    background: none;
    border: none;
    border-radius: 6px;
    color: #3d3d3d;
    cursor: pointer;
    display: flex;
    height: 30px;
    justify-content: center;
    width: 30px;
  }

  .response-action:hover {
    background: #f0efed;
    color: #201c1d;
  }

  .response-action :global(svg) {
    height: 18px;
    width: 18px;
  }

  .source-docs-icon,
  .source-glyph {
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

  .source-icons {
    align-items: center;
    display: flex;
    gap: 2px;
  }

  :global(.source-caret) {
    flex-shrink: 0;
    height: 12px;
    transform: translateY(2px);
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

  .chat-footer {
    background: #fff;
    bottom: 0;
    flex-shrink: 0;
    padding: 16px 24px 24px;
    position: sticky;
  }

  .footer-inner {
    margin: 0 auto;
    max-width: 760px;
    width: 100%;
  }

  .input-bar {
    align-items: center;
    background: #f7f6f5;
    border: none;
    border-radius: 10px;
    display: flex;
    gap: 8px;
    margin-top: 0;
    padding: 8px;
    transition: box-shadow 0.1s ease-in;
  }

  .input-bar:has(.input-field:focus) {
    box-shadow:
      0 0 0 2px var(--focus-neutral),
      0 0 0 4px var(--theme-secondary-400);
  }

  .input-field {
    background: transparent;
    border: none;
    color: #201c1d;
    flex: 1;
    font-family: inherit;
    font-size: 16px;
    line-height: 1.35;
    min-height: 32px;
    min-width: 0;
    outline: none;
    padding: 0 0 0 10px;
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

  :global(.input-source-button) {
    white-space: nowrap;
  }

  .send-btn {
    align-items: center;
    background: #201c1d;
    border: none;
    border-radius: 50%;
    color: #fff;
    cursor: pointer;
    display: flex;
    flex-shrink: 0;
    height: 32px;
    justify-content: center;
    transition: opacity 0.15s;
    width: 32px;
  }

  .send-btn:hover {
    opacity: 0.85;
  }

  .suggested-replies {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
    padding-left: 2px;
  }

  .suggested-reply {
    border: 1px solid var(--bc-black-100, #e3e6e8);
    border-radius: 999px;
    background: #fff;
    color: var(--fc-black-600, #525960);
    cursor: pointer;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.25;
    padding: 7px 11px;
  }

  .suggested-reply:hover {
    background: #f7f6f5;
    color: var(--fc-dark, #232629);
  }

  :global(.app-shell.dark .ask-giamir-preview__intro),
  :global(.app-shell.dark .ask-giamir-preview__lead),
  :global(.app-shell.dark .ask-giamir-preview__field h3),
  :global(.app-shell.dark .ask-giamir-preview__message h3),
  :global(.app-shell.dark .ask-giamir-preview__history-title),
  :global(.app-shell.dark .ask-giamir-alternatives__heading),
  :global(.app-shell.dark .ask-giamir-alternatives__prompt),
  :global(.app-shell.dark .ask-giamir-alternatives__section strong),
  :global(.app-shell.dark .ask-giamir-profile__name),
  :global(.app-shell.dark .ask-giamir-preview__field p),
  :global(.app-shell.dark .ask-giamir-preview__answer p),
  :global(.app-shell.dark .ask-giamir-preview__message p),
  :global(.app-shell.dark .ask-giamir-alternatives__intro) {
    color: #e3e3e3;
  }

  :global(.app-shell.dark .ask-giamir-preview__history),
  :global(.app-shell.dark .ask-giamir-alternatives__section) {
    border-color: #3a3a3a;
    background: #202020;
  }

  :global(.app-shell.dark .ask-giamir-preview__message),
  :global(.app-shell.dark .ask-giamir-preview__field) {
    background: #2a2a2a;
  }

  :global(.app-shell.dark .ask-giamir-preview__field--answer) {
    border-color: #3a3a3a;
    background: #202020;
  }

  :global(.app-shell.dark .ask-giamir-preview__history-copy) {
    color: #b8b8b8;
  }

  :global(.app-shell.dark .ask-giamir-preview__history-desc),
  :global(.app-shell.dark .ask-giamir-preview__toggle),
  :global(.app-shell.dark .ask-giamir-profile__role),
  :global(.app-shell.dark .ask-giamir-alternatives__section span) {
    color: #b8b8b8;
  }

  :global(.app-shell.dark .ask-giamir-alternatives__option:hover) {
    background: #2a2a2a;
  }

  :global(.app-shell.dark) .suggested-reply {
    border-color: #3a3a3a;
    background: #202020;
    color: #b8b8b8;
  }

  :global(.app-shell.dark) .suggested-reply:hover {
    background: #2a2a2a;
    color: #e3e3e3;
  }

  :global(.app-shell.dark .ask-giamir-preview__edit) {
    color: #b8b8b8;
  }

  :global(.app-shell.dark .ask-giamir-preview__edit:hover) {
    background: #3a3a3a;
    color: #e3e3e3;
  }

  @media (max-width: 767px) {
    .demo-chat-main {
      padding-top: 24px;
    }

    .messages-inner {
      padding-inline: 16px;
    }

    .message-bubble {
      max-width: 88%;
    }

    .chat-footer {
      padding: 12px 16px 16px;
    }
  }
</style>
