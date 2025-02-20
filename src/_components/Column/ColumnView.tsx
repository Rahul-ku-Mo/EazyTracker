import { useContext, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Plus, ArrowUpDown, Trash } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { cn } from "../../lib/utils";
import { deleteColumn } from "../../apis/ColumnApis";
import DeleteDialog from "../../_components/Dialog/DeleteDialog";

import NewCardForm from "../../_components/Card/NewCardForm";

import ColumnActionTooltipWrapper from "./ColumnActionTooltipWrapper";
import CardsInColumn from "../Card/CardsInColumn";
import { ColumnContext } from "../../context/ColumnProvider";

interface ColumnViewProps {
  title: string;
  cards: Array<{
    id: string;
    title: string;
    description: string;
    // Add other card properties as needed
  }>;
}

const ColumnView = ({ title, cards }: ColumnViewProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNewCardOpen, setIsNewCardOpen] = useState(false);

  const { id: boardId } = useParams();
  const queryClient = useQueryClient();
  const columnId = useContext(ColumnContext);
  const accessToken = Cookies.get("accessToken");

  // const updateColumnMutation = useMutation({
  //   mutationFn: async ({
  //     title,
  //     columnId,
  //   }: {
  //     title: string;
  //     columnId: string;
  //   }) => {
  //     return await updateColumn(accessToken, title, columnId);
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({
  //       queryKey: ["columns", columnId],
  //     });
  //   },
  //   onError: () => {
  //     toast.error("Something wrong happened 🔥");
  //   },
  // });

  const deleteColumnMutation = useMutation({
    mutationFn: async (columnId: string) => {
      return await deleteColumn(accessToken, columnId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["columns", "boards", boardId],
      });
    },
    onError: () => {
      toast.error("Something wrong happened 🔥");
    },
  });

  const closeDeleteModal = () => setIsDeleteModalOpen(false);
  const openDeleteModal = () => setIsDeleteModalOpen(true);

  return (
    <>
      <li className="self-start block h-full list-none shrink-0 whitespace-nowrap rounded-md p-1  w-[300px] overflow-hidden">
        <div className="flex items-center justify-between h-10 p-2 bg-white border rounded-md dark:bg-zinc-900">
          <span className="text-sm font-semibold truncate text-zinc-900 dark:text-white">
            {title}
          </span>
          <div className="inline-flex items-center gap-2">
            <ColumnActionTooltipWrapper
              actionName="Add Card"
              handleClick={() => setIsNewCardOpen(true)}
            >
              <Plus
                className={cn(
                  "p-0.5 h-5 w-5",
                  "bg-zinc-200 dark:bg-zinc-700",
                  "transition-all duration-200"
                )}
              />
            </ColumnActionTooltipWrapper>
            <ColumnActionTooltipWrapper actionName="Sort Column">
              <ArrowUpDown className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            </ColumnActionTooltipWrapper>
            <ColumnActionTooltipWrapper
              actionName="Delete Column"
              handleClick={openDeleteModal}
            >
              <Trash className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            </ColumnActionTooltipWrapper>
          </div>
        </div>

        <CardsInColumn columnName={title} cards={cards} />
      </li>
      <NewCardForm
        columnName={title}
        isOpen={isNewCardOpen}
        onClose={() => setIsNewCardOpen(false)}
      />
      <DeleteDialog
        closeModal={closeDeleteModal}
        isOpen={isDeleteModalOpen}
        title="column"
        id={columnId}
        deleteItem={deleteColumnMutation}
      />
    </>
  );
};

export default ColumnView;
