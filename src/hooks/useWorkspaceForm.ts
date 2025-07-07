import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWorkspace } from "../apis/WorkspaceApis";
import { useToast } from "../hooks/use-toast";
import { useFeatureGating } from "./useFeatureGating";

interface IWorkspaceForm {
  workspaceTitle: string;
  selectedColor: string;
}

const useWorkspaceForm = (count: number) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const accessToken = Cookies.get("accessToken");
  const { toast } = useToast();
  const { getUpgradeMessage } = useFeatureGating();

  const [currentWorkspaceInput, setCurrentWorkspaceInput] = useState("");
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const createWorkspaceMutation = useMutation({
    mutationFn: async (data: IWorkspaceForm) => {
      if (!accessToken) {
        throw new Error("No access token found");
      }

      const [colorId, colorValue, colorName] = data.selectedColor.split("|");

      const kanbanWorkspaceData = {
        title: data.workspaceTitle,
        colorId,
        colorValue,
        colorName
      };

      const response = await createWorkspace(kanbanWorkspaceData);
      return response;
    },
    onSuccess: (data) => {
      if (data && data.id) {
        toast({
          title: "Workspace created successfully",
          variant: "default",
        });
        navigate(`/workspace/${data.id}`);
        setCurrentWorkspaceInput("");
        setSelectedImageId(null);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create workspace",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      return queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const form = event.target as HTMLFormElement;
    const workspaceTitle = (form.elements.namedItem('title') as HTMLInputElement).value;
    const selectedColor = (form.elements.namedItem('color') as HTMLInputElement).value;

    if (workspaceTitle === "") {
      toast({
        title: "Workspace title shouldn't be empty!",
        description: "Please enter a workspace title",
        variant: "destructive",
      });
      return;
    }

    if (selectedColor === "") {
      toast({
        title: "Workspace color shouldn't be empty!",
        description: "Please select a workspace color",
        variant: "destructive",
      });
      return;
    }

    if (workspaceTitle.length < 6) {
      toast({
        title: "Workspace title must be at least 6 characters long",
        description: "Please enter a longer title",
        variant: "destructive",
      });
      return;
    }

    // Check if user can create more workspaces (count -1 means unlimited)
    if (count === 0) {
      toast({
        title: "Project limit reached",
        description: getUpgradeMessage('projects'),
        variant: "destructive",
      });
      return;
    }

    createWorkspaceMutation.mutate({
      workspaceTitle,
      selectedColor,
    });
  };

  return {
    isPending: createWorkspaceMutation.isPending,
    selectedImageId,
    setCurrentWorkspaceInput,
    currentWorkspaceInput,
    setSelectedImageId,
    handleSubmit,
  };
};

export default useWorkspaceForm; 