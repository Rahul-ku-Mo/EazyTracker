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
  Clock,
  UserCircle2Icon,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Badge } from "../../components/ui/badge";
import CardView from "./CardView";
import CardContextMenu from "./CardContextMenu";
import { useCardMutation } from "./_mutations/useCardMutations";
import { ColumnContext } from "../../Context/ColumnProvider";
import { CardContext } from "../../Context/CardProvider";
import { TCardContext } from "../../types/cardTypes";
import { DueDateDialog } from "./_dialog/DueDateDialog";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";

type TUser = {
  username: string;
  imageUrl?: string;
}
interface CardProps {
  columnName: string;
  index: number;
  totalCards: number;
}

const CardTitle = ({ title }: { title: string }) => (
  <h3 className="text-sm font-medium line-clamp-1 text-foreground">{title}</h3>
);

const CardDescription = ({ description }: { description: string }) => {
  if (!description) {
    return <div className="flex-1 h-8" />;
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: description }}
      className={cn(
        "text-xs text-muted-foreground/80 w-full",
        "break-all overflow-y-auto",
        "prose prose-sm dark:prose-invert",
        "grow basis-full"
      )}
    />
  );
};

const getPriorityStyles = (priority?: string) => {
  switch (priority?.toLowerCase()) {
    case "urgent":
      return {
        text: "text-red-500 dark:text-red-100",
        border: "border-red-500/30 dark:border-red-800",
        bg: "bg-red-500/[0.05] dark:bg-red-800",
      };
    case "high":
      return {
        text: "text-amber-500 dark:text-amber-100",
        border: "border-amber-500/30 dark:border-amber-800",
        bg: "bg-amber-500/[0.05] dark:bg-amber-800",
      };
    case "medium":
      return {
        text: "text-blue-500 dark:text-blue-100",
        border: "border-blue-500/30 dark:border-blue-800",
        bg: "bg-blue-500/[0.05] dark:bg-blue-800",
      };
    case "low":
      return {
        text: "text-green-500 dark:text-green-100",
        border: "border-green-500/30 dark:border-green-800",
        bg: "bg-green-500/[0.05] dark:bg-green-800",
      };
  }
};

const CardFooter = ({
  dueDate,
  attachmentsCount = 0,
  commentsCount = 0,
  assignee,
}: {
  dueDate?: Date;
  attachmentsCount?: number;
  commentsCount?: number;
  assignee?: TUser;
}) => {
  return (
    <div className="flex items-center justify-between gap-3 mt-1 text-muted-foreground">
      <div className="flex items-center gap-1 text-xs">
        <Clock className="w-3 h-3" />
        <span className="font-thin text-zinc-200/80">
          {dueDate
            ? new Date(dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "--"}
        </span>
      </div>

      {attachmentsCount > 0 && (
        <div className="flex items-center gap-1 text-[10px]">
          <Paperclip className="w-3 h-3" />
          <span>{attachmentsCount}</span>
        </div>
      )}
      {commentsCount > 0 && (
        <div className="flex items-center gap-1 text-[10px]">
          <MessageSquare className="w-3 h-3" />
          <span>{commentsCount}</span>
        </div>
      )}
      {assignee && (
        <Avatar className="h-4 w-4">
          <AvatarImage src={assignee?.imageUrl} />
          <AvatarFallback className="text-[8px]">
            {assignee.username.slice(0,2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      
    </div>
  );
};
const Card = ({ columnName, index, totalCards }: CardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const [isDueDateOpen, setIsDueDateOpen] = useState(false);

  const cardDetails = useContext(CardContext);

  const { title, description, dueDate, priority, id } =
    cardDetails as TCardContext;

  const priorityStyles = getPriorityStyles(priority);

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
      icon: <UserCircle2Icon className="w-3 h-3 mr-2" />,
      label: "Assignee",
      onClick: () => {},
      shortcut: "⌘A",
    },
    {
      icon: <Calendar className="w-3 h-3 mr-2" />,
      label: "Set due date",
      onClick: openDueDateDialog,
      shortcut: "⌘D",
    },
    {
      icon: <Flag className="w-3 h-3 mr-2" />,
      label: "Set priority",
      shortcut: "⌘P",
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
            "text-foreground",
            "rounded-md p-2 mt-2",
            "transition-all duration-200",
            "flex flex-col justify-between",
            "text-xs ",
            "min-h-[100px] max-h-[200px]",
            index === totalCards - 1 && "mb-10"
          )}
        >
          <div className="flex flex-col gap-2">
            {priority && (
              <div className="flex items-center gap-1 text-[10px]">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-2 py-0 font-semibold border-2 rounded-sm capitalize",
                    priorityStyles?.text,
                    priorityStyles?.border,
                    priorityStyles?.bg
                  )}
                >
                  {priority}
                </Badge>
              </div>
            )}
            <CardTitle title={title} />
          </div>
          {description && <CardDescription description={description} />}

          <CardFooter dueDate={dueDate} />
        </div>
      </CardContextMenu>

      <CardView
        closeModal={closeModal}
        isOpen={isOpen}
        title={title}
        cardId={id}
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
