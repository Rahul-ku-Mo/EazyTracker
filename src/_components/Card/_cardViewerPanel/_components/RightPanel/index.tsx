import { Button } from "../../../../../components/ui/button";
import { Calendar } from "../../../../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../../components/ui/popover";
import { CalendarIcon, Tag, X } from "lucide-react";

import { CardContext } from "../../../../../context/CardProvider";
import { TCardContext } from "../../../../../types/cardTypes";
import { useContext } from "react";

import { useCardMutation } from "../../../_mutations/useCardMutations";

const isToday = (date?: Date | string | null) => {
  if (!date) return false;
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return false; // Check for invalid date
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

const isTomorrow = (date?: Date | string | null) => {
  if (!date) return false;
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return false; // Check for invalid date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return dateObj.toDateString() === tomorrow.toDateString();
};

const RightPanel = () => {
  const cardDetails = useContext(CardContext);

  const { priority, dueDate, labels, id: cardId } = cardDetails as TCardContext;

  const { updateCardMutation } = useCardMutation();

  return (
    <div className="h-full border-l border-border dark:border-zinc-700">
      <div className="p-4 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground dark:text-zinc-400">
              Priority
            </p>
            <span
              className="px-2 py-1 text-xs font-medium capitalize rounded-full bg-opacity-10"
              style={{
                backgroundColor:
                  priority === "urgent"
                    ? "rgba(239, 68, 68, 0.1)"
                    : priority === "high"
                    ? "rgba(245, 158, 11, 0.1)"
                    : priority === "medium"
                    ? "rgba(59, 130, 246, 0.1)"
                    : priority === "low"
                    ? "rgba(34, 197, 94, 0.1)"
                    : "rgba(34, 197, 94, 0.1)",
                color:
                  priority === "urgent"
                    ? "#ef4444"
                    : priority === "high"
                    ? "#f59e0b"
                    : priority === "medium"
                    ? "#3b82f6"
                    : priority === "low"
                    ? "#22c55e"
                    : "#fff",
              }}
            >
              {priority || "None"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={priority === "urgent" ? "default" : "outline"}
              className={`flex items-center gap-2 w-full transition-colors ${
                priority === "urgent"
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
              }`}
              onClick={() =>
                updateCardMutation.mutate({
                  cardId,
                  priority: "urgent",
                })
              }
            >
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              Urgent
            </Button>
            <Button
              variant={priority === "high" ? "default" : "outline"}
              className={`flex items-center gap-2 w-full transition-colors ${
                priority === "high"
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950"
              }`}
              onClick={() =>
                updateCardMutation.mutate({ cardId, priority: "high" })
              }
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              High
            </Button>
            <Button
              variant={priority === "Medium" ? "default" : "outline"}
              className={`flex items-center gap-2 w-full transition-colors ${
                priority === "medium"
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
              }`}
              onClick={() =>
                updateCardMutation.mutate({
                  cardId,
                  priority: "medium",
                })
              }
            >
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              Medium
            </Button>
            <Button
              variant={priority === "Low" ? "default" : "outline"}
              className={`flex items-center gap-2 w-full transition-colors ${
                priority === "low"
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950"
              }`}
              onClick={() =>
                updateCardMutation.mutate({ cardId, priority: "low" })
              }
            >
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Low
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground dark:text-zinc-400">
            Due Date
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={isToday(dueDate) ? "default" : "outline"}
              className="flex items-center flex-1 gap-2 hover:dark:bg-zinc-900/80"
              onClick={() =>
                updateCardMutation.mutate({
                  cardId,
                  dueDate: new Date(),
                })
              }
            >
              <CalendarIcon className="w-4 h-4" />
              Today
            </Button>
            <Button
              variant={isTomorrow(dueDate) ? "default" : "outline"}
              className="flex items-center flex-1 gap-2 hover:dark:bg-zinc-900/80"
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                updateCardMutation.mutate({
                  cardId,
                  dueDate: tomorrow,
                });
              }}
            >
              <CalendarIcon className="w-4 h-4" />
              Tomorrow
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center flex-1 gap-2 hover:dark:bg-zinc-900/80"
                >
                  <CalendarIcon className="w-4 h-4" />
                  Custom
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) =>
                    updateCardMutation.mutate({ cardId, dueDate: date })
                  }
                  className="bg-white border rounded-md dark:bg-zinc-900"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground dark:text-zinc-400">
            Labels
          </p>
          <div className="flex flex-col gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.elements.namedItem(
                  "label"
                ) as HTMLInputElement;
                if (input.value) {
                  updateCardMutation.mutate({
                    cardId,
                    label: input.value,
                  });
                  input.value = "";
                }
              }}
            >
              <input
                name="label"
                type="text"
                placeholder="eg: Bug, Enhancement, etc."
                className="w-full px-3 py-2 text-sm border rounded-md border-input bg-background"
              />
            </form>
            <div className="flex flex-wrap gap-1 mt-2">
              {labels?.map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-1 px-2 py-1 text-xs border rounded-full dark:bg-zinc-900 border-border dark:border-zinc-700 text-secondary-foreground"
                >
                  <Tag className="w-3 h-3" />
                  {label}
                  <Button
                    size="sm"
                    className="w-4 h-4 p-0 bg-transparent hover:bg-transparent"
                    onClick={() =>
                      updateCardMutation.mutate({
                        cardId,
                        label,
                      })
                    }
                  >
                    <X className="w-3 h-3 text-black dark:text-zinc-200" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
