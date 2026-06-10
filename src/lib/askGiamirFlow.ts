import { marked } from 'marked';

export const ASK_GIAMIR_REVIEWER_NAME = 'Giamir Buoncristiani';
export const ASK_GIAMIR_DEFAULT_INTRO = "Hey Giamir — I couldn't find an answer. Can you help?";
export const ASK_GIAMIR_SLACK_DELIVERY = 'This message will be sent through the Stack Internal app in Slack.';
export const ASK_GIAMIR_NOTIFICATION_QUESTION = 'How would I be notified of an answer';
export const ASK_GIAMIR_REASON_QUESTION = 'Why Giamir?';
export const ASK_LOW_TRUST_QUESTION = 'Why is this answer low trust?';

export type AskGiamirChatStep = 'idle' | 'preview' | 'edit';

export type AskReviewDestination = {
  value: string;
  label: string;
  handle: string;
  description: string;
  kind: 'sme' | 'channel';
  avatar?: string;
};

export type AskReviewSource = {
  title: string;
  author: string;
  date?: string;
  icon?: string;
};

export const ASK_REVIEW_DESTINATIONS: AskReviewDestination[] = [
  {
    value: 'giamir',
    label: 'Giamir Buoncristiani',
    handle: '@giamir',
    description: 'Staff Developer',
    kind: 'sme',
    avatar: '/community-embed/Home%20-%20Stack%20Overflow%20Demo%20Site_files/user.svg',
  },
  {
    value: 'sander',
    label: 'Sander van Vliet',
    handle: '@sander',
    description: 'Data platform SME',
    kind: 'sme',
    avatar: '/community-embed/Home%20-%20Stack%20Overflow%20Demo%20Site_files/user.svg',
  },
  {
    value: 'priya',
    label: 'Priya Shah',
    handle: '@priya',
    description: 'Cloud infrastructure SME',
    kind: 'sme',
    avatar: '/community-embed/Home%20-%20Stack%20Overflow%20Demo%20Site_files/user.svg',
  },
  {
    value: 'cloud-infra',
    label: '#cloud-infra',
    handle: '#cloud-infra',
    description: 'Public channel for infrastructure questions',
    kind: 'channel',
  },
  {
    value: 'eng-platform',
    label: '#eng-platform',
    handle: '#eng-platform',
    description: 'Public channel for platform engineering questions',
    kind: 'channel',
  },
];

type PreviewOptions = {
  intro: string;
  question: string;
  answer: string;
  shareFullHistory?: boolean;
  destination?: AskReviewDestination;
  sources?: AskReviewSource[];
};

const DEFAULT_REVIEW_SOURCES: AskReviewSource[] = [
  {
    title: 'Yak migrations spike',
    author: 'Giamir Buoncristiani',
    icon: '/icon-google-docs.svg',
  },
];

function normalize(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w@\s]/g, '')
    .replace(/\s+/g, ' ');
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderPlainText(text: string) {
  return escapeHtml(text.trim());
}

function renderSafeMarkdown(text: string) {
  return marked.parse(escapeHtml(text.trim()), { breaks: false }) as string;
}

function renderSlackSourceCards(sources = DEFAULT_REVIEW_SOURCES) {
  if (!sources.length) return '';

  const sourceItems = sources.map((source) => {
    const meta = [source.author, source.date].filter(Boolean).join(' · ');

    return `<div class="ask-giamir-slack-preview__source-card" role="group" aria-label="${renderPlainText(source.title)} source">
    <img class="ask-giamir-slack-preview__source-icon" src="${renderPlainText(source.icon ?? '/icon-google-docs.svg')}" alt="" aria-hidden="true" />
    <span class="ask-giamir-slack-preview__source-copy">
      <span class="ask-giamir-slack-preview__source-title">${renderPlainText(source.title)}</span>
      <span class="ask-giamir-slack-preview__source-author">${renderPlainText(meta)}</span>
    </span>
  </div>`;
  }).join('');

  return `<div class="ask-giamir-slack-preview__sources" aria-label="Sources">${sourceItems}</div>`;
}

export function getAskReviewRecipientName(destination = ASK_REVIEW_DESTINATIONS[0]) {
  if (destination.kind === 'channel') return 'team';
  return destination.label.split(' ')[0] || destination.label;
}

export function getAskReviewDefaultIntro(destination = ASK_REVIEW_DESTINATIONS[0]) {
  if (destination.kind === 'channel') return "Hi team — I couldn't find an answer. Can someone help?";
  return `Hey ${getAskReviewRecipientName(destination)} — I couldn't find an answer. Can you help?`;
}

export function isAskGiamirCommand(text: string) {
  const value = normalize(text);
  return value === 'ask giamir' || value === 'ask @giamir';
}

export function isMenuSendChoice(text: string) {
  const value = normalize(text);
  return value === '1' || ['send', 'send message', 'send it', 'yes'].includes(value);
}

export function isMenuEditChoice(text: string) {
  const value = normalize(text);
  return value === '2' || ['edit', 'edit message', 'modify', 'change', 'change message'].includes(value);
}

export function isMenuToggleHistoryChoice(text: string) {
  const value = normalize(text);
  return value === '3' || [
    'do not share chat history',
    'dont share chat history',
    "don't share chat history",
    'share chat history',
    'toggle chat history',
  ].includes(value);
}

export function isMenuWhoElseChoice(text: string) {
  const value = normalize(text);
  return value === '4' || [
    'who else can i ask',
    'whoe else can i ask',
    'who else',
    'other smes',
    'other sme',
    'other channels',
    'alternatives',
    'show alternatives',
  ].includes(value);
}

export function isAskGiamirNotificationQuestion(text: string) {
  const value = normalize(text);
  return [
    normalize(ASK_GIAMIR_NOTIFICATION_QUESTION),
    'how will i be notified of an answer',
    'how do i get notified of an answer',
    'how would i know when they answer',
    'how will i know when they answer',
  ].includes(value);
}

export function isAskGiamirReasonQuestion(text: string) {
  const value = normalize(text);
  return [
    normalize(ASK_GIAMIR_REASON_QUESTION),
    'why ask giamir',
    'why giamir buoncristiani',
    'why this sme',
    'why this reviewer',
  ].includes(value);
}

export function isAskLowTrustQuestion(text: string) {
  const value = normalize(text);
  return [
    normalize(ASK_LOW_TRUST_QUESTION),
    'why low trust',
    'why is this low trust',
    'why is the answer low trust',
    'why should i ask someone',
  ].includes(value);
}

export function findAskReviewDestination(text: string) {
  const value = normalize(text);
  const handleValue = value.replace(/^@/, '');

  return ASK_REVIEW_DESTINATIONS.find((destination) => {
    const normalizedLabel = normalize(destination.label);
    const normalizedHandle = normalize(destination.handle).replace(/^@/, '');
    const normalizedValue = normalize(destination.value);

    return [normalizedLabel, normalizedHandle, normalizedValue].includes(handleValue);
  });
}

export function formatAskAlternativesList() {
  const smeItems = ASK_REVIEW_DESTINATIONS
    .filter((destination) => destination.kind === 'sme')
    .map((destination) => `<li>
      <button class="ask-giamir-alternatives__option" type="button" data-ask-giamir-destination="${renderPlainText(destination.value)}">
        <span class="ask-giamir-alternatives__option-main">
          <strong>${renderPlainText(destination.label)}</strong>
          <span>${renderPlainText(destination.handle)} · ${renderPlainText(destination.description)}</span>
        </span>
      </button>
    </li>`)
    .join('');
  const channelItems = ASK_REVIEW_DESTINATIONS
    .filter((destination) => destination.kind === 'channel')
    .map((destination) => `<li>
      <button class="ask-giamir-alternatives__option" type="button" data-ask-giamir-destination="${renderPlainText(destination.value)}">
        <span class="ask-giamir-alternatives__option-main">
          <strong>${renderPlainText(destination.label)}</strong>
          <span>${renderPlainText(destination.description)}</span>
        </span>
      </button>
    </li>`)
    .join('');

  return `<div class="ask-giamir-alternatives" aria-label="People and channels to ask">
    <p class="ask-giamir-alternatives__intro">You can send this to an SME or a public Slack channel.</p>
    <p class="ask-giamir-alternatives__prompt">Who should I ask?</p>
    <h3 class="ask-giamir-alternatives__heading">SMEs</h3>
    <div class="ask-giamir-alternatives__section">
      <ul>${smeItems}</ul>
    </div>
    <h3 class="ask-giamir-alternatives__heading">Public channels</h3>
    <div class="ask-giamir-alternatives__section">
      <ul>${channelItems}</ul>
    </div>
  </div>`;
}

export function formatAskGiamirHistoryToggle({ shareFullHistory, destination = ASK_REVIEW_DESTINATIONS[0] }: Pick<PreviewOptions, 'shareFullHistory' | 'destination'>) {
  const shouldShareHistory = shareFullHistory ?? true;
  const historyStatus = shouldShareHistory ? 'On' : 'Off';
  const reviewerContext = destination.kind === 'channel' ? 'the channel has' : `${getAskReviewRecipientName(destination)} has`;
  const historyCopy = shouldShareHistory
    ? `Full chat history will be shared so ${reviewerContext} the context to review.`
    : 'Only this question and AI suggested answer will be shared.';

  return `<div class="ask-giamir-preview__history">
    <span class="ask-giamir-preview__history-copy">
      <span class="ask-giamir-preview__history-title">Share full chat history</span>
      <span class="ask-giamir-preview__history-desc">${historyCopy}</span>
    </span>
    <span class="ask-giamir-preview__toggle" data-state="${shouldShareHistory ? 'on' : 'off'}">
      <input class="s-toggle-switch ask-giamir-preview__toggle-switch" type="checkbox" ${shouldShareHistory ? 'checked' : ''} tabindex="-1" aria-hidden="true">
      <span class="ask-giamir-preview__toggle-state">${historyStatus}</span>
    </span>
  </div>`;
}

export function formatAskGiamirEditForm({ intro, question, answer, destination = ASK_REVIEW_DESTINATIONS[0] }: Pick<PreviewOptions, 'intro' | 'question' | 'answer' | 'destination'>) {
  const introTarget = destination.kind === 'channel' ? 'the channel' : getAskReviewRecipientName(destination);

  return `<div class="ask-giamir-edit-form" aria-label="Edit message for reviewer">
  <div class="ask-giamir-preview__message">
    <div class="ask-giamir-preview__message-header">
      <h3>Intro message to ${renderPlainText(introTarget)}</h3>
    </div>
    <textarea class="ask-giamir-edit-form__textarea" data-ask-giamir-field="intro" rows="4">${renderPlainText(intro)}</textarea>
  </div>
  <div class="ask-giamir-preview__field">
    <div class="ask-giamir-preview__field-header">
      <h3>Question</h3>
    </div>
    <textarea class="ask-giamir-edit-form__textarea" data-ask-giamir-field="question" rows="5">${renderPlainText(question)}</textarea>
  </div>
  <div class="ask-giamir-preview__field ask-giamir-preview__field--answer">
    <h3>AI suggested answer</h3>
    <div class="ask-giamir-preview__answer">${renderSafeMarkdown(answer)}</div>
  </div>
  <div class="ask-giamir-edit-form__actions">
    <button class="s-btn s-btn__secondary-outline ask-giamir-edit-form__cancel" type="button" data-ask-giamir-action="cancel-edits">Cancel</button>
    <button class="s-btn s-btn__primary ask-giamir-edit-form__save" type="button" data-ask-giamir-action="save-edits">Save and preview</button>
  </div>
</div>`;
}

export function formatSlackMessagePreview({ intro, question, answer, sources }: PreviewOptions) {
  return `<div class="ask-giamir-slack-preview" aria-label="Slack message preview">
  <div class="ask-giamir-slack-preview__icon" aria-hidden="true">
    <img src="/avatars/app-icon-stack.svg" alt="" />
  </div>
  <div class="ask-giamir-slack-preview__body">
    <div class="ask-giamir-slack-preview__meta">
      <strong>Stack Internal</strong>
      <span class="ask-giamir-slack-preview__app">APP</span>
      <span>10:15 AM</span>
    </div>
    <p class="ask-giamir-slack-preview__intro">${renderPlainText(intro)}</p>
    <div class="ask-giamir-slack-preview__payload">
      <p class="ask-giamir-slack-preview__question">${renderPlainText(question)}</p>
      <div class="ask-giamir-slack-preview__answer">${renderSafeMarkdown(answer)}</div>
      ${renderSlackSourceCards(sources)}
    </div>
  </div>
</div>`;
}

export function getIntroPrompt(options: PreviewOptions) {
  return `<div class="ask-giamir-preview">
  <p class="ask-giamir-preview__lead">Before sending, here is a preview of the message.</p>
  <p class="ask-giamir-preview__slack-label">Slack preview</p>
  ${formatSlackMessagePreview(options)}
  ${formatAskGiamirHistoryToggle(options)}
</div>`;
}

export function getInvalidMenuChoicePrompt() {
  return 'Please choose `1` to send the message or `2` to edit the message.';
}

export function getSentConfirmation(destinationName = ASK_GIAMIR_REVIEWER_NAME) {
  return `Sent to ${destinationName} through the Stack Internal app in Slack. You'll be notified when they reply.`;
}

export function getAskGiamirNotificationPrompt(destination = ASK_REVIEW_DESTINATIONS[0]) {
  const responder = destination.kind === 'channel' ? 'someone in the channel' : getAskReviewRecipientName(destination);

  return `You'll get a Stack Internal notification in Slack when ${responder} replies. The reply stays attached to this review request, so you can reopen the same context from the notification.`;
}

export function getAskGiamirReasonPrompt() {
  return 'Giamir is suggested because his role is closely related to this topic, and he is the author of a couple of documents found across the company, including the document cited for this answer.';
}

export function getAskLowTrustPrompt() {
  return 'This answer is low trust because the document shown is potentially outdated, and the information could not be corroborated with any other source.';
}
