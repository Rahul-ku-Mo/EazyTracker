import { cn } from "@/lib/utils";
import { getPriorityIcon } from "@/_components/Projects/utils";
import { useCardMutation } from "../../../_mutations/useCardMutations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/context/ThemeProvider";
import { Check } from "lucide-react";

interface PriorityDropdownProps {
  cardId: number;
  priority: string;
}

export const PriorityDropdown = ({
  cardId,
  priority,
}: PriorityDropdownProps) => {
  const { updateCardMutation } = useCardMutation();

  const { theme } = useTheme();

  const handlePriorityChange = (newPriority: string) => {
    updateCardMutation.mutate({ cardId, priority: newPriority });
  };

  const priorityOptions = [
    { key: "urgent", label: "Urgent" },
    { key: "high", label: "High" },
    { key: "medium", label: "Medium" },
    { key: "low", label: "Low" },
    { key: "none", label: "None" },
  ] as const;

  return (
    <div className="p-2 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary">Priority</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="cursor-pointer">
              {getPriorityIcon(priority, theme)}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            {priorityOptions.map(({ key, label }) => (
              <DropdownMenuItem
                key={key}
                onClick={() => handlePriorityChange(key)}
                className={cn(
                  "text-xs cursor-pointer",
                  priority === key &&
                    "font-medium text-primary bg-primary/10 my-0.5"
                )}
              >
                {getPriorityIcon(key, theme)}
                {label}
                {priority === key && (
                  <Check className="w-3 h-3 ml-auto text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
