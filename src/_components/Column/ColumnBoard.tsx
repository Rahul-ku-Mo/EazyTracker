import { useState, useRef, useEffect, useContext, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Plus, Settings } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { cn } from "../../lib/utils";
import Container from "../../layouts/Container";
import NewColumnForm from "./NewColumnForm";
import { Button } from "../../components/ui/button";

import ColumnView from "./ColumnView";
import { createColumn } from "../../apis/ColumnApis";
import { KanbanContext } from "../../context/KanbanProvider";
import { ColumnProvider } from "../../context/ColumnProvider";
import ListView from "@/_components/ListView";
import { useStore } from "zustand";
import useToggleViewStore from "@/store/toggleViewStore";
import { useViewOptionsStore } from "@/store/useViewOptionsStore";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { updateCardColumn, updateCardOrder } from "../../apis/CardApis";
import ViewOptionsPanel from "@/_components/ViewOptions/ViewOptionsPanel";
import { generateDummyData, groupCards, filterCards, orderCards } from "@/utils/viewOptionsUtils";

interface Column {
  id: number;
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
  const { columns: contextColumns } = useContext(KanbanContext);

  const { view, toggleView } = useStore(useToggleViewStore);
  const { 
    viewOptions, 
    isPanelOpen, 
    updateViewOptions, 
    openPanel, 
    closePanel 
  } = useViewOptionsStore();

  // Use dummy data for testing - replace with real data later
  const { columns: dummyColumns } = useMemo(() => generateDummyData(), []);
  const columns = contextColumns && contextColumns.length > 0 ? contextColumns : dummyColumns;

  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const accessToken = Cookies.get("accessToken") as string;
  const [columnName, setColumnName] = useState("");
  const [showListInput, setShowListInput] = useState(false);

  const createColumnMutation = useMutation({
    mutationFn: (title: string) => createColumn(accessToken, title, boardId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["columns", "boards", boardId],
      });
      toast.success("Column created successfully!");
    },
    onError: () => {
      toast.error("Something went wrong while creating the column ��");
    },
  });

  // Drag and drop mutation for updating card column/order
  const moveCardMutation = useMutation({
    mutationFn: async ({ cardId, columnId, order }: { cardId: number; columnId: number; order: number }) => {
      await updateCardColumn(accessToken, cardId, columnId);
      await updateCardOrder(accessToken, cardId, order);
    },
    onMutate: async ({ cardId, columnId, order }) => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ["columns", "boards", boardId] });

      // Snapshot the previous value for rollback
      const previousColumns = queryClient.getQueryData(["columns", "boards", boardId]);

      // Optimistically update the cache for immediate UI feedback
      queryClient.setQueryData(["columns", "boards", boardId], (old: any) => {
        if (!old || !Array.isArray(old)) return old;

        const columnsCopy = [...old];
        let cardToMove: any = null;

        // First pass: find and remove the card from its source column
        const updatedColumns = columnsCopy.map((column: any) => {
          const cardIndex = column.cards.findIndex((card: any) => card.id === cardId);
          if (cardIndex >= 0) {
            cardToMove = { ...column.cards[cardIndex] };
            return {
              ...column,
              cards: column.cards.filter((card: any) => card.id !== cardId)
            };
          }
          return column;
        });

        // Second pass: add the card to the destination column
        if (cardToMove) {
          return updatedColumns.map((column: any) => {
            if (column.id === columnId) {
              const updatedCard = { ...cardToMove, columnId, order };
              const newCards = [...column.cards, updatedCard].sort((a, b) => a.order - b.order);
              
              return {
                ...column,
                cards: newCards
              };
            }
            return column;
          });
        }

        return updatedColumns;
      });

      return { previousColumns };
    },
    onError: (error, _, context) => {
      console.error("Error moving card:", error);
      toast.error("Failed to move card");
      
      // Rollback to previous state on error
      if (context?.previousColumns) {
        queryClient.setQueryData(["columns", "boards", boardId], context.previousColumns);
      }
    },
    onSettled: () => {
      // Refetch after a short delay to ensure server state is synced
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["columns", "boards", boardId],
        });
      }, 500);
    },
  });

  // Apply view options to columns for Kanban view - Enhanced logic
  const processedColumns = useMemo(() => {
    if (!columns) return [];
    
    let filteredColumns = [...columns].sort((a: Column, b: Column) => a.order - b.order);
    
    // Apply comprehensive view options to each column's cards
    filteredColumns = filteredColumns.map(column => {
      let columnCards = column.cards || [];
      
      // 1. Filter cards based on active filters
      columnCards = filterCards(columnCards, viewOptions);
      
             // 2. Hide completed cards if option is disabled
       if (!viewOptions.showCompletedCards) {
         columnCards = columnCards.filter((card: any) => card.status !== 'completed' && card.status !== 'done');
       }
      
      // 3. Order cards within the column
      columnCards = orderCards(columnCards, viewOptions);
      
      console.log(`Column "${column.title}" after processing:`, {
        originalCount: (column.cards || []).length,
        filteredCount: columnCards.length,
        orderBy: viewOptions.orderBy,
        activeFilters: viewOptions.activeFilters
      });
      
      return { ...column, cards: columnCards };
    });
    
    // Hide empty columns if option is disabled
    if (!viewOptions.showEmptyColumns) {
      filteredColumns = filteredColumns.filter(column => column.cards && column.cards.length > 0);
    }
    
    console.log('Processed columns for Kanban:', {
      totalColumns: filteredColumns.length,
      viewOptions: viewOptions,
      columnsWithCards: filteredColumns.map(col => ({
        title: col.title,
        cardCount: col.cards.length
      }))
    });
    
    return filteredColumns;
  }, [columns, viewOptions]);

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
    const allCards = columns.flatMap((col: any) => col.cards || []);
    
    // Apply view options (grouping, filtering, ordering)
    const groupedData = groupCards(allCards, columns, viewOptions);
    
    console.log('Applied view options:', viewOptions);
    console.log('Grouped data:', groupedData);
    
    return groupedData;
  }, [columns, viewOptions]);

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
      console.error('Invalid IDs in drag operation');
      return;
    }

    // Find source and destination columns
    const sourceColumn = columns?.find((col: any) => col.id === sourceColumnId);
    const destinationColumn = columns?.find((col: any) => col.id === destinationColumnId);

    if (!sourceColumn || !destinationColumn) {
      console.error('Source or destination column not found');
      return;
    }

    // Get destination cards and sort them by order for accurate positioning
    const destinationCards = [...(destinationColumn.cards || [])].sort((a, b) => a.order - b.order);
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
        fwdClassName="bg-transparent" 
        title={title}
        headerChildren={
          <Button
            variant="outline"
            size="sm"
            onClick={openPanel}
            className="flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-md"
          >
            <Settings className="h-4 w-4" />
            View Options
          </Button>
        }
      >

        <div className="relative w-full h-full">
          {view === "kanban" ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <ol className="absolute inset-0 flex items-start h-full">
                {sortedColumns?.map((column: Column) => (
                  <ColumnProvider columnId={column.id.toString()} key={column.id}>
                    <ColumnView 
                      title={column.title} 
                      cards={column.cards} 
                      columnId={column.id}
                      viewOptions={viewOptions}
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
                    <ExpandAddColumnButton onClick={() => setShowListInput(true)} />
                  )}
                </div>
              </ol>
            </DragDropContext>
          ) : (
            <ListView data={listViewData} />
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

export default ColumnBoard;
