import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteWorkspace, updateWorkspace } from "@/apis/WorkspaceApis";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const useWorkspaceMutation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();



  const deleteWorkspaceMutation = useMutation({
    mutationFn: async (workspaceId: string) => {
      await deleteWorkspace(workspaceId);
    },
    onSuccess: () => {
      toast({
        title: "Workspace deleted",
        description:
          "Workspace has been successfully deleted by " + Cookies.get("username") ||
          "Unknown user",
        variant: "default",
      });
      navigate("/workspace", { replace: true });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later",
        variant: "destructive",
      });
    },
  });

  const updateWorkspaceMutation = useMutation({
    mutationFn: async ({
      workspaceId,
      updatedWorkspaceData,
    }: {
      workspaceId: string;
      updatedWorkspaceData: any;
    }) => {
      await updateWorkspace(workspaceId, updatedWorkspaceData);
    },
    onSuccess: () => {
      toast({
        title: "Workspace updated",
        description: "Workspace has been successfully updated",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later",
        variant: "destructive",
      });
    },
  });

  return { deleteWorkspaceMutation, updateWorkspaceMutation };
}; 