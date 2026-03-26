import { useNavigate } from "react-router-dom";

import Cookies from "js-cookie";
import { cn } from "@/lib/utils";
import Container from "@/layouts/Container";
import WorkspacePopover from "./WorkspacePopover";
import { useWorkspaces } from "@/hooks/useQueries";
import { useFeatureGating } from "@/hooks/useFeatureGating";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, MoreHorizontal, Briefcase } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getTeamWorkspaces } from "@/apis/team-api";
import { toggleWorkspaceFavorite } from "@/apis/WorkspaceApis";

import { WorkspaceContextMenu } from "./WorkspaceContextMenu";
import { useState } from "react";
import DeleteDialog from "../Dialog/DeleteDialog";
import { useWorkspaceMutation } from "./_mutations/useWorkspaceMutation";
import InviteWorkspaceDialog from "./InviteWorkspaceDialog";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { WorkspaceIcon } from "../shared/svg/SidebarIcons";
import { AccessLevelIcon } from "../shared/svg/SharedIcons";
import useProjectSlugStore from "@/store/projectSlugStore";

interface Workspace {
  id: number;
  title: string;
  slug?: string;
  colorId: string;
  colorValue: string;
  colorName: string;
  isFavorite?: boolean;
  project: {
    id: string;
    title: string;
    slug: string;
  };
  projectId: string;
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
  projectId: string;
  project: {
    id: string;
    title: string;
    slug: string;
  };
}

const WorkspaceCard = ({ workspace }: { workspace: Workspace }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const teamId = localStorage.getItem("teamId") || "";

  const { updateCurrentProjectSlug } = useProjectSlugStore();

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
    mutationFn: async (workspaceIdentifier: string) => {
      return await toggleWorkspaceFavorite(workspaceIdentifier);
    },
    onMutate: async () => {
      // Extract workspaceId from identifier for optimistic update
      const workspaceId = workspace.id;

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
    onError: (error: any, _variables, context: any) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["workspaces"], context?.previousWorkspaces);
      queryClient.setQueryData(
        ["favoriteWorkspaces"],
        context?.previousFavoriteWorkspaces
      );

      toast({
        title: "Error",
        description: error.message || "Failed to update favorite status",
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
    if (workspace.slug && workspace.project?.slug) {
      updateCurrentProjectSlug(workspace.project.slug);
      navigate(`/projects/${workspace.project.slug}/workspace/${workspace.slug}`);
    }
  };

  const handleOpenWorkspaceSettings = () => {
    if (workspace.slug && workspace.project?.slug) {
      navigate(`/projects/${workspace.project.slug}/workspace/settings/${workspace.slug}`);
    }
  };

  const handleToggleFavorite = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent opening the workspace
    if (workspace.slug) {
      favoriteMutation.mutate(`${teamId}/${workspace.slug}`);
    }
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
                <span className="text-xs font-medium text-white/20 line-clamp-1">
                  {workspace.project.title}
                </span>
              </CardFooter>
            </div>
          </Card>
        </div>
      </WorkspaceContextMenu>

      <InviteWorkspaceDialog
        isOpen={isOpenInviteWorkspaceDialog}
        onClose={closeInviteWorkspaceDialog}
        workspaceSlug={workspace.slug || ""}
      />

      <DeleteDialog<string>
        closeModal={closeDeleteWorkspaceDialog}
        isOpen={isOpenDeleteWorkspaceDialog}
        deleteItem={deleteWorkspaceMutation}
        title={workspace.title}
        id={`${teamId}/${workspace.slug}`}
      />
    </>
  );
};

// Removed LockedWorkspaceCard - users won't see workspaces from projects they don't have access to

const EmptyWorkspaceState = ({
  remainingWorkspaces,
  isAdmin,
}: {
  remainingWorkspaces: number;
  isAdmin: boolean;
}) => {
  if (isAdmin) {
    return (
      <>
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <div className="border-0 bg-background/50">
            <div className="text-2xl font-bold text-center geist-font">
              Start your journey!
            </div>
            <div className="text-sm max-w-xs text-muted-foreground text-center">
              ✨ Create your first workspace to organize tasks. 🚀
            </div>
          </div>
        </div>
        <WorkspacePopover count={remainingWorkspaces} />
      </>
    );
  }

  // Non-admin empty state
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
              <Briefcase className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No Projects Available</h3>
              <p className="text-sm text-muted-foreground">
                You haven't been invited to any projects yet. Once you're added to a project, 
                you'll be able to access its workspaces. Contact your team administrator 
                or project admin for access.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="w-4 h-4" />
              <span>Need access? Contact your team admin or project admin</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

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

  // Fetch workspaces based on role
  // Admins fetch their own workspaces via useWorkspaces
  // Non-admins rely on team workspaces they have access to
  const { data: workspaces, isPending: isWorkspacesPending } = useWorkspaces(
    teamId,
    { enabled: isAdmin } // Only fetch if admin
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
  // Only admins can create workspaces, so set to 0 for non-admins
  const remainingWorkspaces = isAdmin
    ? remaining === null
      ? 0
      : remaining
    : 0;

  const isPending = isWorkspacesPending || isTeamWorkspacesPending;

  // Get workspace IDs from useWorkspaces to avoid duplicates
  const ownWorkspaceIds = new Set(workspaces?.map((w: any) => w.id) || []);

  // Filter team workspaces - only show workspaces from projects user has access to
  // Backend already filters by project access, so we only need to:
  // 1. Show workspaces user has direct access to
  // 2. Exclude duplicates for team admins (already shown in "My Workspaces")
  const accessibleTeamWorkspaces =
    teamWorkspaces?.filter(
      (workspace: TeamWorkspace) => 
        workspace.hasAccess && 
        // Exclude workspaces already shown in "My Workspaces" for team admins
        (!isAdmin || !ownWorkspaceIds.has(workspace.id))
    ) || [];

  // Count workspaces - no locked workspaces since users can only see workspaces from their projects
  const relevantWorkspaceCount = isAdmin
    ? (workspaces?.length || 0) + (accessibleTeamWorkspaces?.length || 0)
    : (accessibleTeamWorkspaces?.length || 0);

  const hasAnyWorkspaces = relevantWorkspaceCount > 0;

  return (
    <Container
      fwdClassName="px-4"
      title="Workspaces"
    >
      <div className="flex items-center gap-3 pb-2 pt-4">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
          <WorkspaceIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Workspaces</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? "Manage your workspaces and create new ones" : "View and access your project workspaces"}
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
          {/* All workspaces - combined view */}
          <div className="flex flex-wrap gap-4">
            {/* User's own workspaces */}
            {isAdmin && workspaces && workspaces.length > 0 && (
              <>
                {workspaces?.map((workspace: any) => (
                  <WorkspaceCard
                    key={`${workspace.id}${workspace.colorId}`}
                    workspace={workspace}
                  />
                ))}
              </>
            )}

            {/* Accessible team workspaces */}
            {accessibleTeamWorkspaces?.map((workspace: TeamWorkspace) => (
              <WorkspaceCard
                key={`team-${workspace.id}`}
                workspace={{
                  id: workspace.id,
                  title: workspace.title,
                  slug: workspace.slug,
                  colorId: "",
                  colorValue: workspace.colorValue,
                  colorName: workspace.colorName,
                  isFavorite: false,
                  project: workspace.project,
                  projectId: workspace.projectId,
                }}
              />
            ))}

            {/* Show workspace creation option for admins */}
            {isAdmin && <WorkspacePopover count={remainingWorkspaces} />}
          </div>

          {/* Info card for non-admin users */}
          {!isAdmin && hasAnyWorkspaces && (
            <div className="mt-6">
              <Card className="border dark:bg-[#18181b]">
                <CardContent className="flex items-start gap-3 pt-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-1">
                      Project & Workspace Access
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      You're viewing workspaces from projects you've been invited to. 
                      To access more workspaces, you need to be added to the relevant project first. 
                      Contact your team administrator or project admin for access.
                    </p>
                  </div>
                  <AccessLevelIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
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
