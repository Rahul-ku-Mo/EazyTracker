import { useContext, useState } from "react";
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
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Badge } from "../../components/ui/badge";
import CardView from "./_cardViewerPanel/CardView";
import CardContextMenu from "./CardContextMenu";
import { useCardMutation } from "./_mutations/useCardMutations";
import { ColumnContext } from "../../Context/ColumnProvider";
import { CardContext } from "../../Context/CardProvider";
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

const CardTitle = ({ title }: { title: string }) => (
  <h3 className="pb-2 text-base font-bold truncate line-clamp-1 text-foreground ">
    {title}
  </h3>
);

const CardDescription = ({ description }: { description?: string }) => {
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
        "editor-readable-font"
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
        bg: "bg-red-500 dark:bg-red-500"
      };
    case "high":
      return {
        text: "text-amber-500 dark:text-amber-500",
        border: "border-amber-500 dark:border-amber-500",
        bg: "bg-amber-500 dark:bg-amber-500"
      };
    case "medium":
      return {
        text: "text-blue-500 dark:text-blue-500",
        border: "border-blue-500 dark:border-blue-500",
        bg: "bg-blue-500 dark:bg-blue-500"
      };
    case "low":
      return {
        text: "text-green-500 dark:text-green-500",
        border: "border-green-500 dark:border-green-500",
        bg: "bg-green-500 dark:bg-green-500"
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
}: {
  dueDate?: Date;
  attachmentsCount?: number;
  commentsCount?: number;
  assignee?: TUser;
  priority?: string;
  labels?: string[];
}) => {
  const priorityStyles = getPriorityStyles(priority);

  return (
    <div className="flex items-center justify-between h-10 gap-3 p-2 border-t rounded-b-lg border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
      <div className="flex items-center gap-0.5 text-[10px]">
        <CalendarClockIcon
          className="w-3 h-3 text-zinc-700 dark:text-zinc-300 "
          strokeWidth={3}
        />
        <div className="font-bold relative top-0.5 text-zinc-700 dark:text-zinc-300">
          {dueDate
            ? new Date(dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "--"}
        </div>
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

  const { title, description, dueDate, priority, id, labels } =
    cardDetails as TCardContext;

  const columnId = useContext(ColumnContext);

  const { deleteCardMutation, createCardMutation } = useCardMutation();

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);

  const openDueDateDialog = () => setIsDueDateOpen(true);
  const closeDueDateDialog = () => setIsDueDateOpen(false);

  const items = [
    {
      icon: <ExternalLink className="w-3 h-3 mr-2" />,
      label: "Open card",
      onClick: openModal,
      shortcut: "⌘O",
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

  return (
    <>
      <CardContextMenu items={items} cardId={id}>
        <div
          onDoubleClick={openModal}
          className={cn(
            "bg-white dark:bg-zinc-800",
            "text-zinc-900 dark:text-zinc-100",
            "border border-zinc-200 dark:border-zinc-700",
            "rounded-lg pt-2 mt-2 relative",
            "transition-all duration-200",
            "flex flex-col justify-between",
            "text-xs",
            "min-h-[100px] max-h-[200px]",
            "shadow-md dark:shadow-zinc-900/50",
            index === totalCards - 1 && "mb-10"
          )}
        >
          <div className="px-2">
            <CardTitle title={title} />
          </div>

          <CardDescription description={description} />

          <CardFooter dueDate={dueDate} priority={priority} labels={labels} />
        </div>
      </CardContextMenu>

      <CardView
        isOpen={isOpen}
        closeModal={closeModal}
        columnName={columnName}
      />

      <DueDateDialog
        cardId={id}
        isOpen={isDueDateOpen}
        closeDialog={closeDueDateDialog}
      />
    </>
  );
};

export default Card;
