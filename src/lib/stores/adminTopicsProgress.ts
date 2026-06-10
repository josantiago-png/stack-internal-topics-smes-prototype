import { writable } from 'svelte/store';

export type AdminTopicsProgressPhase = 'indexing' | 'detecting' | 'mapping' | 'complete';

export type AdminTopicsProgressState = {
  phase: AdminTopicsProgressPhase;
  elapsedMs: number;
  itemsScanned: number;
  itemsIndexed: number;
  phaseRemainingMs: number;
  mappedTopics: number;
  topicsDetected: number;
  totalItems: number;
  totalTopics: number;
};

const INDEXING_MS = 5000;
const DETECTING_MS = 10000;
const MAPPING_MS = 10000;
const TOTAL_TOPICS = 450;
const ITEMS_INDEXED = 24092;
const TOTAL_MS = INDEXING_MS + DETECTING_MS + MAPPING_MS;

const initialState: AdminTopicsProgressState = {
  phase: 'indexing',
  elapsedMs: 0,
  itemsScanned: 0,
  itemsIndexed: ITEMS_INDEXED,
  phaseRemainingMs: INDEXING_MS,
  mappedTopics: 0,
  topicsDetected: 0,
  totalItems: ITEMS_INDEXED,
  totalTopics: TOTAL_TOPICS,
};

export const adminTopicsProgress = writable<AdminTopicsProgressState>(initialState);

let startedAt = 0;
let interval: ReturnType<typeof setInterval> | undefined;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const stateFromElapsed = (elapsedMs: number): AdminTopicsProgressState => {
  const elapsed = clamp(elapsedMs, 0, TOTAL_MS);

  if (elapsed < INDEXING_MS) {
    return {
      ...initialState,
      elapsedMs: elapsed,
      phaseRemainingMs: INDEXING_MS - elapsed,
    };
  }

  if (elapsed < INDEXING_MS + DETECTING_MS) {
    const detectingElapsed = elapsed - INDEXING_MS;
    const detectingProgress = detectingElapsed / DETECTING_MS;

    return {
      phase: 'detecting',
      elapsedMs: elapsed,
      itemsScanned: Math.min(ITEMS_INDEXED, Math.floor(detectingProgress * ITEMS_INDEXED)),
      itemsIndexed: ITEMS_INDEXED,
      phaseRemainingMs: INDEXING_MS + DETECTING_MS - elapsed,
      mappedTopics: 0,
      topicsDetected: Math.min(TOTAL_TOPICS, Math.floor(detectingProgress * TOTAL_TOPICS)),
      totalItems: ITEMS_INDEXED,
      totalTopics: TOTAL_TOPICS,
    };
  }

  if (elapsed < TOTAL_MS) {
    const mappingElapsed = elapsed - INDEXING_MS - DETECTING_MS;
    const mappingProgress = mappingElapsed / MAPPING_MS;

    return {
      phase: 'mapping',
      elapsedMs: elapsed,
      itemsScanned: ITEMS_INDEXED,
      itemsIndexed: ITEMS_INDEXED,
      phaseRemainingMs: TOTAL_MS - elapsed,
      mappedTopics: Math.min(TOTAL_TOPICS, Math.floor(mappingProgress * TOTAL_TOPICS)),
      topicsDetected: TOTAL_TOPICS,
      totalItems: ITEMS_INDEXED,
      totalTopics: TOTAL_TOPICS,
    };
  }

  return {
    phase: 'complete',
    elapsedMs: TOTAL_MS,
    itemsScanned: ITEMS_INDEXED,
    itemsIndexed: ITEMS_INDEXED,
    phaseRemainingMs: 0,
    mappedTopics: TOTAL_TOPICS,
    topicsDetected: TOTAL_TOPICS,
    totalItems: ITEMS_INDEXED,
    totalTopics: TOTAL_TOPICS,
  };
};

const tick = () => {
  const nextState = stateFromElapsed(Date.now() - startedAt);
  adminTopicsProgress.set(nextState);

  if (nextState.phase === 'complete' && interval) {
    clearInterval(interval);
    interval = undefined;
  }
};

export const startAdminTopicsProgress = () => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!startedAt) {
    startedAt = Date.now();
  }

  tick();

  if (!interval) {
    interval = setInterval(tick, 150);
  }
};

export const isAdminTopicsLoadingPhase = (phase: AdminTopicsProgressPhase) =>
  phase === 'detecting' || phase === 'mapping';
