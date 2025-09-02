import { useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
  resolveComment,
  unresolveComment,
} from "@/apis/commentApis";
import { CommentLexicalEditor } from "./comment-editor";
import { CommentItem } from "./CommentItem";
import { UserContext } from "@/context/UserContext";

interface CommentsSectionProps {
  cardId: number;
  className?: string;
}

export const CommentsSection = ({
  cardId,
  className,
}: CommentsSectionProps) => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);

  // Fetch comments
  const {
    data: comments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["comments", cardId],
    queryFn: () => fetchComments(cardId),
    enabled: !!cardId,
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: ({
      content,
      parentCommentId,
    }: {
      content: string;
      parentCommentId?: number;
    }) => createComment(cardId, { content, parentCommentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", cardId] });
    },
  });

  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: number;
      content: string;
    }) => updateComment(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", cardId] });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", cardId] });
    },
  });

  // Resolve comment mutation
  const resolveCommentMutation = useMutation({
    mutationFn: (commentId: number) => resolveComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", cardId] });
    },
  });

  // Unresolve comment mutation
  const unresolveCommentMutation = useMutation({
    mutationFn: (commentId: number) => unresolveComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", cardId] });
    },
  });

  const handleCreateComment = (content: string) => {
    createCommentMutation.mutate({ content });
  };

  const handleReply = (parentCommentId: number, content: string) => {
    createCommentMutation.mutate({ content, parentCommentId });
  };

  const handleEdit = (commentId: number, content: string) => {
    updateCommentMutation.mutate({ commentId, content });
  };

  const handleDelete = (commentId: number) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const handleResolve = (commentId: number) => {
    resolveCommentMutation.mutate(commentId);
  };

  const handleUnresolve = (commentId: number) => {
    unresolveCommentMutation.mutate(commentId);
  };

  const isAnyMutationLoading =
    createCommentMutation.isPending ||
    updateCommentMutation.isPending ||
    deleteCommentMutation.isPending ||
    resolveCommentMutation.isPending ||
    unresolveCommentMutation.isPending;

  if (error) {
    return (
      <div className={cn("p-4", className)}>
        <div className="text-center text-muted-foreground">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Failed to load comments</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Header */}

      {isLoading ? (
        <div className="flex-1">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </div>
      ) : comments.length === 0 ? (
        <div />
      ) : (
        <div className="flex gap-2 flex-col ">
          {comments
            .sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            )
            .map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={user?.id}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onResolve={handleResolve}
                onUnresolve={handleUnresolve}
                isSubmitting={isAnyMutationLoading}
                cardId={cardId}
              />
            ))}
        </div>
      )}
      {/* Comment Composer */}
      <div className="py-2 flex-1 flex flex-col pb-36">
        <CommentLexicalEditor
          onSubmit={handleCreateComment}
          userAvatar={user?.imageUrl}
          userName={user?.name || user?.username}
          isSubmitting={createCommentMutation.isPending}
        />
      </div>
    </div>
  );
};
