import { 
  Paperclip, 
  Plus, 
  X, 
  Download, 
  Eye, 
  FileText, 
  Image, 
  File,
  Upload
} from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useCardMutation } from "../../../_mutations/useCardMutations";

interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
  uploadedBy?: string;
}

interface AttachmentsSectionProps {
  cardId: number;
  attachments?: Attachment[];
}

export const AttachmentsSection = ({ 
  cardId, 
  attachments = [] 
}: AttachmentsSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateCardMutation } = useCardMutation();

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
      return <FileText className="size-4 text-red-500" />;
    } else {
      return <File className="size-4 text-gray-500" />;
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    // Convert FileList to Array and process each file
    Array.from(files).forEach(file => {
      // In a real implementation, you would upload the file to your server
      // For now, we'll create a mock attachment
      const newAttachment: Attachment = {
        id: `temp-${Date.now()}-${Math.random()}`,
        name: file.name,
        url: URL.createObjectURL(file), // Temporary URL for preview
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
      };

      // Update the card with new attachment
      // This would need to be implemented in your API
      console.log('New attachment:', newAttachment);
      
      // For demo purposes, you might want to update local state
      // In real implementation, trigger mutation to save to server
    });
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

  const handleRemoveAttachment = (attachmentId: string) => {
    // In real implementation, call API to remove attachment
    console.log('Remove attachment:', attachmentId);
    
    // Update card attachments
    // updateCardMutation.mutate({ 
    //   cardId, 
    //   attachments: attachments.filter(a => a.id !== attachmentId).map(a => a.id)
    // });
  };

  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (attachment: Attachment) => {
    window.open(attachment.url, '_blank');
  };

  const displayAttachments = isExpanded ? attachments : attachments.slice(0, 2);

  return (
    <div className="space-y-3 rounded-md p-2 dark:bg-[#101010]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip
            strokeWidth={3}
            className="size-4 text-primary"
          />
          <span className="text-xs font-medium text-primary">
            Attachments
          </span>
          {attachments.length > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {attachments.length}
            </span>
          )}
        </div>
        {attachments.length > 2 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {isExpanded ? 'Show less' : `+${attachments.length - 2} more`}
          </button>
        )}
      </div>

      {/* File Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-md p-3 text-center transition-colors cursor-pointer
          ${isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/30 hover:border-primary/50'
          }
        `}
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
        />
        <div className="flex flex-col items-center gap-2">
          <Upload className="size-5 text-muted-foreground" />
          <div className="text-xs">
            <span className="text-primary font-medium">Click to upload</span>
            <span className="text-muted-foreground"> or drag files here</span>
          </div>
        </div>
      </div>

      {/* Attachments List */}
      <div className="space-y-2">
        {attachments.length === 0 ? (
          <div className="text-xs text-muted-foreground py-2 text-center">
            No attachments yet
          </div>
        ) : (
          displayAttachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-2 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors group"
            >
              {getFileIcon(attachment.type)}
              
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate" title={attachment.name}>
                  {attachment.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.size)}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handlePreview(attachment)}
                  className="p-1 hover:bg-primary/10 rounded transition-colors"
                  title="Preview"
                >
                  <Eye className="size-3 text-muted-foreground hover:text-primary" />
                </button>
                <button
                  onClick={() => handleDownload(attachment)}
                  className="p-1 hover:bg-primary/10 rounded transition-colors"
                  title="Download"
                >
                  <Download className="size-3 text-muted-foreground hover:text-primary" />
                </button>
                <button
                  onClick={() => handleRemoveAttachment(attachment.id)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                  title="Remove"
                >
                  <X className="size-3 text-muted-foreground hover:text-red-500" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {attachments.length > 0 && (
        <div className="pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Total: {attachments.reduce((sum, att) => sum + att.size, 0)} bytes
          </div>
        </div>
      )}
    </div>
  );
};
