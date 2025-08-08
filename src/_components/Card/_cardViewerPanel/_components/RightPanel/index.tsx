import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CalendarIcon,
  X,
  Search,
  Plus,
  User,
  Share,
  Copy,
  Link,
  Triangle,
  Check,
} from "lucide-react";

import { CardContext } from "@/context/CardProvider";
import { TCardContext } from "@/types/cardTypes";
import { useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

import { useCardMutation } from "../../../_mutations/useCardMutations";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPriorityIcon } from "@/_components/Projects/utils";
import { DateCreatedIcon } from "@/_components/shared/svg/ViewOptionsIcons";
import {
  AdditionalInfoIcon,
  LabelIcon,
  MemberIcon,
  TimeTrackingIcon,
} from "@/_components/shared/svg/SharedIcons";

// Types
interface TeamMember {
  id: string;
  name: string;
  email: string;
  username?: string;
  imageUrl?: string;
}

// Custom hook to fetch team members
const useTeamMembers = () => {
  const accessToken = Cookies.get("accessToken") || "";

  return useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/teams/members`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        return response.data.data as TeamMember[];
      } catch (error) {
        console.error("Failed to fetch team members:", error);
        return [];
      }
    },
    enabled: !!accessToken,
  });
};

const isToday = (date?: Date | string | null) => {
  if (!date) return false;
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return false; // Check for invalid date
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

const isTomorrow = (date?: Date | string | null) => {
  if (!date) return false;
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return false; // Check for invalid date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return dateObj.toDateString() === tomorrow.toDateString();
};

const formatDate = (date?: Date | string | null) => {
  if (!date) return "";
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(dateObj);
};

const RightPanel = () => {
  const cardDetails = useContext(CardContext);
  const navigate = useNavigate();
  const {
    priority = "low",
    dueDate,
    labels = [],
    id: cardId,
    assignees,
    storyPoints: initialStoryPoints = 0,
  } = cardDetails as TCardContext;
  const { updateCardMutation } = useCardMutation();
  const { data: teamMembers = [], isLoading: isLoadingMembers } =
    useTeamMembers();

  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  const createdAt = new Date();
  const [storyPoints, setStoryPoints] = useState(initialStoryPoints);

  // Find assigned members - use assignees array if available, fallback to assigneeId
  const assignedMembers = assignees || [];

  // Sync storyPoints state with card context
  useEffect(() => {
    setStoryPoints(initialStoryPoints);
  }, [initialStoryPoints]);

  const handleAssignMember = (memberId: string) => {
    console.log("Assigning member:", memberId, "to card:", cardId);
    updateCardMutation.mutate({
      cardId,
      assigneeId: memberId,
    });
    setShowAssigneeDropdown(false);
  };

  const handleUnassign = (memberId?: string) => {
    console.log("Unassigning member:", memberId, "from card:", cardId);
    if (memberId) {
      // If specific member ID provided, remove just that member
      // For now, we'll handle single assignment, but this can be extended for multiple
      updateCardMutation.mutate({
        cardId,
        assigneeId: null,
      });
    } else {
      // Remove all assignments
      updateCardMutation.mutate({
        cardId,
        assigneeId: null,
      });
    }
  };

    
  return (
    <div className="h-full flex flex-col fixed right-0">
      <div className="py-4 pr-4 flex flex-col gap-4 flex-1 ">
        {/* Task Details Header */}
        <h2 className="text-sm font-semibold border border-[#e3e3e3b5] dark:border-zinc-700 rounded-md p-2 dark:bg-[#101010]">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-xs font-medium text-primary">Details</span>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Share
                strokeWidth={3}
                className="size-4 hover:text-primary hover:cursor-pointer hover:bg-primary/10 p-0.5 rounded-sm"
              />
              <Copy
                strokeWidth={3}
                className="size-4 hover:text-primary hover:cursor-pointer hover:bg-primary/10 p-0.5 rounded-sm"
              />
              <Link
                strokeWidth={3}
                className="size-4 hover:text-primary hover:cursor-pointer hover:bg-primary/10 p-0.5 rounded-sm"
              />
            </div>
          </div>
        </h2>

        {/* Priority Section */}
        <div className="space-y-3 border border-[#e3e3e3b5] dark:border-zinc-700 rounded-md p-2 dark:bg-[#101010]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getPriorityIcon(priority)}
              <span className="text-xs font-medium text-primary">Priority</span>
            </div>
            <div
              className={`px-3 py-1 text-white text-xs font-medium rounded-md ${
                priority === "urgent"
                  ? "bg-red-500"
                  : priority === "high"
                    ? "bg-amber-500"
                    : priority === "medium"
                      ? "bg-blue-500"
                      : priority === "low"
                        ? "bg-green-500"
                        : "bg-zinc-400"
              }`}
            >
              {priority === null ? "None" : `${priority?.charAt(0).toUpperCase() + priority?.slice(1)}`}
            </div>
          </div>

          <div>
            <div className="relative w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg mb-2">
              <div
                className={`absolute top-0 left-0 h-full rounded-x ${
                  priority === "urgent"
                    ? "bg-red-500 w-full"
                    : priority === "high"
                      ? "bg-amber-500 w-3/4"
                      : priority === "medium"
                        ? "bg-blue-500 w-2/4"
                        : priority === "low"
                          ? "bg-green-500 w-1/4"
                          : "w-0"
                }`}
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span
                onClick={() =>
                  updateCardMutation.mutate({ cardId, priority: "none" })
                }
                className={cn(
                  "font-medium cursor-pointer",
                  priority === "none" && "font-bold"
                )}
              >
                None
              </span>
              <span
                onClick={() =>
                  updateCardMutation.mutate({ cardId, priority: "low" })
                }
                className={cn(
                  "font-medium cursor-pointer",
                  priority === "low" && "font-bold"
                )}
              >
                Low
              </span>
              <span
                onClick={() =>
                  updateCardMutation.mutate({ cardId, priority: "medium" })
                }
                className={cn(
                  "font-medium cursor-pointer",
                  priority === "medium" && "font-bold"
                )}
              >
                Medium
              </span>
              <span
                onClick={() =>
                  updateCardMutation.mutate({ cardId, priority: "high" })
                }
                className={cn(
                  "font-medium cursor-pointer",
                  priority === "high" && "font-bold"
                )}
              >
                High
              </span>
              <span
                onClick={() =>
                  updateCardMutation.mutate({ cardId, priority: "urgent" })
                }
                className={cn(
                  "font-medium cursor-pointer",
                  priority === "urgent" && "font-bold"
                )}
              >
                Urgent
              </span>
            </div>
          </div>
        </div>

        {/* Due Date Section */}
        <div className="space-y-3 border border-[#e3e3e3b5] dark:border-zinc-700 rounded-md p-2 dark:bg-[#101010]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DateCreatedIcon />
              <span className="text-xs font-medium text-primary">Due Date</span>
            </div>
            {dueDate && (
              <div
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  isToday(dueDate)
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    : isTomorrow(dueDate)
                      ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {isToday(dueDate)
                  ? "Today"
                  : isTomorrow(dueDate)
                    ? "Tomorrow"
                    : formatDate(dueDate)}
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <Button
              variant={isToday(dueDate) ? "destructive" : "outline"}
              className={cn(
                "rounded-md text-xs py-1 px-4 h-auto",
                isToday(dueDate) && "bg-red-500 hover:bg-red-600 text-white"
              )}
              onClick={() =>
                updateCardMutation.mutate({ cardId, dueDate: new Date() })
              }
            >
              Today
            </Button>
            <Button
              variant={isTomorrow(dueDate) ? "secondary" : "outline"}
              className={cn(
                "rounded-md text-xs py-1 px-4 h-auto",
                isTomorrow(dueDate) &&
                  "bg-yellow-500 hover:bg-yellow-600 text-white"
              )}
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                updateCardMutation.mutate({ cardId, dueDate: tomorrow });
              }}
            >
              Tomorrow
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-md text-xs py-1 px-4 h-auto flex items-center gap-1"
                >
                  <CalendarIcon className="w-3 h-3" />
                  Custom
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate ? new Date(dueDate) : undefined}
                  onSelect={(date) =>
                    updateCardMutation.mutate({ cardId, dueDate: date })
                  }
                  className="bg-white border rounded-md dark:bg-zinc-900"
                />
                {dueDate && (
                  <div className="p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-md"
                      onClick={() =>
                        updateCardMutation.mutate({ cardId, dueDate: null })
                      }
                    >
                      Clear due date
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
            {dueDate && (
              <X
                className="size-4 hover:text-red-500 hover:cursor-pointer hover:bg-red-500/20 rounded-sm p-0.5"
                strokeWidth={3}
                onClick={() =>
                  updateCardMutation.mutate({ cardId, dueDate: null })
                }
              />
            )}
          </div>
        </div>

        {/* Labels Section */}
        <div className="space-y-3 border border-[#e3e3e3b5] dark:border-zinc-700 rounded-md p-2 dark:bg-[#101010]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LabelIcon className="size-4 text-primary" />
              <span className="text-xs font-medium text-primary">Labels</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              <Plus className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {labels?.map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-muted/50 hover:bg-muted rounded-md border border-border transition-colors dark:border-zinc-600"
                >
                  <span className="text-xs font-medium">{label}</span>
                  <X
                    strokeWidth={3}
                    className="size-4 hover:text-red-500 hover:cursor-pointer hover:bg-red-500/20 rounded-sm p-0.5"
                    onClick={() => updateCardMutation.mutate({ cardId, label })}
                  />
                </div>
              ))}
            </div>

            <div className="relative">
              <Search
                strokeWidth={3}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"
              />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem(
                    "label"
                  ) as HTMLInputElement;
                  if (input.value) {
                    updateCardMutation.mutate({
                      cardId,
                      label: input.value,
                    });
                    input.value = "";
                  }
                }}
              >
                <input
                  name="label"
                  type="text"
                  placeholder="Add a label..."
                  className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg bg-background hover:bg-muted/50 focus:bg-background focus:ring-1 focus:ring-ring transition-colors"
                />
              </form>
            </div>
          </div>
        </div>

        {/* Assignees Section */}
        <div className="space-y-3 border border-[#e3e3e3b5] dark:border-zinc-700 rounded-md p-2 dark:bg-[#101010]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MemberIcon strokeWidth={3} className="size-4 text-primary" />
              <span className="text-xs font-medium text-primary">Assignee</span>
            </div>
            <Popover
              open={showAssigneeDropdown}
              onOpenChange={setShowAssigneeDropdown}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  {assignedMembers.length > 0 ? "Change" : "New"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3" align="end">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <MemberIcon className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <h4 className="text-sm font-medium text-foreground">
                        Assign to team member
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Select someone to work on this task
                      </p>
                    </div>
                  </div>

                  {isLoadingMembers ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Loading team members...</span>
                      </div>
                    </div>
                  ) : teamMembers.length > 0 ? (
                    <div className="space-y-1">
                      {teamMembers.map((member) => {
                        const isAssigned = assignedMembers.some(
                          (assigned) => assigned.id === member.id
                        );
                        return (
                          <button
                            key={member.id}
                            onClick={() =>
                              !isAssigned && handleAssignMember(member.id)
                            }
                            disabled={isAssigned}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                              isAssigned
                                ? "border-primary/20 bg-primary/5 dark:bg-primary/10 cursor-default"
                                : "border-border hover:border-primary/40 hover:bg-accent hover:shadow-sm cursor-pointer"
                            }`}
                          >
                            <Avatar className="w-8 h-8 ring-2 ring-background shadow-sm">
                              <AvatarImage
                                src={member.imageUrl}
                                alt={member.name || member.username}
                              />
                              <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-700 dark:text-blue-300">
                                {(
                                  member.name ||
                                  member.username ||
                                  member.email
                                )
                                  ?.charAt(0)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left min-w-0">
                              <div className="text-xs text-muted-foreground truncate">
                                {member.email}
                              </div>
                            </div>
                            {isAssigned && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground rounded-full">
                                <div className="w-2 h-2 rounded-full bg-current"></div>
                                <span className="text-xs font-medium">
                                  Assigned
                                </span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="p-3 rounded-full bg-muted inline-flex mb-3">
                        <MemberIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <h4 className="text-sm font-medium text-foreground mb-1">
                        No team members found
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Invite team members to start collaborating
                      </p>
                    </div>
                  )}

                  {assignedMembers.length > 0 && (
                    <>
                      <div className="border-t border-border pt-2" />
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 h-auto p-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleUnassign()}
                      >
                        <X className="w-4 h-4" />
                        Remove assignee
                      </Button>
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            {assignedMembers.length > 0 ? (
              <div className="space-y-2">
                {assignedMembers.map((assignedMember) => (
                  <div key={assignedMember.id} className="group relative">
                    <div className="flex items-center gap-2 p-2 bg-muted/30 hover:bg-muted/50 border border-[#e3e3e3b5] rounded-md transition-all duration-200 dark:border-zinc-600">
                      <Avatar className="w-8 h-8 ring-1 ring-border">
                        <AvatarImage
                          src={assignedMember.imageUrl}
                          alt={assignedMember.name || assignedMember.username}
                        />
                        <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-700 dark:text-blue-300">
                          {(
                            assignedMember.name ||
                            assignedMember.username ||
                            assignedMember.email
                          )
                            ?.charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground truncate">
                            {assignedMember.name || assignedMember.username}
                          </span>
                          <div className="px-1.5 py-0.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground rounded text-xs font-medium">
                            Assigned
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {assignedMember.email}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                        onClick={() => handleUnassign(assignedMember.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="group">
                <div
                  className="flex flex-col items-center justify-center py-4 px-3 border border-dashed border-muted-foreground/30 hover:border-primary/40 rounded-md transition-colors duration-200 cursor-pointer"
                  onClick={() => setShowAssigneeDropdown(true)}
                >
                  <div className="p-2 rounded-full bg-muted/50 group-hover:bg-primary/10 transition-colors duration-200 mb-2">
                    <User className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                  </div>
                  <span className="text-xs font-medium text-foreground mb-1">
                    No one assigned
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    Click to assign someone
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="space-y-3 border border-[#e3e3e3b5] dark:border-zinc-700 rounded-md p-2 dark:bg-[#101010]">
          <div className="flex items-center gap-2">
            <AdditionalInfoIcon className="size-4 text-primary" />
            <span className="text-xs font-medium text-primary">
              Additional Info
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs">Created</span>
              <span className="text-xs font-medium">
                {formatDate(createdAt) || "Mar 24, 2025"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs">
                Story Points
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 text-xs font-medium hover:bg-muted flex items-center gap-1"
                  >
                    <Triangle
                      strokeWidth={3}
                      className="w-3 h-3 fill-current"
                    />
                    {storyPoints === 0
                      ? "No est."
                      : `${storyPoints} Point${storyPoints !== 1 ? "s" : ""}`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={() => {
                      setStoryPoints(0);
                      updateCardMutation.mutate({ cardId, storyPoints: 0 });
                    }}
                    className="flex items-center justify-between px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Triangle
                        strokeWidth={3}
                        className="w-3 h-3 fill-current text-muted-foreground"
                      />
                      <span>No est.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">0</span>
                      {storyPoints === 0 && (
                        <Check
                          strokeWidth={3}
                          className="w-3 h-3 text-green-500"
                        />
                      )}
                    </div>
                  </DropdownMenuItem>
                  {[1, 2, 4, 8, 16].map((points) => (
                    <DropdownMenuItem
                      key={points}
                      onClick={() => {
                        setStoryPoints(points);
                        updateCardMutation.mutate({
                          cardId,
                          storyPoints: points,
                        });
                      }}
                      className="flex items-center justify-between px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Triangle
                          strokeWidth={3}
                          className="w-3 h-3 fill-current text-muted-foreground"
                        />
                        <span>
                          {points} Point{points !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {storyPoints === points && (
                        <Check
                          strokeWidth={3}
                          className="w-3 h-3 text-green-500"
                        />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="space-y-3 border border-[#e3e3e3b5] dark:border-zinc-700 rounded-md p-2 dark:bg-[#101010]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TimeTrackingIcon
                strokeWidth={3}
                className="size-4 text-primary"
              />
              <span className="text-xs font-medium text-primary">
                Time Tracking
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() =>
                navigate(`analytics?task=${cardId}`)
              }
            >
              View Details
            </Button>
          </div>

          <div className="space-y-2">
            <div className="relative w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg">
              <div
                className="absolute top-0 left-0 h-full bg-blue-500 rounded-lg"
                style={{ width: "45%" }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground text-xs">Time Spent</span>
              <span className="text-xs font-medium">2h 15m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
