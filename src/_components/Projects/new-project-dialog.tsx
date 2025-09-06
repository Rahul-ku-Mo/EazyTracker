import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewProjectForm from "./new-project-form";

interface NewProjectDialogProps {
  teamId: string;
}

export function NewProjectDialog({ teamId }: NewProjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        <Plus />
        <span className="hidden lg:inline">Add Project</span>
      </Button>
      <NewProjectForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        teamId={teamId}
      />
    </>
  );
} 