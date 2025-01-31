import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

interface NewColumnFormProps {
  columnName: string;
  setColumnName: (name: string) => void;
  onAddColumn: () => void;
  onCancel: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

const NewColumnForm = ({
  columnName,
  setColumnName,
  onAddColumn,
  onCancel,
  inputRef,
}: NewColumnFormProps) => {
  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!columnName.trim()) return;
    onAddColumn();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{
          duration: 0.2,
          ease: "easeInOut",
        }}
        className="min-w-[272px]"
      >
        <motion.form
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          exit={{ y: -20 }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
          }}
          onSubmit={handleSubmit}
          className={cn(
            "p-2 space-y-2",
            "bg-white dark:bg-zinc-800",
            "border border-zinc-200 dark:border-zinc-700",
            "rounded-md shadow-sm"
          )}
        >
          <Input
            ref={inputRef}
            type="text"
            placeholder="Enter column title..."
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
            className={cn(
              "text-sm",
              "bg-zinc-50 dark:bg-zinc-900",
              "border-zinc-200 dark:border-zinc-700",
              "focus:ring-1 focus:dark:ring-zinc-800"
            )}
          />

          <div className="flex items-center justify-between gap-2">
            <Button
              type="submit"
              size="sm"
              className={cn(
                "text-xs font-medium",
                "bg-primary hover:bg-primary/90",
                "text-primary-foreground"
              )}
            >
              Add Column
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className={cn(
                "h-8 w-8 rounded-full",
                "hover:bg-zinc-100 dark:hover:bg-zinc-700"
              )}
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Cancel</span>
            </Button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewColumnForm;
