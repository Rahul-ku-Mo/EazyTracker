import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useTheme } from "@/context/ThemeProvider";
import PriorityDropdown from "./contextMenu/PriorityDropdown";
import MembersCommandDropdown from "./contextMenu/MembersCommandDropdown";

import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateProject,
  updateProjectTargetDate,
  updateProjectMembers,
  updateProjectPriority,
} from "@/apis/project";
import { useToast } from "@/hooks/use-toast";
import { DateCreatedIcon } from "../shared/svg/ViewOptionsIcons";
import { TargetIcon } from "../shared/svg/SharedIcons";
import StatusDropdown from "./contextMenu/StatusDropdown";

interface ProjectSidebarProps {
  project: any;
}

export const ProjectSidebar = ({ project }: ProjectSidebarProps) => {
  const { theme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  
  // Mutations
  const updateProjectMutation = useMutation({
    mutationFn: (data: any) => updateProject({ slug: project.slug, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", project.slug] });
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    },
  });

  const updateTargetDateMutation = useMutation({
    mutationFn: (targetDate: string | null) =>
      updateProjectTargetDate(project.slug, targetDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", project.slug] });
      toast({
        title: "Success",
        description: "Target date updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update target date",
        variant: "destructive",
      });
    },
  });

  const updateMembersMutation = useMutation({
    mutationFn: (memberIds: string[]) =>
      updateProjectMembers(project.slug, memberIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", project.slug] });
      toast({
        title: "Success",
        description: "Project members updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update project members",
        variant: "destructive",
      });
    },
  });

  const updatePriorityMutation = useMutation({
    mutationFn: (priority: string) =>
      updateProjectPriority(project.slug, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", project.slug] });
      toast({
        title: "Success",
        description: "Project priority updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update project priority",
        variant: "destructive",
      });
    },
  });

  // Auto-save handler for status
  const handleAutoSaveStatus = (newStatus: string) => {
    if (newStatus !== project.status) {
      updateProjectMutation.mutate({ status: newStatus });
    }
  };

  const handleMembersChange = (memberIds: string[]) => {
    updateMembersMutation.mutate(memberIds);
  };

  const handlePriorityChange = (priority: string) => {
    updatePriorityMutation.mutate(priority);
  };

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="flex items-center justify-between text-xs group">
        <span className="text-muted-foreground font-medium inline-flex items-center gap-1.5">
          Status
        </span>
        <StatusDropdown
          status={project.status || "not_started"}
          onChange={handleAutoSaveStatus}
        />
      </div>

      {/* Priority */}
      <div className="flex items-center justify-between text-xs group">
        <span className="text-muted-foreground font-medium inline-flex items-center gap-1.5">
          Priority
        </span>
        <div>
          <PriorityDropdown
            priority={project.priority || "none"}
            onChange={handlePriorityChange}
            isDark={theme === "dark"}
          />
        </div>
      </div>

      {/* Start Date */}
      <div className="flex items-center justify-between text-xs group">
        <span className="text-muted-foreground font-medium inline-flex items-center gap-1.5">
          <DateCreatedIcon />
          Start Date
        </span>
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start px-0 text-left font-mono tracking-tight text-xs h-7 hover:bg-accent/20 transition-colors",
                  !project.startDate && "text-muted-foreground"
                )}
              >
                {project.startDate
                  ? new Date(project.startDate).toLocaleDateString()
                  : "No start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={
                  project.startDate ? new Date(project.startDate) : undefined
                }
                onSelect={(date) => {
                  updateProjectMutation.mutate({
                    startDate: date ? date.toISOString() : null,
                  });
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Target Date */}
      <div className="flex items-center justify-between text-xs group">
        <span className="text-muted-foreground font-medium inline-flex items-center gap-1.5">
          <TargetIcon />
          Target Date
        </span>
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start px-0 text-left font-mono tracking-tight text-xs h-7 hover:bg-accent/20 transition-colors",
                  !project.targetDate && "text-muted-foreground"
                )}
              >
                {project.targetDate
                  ? new Date(project.targetDate).toLocaleDateString()
                  : "No due date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={
                  project.targetDate ? new Date(project.targetDate) : undefined
                }
                onSelect={(date) => {
                  updateTargetDateMutation.mutate(
                    date ? date.toISOString() : null
                  );
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Members */}
      <div className="flex items-center justify-between text-xs group">
        <span className="text-muted-foreground font-medium inline-flex items-center gap-1.5">
          Members
        </span>
        <div>
          <MembersCommandDropdown
            currentMembers={project.members?.map((m: any) => m.user) || []}
            onMembersChange={(members) =>
              handleMembersChange(members.map((m) => m.id))
            }
          />
        </div>
      </div>

      {/* Progress */}
      {project.cards && project.cards.length > 0 && (
        <div className="flex items-center justify-between text-sm pt-4 border-t">
          <span className="text-muted-foreground font-medium inline-flex items-center gap-1.5">
            Progress
          </span>
          <div className="flex-1 flex items-center gap-2 text-xs">
            <Badge variant="outline">{project.cards.length} total</Badge>
            <Badge variant="outline">
              {
                project.cards.filter((c: any) => c.status === "Completed")
                  .length
              }{" "}
              done
            </Badge>
          </div>
        </div>
      )}

      {/* Workspaces */}
      {(project.workspaces ?? []).length > 0 && (
        <div className="flex items-start justify-between text-sm pt-2">
          <span className="text-muted-foreground font-medium inline-flex items-center gap-1.5 pt-1">
            Boards
          </span>
          <div className="flex-1 flex flex-wrap gap-1">
            {(project.workspaces ?? []).map((item: any) => {
              const workspace = item.workspace ?? item;
              return (
                <Badge key={workspace.id} variant="secondary" className="text-xs">
                  {workspace.title}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSidebar;
