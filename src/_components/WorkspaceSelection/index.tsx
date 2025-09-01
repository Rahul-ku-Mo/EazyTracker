import { useNavigate } from "react-router-dom";

import Cookies from "js-cookie";
import { cn } from "@/lib/utils";
import Container from "@/layouts/Container";
import WorkspacePopover from "./WorkspacePopover";
import { useWorkspaces } from "@/hooks/useQueries";
import { useFeatureGating } from "@/hooks/useFeatureGating";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, Eye, Info, MoreHorizontal } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { getTeamWorkspaces } from "@/apis/TeamApis";

import { WorkspaceContextMenu } from "./WorkspaceContextMenu";
import { useState } from "react";
import DeleteDialog from "../Dialog/DeleteDialog";
import { useWorkspaceMutation } from "./_mutations/useWorkspaceMutation";
import InviteWorkspaceDialog from "./InviteWorkspaceDialog";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { WorkspaceIcon } from "../shared/svg/SidebarIcons";
import { AccessLevelIcon } from "../shared/svg/SharedIcons";

interface Workspace {
  id: string;
  title: string;
  slug?: string;
  colorId: string;
  colorValue: string;
  colorName: string;
  isFavorite?: boolean;
}

interface TeamWorkspace {
  id: number;
  title: string;
  slug?: string;
  colorValue: string;
  colorName: string;
  hasAccess: boolean;
  userRole: string | null;
  isOwner: boolean;
  createdBy: string;
}

const WorkspaceCard = ({ workspace }: { workspace: Workspace }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const accessToken = Cookies.get("accessToken");

  const [isOpenDeleteWorkspaceDialog, setIsOpenDeleteWorkspaceDialog] =
    useState(false);
  const [isOpenInviteWorkspaceDialog, setIsOpenInviteWorkspaceDialog] =
    useState(false);

  const openInviteWorkspaceDialog = () => {
    setIsOpenInviteWorkspaceDialog(true);
  };

  const closeInviteWorkspaceDialog = () => {
    setIsOpenInviteWorkspaceDialog(false);
  };

  const { deleteWorkspaceMutation } = useWorkspaceMutation();

  // Favorite mutation with optimistic updates
  const favoriteMutation = useMutation({
    mutationFn: async (workspaceId: string) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/workspaces/${workspaceId}/favorite`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    },
    onMutate: async (workspaceId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["workspaces"] });
      await queryClient.cancelQueries({ queryKey: ["favoriteWorkspaces"] });

      // Snapshot the previous value
      const previousWorkspaces = queryClient.getQueryData(["workspaces"]);
      const previousFavoriteWorkspaces = queryClient.getQueryData([
        "favoriteWorkspaces",
      ]);

      // Optimistically update the workspaces cache
      queryClient.setQueryData(["workspaces"], (old: any) => {
        if (!old) return old;
        return old.map((w: any) =>
          w.id === workspaceId ? { ...w, isFavorite: !w.isFavorite } : w
        );
      });

      // Return a context object with the snapshotted value
      return { previousWorkspaces, previousFavoriteWorkspaces };
    },
    onSuccess: (data) => {
      toast({
        title: data.message,
        variant: "default",
      });
      // Invalidate to ensure fresh data from server
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["favoriteWorkspaces"] });
    },
    onError: (error: any, _workspaceId: string, context: any) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["workspaces"], context?.previousWorkspaces);
      queryClient.setQueryData(
        ["favoriteWorkspaces"],
        context?.previousFavoriteWorkspaces
      );

      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update favorite status",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["favoriteWorkspaces"] });
    },
  });

  const handleDeleteWorkspace = () => {
    setIsOpenDeleteWorkspaceDialog(true);
  };

  const closeDeleteWorkspaceDialog = () => {
    setIsOpenDeleteWorkspaceDialog(false);
  };

  const handleOpenWorkspace = () => {
    // Use new teamId + slug pattern if workspace has teamId and slug
    if (workspace.slug) {
      const teamName = localStorage.getItem("teamName");

      navigate(`/workspace/${teamName}/${workspace.slug}`);
    }
  };

  const handleOpenWorkspaceSettings = () => {
    // Use new teamId + slug pattern if workspace has teamId and slug
    if (workspace.slug) {
      const teamName = localStorage.getItem("teamName");
      navigate(`/workspace/settings/${teamName}/${workspace.slug}`);
    }
  };

  const handleToggleFavorite = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent opening the workspace
    favoriteMutation.mutate(workspace.id);
  };

  return (
    <>
      <WorkspaceContextMenu
        onOpen={handleOpenWorkspace}
        onDelete={handleDeleteWorkspace}
        onSettings={handleOpenWorkspaceSettings}
        onInvite={openInviteWorkspaceDialog}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={workspace.isFavorite || false}
        isToggling={favoriteMutation.isPending}
      >
        <div className="block" onClick={handleOpenWorkspace}>
          <Card className="relative overflow-hidden border-0 rounded-md group w-52 h-36">
            <div
              style={{ backgroundColor: workspace.colorValue }}
              className="absolute inset-0 w-full h-full"
            />
            <div
              className={cn(
                "absolute inset-0 flex flex-col justify-between p-3",
                "bg-black/30 group-hover:bg-black/50",
                "transition-colors duration-200"
              )}
            >
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-bold text-white flex-1">
                  {workspace.title}
                </CardTitle>
                <button
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Trigger context menu by dispatching a right-click event
                    const contextMenuEvent = new MouseEvent("contextmenu", {
                      bubbles: true,
                      cancelable: true,
                      clientX: e.clientX,
                      clientY: e.clientY,
                    });
                    e.currentTarget.parentElement?.parentElement?.parentElement?.dispatchEvent(
                      contextMenuEvent
                    );
                  }}
                  className={cn(
                    "p-1 rounded-full transition-all duration-200 hover:bg-white/20",
                    "opacity-0 group-hover:opacity-100"
                  )}
                >
                  <MoreHorizontal className="w-4 h-4 text-white" />
                </button>
              </div>
              <CardFooter className="p-0">
                <span className="text-xs font-medium text-white/20">
                  {workspace.colorName}
                </span>
              </CardFooter>
            </div>
          </Card>
        </div>
      </WorkspaceContextMenu>

      <InviteWorkspaceDialog
        isOpen={isOpenInviteWorkspaceDialog}
        onClose={closeInviteWorkspaceDialog}
        id={workspace.id}
      />

      <DeleteDialog
        closeModal={closeDeleteWorkspaceDialog}
        isOpen={isOpenDeleteWorkspaceDialog}
        deleteItem={deleteWorkspaceMutation}
        title={workspace.title}
        id={workspace.id}
      />
    </>
  );
};

const LockedWorkspaceCard = ({ workspace }: { workspace: TeamWorkspace }) => {
  const { toast } = useToast();

  const handleLockedClick = () => {
    toast({
      title: "Workspace Access Required",
      description: `You need permission to access "${workspace.title}". Contact ${workspace.createdBy} for access.`,
      variant: "default",
    });
  };

  return (
    <div className="block" onClick={handleLockedClick}>
      <Card className="relative overflow-hidden border-0 rounded-md group w-52 h-36 cursor-not-allowed">
        <div
          style={{ backgroundColor: workspace.colorValue }}
          className="absolute inset-0 w-full h-full opacity-50"
        />
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-between p-3",
            "bg-black/60 group-hover:bg-black/70",
            "transition-colors duration-200"
          )}
        >
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-bold text-white/70 flex-1">
              {workspace.title}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Lock className="w-4 h-4 text-white/70" />
            </div>
          </div>
          <CardFooter className="p-0 flex flex-col items-start gap-1">
            <div className="flex items-center gap-1 text-xs text-white/60">
              <Eye className="w-3 h-3" />
              <span>Created by {workspace.createdBy}</span>
            </div>
            <span className="text-xs font-medium text-white/40">
              {workspace.colorName} • Access Required
            </span>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
};

const EmptyWorkspaceState = ({
  remainingWorkspaces,
  isAdmin,
}: {
  remainingWorkspaces: number;
  isAdmin: boolean;
}) => (
  <>
    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
      <div className="border-0 bg-background/50">
        <div className="text-2xl font-bold text-center geist-font">
          {isAdmin ? "Start your journey!" : "No workspaces available"}
        </div>
        <div className="text-sm max-w-xs text-muted-foreground text-center">
          {isAdmin
            ? "✨ Create your first workspace to organize tasks. 🚀"
            : "🔒 Contact your team admin to get access to workspaces or create new ones."}
        </div>
      </div>
    </div>
    {isAdmin && <WorkspacePopover count={remainingWorkspaces} />}
  </>
);

const LoadingState = () => (
  <div className="flex flex-wrap gap-4">
    {[...Array(2)].map((_, i) => (
      <Skeleton key={i} className="rounded-md w-52 h-36" />
    ))}
  </div>
);

const WorkspaceSelection = () => {
  const accessToken = Cookies.get("accessToken");
  const { isAdmin } = useAdminCheck();
  const teamId = localStorage.getItem("teamId") as string;

  // Only fetch user's own workspaces if user is admin
  const { data: workspaces, isPending: isWorkspacesPending } = useWorkspaces(
    teamId,
  );
  const { data: teamWorkspaces, isPending: isTeamWorkspacesPending } = useQuery(
    {
      queryKey: ["team-workspaces"],
      queryFn: getTeamWorkspaces,
      enabled: !!accessToken,
    }
  );
  const { canCreate } = useFeatureGating();

  const currentWorkspaceCount = workspaces?.length ?? 0;
  const { remaining } = canCreate("projects", currentWorkspaceCount);
  // For unlimited plans, remaining will be -1, otherwise show actual remaining count
  const remainingWorkspaces = remaining === null ? 0 : remaining;

  const isPending = isWorkspacesPending || isTeamWorkspacesPending;

  // Separate team workspaces into accessible and locked
  const accessibleTeamWorkspaces =
    teamWorkspaces?.filter(
      (workspace: TeamWorkspace) => workspace.hasAccess && !workspace.isOwner
    ) || [];
  const lockedTeamWorkspaces =
    teamWorkspaces?.filter(
      (workspace: TeamWorkspace) => !workspace.hasAccess && !workspace.isOwner
    ) || [];

  // For non-admin users, only count team workspaces they have access to
  const relevantWorkspaceCount = isAdmin
    ? (workspaces?.length || 0) +
      (accessibleTeamWorkspaces?.length || 0) +
      (lockedTeamWorkspaces?.length || 0)
    : (accessibleTeamWorkspaces?.length || 0) +
      (lockedTeamWorkspaces?.length || 0);

  const hasAnyWorkspaces = relevantWorkspaceCount > 0;

  return (
    <Container
      fwdClassName="px-4"
      title={isAdmin ? "Manage Workspaces" : "Workspaces"}
    >
      <div className="flex items-center gap-3 pb-2 pt-4">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
          <WorkspaceIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">My Workspaces</h1>
          <p className="text-sm text-muted-foreground">
            Manage your workspaces and create new ones
          </p>
        </div>
      </div>
      {isPending ? (
        <LoadingState />
      ) : !hasAnyWorkspaces ? (
        <EmptyWorkspaceState
          remainingWorkspaces={remainingWorkspaces}
          isAdmin={isAdmin}
        />
      ) : (
        <div className="space-y-6">
          {/* User's own workspaces - Only show for admin users */}
          {isAdmin && workspaces && workspaces.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {workspaces?.map((workspace: any) => (
                <WorkspaceCard
                  key={`${workspace.id}${workspace.colorId}`}
                  workspace={workspace}
                />
              ))}
              <WorkspacePopover count={remainingWorkspaces} />
            </div>
          )}

          {/* Accessible team workspaces */}
          {accessibleTeamWorkspaces.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {isAdmin ? "Team Workspaces" : "Workspaces"}
              </h3>
              <div className="flex flex-wrap gap-4">
                {accessibleTeamWorkspaces?.map((workspace: TeamWorkspace) => (
                  <WorkspaceCard
                    key={`team-${workspace.id}`}
                    workspace={{
                      id: workspace.id.toString(),
                      title: workspace.title,
                      slug: workspace.slug, // Include slug for navigation
                      colorId: "", // Team workspaces don't have colorId
                      colorValue: workspace.colorValue,
                      colorName: workspace.colorName,
                      isFavorite: false,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Locked team workspaces */}
          {lockedTeamWorkspaces.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Locked Workspaces ({lockedTeamWorkspaces.length})
              </h3>
              <div className="flex flex-wrap gap-4">
                {lockedTeamWorkspaces?.map((workspace: TeamWorkspace) => (
                  <LockedWorkspaceCard
                    key={`locked-${workspace.id}`}
                    workspace={workspace}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Show workspace creation option only for admins when they have no workspaces */}
          {isAdmin && (!workspaces || workspaces.length === 0) && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                My Workspaces
              </h3>
              <div className="flex flex-wrap gap-4">
                <WorkspacePopover count={remainingWorkspaces} />
              </div>
            </div>
          )}

          {/* Info card for non-admin users */}
          {!isAdmin && hasAnyWorkspaces && (
            <div className="mt-6">
              <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
                <CardContent className="flex items-start gap-3 pt-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Workspace Access Information
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      As a team member, you can access workspaces that have been
                      shared with you. To create new workspaces or manage
                      existing ones, contact your team administrator.
                    </p>
                  </div>
                  <AccessLevelIcon className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </Container>
  );
};

export default WorkspaceSelection;
