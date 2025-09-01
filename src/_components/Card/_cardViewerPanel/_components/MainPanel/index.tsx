import { Button } from "@/components/ui/button";
import { CardDetailsEditor } from "../../../_editor/editor.tsx";
import { Lock, Unlock } from "lucide-react";
import { useContext, useState, useRef, useEffect } from "react";
import { CardContext } from "@/context/CardProvider.tsx";
import { TCardContext } from "@/types/cardTypes";
import { useCardMutation } from "../../../_mutations/useCardMutations.ts";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input.tsx";
import { CommentsSection } from "../../../_comments";
import { Separator } from "@/components/ui/separator.tsx";

// Simple Inline Title Editor
const InlineEditableTitle = ({
  title,
  cardId,
}: {
  title: string;
  cardId: number;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateCardMutation } = useCardMutation();

  useEffect(() => {
    setEditValue(title);
  }, [title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim() && editValue !== title) {
      updateCardMutation.mutate({
        cardId,
        title: editValue.trim(),
      });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditValue(title);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <label htmlFor="Card-Title" className="sr-only">
          Card Title
        </label>
        <Input
          id="Card-Title"
          name="Card-Title"
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="!text-2xl my-1.5 font-bold !p-0 border-none focus:ring-0 focus-visible:ring-offset-0 focus-visible:ring-0 rounded-none"
        />
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2 editor-readable-font">
      <div
        title={title}
        className="text-2xl font-bold py-1.5 cursor-pointer hover:text-primary/80 transition-colors truncate max-w-2xl"
        onClick={() => setIsEditing(true)}
      >
        {title}
      </div>
    </div>
  );
};

// Creative Column Status Indicator (Surprise!)
const ColumnStatusIndicator = ({ columnName }: { columnName: string }) => {
  // Get a color based on column name
  const getColumnColor = (name: string) => {
    const colors = {
      backlog: "from-slate-500 to-slate-600",
      todo: "from-blue-500 to-blue-600",
      "in progress": "from-yellow-500 to-orange-500",
      "in review": "from-purple-500 to-purple-600",
      done: "from-green-500 to-green-600",
      completed: "from-emerald-500 to-emerald-600",
    };

    const normalizedName = name.toLowerCase();
    for (const [key, color] of Object.entries(colors)) {
      if (normalizedName.includes(key)) return color;
    }
    return "from-gray-500 to-gray-600"; // default
  };

  const gradientColor = getColumnColor(columnName);

  return (
    <div className="flex items-center gap-3">
      {/* Animated dot indicator */}
      <div className="relative">
        <div
          className={cn(
            "w-3 h-3 rounded-full bg-gradient-to-r",
            gradientColor,
            "shadow-lg animate-pulse"
          )}
        />
        <div
          className={cn(
            "absolute inset-0 w-3 h-3 rounded-full bg-gradient-to-r",
            gradientColor,
            "animate-ping opacity-20"
          )}
        />
      </div>

      {/* Column name with beautiful typography */}
      <div className="flex flex-col">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Current Status
        </span>
        <span
          className={cn(
            "text-sm font-semibold bg-gradient-to-r bg-clip-text text-transparent",
            gradientColor
          )}
        >
          {columnName}
        </span>
      </div>

      {/* Decorative line */}
      <div
        className={cn("h-px w-8 bg-gradient-to-r", gradientColor, "opacity-30")}
      />
    </div>
  );
};

const MainPanel = ({
  columnName,
  isLocked,
  setIsLocked,
}: {
  columnName: string;
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
}) => {
  const cardDetails = useContext(CardContext);

  const { description, id: cardId, title } = cardDetails as TCardContext;

  const cardDetailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardDetailRef.current) {
      cardDetailRef.current.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }
  }, []);

  return (
    <div
      ref={cardDetailRef}
      className="relative lg:mr-[20rem] flex flex-col container"
    >
      {/* Header Section */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <ColumnStatusIndicator columnName={columnName} />
            <InlineEditableTitle title={title} cardId={cardId} />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsLocked(!isLocked)}
          >
            {isLocked ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col min-h-0 px-4 pt-2.5 overflow-y-auto">
        {/* Card Description Editor */}
        <CardDetailsEditor
          cardId={cardId}
          description={description as string}
        />
        {/* Comments Section */}
        <Separator className="my-2" />
        <CommentsSection cardId={cardId}/>
      </div>
    </div>
  );
};

export default MainPanel;
