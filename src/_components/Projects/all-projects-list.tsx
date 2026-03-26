"use client";

import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  MoreVertical,
  AlertTriangle,
} from "lucide-react";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  updateProjectTargetDate,
  // updateProjectLead,
  updateProjectMembers,
  deleteProject,
} from "@/apis/project";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewProjectDialog } from "./new-project-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,

  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import PriorityDropdown from "./contextMenu/PriorityDropdown";

import MembersCommandDropdown from "./contextMenu/MembersCommandDropdown";
import { updateProjectPriority } from "@/apis/project";
import { useTheme } from "@/context/ThemeProvider";
import { ProjectIcon } from "../shared/svg/SidebarIcons";
import { CalendarLinear } from "../shared/svg/SharedIcons";



export interface ProjectListRow {
  id: string;
  slug: string;
  title: string;
  status: string;
  priority: string;
  lead: { id: string; name: string; imageUrl?: string } | null;
  members: { id: string; name: string; imageUrl?: string }[];
  targetDate?: string;
  createdAt?: string;
  updatedAt?: string;
  workspaces: {
    id: number;
    title: string;
    colorName?: string;
    colorValue?: string;
  }[];
}

// DatePicker component for inline editing
function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
}: {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: any;
}) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined,
  );

  React.useEffect(() => {
    setDate(value ? new Date(value) : undefined);
  }, [value]);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const dd = String(selectedDate.getDate()).padStart(2, "0");
      onChange(`${yyyy}-${mm}-${dd}`);
    } else {
      onChange("");
    }
  };

  const handleClear = () => {
    setDate(undefined);
    onChange("");
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = date && date < today;
  const isToday = date && date.toDateString() === today.toDateString();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div role="button" className="size-6 rounded-sm hover:bg-[#ebebeb] dark:hover:bg-[#2b2b2b] flex items-center justify-center transition-all-linear">
          <CalendarLinear className="" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="border-b p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Select Date</span>
            {date && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export function ProjectsList({
  data,
  teamId,
}: {
  data: ProjectListRow[];
  teamId: string;
}) {
  return <DataList data={data} teamId={teamId} />;
}

export function DataList({
  data,
  teamId,
}: {
  data: ProjectListRow[];
  teamId: string;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const [searchValue, setSearchValue] = React.useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = React.useState("");
  const [sortBy, setSortBy] = React.useState<
    "newest" | "oldest" | "a-z" | "z-a"
  >("newest");


  // Mutations for updating project fields
  const updateTargetDateMutation = useMutation({
    mutationFn: ({
      projectSlug,
      targetDate,
    }: {
      projectSlug: string;
      targetDate: string | null;
    }) => updateProjectTargetDate(projectSlug, targetDate),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", teamId],
      });
    },
  });

  const updatePriorityMutation = useMutation({
    mutationFn: ({
      projectSlug,
      priority,
    }: {
      projectSlug: string;
      priority: string;
    }) => updateProjectPriority(projectSlug, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", teamId],
      });
    },
  });

  const updateMembersMutation = useMutation({
    mutationFn: ({
      projectSlug,
      memberIds,
    }: {
      projectSlug: string;
      memberIds: string[];
    }) => updateProjectMembers(projectSlug, memberIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", teamId],
      });
    },
  });

  // Simple debounce effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!debouncedSearchValue) return data;

    return data.filter(
      (item) =>
        item.title.toLowerCase().includes(debouncedSearchValue.toLowerCase()) ||
        (item.lead?.name || "")
          .toLowerCase()
          .includes(debouncedSearchValue.toLowerCase()) ||
        item.status
          .toLowerCase()
          .includes(debouncedSearchValue.toLowerCase()) ||
        item.priority
          .toLowerCase()
          .includes(debouncedSearchValue.toLowerCase()) ||
        item.workspaces.some((workspace) =>
          workspace.title
            .toLowerCase()
            .includes(debouncedSearchValue.toLowerCase()),
        ),
    );
  }, [data, debouncedSearchValue]);

  // Sort data based on sort option
  const sortedData = React.useMemo(() => {
    const dataToSort = [...filteredData];

    switch (sortBy) {
      case "newest":
        return dataToSort.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA; // Descending order (newest first)
        });
      case "oldest":
        return dataToSort.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB; // Ascending order (oldest first)
        });
      case "a-z":
        return dataToSort.sort((a, b) => a.title.localeCompare(b.title));
      case "z-a":
        return dataToSort.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return dataToSort;
    }
  }, [filteredData, sortBy]);

  return (
    <>
      <div className="flex items-center justify-between px-4 gap-2">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <Input
          type="text"
          id="search"
          placeholder="Search projects..."
          className="text-xs placeholder:text-xs h-6 w-full rounded-sm"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />

        <NewProjectDialog teamId={teamId} />
      </div>
      {data.length > 0 ? (
        <div className="relative mx-4 flex flex-1 flex-col gap-4 overflow-auto rounded-t-sm border">
          <div className="flex flex-1 flex-col">
            {/* Header Row */}
            <div className="sticky top-0 z-10 border-b bg-muted/50 p-1.5">
              <div className="flex items-center gap-4">


                <div className="flex min-w-0 flex-1 items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="h-6 text-xs" variant="outline">
                        Sort by
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem className="text-xs" onClick={() => setSortBy("newest")}>
                        Newest
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs" onClick={() => setSortBy("oldest")}>
                        Oldest
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs" onClick={() => setSortBy("a-z")}>
                        A-Z
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs" onClick={() => setSortBy("z-a")}>
                        Z-A
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <ul>
              {sortedData.length ? (
                sortedData.map((project) => (
                  <li
                    key={project.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/projects/${project.slug}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/projects/${project.slug}`);
                      }
                    }}
                    className="rounded-none border-x-0 border-b border-t-0 p-3 shadow-none transition-colors hover:bg-muted/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <ProjectIcon className="size-4" />
                      <div className="min-w-0 flex-1 text-sm font-semibold">
                        {project.title}
                      </div>
                      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Badge
                          variant="outline"
                          className="px-2 text-muted-foreground"
                        >
                          {project.status === "Completed" ? (
                            <CheckCircle className="mr-1 h-3 w-3 fill-green-500 dark:fill-green-400" />
                          ) : null}
                          {project.status}
                        </Badge>
                      </div>

                      {/* Priority */}
                      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <PriorityDropdown
                          isDark={theme === "dark"}
                          priority={project.priority}
                          onChange={(priority) => {
                            updatePriorityMutation.mutate({
                              projectSlug: project.slug,
                              priority,
                            });
                          }}
                        />
                      </div>

                      {/* Members */}
                      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <MembersCommandDropdown
                          currentMembers={project.members}
                          onMembersChange={(members) => {
                            const memberIds = members.map((m) => m.id);
                            updateMembersMutation.mutate(
                              { projectSlug: project.slug, memberIds },
                              {
                                onSuccess: () => {
                                  toast.success("Members updated successfully");
                                },
                                onError: () => {
                                  toast.error("Failed to update members");
                                },
                              },
                            );
                          }}
                        />
                      </div>

                      {/* Target Date */}
                      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <DatePicker
                          value={project.targetDate}
                          onChange={(date) => {
                            updateTargetDateMutation.mutate(
                              { projectSlug: project.slug, targetDate: date },
                              {
                                onSuccess: () => {
                                  toast.success(
                                    "Target date updated successfully",
                                  );
                                },
                                onError: () => {

                                  toast.error("Failed to update target date");
                                },
                              },
                            );
                          }}
                        />
                      </div>

                      {/* Workspaces */}
                      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        {project.workspaces.length === 0 ? (
                          <Button className="h-6 text-xs" variant="secondary">
                            No workspace
                          </Button>
                        ) : (
                          <div className="flex -space-x-1">
                            {project.workspaces
                              .slice(0, 3)
                              .map((workspace, index) => (
                                <div
                                  key={index}
                                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background text-xs font-medium"
                                  style={{
                                    backgroundColor:
                                      workspace.colorValue || "#6b7280",
                                    color: "#ffffff",
                                  }}
                                  title={workspace.title}
                                >
                                  {workspace.title[0]?.toUpperCase() || "?"}
                                </div>
                              ))}
                            {project.workspaces.length > 3 && (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                                +{project.workspaces.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>


                      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex size-6 text-muted-foreground hover:bg-muted data-[state=open]:bg-muted"
                              size="icon"
                            >
                              <MoreVertical />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteProject(project.slug)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="flex h-[400px] flex-col items-center justify-center gap-2 rounded-lg border">
                  <ProjectIcon className="size-8" />
                  <span className="text-base text-muted-foreground">
                    No projects found.
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
          <div className="border-0 bg-background/50">
            <div className="geist-font text-center text-2xl font-bold">
              Start your journey
            </div>
            <div className="max-w-xs text-center text-sm text-muted-foreground">
              ✨ Create your first client to get started. 🚀
            </div>
          </div>
        </div>
      )}
    </>
  );
}


