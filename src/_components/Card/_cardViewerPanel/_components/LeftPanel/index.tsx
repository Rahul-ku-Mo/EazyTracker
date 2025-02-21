import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../../../components/ui/button";
import { Plus, MessageSquare, Star, Sparkles } from "lucide-react";

import ChatInterface from "./ChatInterface";
import ConversationSkeleton from "./ConversationSkeleton";

import useConversation from "./useConversation";
const LeftPanel = () => {
  const {
    conversations,
    isLoading,
    selectedConversationId,
    createConversation,
    setSelectedConversationId,
  } = useConversation();

  return (
    <div className="flex flex-col h-full">
      {/* Header and New Conversation Button */}
      <div className="p-4 border-b dark:border-zinc-700">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 text-sm font-semibold dark:text-zinc-200"
        >
          EazyAI Conversations
        </motion.h3>
        <Button
          className="w-full gap-1"
          onClick={() => createConversation.mutate()}
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </Button>
      </div>

      {selectedConversationId ? (
        <div className="flex-1 min-h-0">
          <ChatInterface
            title={
              conversations?.find(
                (conversation: any) =>
                  conversation.id === selectedConversationId
              )?.title
            }
            conversationId={selectedConversationId}
            setConversationId={setSelectedConversationId}
          />
        </div>
      ) : (
        <div className="relative flex-1">
          {isLoading ? (
            <div className="flex p-4 space-x-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-shrink-0 w-64">
                  <ConversationSkeleton />
                </div>
              ))}
            </div>
          ) : conversations?.length > 0 ? (
            <div className="h-full py-4 overflow-y-auto">
              <div className="flex flex-wrap min-w-full gap-2 px-4">
                <AnimatePresence>
                  {conversations?.map((conversation: any, index: number) => (
                    <motion.div
                      key={conversation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.1,
                      }}
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={`w-full p-4 border-2 dark:border-zinc-700 border-dashed rounded-lg cursor-pointer transition-all ease-linear hover:shadow-md  ${
                        selectedConversationId === conversation.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="flex-1 mr-2 text-sm font-medium truncate dark:text-zinc-200">
                          {conversation.title || "New Chat"}
                        </h4>
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className="flex-shrink-0 transition-colors border-yellow-400 text-zinc-400 hover:text-yellow-400"
                        >
                          <Star
                            className="w-4 h-4"
                            fill={
                              conversation.isFavorite
                                ? "rgb(250 204 21)"
                                : "none"
                            }
                          />
                        </motion.button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <MessageSquare className="flex-shrink-0 w-3 h-3 mr-2 text-blue-500" />
                          <span className="text-xs text-muted-foreground">
                            {conversation.messageCount} Messages
                          </span>
                        </div>
                        {conversation.lastMessage && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {conversation.lastMessage}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ opacity: 1, scale: 1, rotate: 360 }}
                  transition={{ duration: 0.8, ease: "linear" }}
                  className="inline-block"
                >
                  <Sparkles className="w-8 h-8 text-zinc-800 dark:text-zinc-200" />
                </motion.div>
                <h3 className="text-2xl font-bold tracking-tight max-w-40 dark:text-zinc-200">
                  Get started with Eaze AI
                </h3>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeftPanel;
