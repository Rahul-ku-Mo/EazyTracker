import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBoard } from "../apis/BoardApis";
import { useToast } from "../hooks/use-toast";
import { useFeatureGating } from "./useFeatureGating";

interface IBoardForm {
  boardTitle: string;
  selectedColor: string;
}

const useBoardForm = (count: number) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const accessToken = Cookies.get("accessToken");
  const { toast } = useToast();
  const { getUpgradeMessage } = useFeatureGating();

  const [currentBoardInput, setCurrentBoardInput] = useState("");
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const createBoardMutation = useMutation({
    mutationFn: async (data: IBoardForm) => {
      if (!accessToken) {
        throw new Error("No access token found");
      }

      const [colorId, colorValue, colorName] = data.selectedColor.split("|");

      const kanbanBoardData = {
        title: data.boardTitle,
        colorId,
        colorValue,
        colorName
      };

      const response = await createBoard(accessToken, kanbanBoardData);
      return response;
    },
    onSuccess: (data) => {
      if (data && data.id) {
        toast({
          title: "Board created successfully",
          variant: "default",
        });
        navigate(`/workspace/board/${data.id}`);
        setCurrentBoardInput("");
        setSelectedImageId(null);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create board",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      return queryClient.invalidateQueries({
        queryKey: ["boards"],
      });
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const form = event.target as HTMLFormElement;
    const boardTitle = (form.elements.namedItem('title') as HTMLInputElement).value;
    const selectedColor = (form.elements.namedItem('color') as HTMLInputElement).value;

    if (boardTitle === "") {
      toast({
        title: "Board title shouldn't be empty!",
        description: "Please enter a board title",
        variant: "destructive",
      });
      return;
    }

    if (selectedColor === "") {
      toast({
        title: "Board color shouldn't be empty!",
        description: "Please select a board color",
        variant: "destructive",
      });
      return;
    }

    if (boardTitle.length < 6) {
      toast({
        title: "Board title must be at least 6 characters long",
        description: "Please enter a longer title",
        variant: "destructive",
      });
      return;
    }

    // Check if user can create more boards (count -1 means unlimited)
    if (count === 0) {
      toast({
        title: "Project limit reached",
        description: getUpgradeMessage('projects'),
        variant: "destructive",
      });
      return;
    }

    createBoardMutation.mutate({
      boardTitle,
      selectedColor,
    });
  };

  return {
    isPending: createBoardMutation.isPending,
    selectedImageId,
    setCurrentBoardInput,
    currentBoardInput,
    setSelectedImageId,
    handleSubmit,
  };
};

export default useBoardForm;
