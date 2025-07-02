import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "../../../components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../components/ui/command";
import {
  Users,
  Tags,
  ChevronDown,
  AlertCircle,
  AlertTriangle,
  Circle,
  Minus,
  Check,
  X,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { DueDatePicker } from "./DueDatePicker";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";

type TNewCardActionsProps = {
  dueDate: Date | undefined;
  setDueDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  priority: string;
  setPriority: React.Dispatch<React.SetStateAction<string>>;
  labels: string[];
  setLabels: React.Dispatch<React.SetStateAction<string[]>>;
  assignee: string | null;
  setAssignee: React.Dispatch<React.SetStateAction<string | null>>;
};

interface TeamMember {
  id: string;
  name?: string;
  email: string;
  username?: string;
  imageUrl?: string;
}

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case "urgent":
      return <AlertCircle className="w-3 h-3 text-red-500" />;
    case "high":
      return <AlertTriangle className="w-3 h-3 text-orange-500" />;
    case "medium":
      return <Circle className="w-3 h-3 text-blue-500" />;
    case "low":
      return <Circle className="w-3 h-3 text-green-500" />;
    default:
      return <Minus className="w-3 h-3 text-gray-400" />;
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

// Predefined labels
const AVAILABLE_LABELS = [
  "Frontend",
  "Backend",
  "UI/UX",
  "Bug",
  "Feature",
  "Documentation",
  "Testing",
  "Urgent",
  "Low Priority",
  "Review",
  "In Progress",
  "Blocked",
];

const NewCardActions = ({
  dueDate,
  setDueDate,
  priority,
  setPriority,
  labels,
  setLabels,
  assignee,
  setAssignee,
}: TNewCardActionsProps) => {
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showLabelsDropdown, setShowLabelsDropdown] = useState(false);
  const [newLabel, setNewLabel] = useState("");

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

  const handleAssigneeSelect = (memberId: string) => {
    if (assignee === memberId) {
      setAssignee(null);
    } else {
      setAssignee(memberId);
    }
  };

  const handleLabelSelect = (label: string) => {
    if (labels.includes(label)) {
      setLabels(labels.filter((l) => l !== label));
    } else {
      setLabels([...labels, label]);
    }
  };

  const handleAddNewLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel("");
    }
  };

  const handleRemoveLabel = (label: string) => {
    setLabels(labels.filter((l) => l !== label));
  };

  return (
    <div className="flex gap-2 flex-wrap px-4 py-2.5">
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
            {getPriorityIcon(priority)}
            <span className="text-xs">{getPriorityLabel(priority)}</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none" className="text-xs">
            <div className="flex items-center gap-2">
              <Minus className="w-3 h-3 text-gray-400" />
              <span className="text-xs">None</span>
            </div>
          </SelectItem>
          <SelectItem value="low" className="text-xs">
            <div className="flex items-center gap-2">
              <Circle className="w-3 h-3 text-green-500" />
              <span className="text-xs">Low</span>
            </div>
          </SelectItem>
          <SelectItem value="medium" className="text-xs">
            <div className="flex items-center gap-2">
              <Circle className="w-3 h-3 text-blue-500" />
              <span className="text-xs">Medium</span>
            </div>
          </SelectItem>
          <SelectItem value="high" className="text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-orange-500" />
              <span className="text-xs">High</span>
            </div>
          </SelectItem>
          <SelectItem value="urgent" className="text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3 h-3 text-red-500" />
              <span className="text-xs">Urgent</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Assignee Dropdown */}
      <Popover
        open={showAssigneeDropdown}
        onOpenChange={setShowAssigneeDropdown}
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
              Assignee
              {assignee &&
                ` (${
                  teamMembers.find((m) => m.id === assignee)?.name ||
                  teamMembers.find((m) => m.id === assignee)?.email ||
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
                const isSelected = assignee === member.id;
                return (
                  <div
                    key={member.id}
                    onClick={() => handleAssigneeSelect(member.id)}
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

      {/* Labels Dropdown */}
      <Popover
        open={showLabelsDropdown}
        onOpenChange={setShowLabelsDropdown}
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
            <Tags className="w-3 h-3 mr-1" />
            <span className="text-xs">
              Labels{labels.length > 0 && ` (${labels.length})`}
            </span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search labels..." 
              value={newLabel}
              onValueChange={setNewLabel}
              className="h-8 text-xs"
            />
            <CommandList className="max-h-48">
              <CommandEmpty>
                <div className="p-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddNewLabel}
                    disabled={!newLabel.trim()}
                    className="w-full h-6 text-xs"
                  >
                    Create "{newLabel}"
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {AVAILABLE_LABELS.map((label) => {
                  const isSelected = labels.includes(label);
                  return (
                    <CommandItem
                      key={label}
                      value={label}
                      onSelect={() => handleLabelSelect(label)}
                      className="text-xs"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{label}</span>
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

      <DueDatePicker dueDate={dueDate} setDueDate={setDueDate} />

      {/* Display selected assignee */}
      {assignee && (
        <Badge
          variant="secondary"
          className="text-xs h-7 pl-1 pr-2 flex items-center gap-1"
        >
          <Avatar className="w-3 h-3">
            <AvatarImage
              src={teamMembers.find((m) => m.id === assignee)?.imageUrl}
            />
            <AvatarFallback className="text-[8px]">
              {(
                teamMembers.find((m) => m.id === assignee)?.name ||
                teamMembers.find((m) => m.id === assignee)?.email
              )
                ?.charAt(0)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs">
            {teamMembers.find((m) => m.id === assignee)?.name ||
              teamMembers.find((m) => m.id === assignee)?.email}
          </span>
          <X
            className="w-3 h-3 cursor-pointer hover:text-destructive"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setAssignee(null);
            }}
          />
        </Badge>
      )}

      {/* Display selected labels */}
      {labels.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {labels.map((label, index) => {
            const colorVariants = [
              "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700",
              "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700",
              "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700",
              "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700",
              "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700",
            ];
            const colorClass = colorVariants[index % colorVariants.length];

            return (
              <Badge
                key={label}
                variant="secondary"
                className={`text-xs h-7 pr-2 flex items-center gap-1 ${colorClass} hover:opacity-80 transition-opacity`}
              >
                <span className="text-xs">{label}</span>
                <X
                  className="w-3 h-3 cursor-pointer hover:text-red-600 dark:hover:text-red-400"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveLabel(label);
                  }}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NewCardActions;
