import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import axios from 'axios';

export interface Attachment {
  id: string;
  fileName: string;
  url: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    username: string;
  };
}

// API functions
const getCardAttachments = async (slug: string): Promise<Attachment[]> => {
  const response = await api.get(`/aws/attachments/${slug}`);
  return response.data.attachments || [];
};

const uploadAttachment = async ({ fileName, fileType, slug }: {
  fileName: string;
  fileType: string;
  slug: string;
}) => {
  const response = await api.post('/aws/upload-attachment', {
    fileName,
    fileType,
    slug,
  });
  return response.data;
};

const uploadToS3 = async ({ preSignedUrl, file }: {
  preSignedUrl: string;
  file: File;
}) => {
  await axios.put(preSignedUrl, file);
};

const confirmAttachmentUpload = async ({ key, fileName, fileSize, mimeType, slug }: {
  key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  slug: string;
}) => {
  const response = await api.post('/aws/upload-attachment-confirm', {
    key,
    fileName,
    fileSize,
    mimeType,
    slug,
  });
  return response.data;
};

const deleteAttachment = async (attachmentId: string) => {
  await api.delete(`/aws/attachment/${attachmentId}`);
};

// Custom hooks
export const useCardAttachments = (slug: string) => {
  return useQuery({
    queryKey: ['attachments', slug],
    queryFn: () => getCardAttachments(slug),
    enabled: !!slug,
  });
};

export const useUploadAttachment = (slug: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      // Step 1: Get pre-signed URL
      const uploadResponse = await uploadAttachment({
        fileName: file.name,
        fileType: file.type,
        slug,
      });

      const { preSignedUrl, key } = uploadResponse;

      // Step 2: Upload to S3
      await uploadToS3({ preSignedUrl, file });

      // Step 3: Confirm upload and save to database
      await confirmAttachmentUpload({
        key,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        slug,
      });

      return { fileName: file.name, fileSize: file.size };
    },
    onSuccess: () => {
      // Invalidate and refetch attachments
      queryClient.invalidateQueries({ queryKey: ['attachments', slug] });
    },
  });
};

export const useDeleteAttachment = (slug: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAttachment,
    onSuccess: () => {
      // Invalidate and refetch attachments
      queryClient.invalidateQueries({ queryKey: ['attachments', slug] });
    },
  });
};
