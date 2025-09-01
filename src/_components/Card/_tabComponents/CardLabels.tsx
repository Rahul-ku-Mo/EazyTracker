import { Plus, X } from "lucide-react";
import { useState, useRef, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { cn } from "../../../lib/utils";
import { Label, fetchTeamLabels, createLabel } from "../../../apis/LabelApis";
import { toggleCardLabel } from "../../../apis/CardApis";
import { CardContext } from "../../../context/CardProvider";
import { useAuthStore } from "../../../store/authStore";
import { toast } from "../../../hooks/use-toast";

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
  const cardContext = useContext(CardContext);
  const { accessToken, user } = useAuthStore();
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get labels attached to the current card
  const cardLabels = cardContext?.labels || [];

  // Load team labels
  useEffect(() => {
    const loadTeamLabels = async () => {
      if (user?.teamId) {
        try {
          const labels = await fetchTeamLabels(user.teamId);
          if (labels) {
            setAvailableLabels(labels);
          }
        } catch (error) {
          console.error("Failed to load team labels:", error);
        }
      }
    };

    loadTeamLabels();
  }, [user?.teamId]);

  const handleAddLabel = async () => {
    if (newLabel.trim() !== "" && user?.teamId) {
      setLoading(true);
      try {
        const randomColor = LABEL_COLORS[Math.floor(Math.random() * LABEL_COLORS.length)];
        const createdLabel = await createLabel(user.teamId, {
          name: newLabel.trim(),
          color: randomColor.bg.includes("emerald") ? "#10B981" : 
                randomColor.bg.includes("blue") ? "#3B82F6" :
                randomColor.bg.includes("purple") ? "#8B5CF6" : "#F59E0B"
        });

        if (createdLabel) {
          setAvailableLabels(prev => [...prev, createdLabel]);
          toast({
            title: "Label created",
            description: `Label "${createdLabel.name}" has been created successfully.`,
          });
        }
        setNewLabel("");
        setIsAddingLabel(false);
      } catch (error) {
        console.error("Failed to create label:", error);
        toast({
          title: "Error",
          description: "Failed to create label. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemoveLabel = async (labelId: string) => {
    if (!accessToken || !cardContext?.id) return;

    try {
      await toggleCardLabel(accessToken, cardContext.id, labelId);
      // The card context should be updated by the parent component after the API call
      toast({
        title: "Label removed",
        description: "Label has been removed from the card.",
      });
    } catch (error) {
      console.error("Failed to remove label:", error);
      toast({
        title: "Error",
        description: "Failed to remove label. Please try again.",
        variant: "destructive",
      });
    }
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
          {cardLabels.map((label) => {
            // Use the label's color if available, otherwise use a default based on name
            const labelStyle = label.color 
              ? { backgroundColor: label.color + "20", color: label.color, borderColor: label.color + "40" }
              : LABEL_COLORS[label.name.length % LABEL_COLORS.length];
            
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
                    "h-6 px-2 flex items-center gap-1 font-normal border",
                    !label.color && labelStyle.bg,
                    !label.color && labelStyle.text,
                    !label.color && labelStyle.border
                  )}
                  style={label.color ? labelStyle : undefined}
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
                disabled={loading}
                className={cn(
                  "absolute right-1 -translate-y-1/2",
                  "p-0.5 rounded-full",
                  "bg-primary text-primary-foreground",
                  "hover:bg-primary/90",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
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
