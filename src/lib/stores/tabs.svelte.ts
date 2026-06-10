export type TabMeta = { id: number; label: string };

let _tabs = $state<TabMeta[]>([
  { id: 1, label: 'New chat' },
]);
let _activeTabId = $state(1);
let _tabCounter = 2;

export const tabsState = {
  get tabs() { return _tabs; },
  get activeTabId() { return _activeTabId; },

  newTab(): number {
    const id = _tabCounter++;
    _tabs = [{ id, label: 'New chat' }, ..._tabs];
    _activeTabId = id;
    return id;
  },

  renameTab(id: number, label: string) {
    _tabs = _tabs.map(t => t.id === id ? { ...t, label } : t);
  },

  setActiveTab(id: number) {
    _activeTabId = id;
  },

  closeTab(id: number): number {
    if (_tabs.length === 1) {
      _tabs = [{ ..._tabs[0], label: 'New chat' }];
      return _tabs[0].id;
    }
    const idx = _tabs.findIndex(t => t.id === id);
    const next = _tabs[idx - 1] ?? _tabs[idx + 1];
    _tabs = _tabs.filter(t => t.id !== id);
    if (id === _activeTabId) {
      _activeTabId = next.id;
    }
    return _activeTabId;
  },
};
