import { useContext, useRef, useState } from "react";
import {
  Calendar,
  Copy,
  Flag,
  Tag,
  Trash2,
  ExternalLink,
  Paperclip,
  MessageSquare,
  CalendarClockIcon,
  UserCircle2Icon,
  EllipsisVerticalIcon,
  CheckCircle2,
  Circle,
  AlertTriangle,
  AlertCircle,
  Minus,
  User,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Badge } from "../../components/ui/badge";
import CardView from "./_cardViewerPanel/CardView";
import CardContextMenu from "./CardContextMenu";
import { useCardMutation } from "./_mutations/useCardMutations";
import { ColumnContext } from "../../context/ColumnProvider";
import { CardContext } from "../../context/CardProvider";
import { TCardContext } from "../../types/cardTypes";
import { DueDateDialog } from "./_dialog/DueDateDialog";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/ui/avatar";
import { ViewOptions } from "@/store/useViewOptionsStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Calendar as CalendarComponent } from "../../components/ui/calendar";
import { Button } from "../../components/ui/button";
import { useMembers } from "../../hooks/useMembers";
import { useParams } from "react-router-dom";
import { formatDistanceToNow, format } from "date-fns";
import { TUser } from "../../types";
import { Input } from "../../components/ui/input";

interface CardProps {
  columnName: string;
  viewOptions?: ViewOptions;
}

const CardTitle = ({ title, isCompleted, cardId, showCardId }: { 
  title: string; 
  isCompleted?: boolean;
  cardId?: number;
  showCardId?: boolean;
}) => (
  <h3 className={cn(
    "pb-2 text-base font-bold truncate line-clamp-1 text-foreground",
    isCompleted && "line-through text-zinc-500 dark:text-zinc-400"
  )}>
    {showCardId && cardId && (
      <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400 mr-2">
        #{cardId}
      </span>
    )}
    {title}
  </h3>
);

const CardDescription = ({ description, isCompleted }: { description?: string; isCompleted?: boolean }) => {
  if (!description) {
    return <div className="flex-1 h-8 px-2" />;
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: description }}
      className={cn(
        "dark:text-muted-foreground w-full h-[112px]",
        "break-all ",
        "truncate",
        "grow basis-full",
        "px-2 pb-2",
        "card-editor-view",
        "editor-readable-font text-xs",
        isCompleted && "line-through text-zinc-500 dark:text-zinc-400"
      )}
    />
  );
};

const getPriorityStyles = (priority?: string) => {
  switch (priority?.toLowerCase()) {
    case "urgent":
      return {
        text: "text-red-500 dark:text-red-500",
        border: "border-red-500 dark:border-red-500",
        bg: "bg-red-500 dark:bg-red-500",
      };
    case "high":
      return {
        text: "text-amber-500 dark:text-amber-500",
        border: "border-amber-500 dark:border-amber-500",
        bg: "bg-amber-500 dark:bg-amber-500",
      };
    case "medium":
      return {
        text: "text-blue-500 dark:text-blue-500",
        border: "border-blue-500 dark:border-blue-500",
        bg: "bg-blue-500 dark:bg-blue-500",
      };
    case "low":
      return {
        text: "text-green-500 dark:text-green-500",
        border: "border-green-500 dark:border-green-500",
        bg: "bg-green-500 dark:bg-green-500",
      };
    default:
      return undefined;
  }
};

const getPriorityIcon = (priority?: string) => {
  switch (priority?.toLowerCase()) {
    case "urgent":
      return <AlertCircle className="w-3 h-3 text-white" />;
    case "high":
      return <AlertTriangle className="w-3 h-3 text-white" />;
    case "medium":
      return <Circle className="w-3 h-3 text-white" />;
    case "low":
      return <Circle className="w-3 h-3 text-white" />;
    default:
      return <Minus className="w-3 h-3 text-white" />;
  }
};



const CardFooter = ({
  dueDate,
  attachmentsCount = 0,
  commentsCount = 0,
  assignees = [],
  priority,
  labels,
  status,
  cardId,
  dateFormat = 'readable',
}: {
  dueDate?: Date;
  attachmentsCount?: number;
  commentsCount?: number;
  assignees?: Array<{
    id: string;
    name: string;
    email: string;
    username?: string;
    imageUrl?: string;
  }>;
  priority?: string;
  labels?: string[];
  status?: {
    isCompleted: boolean;
    isOverdue: boolean;
    isOnTime: boolean | null;
    daysOverdue: number;
  };
  cardId: number;
  dateFormat?: 'readable' | 'calendar';
}) => {
  const priorityStyles = getPriorityStyles(priority);
  const { id } = useParams();
  const { members } = useMembers(id as string);
  const { updateCardMutation } = useCardMutation();

  const updatePriority = (newPriority: string) => {
    updateCardMutation.mutate({
      priority: newPriority,
      cardId,
    });
  };

  const updateAssignee = (userId: string) => {
    updateCardMutation.mutate({
      cardId,
      assigneeId: userId,
    });
  };

  const updateDueDate = (date: Date | null) => {
    updateCardMutation.mutate({
      cardId,
      dueDate: date || undefined,
    });
  };

  const updateLabel = (label: string) => {
    updateCardMutation.mutate({
      cardId,
      label,
    });
  };

  const [newLabel, setNewLabel] = useState("");
  const predefinedLabels = [
    "Bug", "Feature", "Enhancement", "Documentation"
  ];

  // Status indicator for footer
  const getStatusInfo = () => {
    if (status?.isCompleted) {
      return {
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-100 dark:bg-green-900/30",
        text: status.isOnTime ? "Completed" : "Completed late",
        icon: CheckCircle2,
      };
    }
    if (status?.isOverdue) {
      return {
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-100 dark:bg-red-900/30", 
        text: `Overdue ${status.daysOverdue}d`,
        icon: AlertTriangle,
      };
    }
    return null;
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="flex items-center justify-between h-10 gap-3 p-2 border-t rounded-b-lg border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900">
      <div className="flex items-center gap-2 text-[10px]">
        {/* Status indicator */}
        {statusInfo && (
          <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] leading-3 font-medium", statusInfo.bg)}>
            <statusInfo.icon className={cn("w-2.5 h-2.5", statusInfo.color)} strokeWidth={2.5} />
            <div className={statusInfo.color}>
              {statusInfo.text}
            </div>
          </div>
        )}

        {/* Due date - Inline editable */}
        {!statusInfo && (
          <Popover>
            <PopoverTrigger asChild>
              <div 
                className="flex items-center gap-0.5 hover:bg-muted rounded px-1 py-0.5 transition-colors cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                {dueDate ? (
                  <>
                    <CalendarClockIcon className="w-3 h-3 text-zinc-700 dark:text-zinc-300" strokeWidth={3} />
                    <div className="font-bold relative top-0.5 text-zinc-700 dark:text-zinc-300 text-[10px]">
                      {dateFormat === 'readable' 
                        ? formatDistanceToNow(new Date(dueDate), { addSuffix: true })
                        : format(new Date(dueDate), 'MMM dd, yyyy')
                      }
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer">
                    <CalendarClockIcon className="h-3 w-3" strokeWidth={3} />
                  </div>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-0" 
              align="start"
              side="top" 
              sideOffset={8}
              onClick={(e) => e.stopPropagation()}
              style={{ zIndex: 9999 }}
            >
              <CalendarComponent
                mode="single"
                selected={dueDate ? new Date(dueDate) : undefined}
                onSelect={(date) => {
                  updateDueDate(date || null);
                }}
                initialFocus
                className="p-3"
              />
              <div className="p-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateDueDate(null);
                  }}
                >
                  Clear due date
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div 
              className="flex items-center gap-1 hover:bg-muted rounded px-1 py-0.5 transition-colors cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              {priority && (priority.toLowerCase() === 'urgent' || priority.toLowerCase() === 'high') && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[9px] px-1.5 py-0.5 h-4 font-medium border transition-colors hover:opacity-80",
                    priorityStyles?.bg,
                    priorityStyles?.border,
                    "text-white"
                  )}
                  title={`Priority: ${priority}`}
                >
                  {getPriorityIcon(priority)}
                </Badge>
              )}
              {(!priority || (priority.toLowerCase() !== 'urgent' && priority.toLowerCase() !== 'high')) && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer">
                  <Flag className="h-3 w-3" />
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
              updatePriority("urgent");
            }}>
              <Flag className="w-3 h-3 text-red-500 mr-2" />
              Urgent
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              updatePriority("high");
            }}>
              <Flag className="w-3 h-3 text-amber-500 mr-2" />
              High
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              updatePriority("medium");
            }}>
              <Flag className="w-3 h-3 text-blue-500 mr-2" />
              Medium
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              updatePriority("low");
            }}>
              <Flag className="w-3 h-3 text-green-500 mr-2" />
              Low
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              updatePriority("");
            }}>
              <Flag className="w-3 h-3 mr-2" />
              No priority
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {attachmentsCount > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-zinc-700 dark:text-zinc-300">
            <Paperclip className="w-3 h-3" />
            <span>{attachmentsCount}</span>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div 
              className="flex items-center gap-1 hover:bg-muted rounded px-1 py-0.5 transition-colors cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              {labels && labels.length > 0 ? (
                <div className="flex items-center gap-1 flex-nowrap">
                  {labels.slice(0, 1).map((label, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className={cn(
                        "text-[9px] px-1.5 py-0.5 h-4 font-medium border transition-colors shrink-0",
                        "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700",
                        "hover:opacity-80 truncate max-w-[80px]"
                      )}
                      title={label}
                    >
                      {label}
                    </Badge>
                  ))}
                  {labels.length > 1 && (
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1.5 py-0.5 h-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-600 shrink-0"
                    >
                      +{labels.length - 1}
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer">
                  <Tag className="h-3 w-3" />
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            className="w-60"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2">
              <Input
                placeholder="Add new label..."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newLabel.trim()) {
                    e.stopPropagation();
                    updateLabel(newLabel.trim());
                    setNewLabel("");
                  }
                }}
                className="text-xs h-7"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="border-t" />
            {predefinedLabels.map((label) => (
              <DropdownMenuItem 
                key={label}
                onClick={(e) => {
                  e.stopPropagation();
                  updateLabel(label);
                }}
              >
                <Tag className="w-3 h-3 mr-2" />
                {label}
              </DropdownMenuItem>
            ))}
            {labels && labels.length > 0 && (
              <>
                <div className="border-t" />
                <div className="p-2 text-xs text-muted-foreground">Current labels:</div>
                {labels.map((label, index) => (
                  <DropdownMenuItem 
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Remove label functionality could be added here
                    }}
                    className="text-xs"
                  >
                    <Badge 
                      variant="secondary" 
                      className="text-[9px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                    >
                      {label}
                    </Badge>
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {commentsCount > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-zinc-700 dark:text-zinc-300">
            <MessageSquare className="w-3 h-3" />
            <span>{commentsCount}</span>
          </div>
        )}
        <DropdownMenu>
                    <DropdownMenuTrigger asChild>
            <div 
              className="flex items-center gap-1 hover:bg-muted rounded px-1 py-0.5 transition-colors cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              {assignees && assignees.length > 0 ? (
                <div className="flex items-center -space-x-1">
                  {assignees.slice(0, 3).map((assignee, index) => (
                    <Avatar 
                      key={assignee.id} 
                      className="w-4 h-4 border border-white dark:border-zinc-800 relative"
                      style={{ zIndex: assignees.length - index }}
                    >
                      <AvatarImage src={assignee.imageUrl} />
                      <AvatarFallback className="text-[8px] bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {(assignee.name || assignee.username || assignee.email)?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {assignees.length > 3 && (
                    <div className="w-4 h-4 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center text-[8px] text-zinc-600 dark:text-zinc-300 border border-white dark:border-zinc-800">
                      +{assignees.length - 3}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer">
                  <User className="h-3 w-3" />
                </div>
              )}
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
                  updateAssignee(member.id);
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
              updateAssignee("");
            }}>
              <User className="w-3 h-3 mr-2" />
              Unassigned
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

const Card = ({ columnName, viewOptions }: CardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const [isDueDateOpen, setIsDueDateOpen] = useState(false);

  const cardDetails = useContext(CardContext);

  const { title, description, dueDate, priority, id, labels, completedAt, assignees } =
    cardDetails as TCardContext;

  const columnId = useContext(ColumnContext);

  const cardWrapperRef = useRef<HTMLDivElement>(null); // Ref for the context menu trigger element

  const { deleteCardMutation, createCardMutation, markCompleteCardMutation, markIncompleteCardMutation } = useCardMutation();

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);

  const openDueDateDialog = () => setIsDueDateOpen(true);
  const closeDueDateDialog = () => setIsDueDateOpen(false);

  // Helper function to calculate card status
  const getCardStatus = () => {
    const now = new Date();
    const isCompleted = !!completedAt;
    const isOverdue = !isCompleted && dueDate ? new Date(dueDate) < now : false;
    
    return {
      isCompleted,
      isOverdue,
      isOnTime: (cardDetails as TCardContext).isOnTime ?? null,
      daysOverdue: isOverdue && dueDate
        ? Math.ceil((now.getTime() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0
    };
  };

  const status = getCardStatus();

  const handleToggleCompletion = () => {
    if (status.isCompleted) {
      markIncompleteCardMutation.mutate(id);
    } else {
      markCompleteCardMutation.mutate(id);
    }
  };

  const handleCompletionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleToggleCompletion();
  };

  const items = [
    {
      icon: <ExternalLink className="w-3 h-3 mr-2" />,
      label: "Open card",
      onClick: () => openModal(),
      shortcut: "⌘O",
    },
    {
      icon: status.isCompleted ? <Circle className="w-3 h-3 mr-2" /> : <CheckCircle2 className="w-3 h-3 mr-2" />,
      label: status.isCompleted ? "Mark incomplete" : "Mark complete",
      onClick: () => handleToggleCompletion(),
      shortcut: "⌘⏎",
    },
    {
      icon: <Flag className="w-3 h-3 mr-2" />,
      label: "Set priority",
      shortcut: "⌘P",
    },
    {
      icon: <Calendar className="w-3 h-3 mr-2" />,
      label: "Set due date",
      onClick: openDueDateDialog,
      shortcut: "⌘D",
    },
    {
      icon: <UserCircle2Icon className="w-3 h-3 mr-2" />,
      label: "Assignee",
      onClick: () => {},
      shortcut: "⌘A",
    },

    {
      icon: <Tag className="w-3 h-3 mr-2" />,
      label: "Add label",
      onClick: () => {},
      shortcut: "⌘L",
    },
    {
      icon: <Copy className="w-3 h-3 mr-2" />,
      label: "Duplicate",
      onClick: () => {
        createCardMutation.mutate({
          title,
          description,
          columnId,
        });
      },
      shortcut: "⌘C",
    },
    {
      icon: <Trash2 className="w-3 h-3 mr-2 text-destructive" />,
      label: "Delete card",
      onClick: () => {
        deleteCardMutation.mutate(id);
      },
      shortcut: "⌫",
      className: "text-destructive",
    },
  ];

  const handleEllipsisClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation(); // IMPORTANT: Prevent the card's main onClick (openModal)

    if (cardWrapperRef.current) {
      // Create a synthetic contextmenu event
      const contextMenuEvent = new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: false, // Usually false for contextmenu? Check library behavior. True might be safer.
        clientX: e.clientX, // Use coords from the click event
        clientY: e.clientY,
        button: 2, // Simulate right button
      });

      // Dispatch the event on the element wrapped by CardContextMenu
      cardWrapperRef.current.dispatchEvent(contextMenuEvent);
    }
  };

  return (
    <>
      <CardContextMenu items={items} cardId={id.toString()}>
        <div
         ref={cardWrapperRef}
          onClick={openModal}
          className={cn(
            "bg-white dark:bg-zinc-800 hover:bg-zinc-50 hover:dark:bg-zinc-700/70",
            "text-zinc-900 dark:text-zinc-100",
            "border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600",
            "rounded-lg pt-2 relative",
            "transition-all duration-300 ease-out",
            "flex flex-col justify-between",
            "text-xs",
            "h-[200px]",
            "shadow-md hover:shadow-lg dark:shadow-none dark:hover:shadow-zinc-900/20",
            "cursor-pointer relative",
            "group",
            "hover:scale-[1.02] active:scale-[0.98] transform-gpu",
            status.isCompleted && "opacity-75 bg-zinc-50 dark:bg-zinc-800/50",
            status.isOverdue && "border-red-200 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700"
          )}
        >
          {/* Completion checkbox - Linear style */}
          <div className="absolute top-3 left-3 z-10">
            <button
              onClick={handleCompletionClick}
              className={cn(
                "size-4 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                "hover:scale-110 active:scale-95",
                status.isCompleted
                  ? "bg-green-500 border-green-500 text-white"
                  : "border-zinc-300 dark:border-zinc-600 hover:border-green-500 dark:hover:border-green-400"
              )}
            >
              {status.isCompleted && (
                <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
              )}
            </button>
          </div>

          <div className="px-2 pl-10">
            <CardTitle 
              title={title} 
              isCompleted={status.isCompleted}
              cardId={id}
              showCardId={viewOptions?.showCardIds || false}
            />
          </div>

          {viewOptions?.displayProperties.description !== false && (
            <CardDescription description={description} isCompleted={status.isCompleted} />
          )}

          <CardFooter 
            dueDate={viewOptions?.displayProperties.dueDate !== false ? dueDate : undefined} 
            priority={viewOptions?.displayProperties.priority !== false ? priority : undefined} 
            labels={viewOptions?.displayProperties.labels !== false ? labels : undefined} 
            status={status} 
            assignees={viewOptions?.displayProperties.assignee !== false ? assignees : undefined}
            cardId={id}
            dateFormat={viewOptions?.dateFormat || 'readable'}
          />
          <div 
              className="absolute top-2 right-2 bg-zinc-100 dark:bg-zinc-900/50 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all ease-linear cursor-pointer"
              onClick={(e) => {
                handleEllipsisClick(e);
              }}
              onContextMenu={(e) => {
                e.stopPropagation();
              }}
            >
              <EllipsisVerticalIcon className="size-5 text-zinc-900 dark:text-zinc-100" />
            </div>
        </div>
      </CardContextMenu>

      <CardView
        isOpen={isOpen}
        closeModal={closeModal}
        columnName={columnName}
      />

      <DueDateDialog
        cardId={id.toString()}
        isOpen={isDueDateOpen}
        closeDialog={closeDueDateDialog}
      />
    </>
  );
};

export default Card;
