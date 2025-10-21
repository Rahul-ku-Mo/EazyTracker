import { useState } from "react";
import {
  X,
  MessageSquare,
  CircleCheck,
  RotateCcw,
  CircleArrowOutUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/context/ThemeProvider";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  resolved: boolean;
}

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        text: newComment,
        author: "You",
        timestamp: new Date(),
        resolved: false,
      };
      setComments([...comments, comment]);
      setNewComment("");
    }
  };

  const resolveComment = (commentId: string) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? { ...comment, resolved: !comment.resolved }
          : comment
      )
    );
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className={`fixed right-0 top-0 h-full w-80 border-l shadow-lg z-40 ${
        isDark ? "bg-zinc-900 border-zinc-700" : "bg-white border-zinc-200"
      }`}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{
        type: "spring",
        damping: 30,
        stiffness: 300,
        duration: 0.3,
      }}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 border-b ${
          isDark ? "border-zinc-700" : "border-zinc-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold">Comments</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Add Comment Section */}
          <div className="space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.1 }}
            >
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                size="sm"
                className="w-full"
              >
                Add Comment
              </Button>
            </motion.div>
          </div>

          {/* Comments Timeline */}
          <div className="relative">
            {comments.length === 0 ? (
              <div
                className={`text-center py-8 ${
                  isDark ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No comments yet</p>
                <p className="text-xs mt-1">
                  Add a comment to start the discussion
                </p>
              </div>
            ) : (
              <>
                {/* Comments */}
                <AnimatePresence mode="popLayout">
                  {comments
                    .sort(
                      (a, b) =>
                        new Date(b.timestamp).getTime() -
                        new Date(a.timestamp).getTime()
                    )
                    .map((comment, index) => (
                      <motion.div
                        key={comment.id}
                        className="relative pl-10 mb-4"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.04, 0.62, 0.23, 0.98],
                          layout: { duration: 0.2 },
                          delay: index * 0.05,
                        }}
                        layout
                      >
                        {/* Timeline line */}
                        <div
                          className={cn(
                            "absolute left-3.5 top-7 bottom-2 w-0.5",
                            isDark ? "bg-zinc-700" : "bg-zinc-200",
                            comment.resolved ? "bg-green-500" : "bg-blue-500"
                          )}
                        ></div>

                        {/* Timeline icon */}
                        {comment.resolved ? (
                          <CircleCheck
                            strokeWidth={4}
                            className={`absolute left-2.5 top-3 size-3 ${
                              isDark ? "text-green-500" : "text-green-600"
                            }`}
                          />
                        ) : (
                          <CircleArrowOutUpRight
                            strokeWidth={4}
                            className={`absolute left-2.5 top-3 size-3 ${
                              isDark ? "text-blue-500" : "text-blue-600"
                            }`}
                          />
                        )}

                        {/* Comment content */}
                        <div
                          className={`rounded-lg p-3 ${
                            comment.resolved
                              ? isDark
                                ? "bg-green-900/10"
                                : "bg-green-50"
                              : isDark
                                ? "bg-zinc-800/50"
                                : "bg-zinc-50"
                          }`}
                        >
                          {/* Comment header */}
                          <div className="flex items-start gap-3 mb-2">
                            <div
                              className={`size-7 rounded-full flex items-center justify-center text-xs font-medium ${
                                isDark
                                  ? "bg-zinc-700 text-zinc-300"
                                  : "bg-zinc-200 text-zinc-700"
                              }`}
                            >
                              {comment.author.charAt(0).toUpperCase()}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-sm font-medium ${
                                    isDark ? "text-zinc-200" : "text-zinc-800"
                                  }`}
                                >
                                  {comment.author}
                                </span>
                                {comment.resolved && (
                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                      isDark
                                        ? "bg-green-900/30 text-green-400"
                                        : "bg-green-100 text-green-700"
                                    }`}
                                  >
                                    <div className="w-1.5 h-1.5 bg-current rounded-full" />
                                    Resolved
                                  </span>
                                )}
                              </div>
                              <span
                                className={`text-xs ${
                                  isDark ? "text-zinc-400" : "text-zinc-500"
                                }`}
                              >
                                {comment.timestamp.toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                                ,{" "}
                                {comment.timestamp.toLocaleTimeString("en-US", {
                                  hour12: false,
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Comment body */}
                          <div className="pl-10">
                            <p
                              className={`text-xs leading-relaxed mb-3 ${
                                comment.resolved
                                  ? "line-through opacity-60"
                                  : ""
                              } ${isDark ? "text-zinc-300" : "text-zinc-700"}`}
                            >
                              {comment.text}
                            </p>

                            {/* Actions */}
                            <div className="flex justify-end">
                              {comment.resolved ? (
                                <button
                                  onClick={() => resolveComment(comment.id)}
                                  className={`p-1.5 rounded-md transition-colors ${
                                    isDark
                                      ? "text-green-400 hover:text-green-300 hover:bg-green-900/20"
                                      : "text-green-600 hover:text-green-700 hover:bg-green-100"
                                  }`}
                                  title="Unresolve comment"
                                >
                                  <RotateCcw className="size-3" />
                                </button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => resolveComment(comment.id)}
                                  className={`h-6 px-2 text-xs ${
                                    isDark
                                      ? "text-zinc-400 hover:text-zinc-300 hover:bg-zinc-700/50"
                                      : "text-zinc-600 hover:text-zinc-700 hover:bg-zinc-100"
                                  }`}
                                >
                                  Resolve
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RightPanel;
