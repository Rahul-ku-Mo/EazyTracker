import { useNavigate } from "react-router-dom";

import Cookies from "js-cookie";
import { cn } from "../../lib/utils";
import Container from "../../layouts/Container";
import BoardPopover from "./BoardPopover";
import { useBoards } from "../../hooks/useQueries";
import { MAX_BOARDS } from "../../constant";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";

import { BoardContextMenu } from "./BoardContextMenu";
import { useState } from "react";
import DeleteDialog from "../Dialog/DeleteDialog";
import { useBoardMutation } from "./_mutations/useBoardMutation";

interface Board {
  id: string;
  title: string;
  imageId: string;
  imageFullUrl: string;
  imageUserName: string;
}

const BoardCard = ({ board }: { board: Board }) => {
  const navigate = useNavigate();

  const [isOpenDeleteBoardDialog, setIsOpenDeleteBoardDialog] = useState(false);

  const { deleteBoardMutation } = useBoardMutation();

  const handleDeleteBoard = () => {
    setIsOpenDeleteBoardDialog(true);
  };

  const closeDeleteBoardDialog = () => {
    setIsOpenDeleteBoardDialog(false);
  };

  const handleOpenBoard = () => {
    navigate(`/kanban/${board.id}`);
  };

  const handleOpenBoardSettings = () => {
    navigate(`/boards/settings/${board.id}`);
  };

  return (
    <>
      <BoardContextMenu
        onOpen={handleOpenBoard}
        onDelete={handleDeleteBoard}
        onSettings={handleOpenBoardSettings}
      >
        <div className="block" onClick={handleOpenBoard}>
          <Card className="relative overflow-hidden border-0 rounded-md group w-52 h-36">
            <img
              src={board.imageFullUrl}
              alt={`${board.title} board background`}
              className="absolute inset-0 object-cover w-full h-full "
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
                  {board.imageUserName}
                </span>
              </CardFooter>
            </div>
          </Card>
        </div>
      </BoardContextMenu>

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

const EmptyBoardState = ({ boards }: { boards: Board[] }) => (
  <>
    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
      <Card className="border-0 bg-background/50">
        <CardHeader>
          <CardTitle className="text-2xl">Create your first board</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Start by creating a board to organize your tasks
          </p>
        </CardContent>
      </Card>
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
          {boards?.map((board) => (
            <BoardCard key={`${board.id}${board.imageId}`} board={board} />
          ))}
          <BoardPopover count={MAX_BOARDS - (boards?.length ?? 0)} />
        </div>
      )}
    </Container>
  );
};

export default BoardSelection;
