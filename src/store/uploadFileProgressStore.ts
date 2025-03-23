import { create } from "zustand";

interface UploadFileProgressState {
  imageUploadStatusMap: Map<string, "uploading" | "completed" | "failed">;
  setImageUploadStatusMap: (status: Map<string, "uploading" | "completed" | "failed">) => void;
}

export const useUploadFileProgressStore = create<UploadFileProgressState>((set) => ({
  imageUploadStatusMap: new Map(),
  setImageUploadStatusMap: (status) => set({ imageUploadStatusMap: status }),
}));
