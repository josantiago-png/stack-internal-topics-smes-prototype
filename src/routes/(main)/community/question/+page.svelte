<script lang="ts">
  import { PostSummary, Tag } from '@stackoverflow/stacks-svelte';
  import { base } from '$app/paths';
  import { questions, totalQuestions, questionsPerPage, totalPages } from '$lib/data/questions';

  // Tab state
  const tabs = [
    { id: 'newest', label: 'Newest' },
    { id: 'active', label: 'Active' },
    { id: 'bountied', label: 'Bountied' },
    { id: 'unanswered', label: 'Unanswered' },
  ];

  const moreTabs = [
    { id: 'frequent', label: 'Frequent' },
    { id: 'score', label: 'Score' },
    { id: 'trending', label: 'Trending' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
  ];

  let selectedTab = $state('newest');
  let morePopoverOpen = $state(false);
  let filterExpanded = $state(false);

  // Filter form state
  let filterNoAnswers = $state(false);
  let filterNoAccepted = $state(false);
  let filterHasBounty = $state(false);
  let filterDaysOld = $state('');
  let sortId = $state('newest');
  let tagMode = $state('watched');

  // Pagination
  let currentPage = $state(1);

  function formatNumber(num: number): string {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm';
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toLocaleString();
  }

  function selectTab(id: string) {
    selectedTab = id;
    morePopoverOpen = false;
  }

  function toggleMorePopover() {
    morePopoverOpen = !morePopoverOpen;
  }

  function toggleFilter() {
    filterExpanded = !filterExpanded;
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
  }

  $effect(() => {
    if (morePopoverOpen) {
      const handler = (e: MouseEvent) => {
        if (!(e.target as HTMLElement).closest('.more-popover-container')) {
          morePopoverOpen = false;
        }
      };
      document.addEventListener('click', handler);
      return () => document.removeEventListener('click', handler);
    }
  });
</script>

<svelte:head>
  <title>Questions - Acme</title>
</svelte:head>

<div class="questions-page">

  <!-- Page header -->
  <div class="d-flex fw-wrap mb12 ai-center jc-space-between">
    <h1 class="flex--item fl1 fs-headline1 mr12 mb12">Questions</h1>
    <div class="flex--item mb12">
      <a href="#" class="ws-nowrap s-btn s-btn__filled ask-question-btn">
        Ask Question
      </a>
    </div>
  </div>

  <!-- Tab nav + filter bar -->
  <div class="d-flex ai-center jc-space-between mb12 fw-wrap g8">
    <!-- Question count -->
    <div class="fs-body3 fc-black-400 flex--item">
      {formatNumber(totalQuestions)} questions
    </div>

    <!-- Tabs + filter -->
    <div class="d-flex ai-center g8 flex--item fw-wrap">
      <!-- Tab group + More popover (positioned together) -->
      <div class="ps-relative more-popover-container d-flex ai-center">
        <div class="tab-group d-flex ai-center">
          {#each tabs as tab}
            <a
              href="#"
              class="tab-btn"
              class:is-selected={selectedTab === tab.id}
              onclick={(e) => { e.preventDefault(); selectTab(tab.id); }}
            >
              {tab.label}
              {#if tab.badge}
                <span class="tab-badge">{tab.badge}</span>
              {/if}
            </a>
          {/each}
          <a
            href="#"
            class="tab-btn tab-btn--dropdown"
            class:is-selected={moreTabs.some(t => t.id === selectedTab)}
            onclick={(e) => { e.preventDefault(); toggleMorePopover(); }}
            aria-haspopup="true"
            aria-expanded={morePopoverOpen}
          >
            {moreTabs.find(t => t.id === selectedTab)?.label ?? 'More'}
          </a>
        </div>

        {#if morePopoverOpen}
          <div class="s-popover is-visible ps-absolute mt4 z-dropdown" style="min-width: 140px; top: 100%; right: 0;">
            <div class="s-popover--arrow s-popover--arrow__tc"></div>
            <ul class="s-menu" role="menu">
              {#each moreTabs as tab}
                <li role="menuitem">
                  <a
                    href="#"
                    class="s-block-link s-block-link__left"
                    class:is-selected={selectedTab === tab.id}
                    onclick={(e) => { e.preventDefault(); selectTab(tab.id); }}
                  >
                    {tab.label}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>

      <!-- Filter button -->
      <button
        class="s-btn s-btn__tonal s-btn__sm ws-nowrap"
        class:is-selected={filterExpanded}
        onclick={toggleFilter}
        type="button"
        aria-expanded={filterExpanded}
        aria-controls="uql-form"
      >
        <svg aria-hidden="true" class="svg-icon iconFilter" width="18" height="18" viewBox="0 0 18 18">
          <path d="M2 4h14v2H2zm2 4h10v2H4zm8 4H6v2h6z"></path>
        </svg>
        Filter
      </button>
    </div>
  </div>

  <!-- Expandable filter form -->
  <div
    id="uql-form"
    class="s-expandable"
    class:is-expanded={filterExpanded}
  >
    <div class="s-expandable--content">
      <div class="bg-black-150 ba bc-black-225 bar-sm mb16">
        <div class="px12 py16">
          <div class="d-flex gs32 fw-wrap">

            <!-- Filter by -->
            <fieldset class="flex--item d-flex gs8 gsy fd-column">
              <legend class="flex--item s-label px0">Filter by</legend>
              <div class="flex--item">
                <div class="d-flex gs4 gsx ai-center">
                  <input class="s-checkbox d-block" type="checkbox" id="f-no-answers" bind:checked={filterNoAnswers}>
                  <label class="flex--item s-label fw-normal ws-nowrap" for="f-no-answers">No answers</label>
                </div>
              </div>
              <div class="flex--item">
                <div class="d-flex gs4 gsx ai-center">
                  <input class="s-checkbox d-block" type="checkbox" id="f-no-accepted" bind:checked={filterNoAccepted}>
                  <label class="flex--item s-label fw-normal ws-nowrap" for="f-no-accepted">No upvoted or accepted answers</label>
                </div>
              </div>
              <div class="flex--item">
                <div class="d-flex gs4 gsx ai-center">
                  <input class="s-checkbox d-block" type="checkbox" id="f-bounty" bind:checked={filterHasBounty}>
                  <label class="flex--item s-label fw-normal ws-nowrap" for="f-bounty">Has bounty</label>
                </div>
              </div>
              <div class="flex--item">
                <div class="d-flex gs4 gsx ai-center">
                  <input class="s-input d-block w64" type="number" id="f-days" bind:value={filterDaysOld} min="1" placeholder="">
                  <label class="flex--item s-label fw-normal ws-nowrap" for="f-days">Days old</label>
                </div>
              </div>
            </fieldset>

            <!-- Sorted by -->
            <fieldset class="flex--item d-flex gs8 gsy fd-column">
              <legend class="flex--item s-label px0">Sorted by</legend>
              {#each [
                { value: 'newest', label: 'Newest' },
                { value: 'recent-activity', label: 'Recent activity' },
                { value: 'most-votes', label: 'Highest score' },
                { value: 'most-frequent', label: 'Most frequent' },
                { value: 'bounty-ending', label: 'Bounty ending soon' },
                { value: 'trending', label: 'Trending' },
                { value: 'most-activity', label: 'Most activity' },
              ] as opt}
                <div class="flex--item">
                  <div class="d-flex gs4 gsx ai-center">
                    <input class="s-radio d-block" type="radio" id="sort-{opt.value}" name="sortId" value={opt.value} bind:group={sortId}>
                    <label class="flex--item s-label fw-normal ws-nowrap" for="sort-{opt.value}">{opt.label}</label>
                  </div>
                </div>
              {/each}
            </fieldset>

            <!-- Tagged with -->
            <fieldset class="flex--item d-flex gs8 gsy fd-column">
              <legend class="flex--item s-label px0">Tagged with</legend>
              <div class="flex--item">
                <div class="d-flex gs4 gsx ai-center">
                  <input class="s-radio d-block" type="radio" id="tag-watched" name="tagMode" value="watched" bind:group={tagMode}>
                  <label class="flex--item s-label fw-normal ws-nowrap" for="tag-watched">My watched tags</label>
                </div>
              </div>
              <div class="flex--item">
                <div class="d-flex gs4 gsx ai-center">
                  <input class="s-radio d-block" type="radio" id="tag-specified" name="tagMode" value="specified" bind:group={tagMode}>
                  <label class="flex--item s-label fw-normal ws-nowrap" for="tag-specified">The following tags:</label>
                </div>
              </div>
              {#if tagMode === 'specified'}
                <div class="flex--item ml24 mt4">
                  <input
                    class="s-input w100"
                    type="text"
                    placeholder="e.g. javascript or python"
                    style="max-width: 240px;"
                  >
                </div>
              {/if}
            </fieldset>

          </div>
        </div>
        <div class="p12 bt bc-black-225">
          <div class="d-flex g8">
            <button class="s-btn s-btn__sm s-btn__filled" type="button">Apply filter</button>
            <button class="s-btn s-btn__sm" type="button" onclick={toggleFilter}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Questions list -->
  <div id="questions" class="flush-left">
    {#each questions as question (question.id)}
      <div class="bb bc-black-200">
        <PostSummary
          href="#"
          title={question.title}
          excerpt={question.excerpt}
          votes={question.votes}
          answers={question.answers}
          views={question.views}
          timestamp={`asked ${question.askedAtRelative}`}
          userAvatar={question.author.avatar ?? ''}
          userName={question.author.name}
          userProfileUrl="#"
          userReputation={question.author.reputation}
          acceptedAnswer={question.acceptedAnswer}
          watched={question.watched}
          state={question.state}
          bounty={question.bounty}
        >
          {#snippet tags()}
            {#each question.tags as tag}
              <Tag href="#" watched={tag.watched} ignored={tag.ignored}>
                {tag.name}
              </Tag>
            {/each}
          {/snippet}
        </PostSummary>
      </div>
    {/each}
  </div>

  <!-- Pagination -->
  <div class="d-flex jc-space-between ai-center mt24 fw-wrap g8">

    <!-- Page sizer -->
    <div class="s-pagination float-right">
      {#each [15, 30, 50] as size}
        <button
          class="s-pagination--item"
          class:is-selected={questionsPerPage === size}
          type="button"
          title="Show {size} items per page"
        >
          {size}
        </button>
      {/each}
      <span class="s-pagination--item s-pagination--item__clear">per page</span>
    </div>

    <!-- Page numbers -->
    <div class="s-pagination">
      <button
        class="s-pagination--item"
        class:is-selected={currentPage === 1}
        disabled={currentPage === 1}
        onclick={() => goToPage(1)}
        type="button"
      >
        1
      </button>
      {#each [2, 3, 4, 5] as p}
        <button
          class="s-pagination--item"
          class:is-selected={currentPage === p}
          onclick={() => goToPage(p)}
          type="button"
        >
          {p}
        </button>
      {/each}
      <div class="s-pagination--item s-pagination--item__clear">…</div>
      <button
        class="s-pagination--item"
        class:is-selected={currentPage === totalPages}
        onclick={() => goToPage(totalPages)}
        type="button"
      >
        {formatNumber(totalPages)}
      </button>
      <button
        class="s-pagination--item"
        onclick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        type="button"
      >
        Next
      </button>
    </div>

  </div>

</div>

<style>
  .questions-page {
    width: 100%;
  }

  /* Ask Question button — matches logo color per theme */
  .ask-question-btn {
    background-color: #1D4EF3 !important;
    background-image: none !important;
    border-color: #1D4EF3 !important;
    color: #fff !important;
  }

  .ask-question-btn:hover {
    background-color: #1641cc !important;
    background-image: none !important;
    border-color: #1641cc !important;
    color: #fff !important;
  }

  :global(body.theme-dark) .ask-question-btn {
    background-color: #7b5cff !important;
    background-image: none !important;
    border-color: #7b5cff !important;
    color: #fff !important;
  }

  :global(body.theme-dark) .ask-question-btn:hover {
    background-color: #6a4edb !important;
    background-image: none !important;
    border-color: #6a4edb !important;
    color: #fff !important;
  }

  /* Tab group */
  .tab-group {
    gap: 2px;
  }

  .tab-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 400;
    color: var(--black-500);
    text-decoration: none;
    white-space: nowrap;
    line-height: 1;
    cursor: pointer;
    transition: background-color 0.1s ease, color 0.1s ease;
  }

  .tab-btn:hover {
    background-color: var(--black-100);
    color: var(--black-600);
    text-decoration: none;
  }

  .tab-btn.is-selected {
    font-weight: 700;
    background-color: var(--black-150);
    color: var(--black-600);
  }

  /* Dropdown arrow for More button */
  .tab-btn--dropdown::after {
    content: '';
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid currentColor;
    margin-left: 2px;
    opacity: 0.7;
  }

  .tab-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 10px;
    background-color: var(--blue-500, #0995dd);
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
  }

  /* Expandable filter panel */
  .s-expandable {
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.2s ease;
  }

  .s-expandable.is-expanded {
    max-height: 600px;
  }

  /* Post summary styling */
  :global(.s-post-summary) {
    padding: 16px;
  }

  :global(.s-post-summary--stats) {
    gap: 8px;
  }

  :global(.s-post-summary .s-post-summary--stats-item.has-answers) {
    border-radius: 0 !important;
  }

  :global(.s-post-summary--content-title) {
    margin-bottom: 4px;
  }

  :global(.s-post-summary--content-title a) {
    color: var(--theme-link-color, var(--blue-600));
    text-decoration: none;
  }

  :global(.s-post-summary--content-title a:hover) {
    color: var(--theme-link-color-hover, var(--blue-500));
  }

  :global(.s-post-summary--content-excerpt) {
    color: var(--black-600);
    font-size: 13px;
    line-height: 1.4;
    margin-bottom: 8px;
  }

  :global(.s-post-summary--meta) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }

  :global(.s-post-summary--meta-tags) {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  :global(.s-tag) {
    font-size: 12px;
    padding: 4.8px 6px;
  }

</style>
