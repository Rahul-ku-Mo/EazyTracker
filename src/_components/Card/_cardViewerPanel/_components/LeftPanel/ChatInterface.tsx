import { useRef, useEffect, useState } from "react";
import { Send, MoveLeftIcon } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import AIReplyEditorView from "./AIReplyEditorView";

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
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  
  // Query for fetching messages
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

  // Mutation for sending messages
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      // Optimistically update messages
      queryClient.setQueryData(
        ["ai-chat-messages", conversationId],
        (old: Message[] = []) => [...old, { role: "user", content: message }]
      );

      let currentResponse = "";

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/ai/chat/stream`,
        {
          message,
          conversationId,
        },
        {
          responseType: "stream",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          onDownloadProgress: (progressEvent) => {
            const chunk = progressEvent.event.target.response;
            setIsStreaming(true);
            
            if (!chunk) {
              setIsStreaming(false);
              return;
            }

            const lines = chunk.split("\n");

            lines.forEach((line: string) => {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));

                  if (data.error) {
                    setIsStreaming(false);
                    console.error("SSE Error:", data.error);
                    return;
                  }

                  if (data.done) {
                    setIsStreaming(false);
                    queryClient.invalidateQueries({
                      queryKey: ["ai-chat-messages", conversationId],
                    });
                    return;
                  }

                  if (data.chunk) {
                    currentResponse += data.chunk;
                    // Update the messages with the accumulated response
                    queryClient.setQueryData(
                      ["ai-chat-messages", conversationId],
                      (old: Message[] = []) => {
                        const messages = [...old];
                        const lastMessage = messages[messages.length - 1];

                        if (lastMessage?.role === "model") {
                          messages[messages.length - 1] = {
                            ...lastMessage,
                            content: currentResponse,
                          };
                        } else {
                          messages.push({
                            role: "model",
                            content: currentResponse,
                          });
                        }

                        return messages;
                      }
                    );
                  }
                } catch (e) {
                  console.error("Error parsing SSE data:", e);
                }
              }
            });
          },
        }
      );
      return response.data;
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    const scrollTimeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    return () => clearTimeout(scrollTimeout);
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = input.trim();
    setInput("");

    try {
      await chatMutation.mutateAsync(userMessage);
    } catch (error) {
      console.error("Chat error:", error);
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
                  <AIReplyEditorView content={message.content} isStreaming={isStreaming} />
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
        <div className="flex space-x-2">
          <textarea
            value={input}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 min-w-0 px-3 py-2 text-sm border rounded-md min-h-9 h-10 max-h-[312px] border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2"
            disabled={chatMutation.isPending}
          />
          <Button type="submit" disabled={chatMutation.isPending}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;