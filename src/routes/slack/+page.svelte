<script>
	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/stores';
	import TabRail from '$lib/components/slack/TabRail.svelte';
	import ChannelSidebar from '$lib/components/slack/ChannelSidebar.svelte';
	import MessageHeader from '$lib/components/slack/MessageHeader.svelte';
	import MessageList from '$lib/components/slack/MessageList.svelte';
	import MessageComposer from '$lib/components/slack/MessageComposer.svelte';
	import AppHome from '$lib/components/slack/AppHome.svelte';
	import AppHistory from '$lib/components/slack/AppHistory.svelte';
	import AppAbout from '$lib/components/slack/AppAbout.svelte';
	import ChannelView from '$lib/components/slack/ChannelView.svelte';
	import ThreadPanel from '$lib/components/slack/ThreadPanel.svelte';
	import { streamChat } from '$lib/utils/anthropic.js';
	import { base } from '$app/paths';

	import { channels, directMessages, apps as staticApps, currentUser, workspace, channelMessages as staticChannelMessages } from '$lib/data/slack.js';

	const SCENES = [
		{ id: 'verify-timeline', label: 'Scene: SME is asked to verify project timeline' },
		{ id: 'telemetry', label: 'Scene: SME is asked about telemetry data' }
	];

	const SCENE_ACTIONS = [
		{ label: 'This is correct', variant: /** @type {'primary'} */ ('primary') },
		{ label: 'This is wrong', variant: /** @type {'secondary'} */ ('secondary') },
		{ label: 'Ask in channel', variant: /** @type {'secondary'} */ ('secondary') },
		{ label: "I don't know", variant: /** @type {'secondary'} */ ('secondary') }
	];

	const VERIFY_TIMELINE_SEED = {
		id: 'seed-verify-timeline',
		role: /** @type {'assistant'} */ ('assistant'),
		authorName: 'Stack Internal',
		avatar: `${base}/avatars/app-icon-stack.svg`,
		timestamp: '9:41 AM',
		text: 'Giamir, can you verify this AI answer? @Lauren just asked on Stack Internal:',
		card: {
			title: 'Has engineering begun on Project Yak?',
			body: "Yes, the alpha environment is stood up, the team has completed two internal demos, and they're on track for the May 7 discovery deadline.",
			sourceLabel: 'Team Next: Check-in meeting',
			sourceHref: '#',
			actions: SCENE_ACTIONS
		}
	};

	const TELEMETRY_SEED = {
		id: 'seed-telemetry',
		role: /** @type {'assistant'} */ ('assistant'),
		authorName: 'Stack Internal',
		avatar: `${base}/avatars/app-icon-stack.svg`,
		timestamp: '9:41 AM',
		text: 'Giamir, can you verify this AI answer? @Lauren just asked on Stack Internal:',
		card: {
			title: 'How is the Project Yak prototype getting its telemetry data?',
			body: 'The prototype is using Icarus telemetry for yak migrations. The data could expand to other species.',
			sourceLabel: 'Team Next: Check-in meeting',
			sourceHref: '#',
			actions: SCENE_ACTIONS
		}
	};

	const LS_KEY = 'anthropic_api_key';

	const DEMO_RESPONSE = `*This Sprint's Shipping Plan* _(Sprint 47 — Jan 20–31)_

Based on the latest updates from the Product & Engineering sync yesterday, here's what's rolling out:

*Core Releases*

• *Dashboard v3.2* — New analytics widgets and improved load times. QA sign-off complete; targeting Tuesday deployment.
• *API Rate Limiting (v2)* — Graduated rollout to enterprise tier customers. Engineering team (led by Marco) finishing stress tests this week.
• *Onboarding Flow Redesign* — Mobile-first UX refresh. Going live Thursday morning with a 10% canary before full release Friday.

*Supporting Updates*

• Security patches for the auth service (CVE backlog)
• Database migration for the reporting pipeline (running overnight Jan 29)
• Docs refresh for the new webhook integrations

*Status:* Two features are on track, one (the notification preferences refactor) slipped to Sprint 48 due to scope creep on the design side. No blockers currently.

Check the *#sprint-47-status* Slack channel for daily standups, or ping the Product team if you need more details on timeline or rollback plans.`;

	let apiKey = $state('');
	let keyPopoverOpen = $state(false);

	onMount(() => {
		apiKey = localStorage.getItem(LS_KEY) || '';

		const sceneFromUrl = new URL(window.location.href).searchParams.get('scene');
		if (sceneFromUrl && SCENES.some((s) => s.id === sceneFromUrl)) {
			selectScene(sceneFromUrl, { updateUrl: false });
		}
	});

	function requireApiKey() {
		if (!apiKey) { keyPopoverOpen = true; return false; }
		return true;
	}

	function handleApiKeySave(/** @type {string} */ key) {
		apiKey = key;
		localStorage.setItem(LS_KEY, key);
	}

	/** @param {{ role: string, content: string }[]} messages */
	async function* chatStream(messages) {
		// Try the server proxy first (avoids CORS). Falls back to direct browser
		// call if the proxy isn't available (e.g. static GitHub Pages deployment).
		yield* streamChat(apiKey, messages, `${base}/api/chat`);
	}

	const channelMentions = [
		{ id: 'stack', name: 'Stack Internal', avatar: `${base}/avatars/app-icon-stack.svg`, type: 'app' }
	];

	let activeId = $state('claude');
	let activeType = $state(/** @type {'channel' | 'dm' | 'app'} */('app'));
	let activeAppTab = $state('chat');
	let activeScene = $state(/** @type {string | null} */ (null));

	const apps = $derived(
		staticApps.map((a) =>
			a.id === 'claude' && activeScene !== null ? { ...a, unread: 1 } : a
		)
	);

	/** @type {Record<string, any[]>} */
	let liveChannelMessages = $state(
		Object.fromEntries(Object.entries(staticChannelMessages).map(([k, v]) => [k, [...v]]))
	);
	/** @type {Record<string, any[]>} */
	let threadReplies = $state({});

	/** @param {string} id @param {'channel' | 'dm' | 'app'} type */
	function handleSelect(id, type) {
		activeId = id;
		activeType = type;
		activeAppTab = 'chat';
		threadMessage = null;
	}

	const activeDm = $derived(directMessages.find((dm) => dm.id === activeId));
	const activeChannel = $derived(channels.find((ch) => ch.id === activeId));
	const activeApp = $derived(apps.find((a) => a.id === activeId));

	const headerName = $derived(
		activeType === 'dm'
			? (activeDm?.name ?? activeId)
			: activeType === 'app'
				? (activeApp?.name ?? activeId)
				: `#${activeChannel?.name ?? activeId}`
	);
	const headerStatus = $derived(activeType === 'dm' ? activeDm?.status : undefined);
	const headerAvatar = $derived(
		activeType === 'dm' ? activeDm?.avatar : activeType === 'app' ? activeApp?.avatar : undefined
	);
	const isBot = $derived(activeType === 'app');
	const isDark = $derived(false);

	const composerPlaceholder = $derived(
		activeType === 'channel'
			? `Message #${activeChannel?.name ?? activeId}`
			: `Message ${headerName}`
	);

	const appInfo = $derived(
		isBot
			? {
					name: activeApp?.name ?? headerName,
					avatar: activeApp?.avatar,
					description: "Ask anything. Stack Internal works across your connected sources to give humans and agents decision-grade knowledge."
				}
			: undefined
	);

	/**
	 * @typedef {{ id: string, role: 'user' | 'assistant', authorName: string, avatar: string, timestamp: string, text: string, isStreaming?: boolean }} ChatMessage
	 */

	/** @type {ChatMessage[]} */
	let messages = $state([]);

	/** @param {string | null} sceneId @param {{ updateUrl?: boolean }} [options] */
	function selectScene(sceneId, options = {}) {
		const { updateUrl = true } = options;
		activeScene = sceneId;
		const seed =
			sceneId === 'verify-timeline'
				? VERIFY_TIMELINE_SEED
				: sceneId === 'telemetry'
					? TELEMETRY_SEED
					: null;

		if (seed) {
			messages = [{ ...seed }];
			activeId = 'claude';
			activeType = 'app';
			activeAppTab = 'chat';
		} else {
			messages = [];
		}

		if (updateUrl && typeof window !== 'undefined') {
			const url = new URL(window.location.href);
			if (sceneId) url.searchParams.set('scene', sceneId);
			else url.searchParams.delete('scene');
			replaceState(url, $page.state);
		}
	}
	let isLoading = $state(false);
	/** @type {{ id: string, authorName: string, avatar: string, timestamp: string, text: string } | null} */
	let threadMessage = $state(null);

	function formatTime(date = new Date()) {
		return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
	}

	/** @param {any} _message @param {{ label: string }} action */
	function handleCardAction(_message, action) {
		const replies = {
			'This is correct': "Thanks for verifying, Giamir. I'll let @Lauren know the answer is correct.",
			"I don't know": "Got it. I'll find another SME on the Project Yak team and keep @Lauren posted."
		};
		const reply = replies[action.label];
		if (!reply) return;

		messages = [...messages, {
			id: crypto.randomUUID(),
			role: /** @type {'assistant'} */ ('assistant'),
			authorName: 'Stack Internal',
			avatar: `${base}/avatars/app-icon-stack.svg`,
			timestamp: formatTime(),
			text: reply
		}];
	}

	/** @param {string} text */
	async function handleThreadReply(text) {
		if (!text.trim() || !threadMessage) return;
		const msgId = threadMessage.id;

		const userReply = {
			id: crypto.randomUUID(),
			role: /** @type {'user'} */ ('user'),
			authorName: 'Lauren Ipsum',
			avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Lauren&backgroundColor=b6e3f4',
			timestamp: formatTime(),
			text: text.trim()
		};

		threadReplies = {
			...threadReplies,
			[msgId]: [...(threadReplies[msgId] ?? []), userReply]
		};

		// Collect full response then post at once
		let fullText = '';
		if (!apiKey) {
			fullText = DEMO_RESPONSE;
		} else {
			// Build conversation history for the API
			const existing = threadReplies[msgId] ?? [];
			const apiMessages = [
				{ role: 'user', content: threadMessage.text },
				...existing.map((r) => ({ role: r.role === 'user' ? 'user' : 'assistant', content: r.text }))
			];
			try {
				for await (const chunk of chatStream(apiMessages)) {
					fullText += chunk;
				}
			} catch (err) {
				console.error('Thread reply error:', err);
				fullText = 'Sorry, something went wrong.';
			}
		}

		const botReply = {
			id: crypto.randomUUID(),
			role: /** @type {'assistant'} */ ('assistant'),
			authorName: 'Stack Internal',
			avatar: `${base}/avatars/app-icon-stack.svg`,
			timestamp: formatTime(),
			text: fullText
		};

		threadReplies = {
			...threadReplies,
			[msgId]: [...(threadReplies[msgId] ?? []), botReply]
		};
	}

	/** @param {string} text */
	async function handleChannelSend(text) {
		if (!text.trim()) return;

		const newMsg = {
			id: crypto.randomUUID(),
			authorName: 'Lauren Ipsum',
			avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Lauren&backgroundColor=b6e3f4',
			timestamp: formatTime(),
			text: text.trim(),
			reactions: []
		};

		liveChannelMessages = {
			...liveChannelMessages,
			[activeId]: [...(liveChannelMessages[activeId] ?? []), newMsg]
		};

		if (/@stack(\s+internal)?/i.test(text)) {
			// Add Stack Internal reaction after 1 second
			setTimeout(() => {
				liveChannelMessages = {
					...liveChannelMessages,
					[activeId]: liveChannelMessages[activeId].map((m) =>
						m.id === newMsg.id
							? { ...m, reactions: [{ emoji: '👀', count: 1 }] }
							: m
					)
				};
			}, 1000);

			// Collect the full response silently, then post it all at once
			let fullText = '';
			if (!apiKey) {
				fullText = DEMO_RESPONSE;
			} else {
				try {
					for await (const chunk of chatStream([{ role: 'user', content: text }])) {
						fullText += chunk;
					}
				} catch (err) {
					console.error('Channel chat error:', err);
					fullText = 'Sorry, something went wrong.';
				}
			}

			// Post the complete reply all at once
			const botReply = {
				id: crypto.randomUUID(),
				role: 'assistant',
				authorName: 'Stack Internal',
				avatar: `${base}/avatars/app-icon-stack.svg`,
				timestamp: formatTime(),
				text: fullText,
				isStreaming: false
			};
			threadReplies = { ...threadReplies, [newMsg.id]: [botReply] };

			// Embed reply into message so ChannelView reactively shows the footer
			liveChannelMessages = {
				...liveChannelMessages,
				[activeId]: liveChannelMessages[activeId].map((m) =>
					m.id === newMsg.id ? { ...m, threadReplies: [botReply] } : m
				)
			};
		}
	}

	/** @param {string} text */
	async function handleSend(text) {
		if (!text.trim() || isLoading) return;

		const userMsg = {
			id: crypto.randomUUID(),
			role: /** @type {'user'} */ ('user'),
			authorName: 'Lauren Ipsum',
			avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Lauren&backgroundColor=b6e3f4',
			timestamp: formatTime(),
			text: text.trim()
		};
		messages = [...messages, userMsg];
		isLoading = true;

		let fullText = '';
		if (!apiKey) {
			fullText = DEMO_RESPONSE;
		} else {
			const apiMessages = messages.map((m) => ({ role: m.role, content: m.text }));
			try {
				for await (const chunk of chatStream(apiMessages)) {
					fullText += chunk;
				}
			} catch (err) {
				console.error('Chat error:', err);
				fullText = `Error: ${err instanceof Error ? err.message : String(err)}`;
			}
		}
		isLoading = false;

		messages = [...messages, {
			id: crypto.randomUUID(),
			role: /** @type {'assistant'} */ ('assistant'),
			authorName: 'Stack Internal',
			avatar: `${base}/avatars/app-icon-stack.svg`,
			timestamp: formatTime(),
			text: fullText
		}];
	}
</script>

<svelte:head>
	<title>Slack Internal</title>
</svelte:head>

<div class="app-layout">
	<TabRail {workspace} activeTab="home" />
	<ChannelSidebar
		workspaceName="Acme Demo"
		{channels}
		{directMessages}
		{apps}
		{activeId}
		onSelect={handleSelect}
		scenes={SCENES}
		{activeScene}
		onSceneSelect={selectScene}
	/>
	<main class="main-content" class:main-content--dark={isDark}>
		<div class="left-col">
			<MessageHeader
				name={headerName}
				status={headerStatus}
				avatar={headerAvatar}
				{isBot}
				activeTab={activeAppTab}
				onTabChange={(tab) => (activeAppTab = tab)}
				onNewChat={() => { messages = []; activeAppTab = 'chat'; }}
				bind:keyPopoverOpen
				hasApiKey={!!apiKey}
				currentApiKey={apiKey}
				onApiKeySave={handleApiKeySave}
			/>
			<div class="chat-section">
				{#if isBot && activeAppTab === 'home'}
					<AppHome onPrompt={(text) => { activeAppTab = 'chat'; handleSend(text); }} />
				{:else if isBot && activeAppTab === 'history'}
					<AppHistory onResume={(text) => { activeAppTab = 'chat'; handleSend(text); }} />
				{:else if isBot && activeAppTab === 'about'}
					<AppAbout />
				{:else if activeType === 'channel'}
					<ChannelView
						channelName={activeChannel?.name ?? activeId}
						messages={liveChannelMessages[activeId] ?? []}
						mentionNames={channelMentions.map(m => m.name)}
						onThreadOpen={(msg) => { threadMessage = msg; }}
					/>
					<MessageComposer placeholder={composerPlaceholder} dark={isDark} onSend={handleChannelSend} mentions={channelMentions} />
				{:else}
					<MessageList
						{messages}
						dark={isDark}
						showAppInfo={isBot && activeAppTab === 'chat' && messages.length === 0}
						{appInfo}
						onThreadOpen={(msg) => { threadMessage = msg; }}
						onCardAction={handleCardAction}
					/>
					<MessageComposer placeholder={composerPlaceholder} dark={isDark} onSend={handleSend} {isLoading} />
				{/if}
			</div>
		</div>
		{#if threadMessage}
			<ThreadPanel
				message={threadMessage}
				replies={threadReplies[threadMessage.id] ?? []}
				mentionNames={channelMentions.map(m => m.name)}
				onReply={handleThreadReply}
				onClose={() => { threadMessage = null; }}
			/>
		{/if}
	</main>
</div>

<style>
	.app-layout {
		display: flex;
		height: 100vh;
		overflow: hidden;
		background-color: #EAEAEA;
	}

	.main-content {
		display: flex;
		flex-direction: row;
		flex: 1;
		min-width: 0;
		background-color: white;
		overflow: hidden;
		box-shadow: -4px 0 14px rgba(0, 0, 0, 0.062);
	}

	.left-col {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
		overflow: hidden;
	}

	.chat-section {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
		overflow: hidden;
	}
</style>
