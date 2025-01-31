import { useState } from "react";
import { DEFAULT_IMAGES } from "../constant";
import { unsplash } from "../services/unsplashService";

import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBoard } from "../apis/BoardApis";

const useBoardForm = (count) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const accessToken = Cookies.get("accessToken");

  const [currentBoardInput, setCurrentBoardInput] = useState("");
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");

  const createBoardMutation = useMutation({
    mutationFn: async ({ boardTitle, selectedImageTitle, organizationId }) => {
      const [
        imageId,
        imageThumbUrl,
        imageFullUrl,
        imageLinkHTML,
        imageUserName,
      ] = selectedImageTitle.split("|");

      const kanbanBoardData = {
        title: boardTitle,
        imageId: imageId,
        imageThumbUrl: imageThumbUrl,
        imageFullUrl: imageFullUrl,
        imageLinkHTML: imageLinkHTML,
        imageUserName: imageUserName,
        organizationId: organizationId,
      };

      return await createBoard(accessToken, kanbanBoardData);
    },
    onSuccess: () => {
      toast.success("Board created successfully");

      navigate(`/kanban/${kanbanBoardId}`);

      setCurrentBoardInput("");
      setSelectedImageId(null);
      setSelectedOrganizationId("");
    },
    onSettled: () => {
      return queryClient.invalidateQueries({
        queryKey: ["boards"],
      });
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    const boardTitle = event.target.elements.title.value;
    const selectedImageTitle = event.target.elements.image.value;
    const organizationId = selectedOrganizationId;

    if (boardTitle === "") {
      toast.error("Board title shouldn't be empty!");
      return;
    }

    if (selectedImageTitle === "") {
      toast.error("Board background shouldn't be empty!");
      return;
    }

    if (boardTitle.length < 6) {
      toast.error("Board title must be at least 6 characters long");
      return;
    }

    if (count === 0) {
      toast.warning("You have reached the maximum number of boards");
      return;
    }

    createBoardMutation.mutate({
      boardTitle,
      selectedImageTitle,
      organizationId,
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
    retry: false, // Don't retry on failure
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
    selectedOrganizationId,
    setSelectedOrganizationId,
  };
};

export default useBoardForm;
