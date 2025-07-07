import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Users,
  ChevronDown,
  Check,
  X,
  Calendar,
  Target,
  Milestone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Priority, LowPriority, MediumPriority, HighPriority, UrgentPriority } from "@/_components/shared/svg/Priority";
import { useTheme } from "@/context/ThemeProvider";
import { Input } from "@/components/ui/input";

type TNewProjectActionsProps = {
  targetDate: Date | undefined;
  setTargetDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  startDate: Date | undefined;
  setStartDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  priority: string;
  setPriority: React.Dispatch<React.SetStateAction<string>>;
  status: string;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  milestones: string[];
  setMilestones: React.Dispatch<React.SetStateAction<string[]>>;
  lead: string | null;
  setLead: React.Dispatch<React.SetStateAction<string | null>>;
  members: string[];
  setMembers: React.Dispatch<React.SetStateAction<string[]>>;
};

interface TeamMember {
  id: string;
  name?: string;
  email: string;
  username?: string;
  imageUrl?: string;
}

const getPriorityIcon = (priority: string, theme: string) => {
  switch (priority) {
    case "urgent":
      return <UrgentPriority className="size-3" isDark={theme === "dark"} />;
    case "high":
      return <HighPriority className="size-3" isDark={theme === "dark"} />;
    case "medium":
      return <MediumPriority className="size-3" isDark={theme === "dark"} />;
    case "low":
      return <LowPriority className="size-3" isDark={theme === "dark"} />;
    default:
      return <Priority className="size-3" isDark={theme === "dark"} />;
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "Urgent";
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
    default:
      return "None";
  }
};

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
  members,
  setMembers,
}: TNewProjectActionsProps) => {
  const [showLeadDropdown, setShowLeadDropdown] = useState(false);
  const [showMembersDropdown, setShowMembersDropdown] = useState(false);
  const [showMilestonesDropdown, setShowMilestonesDropdown] = useState(false);
  const [newMilestone, setNewMilestone] = useState("");
  const { theme } = useTheme();

  // Fetch team members
  const { data: teamData } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/teams/members`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      );
      return response.data.data;
    },
    enabled: !!Cookies.get("accessToken"),
  });

  const teamMembers: TeamMember[] = teamData?.members || [];

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

  const handleMemberSelect = (memberId: string) => {
    if (members.includes(memberId)) {
      setMembers(members.filter((m) => m !== memberId));
    } else {
      setMembers([...members, memberId]);
    }
  };

  const handleMilestoneSelect = (milestone: string) => {
    if (milestones.includes(milestone)) {
      setMilestones(milestones.filter((m) => m !== milestone));
    } else {
      setMilestones([...milestones, milestone]);
    }
  };

  const handleAddNewMilestone = () => {
    if (newMilestone.trim() && !milestones.includes(newMilestone.trim())) {
      setMilestones([...milestones, newMilestone.trim()]);
      setNewMilestone("");
    }
  };

  const handleRemoveMilestone = (milestone: string) => {
    setMilestones(milestones.filter((m) => m !== milestone));
  };

  const handleDateChange = (date: Date | undefined, isTarget: boolean) => {
    if (isTarget) {
      setTargetDate(date);
    } else {
      setStartDate(date);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap py-2.5">
      {/* Status Select */}
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger
          className={cn(
            "w-[130px] h-7 text-xs rounded-sm",
            "opacity-60 hover:opacity-100 transition-opacity",
            "focus:opacity-100",
            "data-[state=open]:opacity-100"
          )}
        >
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            <span className="text-xs">{getStatusLabel(status)}</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {PROJECT_STATUSES.map((statusOption) => (
            <SelectItem key={statusOption.value} value={statusOption.value} className="text-xs">
              <div className="flex items-center gap-2">
                <Target className="w-3 h-3" />
                <span className="text-xs">{statusOption.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority Select */}
      <Select value={priority} onValueChange={setPriority}>
        <SelectTrigger
          className={cn(
            "w-[110px] h-7 text-xs rounded-sm",
            "opacity-60 hover:opacity-100 transition-opacity",
            "focus:opacity-100",
            "data-[state=open]:opacity-100"
          )}
          onClick={handlePriorityClick}
        >
          <div className="flex items-center gap-1">
            {getPriorityIcon(priority, theme)}
            <span className="text-xs">{getPriorityLabel(priority)}</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none" className="text-xs">
            <div className="flex items-center gap-2">
              <Priority className="size-3" isDark={theme === "dark"} />
              <span className="text-xs">None</span>
            </div>
          </SelectItem>
          <SelectItem value="low" className="text-xs">
            <div className="flex items-center gap-2">
              <LowPriority className="size-3" isDark={theme === "dark"} />
              <span className="text-xs">Low</span>
            </div>
          </SelectItem>
          <SelectItem value="medium" className="text-xs">
            <div className="flex items-center gap-2">
              <MediumPriority className="size-3" isDark={theme === "dark"} />
              <span className="text-xs">Medium</span>
            </div>
          </SelectItem>
          <SelectItem value="high" className="text-xs">
            <div className="flex items-center gap-2">
              <HighPriority className="size-3" isDark={theme === "dark"} />
              <span className="text-xs">High</span>
            </div>
          </SelectItem>
          <SelectItem value="urgent" className="text-xs">
            <div className="flex items-center gap-2">
              <UrgentPriority className="size-3" isDark={theme === "dark"} />
              <span className="text-xs">Urgent</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Lead Dropdown */}
      <Popover
        open={showLeadDropdown}
        onOpenChange={setShowLeadDropdown}
      >
        <PopoverTrigger asChild>
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
            <Users className="w-3 h-3 mr-1" />
            <span className="text-xs">
              Lead
              {lead &&
                ` (${
                  teamMembers.find((m) => m.id === lead)?.name ||
                  teamMembers.find((m) => m.id === lead)?.email ||
                  "Unknown"
                })`}
            </span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-1.5" align="start">
          <div className="space-y-1">
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {teamMembers.map((member) => {
                const isSelected = lead === member.id;
                return (
                  <div
                    key={member.id}
                    onClick={() => handleLeadSelect(member.id)}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-sm cursor-pointer transition-colors",
                      isSelected
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-accent"
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
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Members Dropdown */}
      <Popover
        open={showMembersDropdown}
        onOpenChange={setShowMembersDropdown}
      >
        <PopoverTrigger asChild>
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
            <Users className="w-3 h-3 mr-1" />
            <span className="text-xs">
              Members{members.length > 0 && ` (${members.length})`}
            </span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-1.5" align="start">
          <div className="space-y-1">
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {teamMembers.map((member) => {
                const isSelected = members.includes(member.id);
                return (
                  <div
                    key={member.id}
                    onClick={() => handleMemberSelect(member.id)}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-sm cursor-pointer transition-colors",
                      isSelected
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-accent"
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
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Start Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
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
            <Calendar className="w-3 h-3 mr-1" />
            <span className="text-xs">
              Start Date
              {startDate && ` (${startDate.toLocaleDateString()})`}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Input
            type="date"
            value={startDate ? startDate.toISOString().split('T')[0] : ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDateChange(e.target.value ? new Date(e.target.value) : undefined, false)}
            className="border-0 focus:ring-0"
          />
        </PopoverContent>
      </Popover>

      {/* Target Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
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
            <Target className="w-3 h-3 mr-1" />
            <span className="text-xs">
              Target Date
              {targetDate && ` (${targetDate.toLocaleDateString()})`}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Input
            type="date"
            value={targetDate ? targetDate.toISOString().split('T')[0] : ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDateChange(e.target.value ? new Date(e.target.value) : undefined, true)}
            className="border-0 focus:ring-0"
          />
        </PopoverContent>
      </Popover>

      {/* Milestones Dropdown */}
      <Popover
        open={showMilestonesDropdown}
        onOpenChange={setShowMilestonesDropdown}
      >
        <PopoverTrigger asChild>
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
            <Milestone className="w-3 h-3 mr-1" />
            <span className="text-xs">
              Milestones{milestones.length > 0 && ` (${milestones.length})`}
            </span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start">
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
                  const isSelected = milestones.includes(milestone);
                  return (
                    <CommandItem
                      key={milestone}
                      value={milestone}
                      onSelect={() => handleMilestoneSelect(milestone)}
                      className="text-xs"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{milestone}</span>
                        {isSelected && <Check className="w-3 h-3 text-primary" />}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Display selected lead */}
      {lead && (
        <Badge
          variant="secondary"
          className="text-xs h-7 pl-1 pr-2 flex items-center gap-1"
        >
          <Avatar className="w-3 h-3">
            <AvatarImage
              src={teamMembers.find((m) => m.id === lead)?.imageUrl}
            />
            <AvatarFallback className="text-[8px]">
              {(
                teamMembers.find((m) => m.id === lead)?.name ||
                teamMembers.find((m) => m.id === lead)?.email
              )
                ?.charAt(0)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs">
            Lead: {teamMembers.find((m) => m.id === lead)?.name ||
              teamMembers.find((m) => m.id === lead)?.email}
          </span>
          <X
            className="w-3 h-3 cursor-pointer hover:text-destructive"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLead(null);
            }}
          />
        </Badge>
      )}

      {/* Display selected members */}
      {members.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {members.map((memberId) => {
            const member = teamMembers.find((m) => m.id === memberId);
            if (!member) return null;

            return (
              <Badge
                key={memberId}
                variant="secondary"
                className="text-xs h-7 pl-1 pr-2 flex items-center gap-1"
              >
                <Avatar className="w-3 h-3">
                  <AvatarImage src={member.imageUrl} />
                  <AvatarFallback className="text-[8px]">
                    {(member.name || member.email)?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">
                  {member.name || member.email}
                </span>
                <X
                  className="w-3 h-3 cursor-pointer hover:text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleMemberSelect(memberId);
                  }}
                />
              </Badge>
            );
          })}
        </div>
      )}

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
                key={milestone}
                className={`text-xs h-7 pr-2 flex items-center gap-1 ${colorClass} hover:opacity-80 transition-opacity rounded-sm px-2`}
              >
                <Milestone className="w-3 h-3" />
                <span className="text-xs font-semibold">{milestone}</span>
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-600 dark:hover:text-red-400"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveMilestone(milestone);
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