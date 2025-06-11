import { Button } from "@/components/ui/button";
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Flag,
  Tag,
  X,
  Search,
  Users,
  Info,
  Plus,
  FileText,
  Clock,
  User,
} from "lucide-react";

import { CardContext } from "@/context/CardProvider";
import { TCardContext } from "@/types/cardTypes";
import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";

import { useCardMutation } from "../../../_mutations/useCardMutations";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const {
    priority = "low",
    dueDate,
    labels = [],
    id: cardId,
    assignees
  } = cardDetails as TCardContext;
  const { updateCardMutation } = useCardMutation();
  const { data: teamMembers = [], isLoading: isLoadingMembers } = useTeamMembers();
  
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  const createdAt = new Date();
  const status = "Backlog";
  const storyPoints = 0;

  // Find assigned members - use assignees array if available, fallback to assigneeId
  const assignedMembers = assignees || [];


  const handleAssignMember = (memberId: string) => {
    updateCardMutation.mutate({
      cardId,
      assigneeId: memberId,
    });
    setShowAssigneeDropdown(false);
  };

  const handleUnassign = (memberId?: string) => {
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
    <div className="h-full border-l border-border dark:border-zinc-700 flex flex-col">
      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        {/* Task Details Header */}
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 dark:text-white text-black" />
            Details
          </div>
        </h2>

        {/* Priority Section */}
        <div className="space-y-3 pb-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 dark:text-white text-black" />
              <span className="text-sm text-zinc-500">Priority</span>
            </div>
            <div
              className={`px-3 py-1 text-white text-xs font-medium rounded-full ${
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
              {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
            </div>
          </div>

          <div>
            <div className="relative w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg mb-2">
              <div
                className={`absolute top-0 left-0 h-full rounded-lg ${
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
        <div className="space-y-3 pb-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 dark:text-white text-black" />
              <span className="text-sm text-zinc-500">Due Date</span>
            </div>
            {dueDate && (
              <div 
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  isToday(dueDate) 
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" 
                    : isTomorrow(dueDate)
                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {isToday(dueDate) ? "Today" : isTomorrow(dueDate) ? "Tomorrow" : formatDate(dueDate)}
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={isToday(dueDate) ? "destructive" : "outline"}
              className={cn(
                "rounded-full text-xs py-1 px-4 h-auto",
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
                "rounded-full text-xs py-1 px-4 h-auto",
                isTomorrow(dueDate) && "bg-yellow-500 hover:bg-yellow-600 text-white"
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
                  className="rounded-full text-xs py-1 px-4 h-auto flex items-center gap-1"
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
                      className="w-full"
                      onClick={() => updateCardMutation.mutate({ cardId, dueDate: null })}
                    >
                      Clear due date
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
            {dueDate && (
              <Button
                variant="ghost"
                className="rounded-full text-xs py-1 px-4 h-auto text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => updateCardMutation.mutate({ cardId, dueDate: null })}
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Labels Section */}
        <div className="space-y-3 pb-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Labels
              </span>
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
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-muted/50 hover:bg-muted rounded-full border border-border transition-colors"
                >
                  {label}
                  <Button
                    size="sm"
                    className="w-4 h-4 p-0 bg-transparent hover:bg-transparent ml-1"
                    onClick={() => updateCardMutation.mutate({ cardId, label })}
                  >
                    <X className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
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
        <div className="space-y-4 pb-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">Assignee</span>
                <p className="text-xs text-muted-foreground">Who's working on this?</p>
              </div>
            </div>
            <Popover open={showAssigneeDropdown} onOpenChange={setShowAssigneeDropdown}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-3 text-xs border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {assignedMembers.length > 0 ? "Change" : "Assign"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3" align="end">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Assign to team member</h4>
                      <p className="text-xs text-muted-foreground">Select someone to work on this task</p>
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
                        const isAssigned = assignedMembers.some(assigned => assigned.id === member.id);
                        return (
                          <button
                            key={member.id}
                            onClick={() => !isAssigned && handleAssignMember(member.id)}
                            disabled={isAssigned}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                              isAssigned 
                                ? "border-primary/20 bg-primary/5 dark:bg-primary/10 cursor-default" 
                                : "border-border hover:border-primary/40 hover:bg-accent hover:shadow-sm cursor-pointer"
                            }`}
                          >
                            <Avatar className="w-8 h-8 ring-2 ring-background shadow-sm">
                              <AvatarImage src={member.imageUrl} alt={member.name || member.username} />
                              <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-700 dark:text-blue-300">
                                {(member.name || member.username || member.email)?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left min-w-0">
                              <div className="font-medium text-foreground text-sm truncate">
                                {member.name || member.username}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {member.email}
                              </div>
                            </div>
                            {isAssigned && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground rounded-full">
                                <div className="w-2 h-2 rounded-full bg-current"></div>
                                <span className="text-xs font-medium">Assigned</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="p-3 rounded-full bg-muted inline-flex mb-3">
                        <Users className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <h4 className="text-sm font-medium text-foreground mb-1">No team members found</h4>
                      <p className="text-xs text-muted-foreground">Invite team members to start collaborating</p>
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

          <div className="space-y-3">
            {assignedMembers.length > 0 ? (
              <div className="space-y-2">
                {assignedMembers.map((assignedMember) => (
                  <div key={assignedMember.id} className="group relative">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-accent/50 to-accent/30 hover:from-accent/70 hover:to-accent/50 border border-border/50 rounded-lg transition-all duration-200">
                      <Avatar className="w-10 h-10 ring-2 ring-background shadow-md">
                        <AvatarImage src={assignedMember.imageUrl} alt={assignedMember.name || assignedMember.username} />
                        <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-700 dark:text-blue-300">
                          {(assignedMember.name || assignedMember.username || assignedMember.email)?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-foreground truncate">
                            {assignedMember.name || assignedMember.username}
                          </h4>
                          <div className="px-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground rounded-full">
                            <span className="text-xs font-medium">Assigned</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span className="truncate">{assignedMember.email}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                        onClick={() => handleUnassign(assignedMember.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="group">
                <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 rounded-lg transition-colors duration-200 cursor-pointer"
                     onClick={() => setShowAssigneeDropdown(true)}>
                  <div className="p-3 rounded-full bg-muted/50 group-hover:bg-primary/10 transition-colors duration-200 mb-3">
                    <User className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                  </div>
                  <h4 className="text-sm font-medium text-foreground mb-1">No one assigned</h4>
                  <p className="text-xs text-muted-foreground text-center mb-3">
                    Click to assign a team member to this task
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-dashed"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Assign someone
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="space-y-3 pb-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 dark:text-white text-black" />
            <span className="text-sm text-zinc-500">Additional Info</span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Created</span>
              <span>{formatDate(createdAt) || "Mar 24, 2025"}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Status</span>
              <div className=" bg-zinc-100 dark:bg-zinc-800 text-xs font-medium rounded-full">
                {status}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Story Points</span>
              <span>{storyPoints}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 dark:text-white text-black" />
              <span className="text-sm text-zinc-500">Time Tracking</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() =>
                (window.location.href = `/workspace/analytics?task=${cardId}`)
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
              <span className="text-zinc-500">Time Spent</span>
              <span>2h 15m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
