import { useNavigate } from "react-router-dom";

import Cookies from "js-cookie";
import { cn } from "@/lib/utils";
import Container from "@/layouts/Container";
import BoardPopover from "./BoardPopover";
import { useBoards } from "@/hooks/useQueries";
import { useFeatureGating } from "@/hooks/useFeatureGating";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, Eye, Info, Shield, SquareTerminal, MoreHorizontal } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { getTeamBoards } from "@/apis/TeamApis";

import { BoardContextMenu } from "./BoardContextMenu";
import { useState } from "react";
import DeleteDialog from "../Dialog/DeleteDialog";
import { useBoardMutation } from "./_mutations/useBoardMutation";
import InviteBoardDialog from "./InviteBoardDialog";
import { useAdminCheck } from "@/hooks/useAdminCheck";

interface Board {
  id: string;
  title: string;
  colorId: string;
  colorValue: string;
  colorName: string;
  isFavorite?: boolean;
}

interface TeamBoard {
  id: number;
  title: string;
  colorName: string;
  colorValue: string;
  userId: string;
  createdAt: string;
  hasAccess: boolean;
  userRole: string | null;
  isOwner: boolean;
  createdBy: string;
}

const BoardCard = ({ board }: { board: Board }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const accessToken = Cookies.get("accessToken");

  const [isOpenDeleteBoardDialog, setIsOpenDeleteBoardDialog] = useState(false);
  const [isOpenInviteBoardDialog, setIsOpenInviteBoardDialog] = useState(false);

  const openInviteBoardDialog = () => {
    setIsOpenInviteBoardDialog(true);
  };

  const closeInviteBoardDialog = () => {
    setIsOpenInviteBoardDialog(false);
  };

  const { deleteBoardMutation } = useBoardMutation();

  // Favorite mutation with optimistic updates
  const favoriteMutation = useMutation({
    mutationFn: async (boardId: string) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/boards/${boardId}/favorite`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    },
    onMutate: async (boardId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["boards"] });
      await queryClient.cancelQueries({ queryKey: ["favoriteBoards"] });

      // Snapshot the previous value
      const previousBoards = queryClient.getQueryData(["boards"]);
      const previousFavoriteBoards = queryClient.getQueryData(["favoriteBoards"]);

      // Optimistically update the boards cache
      queryClient.setQueryData(["boards"], (old: any) => {
        if (!old) return old;
        return old.map((b: any) => 
          b.id === boardId ? { ...b, isFavorite: !b.isFavorite } : b
        );
      });

      // Return a context object with the snapshotted value
      return { previousBoards, previousFavoriteBoards };
    },
    onSuccess: (data) => {
      toast({
        title: data.message,
        variant: "default",
      });
      // Invalidate to ensure fresh data from server
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      queryClient.invalidateQueries({ queryKey: ["favoriteBoards"] });
    },
    onError: (error: any, _boardId: string, context: any) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["boards"], context?.previousBoards);
      queryClient.setQueryData(["favoriteBoards"], context?.previousFavoriteBoards);
      
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update favorite status",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      queryClient.invalidateQueries({ queryKey: ["favoriteBoards"] });
    },
  });

  const handleDeleteBoard = () => {
    setIsOpenDeleteBoardDialog(true);
  };

  const closeDeleteBoardDialog = () => {
    setIsOpenDeleteBoardDialog(false);
  };

  const handleOpenBoard = () => {
    navigate(`/workspace/board/${board.id}`);
  };

  const handleOpenBoardSettings = () => {
    navigate(`/workspace/settings/${board.id}`);
  };

  const handleToggleFavorite = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent opening the board
    favoriteMutation.mutate(board.id);
  };

  return (
    <>
      <BoardContextMenu
        onOpen={handleOpenBoard}
        onDelete={handleDeleteBoard}
        onSettings={handleOpenBoardSettings}
        onInvite={openInviteBoardDialog}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={board.isFavorite || false}
        isToggling={favoriteMutation.isPending}
      >
        <div className="block" onClick={handleOpenBoard}>
          <Card className="relative overflow-hidden border-0 rounded-md group w-52 h-36">
            <div
              style={{ backgroundColor: board.colorValue }}
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
                  {board.title}
                </CardTitle>
                <button
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Trigger context menu by dispatching a right-click event
                    const contextMenuEvent = new MouseEvent('contextmenu', {
                      bubbles: true,
                      cancelable: true,
                      clientX: e.clientX,
                      clientY: e.clientY,
                    });
                    e.currentTarget.parentElement?.parentElement?.parentElement?.dispatchEvent(contextMenuEvent);
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
                  {board.colorName}
                </span>
              </CardFooter>
            </div>
          </Card>
        </div>
      </BoardContextMenu>

      <InviteBoardDialog
        isOpen={isOpenInviteBoardDialog}
        onClose={closeInviteBoardDialog}
        id={board.id}
      />

      <DeleteDialog
        closeModal={closeDeleteBoardDialog}
        isOpen={isOpenDeleteBoardDialog}
        deleteItem={deleteBoardMutation}
        title={board.title}
        id={board.id}
      />
    </>
  );
};

const LockedBoardCard = ({ board }: { board: TeamBoard }) => {
  const { toast } = useToast();

  const handleLockedClick = () => {
    toast({
      title: "Board Access Required",
      description: `You need permission to access "${board.title}". Contact ${board.createdBy} for access.`,
      variant: "default",
    });
  };

  return (
    <div className="block" onClick={handleLockedClick}>
      <Card className="relative overflow-hidden border-0 rounded-md group w-52 h-36 cursor-not-allowed">
        <div
          style={{ backgroundColor: board.colorValue }}
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
              {board.title}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Lock className="w-4 h-4 text-white/70" />
            </div>
          </div>
          <CardFooter className="p-0 flex flex-col items-start gap-1">
            <div className="flex items-center gap-1 text-xs text-white/60">
              <Eye className="w-3 h-3" />
              <span>Created by {board.createdBy}</span>
            </div>
            <span className="text-xs font-medium text-white/40">
              {board.colorName} • Access Required
            </span>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
};

const EmptyBoardState = ({
  remainingBoards,
  isAdmin,
}: {
  remainingBoards: number;
  isAdmin: boolean;
}) => (
  <>
    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
      <div className="border-0 bg-background/50">
        <div className="text-2xl font-bold text-center geist-font">
          {isAdmin ? "Start your journey!" : "No boards available"}
        </div>
        <div className="text-sm max-w-xs text-muted-foreground text-center">
          {isAdmin
            ? "✨ Create your first board to organize tasks. 🚀"
            : "🔒 Contact your team admin to get access to boards or create new ones."}
        </div>
      </div>
    </div>
    {isAdmin && <BoardPopover count={remainingBoards} />}
  </>
);

const LoadingState = () => (
  <div className="flex flex-wrap gap-4">
    {[...Array(2)].map((_, i) => (
      <Skeleton key={i} className="rounded-md w-52 h-36" />
    ))}
  </div>
);

const BoardSelection = () => {
  const accessToken = Cookies.get("accessToken");
  const { isAdmin } = useAdminCheck();

  // Only fetch user's own boards if user is admin
  const { data: boards, isPending: isBoardsPending } = useBoards(
    accessToken as string
  );
  const { data: teamBoards, isPending: isTeamBoardsPending } = useQuery({
    queryKey: ["team-boards"],
    queryFn: getTeamBoards,
    enabled: !!accessToken,
  });
  const { canCreate } = useFeatureGating();

  const currentBoardCount = boards?.length ?? 0;
  const { remaining } = canCreate("projects", currentBoardCount);
  // For unlimited plans, remaining will be -1, otherwise show actual remaining count
  const remainingBoards = remaining === null ? 0 : remaining;

  const isPending = isBoardsPending || isTeamBoardsPending;

  // Separate team boards into accessible and locked
  const accessibleTeamBoards =
    teamBoards?.filter(
      (board: TeamBoard) => board.hasAccess && !board.isOwner
    ) || [];
  const lockedTeamBoards =
    teamBoards?.filter(
      (board: TeamBoard) => !board.hasAccess && !board.isOwner
    ) || [];

  // For non-admin users, only count team boards they have access to
  const relevantBoardCount = isAdmin
    ? (boards?.length || 0) +
      (accessibleTeamBoards?.length || 0) +
      (lockedTeamBoards?.length || 0)
    : (accessibleTeamBoards?.length || 0) + (lockedTeamBoards?.length || 0);

  const hasAnyBoards = relevantBoardCount > 0;

  return (
    <Container
      fwdClassName="pl-2 bg-background"
      title={isAdmin ? "Manage Boards" : "Boards"}
    >
      {isPending ? (
        <LoadingState />
      ) : !hasAnyBoards ? (
        <EmptyBoardState remainingBoards={remainingBoards} isAdmin={isAdmin} />
      ) : (
        <div className="space-y-6">
          {/* User's own boards - Only show for admin users */}
          {isAdmin && boards && boards.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 py-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <SquareTerminal className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">My Boards</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage your boards and create new ones
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                {boards?.map((board: any) => (
                  <BoardCard
                    key={`${board.id}${board.colorId}`}
                    board={board}
                  />
                ))}
                <BoardPopover count={remainingBoards} />
              </div>
            </div>
          )}

          {/* Accessible team boards */}
          {accessibleTeamBoards.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {isAdmin ? "Team Boards" : "Boards"}
              </h3>
              <div className="flex flex-wrap gap-4">
                {accessibleTeamBoards?.map((board: TeamBoard) => (
                  <BoardCard
                    key={`team-${board.id}`}
                    board={{
                      id: board.id.toString(),
                      title: board.title,
                      colorId: "", // Team boards don't have colorId
                      colorValue: board.colorValue,
                      colorName: board.colorName,
                      isFavorite: false,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Locked team boards */}
          {lockedTeamBoards.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Locked Boards ({lockedTeamBoards.length})
              </h3>
              <div className="flex flex-wrap gap-4">
                {lockedTeamBoards?.map((board: TeamBoard) => (
                  <LockedBoardCard key={`locked-${board.id}`} board={board} />
                ))}
              </div>
            </div>
          )}

          {/* Show board creation option only for admins when they have no boards */}
          {isAdmin && (!boards || boards.length === 0) && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                My Boards
              </h3>
              <div className="flex flex-wrap gap-4">
                <BoardPopover count={remainingBoards} />
              </div>
            </div>
          )}

          {/* Info card for non-admin users */}
          {!isAdmin && hasAnyBoards && (
            <div className="mt-6">
              <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10">
                <CardContent className="flex items-start gap-3 pt-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Board Access Information
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      As a team member, you can access boards that have been
                      shared with you. To create new boards or manage existing
                      ones, contact your team administrator.
                    </p>
                  </div>
                  <Shield className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </Container>
  );
};

export default BoardSelection;
