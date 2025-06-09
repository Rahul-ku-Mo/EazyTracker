import { useNavigate } from "react-router-dom";

import Cookies from "js-cookie";
import { cn } from "@/lib/utils";
import Container from "@/layouts/Container";
import BoardPopover from "./BoardPopover";
import { useBoards } from "@/hooks/useQueries";
import { useFeatureGating } from "@/hooks/useFeatureGating";
import {
  Card,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

import { BoardContextMenu } from "./BoardContextMenu";
import { useState } from "react";
import DeleteDialog from "../Dialog/DeleteDialog";
import { useBoardMutation } from "./_mutations/useBoardMutation";
import InviteBoardDialog from "./InviteBoardDialog";

interface Board {
  id: string;
  title: string;
  colorId: string;
  colorValue: string;
  colorName: string;
  isFavorite?: boolean;
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

  // Favorite mutation
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
    onSuccess: (data) => {
      toast({
        title: data.message,
        variant: "default",
      });
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      queryClient.invalidateQueries({ queryKey: ["favoriteBoards"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update favorite status",
        variant: "destructive",
      });
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

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the board
    favoriteMutation.mutate(board.id);
  };

  return (
    <>
      <BoardContextMenu
        onOpen={handleOpenBoard}
        onDelete={handleDeleteBoard}
        onSettings={handleOpenBoardSettings}
        onInvite={openInviteBoardDialog}
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
                  onClick={handleToggleFavorite}
                  className={cn(
                    "p-1 rounded-full transition-all duration-200 hover:bg-white/20",
                    "opacity-70 group-hover:opacity-100",
                    favoriteMutation.isPending && "animate-pulse"
                  )}
                  disabled={favoriteMutation.isPending}
                >
                  <Star
                    className={cn(
                      "w-4 h-4 transition-colors",
                      board.isFavorite
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-white hover:text-yellow-400"
                    )}
                  />
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

const EmptyBoardState = ({ remainingBoards }: { remainingBoards: number }) => (
  <>
    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
      <div className="border-0 bg-background/50">
        <div className="text-2xl font-bold text-center gt-walsheim-font">Start your journey!</div>
        <div className="text-sm max-w-xs text-muted-foreground text-center inter-variable-font">
          ✨ Create your first board to organize tasks. 🚀
        </div>
      </div>
    </div>
    <BoardPopover count={remainingBoards} />
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
  const { data: boards, isPending } = useBoards(accessToken as string);
  const { canCreate } = useFeatureGating();
  
  const currentBoardCount = boards?.length ?? 0;
  const { remaining } = canCreate('projects', currentBoardCount);
  // For unlimited plans, remaining will be -1, otherwise show actual remaining count
  const remainingBoards = remaining === null ? 0 : remaining;

  return (
    <Container fwdClassName="pl-2 bg-background" title="Manage Boards">
      {isPending ? (
        <LoadingState />
      ) : boards?.length === 0 ? (
        <EmptyBoardState remainingBoards={remainingBoards} />
      ) : (
        <div className="flex flex-wrap gap-4 pt-2 ">
          {boards?.map((board: any) => (
            <BoardCard key={`${board.id}${board.colorId}`} board={board} />
          ))}
          <BoardPopover count={remainingBoards} />
        </div>
      )}
    </Container>
  );
};

export default BoardSelection;
