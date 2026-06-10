import { writable } from 'svelte/store';

// Incrementing this triggers a new chat in +page.svelte
export const newChatSignal = writable(0);
