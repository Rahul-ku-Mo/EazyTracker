import { useState } from "react";
import {
  X,
  ChevronDown,
  Calendar,
  User,
  Settings2 ,
  Settings,
  Grid3x3,
  Columns3,
  Tag,
  Link,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Priority } from "../shared/svg/Priority";
import {
  BoardViewIcon,
  CardIdIcon,
  DueDateIcon,
  CompletedCardIcon,
  DisplayIcon,
  GroupingIcon,
  ListViewIcon,
  DateCreatedIcon,
  DateUpdatedIcon,
  EstimateIcon,
  ViewIcon,
} from "../shared/svg/ViewOptionsIcons";
import { MilestoneIcon } from "../shared/svg/SharedIcons";

interface ViewOptionsProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: "kanban" | "listview";
  onViewChange: (view: "kanban" | "listview") => void;
  viewOptions: ViewOptions;
  onOptionsChange: any;
}

export interface ViewOptions {
  // Grouping
  groupBy: "column" | "priority" | "assignee" | "dueDate" | "none";
  subGroupBy: "none" | "priority" | "assignee";
  orderBy: "manual" | "created" | "updated" | "priority" | "dueDate" | "title";
  orderDirection: "asc" | "desc";

  // Visibility
  showCompletedCards: boolean;
  showEmptyGroups: boolean;
  showEmptyColumns: boolean;
  showCardIds: boolean;

  // Date Format
  dateFormat: "readable" | "calendar";

  // Display Properties
  displayProperties: {
    priority: boolean;
    assignee: boolean;
    dueDate: boolean;
    labels: boolean;
    attachments: boolean;
    createdDate: boolean;
    updatedDate: boolean;
    milestone: boolean;
    estimate: boolean;
  };

  // Filters
  activeFilters: {
    priority: string[];
    assignee: string[];
    labels: string[];
    dueDate: "overdue" | "today" | "thisWeek" | "thisMonth" | "none";
  };
}

const ViewOptionsPanel = ({
  isOpen,
  onClose,
  currentView,
  onViewChange,
  viewOptions,
  onOptionsChange,
}: ViewOptionsProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "view",
    "grouping",
    "display",
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handlePropertyToggle = (
    property: keyof ViewOptions["displayProperties"]
  ) => {
    console.log(
      "Toggling property:",
      property,
      "from",
      viewOptions.displayProperties[property],
      "to",
      !viewOptions.displayProperties[property]
    );
    onOptionsChange({
      displayProperties: {
        ...viewOptions.displayProperties,
        [property]: !viewOptions.displayProperties[property],
      },
    });
  };

  const SectionHeader = ({
    title,
    icon: Icon,
    sectionKey,
  }: {
    title: string;
    icon: any;
    sectionKey: string;
  }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="flex items-center justify-between w-full px-4 py-3 h-10 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border-b border-zinc-100 dark:border-zinc-800"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100 !text-[13px] !eading-4">
          {title}
        </span>
      </div>
      <ChevronDown
        className={cn(
          "h-4 w-4 text-zinc-400 dark:text-zinc-500 transition-transform duration-200",
          expandedSections.includes(sectionKey) && "rotate-180"
        )}
      />
    </button>
  );

  const PropertyItem = ({
    label,
    icon: Icon,
    property,
  }: {
    label: string;
    icon: any;
    property: keyof ViewOptions["displayProperties"];
  }) => {
    const isActive = viewOptions.displayProperties[property];
    const isDueDate = property === "dueDate";

    return (
      <button
        onClick={() => handlePropertyToggle(property)}
        className={cn(
          "flex flex-col items-center gap-1.5 p-3 rounded-md border transition-all duration-200 text-xs",
          "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
          isActive
            ? isDueDate
              ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
              : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4",
            isActive
              ? isDueDate
                ? "text-red-600 dark:text-red-400"
                : "text-emerald-600 dark:text-emerald-400"
              : "text-zinc-400 dark:text-zinc-500"
          )}
        />
        <span className="text-center font-medium">{label}</span>
      </button>
    );
  };

  const OptionsItem = ({
    label,
    icon: Icon,
    isActive,
    onClick,
  }: {
    label: string;
    icon: any;
    isActive: boolean;
    onClick: () => void;
  }) => {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex flex-col items-center gap-1.5 p-3 rounded-md border transition-all duration-200 text-xs",
          "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
          isActive
            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4",
            isActive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-zinc-400 dark:text-zinc-500"
          )}
        />
        <span className="text-center font-medium">{label}</span>
      </button>
    );
  };

  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 z-50 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 h-12">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <h2 className="font-semibold">View Options</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div>
              {/* View Toggle */}
              <SectionHeader title="View" icon={ViewIcon} sectionKey="view" />
              {expandedSections.includes("view") && (
                <div className="px-4 py-3 bg-zinc-50/50 dark:bg-zinc-800/30">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={
                        currentView === "listview" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => onViewChange("listview")}
                      className="flex items-center gap-2 text-xs"
                    >
                      <ListViewIcon />
                      List
                    </Button>
                    <Button
                      variant={currentView === "kanban" ? "default" : "outline"}
                      size="sm"
                      onClick={() => onViewChange("kanban")}
                      className="flex items-center gap-2 text-xs"
                    >
                      <BoardViewIcon />
                      Board
                    </Button>
                  </div>
                </div>
              )}

              {/* Grouping */}
              <SectionHeader
                title="Grouping"
                icon={GroupingIcon}
                sectionKey="grouping"
              />
              {expandedSections.includes("grouping") && (
                <div className="px-4 py-3 space-y-4 bg-zinc-50/50 dark:bg-zinc-800/30">
                  <div>
                    <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 block">
                      Group by
                    </label>
                    <Select
                      value={viewOptions.groupBy}
                      onValueChange={(value: any) =>
                        onOptionsChange({ groupBy: value })
                      }
                    >
                      <SelectTrigger className="w-full h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="column">Column</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="assignee">Assignee</SelectItem>
                        <SelectItem value="dueDate">Due Date</SelectItem>
                        <SelectItem value="none">No grouping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 block">
                      Order by
                    </label>
                    <Select
                      value={viewOptions.orderBy}
                      onValueChange={(value: any) =>
                        onOptionsChange({ orderBy: value })
                      }
                    >
                      <SelectTrigger className="w-full h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="created">Created</SelectItem>
                        <SelectItem value="updated">Updated</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="dueDate">Due Date</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Options */}
              <SectionHeader
                title="Options"
                icon={Settings2}
                sectionKey="options"
              />
              {expandedSections.includes("options") && (
                <div className="px-4 py-3 bg-zinc-50/50 dark:bg-zinc-800/30">
                  <div className="grid grid-cols-2 gap-2">
                    <OptionsItem
                      label="Completed Cards"
                      icon={CompletedCardIcon}
                      isActive={viewOptions.showCompletedCards}
                      onClick={() =>
                        onOptionsChange({
                          showCompletedCards: !viewOptions.showCompletedCards,
                        })
                      }
                    />

                    <OptionsItem
                      label="Empty Groups"
                      icon={Columns3}
                      isActive={viewOptions.showEmptyGroups}
                      onClick={() =>
                        onOptionsChange({
                          showEmptyGroups: !viewOptions.showEmptyGroups,
                        })
                      }
                    />

                    {currentView === "kanban" && (
                      <OptionsItem
                        label="Empty Columns"
                        icon={Grid3x3}
                        isActive={viewOptions.showEmptyColumns}
                        onClick={() =>
                          onOptionsChange({
                            showEmptyColumns: !viewOptions.showEmptyColumns,
                          })
                        }
                      />
                    )}

                    <OptionsItem
                      label="Card IDs"
                      icon={CardIdIcon}
                      isActive={viewOptions.showCardIds}
                      onClick={() =>
                        onOptionsChange({
                          showCardIds: !viewOptions.showCardIds,
                        })
                      }
                    />

                    <OptionsItem
                      label="Readable Dates"
                      icon={Calendar}
                      isActive={viewOptions.dateFormat === "readable"}
                      onClick={() =>
                        onOptionsChange({
                          dateFormat:
                            viewOptions.dateFormat === "readable"
                              ? "calendar"
                              : "readable",
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Display Properties */}
              <SectionHeader
                title="Display Properties"
                icon={DisplayIcon}
                sectionKey="display"
              />
              {expandedSections.includes("display") && (
                <div className="px-4 py-3 bg-zinc-50/50 dark:bg-zinc-800/30">
                  <div className="grid grid-cols-3 gap-2">
                    <PropertyItem
                      label="Priority"
                      icon={Priority}
                      property="priority"
                    />
                    <PropertyItem
                      label="Assignee"
                      icon={User}
                      property="assignee"
                    />
                    <PropertyItem
                      label="Due Date"
                      icon={DueDateIcon}
                      property="dueDate"
                    />
                    <PropertyItem label="Labels" icon={Tag} property="labels" />
                    <PropertyItem
                      label="Attachments"
                      icon={Link}
                      property="attachments"
                    />
                    <PropertyItem
                      label="Created"
                      icon={DateCreatedIcon}
                      property="createdDate"
                    />
                    <PropertyItem
                      label="Updated"
                      icon={DateUpdatedIcon}
                      property="updatedDate"
                    />
                    <PropertyItem
                      label="Milestone"
                      icon={MilestoneIcon}
                      property="milestone"
                    />
                    <PropertyItem
                      label="Estimate"
                      icon={EstimateIcon}
                      property="estimate"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ViewOptionsPanel;
