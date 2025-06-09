import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon, 
  ArrowRightIcon, 
  TagIcon, 
  DatabaseZap, 
  Library, 
  Flag, 
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import ListViewContextMenu from './ListViewContextMenu';

import CardModal from './CardModal';
import { useCardMutation } from '../Card/_mutations/useCardMutations';
import { useMembers } from '@/hooks/useMembers';
import { useParams } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TUser } from '@/types';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCardColumn, updateCardOrder } from '@/apis/CardApis';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CardItem {
  id: number;
  title: string;
  order: number;
  description: string;
  columnId: number;
  labels: string[];
  attachments: any[];
  priority: 'low' | 'medium' | 'high' | 'urgent' | null;
  createdAt: string;
  dueDate: string | null;
  updatedAt: string;
  creatorId: number | null;
}

interface ListViewProps {
  data: {
    [key: string]: {
      id: number;
      cards: CardItem[];
    };
  };
  onEditItem?: (itemId: number) => void;
  onDeleteItem?: (itemId: number) => void;
  onMoveItem?: (itemId: number) => void;
  onScheduleItem?: (itemId: number) => void;
}

// Priority color mapping
const priorityConfig = {
  'low': { label: 'Low', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400' },
  'medium': { label: 'Medium', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  'high': { label: 'High', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' }, 
  'urgent': { label: 'Urgent', color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.05
    }
  }
};



const ListView = ({ 
  data,
  onEditItem,
  onDeleteItem,
  onMoveItem,
  onScheduleItem 
}: ListViewProps) => {
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { id } = useParams();
  const { members } = useMembers(id as string);
  const { updateCardMutation } = useCardMutation();
  const queryClient = useQueryClient();
  const accessToken = Cookies.get("accessToken") as string;

  // Drag and drop mutation for updating card column/order
  const moveCardMutation = useMutation({
    mutationFn: async ({ cardId, columnId, order }: { cardId: number; columnId: number; order: number }) => {
      await updateCardColumn(accessToken, cardId, columnId);
      await updateCardOrder(accessToken, cardId, order);
    },
    onMutate: async ({ cardId, columnId, order }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["columns", "boards", id] });

      // Snapshot the previous value
      const previousColumns = queryClient.getQueryData(["columns", "boards", id]);

      // Optimistically update the cache
      queryClient.setQueryData(["columns", "boards", id], (old: any) => {
        if (!old) return old;

        return old.map((column: any) => {
          // Remove card from source column
          if (column.cards.some((card: any) => card.id === cardId)) {
            return {
              ...column,
              cards: column.cards.filter((card: any) => card.id !== cardId)
            };
          }
          
          // Add card to destination column
          if (column.id === columnId) {
            const cardToMove = old
              .flatMap((col: any) => col.cards)
              .find((card: any) => card.id === cardId);
            
            if (cardToMove) {
              const updatedCard = { ...cardToMove, columnId, order };
              const newCards = [...column.cards, updatedCard].sort((a, b) => a.order - b.order);
              
              return {
                ...column,
                cards: newCards
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
        queryClient.setQueryData(["columns", "boards", id], context.previousColumns);
      }
    },
    onSettled: () => {
      // Always refetch to ensure we have the latest data
      queryClient.invalidateQueries({
        queryKey: ["columns", "boards", id],
      });
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
      console.error('Invalid card ID in drag operation');
      return;
    }

    // Find column IDs from titles
    const sourceColumnData = data[sourceColumnTitle];
    const destinationColumnData = data[destinationColumnTitle];
    
    if (!sourceColumnData || !destinationColumnData) {
      console.error('Source or destination column data not found');
      return;
    }
    
    const sourceColumnId = sourceColumnData.id;
    const destinationColumnId = destinationColumnData.id;
    const destinationCards = [...(destinationColumnData.cards || [])].sort((a, b) => a.order - b.order);

    if (!sourceColumnId || !destinationColumnId) {
      console.error('Source or destination column ID not found');
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
            <div key={columnTitle} className="mb-6">
              <h2 className="text-sm flex items-center gap-2 font-bold px-4 py-2 text-zinc-900 dark:text-zinc-100 w-full border dark:bg-zinc-800 bg-zinc-100 border-zinc-200 dark:border-zinc-800">
                <Library strokeWidth={2} className="size-4 " />
                {columnTitle}
              </h2>
              
              <Droppable droppableId={columnTitle}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "min-h-[100px] transition-all duration-300 ease-in-out",
                      snapshot.isDraggingOver && "bg-emerald-50 dark:bg-emerald-900/20 border-2 border-dashed border-emerald-300 dark:border-emerald-500 rounded-lg p-3 shadow-inner",
                      items.length === 0 && "border-2 border-dashed border-emerald-300/50 dark:border-emerald-500/50 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10"
                    )}
                  >
                    {items.map((item, index) => {
                      // Ensure item has required properties for drag and drop
                      if (!item || !item.id) {
                        console.warn('Item missing required properties:', item);
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
                                "group relative flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-all duration-300 ease-out",
                                snapshot.isDragging && "shadow-2xl z-50 rounded-lg scale-105 rotate-1 transform-gpu bg-white dark:bg-zinc-800 border-2 border-emerald-200 dark:border-emerald-700"
                              )}
                              onClick={() => {
                                setSelectedCard(item);
                                setIsModalOpen(true);
                              }}
                            >
                              <div className="flex items-center gap-3 flex-grow min-w-0">
                                {/* Title - Clickable area for opening card */}
                                <DatabaseZap className="size-4 text-zinc-500 dark:text-zinc-400" />

                                <span className="text-sm text-zinc-500 dark:text-zinc-200 font-bold font-gt-walsheim">
                                    {`${columnTitle.substring(0, 2).toUpperCase()} - ${item.id}`}
                                </span>

                                <div className="flex-grow truncate font-medium text-xs text-zinc-900 dark:text-zinc-100">
                                  {item.title}
                                </div>
                                
                                {/* Priority - Inline editable */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <div 
                                      className="flex items-center gap-1 hover:bg-muted rounded px-2 py-1 transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {item.priority && (item.priority === 'urgent' || item.priority === 'high') ? (
                                        <Badge className={`text-xs px-1.5 py-0.5 cursor-pointer ${priorityConfig[item.priority]?.color}`}>
                                          <Flag className="h-3 w-3 mr-1" />
                                          {priorityConfig[item.priority]?.label}
                                        </Badge>
                                      ) : (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                                          <Flag className="h-3 w-3" />
                                          <span>Priority</span>
                                        </div>
                                      )}
                                    </div>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent 
                                    align="start" 
                                    className="w-32"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      updatePriority(item.id, "urgent");
                                    }}>
                                      <Flag className="w-3 h-3 text-red-500 mr-2" />
                                      Urgent
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      updatePriority(item.id, "high");
                                    }}>
                                      <Flag className="w-3 h-3 text-amber-500 mr-2" />
                                      High
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      updatePriority(item.id, "medium");
                                    }}>
                                      <Flag className="w-3 h-3 text-blue-500 mr-2" />
                                      Medium
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      updatePriority(item.id, "low");
                                    }}>
                                      <Flag className="w-3 h-3 text-green-500 mr-2" />
                                      Low
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      updatePriority(item.id, "");
                                    }}>
                                      <Flag className="w-3 h-3 mr-2" />
                                      No priority
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Assignee - Inline editable */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <div 
                                      className="flex items-center gap-1 hover:bg-muted rounded px-2 py-1 transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <User className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">Assign</span>
                                    </div>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent 
                                    align="start" 
                                    className="w-40"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {members?.map((member: TUser) => (
                                      <DropdownMenuItem
                                        key={member.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateAssignee(item.id, member.id);
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
                                              <span className="text-xs">{member.username.charAt(0)}</span>
                                            )}
                                          </div>
                                          <span className="text-xs">{member.username}</span>
                                        </div>
                                      </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      updateAssignee(item.id, "");
                                    }}>
                                      <User className="w-3 h-3 mr-2" />
                                      Unassigned
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                
                                {/* Labels/Tags */}
                                {item.labels && item.labels.length > 0 && (
                                  <div 
                                    className="flex items-center gap-1.5 flex-shrink-0"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <TagIcon className="h-3 w-3 text-zinc-400" />
                                    <div className="flex gap-1">
                                      {item.labels.slice(0, 1).map((tag, index) => (
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
                              
                              <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                                {/* Due date - Inline editable */}
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <div 
                                      className="flex items-center gap-1 hover:bg-muted rounded px-2 py-1 transition-colors cursor-pointer"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <CalendarIcon className="h-3 w-3 text-zinc-500 dark:text-zinc-400" />
                                      {item.dueDate ? (
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                          {formatDistanceToNow(new Date(item.dueDate), { addSuffix: true })}
                                        </span>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">Set date</span>
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
                                      selected={item.dueDate ? new Date(item.dueDate) : undefined}
                                      onSelect={(date) => {
                                        if (date) {
                                          updateDueDate(item.id, date.toISOString());
                                        }
                                      }}
                                      initialFocus
                                      className="p-3"
                                    />
                                    <div className="p-3 border-t">
                                      {item.dueDate && (
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
                                      )}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                
                                {/* Arrow icon (visible on hover) */}
                                <ArrowRightIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
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
              className="flex flex-col items-center justify-center h-32 text-zinc-500 dark:text-zinc-400"
            >
              <p>No items found</p>
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
