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
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Badge } from "../../components/ui/badge";
import CardView from "./CardView";
import CardContextMenu from "./CardContextMenu";
import { useCardMutation } from "./_mutations/useCardMutations";
import { ColumnContext } from "../../Context/ColumnProvider";
import { CardContext } from "../../Context/CardProvider";
import { TCardContext } from "../../types/cardTypes";

interface CardProps {
  columnName: string;
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
        "text-sm tracking-wide text-muted-foreground",
        "break-words overflow-y-auto",
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
        text: "text-red-500 dark:text-red-400",
        border: "border-red-500/30 dark:border-red-400/30",
        bg: "bg-red-500/[0.05] dark:bg-red-400/[0.05]",
      };
    case "high":
      return {
        text: "text-amber-500 dark:text-amber-400",
        border: "border-amber-500/30 dark:border-amber-400/30",
        bg: "bg-amber-500/[0.05] dark:bg-amber-400/[0.05]",
      };
    case "medium":
      return {
        text: "text-blue-500 dark:text-blue-400",
        border: "border-blue-500/30 dark:border-blue-400/30",
        bg: "bg-blue-500/[0.05] dark:bg-blue-400/[0.05]",
      };
    case "low":
      return {
        text: "text-green-500 dark:text-green-400",
        border: "border-green-500/30 dark:border-green-400/30",
        bg: "bg-green-500/[0.05] dark:bg-green-400/[0.05]",
      };
  }
};

const CardFooter = ({
  dueDate,
  attachmentsCount = 0,
  commentsCount = 0,
}: {
  dueDate?: Date;
  attachmentsCount?: number;
  commentsCount?: number;
}) => {
  return (
    <div className="flex items-center justify-between gap-3 mt-1 text-muted-foreground">
      <div className="flex items-center gap-1 text-xs">
        <Clock className="w-3 h-3" />
        <span>
          {dueDate
            ? new Date(dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "No due date"}
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
    </div>
  );
};
const Card = ({ columnName }: CardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const cardDetails = useContext(CardContext);

  const { title, description, dueDate, priority, id } =
    cardDetails as TCardContext;

  const priorityStyles = getPriorityStyles(priority);

  const columnId = useContext(ColumnContext);

  const { deleteCardMutation, createCardMutation } = useCardMutation();

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);

  const items = [
    {
      icon: <Calendar className="w-3 h-3 mr-2" />,
      label: "Set due date",
      onClick: () => {},
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
      icon: <ExternalLink className="w-3 h-3 mr-2" />,
      label: "Open card",
      onClick: openModal,
      shortcut: "⌘O",
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
            "rounded-md p-2 m-1",
            "border border-border dark:border-zinc-700",
            "shadow-sm dark:shadow-zinc-900/20",
            "hover:shadow-md dark:hover:shadow-zinc-900/40",
            "transition-all duration-200",
            "flex flex-col justify-between",
            "text-xs ",
            "h-[100px]"
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <CardTitle title={title} />
            {priority && (
              <div className="flex items-center gap-1 text-[10px]">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-2 py-0 font-semibold border-2 rounded-sm ",
                    priorityStyles?.text,
                    priorityStyles?.border,
                    priorityStyles?.bg
                  )}
                >
                  {priority}
                </Badge>
              </div>
            )}
          </div>
          {description && <CardDescription description={description} />}

          <CardFooter dueDate={dueDate}  />
        </div>
      </CardContextMenu>

      <CardView
        closeModal={closeModal}
        isOpen={isOpen}
        title={title}
        cardId={id}
        columnName={columnName}
      />
    </>
  );
};

export default Card;
