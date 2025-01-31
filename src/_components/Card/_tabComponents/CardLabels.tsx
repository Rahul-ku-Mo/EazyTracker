import { Plus, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { cn } from "../../../lib/utils";

interface Label {
  id: string;
  name: string;
  color: string;
}

const LABEL_COLORS = [
  {
    bg: "bg-emerald-100 dark:bg-emerald-900/50",
    text: "text-emerald-700 dark:text-emerald-200",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  {
    bg: "bg-blue-100 dark:bg-blue-900/50",
    text: "text-blue-700 dark:text-blue-200",
    border: "border-blue-200 dark:border-blue-800",
  },
  {
    bg: "bg-purple-100 dark:bg-purple-900/50",
    text: "text-purple-700 dark:text-purple-200",
    border: "border-purple-200 dark:border-purple-800",
  },
  {
    bg: "bg-amber-100 dark:bg-amber-900/50",
    text: "text-amber-700 dark:text-amber-200",
    border: "border-amber-200 dark:border-amber-800",
  },
];

export const CardLabels = () => {
  const [labels, setLabels] = useState<Label[]>([
    { id: "1", name: "Important", color: "emerald" },
    { id: "2", name: "Feature", color: "blue" },
  ]);
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddLabel = () => {
    if (newLabel.trim() !== "") {
      const randomColor =
        LABEL_COLORS[Math.floor(Math.random() * LABEL_COLORS.length)];
      setLabels([
        ...labels,
        {
          id: Date.now().toString(),
          name: newLabel.trim(),
          color: randomColor.bg.split("-")[1],
        },
      ]);
      setNewLabel("");
      setIsAddingLabel(false);
    }
  };

  const handleRemoveLabel = (labelId: string) => {
    setLabels(labels.filter((label) => label.id !== labelId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newLabel.trim() !== "") {
      e.preventDefault();
      handleAddLabel();
    } else if (e.key === "Escape") {
      setIsAddingLabel(false);
      setNewLabel("");
    }
  };

  useEffect(() => {
    if (isAddingLabel && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingLabel]);

  return (
    <div className="px-0.5">
      <h3 className="my-2 text-sm font-medium text-foreground">Labels</h3>
      <div className="flex flex-wrap gap-1.5">
        <AnimatePresence>
          {labels.map((label) => {
            const colorSet =
              LABEL_COLORS[label.id.length % LABEL_COLORS.length];
            return (
              <motion.div
                key={label.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                  duration: 0.2,
                }}
              >
                <Badge
                  variant="outline"
                  className={cn(
                    "h-6 px-2 flex items-center gap-1 font-normal",
                    colorSet.bg,
                    colorSet.text,
                    colorSet.border,
                    "border"
                  )}
                >
                  <span className="text-xs">{label.name}</span>
                  <button
                    onClick={() => handleRemoveLabel(label.id)}
                    className={cn(
                      "ml-1 rounded-full p-0.5",
                      "hover:bg-black/10 dark:hover:bg-white/10",
                      "transition-colors"
                    )}
                  >
                    <X className="w-3 h-3" />
                    <span className="sr-only">Remove {label.name} label</span>
                  </button>
                </Badge>
              </motion.div>
            );
          })}

          {isAddingLabel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative inline-flex items-center justify-between"
            >
              <Input
                ref={inputRef}
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={handleKeyDown}
                className={cn(
                  "h-6 w-24 text-xs",
                  "px-2 py-0",
                  "bg-background",
                  "border border-input",
                  "focus-visible:ring-1 truncate",
                  "placeholder:text-muted-foreground placeholder:text-[10px] placeholder:truncate"
                )}
                placeholder="Label name..."
              />
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={handleAddLabel}
                className={cn(
                  "absolute right-1 -translate-y-1/2",
                  "p-0.5 rounded-full",
                  "bg-primary text-primary-foreground",
                  "hover:bg-primary/90",
                  "transition-colors"
                )}
              >
                <Plus className="w-3 h-3" />
                <span className="sr-only">Add label</span>
              </motion.button>
            </motion.div>
          )}

          {!isAddingLabel && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => setIsAddingLabel(true)}
              className={cn(
                "h-6 w-6 flex items-center justify-center",
                "rounded-full border",
                "border-input bg-background",
                "hover:bg-accent hover:text-accent-foreground",
                "transition-colors"
              )}
            >
              <Plus className="w-4 h-4" />
              <span className="sr-only">Add new label</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
