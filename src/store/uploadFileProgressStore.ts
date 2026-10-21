import { create } from "zustand";

interface UploadFileProgressState {
  imageUploadStatusMap: Map<string, "uploading" | "completed" | "failed">;
  setImageUploadStatusMap: (status: Map<string, "uploading" | "completed" | "failed">) => void;
}

export const useUploadFileProgressStore = create<UploadFileProgressState>((set) => ({
  imageUploadStatusMap: new Map(),
  setImageUploadStatusMap: (status) => set({ imageUploadStatusMap: status }),
}));


interface UploadAttachmentProgressState {
  attachmentUploadStatusMap: Map<string, "uploading" | "completed" | "failed">;
  setAttachmentUploadStatusMap: (status: Map<string, "uploading" | "completed" | "failed">) => void;
}

export const useUploadAttachmentProgressStore = create<UploadAttachmentProgressState>((set) => ({
  attachmentUploadStatusMap: new Map(),
  setAttachmentUploadStatusMap: (status) => set({ attachmentUploadStatusMap: status }),
}));