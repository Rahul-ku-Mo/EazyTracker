/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { DEFAULT_IMAGES } from "../constant";
import { unsplash } from "../services/unsplashService";
import { useNavigate } from "react-router-dom";

import Cookies from "js-cookie";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBoard } from "../apis/BoardApis";
import { useToast } from "../hooks/use-toast";

interface IBoardForm {
  boardTitle: string;
  selectedImageTitle: any;
}

const useBoardForm = (count: number) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const accessToken = Cookies.get("accessToken");
  const { toast } = useToast();

  const [currentBoardInput, setCurrentBoardInput] = useState("");
  const [selectedImageId, setSelectedImageId] = useState(null);

  const createBoardMutation = useMutation({
    mutationFn: async (data : IBoardForm) => {
      if (!accessToken) {
        throw new Error("No access token found");
      }

      const [
        imageId,
        imageThumbUrl,
        imageFullUrl,
        imageLinkHTML,
        imageUserName,
      ] = data.selectedImageTitle.split("|");

      const kanbanBoardData = {
        title: data.boardTitle,
        imageId: imageId,
        imageThumbUrl: imageThumbUrl,
        imageFullUrl: imageFullUrl,
        imageLinkHTML: imageLinkHTML,
        imageUserName: imageUserName,
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
        navigate(`/kanban/${data.id}`);
        setCurrentBoardInput("");
        setSelectedImageId(null);
      }
    },
    onError: (error: any) => {
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

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const boardTitle = event.target.elements.title.value;
    const selectedImageTitle = event.target.elements.image.value;

    if (boardTitle === "") {
      toast({
        title: "Board title shouldn't be empty!",
        description: "Please enter a board title",
        variant: "destructive",
      });
      return;
    }

    if (selectedImageTitle === "") {
      toast({
        title: "Board background shouldn't be empty!",
        description: "Please select a board background",
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

    if (count === 0) {
      toast({
        title: "Maximum boards reached",
        description: "Please delete some boards or upgrade your plan",
        variant: "destructive",
      });
      return;
    }

    createBoardMutation.mutate({
      boardTitle,
      selectedImageTitle,
    });
  };

  const { data: images, isPending } = useQuery({
    queryKey: ["images"],
    queryFn: async () => {
      const result = await unsplash.photos.getRandom({
        collectionIds: ["317099"],
        count: 9,
      });

      if (result && result.response) {
        return result.response;
      }

      throw new Error("Failed to fetch images");
    },
    retry: false,
    initialData: DEFAULT_IMAGES,
  });

  return {
    isPending,
    images,
    selectedImageId,
    setCurrentBoardInput,
    currentBoardInput,
    setSelectedImageId,
    handleSubmit,
  };
};

export default useBoardForm;
