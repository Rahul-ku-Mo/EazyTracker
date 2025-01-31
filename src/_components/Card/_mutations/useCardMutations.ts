import { TCardData } from "../../../types";
import { createCard, deleteCard, updateCard } from "../../../apis/CardApis";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useParams } from "react-router-dom";
import { useToast } from "../../../hooks/use-toast";
import { useContext } from "react";
import { ColumnContext } from "../../../Context/ColumnProvider";

type TIssueCardData = {
  title?: string;
  cardDescription?: string;
  attachments?: string[];
  dueDate?: string;
  comments?: string[];
  cardId: string;
  columnId: string;
  priority?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const useCardMutation = () => {
  const { id: boardId } = useParams();

  const accessToken: string = Cookies.get("accessToken") || "";

  const columnId = useContext(ColumnContext);

  const queryClient = useQueryClient();

  const { toast } = useToast();

  const createCardMutation = useMutation({
    mutationFn: (cardData: TCardData) =>
      createCard({
        accessToken,
        cardData,
        columnId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["columns", "boards", boardId],
      });
    },
  });

  const updateCardMutation = useMutation({
    mutationFn: async (data: TIssueCardData) => {
      const { title, cardDescription, attachments, dueDate, comments, cardId, priority } =
        data;
      const updatedData = {
        ...(title !== undefined && { title }),
        ...(cardDescription !== undefined && { description: cardDescription }),
        ...(attachments !== undefined && { attachments }),
        ...(dueDate !== undefined && { dueDate }),
        ...(comments !== undefined && { comments }),
        ...(priority !== undefined && { priority }),
      };

      return await updateCard(accessToken, updatedData as TCardData, cardId);
    },
    onSuccess: () =>
      toast({
        title: "Update",
        description: `Card Status updated at ${new Date().toLocaleString()} by ${Cookies.get("username") || "Unknown user"}`,
        variant: "default",
      }),
    onError: () =>
      toast({
        title: "Something wrong happened 🔥",
        description: "Please try again later",
        variant: "destructive",
      }),
    onSettled: async (_, error, variables: TIssueCardData) => {
      await queryClient.invalidateQueries({
        queryKey: ["cards", "columns", variables.columnId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["columns", "boards", boardId],
      });
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: (cardId: string) => deleteCard(accessToken, cardId),
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
      }),
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["columns", "boards", boardId],
      });
    },
  });

  return {
    updateCardMutation,
    deleteCardMutation,
    createCardMutation,
  };
};
