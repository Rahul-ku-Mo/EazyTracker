import { useState } from "react";
import { Check } from "lucide-react";
import clsx from "clsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkspace } from "@/apis/WorkspaceApis";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const WORKSPACE_COLORS = [
  { id: "workspace-blue", color: "#3B82F6", name: "Ocean Blue", lightColor: "#60A5FA" },
  { id: "workspace-emerald", color: "#10B981", name: "Emerald", lightColor: "#34D399" },
  { id: "workspace-purple", color: "#8B5CF6", name: "Royal Purple", lightColor: "#A78BFA" },
  { id: "workspace-pink", color: "#EC4899", name: "Rose Pink", lightColor: "#F472B6" },
  { id: "workspace-orange", color: "#F59E0B", name: "Sunset Orange", lightColor: "#FBBF24" },
  { id: "workspace-red", color: "#EF4444", name: "Cherry Red", lightColor: "#F87171" },
  { id: "workspace-teal", color: "#14B8A6", name: "Teal", lightColor: "#2DD4BF" },
  { id: "workspace-indigo", color: "#6366F1", name: "Indigo", lightColor: "#818CF8" },
  { id: "workspace-slate", color: "#64748B", name: "Slate Gray", lightColor: "#94A3B8" },
];

interface NewWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectSlug: string;
}

export function NewWorkspaceDialog({
  isOpen,
  onClose,
  projectSlug,
}: NewWorkspaceDialogProps) {
  const [title, setTitle] = useState("");
  const [selectedColorId, setSelectedColorId] = useState<string | null>(WORKSPACE_COLORS[0]?.id ?? null);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async () => {
      const color = WORKSPACE_COLORS.find((c) => c.id === selectedColorId);
      if (!color) throw new Error("Please select a color");
      return createWorkspace(
        {
          title: title.trim(),
          colorId: color.id,
          colorValue: color.color,
          colorName: color.name,
        },
        projectSlug
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectSlug] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Workspace created successfully");
      setTitle("");
      setSelectedColorId(WORKSPACE_COLORS[0]?.id ?? null);
      onClose();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create workspace");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      toast.error("Please enter a workspace name");
      return;
    }
    if (trimmed.length < 2) {
      toast.error("Workspace name must be at least 2 characters");
      return;
    }
    if (!selectedColorId) {
      toast.error("Please select a color");
      return;
    }
    createMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Workspace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-title">Name</Label>
            <Input
              id="workspace-title"
              placeholder="Enter workspace name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={50}
              disabled={createMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">{title.length}/50</p>
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-3 gap-2">
              {WORKSPACE_COLORS.map((colorOption) => (
                <button
                  key={colorOption.id}
                  type="button"
                  className={clsx(
                    "relative h-12 rounded-lg border transition-all",
                    selectedColorId === colorOption.id &&
                      "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                  style={{
                    background: `linear-gradient(135deg, ${colorOption.color} 0%, ${colorOption.lightColor} 100%)`,
                  }}
                  onClick={() => setSelectedColorId(colorOption.id)}
                  disabled={createMutation.isPending}
                >
                  {selectedColorId === colorOption.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={createMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !title.trim() || !selectedColorId}>
              {createMutation.isPending ? "Creating..." : "Create Workspace"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
