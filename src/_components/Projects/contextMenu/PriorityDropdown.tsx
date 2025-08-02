import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UrgentPriority,
  MediumPriority,
  LowPriority,
  Priority,
  HighPriority,
} from "@/_components/shared/svg/Priority";

import { getPriorityIcon } from "../utils";
import { useTheme } from "@/context/ThemeProvider";

const PriorityDropdown = ({
  priority,
  onChange,
  isDark,
}: {
  priority: string;
  onChange: (priority: string) => void;
  isDark: boolean;
}) => {
  const { theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-1 text-xs justify-center hover:bg-[#ebebeb] dark:hover:bg-[#2b2b2b] rounded-sm p-1 transition-all-linear">
          {getPriorityIcon(priority, theme)}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-28" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="text-[13px] font-semibold"
            onClick={() => onChange("Urgent")}
          >
            <UrgentPriority className="h-4 w-4" />
            Urgent
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-[13px] font-semibold"
            onClick={() => onChange("High")}
          >
            <HighPriority className="h-4 w-4" isDark={isDark} />
            High
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-[13px] font-semibold"
            onClick={() => onChange("Medium")}
          >
            <MediumPriority className="h-4 w-4" isDark={isDark} />
            Medium
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-[13px] font-semibold"
            onClick={() => onChange("Low")}
          >
            <LowPriority className="h-4 w-4" isDark={isDark} />
            Low
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-[13px] font-semibold"
            onClick={() => onChange("None")}
          >
            <Priority className="h-4 w-4"/>
            N/A
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PriorityDropdown;
