import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ViewOptions {
  // Grouping
  groupBy: 'column' | 'priority' | 'assignee' | 'dueDate' | 'none';
  subGroupBy: 'none' | 'priority' | 'assignee';
  orderBy: 'manual' | 'created' | 'updated' | 'priority' | 'dueDate' | 'title';
  orderDirection: 'asc' | 'desc';
  
  // Visibility
  showCompletedCards: boolean;
  showEmptyGroups: boolean;
  showEmptyColumns: boolean;
  showCardIds: boolean;
  
  // Date Format
  dateFormat: 'readable' | 'calendar';
  
  // Display Properties
  displayProperties: {
    priority: boolean;
    assignee: boolean;
    dueDate: boolean;
    labels: boolean;
    description: boolean;
    attachments: boolean;
    createdDate: boolean;
    updatedDate: boolean;
    milestone: boolean;
    estimate: boolean;
  };
  
  // Filters
  activeFilters: {
    priority: string[];
    assignee: string[];
    labels: string[];
    dueDate: 'overdue' | 'today' | 'thisWeek' | 'thisMonth' | 'none';
  };
}

interface ViewOptionsStore {
  // State
  viewOptions: ViewOptions;
  isPanelOpen: boolean;
  
  // Actions
  updateViewOptions: (options: Partial<ViewOptions>) => void;
  resetViewOptions: () => void;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
}

const defaultViewOptions: ViewOptions = {
  groupBy: 'column',
  subGroupBy: 'none',
  orderBy: 'manual',
  orderDirection: 'asc',
  
  showCompletedCards: true,
  showEmptyGroups: true,
  showEmptyColumns: true,
  showCardIds: false,
  
  dateFormat: 'readable',
  
  displayProperties: {
    priority: true,
    assignee: true,
    dueDate: true,
    labels: true,
    description: false,
    attachments: false,
    createdDate: false,
    updatedDate: false,
    milestone: false,
    estimate: false,
  },
  
  activeFilters: {
    priority: [],
    assignee: [],
    labels: [],
    dueDate: 'none',
  },
};

export const useViewOptionsStore = create<ViewOptionsStore>()(
  persist(
    (set) => ({
      viewOptions: defaultViewOptions,
      isPanelOpen: false,
      
      updateViewOptions: (options) => {
        console.log('Updating view options:', options);
        set((state) => {
          const newState = {
            viewOptions: {
              ...state.viewOptions,
              ...options,
              // Handle nested objects properly
              displayProperties: options.displayProperties
                ? { ...state.viewOptions.displayProperties, ...options.displayProperties }
                : state.viewOptions.displayProperties,
              activeFilters: options.activeFilters
                ? { ...state.viewOptions.activeFilters, ...options.activeFilters }
                : state.viewOptions.activeFilters,
            },
          };
          console.log('New view options state:', newState.viewOptions);
          return newState;
        });
      },
      
      resetViewOptions: () =>
        set({ viewOptions: defaultViewOptions }),
      
      openPanel: () => {
        console.log('Opening view options panel');
        set({ isPanelOpen: true });
      },
      closePanel: () => {
        console.log('Closing view options panel');
        set({ isPanelOpen: false });
      },
      togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
    }),
    {
      name: 'ez-track-view-options',
      partialize: (state) => ({ viewOptions: state.viewOptions }),
    }
  )
); 