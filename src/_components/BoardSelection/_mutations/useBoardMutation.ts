import { useMutation } from "@tanstack/react-query";
import { deleteBoard, updateBoard } from "@/apis/BoardApis";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const useBoardMutation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const accessToken = Cookies.get("accessToken") as string;

  const deleteBoardMutation = useMutation({
    mutationFn: async (boardId: string) => {
      await deleteBoard(accessToken, boardId);
    },
    onSuccess: () => {
      toast({
        title: "Board deleted",
        description:
          "Board has been successfully deleted by " + Cookies.get("username") ||
          "Unknown user",
        variant: "default",
      });
      navigate("/boards", { replace: true });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later",
        variant: "destructive",
      });
    },
  });

  const updateBoardMutation = useMutation({
    mutationFn: async ({
      boardId,
      updatedBoardData,
    }: {
      boardId: string;
      updatedBoardData: any;
    }) => {
      await updateBoard(accessToken, boardId, updatedBoardData);
    },
    onSuccess: () => {
      toast({
        title: "Board updated",
        description: "Board has been successfully updated",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later",
        variant: "destructive",
      });
    },
  });

  return { deleteBoardMutation, updateBoardMutation };
};
