import { Button } from "@/components/ui/button";
import { CardDetailsEditor } from "../../../_editor/editor.tsx";
import { Lock, Unlock, Edit2, Check, X } from "lucide-react";
import { useContext, useState, useRef, useEffect } from "react";
import { CardContext } from "@/context/CardProvider.tsx";
import { TCardContext } from "@/types/cardTypes";
import { useCardMutation } from "../../../_mutations/useCardMutations.ts";
import { cn } from "@/lib/utils";

// Simple Inline Title Editor
const InlineEditableTitle = ({ title, cardId }: { title: string; cardId: number }) => {
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
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditValue(title);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="text-4xl font-bold py-2 bg-transparent border-none outline-none focus:bg-white dark:focus:bg-zinc-800 focus:px-2 focus:rounded-md transition-all"
          style={{ width: `${Math.max(editValue.length * 0.6, 10)}ch` }}
        />
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-green-600"
          onClick={handleSave}
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-red-600"
          onClick={() => {
            setEditValue(title);
            setIsEditing(false);
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2">
      <h2 
        className="text-4xl font-bold py-2 cursor-pointer hover:text-primary/80 transition-colors"
        onClick={() => setIsEditing(true)}
      >
        {title}
      </h2>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setIsEditing(true)}
      >
        <Edit2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

// Creative Column Status Indicator (Surprise!)
const ColumnStatusIndicator = ({ columnName }: { columnName: string }) => {
  // Get a color based on column name
  const getColumnColor = (name: string) => {
    const colors = {
      'backlog': 'from-slate-500 to-slate-600',
      'todo': 'from-blue-500 to-blue-600', 
      'in progress': 'from-yellow-500 to-orange-500',
      'in review': 'from-purple-500 to-purple-600',
      'done': 'from-green-500 to-green-600',
      'completed': 'from-emerald-500 to-emerald-600',
    };
    
    const normalizedName = name.toLowerCase();
    for (const [key, color] of Object.entries(colors)) {
      if (normalizedName.includes(key)) return color;
    }
    return 'from-gray-500 to-gray-600'; // default
  };

  const gradientColor = getColumnColor(columnName);

  return (
    <div className="flex items-center gap-3">
      {/* Animated dot indicator */}
      <div className="relative">
        <div className={cn(
          "w-3 h-3 rounded-full bg-gradient-to-r",
          gradientColor,
          "shadow-lg animate-pulse"
        )} />
        <div className={cn(
          "absolute inset-0 w-3 h-3 rounded-full bg-gradient-to-r",
          gradientColor,
          "animate-ping opacity-20"
        )} />
      </div>
      
      {/* Column name with beautiful typography */}
      <div className="flex flex-col">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Current Status
        </span>
        <span className={cn(
          "text-sm font-semibold bg-gradient-to-r bg-clip-text text-transparent",
          gradientColor
        )}>
          {columnName}
        </span>
      </div>
      
      {/* Decorative line */}
      <div className={cn(
        "h-px w-8 bg-gradient-to-r",
        gradientColor,
        "opacity-30"
      )} />
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

  return (
    <div className="relative p-4">
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

      <CardDetailsEditor cardId={cardId} description={description as string} />
    </div>
  );
};

export default MainPanel;
