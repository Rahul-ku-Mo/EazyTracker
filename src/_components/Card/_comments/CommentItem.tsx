import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Reply,
  Edit2,
  Trash2,
  Check,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Comment } from "@/apis/commentApis";
import { CommentLexicalEditor } from "./comment-editor";
import { CommentRenderer } from "./CommentRenderer";
import { useReplyEditor, useEditEditor } from "@/store/commentReplyStore";

import { timeAgoShort } from "@/utils";
import { Separator } from "@/components/ui/separator";

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onReply: (parentId: number, content: string) => void;
  onEdit: (commentId: number, content: string) => void;
  onDelete: (commentId: number) => void;
  onResolve: (commentId: number) => void;
  onUnresolve: (commentId: number) => void;
  isSubmitting?: boolean;
  level?: number;
  cardId: number; // Added to support the store
}

export const CommentItem = ({
  comment,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onResolve,
  onUnresolve,
  isSubmitting = false,
  level = 0,
  cardId,
}: CommentItemProps) => {
  const [showReplies, setShowReplies] = useState(true);
  const [isResolvedExpanded, setIsResolvedExpanded] = useState(false);
  const isAuthor = comment.userId === currentUserId;
  const hasReplies = comment.replies && comment.replies.length > 0;

  // Use the store for reply and edit state management
  const replyEditor = useReplyEditor(cardId, comment.id);
  const editEditor = useEditEditor(cardId, comment.id);

  const isReplying = replyEditor.isActive;
  const isEditing = editEditor.isActive;

  const handleReply = (content: string) => {
    onReply(comment.id, content);
    replyEditor.deactivate();
  };

  const handleReplyClick = () => {
    replyEditor.activate();
    // If there are replies but they're hidden, show them when starting to reply
    if (hasReplies && !showReplies) {
      setShowReplies(true);
    }
  };

  const handleEdit = (content: string) => {
    onEdit(comment.id, content);
    editEditor.deactivate();
  };

  const handleEditClick = () => {
    editEditor.activate();
  };

  const handleCancelReply = () => {
    replyEditor.deactivate();
  };

  const handleCancelEdit = () => {
    editEditor.deactivate();
  };

  const timeAgo = timeAgoShort(new Date(comment.createdAt));

  const wasEdited = comment.updatedAt !== comment.createdAt;

  return (
    <div className={cn("group relative", comment.isResolved && "opacity-60")}>
      {/* Comment Content */}
      <div
        className={cn(
          "flex flex-col gap-2 p-2 rounded-md transition-all duration-200",
          "border rounded-sm dark:bg-black bg-[#fafafa]",
          comment.isResolved
            ? "border border-green-200/20 dark:border-green-800/20"
            : "border border-border/40",

          level > 0 && "border-none p-0 py-2"
        )}
      >
        <div className="flex items-start gap-3">
          <Avatar className="w-7 h-7 shrink-0 mt-0.5">
            <AvatarImage src={comment.user.imageUrl} alt={comment.user.name} />
            <AvatarFallback className="text-xs">
              {comment.user.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1 justify-between">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">
                  {comment.user.name || comment.user.username}
                </div>
                <div className="text-xs text-muted-foreground">
                  {timeAgo}
                  {wasEdited && " (edited)"}
                </div>
              </div>

              {/* Actions Dropdown - positioned on the right */}
              {!isEditing && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="size-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    {/* Reply option for top-level comments only */}
                    {level === 0 && !comment.isResolved && (
                      <DropdownMenuItem
                        onClick={handleReplyClick}
                        className="text-xs"
                      >
                        <Reply className="size-3 mr-2" />
                        Reply
                      </DropdownMenuItem>
                    )}

                    {/* Resolve/Unresolve options */}
                    {!comment.isResolved ? (
                      <DropdownMenuItem
                        onClick={() => onResolve(comment.id)}
                        disabled={isSubmitting}
                        className="text-xs text-green-600 focus:text-green-600"
                      >
                        <Check className="size-3 mr-2" />
                        Resolve
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => onUnresolve(comment.id)}
                        disabled={isSubmitting}
                        className="text-xs text-orange-600 focus:text-orange-600"
                      >
                        <RotateCcw className="size-3 mr-2" />
                        Unresolve
                      </DropdownMenuItem>
                    )}

                    {/* Edit and Delete options for comment author */}
                    {isAuthor && (
                      <>
                        <DropdownMenuItem
                          onClick={handleEditClick}
                          className="text-xs"
                        >
                          <Edit2 className="size-3 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(comment.id)}
                          className="text-xs text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Content */}
            {isEditing ? (
              <CommentLexicalEditor
                onSubmit={handleEdit}
                onCancel={handleCancelEdit}
                initialContent={comment.content}
                isEditing={true}
                autoFocus={true}
                isSubmitting={isSubmitting}
                id={comment.id}
                isReply={comment.parentCommentId !== undefined}
              />
            ) : comment.isResolved && !isResolvedExpanded ? (
              <div
                className="flex items-center gap-2 py-1 cursor-pointer hover:bg-muted/20 rounded transition-colors w-fit"
                onClick={() => setIsResolvedExpanded(true)}
              >
                {comment.isResolved && (
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Resolved</span>
                    {comment.resolvedBy && (
                      <span className="text-muted-foreground">
                        by {comment.resolvedBy.name}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <CommentRenderer content={comment.content} />
                {comment.isResolved && isResolvedExpanded && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsResolvedExpanded(false)}
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground mt-2"
                  >
                    Collapse resolved comment
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          {hasReplies && (
            <div className="mt-2">
              {/* Replies list */}
              {showReplies && (
                <div className="space-y-2">
                  {comment
                    .replies!.sort(
                      (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                    )
                    .map((reply) => (
                      <Fragment key={reply.id}>
                        <Separator />
                        <CommentItem
                          key={reply.id}
                          comment={reply}
                          currentUserId={currentUserId}
                          onReply={onReply}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onResolve={onResolve}
                          onUnresolve={onUnresolve}
                          isSubmitting={isSubmitting}
                          level={level + 1}
                          cardId={cardId}
                        />
                      </Fragment>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Reply Editor - appears after all replies */}
          {isReplying && (
            <div className="mt-2">
              <Separator />
              <CommentLexicalEditor
                onSubmit={handleReply}
                onCancel={handleCancelReply}
                isReply={true}
                autoFocus={true}
                placeholder="Write a reply..."
                isSubmitting={isSubmitting}
                id={comment.id}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
