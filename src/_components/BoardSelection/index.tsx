import { useNavigate } from "react-router-dom";

import Cookies from "js-cookie";
import { cn } from "@/lib/utils";
import Container from "@/layouts/Container";
import BoardPopover from "./BoardPopover";
import { useBoards } from "@/hooks/useQueries";
import { MAX_BOARDS } from "@/constant";
import {
  Card,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
}

const BoardCard = ({ board }: { board: Board }) => {
  const navigate = useNavigate();

  const [isOpenDeleteBoardDialog, setIsOpenDeleteBoardDialog] = useState(false);

  const [isOpenInviteBoardDialog, setIsOpenInviteBoardDialog] = useState(false);

  const openInviteBoardDialog = () => {
    setIsOpenInviteBoardDialog(true);
  };

  const closeInviteBoardDialog = () => {
    setIsOpenInviteBoardDialog(false);
  };

  const { deleteBoardMutation } = useBoardMutation();

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
              <CardTitle className="text-sm font-bold text-white">
                {board.title}
              </CardTitle>
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

const EmptyBoardState = ({ boards }: { boards: any }) => (
  <>
    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
      <div className="border-0 bg-background/50">
        <div className="text-2xl font-bold text-center gt-walsheim-font">Start your journey!</div>
        <div className="text-sm max-w-xs text-muted-foreground text-center inter-variable-font">
          ✨ Create your first board to organize tasks. 🚀
        </div>
      </div>
    </div>
    <BoardPopover count={MAX_BOARDS - (boards?.length ?? 0)} />
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

  return (
    <Container fwdClassName="pl-2 bg-background" title="Manage Boards">
      {isPending ? (
        <LoadingState />
      ) : boards?.length === 0 ? (
        <EmptyBoardState boards={boards} />
      ) : (
        <div className="flex flex-wrap gap-4 pt-2 ">
          {boards?.map((board: any) => (
            <BoardCard key={`${board.id}${board.colorId}`} board={board} />
          ))}
          <BoardPopover count={MAX_BOARDS - (boards?.length ?? 0)} />
        </div>
      )}
    </Container>
  );
};

export default BoardSelection;
