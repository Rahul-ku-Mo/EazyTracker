import { useRef, useEffect, useState } from "react";
import { Send, MoveLeftIcon, StopCircle } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import AIReplyEditorView from "./AIReplyEditorView";
import { useGeminiStream } from "./useGeminiStream";

interface Message {
  role: "user" | "model";
  content: string;
}

interface ChatInterfaceProps {
  conversationId?: string;
  title?: string;
  setConversationId: (id: string) => void;
}

const ChatInterface = ({
  conversationId,
  setConversationId,
  title,
}: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const accessToken = Cookies.get("accessToken");
  const eventSourceRef = useRef<EventSource | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Use Gemini stream hook with conversationId
  const {
    response,
    isStreaming: streamIsStreaming,
    error,
    submitPrompt,
    stopStream
  } = useGeminiStream(`${import.meta.env.VITE_API_URL}/ai/chat/stream`, conversationId || "");

  const { data: messages = [], isPending } = useQuery({
    queryKey: ["ai-chat-messages", conversationId],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/ai/chat/${conversationId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data.data || [];
    },
    enabled: !!conversationId,
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    const scrollTimeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    return () => clearTimeout(scrollTimeout);
  }, [messages, response]);

  // Handle new streaming responses
  useEffect(() => {
    if (response && conversationId) {
      queryClient.setQueryData(
        ["ai-chat-messages", conversationId],
        (old: Message[] = []) => {
          const messages = [...old];
          const lastMessage = messages[messages.length - 1];

          if (lastMessage?.role === "model") {
            messages[messages.length - 1] = {
              ...lastMessage,
              content: response,
            };
          } else {
            messages.push({
              role: "model",
              content: response,
            });
          }
          return messages;
        }
      );
    }
  }, [response, conversationId, queryClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message to chat immediately
    queryClient.setQueryData(
      ["ai-chat-messages", conversationId],
      (old: Message[] = []) => [...old, { role: "user", content: userMessage }]
    );

    try {
      // Make sure to cancel previous requests before starting new ones
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      // Track request state properly to prevent duplicate requests
      // Only start a new request if not currently streaming
      if (!streamIsStreaming) {
        setIsStreaming(true);
        // Begin new request...
        await submitPrompt(userMessage);
      }
      
      // When streaming completes, refresh messages from server
      if (!streamIsStreaming && conversationId) {
        queryClient.invalidateQueries({
          queryKey: ["ai-chat-messages", conversationId],
        });
      }
    } catch (err) {
      console.error("Chat error:", err);
      queryClient.setQueryData(
        ["ai-chat-messages", conversationId],
        (old: Message[] = []) => [
          ...old,
          {
            role: "model",
            content: "Sorry, an error occurred. Please try again.",
          },
        ]
      );
    }
  };

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="relative flex items-center px-4 py-2">
        <MoveLeftIcon
          className="z-20 w-4 h-4 rounded-full cursor-pointer"
          strokeWidth={2}
          onClick={() => setConversationId("")}
        />
        <div className="absolute inset-0 text-sm font-bold tracking-tight text-center top-1.5 z-10">
          {title}
        </div>
      </div>
      {isPending ? (
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col space-y-4">
              <div className="flex justify-start">
                <div className="w-[60%] h-16 rounded-lg bg-muted animate-pulse" />
              </div>
              <div className="flex justify-end">
                <div className="w-[40%] h-12 rounded-lg bg-primary/20 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((message: Message, index: number) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-2.5 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted dark:bg-zinc-900"
                }`}
              >
                {message.role === "model" ? (
                  <AIReplyEditorView content={message.content} isStreaming={streamIsStreaming} />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
      <form onSubmit={handleSubmit} className="p-4 border-t dark:border-zinc-700">
        <div className="flex flex-col space-y-2">
          <textarea
            value={input}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your prompt here..."
            className="flex-1 min-w-0 px-3 py-2 text-sm border rounded-md min-h-9 h-20 max-h-[312px] resize-y border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2"
            disabled={isStreaming}
            rows={3}
          />
          <div className="flex justify-end space-x-2">
            <Button 
              type="submit" 
              disabled={isStreaming || !input.trim()}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isStreaming ? 'Streaming...' : <Send className="w-4 h-4" />}
            </Button>
            
            {streamIsStreaming && (
              <Button 
                type="button"
                variant="destructive"
                onClick={stopStream}
                className="flex items-center gap-1"
              >
                <StopCircle className="w-4 h-4" />
                Stop
              </Button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-md">
            Error: {error.message}
          </div>
        )}
      </form>
    </div>
  );
};

export default ChatInterface;