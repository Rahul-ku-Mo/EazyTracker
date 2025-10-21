import { Button } from "@/components/ui/button";

import { Box, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DueDatePickerDropdown } from "./DueDatePicker";

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
import { KanbanContext } from "@/context/KanbanProvider";
import { useContext } from "react";
import { getPriorityIcon } from "@/_components/Projects/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  LabelIcon,
  MemberIcon,
  NullIcon,
} from "@/_components/shared/svg/SharedIcons";

import { ProjectIcon } from "@/_components/shared/svg/SidebarIcons";
import { useNewCardMutation } from "./new-card-mutations";
import { StoryDropdown } from "./story-dropdown";
import { LabelDropdown } from "@/_components/shared/LabelDropdown";

type TNewCardActionsProps = {
  dueDate: Date | undefined;
  setDueDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  priority: string;
  setPriority: React.Dispatch<React.SetStateAction<string>>;
  labels: any[];
  setLabels: React.Dispatch<React.SetStateAction<any[]>>;
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

interface Label {
  id: string;
  name: string;
  color?: string;
}

const NewCardActions = ({
  dueDate,
  setDueDate,
  priority,
  setLabels,
  labels,
  setPriority,
  assignee,
  setAssignee,
  project,
  setProject,
}: TNewCardActionsProps) => {
  const { theme } = useTheme();
  const { workspace } = useContext(KanbanContext);
  const workspaceId = workspace?.id;

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

  const handleProjectClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleLabelRemove = (labelId: string) => {
    setLabels((prevLabels: Label[]) => 
      prevLabels.filter((label) => label.id !== labelId)
    );
  };

  const handleProjectSelect = (projectId: string | null) => {
    setProject(projectId);
  };

  const selectedProject = allProjects?.find((p) => p.id === project);
  const selectedAssignee = teamMembers.find((m) => m.id === assignee);

  return (
    <div className="flex gap-1 flex-wrap px-4 py-2.5">
      {/* Priority Select */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "w-fit px-2 h-7 text-xs rounded-sm font-normal flex items-center gap-1.5 border transition-colors",
              "dark:bg-black dark:border-[#1b1d1c] hover:bg-accent/50",
              priority !== "none" && "border-primary/20 bg-primary/5"
            )}
            onClick={handlePriorityClick}
          >
            {getPriorityIcon(priority, theme)}
            {priority === "none" ? "Priority" : priority.charAt(0).toUpperCase() + priority.slice(1)}
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

      {/* Assignee Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-7 text-xs rounded-sm font-normal flex items-center gap-1.5 transition-colors",
              "dark:bg-black dark:border-[#1b1d1c] hover:bg-accent/50",
              assignee && "border-primary/20 bg-primary/5"
            )}
          >
            {assignee ? (
              <>
                <Avatar className="w-3 h-3">
                  <AvatarImage src={selectedAssignee?.imageUrl} />
                  <AvatarFallback className="text-[8px]">
                    {(selectedAssignee?.name || selectedAssignee?.email)?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs max-w-20 truncate">
                  {selectedAssignee?.name || selectedAssignee?.username || selectedAssignee?.email}
                </span>
              </>
            ) : (
              <>
                <MemberIcon className="w-3 h-3" />
                <span className="text-xs">Assignee</span>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-52 overflow-auto min-w-[200px]" align="start">
          <DropdownMenuItem
            onClick={() => setAssignee(null)}
            className={cn(
              "flex items-center gap-2 p-2",
              !assignee && "bg-accent"
            )}
          >
            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
            </div>
            <span className="text-xs">Unassigned</span>
            {!assignee && <Check className="w-3 h-3 ml-auto text-primary" />}
          </DropdownMenuItem>
          {teamMembers.map((member) => {
            const isSelected = assignee === member.id;
            return (
              <DropdownMenuItem
                key={member.id}
                onClick={() => handleAssigneeSelect(member.id)}
                className={cn(
                  "flex items-center gap-2 p-2 cursor-pointer transition-colors",
                  isSelected && "bg-accent"
                )}
              >
                <Avatar className="w-4 h-4">
                  <AvatarImage src={member.imageUrl} />
                  <AvatarFallback className="text-[8px]">
                    {(member.name || member.email)?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="text-xs font-medium truncate">
                    {member.name || member.username || member.email}
                  </div>
                  {member.name && member.email && (
                    <div className="text-[10px] text-muted-foreground truncate">
                      {member.email}
                    </div>
                  )}
                </div>
                {isSelected && <Check className="w-3 h-3 text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Story Dropdown */}
      <StoryDropdown />

      {/* Labels Dropdown */}
      {workspaceId && (
        <LabelDropdown workspaceId={workspaceId} action={setLabels}>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-7 px-2 border rounded-sm text-xs font-medium flex items-center gap-1.5 transition-colors",
              "dark:border-[#1b1d1c] dark:hover:bg-black",
            )}
          >
            <LabelIcon className="w-3 h-3" />
            <span>Labels</span>
            {labels.length > 0 && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px] min-w-4">
                {labels.length}
              </Badge>
            )}
          </Button>
        </LabelDropdown>
      )}

      {/* Project Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "w-fit px-2 h-7 text-xs rounded-sm font-normal flex items-center gap-1.5 transition-colors",
              "dark:bg-black dark:border-[#1b1d1c] hover:bg-accent/50",
              project && "border-primary/20 bg-primary/5"
            )}
            onClick={handleProjectClick}
          >
            <ProjectIcon className="size-3" />
            <span className="max-w-24 truncate">
              {project === null
                ? "Project"
                : selectedProject?.title || "Unknown Project"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[180px]">
          <DropdownMenuItem
            onClick={() => handleProjectSelect(null)}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors",
              !project && "bg-accent"
            )}
          >
            <NullIcon className="w-3 h-3" />
            <span>No Project</span>
            {!project && <Check className="w-3 h-3 ml-auto text-primary" />}
          </DropdownMenuItem>
          {allProjects?.map((proj) => {
            const isSelected = project === proj.id;
            return (
              <DropdownMenuItem
                key={proj.id}
                className={cn(
                  "flex items-center gap-2 text-xs transition-colors",
                  isSelected && "bg-accent"
                )}
                onClick={() => handleProjectSelect(proj.id)}
              >
                <Box className="w-3 h-3" />
                <span className="truncate flex-1">{proj.title}</span>
                {isSelected && <Check className="w-3 h-3 text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Due Date Picker */}
      <DueDatePickerDropdown dueDate={dueDate} setDueDate={setDueDate} />

      {/* Selected Priority Badge (when not "none") */}
      {priority !== "none" && (
        <Badge
          variant="secondary"
          className="text-xs h-7 pl-1.5 pr-2 flex items-center gap-1.5 bg-primary/10 border-primary/20"
        >
          {getPriorityIcon(priority, theme)}
          <span className="capitalize">{priority}</span>
          <X
            className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPriority("none");
            }}
          />
        </Badge>
      )}

      {/* Selected Assignee Badge */}
      {assignee && selectedAssignee && (
        <Badge
          variant="secondary"
          className="text-xs h-7 pl-1 pr-2 flex items-center gap-1.5 bg-primary/10 border-primary/20"
        >
          <Avatar className="w-3 h-3">
            <AvatarImage src={selectedAssignee.imageUrl} />
            <AvatarFallback className="text-[8px]">
              {(selectedAssignee.name || selectedAssignee.email)?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs max-w-20 truncate">
            {selectedAssignee.name || selectedAssignee.username || selectedAssignee.email}
          </span>
          <X
            className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setAssignee(null);
            }}
          />
        </Badge>
      )}

      {/* Selected Project Badge */}
      {project && selectedProject && (
        <Badge
          variant="secondary"
          className="text-xs h-7 pl-1.5 pr-2 flex items-center gap-1.5 bg-primary/10 border-primary/20"
        >
          <ProjectIcon className="w-3 h-3" />
          <span className="text-xs max-w-24 truncate">{selectedProject.title}</span>
          <X
            className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setProject(null);
            }}
          />
        </Badge>
      )}

      {/* Selected Labels Badges */}
      {labels.length > 0 &&
        labels.map((label: Label) => (
          <Badge
            key={label.id}
            variant="secondary"
            className="text-xs h-7 pl-1.5 pr-2 flex items-center gap-1.5 dark:bg-black border-primary/20"
          >
            <div 
              className="w-2 h-2 rounded-full"
              style={{ 
                backgroundColor: label.color || '#6b7280' 
              }}
            />
            <span className="text-xs max-w-20 truncate">{label.name}</span>
            <X
              className="w-3 h-3 cursor-pointer transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLabelRemove(label.id);
              }}
            />
          </Badge>
        ))}

      {/* Selected Due Date Badge */}
      {dueDate && (
        <Badge
          variant="secondary"
          className="text-xs h-7 pl-1.5 pr-2 flex items-center gap-1.5 bg-primary/10 border-primary/20"
        >
          <span className="text-xs">
            {dueDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: dueDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
            })}
          </span>
          <X
            className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDueDate(undefined);
            }}
          />
        </Badge>
      )}
    </div>
  );
};

export default NewCardActions;