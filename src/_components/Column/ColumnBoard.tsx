import { useState, useRef, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { cn } from "../../lib/utils";
import Container from "../../layouts/Container";
import NewColumnForm from "./NewColumnForm";
import { Button } from "../../components/ui/button";

import ColumnView from "./ColumnView";
import { createColumn } from "../../apis/ColumnApis";
import { KanbanContext } from "../../Context/KanbanProvider";
import { ColumnProvider } from "../../Context/ColumnProvider";

interface Column {
  id: string;
  title: string;
  order: number;
  cards: Array<any>; // Define proper card type
}

interface ColumnBoardProps {
  title: string;
}

interface ExpandAddColumnButtonProps {
  onClick: () => void;
}

const ExpandAddColumnButton = ({ onClick }: ExpandAddColumnButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className={cn(
        "w-[300px] h-10 group inline-flex justify-start pl-2",
        "border border-zinc-200 dark:border-zinc-700",
        "bg-white/50 dark:bg-zinc-800/50",
        "backdrop-blur-sm",
        "transition-all duration-200"
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "rounded-full ",
            "bg-zinc-100 dark:bg-zinc-700",
            "group-hover:bg-zinc-200 dark:group-hover:bg-zinc-600",
            "transition-all duration-200"
          )}
        >
          <Plus
            className={cn(
              "p-0.5 h-5 w-5",
              "text-zinc-600 dark:text-zinc-400",
              "transition-transform duration-200",
              "group-hover:rotate-90"
            )}
          />
        </div>
        <span
          className={cn(
            "text-sm font-medium",
            "text-zinc-600 dark:text-zinc-400",
            "group-hover:text-zinc-900 dark:group-hover:text-zinc-200",
            "transition-colors duration-200"
          )}
        >
          New Column
        </span>
      </div>
    </Button>
  );
};

const ColumnBoard = ({ title }: ColumnBoardProps) => {
  const { id: boardId } = useParams();
  const { columns } = useContext(KanbanContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const accessToken = Cookies.get("accessToken");
  const [columnName, setColumnName] = useState("");
  const [showListInput, setShowListInput] = useState(false);

  const createColumnMutation = useMutation({
    mutationFn: (title: string) => createColumn(accessToken, title, boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["columns", "boards", boardId],
      });
      toast.success("Column created successfully!");
    },
    onError: () => {
      toast.error("Something went wrong while creating the column 🔥");
    },
  });

  const sortedColumns = columns?.sort(
    (a: Column, b: Column) => a.order - b.order
  );

  const handleAddColumn = () => {
    if (!columnName.trim()) return;
    createColumnMutation.mutate(columnName);
    setColumnName("");
    setShowListInput(false);
  };

  useEffect(() => {
    if (showListInput) {
      inputRef.current?.focus();
    }
  }, [showListInput]);

  return (
    <>
      <Container fwdClassName="bg-transparent" title={title}>
        <div className="relative w-full h-full">
          <ol className="absolute inset-0 flex items-start h-full gap-3 ">
            {sortedColumns?.map((column: Column) => (
              <ColumnProvider columnId={column.id} key={column.id}>
                <ColumnView
                  title={column.title}
                  cards={column.cards}
                />
              </ColumnProvider>
            ))}
            <div className="rounded-md">
              {showListInput ? (
                <NewColumnForm
                  columnName={columnName}
                  setColumnName={setColumnName}
                  onAddColumn={handleAddColumn}
                  onCancel={() => setShowListInput(false)}
                  inputRef={inputRef}
                />
              ) : (
                <ExpandAddColumnButton onClick={() => setShowListInput(true)} />
              )}
            </div>
          </ol>
        </div>
      </Container>
    </>
  );
};

export default ColumnBoard;
