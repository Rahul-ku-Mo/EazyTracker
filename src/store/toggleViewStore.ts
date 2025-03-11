import { create } from 'zustand';

interface ToggleViewState {
  view: 'kanban' | 'table';
  toggleView: () => void;
}

const useToggleViewStore = create<ToggleViewState>((set) => ({
  view: 'kanban',
  toggleView: () => set((state) => ({view: state.view === 'kanban' ? 'table' : 'kanban'}))
}));

export default useToggleViewStore