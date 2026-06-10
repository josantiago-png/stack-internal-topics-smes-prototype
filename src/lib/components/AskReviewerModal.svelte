<script lang="ts">
  import {
    ASK_GIAMIR_DEFAULT_INTRO,
    ASK_REVIEW_DESTINATIONS,
    formatSlackMessagePreview,
    type AskReviewDestination,
    type AskReviewSource,
  } from '$lib/askGiamirFlow';
  import { marked } from 'marked';

  type SendPayload = {
    message: string;
    question: string;
    answer: string;
    shareFullHistory: boolean;
  };

  type Props = {
    visible?: boolean;
    reviewerName?: string;
    defaultMessage?: string;
    question?: string;
    answer?: string;
    destinations?: AskReviewDestination[];
    selectedDestinationValue?: string;
    sources?: AskReviewSource[];
    onCancel?: () => void;
    onSend?: (payload: SendPayload) => void;
  };

  let {
    visible = false,
    reviewerName = 'Giamir Buoncristiani',
    defaultMessage = ASK_GIAMIR_DEFAULT_INTRO,
    question = '',
    answer = '',
    destinations = ASK_REVIEW_DESTINATIONS,
    selectedDestinationValue = ASK_REVIEW_DESTINATIONS[0].value,
    sources,
    onCancel,
    onSend,
  }: Props = $props();

  let message = $state('');
  let draftMessage = $state('');
  let questionText = $state('');
  let draftQuestionText = $state('');
  let answerText = $state('');
  let shareFullHistory = $state(true);
  let mode = $state<'preview' | 'edit'>('preview');
  let selectedDestination = $derived(destinations.find((destination) => destination.value === selectedDestinationValue) ?? destinations[0]);
  let reviewerDisplayName = $derived(selectedDestination?.label ?? reviewerName);
  let reviewerIsChannel = $derived((selectedDestination?.kind === 'channel') || reviewerDisplayName.startsWith('#'));
  let reviewerShortName = $derived(reviewerIsChannel ? reviewerDisplayName : reviewerDisplayName.split(' ')[0] || reviewerDisplayName);
  let reviewerIntroTarget = $derived(reviewerIsChannel ? 'the channel' : reviewerShortName);
  let renderedAnswer = $derived(marked.parse(escapeHtml(answerText.trim()), { breaks: false }) as string);
  let slackPreviewHtml = $derived(formatSlackMessagePreview({
    intro: message,
    question: questionText,
    answer: answerText,
    shareFullHistory,
    sources,
  }));

  $effect(() => {
    if (!visible) return;
    message = defaultMessage;
    draftMessage = defaultMessage;
    questionText = question;
    draftQuestionText = question;
    answerText = answer;
    shareFullHistory = true;
    mode = 'preview';
  });

  function handleSubmit() {
    const trimmed = message.trim();
    const trimmedQuestion = questionText.trim();
    const trimmedAnswer = answerText.trim();
    if (!trimmed || !trimmedQuestion || !trimmedAnswer) return;
    onSend?.({
      message: trimmed,
      question: trimmedQuestion,
      answer: trimmedAnswer,
      shareFullHistory,
    });
  }

  function saveEdits() {
    if (!draftMessage.trim() || !draftQuestionText.trim()) return;
    message = draftMessage.trim();
    questionText = draftQuestionText.trim();
    mode = 'preview';
  }

  function enterEditMode() {
    draftMessage = message;
    draftQuestionText = questionText;
    mode = 'edit';
  }

  function handleCancel() {
    if (mode === 'edit') {
      draftMessage = message;
      draftQuestionText = questionText;
      mode = 'preview';
      return;
    }

    onCancel?.();
  }

  function escapeHtml(text: string) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) onCancel?.();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (visible && event.key === 'Escape') onCancel?.();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if visible}
  <div class="review-modal-backdrop" role="presentation" onclick={handleBackdropClick}>
    <div class="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
      <header class="review-modal__header">
        <div class="review-modal__heading">
          <h2 id="review-modal-title" class="review-modal__title">Preview Slack message to {reviewerShortName}</h2>
          <p class="review-modal__subtitle">This message will be sent through the Stack Internal app in Slack.</p>
        </div>
        <button class="review-modal__close" type="button" aria-label="Close" onclick={onCancel}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M5.22 5.22a.75.75 0 0 1 1.06 0L10 8.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L11.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 0 1 0-1.06Z"/>
          </svg>
        </button>
      </header>

      <div class="review-modal__body">
        {#if mode === 'preview'}
          <div class="review-modal__preview">
            {@html slackPreviewHtml}
          </div>
        {:else}
          <div class="review-modal__message">
            <label class="review-modal__label" for="review-message">Intro message to {reviewerIntroTarget}</label>
            <textarea
              id="review-message"
              class="s-textarea review-modal__textarea"
              rows="4"
              bind:value={draftMessage}
              placeholder="Add context for the reviewer..."
            ></textarea>
          </div>

          <div class="review-modal__payload" aria-label="Question being shared">
            <div class="review-modal__field">
              <label class="review-modal__label" for="review-question">Question</label>
              <textarea
                id="review-question"
                class="s-textarea review-modal__textarea review-modal__textarea--question"
                rows="4"
                bind:value={draftQuestionText}
              ></textarea>
            </div>
            <div class="review-modal__field">
              <label class="review-modal__label" for="review-answer">AI suggested answer</label>
              <div
                id="review-answer"
                class="review-modal__readonly-answer"
                aria-label="AI suggested answer"
              >
                {@html renderedAnswer}
              </div>
            </div>
          </div>
        {/if}

        {#if mode === 'preview'}
          <label class="review-modal__toggle" for="share-chat-history">
            <span class="review-modal__toggle-copy">
              <span class="review-modal__toggle-title">Share full chat history</span>
              <span class="review-modal__toggle-desc">Allow the reviewer to open the full conversation for context.</span>
            </span>
            <span class="review-modal__toggle-control">
              <input
                id="share-chat-history"
                class="s-toggle-switch"
                type="checkbox"
                bind:checked={shareFullHistory}
              />
            </span>
          </label>
        {/if}
      </div>

      <footer class="review-modal__footer">
        <button class="s-btn s-btn__secondary-outline review-modal__cancel" type="button" onclick={handleCancel}>Cancel</button>
        <div class="review-modal__footer-actions">
          {#if mode === 'preview'}
            <button class="s-btn s-btn__secondary-outline" type="button" onclick={enterEditMode}>Edit</button>
            <button class="s-btn s-btn__primary" type="button" disabled={!message.trim() || !questionText.trim() || !answerText.trim()} onclick={handleSubmit}>
              Send to {reviewerShortName}
            </button>
          {:else}
            <button class="s-btn s-btn__primary" type="button" disabled={!draftMessage.trim() || !draftQuestionText.trim()} onclick={saveEdits}>
              Save and preview
            </button>
          {/if}
        </div>
      </footer>
    </div>
  </div>
{/if}

<style>
  .review-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(35, 38, 41, 0.52);
  }

  .review-modal {
    width: min(860px, 100%);
    max-height: calc(100vh - 48px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--bc-black-200, #d6d9dc);
    border-radius: 6px;
    background: var(--white, #fff);
    box-shadow: 0 18px 48px rgba(12, 13, 14, 0.24);
  }

  .review-modal__header,
  .review-modal__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 20px;
  }

  .review-modal__header {
    border-bottom: 1px solid var(--bc-black-100, #e3e6e8);
  }

  .review-modal__footer {
    border-top: 1px solid var(--bc-black-100, #e3e6e8);
  }

  .review-modal__footer-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .s-btn.s-btn__secondary-outline:not(.s-btn__danger):not(.s-btn__featured):not(.s-btn__tonal):not(.s-btn__link):not(.s-btn__unset):not(.s-btn__facebook):not(.s-btn__github):not(.s-btn__google) {
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

  .review-modal__title {
    margin: 0;
    color: var(--fc-dark, #232629);
    font-size: 20px;
    line-height: 1.25;
  }

  .review-modal__heading {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .review-modal__subtitle {
    margin: 0;
    color: var(--fc-black-500, #6a737c);
    font-size: 14px;
    line-height: 1.4;
  }

  .review-modal__close {
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 4px;
    background: transparent;
    color: var(--fc-black-500, #6a737c);
    cursor: pointer;
  }

  .review-modal__close:hover {
    background: var(--black-050, #eff0f1);
    color: var(--fc-dark, #232629);
  }

  .review-modal__body {
    overflow: auto;
    padding: 20px;
  }

  .review-modal__label {
    display: block;
    margin-bottom: 8px;
    color: var(--fc-dark, #232629);
    font-size: 14px;
    font-weight: 700;
  }

  .review-modal__textarea {
    width: 100%;
    box-sizing: border-box;
    min-height: 104px;
    border: none;
    border-radius: 10px;
    background: #f7f6f5;
    color: #201c1d;
    font-size: 16px;
    line-height: 1.6;
    outline: none;
    padding: 12px 14px;
    resize: vertical;
  }

  .review-modal__textarea:focus {
    box-shadow:
      0 0 0 2px var(--focus-neutral),
      0 0 0 4px var(--theme-secondary-400);
  }

  .review-modal__textarea::placeholder {
    color: #46484d;
  }

  .review-modal__message,
  .review-modal__field {
    display: flex;
    flex-direction: column;
  }

  .review-modal__toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 16px;
    padding: 12px;
    border: 1px solid var(--bc-black-100, #e3e6e8);
    border-radius: 6px;
    cursor: pointer;
  }

  .review-modal__toggle:hover {
    background: var(--black-025, #f8f9f9);
  }

  .review-modal__toggle-copy {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .review-modal__toggle-title {
    color: var(--fc-dark, #232629);
    font-size: 14px;
    font-weight: 700;
    line-height: 1.25;
  }

  .review-modal__toggle-desc {
    color: var(--fc-black-500, #6a737c);
    font-size: 12px;
    line-height: 1.35;
  }

  .review-modal__toggle-control {
    flex: 0 0 auto;
  }

  .review-modal__payload {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 18px;
  }

  .review-modal__textarea--question {
    min-height: 92px;
  }

  .review-modal__readonly-answer {
    min-height: 180px;
    padding: 12px 14px;
    border: 1px solid var(--bc-black-200, #d6d9dc);
    border-radius: 10px;
    background: var(--white, #fff);
    color: var(--fc-black-700, #3b4045);
    font-size: 16px;
    line-height: 1.6;
    overflow-wrap: anywhere;
    white-space: normal;
  }

  .review-modal__readonly-answer :global(p) {
    margin: 0;
  }

  .review-modal__readonly-answer :global(p + p) {
    margin-top: 12px;
  }

  .review-modal__preview {
    position: relative;
    padding: 0 0 6px;
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  .review-modal__preview-title {
    margin: 0 0 12px;
    color: var(--fc-dark, #232629);
    font-size: 14px;
    font-weight: 700;
  }

  :global(.ask-giamir-slack-preview) {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr);
    gap: 12px;
    color: #1d1c1d;
    font-family: Slack-Lato, Slack-Fractions, appleLogo, sans-serif;
  }

  :global(.ask-giamir-slack-preview__icon) {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    overflow: hidden;
  }

  :global(.ask-giamir-slack-preview__icon img) {
    width: 48px;
    height: 48px;
    display: block;
  }

  :global(.ask-giamir-slack-preview__meta) {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #616061;
    font-size: 15px;
    line-height: 1.3;
  }

  :global(.ask-giamir-slack-preview__meta strong) {
    color: #1d1c1d;
    font-size: 16px;
  }

  :global(.ask-giamir-slack-preview__app) {
    padding: 1px 5px;
    border-radius: 4px;
    background: #e8e8e8;
    color: #616061;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  :global(.ask-giamir-slack-preview__intro) {
    margin: 4px 0 18px;
    font-size: 17px;
    line-height: 1.35;
  }

  :global(.ask-giamir-slack-preview__payload) {
    padding-left: 0;
  }

  :global(.ask-giamir-slack-preview__question) {
    margin: 0 0 14px;
    color: #1d1c1d;
    font-size: 17px;
    font-weight: 700;
    line-height: 1.35;
  }

  :global(.ask-giamir-slack-preview__answer p) {
    margin: 0;
    color: #1d1c1d;
    font-size: 17px;
    line-height: 1.45;
  }

  :global(.ask-giamir-slack-preview__answer p + p) {
    margin-top: 10px;
  }

  :global(.ask-giamir-slack-preview__sources) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-top: 16px;
  }

  :global(.ask-giamir-slack-preview__source-card) {
    width: fit-content;
    max-width: min(420px, 100%);
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid #dddddd;
    border-radius: 8px;
    background: #ffffff;
  }

  :global(.ask-giamir-slack-preview__source-icon) {
    width: 28px;
    height: 28px;
    flex: 0 0 auto;
    display: block;
  }

  :global(.ask-giamir-slack-preview__source-copy) {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  :global(.ask-giamir-slack-preview__source-title) {
    color: #1264a3;
    font-size: 15px;
    font-weight: 700;
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :global(.ask-giamir-slack-preview__source-author) {
    color: #616061;
    font-size: 13px;
    line-height: 1.25;
  }

</style>
