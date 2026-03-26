"use client";

import { useState, ReactNode } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { useMutation, useQuery } from "@tanstack/react-query";
import { createLabel, fetchWorkspaceLabels } from "@/apis/LabelApis";
import { LabelIcon, LabelStartIcon } from "./svg/SharedIcons";
import { Plus, Check, ArrowLeft } from "lucide-react";

// Predefined colors similar to Linear's color palette
const LABEL_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#ec4899", // pink
  "#f43f5e", // rose
  "#64748b", // slate
  "#6b7280", // gray
];

type ViewState = "list" | "create" | "colorPicker";

export function LabelDropdown({
  children,
  workspaceId,
  action,
  cardId,
}: {
  children: ReactNode;
  workspaceId: string | number;
  action: any;
  cardId?: number;
}) {
  const [open, setOpen] = useState(false);
  const [viewState, setViewState] = useState<ViewState>("list");
  const [newLabelName, setNewLabelName] = useState("");
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0]);
  const [searchValue, setSearchValue] = useState("");

  const { data: labels, refetch } = useQuery({
    queryKey: ["Labels", workspaceId],
    queryFn: async () => fetchWorkspaceLabels(workspaceId),
    enabled: !!workspaceId,
  });

  const createLabelMutation = useMutation({
    mutationFn: async (labelData: { name: string; color: string }) =>
      await createLabel(workspaceId, labelData),
    onSuccess: () => {
      setViewState("list");
      setNewLabelName("");
      setSelectedColor(LABEL_COLORS[0]);
      setSearchValue("");
      refetch()
    },
  });

  const handleCreateLabel = () => {
    if (newLabelName.trim()) {
      createLabelMutation.mutate({
        name: newLabelName.trim(),
        color: selectedColor,
      });
    }
  };

  const resetToList = () => {
    setViewState("list");
    setNewLabelName("");
    setSelectedColor(LABEL_COLORS[0]);
    setSearchValue("");
  };

  const filteredLabels = labels?.filter((label) =>
    label.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const renderListView = () => (
    <>
      <CommandInput
        placeholder="Search labels..."
        autoFocus={true}
        className="h-8 text-xs placeholder:text-xs"
        value={searchValue}
        onValueChange={setSearchValue}
      />
      <CommandList>
        <CommandEmpty className="p-0">
          <div className="p-1.5 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs w-full justify-start rounded-sm px-1.5"
              onClick={() => {
                setNewLabelName(searchValue);
                setViewState("create");
                setViewState("colorPicker");
              }}
            >
              <LabelIcon className="size-3" />
              <span className="text-muted-foreground">Create</span>
              <span className="text-xs">{searchValue}</span>
            </Button>
          </div>
        </CommandEmpty>
        {filteredLabels && filteredLabels.length > 0 && (
          <CommandGroup>
            {filteredLabels?.map((label) => (
              <CommandItem
                key={label.id}
                value={label.name}
                onSelect={() => {
                  if (cardId && action) {
                    action.mutate({
                      cardId,
                      labelId: label.id,
                    });
                  } else {
                    action((prev: any) => [...prev, label]); // action is a setState function
                  }

                  setOpen(false);
                  resetToList();
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs"
              >
                <LabelStartIcon color={label.color} />
                {label.name}
              </CommandItem>
            ))}
            {labels && labels.length > 0 && (
              <CommandItem
                onSelect={() => setViewState("create")}
                className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground"
              >
                <Plus className="h-3 w-3" />
                Create new label
              </CommandItem>
            )}
          </CommandGroup>
        )}
      </CommandList>
    </>
  );

  const renderCreateView = () => (
    <div className="p-1.5">
      <div className="flex items-center gap-2 pb-0.5 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-accent"
          onClick={resetToList}
        >
          <ArrowLeft className="h-3 w-3" />
        </Button>
        <span className="text-xs font-medium text-muted-foreground">
          New Label :
        </span>
        <span className="text-xs">{newLabelName}</span>
      </div>

      <div className="py-1.5">
        <button
          className="flex items-center gap-2 h-7 px-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-xs text-muted-foreground w-full justify-start"
          onClick={() => setViewState("colorPicker")}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: selectedColor }}
          />
          Change color
        </button>
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          className="h-7 text-xs flex-1"
          onClick={handleCreateLabel}
          disabled={!newLabelName.trim() || createLabelMutation.isPending}
        >
          {createLabelMutation.isPending ? "Creating..." : "Create label"}
        </Button>
      </div>
    </div>
  );

  const renderColorPicker = () => (
    <div className="p-1.5 space-y-2">
      <div className="flex items-center gap-2 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-accent"
          onClick={() => setViewState("create")}
        >
          <ArrowLeft className="h-3 w-3" />
        </Button>
        <span className="text-xs font-medium">Label Color</span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {LABEL_COLORS.map((color) => (
          <button
            key={color}
            className="w-6 h-6 rounded-full relative hover:scale-110 transition-transform border border-border/20"
            style={{ backgroundColor: color }}
            onClick={() => {
              setSelectedColor(color);
              setViewState("create");
            }}
          >
            {selectedColor === color && (
              <div className="absolute inset-0 rounded-full border-2 border-white shadow-sm">
                <Check className="h-3 w-3 text-white absolute inset-0 m-auto drop-shadow-sm" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (viewState) {
      case "create":
        return renderCreateView();
      case "colorPicker":
        return renderColorPicker();
      default:
        return renderListView();
    }
  };

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          resetToList();
        }
      }}
    >
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-0">
        {viewState === "list" ? (
          <Command>{renderContent()}</Command>
        ) : (
          renderContent()
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
