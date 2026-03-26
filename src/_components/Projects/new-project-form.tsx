import { useEffect, useRef, useState } from "react";
import { Maximize2, X } from "lucide-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogDescription,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";

import { Badge } from "../../components/ui/badge";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProject,
  CreateProjectInput,
  MilestoneItem,
} from "@/apis/project";

import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import NewProjectActions from "./new-project-action";
import { NewProjectDescriptionEditor } from "./new-project-description-editor";
import EnhancedMilestone from "./actions/enhanced-milestone";

interface NewProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
}

export const NewProjectForm = ({ isOpen, onClose, teamId }: NewProjectFormProps) => {
  const titleRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState<string>("");
  const [targetDate, setTargetDate] = useState<Date | undefined>();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [priority, setPriority] = useState<string>("none");
  const [status, setStatus] = useState<string>("not_started");
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [lead, setLead] = useState<string | null>(null);
  const [members, setMembers] = useState<string[]>([]);
  const [dimensions, setDimensions] = useState<"small" | "large">("small");
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: (data: CreateProjectInput) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", teamId] });
      onClose();
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => titleRef.current?.focus(), 100);
      // Reset form when dialog opens
      setDescription("");
      setTargetDate(undefined);
      setStartDate(undefined);
      setPriority("none");
      setStatus("not_started");
      setMilestones([]);
      setLead(null);
      setMembers([]);
      setDimensions("small");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get("title") as string;

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Project title is required",
        variant: "destructive",
      });
      return;
    }

    const projectData: CreateProjectInput = {
      title: title.trim(),
      description,
      targetDate,
      startDate,
      priority,
      status,
      milestones: milestones,
      leadId: lead || undefined,
      members: members,
      teamId,
    };

    await createProjectMutation.mutateAsync(projectData);
  };

  const handleClose = () => {
    onClose();

    setDimensions("small");
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setShowConfirmClose(true);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent
          className={cn(
            "transition-all duration-300 ease-in-out gap-0 p-0 flex flex-col justify-between overflow-hidden",
            dimensions === "small" ? "max-w-[700px]" : "max-w-[800px]"
          )}
          style={{
            maxHeight: dimensions === "small" ? "700px" : "800px",
            height: dimensions === "small" ? "700px" : "800px",
          }}
          isCloseButtonRequired={false}
        >
          <DialogHeader className="flex flex-row items-center justify-between px-4 pb-2 pt-4 !space-y-0">
            <DialogTitle className="sr-only">New Project</DialogTitle>
            <DialogDescription className="sr-only">
              Create a new project to organize your work and collaborate with
              your team.
            </DialogDescription>
            <Badge className="text-xs bg-[#f1f1f1] text-[#101010] dark:bg-[#f1f1f1] dark:text-[#101010] shadow-none border transition-all ease-linear border-[#e3e3e3b5] hover:bg-[#e3e3e3] hover:text-[#101010] px-2 py-1 rounded-sm">
              New Project
            </Badge>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setDimensions(dimensions === "small" ? "large" : "small");
                }}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowConfirmClose(true)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-0.5 flex-1 min-h-0"
          >
            <input
              ref={titleRef}
              name="title"
              placeholder="Project name"
              className="px-4 placeholder:font-semibold font-semibold text-lg bg-transparent border-0 outline-none focus:outline-none py-0.5"
            />
            <NewProjectDescriptionEditor
              description={description}
              dimensions={dimensions}
              setDescription={setDescription}
            />
            <EnhancedMilestone
              externalMilestones={milestones}
              onMilestonesChange={setMilestones}
              fwdClassname="px-4 py-0.5 min-h-[284px]"
            />
            <NewProjectActions
              targetDate={targetDate}
              setTargetDate={setTargetDate}
              startDate={startDate}
              setStartDate={setStartDate}
              priority={priority}
              setPriority={setPriority}
              status={status}
              setStatus={setStatus}
             
            />

            <div className="flex items-center justify-end p-4 border-t border-border shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  disabled={createProjectMutation.isPending}
                  className="h-7 text-xs rounded-sm"
                >
                  {createProjectMutation.isPending
                    ? "Creating..."
                    : "Create Project"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Keep Changes</AlertDialogAction>
            <AlertDialogCancel
              onClick={() => {
                setShowConfirmClose(false);
                handleClose();
              }}
            >
              Discard Changes
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

