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

type TUser = {
  username: string;
  imageUrl?: string;
};
interface CardProps {
  columnName: string;
  index: number;
  totalCards: number;
}

const CardTitle = ({ title, isCompleted }: { title: string; isCompleted?: boolean }) => (
  <h3 className={cn(
    "pb-2 text-base font-bold truncate line-clamp-1 text-foreground",
    isCompleted && "line-through text-zinc-500 dark:text-zinc-400"
  )}>
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

const CardFooter = ({
  dueDate,
  attachmentsCount = 0,
  commentsCount = 0,
  assignee,
  priority,
  labels,
  status,
}: {
  dueDate?: Date;
  attachmentsCount?: number;
  commentsCount?: number;
  assignee?: TUser;
  priority?: string;
  labels?: string[];
  status?: {
    isCompleted: boolean;
    isOverdue: boolean;
    isOnTime: boolean | null;
    daysOverdue: number;
  };
}) => {
  const priorityStyles = getPriorityStyles(priority);

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
          <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium", statusInfo.bg)}>
            <statusInfo.icon className={cn("w-2.5 h-2.5", statusInfo.color)} strokeWidth={2.5} />
            <span className={statusInfo.color}>
              {statusInfo.text}
            </span>
          </div>
        )}

        {/* Due date (only show if not completed or overdue) */}
        {!statusInfo && dueDate && (
          <div className="flex items-center gap-0.5">
            <CalendarClockIcon
              className="w-3 h-3 text-zinc-700 dark:text-zinc-300"
              strokeWidth={3}
            />
            <div className="font-bold relative top-0.5 text-zinc-700 dark:text-zinc-300">
              {new Date(dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {priority && (
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] px-1.5 py-0  flex items-center gap-1 font-semibold border rounded-full capitalize",
              priorityStyles?.text,

              "border-zinc-200",
              priorityStyles?.border
            )}
          >
            <div
              className={cn("w-2 h-2 rounded-full ", priorityStyles?.bg)}
            ></div>
            {priority}
          </Badge>
        )}
        {attachmentsCount > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-zinc-700 dark:text-zinc-300">
            <Paperclip className="w-3 h-3" />
            <span>{attachmentsCount}</span>
          </div>
        )}
        {labels && labels.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-zinc-700 dark:text-zinc-300">
            <Tag className="w-3 h-3" />
            <span>{labels.length}</span>
          </div>
        )}
        {commentsCount > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-zinc-700 dark:text-zinc-300">
            <MessageSquare className="w-3 h-3" />
            <span>{commentsCount}</span>
          </div>
        )}
        {assignee && (
          <Avatar className="w-4 h-4">
            <AvatarImage src={assignee?.imageUrl} />
            <AvatarFallback className="text-[8px] bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {assignee.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
};

const Card = ({ columnName, index, totalCards }: CardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const [isDueDateOpen, setIsDueDateOpen] = useState(false);

  const cardDetails = useContext(CardContext);

  const { title, description, dueDate, priority, id, labels, completedAt } =
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
            "bg-white dark:bg-zinc-800 hover:dark:bg-zinc-700/70",
            "text-zinc-900 dark:text-zinc-100",
            "border border-zinc-200 dark:border-none",
            "rounded-lg pt-2 mt-4 relative",
            "transition-all ease-linear",
            "flex flex-col justify-between",
            "text-xs",
            "h-[200px]",
            "shadow-md dark:shadow-none",
            "cursor-pointer relative",
            "group",
            index === totalCards - 1 && "mb-10",
            status.isCompleted && "opacity-75 bg-zinc-50 dark:bg-zinc-800/50",
            status.isOverdue && "border-red-200 dark:border-red-800/50"
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
            <CardTitle title={title} isCompleted={status.isCompleted} />
          </div>

          <CardDescription description={description} isCompleted={status.isCompleted} />

          <CardFooter dueDate={dueDate} priority={priority} labels={labels} status={status} />
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
