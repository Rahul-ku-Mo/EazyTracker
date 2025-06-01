import { create } from 'zustand';

interface ToggleViewState {
  view: 'kanban' | 'listview';
  toggleView: () => void;
}

// Helper functions for localStorage
const getStoredView = (): 'kanban' | 'listview' => {
  try {
    const stored = localStorage.getItem('eztrack-view-type');
    return stored === 'listview' ? 'listview' : 'kanban';
  } catch {
    return 'kanban';
  }
};

const setStoredView = (view: 'kanban' | 'listview') => {
  try {
    localStorage.setItem('eztrack-view-type', view);
  } catch {
    // Silently fail if localStorage is not available
  }
};

const useToggleViewStore = create<ToggleViewState>((set) => ({
  view: getStoredView(),
  toggleView: () => set((state) => {
    const newView = state.view === 'kanban' ? 'listview' : 'kanban';
    setStoredView(newView);
    return { view: newView };
  })
}));

export default useToggleViewStore