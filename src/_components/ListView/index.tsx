import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { TagIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ListViewContextMenu from "./ListViewContextMenu";

import CardModal from "./CardModal";
import { useCardMutation } from "../Card/_mutations/useCardMutations";
import { useMembers } from "@/hooks/useMembers";
import { useParams } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TUser } from "@/types";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCardColumn } from "@/apis/CardApis";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeProvider";
import {
  LowPriority,
  UrgentPriority,
  HighPriority,
  MediumPriority,
  Priority,
} from "../shared/svg/Priority";
import { getPriorityIcon } from "../Projects/utils";
import { Assignee } from "../shared/svg/ListViewIcons";
import { DateCreatedIcon } from "../shared/svg/ViewOptionsIcons";
import { ViewOptions } from "@/store/useViewOptionsStore";
import { EmptyIcon } from "../shared/svg/SharedIcons";
import { ProjectIcon } from "../shared/svg/SidebarIcons";

interface CardItem {
  id: number;
  title: string;
  order: number;
  description: string;
  columnId: number;
  labels: string[];
  attachments: any[];
  priority: "low" | "medium" | "high" | "urgent" | null;
  createdAt: string;
  dueDate: string | null;
  updatedAt: string;
  creatorId: number | null;
  slug?: string;
}

interface ListViewProps {
  data: {
    [key: string]: {
      id: number;
      cards: CardItem[];
    };
  };
  viewOptions?: ViewOptions;
  members?: TUser[];
  onEditItem?: (itemId: number) => void;
  onDeleteItem?: (itemId: number) => void;
  onMoveItem?: (itemId: number) => void;
  onScheduleItem?: (itemId: number) => void;
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const ListView = ({
  data,
  viewOptions,
  members,
  onEditItem,
  onDeleteItem,
  onMoveItem,
  onScheduleItem,
}: ListViewProps) => {
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { slug } = useParams();
  const { members: hookMembers } = useMembers();
  const { updateCardMutation } = useCardMutation();
  const queryClient = useQueryClient();
  const { theme } = useTheme();

  // Use prop members if provided, otherwise fall back to hook
  const effectiveMembers = members || hookMembers;
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
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["columns", "workspaces", slug],
      });

      // Snapshot the previous value
      const previousColumns = queryClient.getQueryData([
        "columns",
        "workspaces",
        slug,
      ]);

      // Optimistically update the cache
      queryClient.setQueryData(["columns", "workspaces", slug], (old: any) => {
        if (!old) return old;

        return old.map((column: any) => {
          // Remove card from source column
          if (column.cards.some((card: any) => card.id === cardId)) {
            return {
              ...column,
              cards: column.cards.filter((card: any) => card.id !== cardId),
            };
          }

          // Add card to destination column
          if (column.id === columnId) {
            const cardToMove = old
              .flatMap((col: any) => col.cards)
              .find((card: any) => card.id === cardId);

            if (cardToMove) {
              const updatedCard = { ...cardToMove, columnId, order };
              const newCards = [...column.cards, updatedCard].sort(
                (a, b) => a.order - b.order
              );

              return {
                ...column,
                cards: newCards,
              };
            }
          }

          return column;
        });
      });

      return { previousColumns };
    },
    onError: (error, _, context) => {
      console.error("Error moving card:", error);
      toast.error("Failed to move card");

      // Rollback to previous state
      if (context?.previousColumns) {
        queryClient.setQueryData(
          ["columns", "workspaces", slug],
          context.previousColumns
        );
      }
    },
  });

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

    const sourceColumnTitle = source.droppableId;
    const destinationColumnTitle = destination.droppableId;
    const cardId = parseInt(draggableId);

    // Validate parsed cardId
    if (isNaN(cardId)) {
      console.error("Invalid card ID in drag operation");
      return;
    }

    // Find column IDs from titles
    const sourceColumnData = data[sourceColumnTitle];
    const destinationColumnData = data[destinationColumnTitle];

    if (!sourceColumnData || !destinationColumnData) {
      console.error("Source or destination column data not found");
      return;
    }

    const sourceColumnId = sourceColumnData.id;
    const destinationColumnId = destinationColumnData.id;
    const destinationCards = [...(destinationColumnData.cards || [])].sort(
      (a, b) => a.order - b.order
    );

    if (!sourceColumnId || !destinationColumnId) {
      console.error("Source or destination column ID not found");
      return;
    }

    // Prevent mutation if already in progress
    if (moveCardMutation.isPending) {
      return;
    }

    // Calculate new order based on destination index with better precision
    let newOrder: number;

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

    moveCardMutation.mutate({
      cardId,
      columnId: destinationColumnId,
      order: newOrder,
    });
  };

  const updatePriority = (cardId: number, priority: string) => {
    updateCardMutation.mutate({
      priority,
      cardId,
    });
  };

  const updateAssignee = (cardId: number, userId: string) => {
    updateCardMutation.mutate({
      cardId,
      assigneeId: userId,
    });
  };

  const updateDueDate = (cardId: number, dueDate: string) => {
    updateCardMutation.mutate({
      cardId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <motion.div
          className="flex flex-1 flex-col"
          initial="hidden"
          animate="visible"
          variants={listVariants}
        >
          {Object.entries(data).map(([columnTitle, columnData]) => {
            const items = columnData.cards || [];
            return (
              <div key={columnTitle}>
                <h2 className="text-sm flex items-center gap-2 font-bold px-4 py-2 text-zinc-900 dark:text-zinc-100 w-full border dark:bg-zinc-800 bg-zinc-100 border-zinc-200 dark:border-zinc-800">
                  <ProjectIcon className="size-4" />
                  {columnTitle}
                </h2>

                <Droppable droppableId={columnTitle}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "min-h-[100px] transition-all duration-300 ease-in-out",
                        snapshot.isDraggingOver &&
                          "bg-emerald-50 dark:bg-emerald-900/20 border-2 border-dashed border-emerald-300 dark:border-emerald-500 rounded-lg p-3 shadow-inner",
                        items.length === 0 &&
                          "border-2 border-dashed border-emerald-300/50 dark:border-emerald-500/50 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10"
                      )}
                    >
                      {items.map((item, index) => {
                        // Ensure item has required properties for drag and drop
                        if (!item || !item.id) {
                          console.warn(
                            "Item missing required properties:",
                            item
                          );
                          return null;
                        }

                        return (
                          <Draggable
                            key={`item-${item.id}`}
                            draggableId={item.id.toString()}
                            index={index}
                            isDragDisabled={false}
                          >
                            {(provided, snapshot) => (
                              <ListViewContextMenu
                                key={item.id}
                                cardId={item.id}
                                onEdit={() => onEditItem?.(item.id)}
                                onDelete={() => onDeleteItem?.(item.id)}
                                onMove={() => onMoveItem?.(item.id)}
                                onSchedule={() => onScheduleItem?.(item.id)}
                              >
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={cn(
                                    "group relative flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-all duration-300 ease-out h-10",
                                    snapshot.isDragging &&
                                      "shadow-2xl z-50 rounded-lg scale-105 rotate-1 transform-gpu bg-white dark:bg-zinc-800 border-2 border-emerald-200 dark:border-emerald-700"
                                  )}
                                  onClick={() => {
                                    setSelectedCard(item);
                                    setIsModalOpen(true);
                                  }}
                                >
                                  <div className="flex items-center gap-2.5 flex-grow min-w-0">
                                    {/* Title - Clickable area for opening card */}
                                    {viewOptions?.displayProperties.priority !==
                                      false && (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <div
                                            className="flex items-center gap-1 cursor-pointer"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            {item.priority ? (
                                              <div className="flex items-center gap-1">
                                                {getPriorityIcon(
                                                  item.priority,
                                                  theme
                                                )}
                                              </div>
                                            ) : (
                                              <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                                                <Priority className="size-3" />
                                              </div>
                                            )}
                                          </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                          align="start"
                                          className="w-32"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <DropdownMenuItem
                                            className="gap-2 text-xs"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              updatePriority(item.id, "urgent");
                                            }}
                                          >
                                            <UrgentPriority className="size-3" />
                                            Urgent
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="gap-2 text-xs"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              updatePriority(item.id, "high");
                                            }}
                                          >
                                            <HighPriority
                                              className="size-3"
                                              isDark={theme === "dark"}
                                            />
                                            High
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="gap-2 text-xs"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              updatePriority(item.id, "medium");
                                            }}
                                          >
                                            <MediumPriority
                                              className="size-3"
                                              isDark={theme === "dark"}
                                            />
                                            Medium
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="gap-2 text-xs"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              updatePriority(item.id, "low");
                                            }}
                                          >
                                            <LowPriority
                                              className="size-3"
                                              isDark={theme === "dark"}
                                            />
                                            Low
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="gap-2 text-xs"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              updatePriority(item.id, "");
                                            }}
                                          >
                                            <Priority className="size-3" />
                                            No priority
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
                                    {viewOptions?.showCardIds !== false && (
                                      <span className="text-sm text-zinc-500 dark:text-zinc-100/90 font-light font-id uppercase">
                                        {item.slug}
                                      </span>
                                    )}

                                    <div className="flex-grow truncate font-medium text-xs text-zinc-900 dark:text-zinc-100 ">
                                      {item.title}
                                    </div>

                                    {/* Priority - Inline editable */}

                                    {/* Assignee - Inline editable */}
                                    {viewOptions?.displayProperties.assignee !==
                                      false && (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <div
                                            className="flex items-center gap-1 hover:bg-muted rounded p-1 transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <Assignee className="size-5" />
                                          </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                          align="start"
                                          className="w-40"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {effectiveMembers?.map(
                                            (member: TUser) => (
                                              <DropdownMenuItem
                                                key={member.id}
                                                className="gap-2 text-xs"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  updateAssignee(
                                                    item.id,
                                                    member.id
                                                  );
                                                }}
                                              >
                                                <div className="flex items-center gap-2">
                                                  <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                                                    {member.imageUrl ? (
                                                      <img
                                                        src={member.imageUrl}
                                                        alt={member.username}
                                                        className="w-full h-full rounded-full"
                                                      />
                                                    ) : (
                                                      <span className="text-xs">
                                                        {member.username
                                                          ? member.username.charAt(
                                                              0
                                                            )
                                                          : ""}
                                                      </span>
                                                    )}
                                                  </div>
                                                  <span className="text-xs">
                                                    {member.username}
                                                  </span>
                                                </div>
                                              </DropdownMenuItem>
                                            )
                                          )}
                                          <DropdownMenuItem
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              updateAssignee(item.id, "");
                                            }}
                                          >
                                            <Assignee />
                                            Unassigned
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}

                                    {/* Labels/Tags */}
                                    {viewOptions?.displayProperties.labels !==
                                      false &&
                                      item.labels &&
                                      item.labels.length > 0 && (
                                        <div
                                          className="flex items-center justify-end gap-2 flex-shrink-0 min-w-fit"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <TagIcon className="h-3 w-3 text-zinc-400" />
                                          <div className="flex gap-1">
                                            {item.labels
                                              .slice(0, 1)
                                              .map((tag, index) => (
                                                <Badge
                                                  key={index}
                                                  variant="secondary"
                                                  className="text-xs px-1.5 py-0.5 font-medium border transition-colors hover:opacity-80 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                                                >
                                                  {tag}
                                                </Badge>
                                              ))}
                                            {item.labels.length > 1 && (
                                              <Badge
                                                variant="outline"
                                                className="text-xs px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-600"
                                              >
                                                +{item.labels.length - 1}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                  </div>

                                  <div className="flex items-center gap-2 flex-shrink-0 ml-1.5">
                                    {/* Due date - Inline editable */}
                                    {viewOptions?.displayProperties.dueDate !==
                                      false && (
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <div
                                            className="flex items-center gap-1 hover:bg-muted rounded p-1 transition-colors cursor-pointer min-w-fit"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <DateCreatedIcon className="size-5 text-zinc-500 dark:text-zinc-400" />
                                            {item.dueDate && (
                                              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                                {formatDistanceToNow(
                                                  new Date(item.dueDate),
                                                  { addSuffix: true }
                                                )}
                                              </span>
                                            )}
                                          </div>
                                        </PopoverTrigger>
                                        <PopoverContent
                                          className="w-auto p-0"
                                          align="start"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <CalendarComponent
                                            mode="single"
                                            selected={
                                              item.dueDate
                                                ? new Date(item.dueDate)
                                                : undefined
                                            }
                                            onSelect={(date) => {
                                              if (date) {
                                                updateDueDate(
                                                  item.id,
                                                  date.toISOString()
                                                );
                                              }
                                            }}
                                            initialFocus
                                            className="p-3"
                                          />
                                          {item.dueDate && (
                                            <div className="p-3 border-t">
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  updateDueDate(item.id, "");
                                                }}
                                              >
                                                Clear due date
                                              </Button>
                                            </div>
                                          )}
                                        </PopoverContent>
                                      </Popover>
                                    )}
                                  </div>
                                </div>
                              </ListViewContextMenu>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}

                      {/* Empty state for each column */}
                      {items.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center h-16 text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-700 rounded-md"
                        >
                          <p className="text-sm">No items in {columnTitle}</p>
                        </motion.div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}

          {/* Empty state when no data at all */}
          {Object.keys(data).length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400"
            >
              <span className="text-sm flex flex-col gap-1 items-center">
                <EmptyIcon className="size-5" />
                <div>No items found</div>
              </span>
            </motion.div>
          )}
        </motion.div>
      </DragDropContext>

      {/* Card Modal */}
      {selectedCard && (
        <CardModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCard(null);
          }}
          card={selectedCard}
        />
      )}
    </>
  );
};

export default ListView;
