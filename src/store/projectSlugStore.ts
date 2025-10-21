import { create } from 'zustand'

interface ProjectSlugStore {
    currentProjectSlug: string;
    updateCurrentProjectSlug: (projectSlug: string) => void;
}

const useProjectSlugStore = create<ProjectSlugStore>((set) => ({
    currentProjectSlug: '',
    updateCurrentProjectSlug: (projectSlug: string) => set({ currentProjectSlug: projectSlug }),
}));

export default useProjectSlugStore