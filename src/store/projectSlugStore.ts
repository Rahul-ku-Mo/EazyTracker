import { create } from 'zustand'

interface ProjectSlugStore {
    currentProjectSlug: string;
    updateCurrentProjectSlug: (projectSlug: string) => void;
}

// Helper functions for sessionStorage
const getStoredProjectSlug = (): string => {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem('currentProjectSlug') || '';
};

const setStoredProjectSlug = (slug: string): void => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem('currentProjectSlug', slug);
};

const useProjectSlugStore = create<ProjectSlugStore>((set) => ({
    currentProjectSlug: getStoredProjectSlug(),
    updateCurrentProjectSlug: (projectSlug: string) => {
        setStoredProjectSlug(projectSlug);
        set({ currentProjectSlug: projectSlug });
    },
}));

export default useProjectSlugStore