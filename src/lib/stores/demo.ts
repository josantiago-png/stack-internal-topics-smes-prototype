import { writable } from 'svelte/store';

export const selectedDemoId = writable<string | null>(null);
