import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProjectForm from "./project-form";
import { createProject, CreateProjectInput } from "@/apis/project";
import { useToast } from "@/hooks/use-toast";

interface NewProjectDialogProps {
  teamId: string;
}

export function NewProjectDialog({ teamId }: NewProjectDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: (data: CreateProjectInput) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsDialogOpen(false);
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

  const handleCreateProject = async (data: CreateProjectInput) => {
    console.log("Creating project with data:", data);
    console.log("Current teamId from API:", teamId);
    console.log("Data teamId:", data.teamId);
    await createProjectMutation.mutateAsync(data);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus />
          <span className="hidden lg:inline">Add Project</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a new project and assign it to boards
          </DialogDescription>
        </DialogHeader>
        <ProjectForm onSubmit={handleCreateProject} />
      </DialogContent>
    </Dialog>
  );
} 