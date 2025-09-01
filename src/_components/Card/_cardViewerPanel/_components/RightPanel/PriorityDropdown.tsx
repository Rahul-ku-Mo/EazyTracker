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

  const priorityConfig = {
    urgent: { bg: "bg-red-500", label: "Urgent" },
    high: { bg: "bg-amber-500", label: "High" },
    medium: { bg: "bg-blue-500", label: "Medium" },
    low: { bg: "bg-green-500", label: "Low" },
    none: { bg: "bg-zinc-400", label: "None" },
  };

  const currentConfig =
    priorityConfig[priority as keyof typeof priorityConfig] ||
    priorityConfig.none;

  return (
    <div className="space-y-3 rounded-md p-2 dark:bg-[#101010]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getPriorityIcon(priority, theme)}
          <span className="text-xs font-medium text-primary">Priority</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className={`px-3 py-1 text-white text-xs font-medium rounded-md cursor-pointer hover:opacity-80 transition-opacity ${currentConfig.bg}`}
            >
              {currentConfig.label}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            {Object.entries(priorityConfig).map(([key, config]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => handlePriorityChange(key)}
                className={cn(
                  "text-xs cursor-pointer",
                  priority === key && "font-bold text-primary bg-primary/10"
                )}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className={`w-3 h-3 rounded-full ${config.bg}`} />
                  {config.label}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
