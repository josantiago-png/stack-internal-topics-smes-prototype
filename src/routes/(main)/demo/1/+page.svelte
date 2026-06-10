<script lang="ts">
  import {
    IconAlert,
    IconCalendar,
    IconCheck,
    IconChevron12Down,
    IconCompany,
    IconDocument16,
    IconGlyph,
    IconServiceSlack,
    IconUser,
  } from '@stackoverflow/stacks-icons/icons';
  import { tick } from 'svelte';
  import { goto } from '$app/navigation';
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
  import { Button, Icon, Notice, Popover, PopoverContent, PopoverReference } from '@stackoverflow/stacks-svelte';
  import VerifiedBadge from '$lib/components/VerifiedBadge.svelte';
  import SearchingIndicator from '$lib/components/SearchingIndicator.svelte';
  import { marked } from 'marked';

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

  const turn1Response = `Project Yak is led by **Drew Meacham**, **Giamir Buoncristiani**, and **Brandon Rosage**.

They started the project in January 2026 with the goal of making the migration patterns of yaks accessible to the land owners whose property hundreds of yaks migrate through every year.`;

  const turn2Response = `Discovery will be completed **May 7, 2026**, an alpha release of the web application will be released **June 14, 2026**, and a beta release of the web application will be released **Aug. 21, 2026**.

The Project Yak roadmap includes **eight milestones**.`;

  const turn3Response = `It appears so. The **December 5, 2025** check-in note mentions that **the alpha environment is stood up**, the team has **completed two internal demos**, and they're **on track for the May 7 discovery deadline**. Since I can't cross-reference this with other docs yet, you might want to confirm with the team directly.`;

  const turnHtml: Record<number, string> = {
    1: renderMarkdown(turn1Response),
    2: renderMarkdown(turn2Response),
    3: renderMarkdown(turn3Response),
  };

  const question = 'Who is leading project Yak?';
  const firstSentence = 'Project Yak is led by Drew Meacham, Giamir Buoncristiani, and Brandon Rosage.';
  const remainingResponse = 'They started the project in January 2026 with the goal of making the migration patterns of yaks accessible to the land owners whose property hundreds of yaks migrate through every year.';
  const followupQuestion = 'When will the project be completed?';
  const roadmapTimeline = 'Discovery will be completed May 7, 2026, an alpha release of the web application will be released June 14, 2026, and a beta release of the web application will be released Aug. 21, 2026.';
  const roadmapMilestones = 'The Project Yak roadmap includes eight milestones.';
  const engineeringQuestion = 'Has engineering begun?';
  const aiGeneratedReviewQuestion = 'Based on the shared Project Yak chat history, can you confirm whether engineering has begun, whether the alpha environment is already stood up, and whether the team is still on track for the May 7 discovery deadline?';
  const checkInSourceTitle = 'Next check-in meeting';
  const checkInSourceDate = 'Dec. 5, 2025';
  const checkInSourceCollaborators = '3 collaborators';
  const checkInSourceName = `${checkInSourceTitle} (${checkInSourceDate}) - ${checkInSourceCollaborators}`;
  const askGiamirPreviewSources: AskReviewSource[] = [
    {
      title: checkInSourceTitle,
      author: checkInSourceCollaborators,
      date: checkInSourceDate,
      icon: '/icon-google-docs.svg',
    },
  ];
  const inlineSourceName = 'Project Yak brief (April 22, 2026) - by Giamir Buoncristiani';
  const inlineSourceTitle = 'Project Yak brief';
  const inlineSourceAuthor = 'Giamir Buoncristiani';
  const inlineSourceDate = 'April 22, 2026';
  const timelineSourceDate = 'May 26, 2026';
  const migrationSourceName = 'FY27 product direction and Yak migrations spike';
  const migrationSources = [
    {
      id: 'fy27-product-direction',
      href: 'https://stackoverflow.design',
      logo: '/logo-stack-internal-community.svg',
      title: 'FY27 product direction',
      author: 'Brandon Rosage',
      date: 'March 28, 2026',
    },
    {
      id: 'yak-migrations-spike',
      href: 'https://docs.google.com/document/d/1mkO6TcOXCQs9G_MQl1udGMVnwSVA7Blda6wDpkoiSts/edit?usp=sharing',
      logo: '/icon-google-docs.svg',
      title: 'Yak migrations spike',
      author: 'Giamir Buoncristiani',
      date: 'Oct. 12, 2025',
    },
  ];
  const verifiedSources = [
    {
      id: 'project-yak-brief',
      href: 'https://docs.google.com/document/d/1mkO6TcOXCQs9G_MQl1udGMVnwSVA7Blda6wDpkoiSts/edit?usp=sharing',
      logo: '/icon-google-docs.svg',
      sourceName: 'Google Docs',
      title: inlineSourceTitle,
      author: inlineSourceAuthor,
      date: inlineSourceDate,
    },
    {
      id: 'fy27-product-direction',
      href: 'https://stackoverflow.design',
      logo: '/logo-stack-internal-community.svg',
      sourceName: 'Stack Internal',
      title: 'FY27 product direction',
      author: 'Brandon Rosage',
      date: 'March 28, 2026',
    },
    {
      id: 'yak-migrations-spike',
      href: 'https://docs.google.com/document/d/1mkO6TcOXCQs9G_MQl1udGMVnwSVA7Blda6wDpkoiSts/edit?usp=sharing',
      logo: '/icon-google-docs.svg',
      sourceName: 'Google Docs',
      title: 'Yak migrations spike',
      author: 'Giamir Buoncristiani',
      date: 'Oct. 12, 2025',
    },
  ];

  const sourceOptions = [
    { id: 'stack', label: 'Stack Internal Community', icon: 'stack' },
    { id: 'docs', label: 'Google Docs', icon: 'docs' },
    { id: 'slack', label: 'Slack', icon: 'slack' },
    { id: 'stackoverflow', label: 'Stack Overflow', icon: 'stackoverflow' },
  ];

  let inputValue = $state('');
  let sourceFilters = $state<Record<string, boolean>>({
    stack: true,
    docs: true,
    slack: true,
    stackoverflow: false,
  });

  const selectedSourceOptions = $derived(sourceOptions.filter((source) => sourceFilters[source.id]));
  const selectedSourceCount = $derived(selectedSourceOptions.length);

  function isLastSelectedSource(sourceId: string) {
    return Boolean(sourceFilters[sourceId] && selectedSourceCount === 1);
  }
  let inlineSourceOpen = $state(false);
  let inlineSourceCloseTimer: ReturnType<typeof setTimeout> | null = null;
  let migrationSourceOpen = $state(false);
  let migrationSourceCloseTimer: ReturnType<typeof setTimeout> | null = null;
  let verifiedSourcesOpen = $state(false);
  let verifiedSourcesCloseTimer: ReturnType<typeof setTimeout> | null = null;
  let timelineSourceOpen = $state(false);
  let timelineSourceCloseTimer: ReturnType<typeof setTimeout> | null = null;
  let milestonesSourceOpen = $state(false);
  let milestonesSourceCloseTimer: ReturnType<typeof setTimeout> | null = null;
  let timelineVerifiedOpen = $state(false);
  let timelineVerifiedCloseTimer: ReturnType<typeof setTimeout> | null = null;
  let engineeringVerifiedOpen = $state(false);
  let engineeringVerifiedCloseTimer: ReturnType<typeof setTimeout> | null = null;
  let askGiamirOpen = $state(false);
  let askGiamirCloseTimer: ReturnType<typeof setTimeout> | null = null;
  let askGiamirProfileOpen = $state(false);
  let askGiamirProfileCloseTimer: ReturnType<typeof setTimeout> | null = null;
  let askGiamirSent = $state(false);
  let askGiamirModalOpen = $state(false);
  let askGiamirRequest = $state<AskGiamirRequest | null>(null);
  let askGiamirDestination = $state<AskReviewDestination>(defaultAskDestination);
  let askGiamirChatStep = $state<AskGiamirChatStep>('idle');
  let askGiamirChatIntro = $state(getAskReviewDefaultIntro(defaultAskDestination));
  let askGiamirChatQuestion = $state(aiGeneratedReviewQuestion);
  let askGiamirChatShareFullHistory = $state(true);
  let askGiamirReasonAnswered = $state(false);
  let lowTrustAnswered = $state(false);

  // --- Stop / conversation mode ---
  let autoplayStopped = $state(false);
  let stoppedManually = $state(false);
  let conversationMode = $state(false);
  let stoppedPartialTurn = $state(0);
  let stoppedPartialChars = $state(0);

  type AskGiamirMessageAction = 'preview-choice' | 'edit-form' | 'destination-list';
  type AskGiamirChoice = { value: string; label: string; emphasis?: boolean };
  type SuggestedReply = { label: string; value: string };
  type LiveMessage = { role: 'user' | 'assistant'; content: string; action?: AskGiamirMessageAction };
  let liveMessages = $state<LiveMessage[]>([]);
  let liveIsLoading = $state(false);
  let liveStreamingContent = $state('');
  let liveStreamController: AbortController | null = null;

  function retryDemo() {
    liveStreamController?.abort();
    autoplayStopped = false;
    stoppedManually = false;
    conversationMode = false;
    stoppedPartialTurn = 0;
    stoppedPartialChars = 0;
    liveMessages = [];
    liveIsLoading = false;
    liveStreamingContent = '';
    inputValue = '';
    askGiamirChatStep = 'idle';
    askGiamirChatIntro = getAskReviewDefaultIntro(defaultAskDestination);
    askGiamirChatQuestion = aiGeneratedReviewQuestion;
    askGiamirChatShareFullHistory = true;
    askGiamirReasonAnswered = false;
    lowTrustAnswered = false;
    askGiamirDestination = defaultAskDestination;
    step = 0;
    streamingTurn = 0;
    streamingChars = 0;
    loadingTurn = 0;
    autoplayActive = true;
    runAutoplay();
  }

  function stopAutoplay() {
    if (streamingTurn > 0) {
      stoppedPartialTurn = streamingTurn;
      stoppedPartialChars = streamingChars;
    }
    inputValue = '';
    loadingTurn = 0;
    streamingTurn = 0;
    autoplayStopped = true;
    autoplayActive = false;
    stoppedManually = true;
    enterConversationMode();
  }

  function enterConversationMode() {
    conversationMode = true;
    if (liveMessages.length === 0) {
      liveMessages = [
        { role: 'user', content: question },
        { role: 'assistant', content: turn1Response },
      ];
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendLiveMessage();
    }
  }

  async function scrollConversationToBottom() {
    await tick();
    const scroller = document.querySelector('.demo-chat-scroll');
    scroller?.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
  }

  async function addLiveAssistantMessage(content: string, action?: AskGiamirMessageAction) {
    liveMessages = [...liveMessages, { role: 'assistant', content, action }];
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

    if (step >= 6) {
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

  function isLiveActionActive(msg: LiveMessage, messageIndex: number) {
    if (msg.role !== 'assistant' || !msg.action) return false;
    const lastActionIndex = liveMessages.reduce((lastIndex, current, index) => {
      return current.role === 'assistant' && current.action ? index : lastIndex;
    }, -1);
    if (messageIndex !== lastActionIndex) return false;

    return msg.action === 'preview-choice' && askGiamirChatStep === 'preview';
  }

  async function submitLiveChoice(value: string, label: string) {
    if (liveIsLoading) return;
    liveMessages = [...liveMessages, { role: 'user', content: label }];
    await handleAskGiamirChatFlow(value);
  }

  async function showSelectedDestinationPreview(destination: AskReviewDestination) {
    askGiamirDestination = destination;
    askGiamirChatIntro = getAskReviewDefaultIntro(destination);
    askGiamirChatStep = 'preview';
    await addLiveAssistantMessage(`<p>Okay, I'll ask ${destination.label}.</p>${getIntroPrompt({
      intro: askGiamirChatIntro,
      question: askGiamirChatQuestion,
      answer: turn3Response,
      shareFullHistory: askGiamirChatShareFullHistory,
      destination: askGiamirDestination,
      sources: askGiamirPreviewSources,
    })}`, 'preview-choice');
  }

  async function handleLivePreviewAction(event: MouseEvent, msg: LiveMessage, messageIndex: number) {
    const target = event.target as HTMLElement | null;
    if (msg.role !== 'assistant' || !msg.action) return;
    const lastActionIndex = liveMessages.reduce((lastIndex, current, index) => {
      return current.role === 'assistant' && current.action ? index : lastIndex;
    }, -1);
    if (messageIndex !== lastActionIndex) return;

    const destinationButton = target?.closest<HTMLElement>('[data-ask-giamir-destination]');
    if (destinationButton && msg.action === 'destination-list' && askGiamirChatStep === 'preview') {
      event.preventDefault();
      const destination = findAskReviewDestination(destinationButton.dataset.askGiamirDestination ?? '');
      if (!destination) return;
      liveMessages = [...liveMessages, { role: 'user', content: `Ask ${destination.handle}` }];
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
      liveMessages = [...liveMessages, { role: 'user', content: 'Save edits' }];
      await addLiveAssistantMessage(getIntroPrompt({
        intro: askGiamirChatIntro,
        question: askGiamirChatQuestion,
        answer: turn3Response,
        shareFullHistory: askGiamirChatShareFullHistory,
        destination: askGiamirDestination,
        sources: askGiamirPreviewSources,
      }), 'preview-choice');
    }

    if (actionButton.dataset.askGiamirAction === 'cancel-edits' && msg.action === 'edit-form' && askGiamirChatStep === 'edit') {
      askGiamirChatStep = 'preview';
      liveMessages = [...liveMessages, { role: 'user', content: 'Cancel edits' }];
      await addLiveAssistantMessage(getIntroPrompt({
        intro: askGiamirChatIntro,
        question: askGiamirChatQuestion,
        answer: turn3Response,
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
      answer: turn3Response,
      shareFullHistory: askGiamirChatShareFullHistory,
      destination: askGiamirDestination,
    };
    askGiamirSent = true;
    askGiamirOpen = false;
    askGiamirProfileOpen = false;
    askGiamirModalOpen = false;
  }

  async function handleAskGiamirChatFlow(text: string) {
    if (isAskGiamirReasonQuestion(text)) {
      askGiamirReasonAnswered = true;
      await addLiveAssistantMessage(getAskGiamirReasonPrompt());
      return true;
    }

    if (isAskLowTrustQuestion(text)) {
      lowTrustAnswered = true;
      await addLiveAssistantMessage(getAskLowTrustPrompt());
      return true;
    }

    if (askGiamirChatStep === 'idle') {
      if (isMenuWhoElseChoice(text)) {
        askGiamirChatIntro = getAskReviewDefaultIntro(defaultAskDestination);
        askGiamirChatQuestion = aiGeneratedReviewQuestion;
        askGiamirChatShareFullHistory = true;
        askGiamirDestination = defaultAskDestination;
        askGiamirChatStep = 'preview';
        await addLiveAssistantMessage(formatAskAlternativesList(), 'destination-list');
        return true;
      }

      if (!isAskGiamirCommand(text)) return false;
      askGiamirChatIntro = getAskReviewDefaultIntro(defaultAskDestination);
      askGiamirChatQuestion = aiGeneratedReviewQuestion;
      askGiamirChatShareFullHistory = true;
      askGiamirDestination = defaultAskDestination;
      askGiamirChatStep = 'preview';
      await addLiveAssistantMessage(getIntroPrompt({
        intro: askGiamirChatIntro,
        question: askGiamirChatQuestion,
        answer: turn3Response,
        shareFullHistory: askGiamirChatShareFullHistory,
        destination: askGiamirDestination,
        sources: askGiamirPreviewSources,
      }), 'preview-choice');
      return true;
    }

    if (askGiamirChatStep === 'preview') {
      if (isMenuSendChoice(text)) {
        markAskGiamirSentFromChat();
        askGiamirChatStep = 'idle';
        await addLiveAssistantMessage(getSentConfirmation(askGiamirDestination.label));
        await tick();
        document.querySelector('.ask-giamir-notice')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        return true;
      }

      if (isMenuEditChoice(text)) {
        askGiamirChatStep = 'edit';
        await addLiveAssistantMessage(formatAskGiamirEditForm({
          intro: askGiamirChatIntro,
          question: askGiamirChatQuestion,
          answer: turn3Response,
          destination: askGiamirDestination,
        }), 'edit-form');
        return true;
      }

      const destination = findAskReviewDestination(text);
      if (destination) {
        await showSelectedDestinationPreview(destination);
        return true;
      }

      await addLiveAssistantMessage(getInvalidMenuChoicePrompt());
      return true;
    }

    if (askGiamirChatStep === 'edit') {
      await addLiveAssistantMessage('Use the edit fields above, then choose `Save and preview`.');
      return true;
    }

    return false;
  }

  async function sendLiveMessage() {
    if (!inputValue.trim() || liveIsLoading) return;
    const text = inputValue.trim();
    inputValue = '';
    askGiamirOpen = false;
    askGiamirProfileOpen = false;
    if (!conversationMode) enterConversationMode();
    liveMessages = [...liveMessages, { role: 'user', content: text }];
    if (await handleAskGiamirChatFlow(text)) return;
    liveIsLoading = true;
    liveStreamingContent = '';

    liveStreamController?.abort();
    liveStreamController = new AbortController();
    const { signal } = liveStreamController;

    try {
      const body = {
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        stream: true,
        system: `You are Stack, an AI assistant embedded in Acme's internal knowledge base. Answer questions about Acme's internal projects as if you have full access to documents, Slack, wikis, and project history. Make up realistic, specific details. Keep responses concise. Use markdown.`,
        messages: liveMessages.map(m => ({ role: m.role, content: m.content })),
      };
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal,
      });

      if (!response.ok) throw new Error(`status ${response.status}`);

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

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
                liveStreamingContent += parsed.delta.text;
              }
            } catch {}
          }
        }
      }

      if (!signal.aborted) {
        liveMessages = [...liveMessages, { role: 'assistant', content: liveStreamingContent }];
        liveStreamingContent = '';
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      await simulateLiveResponse(signal);
    } finally {
      if (liveStreamingContent) {
        liveMessages = [...liveMessages, { role: 'assistant', content: liveStreamingContent }];
        liveStreamingContent = '';
      }
      liveIsLoading = false;
    }
  }

  const LIVE_FALLBACK = `Based on the information I have, Project Yak is progressing well toward its milestones. The team led by Drew Meacham, Giamir Buoncristiani, and Brandon Rosage is on track for the May 7 discovery deadline.

Is there something specific you'd like to know?`;

  async function simulateLiveResponse(signal: AbortSignal) {
    await new Promise(r => setTimeout(r, 800));
    if (signal.aborted) return;
    for (let i = 0; i < LIVE_FALLBACK.length; i += 3) {
      if (signal.aborted) return;
      liveStreamingContent += LIVE_FALLBACK.slice(i, i + 3);
      await new Promise(r => setTimeout(r, 18));
    }
    if (!signal.aborted) {
      liveMessages = [...liveMessages, { role: 'assistant', content: liveStreamingContent }];
      liveStreamingContent = '';
    }
  }

  async function submitSuggestedAskReply(text: string) {
    if (liveIsLoading || autoplayActive) return;
    inputValue = text;
    await tick();
    await sendLiveMessage();
  }

  function openAskGiamirModal(destination = defaultAskDestination) {
    askGiamirDestination = destination;
    if (askGiamirCloseTimer) {
      clearTimeout(askGiamirCloseTimer);
      askGiamirCloseTimer = null;
    }
    if (askGiamirProfileCloseTimer) {
      clearTimeout(askGiamirProfileCloseTimer);
      askGiamirProfileCloseTimer = null;
    }
    askGiamirOpen = false;
    askGiamirProfileOpen = false;
    askGiamirModalOpen = true;
  }

  function toggleAskGiamirMenu(event: MouseEvent) {
    event.stopPropagation();
    if (askGiamirSent) return;
    askGiamirProfileOpen = false;
    if (askGiamirOpen) {
      askGiamirOpen = false;
    } else {
      openAskGiamir();
    }
  }

  async function sendAskGiamir(payload: Omit<AskGiamirRequest, 'destination'>) {
    askGiamirRequest = { ...payload, destination: askGiamirDestination };
    askGiamirSent = true;
    askGiamirOpen = false;
    askGiamirProfileOpen = false;
    askGiamirModalOpen = false;
    await tick();
    document.querySelector('.ask-giamir-notice')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function openAskGiamir() {
    if (askGiamirCloseTimer) {
      clearTimeout(askGiamirCloseTimer);
      askGiamirCloseTimer = null;
    }
    askGiamirOpen = true;
  }

  function closeAskGiamirWithDelay() {
    if (askGiamirCloseTimer) clearTimeout(askGiamirCloseTimer);
    askGiamirCloseTimer = setTimeout(() => {
      askGiamirOpen = false;
      askGiamirCloseTimer = null;
    }, 300);
  }

  function openAskGiamirProfile() {
    if (askGiamirProfileCloseTimer) {
      clearTimeout(askGiamirProfileCloseTimer);
      askGiamirProfileCloseTimer = null;
    }
    askGiamirProfileOpen = true;
  }

  function closeAskGiamirProfileWithDelay() {
    if (askGiamirProfileCloseTimer) clearTimeout(askGiamirProfileCloseTimer);
    askGiamirProfileCloseTimer = setTimeout(() => {
      askGiamirProfileOpen = false;
      askGiamirProfileCloseTimer = null;
    }, 300);
  }

  function openInlineSource() {
    if (inlineSourceCloseTimer) {
      clearTimeout(inlineSourceCloseTimer);
      inlineSourceCloseTimer = null;
    }
    inlineSourceOpen = true;
  }

  function closeInlineSourceWithDelay() {
    if (inlineSourceCloseTimer) clearTimeout(inlineSourceCloseTimer);
    inlineSourceCloseTimer = setTimeout(() => {
      inlineSourceOpen = false;
      inlineSourceCloseTimer = null;
    }, 350);
  }

  function openMigrationSource() {
    if (migrationSourceCloseTimer) {
      clearTimeout(migrationSourceCloseTimer);
      migrationSourceCloseTimer = null;
    }
    migrationSourceOpen = true;
  }

  function closeMigrationSourceWithDelay() {
    if (migrationSourceCloseTimer) clearTimeout(migrationSourceCloseTimer);
    migrationSourceCloseTimer = setTimeout(() => {
      migrationSourceOpen = false;
      migrationSourceCloseTimer = null;
    }, 350);
  }

  function openVerifiedSources() {
    if (verifiedSourcesCloseTimer) {
      clearTimeout(verifiedSourcesCloseTimer);
      verifiedSourcesCloseTimer = null;
    }
    verifiedSourcesOpen = true;
  }

  function closeVerifiedSourcesWithDelay() {
    if (verifiedSourcesCloseTimer) clearTimeout(verifiedSourcesCloseTimer);
    verifiedSourcesCloseTimer = setTimeout(() => {
      verifiedSourcesOpen = false;
      verifiedSourcesCloseTimer = null;
    }, 350);
  }

  function openTimelineSource() {
    if (timelineSourceCloseTimer) {
      clearTimeout(timelineSourceCloseTimer);
      timelineSourceCloseTimer = null;
    }
    timelineSourceOpen = true;
  }

  function closeTimelineSourceWithDelay() {
    if (timelineSourceCloseTimer) clearTimeout(timelineSourceCloseTimer);
    timelineSourceCloseTimer = setTimeout(() => {
      timelineSourceOpen = false;
      timelineSourceCloseTimer = null;
    }, 350);
  }

  function openMilestonesSource() {
    if (milestonesSourceCloseTimer) {
      clearTimeout(milestonesSourceCloseTimer);
      milestonesSourceCloseTimer = null;
    }
    milestonesSourceOpen = true;
  }

  function closeMilestonesSourceWithDelay() {
    if (milestonesSourceCloseTimer) clearTimeout(milestonesSourceCloseTimer);
    milestonesSourceCloseTimer = setTimeout(() => {
      milestonesSourceOpen = false;
      milestonesSourceCloseTimer = null;
    }, 350);
  }

  function openTimelineVerified() {
    if (timelineVerifiedCloseTimer) {
      clearTimeout(timelineVerifiedCloseTimer);
      timelineVerifiedCloseTimer = null;
    }
    timelineVerifiedOpen = true;
  }

  function closeTimelineVerifiedWithDelay() {
    if (timelineVerifiedCloseTimer) clearTimeout(timelineVerifiedCloseTimer);
    timelineVerifiedCloseTimer = setTimeout(() => {
      timelineVerifiedOpen = false;
      timelineVerifiedCloseTimer = null;
    }, 350);
  }

  function openEngineeringVerified() {
    if (engineeringVerifiedCloseTimer) {
      clearTimeout(engineeringVerifiedCloseTimer);
      engineeringVerifiedCloseTimer = null;
    }
    engineeringVerifiedOpen = true;
  }

  function closeEngineeringVerifiedWithDelay() {
    if (engineeringVerifiedCloseTimer) clearTimeout(engineeringVerifiedCloseTimer);
    engineeringVerifiedCloseTimer = setTimeout(() => {
      engineeringVerifiedOpen = false;
      engineeringVerifiedCloseTimer = null;
    }, 350);
  }

  // --- Autoplay ---
  // step 0: nothing; 1: user1; 2: +assistant1; 3: +user2; 4: +assistant2; 5: +user3; 6: +assistant3
  const autoplayRequested = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('autoplay') === '1';
  let autoplayActive = $state(autoplayRequested);
  let step = $state(autoplayRequested ? 0 : 6);

  // Rename the active tab to reflect this conversation
  tabsState.renameTab(tabsState.activeTabId, 'Project Yak');
  let streamingTurn = $state(0); // 1, 2, 3 while streaming that turn's response
  let streamingChars = $state(0);
  let loadingTurn = $state(0); // 1, 2, 3 while showing loading dots for that turn
  let autoplayStarted = false;

  $effect(() => {
    if (autoplayStarted) return;
    autoplayStarted = true;
    if (!autoplayRequested) {
      enterConversationMode();
      return;
    }
    history.replaceState({}, '', '/demo/1');
    runAutoplay();
  });

  function delay(ms: number) {
    return new Promise<void>((r) => setTimeout(r, ms));
  }

  async function typeIntoInput(text: string) {
    inputValue = '';
    for (const ch of text) {
      if (autoplayStopped) return;
      inputValue += ch;
      await delay(40);
    }
  }

  async function streamResponse(turn: number, _markdown: string) {
    loadingTurn = turn;
    await delay(turn === 1 ? 3000 : 900);
    loadingTurn = 0;
    if (autoplayStopped) return;
    streamingTurn = turn;
    streamingChars = 0;
    const totalChars = countVisibleChars(turnHtml[turn]);
    const chunkSize = 3;
    const charDelay = 18;
    for (let i = 0; i <= totalChars; i += chunkSize) {
      if (autoplayStopped) { streamingTurn = 0; return; }
      streamingChars = Math.min(i, totalChars);
      await delay(charDelay);
    }
    await delay(150);
    streamingTurn = 0;
    streamingChars = 0;
  }

  async function runAutoplay() {
    await delay(300);
    if (autoplayStopped) { enterConversationMode(); return; }
    step = 1;
    await delay(600);
    await streamResponse(1, turn1Response);
    if (autoplayStopped) { enterConversationMode(); return; }
    step = 2;

    await delay(1600);
    if (autoplayStopped) { enterConversationMode(); return; }
    await typeIntoInput(followupQuestion);
    if (autoplayStopped) { enterConversationMode(); return; }
    await delay(450);
    if (autoplayStopped) { enterConversationMode(); return; }
    inputValue = '';
    step = 3;
    await delay(500);
    await streamResponse(2, turn2Response);
    if (autoplayStopped) { enterConversationMode(); return; }
    step = 4;

    await delay(1800);
    if (autoplayStopped) { enterConversationMode(); return; }
    await typeIntoInput(engineeringQuestion);
    if (autoplayStopped) { enterConversationMode(); return; }
    await delay(450);
    if (autoplayStopped) { enterConversationMode(); return; }
    inputValue = '';
    step = 5;
    await delay(500);
    await streamResponse(3, turn3Response);
    if (autoplayStopped) { enterConversationMode(); return; }
    step = 6;
    autoplayActive = false;
    enterConversationMode();
  }

</script>

<svelte:head>
  <title>Demo chat detail</title>
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
  <div class="demo-chat-scroll">
  <div class="demo-chat-centered">
    <main class="demo-chat-main" aria-label="Demo chat detail">
      <div class="messages-inner">
        {#if step >= 1}
        <div class="message message-user">
          <div class="message-bubble">{question}</div>
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
        {:else if stoppedPartialTurn === 1 && step < 2}
          <div class="message message-assistant">
            <div class="message-body">
              <div class="message-bubble md d-flex fd-column g8">{@html progressiveHTML(turnHtml[1], stoppedPartialChars)}</div>
            </div>
          </div>
        {/if}

        {#if step >= 2}
        <div class="message message-assistant">
          <div class="message-body">
            <div class="message-bubble md d-flex fd-column g8">
              <div class="response-paragraph">
                Project Yak is led by <strong>Drew Meacham</strong>, <strong>Giamir Buoncristiani</strong>, and <strong>Brandon Rosage</strong>.
                <Popover id="demo-inline-source-project-yak" placement="bottom" visible={inlineSourceOpen} tooltip>
                  <PopoverReference>
                    <button
                      type="button"
                      class="s-badge inline-source-badge"
                      aria-label={inlineSourceName}
                      onmouseenter={openInlineSource}
                      onmouseleave={closeInlineSourceWithDelay}
                      onfocus={openInlineSource}
                      onblur={closeInlineSourceWithDelay}
                      onclick={openInlineSource}
                    >
                      <Icon src={IconDocument16} class="inline-source-badge-icon" />
                    </button>
                  </PopoverReference>
                  <PopoverContent class="inline-source-popover" role="tooltip">
                    <a
                      class="inline-source-card d-flex fd-column g6 td-none"
                      href="https://docs.google.com/document/d/1mkO6TcOXCQs9G_MQl1udGMVnwSVA7Blda6wDpkoiSts/edit?usp=sharing"
                      target="_blank"
                      rel="noreferrer"
                      onmouseenter={openInlineSource}
                      onmouseleave={closeInlineSourceWithDelay}
                      onfocus={openInlineSource}
                      onblur={closeInlineSourceWithDelay}
                    >
                      <div class="d-flex ai-center g6">
                        <img class="inline-source-logo" src="/icon-google-docs.svg" alt="" aria-hidden="true" />
                        <span class="fs-caption fw-bold fc-black-600 lh-sm">{inlineSourceTitle}</span>
                      </div>
                      <div class="d-flex ai-center g6 fs-caption fc-black-600">
                        <Icon src={IconUser} class="inline-source-meta-icon fc-black-400" />
                        <span>{inlineSourceAuthor}</span>
                        <Icon src={IconCalendar} class="inline-source-meta-icon inline-source-date-icon fc-black-400" />
                        <span>{inlineSourceDate}</span>
                      </div>
                    </a>
                  </PopoverContent>
                </Popover>
              </div>
              <div class="response-paragraph">
                They started the project in <strong>January 2026</strong> with the goal of making the migration patterns of yaks accessible to the land owners whose property hundreds of yaks migrate through every year.
                <Popover id="demo-inline-source-yak-migrations" placement="bottom" visible={migrationSourceOpen} tooltip>
                  <PopoverReference>
                    <button
                      type="button"
                      class="s-badge inline-source-badge"
                      aria-label={migrationSourceName}
                      onmouseenter={openMigrationSource}
                      onmouseleave={closeMigrationSourceWithDelay}
                      onfocus={openMigrationSource}
                      onblur={closeMigrationSourceWithDelay}
                      onpointerdown={openMigrationSource}
                      onclick={openMigrationSource}
                    >
                      <Icon src={IconDocument16} class="inline-source-badge-icon" />
                    </button>
                  </PopoverReference>
                  <PopoverContent
                    class="inline-source-popover"
                    role="tooltip"
                  >
                    <div
                      role="presentation"
                      class="d-flex fd-column g16"
                      onmouseenter={openMigrationSource}
                      onmouseleave={closeMigrationSourceWithDelay}
                    >
                      {#each migrationSources as source (source.id)}
                        <a
                          class="inline-source-card d-flex fd-column g6 td-none"
                          href={source.href}
                          target="_blank"
                          rel="noreferrer"
                          onfocus={openMigrationSource}
                          onblur={closeMigrationSourceWithDelay}
                        >
                          <div class="d-flex ai-center g6">
                            <img class="inline-source-logo" src={source.logo} alt="" aria-hidden="true" />
                            <span class="fs-caption fw-bold fc-black-600 lh-sm">{source.title}</span>
                          </div>
                          <div class="d-flex ai-center g6 fs-caption fc-black-600">
                            <Icon src={IconUser} class="inline-source-meta-icon fc-black-400" />
                            <span>{source.author}</span>
                            <Icon src={IconCalendar} class="inline-source-meta-icon inline-source-date-icon fc-black-400" />
                            <span>{source.date}</span>
                          </div>
                        </a>
                      {/each}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div class="response-footer">
              <div class="response-footer-left">
                <Popover id="demo-verified-sources-popover" placement="top-start" visible={verifiedSourcesOpen}>
                  <PopoverReference>
                    <button
                      type="button"
                      class="verified-badge-trigger"
                      aria-label="Corroborated by 2 sources from 6 weeks ago, plus 3 others"
                      onmouseenter={openVerifiedSources}
                      onmouseleave={closeVerifiedSourcesWithDelay}
                      onfocus={openVerifiedSources}
                      onblur={closeVerifiedSourcesWithDelay}
                      onclick={openVerifiedSources}
                    >
                      <VerifiedBadge label="Corroborated by 2 sources from 6 weeks ago, plus 3 others" />
                    </button>
                  </PopoverReference>
                  <PopoverContent class="verified-sources-popover" role="dialog">
                    <div
                      class="d-flex fd-column"
                      role="presentation"
                      onmouseenter={openVerifiedSources}
                      onmouseleave={closeVerifiedSourcesWithDelay}
                      onfocusin={openVerifiedSources}
                      onfocusout={closeVerifiedSourcesWithDelay}
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
                        {#each verifiedSources as source (source.id)}
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
                              <span>{source.author}</span>
                              <Icon src={IconCalendar} class="inline-source-meta-icon inline-source-date-icon fc-black-400" />
                              <span>{source.date}</span>
                            </div>
                          </a>
                        {/each}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Popover id="demo-response-good-tooltip" placement="bottom" tooltip>
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
                <Popover id="demo-response-bad-tooltip" placement="bottom" tooltip>
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
                <Popover id="demo-response-copy-tooltip" placement="bottom" tooltip>
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

        {#if step >= 3}
        <div class="message message-user">
          <div class="message-bubble">{followupQuestion}</div>
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
        {:else if stoppedPartialTurn === 2 && step < 4}
          <div class="message message-assistant">
            <div class="message-body">
              <div class="message-bubble md d-flex fd-column g8">{@html progressiveHTML(turnHtml[2], stoppedPartialChars)}</div>
            </div>
          </div>
        {/if}

        {#if step >= 4}
        <div class="message message-assistant">
          <div class="message-body">
            <div class="message-bubble md d-flex fd-column g8">
              <div class="response-paragraph">
                Discovery will be completed <strong>May 7, 2026</strong>, an alpha release of the web application will be released <strong>June 14, 2026</strong>, and a beta release of the web application will be released <strong>Aug. 21, 2026</strong>.
                <Popover id="demo-inline-source-roadmap-timeline" placement="bottom" visible={timelineSourceOpen} tooltip>
                  <PopoverReference>
                    <button
                      type="button"
                      class="s-badge inline-source-badge"
                      aria-label={inlineSourceName}
                      onmouseenter={openTimelineSource}
                      onmouseleave={closeTimelineSourceWithDelay}
                      onfocus={openTimelineSource}
                      onblur={closeTimelineSourceWithDelay}
                      onclick={openTimelineSource}
                    >
                      <Icon src={IconDocument16} class="inline-source-badge-icon" />
                    </button>
                  </PopoverReference>
                  <PopoverContent class="inline-source-popover" role="tooltip">
                    <a
                      class="inline-source-card d-flex fd-column g6 td-none"
                      href="https://docs.google.com/document/d/1mkO6TcOXCQs9G_MQl1udGMVnwSVA7Blda6wDpkoiSts/edit?usp=sharing"
                      target="_blank"
                      rel="noreferrer"
                      onmouseenter={openTimelineSource}
                      onmouseleave={closeTimelineSourceWithDelay}
                      onfocus={openTimelineSource}
                      onblur={closeTimelineSourceWithDelay}
                    >
                      <div class="d-flex ai-center g6">
                        <img class="inline-source-logo" src="/icon-google-docs.svg" alt="" aria-hidden="true" />
                        <span class="fs-caption fw-bold fc-black-600 lh-sm">{inlineSourceTitle}</span>
                      </div>
                      <div class="d-flex ai-center g6 fs-caption fc-black-600">
                        <Icon src={IconUser} class="inline-source-meta-icon fc-black-400" />
                        <span>{inlineSourceAuthor}</span>
                        <Icon src={IconCalendar} class="inline-source-meta-icon inline-source-date-icon fc-black-400" />
                        <span>{inlineSourceDate}</span>
                      </div>
                    </a>
                  </PopoverContent>
                </Popover>
              </div>
              <div class="response-paragraph">
                The Project Yak roadmap includes <strong>eight milestones</strong>.
                <Popover id="demo-inline-source-roadmap-milestones" placement="bottom" visible={milestonesSourceOpen} tooltip>
                  <PopoverReference>
                    <button
                      type="button"
                      class="s-badge inline-source-badge"
                      aria-label={inlineSourceName}
                      onmouseenter={openMilestonesSource}
                      onmouseleave={closeMilestonesSourceWithDelay}
                      onfocus={openMilestonesSource}
                      onblur={closeMilestonesSourceWithDelay}
                      onclick={openMilestonesSource}
                    >
                      <Icon src={IconDocument16} class="inline-source-badge-icon" />
                    </button>
                  </PopoverReference>
                  <PopoverContent class="inline-source-popover" role="tooltip">
                    <a
                      class="inline-source-card d-flex fd-column g6 td-none"
                      href="https://docs.google.com/document/d/1mkO6TcOXCQs9G_MQl1udGMVnwSVA7Blda6wDpkoiSts/edit?usp=sharing"
                      target="_blank"
                      rel="noreferrer"
                      onmouseenter={openMilestonesSource}
                      onmouseleave={closeMilestonesSourceWithDelay}
                      onfocus={openMilestonesSource}
                      onblur={closeMilestonesSourceWithDelay}
                    >
                      <div class="d-flex ai-center g6">
                        <img class="inline-source-logo" src="/icon-google-docs.svg" alt="" aria-hidden="true" />
                        <span class="fs-caption fw-bold fc-black-600 lh-sm">{inlineSourceTitle}</span>
                      </div>
                      <div class="d-flex ai-center g6 fs-caption fc-black-600">
                        <Icon src={IconUser} class="inline-source-meta-icon fc-black-400" />
                        <span>{inlineSourceAuthor}</span>
                        <Icon src={IconCalendar} class="inline-source-meta-icon inline-source-date-icon fc-black-400" />
                        <span>{inlineSourceDate}</span>
                      </div>
                    </a>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div class="response-footer">
              <div class="response-footer-left">
                <Popover id="demo-timeline-verified-popover" placement="top-start" visible={timelineVerifiedOpen}>
                  <PopoverReference>
                    <button
                      type="button"
                      class="verified-badge-trigger"
                      aria-label="From Giamir Buoncristiani a week ago"
                      onmouseenter={openTimelineVerified}
                      onmouseleave={closeTimelineVerifiedWithDelay}
                      onfocus={openTimelineVerified}
                      onblur={closeTimelineVerifiedWithDelay}
                      onclick={openTimelineVerified}
                    >
                      <VerifiedBadge label="From Giamir Buoncristiani a week ago" />
                    </button>
                  </PopoverReference>
                  <PopoverContent class="verified-sources-popover" role="dialog">
                    <div
                      class="d-flex fd-column"
                      role="presentation"
                      onmouseenter={openTimelineVerified}
                      onmouseleave={closeTimelineVerifiedWithDelay}
                      onfocusin={openTimelineVerified}
                      onfocusout={closeTimelineVerifiedWithDelay}
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
                        <a
                          class="verified-source-item d-flex fd-column g6 td-none"
                          href="https://docs.google.com/document/d/1mkO6TcOXCQs9G_MQl1udGMVnwSVA7Blda6wDpkoiSts/edit?usp=sharing"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div class="d-flex ai-center g6">
                            <img class="inline-source-logo" src="/icon-google-docs.svg" alt="" aria-hidden="true" />
                            <span class="fs-caption fw-bold fc-black-600 lh-sm">{inlineSourceTitle}</span>
                          </div>
                          <div class="d-flex ai-center g6 fs-caption fc-black-600">
                            <Icon src={IconUser} class="inline-source-meta-icon fc-black-400" />
                            <span>{inlineSourceAuthor}</span>
                            <Icon src={IconCalendar} class="inline-source-meta-icon inline-source-date-icon fc-black-400" />
                            <span>{timelineSourceDate}</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Popover id="demo-timeline-good-tooltip" placement="bottom" tooltip>
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
                <Popover id="demo-timeline-bad-tooltip" placement="bottom" tooltip>
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
                <Popover id="demo-timeline-copy-tooltip" placement="bottom" tooltip>
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

        {#if step >= 5}
        <div class="message message-user">
          <div class="message-bubble">{engineeringQuestion}</div>
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
        {:else if stoppedPartialTurn === 3 && step < 6}
          <div class="message message-assistant">
            <div class="message-body">
              <div class="message-bubble md d-flex fd-column g8">{@html progressiveHTML(turnHtml[3], stoppedPartialChars)}</div>
            </div>
          </div>
        {/if}

        {#if step >= 6}
        <div class="message message-assistant">
          <div class="message-body">
            <div class="message-bubble md d-flex fd-column g8">
              <div class="response-paragraph">
                It appears so. The <strong>December 5, 2025</strong> check-in note mentions that <strong>the alpha environment is stood up</strong>, the team has <strong>completed two internal demos</strong>, and they're <strong>on track for the May 7 discovery deadline</strong>. Since I can't cross-reference this with other docs yet, you might want to confirm with the team directly.
              </div>
            </div>
            <div class="response-footer">
              <div class="response-footer-left">
                <Popover id="demo-engineering-verified-popover" placement="top-start" visible={engineeringVerifiedOpen}>
                  <PopoverReference>
                    <button
                      type="button"
                      class="verified-badge-trigger"
                      aria-label="1 source from 6 months ago"
                      onmouseenter={openEngineeringVerified}
                      onmouseleave={closeEngineeringVerifiedWithDelay}
                      onfocus={openEngineeringVerified}
                      onblur={closeEngineeringVerifiedWithDelay}
                      onclick={openEngineeringVerified}
                    >
                      <VerifiedBadge tone="caution" label="1 source from 6 months ago" />
                    </button>
                  </PopoverReference>
                  <PopoverContent class="verified-sources-popover" role="dialog">
                    <div
                      class="d-flex fd-column"
                      role="presentation"
                      onmouseenter={openEngineeringVerified}
                      onmouseleave={closeEngineeringVerifiedWithDelay}
                      onfocusin={openEngineeringVerified}
                      onfocusout={closeEngineeringVerifiedWithDelay}
                    >
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
                            <span class="fs-caption fw-bold fc-black-600 lh-sm">{checkInSourceTitle}</span>
                          </div>
                          <div class="d-flex ai-center g6 fs-caption fc-black-600">
                            <Icon src={IconUser} class="inline-source-meta-icon fc-black-400" />
                            <span>{checkInSourceCollaborators}</span>
                            <Icon src={IconCalendar} class="inline-source-meta-icon inline-source-date-icon fc-black-400" />
                            <span>{checkInSourceDate}</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <div class="ask-giamir-split" class:ask-giamir-split--disabled={askGiamirSent}>
                  <Popover id="demo-ask-giamir-profile-popover" placement="top" visible={askGiamirProfileOpen}>
                    <PopoverReference>
                      <button
                        type="button"
                        class="ask-giamir-btn ask-giamir-btn--main d-inline-flex ai-center g6"
                        onmouseenter={openAskGiamirProfile}
                        onmouseleave={closeAskGiamirProfileWithDelay}
                        onfocus={openAskGiamirProfile}
                        onblur={closeAskGiamirProfileWithDelay}
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
                        onmouseenter={openAskGiamirProfile}
                        onmouseleave={closeAskGiamirProfileWithDelay}
                      >
                        <img class="ask-giamir-profile__photo" src="/community-embed/Home%20-%20Stack%20Overflow%20Demo%20Site_files/user.svg" alt="" />
                        <div class="ask-giamir-profile__copy">
                          <span class="ask-giamir-profile__name">Giamir Buoncristiani</span>
                          <span class="ask-giamir-profile__role">Staff Developer</span>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Popover id="demo-ask-giamir-menu-popover" placement="top" visible={askGiamirOpen}>
                    <PopoverReference>
                      <button
                        type="button"
                        class="ask-giamir-btn ask-giamir-btn--chevron"
                        aria-label="Choose another SME or Slack channel"
                        aria-haspopup="menu"
                        aria-expanded={askGiamirOpen}
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
                <Popover id="demo-engineering-good-tooltip" placement="bottom" tooltip>
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
                <Popover id="demo-engineering-bad-tooltip" placement="bottom" tooltip>
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
                <Popover id="demo-engineering-copy-tooltip" placement="bottom" tooltip>
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
                  <div>Pinged&nbsp;<a href="/slack?scene=verify-timeline">{askGiamirRequest?.destination.handle ?? '@giamir'}</a>&nbsp;on Slack to verify this answer. You'll be notified when they reply.</div>
                </div>
              </Notice>
            {/if}
          </div>
        </div>
        {/if}

        {#if stoppedManually}
          <Notice variant="info" class="demo-stopped-notice">
            <span class="demo-stopped-text">Response stopped.</span>
            <button class="s-btn s-btn__link demo-retry-btn" onclick={retryDemo}>Retry</button>
          </Notice>
        {/if}

        {#each liveMessages.slice(2) as msg, i (i)}
          <div class="message" class:message-user={msg.role === 'user'} class:message-assistant={msg.role === 'assistant'}>
            {#if msg.role === 'assistant'}
              <div class="message-body">
                <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
                <div class="message-bubble md" role="presentation" onclick={(event) => handleLivePreviewAction(event, msg, i + 2)}>{@html renderMarkdown(msg.content)}</div>
                {#if msg.action && isLiveActionActive(msg, i + 2)}
                  <div class="message-choice-row" aria-label="Choose next step">
                    {#each getAskGiamirChoices() as option (option.value)}
                      <button
                        class={`s-btn message-choice-btn ${option.emphasis ? 's-btn__primary message-choice-btn--primary' : 's-btn__secondary-outline'}`}
                        type="button"
                        onclick={() => submitLiveChoice(option.value, option.label)}
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

        {#if liveStreamingContent}
          <div class="message message-assistant">
            <div class="message-body">
              <div class="message-bubble md">{@html renderMarkdown(liveStreamingContent)}<span class="cursor" aria-hidden="true">▋</span></div>
            </div>
          </div>
        {:else if liveIsLoading}
          <div class="message message-assistant">
            <div class="message-bubble message-loading">
              <span></span><span></span><span></span>
            </div>
          </div>
        {/if}
      </div>
    </main>

    <footer class="chat-footer">
      <div class="footer-inner">
        {#if getSuggestedAskReplies().length > 0}
          <div class="suggested-replies" aria-label="Suggested replies">
            {#each getSuggestedAskReplies() as reply}
              <button class="suggested-reply" type="button" onclick={() => submitSuggestedAskReply(reply.value)} disabled={autoplayActive || liveIsLoading}>{reply.label}</button>
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
            readonly={autoplayActive}
          />
          <div class="input-actions">
            <div class="input-sources">
              <Popover id="demo-input-sources-popover" placement="top-end">
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
                      <label class="source-toggle-row d-flex ai-center jc-between g8 p8" for={`demo-input-source-toggle-${source.id}`}>
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
                            id={`demo-input-source-toggle-${source.id}`}
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
            {#if autoplayActive}
              <button class="send-btn stop-btn" onclick={stopAutoplay} aria-label="Stop demo">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="10" height="10" rx="1.5"/>
                </svg>
              </button>
            {:else if liveIsLoading}
              <button class="send-btn stop-btn" onclick={() => liveStreamController?.abort()} aria-label="Stop">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="10" height="10" rx="1.5"/>
                </svg>
              </button>
            {:else if conversationMode && inputValue.trim()}
              <button class="send-btn" onclick={sendLiveMessage} aria-label="Send">
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
</div>

<AskReviewerModal
  visible={askGiamirModalOpen}
  reviewerName={askGiamirDestination.label}
  defaultMessage={getAskReviewDefaultIntro(askGiamirDestination)}
  question={aiGeneratedReviewQuestion}
  answer={turn3Response}
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
    min-height: 0;
    overflow: hidden;
  }

  .demo-chat-scroll {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .demo-chat-centered {
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    max-width: 808px;
    min-height: 100%;
    width: 100%;
  }

  .chat-header {
    align-items: center;
    background-color: #fff;
    display: grid;
    grid-template-columns: auto 1fr auto;
    min-height: 64px;
    padding: 12px 24px;
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

  .response-paragraph {
    margin: 0;
  }

  :global(.s-badge.inline-source-badge) {
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

  .streaming-bubble :global(p) {
    margin: 0;
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
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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

  .caution-label {
    color: var(--yellow-800);
  }

  .verified-action-section {
    border-bottom: 1px solid var(--black-200);
    margin: 0 -12px;
    padding: 12px 12px;
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

  :global(.sources-trigger) {
    align-items: center;
    display: inline-flex;
    gap: 6px;
  }

  .sources-trigger-icons,
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

  .suggested-reply:hover:not(:disabled) {
    background: #f7f6f5;
    color: var(--fc-dark, #232629);
  }

  .suggested-reply:disabled {
    cursor: default;
    opacity: 0.55;
  }

  :global(.app-shell.dark) .send-btn {
    background: #e3e3e3;
    color: #201c1d;
  }

  :global(.demo-stopped-notice) {
    margin-top: 4px;
  }

  :global(.demo-stopped-notice .s-notice--content) {
    align-items: center;
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  .demo-stopped-text {
    flex: 1;
  }

  .demo-retry-btn {
    flex-shrink: 0;
  }

  :global(.app-shell.dark) .demo-chat-page,
  :global(.app-shell.dark) .chat-footer {
    background: #171717;
  }

  :global(.app-shell.dark) .message-bubble {
    color: #e3e3e3;
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

  :global(.app-shell.dark) .suggested-reply:hover:not(:disabled) {
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

  :global(.app-shell.dark) .message-user .message-bubble,
  :global(.app-shell.dark) .input-bar {
    background: #2a2a2a;
  }

  :global(.app-shell.dark) .input-field {
    color: #e3e3e3;
  }

  :global(.app-shell.dark) .input-field::placeholder {
    color: #6b6d73;
  }

  :global(.app-shell.dark) .response-action {
    color: #9a9a9a;
  }

  :global(.app-shell.dark) .response-action:hover {
    background: #2a2a2a;
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
