import { TCardData } from "@/types/cardTypes";
import { createCard, deleteCard, updateCard, markCardComplete, markCardIncomplete, toggleCardLabel } from "@/apis/CardApis";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";

import { useToast } from "../../../hooks/use-toast";
import { useContext } from "react";
import { ColumnContext } from "../../../context/ColumnProvider";

type TIssueUpdateCard = {
  title?: string;
  cardDescription?: string;
  attachments?: string[];
  dueDate?: Date | null;
  comments?: string[];
  cardId: number;
  columnId?: string;
  priority?: string;
  createdAt?: Date;
  assigneeId?: string | null;
  updatedAt?: Date;
  labelId?: string; // Changed from label to labelId for single label toggle
  order?: number;
  storyPoints?: number;
};

export const useCardMutation = () => {

  const accessToken: string = Cookies.get("accessToken") || "";

  const columnId = useContext(ColumnContext);


  const { toast } = useToast();

  const createCardMutation = useMutation({
    mutationFn: (cardData: TCardData) =>
      createCard({
        accessToken,
        cardData,
        columnId,
      }),
  });

  const updateCardMutation = useMutation({
    mutationFn: async (data: TIssueUpdateCard) => {
      const {
        title,
        cardDescription,
        attachments,
        dueDate,
        cardId,
        priority,
        assigneeId,
        labelId,
        order,
        storyPoints,
      } = data;

      // If labelId is provided, use the toggle label function
      if (labelId !== undefined) {
        return await toggleCardLabel(accessToken, cardId, labelId);
      }

      data.columnId = columnId;

      const updatedData = {
        ...(title !== undefined && { title }),
        ...(cardDescription !== undefined && { description: cardDescription }),
        ...(attachments !== undefined && { attachments }),
        ...(dueDate !== undefined && { dueDate }),
        ...(columnId !== undefined && { columnId }),
        ...(priority !== undefined && { priority }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(order !== undefined && { order }),
        ...(storyPoints !== undefined && { storyPoints }),
      };

      return await updateCard(accessToken, updatedData, cardId);
    },
    onSuccess: () => {
      toast({
        title: "Update",
        description: `Card Status updated at ${new Date().toLocaleString()} by ${Cookies.get("username") || "Unknown user"
          }`,
        variant: "default",
      })
    },
    onError: () => {
      toast({
        title: "Something wrong happened 🔥",
        description: "Please try again later",
        variant: "destructive",
      })
    }
  });

  const deleteCardMutation = useMutation({
    mutationFn: (cardId: number) => deleteCard(accessToken, cardId),
    onSuccess: () =>
      toast({
        title: "Card deleted !!",
        description: "Card deleted successfully",
        variant: "default",
      }),
    onError: () =>
      toast({
        title: "Something wrong happened 🔥",
        description: "Please try again later",
        variant: "destructive",
      })
  });

  const markCompleteCardMutation = useMutation({
    mutationFn: (cardId: number) => markCardComplete(accessToken, cardId),
    onSuccess: () =>
      toast({
        title: "Card completed! 🎉",
        description: "Card marked as complete",
        variant: "default",
      }),
    onError: () =>
      toast({
        title: "Something wrong happened 🔥",
        description: "Please try again later",
        variant: "destructive",
      }),

  });

  const markIncompleteCardMutation = useMutation({
    mutationFn: (cardId: number) => markCardIncomplete(accessToken, cardId),
    onSuccess: () =>
      toast({
        title: "Card reopened",
        description: "Card marked as incomplete",
        variant: "default",
      }),
    onError: () =>
      toast({
        title: "Something wrong happened 🔥",
        description: "Please try again later",
        variant: "destructive",
      }),

  });

  const toggleLabelMutation = useMutation({
    mutationFn: ({ cardId, labelId }: { cardId: number; labelId: string }) => 
      toggleCardLabel(accessToken, cardId, labelId),
    onSuccess: () =>
      toast({
        title: "Label updated",
        description: "Card label has been updated",
        variant: "default",
      }),
    onError: () =>
      toast({
        title: "Something wrong happened 🔥",
        description: "Failed to update label. Please try again later",
        variant: "destructive",
      }),
  });

  return {
    updateCardMutation,
    deleteCardMutation,
    createCardMutation,
    markCompleteCardMutation,
    markIncompleteCardMutation,
    toggleLabelMutation,
  };
};
