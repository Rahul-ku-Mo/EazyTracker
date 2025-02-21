import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { useState } from "react";

const useConversation = () => {
  const queryClient = useQueryClient();

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | undefined
  >(undefined);

  const { data: conversations, isPending: isLoading } = useQuery({
    queryKey: ["ai-conversations"],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/ai/conversations`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      );
      return response.data.data;
    },
  });

 
  //create a new Conversation
  const createConversation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/ai/chat/new`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      );
      return response.data.data;
    },
    onSuccess: (data: any) => {
      setSelectedConversationId(data.id);
      queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
    },
  });

  return {
    conversations,
    isLoading,
    selectedConversationId,
    setSelectedConversationId,
    createConversation,
    
  };
};

export default useConversation;
