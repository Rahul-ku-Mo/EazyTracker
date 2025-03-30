import { Button } from "../../../../../components/ui/button";
import { Calendar } from "../../../../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../../components/ui/popover";
import { CalendarIcon, Flag, Tag, X, Search, Users, Info, Plus } from "lucide-react";

import { CardContext } from "../../../../../context/CardProvider";
import { TCardContext } from "../../../../../types/cardTypes";
import { useContext } from "react";

import { useCardMutation } from "../../../_mutations/useCardMutations";
import { cn } from "../../../../../lib/utils";

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

const formatDate = (date?: Date | string | null) => {
  if (!date) return "";
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return ""; 
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(dateObj);
};

const RightPanel = () => {
  const cardDetails = useContext(CardContext);
  const { priority = "low", dueDate, labels = [], id: cardId } = cardDetails as TCardContext;
  const { updateCardMutation } = useCardMutation();

  const createdAt = new Date();
  const status = "Backlog";
  const storyPoints = 0;
  
 
  

  return (
    <div className="h-full border-l border-border dark:border-zinc-700">
      <div className="p-4 space-y-6">
        {/* Task Details Header */}
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Details</h2>
        
        {/* Priority Section */}
        <div className="space-y-3 pb-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 dark:text-white text-black" />
              <span className="text-sm text-zinc-500">Priority</span>
            </div>
            <div className={`px-3 py-1 text-white text-xs font-medium rounded-full ${
              priority === "urgent"
                ? "bg-red-500"
                : priority === "high"
                  ? "bg-amber-500"
                  : priority === "medium"
                    ? "bg-blue-500"
                    : priority === "low"
                      ? "bg-green-500"
                      : "bg-zinc-400"
            }`}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </div>
          </div>
          
          <div>
            <div className="relative w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg mb-2">
              <div
                className={`absolute top-0 left-0 h-full rounded-lg ${
                  priority === "urgent"
                    ? "bg-red-500 w-full"
                    : priority === "high"
                      ? "bg-amber-500 w-3/4"
                      : priority === "medium"
                        ? "bg-blue-500 w-2/4"
                        : priority === "low"
                          ? "bg-green-500 w-1/4"
                          : "w-0"
                }`}
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span 
                onClick={() => updateCardMutation.mutate({ cardId, priority: "none" })} 
                className={cn("font-medium cursor-pointer", priority === "none" && "font-bold")}
              >
                None
              </span>
              <span 
                onClick={() => updateCardMutation.mutate({ cardId, priority: "low" })} 
                className={cn("font-medium cursor-pointer", priority === "low" && "font-bold")}
              >
                Low
              </span>
              <span 
                onClick={() => updateCardMutation.mutate({ cardId, priority: "medium" })} 
                className={cn("font-medium cursor-pointer", priority === "medium" && "font-bold")}
              >
                Medium
              </span>
              <span 
                onClick={() => updateCardMutation.mutate({ cardId, priority: "high" })} 
                className={cn("font-medium cursor-pointer", priority === "high" && "font-bold")}
              >
                High
              </span>
              <span 
                onClick={() => updateCardMutation.mutate({ cardId, priority: "urgent" })} 
                className={cn("font-medium cursor-pointer", priority === "urgent" && "font-bold")}
              >
                Urgent
              </span>
            </div>
          </div>
        </div>
        
        {/* Due Date Section */}
        <div className="space-y-3 pb-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 dark:text-white text-black" />
              <span className="text-sm text-zinc-500">Due Date</span>
            </div>
            {dueDate && (
              <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-xs font-medium rounded-full">
                {isToday(dueDate) ? "Today" : formatDate(dueDate)}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={isToday(dueDate) ? "secondary" : "outline"}
              className={cn(
                "rounded-full text-xs py-1 px-4 h-auto", 
                isToday(dueDate) ? "bg-zinc-200 dark:bg-zinc-700" : ""
              )}
              onClick={() => updateCardMutation.mutate({ cardId, dueDate: new Date() })}
            >
              Today
            </Button>
            <Button
              variant={isTomorrow(dueDate) ? "secondary" : "outline"}
              className={cn(
                "rounded-full text-xs py-1 px-4 h-auto",
                isTomorrow(dueDate) ? "bg-zinc-200 dark:bg-zinc-700" : ""
              )}
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                updateCardMutation.mutate({ cardId, dueDate: tomorrow });
              }}
            >
              Tomorrow
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full text-xs py-1 px-4 h-auto flex items-center gap-1"
                >
                  <CalendarIcon className="w-3 h-3" />
                  Custom
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate ? new Date(dueDate) : undefined}
                  onSelect={(date) => updateCardMutation.mutate({ cardId, dueDate: date })}
                  className="bg-white border rounded-md dark:bg-zinc-900"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {/* Labels Section */}
        <div className="space-y-3 pb-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 dark:text-white text-black" />
              <span className="text-sm text-zinc-500">Labels</span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {labels?.map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 rounded-full border border-white"
                >
                  {label}
                  <Button
                    size="sm"
                    className="w-4 h-4 p-0 bg-transparent hover:bg-transparent ml-1"
                    onClick={() => updateCardMutation.mutate({ cardId, label })}
                  >
                    <X className="w-3 h-3 dark:text-zinc-100 dark:hover:text-zinc-300 hover:text-zinc-500" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem("label") as HTMLInputElement;
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
                  placeholder="Add a label..."
                  className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </form>
            </div>
          </div>
        </div>
        
        {/* Assignees Section */}
        <div className="space-y-3 pb-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 dark:text-white text-black" />
              <span className="text-sm text-zinc-500">Assignees</span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-1">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
          </div>
        </div>
        
        {/* Additional Info Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 dark:text-white text-black" />
            <span className="text-sm text-zinc-500">Additional Info</span>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Created</span>
              <span>{formatDate(createdAt) || "Mar 24, 2025"}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Status</span>
              <div className=" bg-zinc-100 dark:bg-zinc-800 text-xs font-medium rounded-full">
                {status}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Story Points</span>
              <span>{storyPoints}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
