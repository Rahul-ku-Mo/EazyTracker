import { useState } from "react";

import { Button } from "@/components/ui/button";
import NewProjectForm from "./new-project-form";

interface NewProjectDialogProps {
  teamId: string;
}

export function NewProjectDialog({ teamId }: NewProjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="default" size="sm" onClick={() => setIsOpen(true)}>
        <span className="hidden lg:inline">New Project</span>
      </Button>
      <NewProjectForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        teamId={teamId}
      />
    </>
  );
}
