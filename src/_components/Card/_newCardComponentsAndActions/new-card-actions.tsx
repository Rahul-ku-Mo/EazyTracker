import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { Box, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DueDatePickerDropdown } from "./DueDatePicker";
import { useState } from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import {
  Priority,
  LowPriority,
  MediumPriority,
  HighPriority,
  UrgentPriority,
} from "../../shared/svg/Priority";
import { useTheme } from "@/context/ThemeProvider";
import { getPriorityIcon } from "@/_components/Projects/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  LabelIcon,
  MemberIcon,
  NullIcon,
} from "@/_components/shared/svg/SharedIcons";
import { Input } from "@/components/ui/input";
import { ProjectIcon } from "@/_components/shared/svg/SidebarIcons";
import { useNewCardMutation } from "./new-card-mutations";

type TNewCardActionsProps = {
  dueDate: Date | undefined;
  setDueDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  priority: string;
  setPriority: React.Dispatch<React.SetStateAction<string>>;
  labels: string[];
  setLabels: React.Dispatch<React.SetStateAction<string[]>>;
  assignee: string | null;
  setAssignee: React.Dispatch<React.SetStateAction<string | null>>;
  project: string | null;
  setProject: React.Dispatch<React.SetStateAction<string | null>>;
};

interface TeamMember {
  id: string;
  name?: string;
  email: string;
  username?: string;
  imageUrl?: string;
}

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
  project,
  setProject,
}: TNewCardActionsProps) => {
  const [newLabel, setNewLabel] = useState("");

  const filteredLabels = useMemo(() => {
    if (!newLabel.trim()) {
      return AVAILABLE_LABELS;
    }

    return AVAILABLE_LABELS.filter((label) =>
      label.toLowerCase().includes(newLabel.toLowerCase())
    );
  }, [newLabel]);

  const { theme } = useTheme();

  const { teamData, allProjects } = useNewCardMutation();

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

  const handleRemoveLabel = (label: string) => {
    setLabels(labels.filter((l) => l !== label));
  };

  const handleProjectClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="flex gap-0.5 flex-wrap px-4 py-2.5">
      {/* Priority Select */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit px-2 h-7 text-xs rounded-sm dark:bg-black dark:border-[#1b1d1c] font-normal flex items-center gap-1 border"
            onClick={handlePriorityClick}
          >
            {getPriorityIcon(priority, theme)}
            {priority === "none" && "Priority"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setPriority("none")}>
            <Priority className="size-3" /> <span className="ml-2">None</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPriority("low")}>
            <LowPriority className="size-3" isDark={theme === "dark"} />{" "}
            <span className="ml-2">Low</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPriority("medium")}>
            <MediumPriority className="size-3" isDark={theme === "dark"} />{" "}
            <span className="ml-2">Medium</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPriority("high")}>
            <HighPriority className="size-3" isDark={theme === "dark"} />{" "}
            <span className="ml-2">High</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPriority("urgent")}>
            <UrgentPriority className="size-3" />{" "}
            <span className="ml-2">Urgent</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Assignee Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs rounded-sm dark:bg-black dark:border-[#1b1d1c]  font-normal flex items-center"
          >
            <MemberIcon className="w-3 h-3" />
            <span className="text-xs">Assignee</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="h-52 overflow-auto">
          {teamMembers.map((member) => {
            const isSelected = assignee === member.id;
            return (
              <DropdownMenuItem
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
                <div className="text-xs font-medium truncate flex-1 min-w-0">
                  {member.name || member.username || member.email}
                </div>
                {isSelected && <Check className="w-3 h-3 text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Labels Dropdown */}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-7 text-xs rounded-sm font-normal px-2 dark:bg-black dark:border-[#1b1d1c]"
            )}
          >
            <LabelIcon className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 p-1.5 h-52 !overflow-y-auto"
          align="start"
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            // Prevent closing when clicking on the input
            if (e.target instanceof Element && e.target.closest("input")) {
              e.preventDefault();
            }
          }}
        >
          <div className="relative flex items-center">
            <Input
              className="w-full px-1 bg-transparent !text-xs border-0 placeholder:text-xs focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-7"
              placeholder="Search or add labels.."
              value={newLabel}
              onChange={(e) => {
                e.stopPropagation();
                setNewLabel(e.target.value);
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") {
                  e.preventDefault();
                  const trimmed = newLabel.trim();

                  if (!trimmed) return;

                  if (labels.includes(trimmed)) {
                    // Remove if already exists
                    setLabels(labels.filter((l) => l !== trimmed));
                  } else {
                    // Add new label
                    setLabels([...labels, trimmed]);
                  }
                  setNewLabel("");
                }
              }}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              autoFocus
            />
            <LabelIcon className="absolute right-0 text-muted-foreground" />
          </div>

          <DropdownMenuSeparator />

          {/* Show "Add new label" option if search doesn't match existing labels */}
          {newLabel.trim() &&
            !AVAILABLE_LABELS.some(
              (label) => label.toLowerCase() === newLabel.toLowerCase()
            ) &&
            !labels.some(
              (label) => label.toLowerCase() === newLabel.toLowerCase()
            ) && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  const trimmed = newLabel.trim();
                  setLabels([...labels, trimmed]);
                  setNewLabel("");
                }}
                className="text-xs flex justify-between bg-accent/50"
              >
                <span>Add "{newLabel.trim()}"</span>
                <Check className="w-3 h-3 text-primary" />
              </DropdownMenuItem>
            )}

          {/* Filtered label options */}
          {filteredLabels.length > 0
            ? filteredLabels.map((label) => (
                <DropdownMenuItem
                  key={label}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (labels.includes(label)) {
                      setLabels(labels.filter((l) => l !== label));
                    } else {
                      setLabels([...labels, label]);
                    }
                  }}
                  className="text-xs flex justify-between"
                >
                  <span>{label}</span>
                  {labels.includes(label) && (
                    <Check className="w-3 h-3 text-primary" />
                  )}
                </DropdownMenuItem>
              ))
            : newLabel.trim() && (
                <div className="text-xs text-muted-foreground p-2 text-center">
                  No matching labels found
                </div>
              )}
        </DropdownMenuContent>
      </DropdownMenu>
      {/**Project Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit px-2 h-7 text-xs rounded-sm dark:bg-black dark:border-[#1b1d1c] font-normal flex items-center gap-1"
            onClick={handleProjectClick}
          >
            <ProjectIcon className="size-3.5" />
            {project === null
              ? "Project"
              : allProjects?.find((p) => p.id === project)?.title}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            key={"no-project-id"}
            className="text-xs group hover:text-emerald-600 transition-all ease-linear"
            onClick={() => setProject(null)}
          >
            <NullIcon className="group-hover:text-red-600" />
            No Project
          </DropdownMenuItem>
          {allProjects?.map((project) => {
            return (
              <DropdownMenuItem
                key={project.id}
                className="text-xs group hover:text-emerald-600 transition-all ease-linear"
                onClick={() => setProject(project.id)}
              >
                <Box className="group-hover:text-emerald-600" />
                {project.title}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      <DueDatePickerDropdown dueDate={dueDate} setDueDate={setDueDate} />
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
              "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700",
              "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700",
              "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700",
              "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700",
              "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-700",
            ];
            const colorClass = colorVariants[index % colorVariants.length];

            return (
              <div
                key={label}
                className={`text-xs h-7 pr-2 flex items-center gap-1 ${colorClass} hover:opacity-80 transition-opacity rounded-sm px-2`}
              >
                <span className="text-xs font-semibold">{label}</span>
                <X
                  className="w-3 h-3 cursor-pointer "
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveLabel(label);
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

export default NewCardActions;
