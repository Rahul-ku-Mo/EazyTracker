import { 
  X, 
  Download, 
  FileText, 
  Image, 
  File,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { UploadIcon } from "@/_components/shared/svg/SharedIcons";
import { useState, useRef } from "react"; 
import { useCardAttachments, useUploadAttachment, useDeleteAttachment, Attachment } from "@/hooks/useAttachments";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AttachmentsSectionProps {
  slug: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  id: string;
}

export const AttachmentsSection = ({ slug }: AttachmentsSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TanStack Query hooks
  const { data: attachments = [], isLoading, error, refetch } = useCardAttachments(slug);
  const uploadMutation = useUploadAttachment(slug);
  const deleteMutation = useDeleteAttachment(slug);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="size-4 text-blue-500" />;
    } else if (type.includes('pdf') || type.includes('document')) {
      return <FileText className="size-4 text-emerald-500" />;
    } else {
      return <File className="size-4 text-gray-500" />;
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    for (const file of Array.from(files)) {
      const uploadId = `${Date.now()}-${Math.random()}`;
      
      // Add file to uploading list
      setUploadingFiles(prev => [...prev, {
        file,
        progress: 0,
        status: 'uploading',
        id: uploadId
      }]);

      try {
        // Start upload with progress simulation
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => prev.map(f => 
            f.id === uploadId 
              ? { ...f, progress: Math.min(f.progress + Math.random() * 20, 90) }
              : f
          ));
        }, 200);

        // Perform actual upload
        await uploadMutation.mutateAsync(file);

        // Complete progress and mark as success
        clearInterval(progressInterval);
        setUploadingFiles(prev => prev.map(f => 
          f.id === uploadId 
            ? { ...f, progress: 100, status: 'success' }
            : f
        ));

        // Remove from uploading list after delay
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
        }, 2000);

        toast.success(`${file.name} uploaded successfully!`);
        
      } catch (error) {
        // Mark as error
        setUploadingFiles(prev => prev.map(f => 
          f.id === uploadId 
            ? { ...f, status: 'error' }
            : f
        ));

        toast.error(`Failed to upload ${file.name}`);
        console.error("Error uploading attachment:", error);

        // Remove from uploading list after delay
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
        }, 3000);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    try {
      await deleteMutation.mutateAsync(attachmentId);
      toast.success("Attachment deleted successfully");
    } catch (error) {
      toast.error("Failed to delete attachment");
      console.error('Error removing attachment:', error);
    }
  };

  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  const displayAttachments = isExpanded ? attachments : attachments.slice(0, 2);
  const hasUploading = uploadingFiles.length > 0;

  if (error) {
    return (
      <div className="p-2 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-red-500" />
            <span className="text-sm font-medium text-red-500">
              Error loading attachments
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="text-sm"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
      
          <span className="text-sm font-medium text-primary">
            Attachments
          </span>
          {attachments.length > 0 && (
            <span className="text-sm text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {attachments.length}
            </span>
          )}
          {hasUploading && (
            <div className="flex items-center gap-1">
              <Loader2 className="size-3 animate-spin text-blue-500" />
              <span className="text-sm text-blue-500">
                {uploadingFiles.length} uploading
              </span>
            </div>
          )}
        </div>
        {attachments.length > 2 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {isExpanded ? 'Show less' : `+${attachments.length - 2} more`}
          </button>
        )}
      </div>

      {/* File Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-md p-3 text-center transition-all cursor-pointer",
          isDragOver 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-muted-foreground/30 hover:border-primary/50',
          uploadMutation.isPending && "opacity-50 pointer-events-none"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          accept="*/*"
          disabled={uploadMutation.isPending}
        />
        <div className="flex flex-col items-center gap-2">
          {uploadMutation.isPending ? (
            <Loader2 className="size-5 animate-spin text-primary" />
          ) : (
            <UploadIcon className="size-5 text-muted-foreground" />
          )}
          <div className="text-xs">
            {uploadMutation.isPending ? (
              <span className="text-primary font-medium">Uploading...</span>
            ) : (
              <>
                <span className="text-primary font-medium">Click to upload</span>
                <span className="text-muted-foreground"> or drag files here</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Uploading Files Progress */}
      {hasUploading && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Uploading files...
          </div>
          {uploadingFiles.map((uploadingFile) => (
            <div
              key={uploadingFile.id}
              className="flex items-center gap-2 p-2 rounded-md bg-muted/20 border"
            >
              {uploadingFile.status === 'uploading' && (
                <Loader2 className="size-3 animate-spin text-blue-500" />
              )}
              {uploadingFile.status === 'success' && (
                <CheckCircle className="size-3 text-green-500" />
              )}
              {uploadingFile.status === 'error' && (
                <AlertCircle className="size-3 text-red-500" />
              )}
              
              <div className="flex-1 min-w-0 space-y-1">
                <div className="text-sm font-medium truncate" title={uploadingFile.file.name}>
                  {uploadingFile.file.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatFileSize(uploadingFile.file.size)}
                </div>
                {uploadingFile.status === 'uploading' && (
                  <Progress value={uploadingFile.progress} className="h-1" />
                )}
                {uploadingFile.status === 'success' && (
                  <div className="text-sm text-green-600">Upload complete!</div>
                )}
                {uploadingFile.status === 'error' && (
                  <div className="text-sm text-red-600">Upload failed</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attachments List */}
      <div className="space-y-2 max-h-[72px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading attachments...
            </span>
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-xs text-muted-foreground text-left">
            No attachments yet
          </div>
        ) : (
          displayAttachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-2 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors group"
            >
              {getFileIcon(attachment.mimeType)}
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" title={attachment.fileName}>
                  {attachment.fileName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.fileSize)}
                  {attachment.user && (
                    <span className="ml-1">• Uploaded by {attachment.user.name || attachment.user.username}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDownload(attachment);
                  }}
                  className="h-6 w-6 p-0 hover:bg-primary/10"
                  title="Download file"
                >
                  <Download className="size-3 text-muted-foreground hover:text-primary" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveAttachment(attachment.id);
                  }}
                  disabled={deleteMutation.isPending}
                  className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
                  title="Remove file"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="size-3 animate-spin text-muted-foreground" />
                  ) : (
                    <X className="size-3 text-muted-foreground hover:text-red-500" />
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};