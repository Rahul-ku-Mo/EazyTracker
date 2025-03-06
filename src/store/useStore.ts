import { create } from 'zustand'

interface ViewState {
  view: 'table' | 'kanban'
  setView: (view: 'table' | 'kanban') => void
}

export const useStore = create<ViewState>((set) => ({
  view: 'kanban',
  setView: (view) => set({ view }),
})) 