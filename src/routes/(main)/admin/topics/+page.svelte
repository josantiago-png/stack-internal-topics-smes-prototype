<script lang="ts">
  import {
    IconAlert16,
    IconArrowDown,
    IconArrowUp,
    IconCheck,
    IconChevron12Down,
    IconCross,
    IconGripV,
    IconSearch,
  } from '@stackoverflow/stacks-icons/icons';
  import { Button, Icon, Popover, PopoverContent, PopoverReference } from '@stackoverflow/stacks-svelte';
  import { adminSmeProfiles, adminTopics } from '$lib/data/adminTopics';
  import { adminTopicsProgress } from '$lib/stores/adminTopicsProgress';
  import type { AdminSmeProfile, AdminTopic } from '$lib/data/adminTopics';

  type TopicFilter = 'all' | 'without-smes';
  type TopicSort = 'alphabetical' | 'items' | 'recent';
  type TopicFilterOption = {
    value: TopicFilter;
    label: string;
  };
  type TopicSortOption = {
    value: TopicSort;
    label: string;
  };
  type TopicEdit = {
    name: string;
    slackChannel: string;
    smes: string[];
  };
  type TopicRow = AdminTopic & {
    addedIndex: number;
    isMapped: boolean;
    slackChannel: string;
  };

  const fallbackSmeProfile: AdminSmeProfile = {
    name: 'Unassigned SME',
    photo: '/community-embed/Home%20-%20Stack%20Overflow%20Demo%20Site_files/user.svg',
    role: 'Subject matter expert',
  };
  const smesMappedAt = 'Jun 8, 2026, 10:50 AM';
  const smeOptions = Object.keys(adminSmeProfiles).sort((a, b) => a.localeCompare(b));
  const topicFilterOptions: TopicFilterOption[] = [
    { value: 'all', label: 'Everything' },
    { value: 'without-smes', label: 'Topics without SMEs' },
  ];
  const topicSortOptions: TopicSortOption[] = [
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'items', label: 'Most items' },
    { value: 'recent', label: 'Most recently added' },
  ];
  const slackChannelOptions = [
    '#admin-ops',
    '#connector-alerts',
    '#customer-support',
    '#finance-ops',
    '#people-systems',
    '#platform-triage',
    '#sales-engineering',
    '#security-review',
    '#team-help',
    '#topic-review',
  ];
  const defaultSlackChannelsByArea: Record<string, string> = {
    'AI governance': '#topic-review',
    'Data sources': '#connector-alerts',
    Engineering: '#platform-triage',
    Finance: '#finance-ops',
    Identity: '#admin-ops',
    People: '#people-systems',
    Sales: '#sales-engineering',
    Security: '#security-review',
    Support: '#customer-support',
  };

  let filterMode = $state<TopicFilter>('all');
  let sortMode = $state<TopicSort>('alphabetical');
  let filterMenuOpen = $state(false);
  let sortMenuOpen = $state(false);
  let topicSearchQuery = $state('');
  let managedTopicId = $state<string | null>(null);
  let draftName = $state('');
  let draftSmes = $state<string[]>([]);
  let draftSlackChannel = $state('');
  let channelSearchQuery = $state('');
  let channelSearchFocused = $state(false);
  let smeSearchQuery = $state('');
  let smeSearchFocused = $state(false);
  let draggedSmeIndex = $state<number | null>(null);
  let dragOverSmeIndex = $state<number | null>(null);

  const topicEdits = $state<Record<string, TopicEdit>>(
    Object.fromEntries(
      adminTopics.map((topic) => [
        topic.id,
        {
          name: topic.name,
          slackChannel: getDefaultSlackChannel(topic),
          smes: [...topic.smes],
        },
      ])
    )
  );

  const mappedTopicCount = $derived($adminTopicsProgress.mappedTopics);
  const listLoading = $derived($adminTopicsProgress.phase !== 'complete');
  const contentScanPercent = $derived(
    getPercent($adminTopicsProgress.itemsScanned, $adminTopicsProgress.totalItems)
  );
  const topicMappingPercent = $derived(
    getPercent($adminTopicsProgress.mappedTopics, $adminTopicsProgress.totalTopics)
  );
  const contentRemaining = $derived(
    Math.max(0, $adminTopicsProgress.totalItems - $adminTopicsProgress.itemsScanned)
  );
  const topicsRemaining = $derived(
    Math.max(0, $adminTopicsProgress.totalTopics - $adminTopicsProgress.mappedTopics)
  );
  const filterLabel = $derived(topicFilterOptions.find((option) => option.value === filterMode)?.label ?? 'Everything');
  const sortLabel = $derived(topicSortOptions.find((option) => option.value === sortMode)?.label ?? 'Alphabetical');
  const topicSearchText = $derived(topicSearchQuery.trim().toLowerCase());
  const visibleTopics = $derived(
    adminTopics.slice(0, $adminTopicsProgress.topicsDetected).map<TopicRow>((topic, index) => {
      const edit = topicEdits[topic.id];
      const isMapped = $adminTopicsProgress.phase === 'complete' || index < mappedTopicCount;

      return {
        ...topic,
        addedIndex: index,
        isMapped,
        name: edit?.name ?? topic.name,
        slackChannel: edit?.slackChannel ?? '',
        smes: isMapped ? [...(edit?.smes ?? topic.smes)] : [],
      };
    })
  );
  const filteredTopics = $derived(
    [...visibleTopics]
      .filter((topic) => filterMode !== 'without-smes' || topic.smes.length === 0)
      .filter((topic) => !topicSearchText || matchesTopicSearch(topic, topicSearchText))
      .sort((a, b) => {
        if (sortMode === 'items') {
          return b.itemCount - a.itemCount || a.name.localeCompare(b.name);
        }

        if (sortMode === 'recent') {
          return b.addedIndex - a.addedIndex;
        }

        return a.name.localeCompare(b.name);
      })
  );
  const managedTopic = $derived(
    managedTopicId ? (adminTopics.find((topic) => topic.id === managedTopicId) ?? null) : null
  );
  const availableSmes = $derived(smeOptions.filter((sme) => !draftSmes.includes(sme)));
  const matchingAvailableSmes = $derived(
    availableSmes
      .filter((sme) => sme.toLowerCase().includes(smeSearchQuery.trim().toLowerCase()))
      .slice(0, 6)
  );
  const showSmeSuggestions = $derived(smeSearchFocused || smeSearchQuery.trim().length > 0);
  const matchingSlackChannels = $derived(
    slackChannelOptions
      .filter((channel) => channel.toLowerCase().includes(channelSearchQuery.trim().toLowerCase()))
      .slice(0, 6)
  );
  const showSlackChannelSuggestions = $derived(!draftSlackChannel && channelSearchFocused);
  const pendingDetectionRows = $derived(
    $adminTopicsProgress.phase === 'indexing' || $adminTopicsProgress.phase === 'detecting'
      ? Array.from({ length: 6 }, (_, index) => index)
      : []
  );

  function getSmeProfile(name: string) {
    return adminSmeProfiles[name] ?? { ...fallbackSmeProfile, name };
  }

  function getPercent(value: number, total: number) {
    if (!total) {
      return 0;
    }

    return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
  }

  function formatTimeEstimate(ms: number) {
    const seconds = Math.ceil(ms / 1000);

    if (seconds <= 1) {
      return 'Less than 1s remaining';
    }

    return `About ${seconds}s remaining`;
  }

  function pluralize(count: number, singular: string, plural = `${singular}s`) {
    return `${count.toLocaleString()} ${count === 1 ? singular : plural}`;
  }

  function matchesTopicSearch(topic: TopicRow, query: string) {
    return [topic.name, topic.slackChannel, ...topic.smes].some((value) =>
      value.toLowerCase().includes(query)
    );
  }

  function getDefaultSlackChannel(topic: AdminTopic) {
    return defaultSlackChannelsByArea[topic.area] ?? '#topic-review';
  }

  const visibleSmes = (smes: string[]) => smes.slice(0, 2);
  const hiddenSmes = (smes: string[]) => smes.slice(2);
  const getTopicMeta = (topic: TopicRow) => `From ${topic.itemCount.toLocaleString()} items`;

  const toggleFilterMenu = () => {
    filterMenuOpen = !filterMenuOpen;
    sortMenuOpen = false;
  };

  const toggleSortMenu = () => {
    sortMenuOpen = !sortMenuOpen;
    filterMenuOpen = false;
  };

  const setFilterMode = (value: TopicFilter) => {
    filterMode = value;
    filterMenuOpen = false;
  };

  const setSortMode = (value: TopicSort) => {
    sortMode = value;
    sortMenuOpen = false;
  };

  const openManageTopic = (topic: TopicRow) => {
    const edit = topicEdits[topic.id];
    managedTopicId = topic.id;
    draftName = edit?.name ?? topic.name;
    draftSmes = [...(edit?.smes ?? topic.smes)];
    draftSlackChannel = edit?.slackChannel ?? '';
    channelSearchQuery = edit?.slackChannel ?? '';
    channelSearchFocused = false;
    smeSearchQuery = '';
    smeSearchFocused = false;
    draggedSmeIndex = null;
    dragOverSmeIndex = null;
  };

  const closeManageTopic = () => {
    managedTopicId = null;
  };

  const addDraftSme = (sme: string) => {
    if (!sme || draftSmes.includes(sme)) {
      return;
    }

    draftSmes = [...draftSmes, sme];
    smeSearchQuery = '';
    smeSearchFocused = false;
  };

  const removeDraftSme = (sme: string) => {
    draftSmes = draftSmes.filter((draftSme) => draftSme !== sme);
    smeSearchQuery = '';
  };

  const handleSlackChannelSearchInput = (event: Event) => {
    const nextQuery = event.currentTarget instanceof HTMLInputElement ? event.currentTarget.value : '';
    channelSearchQuery = nextQuery;
    channelSearchFocused = true;

    if (nextQuery !== draftSlackChannel) {
      draftSlackChannel = '';
    }
  };

  const selectDraftSlackChannel = (channel: string) => {
    draftSlackChannel = channel;
    channelSearchQuery = channel;
    channelSearchFocused = false;
  };

  const clearDraftSlackChannel = () => {
    draftSlackChannel = '';
    channelSearchQuery = '';
    channelSearchFocused = false;
  };

  const reorderDraftSmes = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= draftSmes.length || toIndex >= draftSmes.length) {
      return;
    }

    const nextSmes = [...draftSmes];
    const [movedSme] = nextSmes.splice(fromIndex, 1);
    nextSmes.splice(toIndex, 0, movedSme);
    draftSmes = nextSmes;
  };

  const moveDraftSme = (fromIndex: number, direction: -1 | 1) => {
    const toIndex = fromIndex + direction;
    reorderDraftSmes(fromIndex, toIndex);
  };

  const handleSmeDragStart = (event: DragEvent, index: number) => {
    draggedSmeIndex = index;
    dragOverSmeIndex = index;
    event.dataTransfer?.setData('text/plain', draftSmes[index]);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleSmeDragOver = (event: DragEvent, index: number) => {
    event.preventDefault();
    dragOverSmeIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  };

  const handleSmeDrop = (event: DragEvent, index: number) => {
    event.preventDefault();
    if (draggedSmeIndex !== null) {
      reorderDraftSmes(draggedSmeIndex, index);
    }
    draggedSmeIndex = null;
    dragOverSmeIndex = null;
  };

  const handleSmeDragEnd = () => {
    draggedSmeIndex = null;
    dragOverSmeIndex = null;
  };

  const saveManagedTopic = () => {
    if (!managedTopicId || !managedTopic) {
      return;
    }

    topicEdits[managedTopicId] = {
      name: draftName.trim() || managedTopic.name,
      slackChannel: slackChannelOptions.includes(draftSlackChannel) ? draftSlackChannel : '',
      smes: [...draftSmes],
    };
    closeManageTopic();
  };
</script>

<svelte:head>
  <title>Topics and SMEs - Stack Internal</title>
</svelte:head>

<section class="topics-page" aria-labelledby="topics-title">
  <header class="topics-header">
    <div>
      <h1 id="topics-title">Topics and SMEs</h1>
      <p>Review detected topics and mapped experts from ingested content.</p>
    </div>
  </header>
  <p class="topics-run-meta">Last detection and mapping: {smesMappedAt}</p>

  <div class="topics-table-shell">
    <div class="topics-section-toolbar">
      <div class="topics-section-summary">
        <span>Showing {filteredTopics.length.toLocaleString()} of {visibleTopics.length.toLocaleString()} detected topics.</span>
        {#if listLoading}
          <span class="row-loader" aria-label="Detected topics loading">
            <span></span>
            <span></span>
            <span></span>
          </span>
        {/if}
      </div>
      <div class="topics-toolbar-actions">
        <label class="topics-search-control">
          <Icon src={IconSearch} class="topics-search-icon" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search topics or SMEs"
            aria-label="Search topics or SMEs"
            bind:value={topicSearchQuery}
          />
        </label>
        <div class="topics-controls" aria-label="Topic table controls">
          <div class="topics-control-group">
            <span class="topics-control-label">Filter</span>
            <Popover
              id="topics-filter-popover"
              placement="bottom-end"
              strategy="fixed"
              visible={filterMenuOpen}
              onoutclick={() => (filterMenuOpen = false)}
            >
              <PopoverReference>
                <Button
                  size="sm"
                  weight="clear"
                  class="topics-menu-trigger"
                  aria-haspopup="menu"
                  aria-expanded={filterMenuOpen}
                  onclick={toggleFilterMenu}
                >
                  <span>{filterLabel}</span>
                  <Icon src={IconChevron12Down} class="topics-trigger-caret" />
                </Button>
              </PopoverReference>
              <PopoverContent role="menu" class="topics-dropdown-popover" ariaLabel="Filter topics">
                <div class="topics-dropdown-menu">
                  <h3>Filter by</h3>
                  {#each topicFilterOptions as option}
                    <button
                      class="topics-dropdown-option"
                      class:is-selected={filterMode === option.value}
                      type="button"
                      role="menuitemradio"
                      aria-checked={filterMode === option.value}
                      onclick={() => setFilterMode(option.value)}
                    >
                      <span>{option.label}</span>
                      {#if filterMode === option.value}
                        <Icon src={IconCheck} class="topics-option-check" />
                      {/if}
                    </button>
                  {/each}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div class="topics-control-group">
            <span class="topics-control-label">Sort</span>
            <Popover
              id="topics-sort-popover"
              placement="bottom-end"
              strategy="fixed"
              visible={sortMenuOpen}
              onoutclick={() => (sortMenuOpen = false)}
            >
              <PopoverReference>
                <Button
                  size="sm"
                  weight="clear"
                  class="topics-menu-trigger"
                  aria-haspopup="menu"
                  aria-expanded={sortMenuOpen}
                  onclick={toggleSortMenu}
                >
                  <span>{sortLabel}</span>
                  <Icon src={IconChevron12Down} class="topics-trigger-caret" />
                </Button>
              </PopoverReference>
              <PopoverContent role="menu" class="topics-dropdown-popover" ariaLabel="Sort topics">
                <div class="topics-dropdown-menu">
                  <h3>Sort by</h3>
                  {#each topicSortOptions as option}
                    <button
                      class="topics-dropdown-option"
                      class:is-selected={sortMode === option.value}
                      type="button"
                      role="menuitemradio"
                      aria-checked={sortMode === option.value}
                      onclick={() => setSortMode(option.value)}
                    >
                      <span>{option.label}</span>
                      {#if sortMode === option.value}
                        <Icon src={IconCheck} class="topics-option-check" />
                      {/if}
                    </button>
                  {/each}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>

    <div class="topics-table topics-table--topics" role="table" aria-label="Detected topics table">
      <div class="topics-row topics-row--header" role="row">
        <div role="columnheader">Topic</div>
        <div role="columnheader">SMEs</div>
        <div role="columnheader">Slack channel</div>
        <div role="columnheader">Manage</div>
      </div>

      {#if listLoading}
        <div class="topics-row topics-row--processing" role="row">
          <div class="processing-cell" role="cell">
            <span class="row-loader" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </span>
            <div class="processing-copy">
              <span class="processing-title">
                {#if $adminTopicsProgress.phase === 'indexing'}
                  Syncing in progress and preparing to detect topics
                {:else if $adminTopicsProgress.phase === 'detecting'}
                  Scanning content for topics
                {:else}
                  Mapping SMEs to detected topics
                {/if}
              </span>

              {#if $adminTopicsProgress.phase === 'detecting'}
                <div class="processing-progress" aria-label="Content scanned for topic detection">
                  <div class="processing-progress__meta">
                    <span>{$adminTopicsProgress.itemsScanned.toLocaleString()} of {$adminTopicsProgress.totalItems.toLocaleString()} items scanned</span>
                    <span>{pluralize(contentRemaining, 'item')} remaining</span>
                    <span>{formatTimeEstimate($adminTopicsProgress.phaseRemainingMs)}</span>
                  </div>
                  <div
                    class="processing-progress__bar"
                    role="progressbar"
                    aria-valuemin="0"
                    aria-valuemax={$adminTopicsProgress.totalItems}
                    aria-valuenow={$adminTopicsProgress.itemsScanned}
                    aria-label="Content scanned for topics"
                  >
                    <span style={`width: ${contentScanPercent}%`}></span>
                  </div>
                </div>
              {:else if $adminTopicsProgress.phase === 'mapping'}
                <div class="processing-progress" aria-label="Topics mapped to SMEs">
                  <div class="processing-progress__meta">
                    <span>{$adminTopicsProgress.mappedTopics.toLocaleString()} of {$adminTopicsProgress.totalTopics.toLocaleString()} topics mapped</span>
                    <span>{pluralize(topicsRemaining, 'topic')} left</span>
                    <span>{formatTimeEstimate($adminTopicsProgress.phaseRemainingMs)}</span>
                  </div>
                  <div
                    class="processing-progress__bar"
                    role="progressbar"
                    aria-valuemin="0"
                    aria-valuemax={$adminTopicsProgress.totalTopics}
                    aria-valuenow={$adminTopicsProgress.mappedTopics}
                    aria-label="Topics mapped to SMEs"
                  >
                    <span style={`width: ${topicMappingPercent}%`}></span>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}

      {#if filteredTopics.length > 0}
        {#each filteredTopics as topic}
          <div class="topics-row" class:is-warning={topic.isMapped && topic.smes.length === 0} role="row">
            <div class="topic-cell" role="cell">
              <span class="topic-name">{topic.name}</span>
              <span class="topic-meta">{getTopicMeta(topic)}</span>
            </div>
            <div class="sme-cell" role="cell">
              {#if $adminTopicsProgress.phase === 'detecting'}
                <span class="mapping-muted">Queued for SME mapping</span>
              {:else if topic.isMapped && topic.smes.length > 0}
                <div class="sme-list" aria-label="Mapped subject matter experts">
                  {#each visibleSmes(topic.smes) as sme}
                    <button class="sme-chip sme-chip--profile" type="button" aria-label={sme + ', ' + getSmeProfile(sme).role}>
                      <span>{sme}</span>
                      <span class="sme-profile-popover" role="tooltip">
                        <img src={getSmeProfile(sme).photo} alt="" />
                        <span>
                          <strong>{getSmeProfile(sme).name}</strong>
                          <small>{getSmeProfile(sme).role}</small>
                        </span>
                      </span>
                    </button>
                  {/each}
                  {#if hiddenSmes(topic.smes).length > 0}
                    <button
                      class="sme-chip sme-chip--more"
                      type="button"
                      aria-label={hiddenSmes(topic.smes).length + ' more mapped SMEs'}
                    >
                      +{hiddenSmes(topic.smes).length} more...
                      <span class="sme-more-popover" role="tooltip">
                        {#each hiddenSmes(topic.smes) as sme}
                          <span class="sme-more-person">
                            <img src={getSmeProfile(sme).photo} alt="" />
                            <span>
                              <strong>{getSmeProfile(sme).name}</strong>
                              <small>{getSmeProfile(sme).role}</small>
                            </span>
                          </span>
                        {/each}
                      </span>
                    </button>
                  {/if}
                </div>
              {:else if topic.isMapped}
                <span class="mapping-warning">
                  <Icon src={IconAlert16} class="mapping-warning-icon" aria-hidden="true" />
                  No SMEs assigned
                </span>
              {:else}
                <span class="mapping-loading">
                  <span class="row-loader" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                  Mapping SMEs
                </span>
              {/if}
            </div>
            <div class="channel-cell" role="cell">
              {#if topic.isMapped && topic.slackChannel}
                <span class="channel-chip">{topic.slackChannel}</span>
              {:else if topic.isMapped}
                <span class="mapping-muted">No channel mapped</span>
              {:else}
                <span class="mapping-loading">
                  <span class="row-loader" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                  Mapping channel
                </span>
              {/if}
            </div>
            <div class="manage-cell" role="cell">
              <button class="manage-button" type="button" onclick={() => openManageTopic(topic)}>Manage</button>
            </div>
          </div>
        {/each}

        {#each pendingDetectionRows as row}
          <div class="topics-row topics-row--skeleton" role="row" aria-hidden="true">
            <div class="topic-cell" role="cell">
              <span class="skeleton-line skeleton-line--title" style="--skeleton-width: {72 - row * 4}%"></span>
              <span class="skeleton-line skeleton-line--meta" style="--skeleton-width: {46 + row * 3}%"></span>
            </div>
            <div class="sme-cell" role="cell">
              <span class="skeleton-chip"></span>
              <span class="skeleton-chip skeleton-chip--short"></span>
            </div>
            <div class="channel-cell" role="cell">
              <span class="skeleton-channel"></span>
            </div>
            <div role="cell">
              <span class="skeleton-action"></span>
            </div>
          </div>
        {/each}
      {:else}
        {#if pendingDetectionRows.length > 0}
          {#each pendingDetectionRows as row}
            <div class="topics-row topics-row--skeleton" role="row" aria-hidden="true">
              <div class="topic-cell" role="cell">
                <span class="skeleton-line skeleton-line--title" style="--skeleton-width: {68 - row * 3}%"></span>
                <span class="skeleton-line skeleton-line--meta" style="--skeleton-width: {42 + row * 4}%"></span>
              </div>
              <div class="sme-cell" role="cell">
                <span class="skeleton-chip"></span>
                <span class="skeleton-chip skeleton-chip--short"></span>
              </div>
              <div class="channel-cell" role="cell">
                <span class="skeleton-channel"></span>
              </div>
              <div role="cell">
                <span class="skeleton-action"></span>
              </div>
            </div>
          {/each}
        {:else}
          <div class="topics-row topics-row--empty" role="row">
            <div role="cell">
              No topics match the current filter.
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </div>
</section>

{#if managedTopic}
  <div class="modal-layer">
    <button class="modal-backdrop" type="button" aria-label="Close manage topic" onclick={closeManageTopic}></button>
    <div class="topic-modal" role="dialog" aria-modal="true" aria-labelledby="manage-topic-title">
      <header class="topic-modal__header">
        <div>
          <h2 id="manage-topic-title">Manage topic</h2>
          <p>{managedTopic.area} - {managedTopic.source}</p>
        </div>
        <button class="modal-close" type="button" aria-label="Close manage topic" onclick={closeManageTopic}>
          <Icon src={IconCross} />
        </button>
      </header>

      <div class="topic-modal__body">
        <label class="field">
          <span>Topic name</span>
          <input type="text" bind:value={draftName} />
        </label>

        <section class="modal-section" aria-labelledby="sme-escalation-title">
          <div class="modal-section__header">
            <div>
              <h3 id="sme-escalation-title">SME escalation path</h3>
              <p>The order below controls who gets routed topic related content to verify and answer first.</p>
            </div>
          </div>

          {#if draftSmes.length > 0}
            <ol class="sme-escalation-list">
              {#each draftSmes as sme, index}
                <li
                  draggable="true"
                  class:is-dragging={draggedSmeIndex === index}
                  class:is-drag-target={dragOverSmeIndex === index && draggedSmeIndex !== index}
                  ondragstart={(event) => handleSmeDragStart(event, index)}
                  ondragover={(event) => handleSmeDragOver(event, index)}
                  ondrop={(event) => handleSmeDrop(event, index)}
                  ondragend={handleSmeDragEnd}
                >
                  <span class="sme-drag-handle" aria-hidden="true">
                    <Icon src={IconGripV} />
                  </span>
                  <span class="sme-rank">{index + 1}</span>
                  <span class="sme-name">{sme}</span>
                  <div class="sme-actions">
                    <button
                      class="sme-icon-button"
                      type="button"
                      aria-label="Move {sme} up"
                      title="Move up"
                      onclick={() => moveDraftSme(index, -1)}
                      disabled={index === 0}
                    >
                      <Icon src={IconArrowUp} />
                    </button>
                    <button
                      class="sme-icon-button"
                      type="button"
                      aria-label="Move {sme} down"
                      title="Move down"
                      onclick={() => moveDraftSme(index, 1)}
                      disabled={index === draftSmes.length - 1}
                    >
                      <Icon src={IconArrowDown} />
                    </button>
                    <button type="button" onclick={() => removeDraftSme(sme)}>Remove</button>
                  </div>
                </li>
              {/each}
            </ol>
          {:else}
            <div class="modal-empty modal-empty--warning">
              <Icon src={IconAlert16} class="modal-warning-icon" aria-hidden="true" />
              <span>No SMEs assigned.</span>
            </div>
          {/if}

          <div class="add-sme-row">
            <label>
              <span>Add SME</span>
              <span class="sme-search-control">
                <Icon src={IconSearch} class="sme-search-icon" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search by name"
                  bind:value={smeSearchQuery}
                  onfocus={() => (smeSearchFocused = true)}
                  onblur={() => window.setTimeout(() => (smeSearchFocused = false), 120)}
                  disabled={availableSmes.length === 0}
                />
              </span>
            </label>
            {#if showSmeSuggestions}
              <div class="sme-suggestion-menu" role="listbox" aria-label="Available SMEs">
                {#if matchingAvailableSmes.length > 0}
                  {#each matchingAvailableSmes as sme}
                    <button
                      type="button"
                      role="option"
                      aria-selected="false"
                      onmousedown={(event) => {
                        event.preventDefault();
                        addDraftSme(sme);
                      }}
                    >
                      {sme}
                    </button>
                  {/each}
                {:else}
                  <div class="sme-suggestion-empty">
                    {#if availableSmes.length === 0}
                      All available SMEs are already in the escalation path.
                    {:else}
                      No matching SMEs.
                    {/if}
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        </section>

        <section class="modal-section" aria-labelledby="slack-routing-title">
          <div>
            <h3 id="slack-routing-title">Slack</h3>
            <p>Content related to this topic can be routed into this Slack channel for follow-up.</p>
          </div>
          <div class="channel-select-row">
            <span class="channel-select-label" id="slack-channel-label">Channel</span>
            {#if draftSlackChannel}
              <span class="selected-channel-tag" aria-live="polite">
                <span>{draftSlackChannel}</span>
                <button type="button" aria-label="Remove {draftSlackChannel}" onclick={clearDraftSlackChannel}>
                  <Icon src={IconCross} />
                </button>
              </span>
            {:else}
              <span class="channel-search-control">
                <Icon src={IconSearch} class="channel-search-icon" aria-hidden="true" />
                <input
                  type="search"
                  aria-labelledby="slack-channel-label"
                  placeholder="Search channel name"
                  value={channelSearchQuery}
                  oninput={handleSlackChannelSearchInput}
                  onfocus={() => (channelSearchFocused = true)}
                  onblur={() => window.setTimeout(() => (channelSearchFocused = false), 120)}
                />
              </span>
              {#if showSlackChannelSuggestions}
                <div class="channel-suggestion-menu" role="listbox" aria-label="Slack channels">
                  {#if matchingSlackChannels.length > 0}
                    {#each matchingSlackChannels as channel}
                      <button
                        type="button"
                        role="option"
                        aria-selected={draftSlackChannel === channel}
                        onmousedown={(event) => {
                          event.preventDefault();
                          selectDraftSlackChannel(channel);
                        }}
                      >
                        <span>{channel}</span>
                        {#if draftSlackChannel === channel}
                          <Icon src={IconCheck} class="channel-option-check" />
                        {/if}
                      </button>
                    {/each}
                  {:else}
                    <div class="channel-suggestion-empty">No matching channels.</div>
                  {/if}
                </div>
              {/if}
            {/if}
          </div>
        </section>
      </div>

      <footer class="topic-modal__footer">
        <button class="secondary-button" type="button" onclick={closeManageTopic}>Cancel</button>
        <button class="primary-button" type="button" onclick={saveManagedTopic}>Save changes</button>
      </footer>
    </div>
  </div>
{/if}

<style>
  .topics-page {
    color: #201c1d;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    width: min(100%, 1040px);
  }

  h1,
  h2,
  p {
    margin: 0;
  }

  .topics-header {
    align-items: flex-start;
    display: flex;
    justify-content: space-between;
    margin-bottom: 22px;
  }

  .topics-header h1 {
    font-size: 30px;
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 8px;
  }

  .topics-header p {
    color: #4b4f58;
    font-size: 15px;
    line-height: 1.35;
  }

  .topics-run-meta {
    color: #6a707c;
    font-size: 13px;
    line-height: 1.3;
    margin: -12px 0 18px;
  }

  .row-loader {
    align-items: center;
    display: inline-flex;
    gap: 3px;
    height: 14px;
    justify-content: center;
    width: 24px;
  }

  .row-loader span {
    animation: topics-loading-dot 1.05s ease-in-out infinite;
    background: #111;
    border-radius: 50%;
    display: block;
    height: 4px;
    width: 4px;
  }

  .row-loader span:nth-child(2) {
    animation-delay: 0.14s;
  }

  .row-loader span:nth-child(3) {
    animation-delay: 0.28s;
  }

  .topics-table-shell {
    border: 0;
    border-radius: 0;
    overflow: visible;
  }

  .topics-section-toolbar {
    align-items: center;
    border-bottom: 1px solid #e4e6e8;
    display: grid;
    gap: 18px;
    grid-template-columns: minmax(0, 1fr) auto;
    padding: 12px 0;
  }

  .topics-section-summary {
    align-items: center;
    color: #6a707c;
    display: inline-flex;
    font-size: 13px;
    gap: 8px;
    line-height: 1.25;
    min-width: 0;
  }

  .topics-toolbar-actions {
    align-items: center;
    display: flex;
    flex-wrap: nowrap;
    gap: 10px;
    justify-content: flex-end;
    min-width: 0;
  }

  .topics-search-control {
    display: block;
    flex: 0 0 230px;
    position: relative;
    width: 230px;
  }

  :global(.topics-search-icon) {
    color: #6a707c;
    height: 16px;
    left: 11px;
    pointer-events: none;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
  }

  .topics-search-control input {
    background: #fff;
    border: 1px solid #c8ccd2;
    border-radius: 6px;
    color: #201c1d;
    font: inherit;
    font-size: 13px;
    min-height: 36px;
    padding: 0 11px 0 34px;
    width: 100%;
  }

  .topics-search-control input::placeholder {
    color: #6a707c;
  }

  .topics-search-control input:focus {
    border-color: #201c1d;
    box-shadow: 0 0 0 2px rgb(32 28 29 / 0.12);
    outline: 0;
  }

  .topics-controls {
    align-items: center;
    display: flex;
    flex-wrap: nowrap;
    gap: 10px;
    justify-content: flex-end;
  }

  .topics-control-group {
    align-items: center;
    display: inline-flex;
    gap: 7px;
  }

  .topics-control-label {
    color: #4b4f58;
    font-size: 13px;
    font-weight: 800;
    line-height: 1.2;
  }

  .field input {
    background: #fff;
    border: 1px solid #c8ccd2;
    border-radius: 6px;
    color: #201c1d;
    font: inherit;
  }

  :global(.topics-menu-trigger.s-btn) {
    align-items: center;
    background: #fff !important;
    border: 1px solid #a7aab0 !important;
    color: #201c1d !important;
    display: inline-flex;
    font-size: 13px;
    gap: 8px;
    justify-content: space-between;
    min-width: 128px;
    padding-left: 10px;
    padding-right: 8px;
    white-space: nowrap;
  }

  :global(.topics-menu-trigger.s-btn:hover),
  :global(.topics-menu-trigger.s-btn[aria-expanded='true']) {
    background: #f7f6f5 !important;
    border-color: #84878c !important;
    color: #201c1d !important;
  }

  :global(.topics-trigger-caret) {
    color: #4b4f58;
    height: 12px;
    width: 12px;
  }

  :global(.s-popover.topics-dropdown-popover) {
    --_po-w: 280px;
    --_po-wmn: 220px;
    border: 1px solid #e4e6e8;
    border-radius: 18px;
    box-shadow: 0 10px 28px rgb(0 0 0 / 0.16), 0 2px 7px rgb(0 0 0 / 0.08);
    max-width: calc(100vw - 32px);
    padding: 0;
  }

  :global(.topics-dropdown-popover .s-popover--content) {
    margin: 0;
    overflow: visible;
    padding: 0;
  }

  .topics-dropdown-menu {
    background: #fff;
    border-radius: 18px;
    padding: 22px;
  }

  .topics-dropdown-menu h3 {
    color: #201c1d;
    font-size: 20px;
    font-weight: 800;
    line-height: 1.15;
    margin: 0 0 18px;
  }

  .topics-dropdown-option {
    align-items: center;
    background: transparent;
    border: 0;
    border-radius: 8px;
    color: #4b4f58;
    cursor: pointer;
    display: grid;
    font: inherit;
    font-size: 17px;
    grid-template-columns: minmax(0, 1fr) 22px;
    line-height: 1.2;
    margin: 0;
    min-height: 44px;
    padding: 8px 8px 8px 0;
    text-align: left;
    width: 100%;
  }

  .topics-dropdown-option + .topics-dropdown-option {
    margin-top: 8px;
  }

  .topics-dropdown-option:hover {
    color: #201c1d;
  }

  .topics-dropdown-option:focus-visible {
    box-shadow: 0 0 0 2px #fff, 0 0 0 4px #201c1d;
    outline: 0;
  }

  .topics-dropdown-option.is-selected {
    color: #201c1d;
  }

  :global(.topics-option-check) {
    color: #201c1d;
    height: 20px;
    justify-self: end;
    width: 20px;
  }

  .topics-table {
    display: grid;
  }

  .topics-row {
    align-items: center;
    display: grid;
    gap: 18px;
    grid-template-columns: minmax(240px, 1fr) minmax(220px, 300px) minmax(145px, 180px) 86px;
    min-height: 62px;
    padding: 11px 0;
    position: relative;
  }

  .topics-row:hover {
    z-index: 4;
  }

  .topics-row.is-warning {
    background: #fff8dc;
  }

  .topics-row.is-warning .sme-cell {
    align-items: center;
    display: flex;
    min-height: 32px;
  }

  .topics-row.is-warning + .topics-row {
    border-top-color: #f1df9d;
  }

  .topics-row + .topics-row.is-warning {
    border-top-color: #f1df9d;
  }

  .topics-row + .topics-row {
    border-top: 1px solid #e4e6e8;
  }

  .topics-row--header {
    background: #f9f8f7;
    color: #6a707c;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0;
    min-height: 40px;
    padding-bottom: 10px;
    padding-top: 10px;
    text-transform: uppercase;
  }

  .topics-row--processing {
    background: #f5f4f3;
    color: #4b4f58;
    grid-template-columns: 1fr;
    min-height: 44px;
    padding-bottom: 14px;
    padding-top: 14px;
  }

  .processing-cell {
    align-items: flex-start;
    display: inline-flex;
    font-size: 13px;
    gap: 10px;
    line-height: 1.2;
    min-width: 0;
  }

  .processing-copy {
    display: grid;
    gap: 8px;
    min-width: 0;
    width: min(100%, 620px);
  }

  .processing-title {
    color: #4b4f58;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.25;
  }

  .processing-progress {
    display: grid;
    gap: 6px;
  }

  .processing-progress__meta {
    align-items: center;
    color: #6a707c;
    display: flex;
    flex-wrap: wrap;
    font-size: 12px;
    font-weight: 600;
    gap: 8px 14px;
    line-height: 1.25;
  }

  .processing-progress__bar {
    background: #dedcda;
    border-radius: 999px;
    height: 8px;
    overflow: hidden;
    width: 100%;
  }

  .processing-progress__bar span {
    background: #201c1d;
    border-radius: inherit;
    display: block;
    height: 100%;
    transition: width 0.16s linear;
  }

  .topic-cell {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
  }

  .topic-name {
    color: #201c1d;
    font-size: 15px;
    font-weight: 800;
    line-height: 1.25;
  }

  .topic-meta {
    color: #6a707c;
    font-size: 12px;
    line-height: 1.25;
  }

  .sme-cell {
    min-width: 0;
    position: relative;
  }

  .channel-cell {
    min-width: 0;
  }

  .channel-chip {
    align-items: center;
    background: #fff;
    border: 1px solid #d7d9de;
    border-radius: 999px;
    color: #201c1d;
    display: inline-flex;
    font-size: 13px;
    font-weight: 700;
    line-height: 1;
    max-width: 100%;
    min-height: 28px;
    overflow: hidden;
    padding: 0 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sme-list {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .sme-chip {
    align-items: center;
    appearance: none;
    background: #f0efed;
    border: 0;
    border-radius: 999px;
    color: #201c1d;
    cursor: pointer;
    display: inline-flex;
    font-family: inherit;
    font-size: 13px;
    font-weight: 700;
    line-height: 1;
    margin: 0;
    padding: 7px 10px;
    position: relative;
    white-space: nowrap;
  }

  .sme-chip:hover,
  .sme-chip:focus-visible {
    background: #e4e2df;
    outline: 0;
    z-index: 8;
  }

  .sme-chip:focus-visible {
    box-shadow: 0 0 0 2px #fff, 0 0 0 4px #201c1d;
  }

  .sme-chip--more {
    background: #fff;
    border: 1px solid #d7d9de;
    color: #4b4f58;
    padding: 6px 10px;
  }

  .sme-profile-popover,
  .sme-more-popover {
    background: #fff;
    border: 1px solid #d7d9de;
    border-radius: 8px;
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.16), 0 2px 8px rgba(0, 0, 0, 0.08);
    color: #201c1d;
    left: 0;
    opacity: 0;
    padding: 10px;
    pointer-events: none;
    position: absolute;
    text-align: left;
    top: calc(100% + 8px);
    transform: translateY(-3px);
    transition: opacity 0.14s ease, transform 0.14s ease, visibility 0.14s ease;
    visibility: hidden;
    white-space: normal;
    z-index: 20;
  }

  .sme-profile-popover {
    align-items: center;
    display: grid;
    gap: 10px;
    grid-template-columns: 40px minmax(0, 1fr);
    min-width: 226px;
  }

  .sme-more-popover {
    display: grid;
    gap: 10px;
    right: 0;
    left: auto;
    min-width: 250px;
  }

  .sme-chip:hover .sme-profile-popover,
  .sme-chip:focus-visible .sme-profile-popover,
  .sme-chip:hover .sme-more-popover,
  .sme-chip:focus-visible .sme-more-popover {
    opacity: 1;
    transform: translateY(0);
    visibility: visible;
  }

  .sme-profile-popover img,
  .sme-more-person img {
    border-radius: 50%;
    display: block;
    flex-shrink: 0;
    height: 40px;
    object-fit: cover;
    width: 40px;
  }

  .sme-profile-popover strong,
  .sme-more-person strong {
    color: #201c1d;
    display: block;
    font-size: 13px;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 3px;
  }

  .sme-profile-popover small,
  .sme-more-person small {
    color: #6a707c;
    display: block;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.25;
  }

  .sme-more-person {
    align-items: center;
    display: grid;
    gap: 9px;
    grid-template-columns: 40px minmax(0, 1fr);
    min-width: 0;
  }

  .manage-cell {
    display: flex;
    justify-content: flex-start;
  }

  .manage-button,
  .primary-button,
  .secondary-button,
  .sme-actions button,
  .modal-close,
  .sme-suggestion-menu button,
  .channel-suggestion-menu button,
  .selected-channel-tag button {
    border: 0;
    cursor: pointer;
    font-family: inherit;
    font-weight: 700;
  }

  .manage-button {
    background: #f0efed;
    border-radius: 999px;
    color: #201c1d;
    font-size: 13px;
    min-height: 32px;
    padding: 0 13px;
  }

  .manage-button:hover,
  .secondary-button:hover,
  .sme-actions button:hover {
    background: #e4e2df;
  }

  .mapping-muted,
  .mapping-loading,
  .mapping-warning {
    align-items: center;
    color: #6a707c;
    display: inline-flex;
    font-size: 13px;
    gap: 7px;
    line-height: 1.2;
  }

  .mapping-warning {
    color: #7a5d00;
    font-weight: 700;
    min-height: 32px;
  }

  :global(.mapping-warning-icon) {
    color: #b87503;
    flex-shrink: 0;
    height: 16px;
    width: 16px;
  }

  :global(.mapping-warning-icon svg) {
    height: 16px;
    width: 16px;
  }

  .topics-row--skeleton {
    pointer-events: none;
  }

  .skeleton-line,
  .skeleton-chip,
  .skeleton-channel {
    animation: topics-skeleton-pulse 1.2s ease-in-out infinite;
    background: #eceae8;
    display: block;
  }

  .skeleton-line {
    border-radius: 999px;
    height: 13px;
    width: var(--skeleton-width, 60%);
  }

  .skeleton-line--meta {
    height: 11px;
  }

  .skeleton-chip {
    border-radius: 999px;
    display: inline-block;
    height: 26px;
    margin-right: 7px;
    width: 92px;
  }

  .skeleton-chip--short {
    width: 76px;
  }

  .skeleton-channel {
    border-radius: 999px;
    height: 28px;
    width: 126px;
  }

  .skeleton-action {
    animation: topics-skeleton-pulse 1.2s ease-in-out infinite;
    background: #eceae8;
    border-radius: 999px;
    display: block;
    height: 28px;
    width: 74px;
  }

  .topics-row--empty {
    color: #6a707c;
    font-size: 14px;
    grid-template-columns: 1fr;
    min-height: 72px;
  }

  .modal-layer {
    align-items: center;
    display: flex;
    inset: 0;
    justify-content: center;
    padding: 28px;
    position: fixed;
    z-index: 1100;
  }

  .modal-backdrop {
    background: rgba(0, 0, 0, 0.38);
    border: 0;
    cursor: default;
    inset: 0;
    position: absolute;
  }

  .topic-modal {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.22);
    color: #201c1d;
    max-height: min(780px, calc(100vh - 56px));
    overflow: hidden;
    position: relative;
    width: min(100%, 680px);
    z-index: 1;
  }

  .topic-modal__header,
  .topic-modal__footer {
    align-items: center;
    display: flex;
    gap: 16px;
    justify-content: space-between;
  }

  .topic-modal__header {
    border-bottom: 1px solid #e4e6e8;
    padding: 18px 20px;
  }

  .topic-modal__header h2 {
    color: #201c1d;
    font-size: 20px;
    font-weight: 800;
    line-height: 1.15;
    margin: 0 0 4px;
  }

  .topic-modal__header p,
  .modal-section p {
    color: #6a707c;
    font-size: 13px;
    line-height: 1.3;
  }

  .modal-close {
    align-items: center;
    background: #f0efed;
    border-radius: 50%;
    color: #201c1d;
    display: inline-flex;
    flex-shrink: 0;
    font-size: 15px;
    height: 32px;
    justify-content: center;
    line-height: 1;
    width: 32px;
  }

  :global(.modal-close svg) {
    height: 14px;
    width: 14px;
  }

  .topic-modal__body {
    display: grid;
    gap: 20px;
    max-height: calc(100vh - 220px);
    overflow-y: auto;
    padding: 20px;
  }

  .field {
    display: grid;
    gap: 7px;
  }

  .field span,
  .add-sme-row label > span,
  .channel-select-label {
    color: #4b4f58;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.2;
  }

  .field input,
  .sme-search-control input,
  .channel-search-control input {
    min-height: 38px;
    padding: 0 11px;
    width: 100%;
  }

  .modal-section {
    display: grid;
    gap: 12px;
  }

  .modal-section__header {
    align-items: flex-start;
    display: flex;
    justify-content: space-between;
  }

  .modal-section h3 {
    color: #201c1d;
    font-size: 16px;
    font-weight: 800;
    line-height: 1.2;
    margin: 0 0 4px;
  }

  .sme-escalation-list {
    border: 1px solid #d7d9de;
    border-radius: 8px;
    display: grid;
    list-style: none;
    margin: 0;
    overflow: hidden;
    padding: 0;
  }

  .sme-escalation-list li {
    align-items: center;
    display: grid;
    gap: 10px;
    grid-template-columns: 20px 26px minmax(0, 1fr) auto;
    min-height: 50px;
    padding: 9px 10px;
  }

  .sme-escalation-list li[draggable='true'] {
    cursor: grab;
  }

  .sme-escalation-list li.is-dragging {
    opacity: 0.45;
  }

  .sme-escalation-list li.is-drag-target {
    background: #f7f6f5;
    box-shadow: inset 3px 0 0 #201c1d;
  }

  .sme-escalation-list li + li {
    border-top: 1px solid #e4e6e8;
  }

  .sme-rank {
    align-items: center;
    background: #f0efed;
    border-radius: 50%;
    color: #4b4f58;
    display: inline-flex;
    font-size: 12px;
    font-weight: 800;
    height: 24px;
    justify-content: center;
    width: 24px;
  }

  .sme-name {
    color: #201c1d;
    font-size: 14px;
    font-weight: 800;
    line-height: 1.2;
    min-width: 0;
  }

  .sme-drag-handle {
    align-items: center;
    color: #84878c;
    display: inline-flex;
    justify-content: center;
  }

  :global(.sme-drag-handle svg) {
    height: 16px;
    width: 16px;
  }

  .sme-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: flex-end;
  }

  .sme-actions button,
  .secondary-button {
    background: #f0efed;
    border-radius: 999px;
    color: #201c1d;
    font-size: 12px;
    min-height: 30px;
    padding: 0 11px;
  }

  .sme-icon-button {
    align-items: center;
    display: inline-flex;
    justify-content: center;
    padding: 0;
    width: 30px;
  }

  :global(.sme-icon-button svg) {
    height: 14px;
    width: 14px;
  }

  .sme-actions button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .modal-empty {
    align-items: center;
    border: 1px dashed #c8ccd2;
    border-radius: 8px;
    color: #6a707c;
    display: flex;
    font-size: 13px;
    min-height: 56px;
    padding: 12px;
  }

  .modal-empty--warning {
    background: #fff8dc;
    border-color: #f1df9d;
    color: #7a5d00;
    font-weight: 700;
    gap: 8px;
  }

  :global(.modal-warning-icon) {
    color: #b87503;
    flex-shrink: 0;
    height: 16px;
    width: 16px;
  }

  :global(.modal-warning-icon svg) {
    height: 16px;
    width: 16px;
  }

  .add-sme-row {
    display: grid;
    position: relative;
  }

  .add-sme-row label {
    display: grid;
    gap: 7px;
  }

  .sme-search-control,
  .channel-search-control {
    display: block;
    position: relative;
  }

  :global(.sme-search-icon),
  :global(.channel-search-icon) {
    color: #6a707c;
    height: 16px;
    left: 11px;
    pointer-events: none;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
  }

  .sme-search-control input,
  .channel-search-control input {
    background: #fff;
    border: 1px solid #c8ccd2;
    border-radius: 6px;
    color: #201c1d;
    font: inherit;
    padding-left: 34px;
  }

  .sme-search-control input:focus,
  .channel-search-control input:focus {
    border-color: #201c1d;
    box-shadow: 0 0 0 2px rgb(32 28 29 / 0.12);
    outline: 0;
  }

  .sme-search-control input:disabled {
    background: #f7f6f5;
    color: #84878c;
  }

  .channel-select-row {
    display: grid;
    gap: 8px;
    position: relative;
  }

  .selected-channel-tag {
    align-items: center;
    background: #f0efed;
    border: 1px solid #d7d9de;
    border-radius: 999px;
    color: #201c1d;
    display: inline-flex;
    font-size: 13px;
    font-weight: 700;
    gap: 8px;
    justify-self: start;
    line-height: 1.2;
    max-width: 100%;
    min-height: 32px;
    min-width: 0;
    padding: 0 5px 0 11px;
  }

  .selected-channel-tag > span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .selected-channel-tag button {
    align-items: center;
    background: transparent;
    border-radius: 50%;
    color: #4b4f58;
    display: inline-flex;
    flex-shrink: 0;
    height: 24px;
    justify-content: center;
    padding: 0;
    width: 24px;
  }

  .selected-channel-tag button:hover,
  .selected-channel-tag button:focus-visible {
    background: #e4e2df;
    color: #201c1d;
    outline: 0;
  }

  :global(.selected-channel-tag svg) {
    height: 12px;
    width: 12px;
  }

  .sme-suggestion-menu,
  .channel-suggestion-menu {
    background: #fff;
    border: 1px solid #d7d9de;
    border-radius: 8px;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14);
    display: grid;
    left: 0;
    overflow: hidden;
    position: absolute;
    right: 0;
    top: calc(100% + 6px);
    z-index: 3;
  }

  .channel-suggestion-menu {
    bottom: auto;
    left: auto;
    max-height: 176px;
    overflow-y: auto;
    position: static;
    right: auto;
    top: auto;
  }

  .sme-suggestion-menu button,
  .channel-suggestion-menu button {
    align-items: center;
    background: #fff;
    color: #201c1d;
    display: grid;
    font-size: 13px;
    font-weight: 700;
    grid-template-columns: minmax(0, 1fr) 18px;
    min-height: 38px;
    padding: 0 12px;
    text-align: left;
  }

  .channel-suggestion-menu button span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sme-suggestion-menu button {
    display: block;
  }

  .sme-suggestion-menu button:hover,
  .sme-suggestion-menu button:focus-visible,
  .channel-suggestion-menu button:hover,
  .channel-suggestion-menu button:focus-visible {
    background: #f7f6f5;
    outline: 0;
  }

  :global(.channel-option-check) {
    align-self: center;
    color: #201c1d;
    height: 16px;
    justify-self: end;
    width: 16px;
  }

  .sme-suggestion-empty,
  .channel-suggestion-empty {
    color: #6a707c;
    font-size: 13px;
    line-height: 1.3;
    padding: 12px;
  }

  .topic-modal__footer {
    border-top: 1px solid #e4e6e8;
    padding: 16px 20px;
  }

  .primary-button {
    background: #201c1d;
    border-radius: 999px;
    color: #fff;
    font-size: 14px;
    min-height: 38px;
    padding: 0 16px;
  }

  .primary-button:hover {
    background: #000;
  }

  .secondary-button {
    font-size: 14px;
    min-height: 38px;
    padding: 0 16px;
  }

  @keyframes topics-loading-dot {
    0%,
    80%,
    100% {
      opacity: 0.35;
      transform: translateY(0) scale(0.85);
    }

    40% {
      opacity: 1;
      transform: translateY(-2px) scale(1);
    }
  }

  @keyframes topics-skeleton-pulse {
    0%,
    100% {
      opacity: 0.55;
    }

    50% {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .row-loader span,
    .skeleton-line,
    .skeleton-chip,
    .skeleton-channel,
    .skeleton-action {
      animation: none;
      opacity: 1;
      transform: none;
    }

    .processing-progress__bar span {
      transition: none;
    }
  }

  @media (max-width: 760px) {
    .topics-header h1 {
      font-size: 27px;
    }

    .topics-row {
      align-items: flex-start;
      grid-template-columns: 1fr;
      gap: 10px;
      padding: 14px 16px;
    }

    .topics-table--topics .topics-row {
      grid-template-columns: 1fr;
    }

    .topics-row--header {
      display: none;
    }

    .topics-section-toolbar {
      align-items: flex-start;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 12px 0;
    }

    .topics-controls {
      flex-wrap: wrap;
      justify-content: flex-start;
    }

    .topics-toolbar-actions {
      flex-wrap: wrap;
      justify-content: flex-start;
      width: 100%;
    }

    .topics-search-control {
      flex: 1 1 100%;
      width: 100%;
    }

    .manage-cell {
      justify-content: flex-start;
    }

    .modal-layer {
      align-items: stretch;
      padding: 18px;
    }

    .topic-modal {
      max-height: calc(100vh - 36px);
    }

    .sme-escalation-list li {
      align-items: flex-start;
      grid-template-columns: 20px 26px minmax(0, 1fr);
    }

    .sme-actions {
      grid-column: 3;
      justify-content: flex-start;
    }
  }
</style>
