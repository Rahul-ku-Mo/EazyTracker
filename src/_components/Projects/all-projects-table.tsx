"use client";

import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  MoreVertical,
  GripVertical,
  Columns,
  Clock,
  Building,
  AlertTriangle,
  Minus,
  Check,
} from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewProjectDialog } from "./NewProjectDialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

export interface ProjectTableRow {
  id: string;
  slug: string;
  title: string;
  status: string;
  priority: string;
  lead: { id: string; name: string; imageUrl?: string } | null;
  members: { id: string; name: string; imageUrl?: string }[];
  targetDate?: string;
  teams: string[];
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}

// DatePicker component for inline editing
function DatePicker({ 
  value, 
  onChange, 
  placeholder = "Pick a date" 
}: { 
  value?: string; 
  onChange: (date: string) => void; 
  placeholder?: string;
}) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  React.useEffect(() => {
    setDate(value ? new Date(value) : undefined);
  }, [value]);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      onChange(selectedDate.toISOString().split('T')[0]);
    } else {
      onChange('');
    }
  };

  const handleClear = () => {
    setDate(undefined);
    onChange('');
  };

  const isOverdue = date && date < new Date();
  const isToday = date && date.toDateString() === new Date().toDateString();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={`hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-32 border-transparent bg-transparent text-right shadow-none focus-visible:border dark:bg-transparent justify-start font-normal text-xs ${
            isOverdue ? 'text-red-500 dark:text-red-400' : ''
          }`}
        >
          <div className={cn("flex items-center gap-1 w-full", (!isOverdue || !date) && "justify-center")}>
            {isOverdue && (
              <AlertTriangle className="h-3 w-3 text-red-500 dark:text-red-400" />
            )}
            {date ? (
              <span className="truncate">
                {isToday ? 'Today' : date.toLocaleDateString()}
              </span>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground truncate">{placeholder}</span>
              </div>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="p-3 border-b">
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

// Lead Command Dropdown Component
function LeadCommandDropdown({ 
  currentLead, 
  onLeadChange, 
  teamId 
}: { 
  currentLead: { id: string; name: string; imageUrl?: string } | null; 
  onLeadChange: (leadId: string | null) => void; 
  teamId: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  // Fetch team members
  const { data: teamData } = useQuery({
    queryKey: ["team-members", teamId],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/teams/${teamId}/members`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      );
      return response.data.data;
    },
    enabled: !!teamId && !!Cookies.get("accessToken"),
  });

  const teamMembers: TeamMember[] = teamData?.members || [];
  const currentLeadMember = currentLead ? teamMembers.find(member => member.id === currentLead.id) : null;

  const handleLeadSelect = (memberId: string) => {
    if (currentLead?.id === memberId) {
      onLeadChange(null);
    } else {
      onLeadChange(memberId);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-full justify-start px-2 text-left font-normal"
        >
          {currentLeadMember ? (
            <div className="flex items-center gap-2 w-full">
              <Avatar className="h-5 w-5">
                <AvatarImage src={currentLeadMember.imageUrl} />
                <AvatarFallback className="text-xs">
                  {currentLeadMember.name?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-xs">{currentLeadMember.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                <Minus className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          )}
          <ChevronDown className="ml-auto h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search members..." 
            value={searchValue}
            onValueChange={setSearchValue}
            className="h-8 text-xs"
          />
          <CommandList className="max-h-48">
            <CommandEmpty>No members found.</CommandEmpty>
            <CommandGroup>
              {teamMembers
                .filter(member => 
                  member.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                  member.email.toLowerCase().includes(searchValue.toLowerCase())
                )
                .map((member) => {
                  const isSelected = currentLead?.id === member.id;
                  return (
                    <CommandItem
                      key={member.id}
                      value={member.id}
                      onSelect={() => handleLeadSelect(member.id)}
                      className="text-xs"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={member.imageUrl} />
                          <AvatarFallback className="text-xs">
                            {member.name?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">
                            {member.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {member.email}
                          </div>
                        </div>
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
  );
}

// Members Command Dropdown Component
function MembersCommandDropdown({ 
  currentMembers, 
  onMembersChange, 
  teamId 
}: { 
  currentMembers: { id: string; name: string; imageUrl?: string }[]; 
  onMembersChange: (members: { id: string; name: string; imageUrl?: string }[]) => void; 
  teamId: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  // Fetch team members
  const { data: teamData } = useQuery({
    queryKey: ["team-members", teamId],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/teams/${teamId}/members`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      );
      return response.data.data;
    },
    enabled: !!teamId && !!Cookies.get("accessToken"),
  });

  const teamMembers: TeamMember[] = teamData?.members || [];

  const handleMemberSelect = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;

    const isSelected = currentMembers.some(m => m.id === member.id);
    
    if (isSelected) {
      onMembersChange(currentMembers.filter(m => m.id !== member.id));
    } else {
      onMembersChange([...currentMembers, { id: member.id, name: member.name, imageUrl: member.imageUrl }]);
    }
  };

  const isSelected = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    return member ? currentMembers.some(m => m.id === member.id) : false;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-full justify-start px-2 text-left font-normal"
        >
          {currentMembers.length > 0 ? (
            <div className="flex items-center gap-1 w-full">
              <div className="flex -space-x-1">
                {currentMembers.slice(0, 3).map((member, index) => (
                  <Avatar key={index} className="h-5 w-5 border-2 border-background">
                    <AvatarImage src={member.imageUrl} />
                    <AvatarFallback className="text-xs">
                      {member.name?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {currentMembers.length > 3 && (
                  <div className="h-5 w-5 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                    +{currentMembers.length - 3}
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground ml-1">
                {currentMembers.length} member{currentMembers.length !== 1 ? 's' : ''}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                <Minus className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          )}
          <ChevronDown className="ml-auto h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search members..." 
            value={searchValue}
            onValueChange={setSearchValue}
            className="h-8 text-xs"
          />
          <CommandList className="max-h-48">
            <CommandEmpty>No members found.</CommandEmpty>
            <CommandGroup>
              {teamMembers
                .filter(member => 
                  member.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                  member.email.toLowerCase().includes(searchValue.toLowerCase())
                )
                .map((member) => {
                  const selected = isSelected(member.id);
                  return (
                    <CommandItem
                      key={member.id}
                      value={member.id}
                      onSelect={() => handleMemberSelect(member.id)}
                      className="text-xs"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={member.imageUrl} />
                          <AvatarFallback className="text-xs">
                            {member.name?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">
                            {member.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {member.email}
                          </div>
                        </div>
                        {selected && <Check className="w-3 h-3 text-primary" />}
                      </div>
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function ProjectsTable({ data, teamId }: { data: ProjectTableRow[]; teamId: string }) {
  return <DataTable data={data} teamId={teamId} />;
}

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <GripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}



function DraggableRow({ row }: { row: Row<ProjectTableRow> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable({ 
  data: initialData, 
  teamId 
}: { 
  data: ProjectTableRow[];
  teamId: string;
}) {
  // Create columns with the correct teamId
  const columnsWithTeamId: ColumnDef<ProjectTableRow>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },

    {
      accessorKey: "title",
      header: "Project",
      cell: ({ row }) => {
        return <TableCellViewer item={row.original} />;
      },
      enableHiding: false,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.status === "Completed" ? (
            <CheckCircle className="fill-green-500 dark:fill-green-400" />
          ) : null}
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.priority}
        </Badge>
      ),
    },
    {
      accessorKey: "lead",
      header: "Lead",
      cell: ({ row }) => (
        <LeadCommandDropdown
          currentLead={row.original.lead}
          onLeadChange={(leadId) => {
            console.log(`Setting lead for ${row.original.title}:`, leadId);
            toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
              loading: `Updating lead for ${row.original.title}`,
              success: "Lead updated successfully",
              error: "Failed to update lead",
            });
          }}
          teamId={teamId}
        />
      ),
    },
    {
      accessorKey: "members",
      header: "Members",
      cell: ({ row }) => (
        <MembersCommandDropdown
          currentMembers={row.original.members}
          onMembersChange={(members) => {
            console.log(`Setting members for ${row.original.title}:`, members);
            toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
              loading: `Updating members for ${row.original.title}`,
              success: "Members updated successfully",
              error: "Failed to update members",
            });
          }}
          teamId={teamId}
        />
      ),
    },
    {
      accessorKey: "targetDate",
      header: () => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Target Date</span>
        </div>
      ),
      cell: ({ row }) => (
        <DatePicker
          value={row.original.targetDate}
          onChange={(date) => {
            console.log(`Setting target date for ${row.original.title}:`, date);
            toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
              loading: `Saving ${row.original.title}`,
              success: "Done",
              error: "Error",
            });
          }}
          placeholder="Set date"
        />
      ),
    },
    {
      accessorKey: "teams",
      header: () => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          <span>Teams</span>
        </div>
      ),
      cell: ({ row }) => {
        const teams = row.original.teams;
        if (teams.length === 0) {
          return (
            <Select>
              <SelectTrigger className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate">
                <SelectValue placeholder="Assign team" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
              </SelectContent>
            </Select>
          );
        }

        return <span className="text-sm">{teams.join(", ")}</span>;
      },
    },
    {
      id: "actions",
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <MoreVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Make a copy</DropdownMenuItem>
            <DropdownMenuItem>Favorite</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
  const [data, setData] = React.useState(() => initialData);
  const [searchValue, setSearchValue] = React.useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = React.useState("");
  const [rowSelection, setRowSelection] = React.useState({});

  // Simple debounce effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  );

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!debouncedSearchValue) return data;
    
    return data.filter((item) =>
      item.title.toLowerCase().includes(debouncedSearchValue.toLowerCase()) ||
      (item.lead?.name || '').toLowerCase().includes(debouncedSearchValue.toLowerCase()) ||
      item.status.toLowerCase().includes(debouncedSearchValue.toLowerCase()) ||
      item.priority.toLowerCase().includes(debouncedSearchValue.toLowerCase()) ||
      item.teams.some(team => team.toLowerCase().includes(debouncedSearchValue.toLowerCase()))
    );
  }, [data, debouncedSearchValue]);

  const table = useReactTable({
    data: filteredData,
    columns: columnsWithTeamId,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: false, // Disable bulk selection
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  return (
    <>
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="search" className="sr-only">
          View
        </Label>
        <Input
          type="text"
          id="search"
          placeholder="Search projects..."
          className="w-full mr-2 h-8"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <NewProjectDialog teamId={teamId} />
        </div>
      </div>
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columnsWithTeamId.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredRowModel().rows.length} project(s) found.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function TableCellViewer({ item }: { item: ProjectTableRow }) {
  const navigate = useNavigate();

  return (
    <Button 
      variant="link" 
      className="text-foreground w-fit px-0 text-left hover:underline"
      onClick={() => navigate(`/projects/${item.slug}`)}
    >
      {item.title}
    </Button>
  );
}
