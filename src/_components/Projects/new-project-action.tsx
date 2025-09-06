import { Button } from "@/components/ui/button";
 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {  Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 
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
import { LeadIcon, MilestoneIcon, StatusIcon, TargetIcon } from "../shared/svg/SharedIcons";
import { MilestoneItem } from "@/apis/project";
import { DateCreatedIcon } from "../shared/svg/ViewOptionsIcons";
import { useTeamMemberAndDetails } from "@/hooks/useMembers";

type TNewProjectActionsProps = {
  targetDate: Date | undefined;
  setTargetDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  startDate: Date | undefined;
  setStartDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  priority: string;
  setPriority: React.Dispatch<React.SetStateAction<string>>;
  status: string;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  milestones: MilestoneItem[];
  setMilestones: React.Dispatch<React.SetStateAction<MilestoneItem[]>>;
  lead: string | null;
  setLead: React.Dispatch<React.SetStateAction<string | null>>;
};

interface TeamMember {
  id: string;
  name?: string;
  email: string;
  username?: string;
  imageUrl?: string;
}

 

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
  milestones,
  setMilestones,
  lead,
  setLead,
}: TNewProjectActionsProps) => {
  const [newMilestone, setNewMilestone] = useState("");
  const { theme } = useTheme();

  // Fetch team members
  const { data } = useTeamMemberAndDetails();

  const teamMembers: TeamMember[] = data?.members || [];

  const handlePriorityClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleLeadSelect = (memberId: string) => {
    if (lead === memberId) {
      setLead(null);
    } else {
      setLead(memberId);
    }
  };

  

  const handleMilestoneSelect = (milestoneValue: string) => {
    const existingMilestone = milestones.find(
      (m) => m.milestoneValue === milestoneValue
    );
    if (existingMilestone) {
      setMilestones(
        milestones.filter((m) => m.milestoneValue !== milestoneValue)
      );
    } else {
      const newMilestoneItem: MilestoneItem = {
        id: `milestone-${Date.now()}`,
        milestoneValue,
        isCompletedMilestone: false,
      };
      setMilestones([...milestones, newMilestoneItem]);
    }
  };

  const handleAddNewMilestone = () => {
    if (
      newMilestone.trim() &&
      !milestones.some((m) => m.milestoneValue === newMilestone.trim())
    ) {
      const newMilestoneItem: MilestoneItem = {
        id: `milestone-${Date.now()}`,
        milestoneValue: newMilestone.trim(),
        isCompletedMilestone: false,
      };
      setMilestones([...milestones, newMilestoneItem]);
      setNewMilestone("");
    }
  };

  const handleRemoveMilestone = (milestoneValue: string) => {
    setMilestones(
      milestones.filter((m) => m.milestoneValue !== milestoneValue)
    );
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
                className={cn("flex items-center gap-2 text-xs", isSelected && "bg-accent")}
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
            className={cn("flex items-center gap-2", priority === "none" && "bg-accent")}
          >
            <Priority className="size-3" />
            <span>None</span>
            {priority === "none" && <Check className="w-3 h-3 ml-auto text-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setPriority("low")}
            className={cn("flex items-center gap-2", priority === "low" && "bg-accent")}
          >
            <LowPriority className="size-3" isDark={theme === "dark"} />
            <span>Low</span>
            {priority === "low" && <Check className="w-3 h-3 ml-auto text-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setPriority("medium")}
            className={cn("flex items-center gap-2", priority === "medium" && "bg-accent")}
          >
            <MediumPriority className="size-3" isDark={theme === "dark"} />
            <span>Medium</span>
            {priority === "medium" && <Check className="w-3 h-3 ml-auto text-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setPriority("high")}
            className={cn("flex items-center gap-2", priority === "high" && "bg-accent")}
          >
            <HighPriority className="size-3" isDark={theme === "dark"} />
            <span>High</span>
            {priority === "high" && <Check className="w-3 h-3 ml-auto text-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setPriority("urgent")}
            className={cn("flex items-center gap-2", priority === "urgent" && "bg-accent")}
          >
            <UrgentPriority className="size-3" />
            <span>Urgent</span>
            {priority === "urgent" && <Check className="w-3 h-3 ml-auto text-primary" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Lead Dropdown */}
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
            {lead ? (
              <>
                <Avatar className="w-3 h-3">
                  <AvatarImage src={teamMembers.find((m) => m.id === lead)?.imageUrl} />
                  <AvatarFallback className="text-[8px]">
                    {(
                      teamMembers.find((m) => m.id === lead)?.name ||
                      teamMembers.find((m) => m.id === lead)?.email ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs ml-1 truncate max-w-[120px]">
                  {teamMembers.find((m) => m.id === lead)?.name ||
                    teamMembers.find((m) => m.id === lead)?.email ||
                    "Unknown"}
                </span>
              </>
            ) : (
              <>
              <LeadIcon className="rotate-180" />
              <span className="text-xs">Lead</span>

              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 p-1.5" align="start">
          <DropdownMenuItem
            onClick={() => setLead(null)}
            className={cn("flex items-center gap-2 p-2", !lead && "bg-accent")}
          >
            <Avatar className="size-4">
              <AvatarFallback className="text-xs">N</AvatarFallback>
            </Avatar>
            <span className="text-xs flex-1">No lead</span>
            {!lead && <Check className="w-3 h-3 text-primary" />}
          </DropdownMenuItem>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {teamMembers.map((member) => {
              const isSelected = lead === member.id;
              return (
                <DropdownMenuItem
                  key={member.id}
                  onClick={() => handleLeadSelect(member.id)}
                  className={cn(
                    "flex items-center gap-2 p-2",
                    isSelected && "bg-accent"
                  )}
                >
                  <Avatar className="size-4">
                    <AvatarImage src={member.imageUrl} />
                    <AvatarFallback className="text-xs">
                      {(member.name || member.email)?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">
                      {member.name || member.username || member.email}
                    </div>
                  </div>
                  {isSelected && <Check className="w-3 h-3 text-primary" />}
                </DropdownMenuItem>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Members dropdown removed as requested */}

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

      {/* Milestones Dropdown */}
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
            <MilestoneIcon className="size-3" />
            <span className="text-xs">
              Milestones{milestones.length > 0 && ` (${milestones.length})`}
            </span>
         
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search milestones..."
              value={newMilestone}
              onValueChange={setNewMilestone}
              className="h-8 text-xs"
            />
            <CommandList className="max-h-48">
              <CommandEmpty>
                <div className="p-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddNewMilestone}
                    disabled={!newMilestone.trim()}
                    className="w-full h-6 text-xs"
                  >
                    Create "{newMilestone}"
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {milestones.map((milestone) => {
                  const isSelected = milestones.some(
                    (m) => m.milestoneValue === milestone.milestoneValue
                  );
                  return (
                    <CommandItem
                      key={milestone.id}
                      value={milestone.milestoneValue}
                      onSelect={() =>
                        handleMilestoneSelect(milestone.milestoneValue)
                      }
                      className="text-xs"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{milestone.milestoneValue}</span>
                        {isSelected && (
                          <Check className="w-3 h-3 text-primary" />
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Lead badge removed as requested; lead shown in trigger */}

      {/* Members badges removed as requested */}

      {/* Display selected milestones */}
      {milestones.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {milestones.map((milestone, index) => {
            const colorVariants = [
              "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700",
              "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700",
              "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700",
              "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700",
              "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-700",
            ];
            const colorClass = colorVariants[index % colorVariants.length];

            return (
              <div
                key={milestone.id}
                className={`text-xs h-7 pr-2 flex items-center gap-1 ${colorClass} hover:opacity-80 transition-opacity rounded-sm px-2`}
              >
                <MilestoneIcon className="w-3 h-3" />
                <span className="text-xs font-semibold">
                  {milestone.milestoneValue}
                </span>
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-600 dark:hover:text-red-400"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveMilestone(milestone.milestoneValue);
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NewProjectActions;
