import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Plus, ArrowUpDown, Trash, ChevronDown, Calendar, Flag, Clock, SortAsc } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { cn } from "../../lib/utils";
import { deleteColumn } from "../../apis/ColumnApis";
import DeleteDialog from "../../_components/Dialog/DeleteDialog";

import NewCardForm from "../../_components/Card/NewCardForm";

import ColumnActionTooltipWrapper from "./ColumnActionTooltipWrapper";
import CardsInColumn from "../Card/CardsInColumn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../../components/ui/dropdown-menu";
import { Droppable } from "react-beautiful-dnd";

interface ColumnViewProps {
  title: string;
  columnId: number;
  cards: Array<{
    id: number;
    title: string;
    description?: string;
    priority?: string;
    dueDate?: Date;
    createdAt?: string;
    assigneeId?: string;
    order?: number;
    // Add other card properties as needed
  }>;
}

type SortOption = {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  sortFn: (a: any, b: any) => number;
};

const ColumnView = ({ title, cards, columnId }: ColumnViewProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNewCardOpen, setIsNewCardOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState<string>("manual");

  const { id: boardId } = useParams();
  const queryClient = useQueryClient();
  const accessToken = Cookies.get("accessToken") as string;

  const sortOptions: SortOption[] = React.useMemo(() => [
    {
      label: "Manual (Default)",
      value: "manual",
      icon: ArrowUpDown,
      sortFn: (a, b) => (a.order || 0) - (b.order || 0)
    },
    {
      label: "Title (A-Z)",
      value: "title-asc",
      icon: SortAsc,
      sortFn: (a, b) => (a.title || "").localeCompare(b.title || "")
    },
    {
      label: "Title (Z-A)", 
      value: "title-desc",
      icon: SortAsc,
      sortFn: (a, b) => (b.title || "").localeCompare(a.title || "")
    },
    {
      label: "Priority (High to Low)",
      value: "priority-desc",
      icon: Flag,
      sortFn: (a, b) => {
        const priorityOrder = { 
          urgent: 4, 
          high: 3, 
          medium: 2, 
          low: 1, 
          none: 0,
          null: 0,
          undefined: 0 
        };
        const aPriority = priorityOrder[a.priority?.toLowerCase() as keyof typeof priorityOrder] ?? 0;
        const bPriority = priorityOrder[b.priority?.toLowerCase() as keyof typeof priorityOrder] ?? 0;
        return bPriority - aPriority;
      }
    },
    {
      label: "Priority (Low to High)",
      value: "priority-asc",
      icon: Flag,
      sortFn: (a, b) => {
        const priorityOrder = { 
          urgent: 4, 
          high: 3, 
          medium: 2, 
          low: 1, 
          none: 0,
          null: 0,
          undefined: 0 
        };
        const aPriority = priorityOrder[a.priority?.toLowerCase() as keyof typeof priorityOrder] ?? 0;
        const bPriority = priorityOrder[b.priority?.toLowerCase() as keyof typeof priorityOrder] ?? 0;
        return aPriority - bPriority;
      }
    },
    {
      label: "Due Date (Soonest First)",
      value: "duedate-asc",
      icon: Calendar,
      sortFn: (a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        
        // Handle both Date objects and string dates
        const aDate = new Date(a.dueDate);
        const bDate = new Date(b.dueDate);
        
        // Check for invalid dates
        if (isNaN(aDate.getTime()) && isNaN(bDate.getTime())) return 0;
        if (isNaN(aDate.getTime())) return 1;
        if (isNaN(bDate.getTime())) return -1;
        
        return aDate.getTime() - bDate.getTime();
      }
    },
    {
      label: "Due Date (Latest First)",
      value: "duedate-desc",
      icon: Calendar,
      sortFn: (a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        
        // Handle both Date objects and string dates
        const aDate = new Date(a.dueDate);
        const bDate = new Date(b.dueDate);
        
        // Check for invalid dates
        if (isNaN(aDate.getTime()) && isNaN(bDate.getTime())) return 0;
        if (isNaN(aDate.getTime())) return 1;
        if (isNaN(bDate.getTime())) return -1;
        
        return bDate.getTime() - aDate.getTime();
      }
    },
    {
      label: "Created (Newest First)",
      value: "created-desc",
      icon: Clock,
      sortFn: (a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        
        // Handle both Date objects and string dates
        const aDate = new Date(a.createdAt);
        const bDate = new Date(b.createdAt);
        
        // Check for invalid dates
        if (isNaN(aDate.getTime()) && isNaN(bDate.getTime())) return 0;
        if (isNaN(aDate.getTime())) return 1;
        if (isNaN(bDate.getTime())) return -1;
        
        return bDate.getTime() - aDate.getTime();
      }
    },
    {
      label: "Created (Oldest First)",
      value: "created-asc",
      icon: Clock,
      sortFn: (a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        
        // Handle both Date objects and string dates
        const aDate = new Date(a.createdAt);
        const bDate = new Date(b.createdAt);
        
        // Check for invalid dates
        if (isNaN(aDate.getTime()) && isNaN(bDate.getTime())) return 0;
        if (isNaN(aDate.getTime())) return 1;
        if (isNaN(bDate.getTime())) return -1;
        
        return aDate.getTime() - bDate.getTime();
      }
    }
  ], []);

  const getCurrentSortOption = React.useCallback(() => {
    return sortOptions.find(option => option.value === currentSort) || sortOptions[0];
  }, [sortOptions, currentSort]);

  const handleSortChange = (sortValue: string) => {
    setCurrentSort(sortValue);
  };

  // Apply sorting to cards - Make sure we create a new array and sort it properly
  const sortedCards = React.useMemo(() => {
    if (!cards || cards.length === 0) return [];
    
    const currentSortOption = getCurrentSortOption();
    return [...cards].sort(currentSortOption.sortFn);
  }, [cards, getCurrentSortOption]);

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
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm font-semibold truncate text-zinc-900 dark:text-white">
              {title}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full">
              {cards.length}
            </span>
          </div>
          <div className="inline-flex items-center gap-1">
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "p-1 transition-all duration-200 rounded-full cursor-pointer",
                    "hover:opacity-70 hover:bg-zinc-200 dark:hover:bg-zinc-700",
                    "flex items-center gap-1"
                  )}
                >
                  <ArrowUpDown className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  <ChevronDown className="w-3 h-3 text-zinc-700 dark:text-zinc-300" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  <ArrowUpDown className="w-3 h-3" />
                  Sort Cards
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sortOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer text-xs py-2 px-2",
                        "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                        "transition-colors duration-150",
                        currentSort === option.value && "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                      )}
                    >
                      <Icon className="w-3 h-3 flex-shrink-0" />
                      <span className="flex-1 font-medium">{option.label}</span>
                      {currentSort === option.value && (
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <ColumnActionTooltipWrapper
              actionName="Delete Column"
              handleClick={openDeleteModal}
            >
              <Trash className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            </ColumnActionTooltipWrapper>
          </div>
        </div>

        <Droppable droppableId={columnId.toString()}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                "flex-1 h-full min-h-[200px] transition-all duration-300 ease-in-out",
                snapshot.isDraggingOver && 
                  "bg-emerald-50 dark:bg-emerald-900/20 border-2 border-dashed border-emerald-300 dark:border-emerald-500 rounded-xl mx-1 my-2 max-h-[85vh] shadow-inner"
              )}
            >
              <CardsInColumn columnName={title} cards={sortedCards} />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
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
        id={columnId.toString()}
        deleteItem={deleteColumnMutation}
      />
    </>
  );
};

export default ColumnView;
