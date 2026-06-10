import { base } from '$app/paths';

/** @type {import('./types').Channel[]} */
export const channels = [
	{ id: 'announcements', name: 'announcements' },
	{ id: 'general', name: 'general' },
	{ id: 'engineering', name: 'engineering' },
	{ id: 'backend', name: 'backend' },
	{ id: 'frontend', name: 'frontend' },
	{ id: 'platform', name: 'platform' },
	{ id: 'infra', name: 'infra' },
	{ id: 'security', name: 'security' },
	{ id: 'product', name: 'product' },
	{ id: 'design', name: 'design' },
	{ id: 'data-engineering', name: 'data-engineering' },
	{ id: 'ml-ai', name: 'ml-ai' },
	{ id: 'sales', name: 'sales' },
	{ id: 'marketing', name: 'marketing' },
	{ id: 'hr', name: 'hr' },
	{ id: 'watercooler', name: 'watercooler' },
	{ id: 'random', name: 'random' },
];

/** @type {import('./types').DirectMessage[]} */
export const directMessages = [];

/** @type {import('./types').App[]} */
export const apps = [
	{ id: 'claude', name: 'Stack Internal', avatar: `${base}/avatars/app-icon-stack.svg` }
];

/** @type {import('./types').Message[]} */
export const claudeMessages = [];

export const currentUser = {
	id: 'drew',
	name: 'Drew Meacham',
	avatar: `${base}/avatars/drew-48.png`,
	status: 'active'
};

export const workspace = {
	id: 'T02FF47GJ',
	name: 'Acme',
	icon: `${base}/avatars/app-icon-stack.svg`
};

// ── Channel message fixtures ──────────────────────────────────────────────────

/** @typedef {{ id: string, authorName: string, avatar: string, timestamp: string, text: string, reactions?: { emoji: string, count: number }[] }} ChannelMessage */

/** @type {Record<string, ChannelMessage[]>} */
const engineeringMessages = [
		{
			id: 'e1',
			authorName: 'Priya Kapoor',
			avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Priya&backgroundColor=b6e3f4',
			timestamp: '9:02 AM',
			text: "Good morning team 👋 Just a heads up — we're doing a database migration for the auth service at 11 PM tonight. Expected downtime is ~5 min. I'll post updates in #incidents.",
			reactions: [{ emoji: '👍', count: 8 }, { emoji: '🙏', count: 3 }]
		},
		{
			id: 'e2',
			authorName: 'Marcus Webb',
			avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Marcus&backgroundColor=ffd5dc',
			timestamp: '9:15 AM',
			text: 'Thanks for the heads up Priya. Should we put a hold on any deploys to the auth service after 8 PM just to be safe?'
		},
		{
			id: 'e3',
			authorName: 'Priya Kapoor',
			avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Priya&backgroundColor=b6e3f4',
			timestamp: '9:18 AM',
			text: "Yes, good call. Freeze is on from 8 PM. I'll update the deploy freeze calendar.",
			reactions: [{ emoji: '✅', count: 5 }]
		},
		{
			id: 'e4',
			authorName: 'Jordan Ellis',
			avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Jordan&backgroundColor=c0aede',
			timestamp: '10:34 AM',
			text: 'Hey everyone — opened a PR for the new rate limiting middleware: github.com/acme/api-gateway/pull/4821. Would love eyes on the backpressure logic before EOD. Tagged a few of you but more reviewers = better 🙂',
			reactions: [{ emoji: '👀', count: 4 }]
		},
		{
			id: 'e5',
			authorName: 'Sasha Nguyen',
			avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Sasha&backgroundColor=d1f4e0',
			timestamp: '10:51 AM',
			text: 'On it @Jordan Ellis — the burst window logic looks right but I left a comment about the sliding vs fixed window tradeoff. Worth a quick discussion.'
		},
		{
			id: 'e6',
			authorName: 'Jordan Ellis',
			avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Jordan&backgroundColor=c0aede',
			timestamp: '10:55 AM',
			text: "Great catch. Sliding window makes more sense for our traffic patterns. I'll update — can sync at 2 PM if helpful."
		},
		{
			id: 'e7',
			authorName: 'Tom Okafor',
			avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Tom&backgroundColor=ffdfbf',
			timestamp: '12:02 PM',
			text: "Quick FYI: the latency spike we saw on the payments service this morning was traced back to a misconfigured connection pool. It's resolved — we bumped max connections from 20 → 50. Keeping an eye on it.",
			reactions: [{ emoji: '😅', count: 6 }, { emoji: '👍', count: 4 }]
		},
		{
			id: 'e8',
			authorName: 'Marcus Webb',
			avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Marcus&backgroundColor=ffd5dc',
			timestamp: '12:08 PM',
			text: "Glad it's sorted. Should we add a runbook entry for connection pool sizing? Feels like we've hit this before."
		},
		{
			id: 'e9',
			authorName: 'Tom Okafor',
			avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Tom&backgroundColor=ffdfbf',
			timestamp: '12:11 PM',
			text: "Agreed. I'll write it up in Confluence this afternoon and link it from #on-call.",
			reactions: [{ emoji: '🙌', count: 3 }]
		},
		{
			id: 'e10',
			authorName: 'Priya Kapoor',
			avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Priya&backgroundColor=b6e3f4',
			timestamp: '2:47 PM',
			text: "Reminder: eng all-hands is Thursday at 3 PM PT / 6 PM ET. We'll be demoing the new search infra and reviewing Q2 technical priorities. Agenda is in Notion — link in the calendar invite.",
			reactions: [{ emoji: '📅', count: 7 }]
		},
		{
			id: 'e11',
			authorName: 'Sasha Nguyen',
			avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Sasha&backgroundColor=d1f4e0',
			timestamp: '3:30 PM',
			text: 'The new search service is passing all integration tests 🎉 Indexing latency is down 40% vs the old Elasticsearch setup. Planning to cut over 10% of traffic next Monday for canary testing.'
		},
		{
			id: 'e12',
			authorName: 'Jordan Ellis',
			avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Jordan&backgroundColor=c0aede',
			timestamp: '3:33 PM',
			text: "That's huge Sasha!! 🚀",
			reactions: [{ emoji: '🚀', count: 9 }, { emoji: '🔥', count: 5 }]
		},
		{
			id: 'e13',
			authorName: 'Tom Okafor',
			avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Tom&backgroundColor=ffdfbf',
			timestamp: '3:35 PM',
			text: 'Incredible work. Do you have a rollback plan documented if the canary shows regressions?'
		},
		{
			id: 'e14',
			authorName: 'Sasha Nguyen',
			avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Sasha&backgroundColor=d1f4e0',
			timestamp: '3:38 PM',
			text: 'Yep — feature flag controls traffic split so we can flip back instantly. Runbook is drafted, just needs a review from the on-call team.',
			reactions: [{ emoji: '✅', count: 4 }]
		}
];

export const channelMessages = Object.fromEntries(
	channels.map((ch) => [ch.id, engineeringMessages])
);
