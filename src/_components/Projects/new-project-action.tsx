import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {} from "@/components/ui/command";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

//import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Priority,
  LowPriority,
  MediumPriority,
  HighPriority,
  UrgentPriority,
} from "@/_components/shared/svg/Priority";
import { useTheme } from "@/context/ThemeProvider";
import { Calendar } from "@/components/ui/calendar";
import { getPriorityIcon } from "./utils";
import {  StatusIcon, TargetIcon } from "../shared/svg/SharedIcons";

import { DateCreatedIcon } from "../shared/svg/ViewOptionsIcons";
//import { useTeamMemberAndDetails } from "@/hooks/useMembers";

type TNewProjectActionsProps = {
  targetDate: Date | undefined;
  setTargetDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  startDate: Date | undefined;
  setStartDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  priority: string;
  setPriority: React.Dispatch<React.SetStateAction<string>>;
  status: string;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  milestones?: any;
  setMilestones?: (milestones: any) => void;
  lead?: any;
  setLead?: (lead: any) => void;
  members?: any;
  setMembers?: (members: any) => void;
};

// interface TeamMember {
//   id: string;
//   name?: string;
//   email: string;
//   username?: string;
//   imageUrl?: string;
// }

const getStatusLabel = (status: string) => {
  switch (status) {
    case "parking_lot":
      return "Parking Lot";
    case "in_progress":
      return "In Progress";
    case "done":
      return "Done";
    case "on_hold":
      return "On Hold";
    default:
      return "Not Started";
  }
};

// Predefined project statuses
const PROJECT_STATUSES = [
  { value: "not_started", label: "Not Started" },
  { value: "parking_lot", label: "Parking Lot" },
  { value: "in_progress", label: "In Progress" },
  { value: "on_hold", label: "On Hold" },
  { value: "done", label: "Done" },
];

const NewProjectActions = ({
  targetDate,
  setTargetDate,
  startDate,
  setStartDate,
  priority,
  setPriority,
  status,
  setStatus,
}: TNewProjectActionsProps) => {
  const { theme } = useTheme();

  const handlePriorityClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDateChange = (date: Date | undefined, isTarget: boolean) => {
    if (isTarget) {
      setTargetDate(date);
    } else {
      setStartDate(date);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap py-2.5 px-4">
      {/* Status Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "w-[130px] h-7 text-xs rounded-sm",
              "opacity-60 hover:opacity-100 transition-opacity",
              "focus-visible:opacity-100"
            )}
          >
            <div className="flex items-center gap-1">
              <StatusIcon className="w-3 h-3" />
              <span className="text-xs">{getStatusLabel(status)}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[180px]">
          {PROJECT_STATUSES.map((statusOption) => {
            const isSelected = status === statusOption.value;
            return (
              <DropdownMenuItem
                key={statusOption.value}
                onClick={() => setStatus(statusOption.value)}
                className={cn(
                  "flex items-center gap-2 text-xs",
                  isSelected && "bg-accent"
                )}
              >
                <StatusIcon className="w-3 h-3" />
                <span className="text-xs flex-1">{statusOption.label}</span>
                {isSelected && <Check className="w-3 h-3 text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Priority Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "w-6 p-0 h-7 text-xs rounded-sm",
              "opacity-60 hover:opacity-100 transition-opacity",
              "focus-visible:opacity-100"
            )}
            onClick={handlePriorityClick}
          >
            {getPriorityIcon(priority, theme)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[140px]">
          <DropdownMenuItem
            onClick={() => setPriority("none")}
            className={cn(
              "flex items-center gap-2",
              priority === "none" && "bg-accent"
            )}
          >
            <Priority className="size-3" />
            <span>None</span>
            {priority === "none" && (
              <Check className="w-3 h-3 ml-auto text-primary" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setPriority("low")}
            className={cn(
              "flex items-center gap-2",
              priority === "low" && "bg-accent"
            )}
          >
            <LowPriority className="size-3" isDark={theme === "dark"} />
            <span>Low</span>
            {priority === "low" && (
              <Check className="w-3 h-3 ml-auto text-primary" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setPriority("medium")}
            className={cn(
              "flex items-center gap-2",
              priority === "medium" && "bg-accent"
            )}
          >
            <MediumPriority className="size-3" isDark={theme === "dark"} />
            <span>Medium</span>
            {priority === "medium" && (
              <Check className="w-3 h-3 ml-auto text-primary" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setPriority("high")}
            className={cn(
              "flex items-center gap-2",
              priority === "high" && "bg-accent"
            )}
          >
            <HighPriority className="size-3" isDark={theme === "dark"} />
            <span>High</span>
            {priority === "high" && (
              <Check className="w-3 h-3 ml-auto text-primary" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setPriority("urgent")}
            className={cn(
              "flex items-center gap-2",
              priority === "urgent" && "bg-accent"
            )}
          >
            <UrgentPriority className="size-3" />
            <span>Urgent</span>
            {priority === "urgent" && (
              <Check className="w-3 h-3 ml-auto text-primary" />
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Start Date Picker */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-7 text-xs rounded-sm",
              "opacity-60 hover:opacity-100 transition-opacity",
              "focus-visible:opacity-100"
            )}
          >
            <DateCreatedIcon className="size-3" />
            <span className="text-xs">
              Start Date
              {startDate && ` (${startDate.toLocaleDateString()})`}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto p-0" align="start">
          <div className="p-2">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => handleDateChange(date ?? undefined, false)}
              initialFocus
            />
            <div className="flex items-center justify-end pt-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleDateChange(undefined, false)}
                className="h-7 px-2 text-xs"
              >
                Clear date
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Target Date Picker */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-7 text-xs rounded-sm",
              "opacity-60 hover:opacity-100 transition-opacity",
              "focus-visible:opacity-100"
            )}
          >
            <TargetIcon className="size-3" />
            <span className="text-xs">
              Target Date
              {targetDate && ` (${targetDate.toLocaleDateString()})`}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto p-0" align="start">
          <div className="p-2">
            <Calendar
              mode="single"
              selected={targetDate}
              onSelect={(date) => handleDateChange(date ?? undefined, true)}
              initialFocus
            />
            <div className="flex items-center justify-end pt-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleDateChange(undefined, true)}
                className="h-7 px-2 text-xs"
              >
                Clear date
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NewProjectActions;
