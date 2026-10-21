import { useState, useRef, useEffect, useContext, useMemo } from "react";
import { Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import Container from "../../layouts/Container";
import NewColumnForm from "./NewColumnForm";
import { Button } from "../../components/ui/button";
import BoardViewBar from "../../components/board-view-bar";

import ColumnView from "./ColumnView";
import { createColumn } from "../../apis/ColumnApis";
import { KanbanContext } from "../../context/KanbanProvider";
import { ColumnProvider } from "../../context/ColumnProvider";
import ListView from "@/_components/ListView";
import { useStore } from "zustand";
import useToggleViewStore from "@/store/toggleViewStore";
import { useViewOptionsStore } from "@/store/useViewOptionsStore";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { updateCardColumn } from "../../apis/CardApis";
import ViewOptionsPanel from "@/_components/ViewOptions/ViewOptionsPanel";
import { groupCards, filterCards, orderCards } from "@/utils/viewOptionsUtils";
import { useMembers } from "../../hooks/useMembers";

interface Column {
  id: number;
  title: string;
  order: number;
  cards: Array<any>; // Define proper card type
}

interface ColumnWorkspaceProps {
  title: string;
  headerChildren?: React.ReactNode;
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

const ColumnWorkspace = ({ title, headerChildren }: ColumnWorkspaceProps) => {
  const { columns, workspaceId } = useContext(KanbanContext);
  const { view, toggleView } = useStore(useToggleViewStore);
  const { viewOptions, isPanelOpen, updateViewOptions, openPanel, closePanel } =
    useViewOptionsStore();

  // Extract teamId from workspaceId (format: "teamId/slug")
  const teamId = workspaceId?.split("/")?.[0];

  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const [columnName, setColumnName] = useState("");
  const [showListInput, setShowListInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // OPTIMIZATION: Fetch members once at board level
  const { members } = useMembers();

  const createColumnMutation = useMutation({
    mutationFn: (title: string) => createColumn(title, workspaceId as string),
    onError: () => {
      toast.error("Something went wrong while creating the column");
    },
  });

  // Drag and drop mutation for updating card column/order
  const moveCardMutation = useMutation({
    mutationFn: async ({
      cardId,
      columnId,
      order,
    }: {
      cardId: number;
      columnId: number;
      order: number;
    }) => {
      await updateCardColumn(cardId, columnId, order);
    },
    onMutate: async ({ cardId, columnId, order }) => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({
        queryKey: ["columns", "workspaces", teamId],
      });

      // Snapshot the previous value for rollback
      const previousColumns = queryClient.getQueryData([
        "columns",
        "workspaces",
        teamId,
      ]);

      // Optimistically update the cache for immediate UI feedback
      queryClient.setQueryData(
        ["columns", "workspaces", teamId],
        (old: any) => {
          if (!old || !Array.isArray(old)) return old;

          const columnsCopy = [...old];
          let cardToMove: any = null;

          // First pass: find and remove the card from its source column
          const updatedColumns = columnsCopy.map((column: any) => {
            const cardIndex = column.cards.findIndex(
              (card: any) => card.id === cardId
            );
            if (cardIndex >= 0) {
              cardToMove = { ...column.cards[cardIndex] };
              return {
                ...column,
                cards: column.cards.filter((card: any) => card.id !== cardId),
              };
            }
            return column;
          });

          // Second pass: add the card to the destination column
          if (cardToMove) {
            return updatedColumns.map((column: any) => {
              if (column.id === columnId) {
                const updatedCard = { ...cardToMove, columnId, order };
                const newCards = [...column.cards, updatedCard].sort(
                  (a, b) => a.order - b.order
                );

                return {
                  ...column,
                  cards: newCards,
                };
              }
              return column;
            });
          }

          return updatedColumns;
        }
      );

      return { previousColumns };
    },
    onError: (error, _, context) => {
      console.error("Error moving card:", error);
      toast.error("Failed to move card");

      // Rollback to previous state on error
      if (context?.previousColumns) {
        queryClient.setQueryData(
          ["columns", "workspaces", teamId],
          context.previousColumns
        );
      }
    },
  });

  // Apply view options to columns for Kanban view - Enhanced logic
  const processedColumns = useMemo(() => {
    const columnsData = columns || [];

    if (!columnsData) return [];

    let filteredColumns = [...columnsData].sort(
      (a: Column, b: Column) => a.order - b.order
    );

    // Apply comprehensive view options to each column's cards
    filteredColumns = filteredColumns.map((column) => {
      let columnCards = column.cards || [];

      // 1. Apply search filtering
      if (searchQuery.trim()) {
        columnCards = columnCards.filter(
          (card: any) =>
            card.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            card.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // 2. Filter cards based on active filters
      columnCards = filterCards(columnCards, viewOptions);

      // 3. Hide completed cards if option is disabled
      if (!viewOptions.showCompletedCards) {
        columnCards = columnCards.filter(
          (card: any) => card.status !== "completed" && card.status !== "done"
        );
      }

      // 4. Order cards within the column
      columnCards = orderCards(columnCards, viewOptions);

      return { ...column, cards: columnCards };
    });

    // Hide empty columns if option is disabled
    if (!viewOptions.showEmptyColumns) {
      filteredColumns = filteredColumns.filter(
        (column) => column.cards && column.cards.length > 0
      );
    }

    return filteredColumns;
  }, [columns, viewOptions, searchQuery]);

  const sortedColumns = processedColumns;

  const handleAddColumn = () => {
    if (!columnName.trim()) return;
    createColumnMutation.mutate(columnName);
    setColumnName("");
    setShowListInput(false);
  };

  const listViewData = useMemo(() => {
    if (!columns) return {};

    // Get all cards from all columns
    let allCards = columns.flatMap((col: any) => col.cards || []);

    // Apply search filtering
    if (searchQuery.trim()) {
      allCards = allCards.filter(
        (card: any) =>
          card.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply view options (grouping, filtering, ordering)
    const groupedData = groupCards(allCards, columns, viewOptions);

    return groupedData;
  }, [columns, viewOptions, searchQuery]);

  // Handle drag end with improved error handling and order calculation
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area or draggableId is invalid
    if (!destination || !draggableId) {
      return;
    }

    // If dropped in the same position, no action needed
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Parse IDs with validation
    const sourceColumnId = parseInt(source.droppableId);
    const destinationColumnId = parseInt(destination.droppableId);
    const cardId = parseInt(draggableId);

    // Validate parsed IDs
    if (isNaN(sourceColumnId) || isNaN(destinationColumnId) || isNaN(cardId)) {
      console.error("Invalid IDs in drag operation");
      return;
    }

    // Find source and destination columns
    const sourceColumn = columns?.find((col: any) => col.id === sourceColumnId);
    const destinationColumn = columns?.find(
      (col: any) => col.id === destinationColumnId
    );

    if (!sourceColumn || !destinationColumn) {
      console.error("Source or destination column not found");
      return;
    }

    // Get destination cards and sort them by order for accurate positioning
    const destinationCards = [...(destinationColumn.cards || [])].sort(
      (a, b) => a.order - b.order
    );
    let newOrder: number;

    // Calculate new order with better precision
    if (destinationCards.length === 0) {
      newOrder = 1000; // Start with a reasonable base order
    } else if (destination.index === 0) {
      // Moving to top
      const firstCard = destinationCards[0];
      newOrder = Math.max(1, firstCard.order - 1000);
    } else if (destination.index >= destinationCards.length) {
      // Moving to bottom
      const lastCard = destinationCards[destinationCards.length - 1];
      newOrder = lastCard.order + 1000;
    } else {
      // Moving between cards - use more precision to avoid conflicts
      const previousCard = destinationCards[destination.index - 1];
      const nextCard = destinationCards[destination.index];
      newOrder = (previousCard.order + nextCard.order) / 2;

      // If the difference is too small, recalculate with larger gaps
      if (nextCard.order - previousCard.order < 2) {
        newOrder = previousCard.order + 500;
      }
    }

    // Prevent mutation if already in progress to avoid race conditions
    if (moveCardMutation.isPending) {
      return;
    }

    // Execute the move
    moveCardMutation.mutate({
      cardId,
      columnId: destinationColumnId,
      order: newOrder,
    });
  };

  useEffect(() => {
    if (showListInput) {
      inputRef.current?.focus();
    }
  }, [showListInput]);

  return (
    <>
      <Container
        fwdClassName={view === "kanban" ? "bg-transparent px-2" : "p-0"}
        title={title}
        headerChildren={headerChildren}
        viewBar={
          <BoardViewBar
            currentView={view}
            viewOptions={viewOptions}
            onOptionsChange={updateViewOptions}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            members={members}
            onOpenViewOptions={openPanel}
          />
        }
      >
        <div className="relative w-full h-full ">
          {view === "kanban" ? (
            sortedColumns ? (
              <DragDropContext onDragEnd={handleDragEnd}>
                <ol className="absolute inset-0 flex items-start h-full py-2">
                  {sortedColumns &&
                    sortedColumns.map((column: Column) => (
                      <ColumnProvider
                        columnId={column.id.toString()}
                        key={column.id}
                      >
                        <ColumnView
                          title={column.title}
                          cards={column.cards}
                          columnId={column.id}
                          viewOptions={viewOptions}
                          members={members}
                        />
                      </ColumnProvider>
                    ))}
                  <div className="p-1 rounded-md">
                    {showListInput ? (
                      <NewColumnForm
                        columnName={columnName}
                        setColumnName={setColumnName}
                        onAddColumn={handleAddColumn}
                        onCancel={() => setShowListInput(false)}
                        inputRef={inputRef}
                      />
                    ) : (
                      <ExpandAddColumnButton
                        onClick={() => setShowListInput(true)}
                      />
                    )}
                  </div>
                </ol>
              </DragDropContext>
            ) : (
              <div className="flex items-center justify-center w-full h-32 text-muted-foreground">
                Loading columns...
              </div>
            )
          ) : (
            <ListView
              data={listViewData}
              viewOptions={viewOptions}
              members={members}
            />
          )}
        </div>
      </Container>

      {/* View Options Panel */}
      <ViewOptionsPanel
        isOpen={isPanelOpen}
        onClose={closePanel}
        currentView={view}
        onViewChange={(newView) => {
          if (newView !== view) {
            toggleView();
          }
        }}
        viewOptions={viewOptions}
        onOptionsChange={updateViewOptions}
      />
    </>
  );
};

export default ColumnWorkspace;
