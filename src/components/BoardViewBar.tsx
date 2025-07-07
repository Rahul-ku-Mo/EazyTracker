import React from "react";
import { Settings, Search, Filter, Eye, Calendar, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

import { ViewOptions } from "@/store/useViewOptionsStore";
import { Priority } from "@/_components/shared/svg/Priority";

interface BoardViewBarProps {
  currentView: "kanban" | "listview";
  viewOptions: ViewOptions;
  onOptionsChange: (options: Partial<ViewOptions>) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  members?: Array<{
    id: string;
    name: string;
    username: string;
    imageUrl?: string;
  }>;
  onOpenViewOptions?: () => void;
}

const BoardViewBar: React.FC<BoardViewBarProps> = ({
  currentView,
  viewOptions,
  onOptionsChange,
  searchQuery = "",
  onSearchChange,
  members = [],
  onOpenViewOptions,
}) => {
  const activeFiltersCount = Object.values(viewOptions.activeFilters).flat()
    .length;
  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="flex items-center justify-between px-4 py-1.5 h-12 bg-white dark:bg-zinc-900 gap-4">
      {/* Left side - Search */}
      <div className="flex items-center gap-3 flex-1">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-10 h-8 border-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none shadow-none"
          />
        </div>
      </div>

      {/* Right side - Filters and Options */}
      <div className="flex items-center gap-2">
        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-4 w-4 " />
              Filter
              {hasActiveFilters && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Priority Filter */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Priority className="h-4 w-4" />
                Priority
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {["urgent", "high", "medium", "low"].map((priority) => (
                  <DropdownMenuCheckboxItem
                    key={priority}
                    checked={viewOptions.activeFilters.priority.includes(
                      priority
                    )}
                    onCheckedChange={(checked) => {
                      const newPriorities = checked
                        ? [...viewOptions.activeFilters.priority, priority]
                        : viewOptions.activeFilters.priority.filter(
                            (p) => p !== priority
                          );
                      onOptionsChange({
                        activeFilters: {
                          ...viewOptions.activeFilters,
                          priority: newPriorities,
                        },
                      });
                    }}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Assignee Filter */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <User className="h-4 w-4 " />
                Assignee
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {members.map((member) => (
                  <DropdownMenuCheckboxItem
                    key={member.id}
                    checked={viewOptions.activeFilters.assignee.includes(
                      member.id
                    )}
                    onCheckedChange={(checked) => {
                      const newAssignees = checked
                        ? [...viewOptions.activeFilters.assignee, member.id]
                        : viewOptions.activeFilters.assignee.filter(
                            (a) => a !== member.id
                          );
                      onOptionsChange({
                        activeFilters: {
                          ...viewOptions.activeFilters,
                          assignee: newAssignees,
                        },
                      });
                    }}
                  >
                    {member.name || member.username}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Due Date Filter */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Calendar className="h-4 w-4 " />
                Due Date
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {[
                  { value: "overdue", label: "Overdue" },
                  { value: "today", label: "Today" },
                  { value: "thisWeek", label: "This Week" },
                  { value: "thisMonth", label: "This Month" },
                  { value: "none", label: "Clear" },
                ].map(({ value, label }) => (
                  <DropdownMenuCheckboxItem
                    key={value}
                    checked={viewOptions.activeFilters.dueDate === value}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onOptionsChange({
                          activeFilters: {
                            ...viewOptions.activeFilters,
                            dueDate: value as any,
                          },
                        });
                      }
                    }}
                  >
                    {label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {hasActiveFilters && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    onOptionsChange({
                      activeFilters: {
                        priority: [],
                        assignee: [],
                        labels: [],
                        dueDate: "none",
                      },
                    })
                  }
                >
                  Clear all filters
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Display Options */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Eye className="h-4 w-4 " />
              Display
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Show completed</span>
                <Switch
                  checked={viewOptions.showCompletedCards}
                  onCheckedChange={(checked) =>
                    onOptionsChange({ showCompletedCards: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Show card IDs</span>
                <Switch
                  checked={viewOptions.showCardIds}
                  onCheckedChange={(checked) =>
                    onOptionsChange({ showCardIds: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Show empty groups</span>
                <Switch
                  checked={viewOptions.showEmptyGroups}
                  onCheckedChange={(checked) =>
                    onOptionsChange({ showEmptyGroups: checked })
                  }
                />
              </div>
              {currentView === "kanban" && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Show empty columns
                  </span>
                  <Switch
                    checked={viewOptions.showEmptyColumns}
                    onCheckedChange={(checked) =>
                      onOptionsChange({ showEmptyColumns: checked })
                    }
                  />
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* More Options Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenViewOptions}
          className="h-8 w-8 p-0"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BoardViewBar;
