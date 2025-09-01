import { useEffect, useRef, useState } from "react";
import { Maximize2, X } from "lucide-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

import NewCardActions from "./_newCardComponentsAndActions/new-card-actions";
import { useCardMutation } from "./_mutations/useCardMutations";
import { Badge } from "../../components/ui/badge";
import { NewCardDescriptionEditor } from "./new-card-description-editor";
import { cn } from "@/lib/utils";

interface NewCardFormProps {
  columnName: string;
  isOpen: boolean;
  onClose: () => void;
}

const NewCardForm = ({ columnName, isOpen, onClose }: NewCardFormProps) => {
  const titleRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [priority, setPriority] = useState<string>("none");
  const [labels, setLabels] = useState<any>([]);
  const [assignee, setAssignee] = useState<string | null>(null);
  const [project, setProject] = useState<string | null>(null);  

  const { createCardMutation } = useCardMutation();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => titleRef.current?.focus(), 100);
      // Reset form when dialog opens
      setDescription("");
      setDueDate(undefined);
      setPriority("none");
      setLabels([]);
      setAssignee(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get("title") as string;

    if (!title.trim()) return;

    const cardData = {
      title,
      description,
      dueDate,
      priority,
      labels,
      assigneeIds: assignee ? [assignee] : [],
    };

    createCardMutation.mutate(cardData);
    onClose();
  };

  const [dimensions, setDimensions] = useState<"small" | "large">("small");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "transition-all duration-300 ease-in-out gap-0 p-0 flex flex-col justify-between overflow-hidden dark:bg-[#181818] bg-[#fafafa]",
          dimensions === "small" ? "max-w-[800px]" : "max-w-[900px]"
        )}
        style={{
          maxHeight: dimensions === "small" ? "350px" : "650px",
          height: dimensions === "small" ? "350px" : "650px",
        }}
        isCloseButtonRequired={false}
      >
        <DialogHeader className="flex flex-row items-center justify-between px-4 pt-2">
          <DialogTitle className="sr-only">New Card</DialogTitle>
          <Badge className="text-xs bg-[#f1f1f1] text-[#101010] dark:bg-[#f1f1f1] dark:text-[#101010] shadow-none border transition-all ease-linear border-[#e3e3e3b5] hover:bg-[#e3e3e3] hover:text-[#101010] px-2 py-1 rounded-sm">
            {columnName}
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
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-0.5 flex-1 min-h-0">
          <Input
            ref={titleRef}
            name="title"
            placeholder="What's on your mind?"
            className="px-4 placeholder:font-semibold font-semibold !text-base-large border-0 shadow-none placeholder:text-muted-foreground/60 md:text-base focus-visible:ring-0"
          />
          <NewCardDescriptionEditor
            description={description}
            dimensions={dimensions}
            setDescription={setDescription}
          />
          <NewCardActions
            dueDate={dueDate}
            setDueDate={setDueDate}
            priority={priority}
            setPriority={setPriority}
            labels={labels}
            setLabels={setLabels}
            assignee={assignee}
            setAssignee={setAssignee}
            project={project}
            setProject={setProject}
          />

          <div className="flex items-center justify-end p-2 border-t border-[#e3e3e3b5] dark:border-[#37423d]">
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={createCardMutation.isPending}
                className="h-7 text-xs rounded-sm !bg-emerald-600 text-white font-normal "
              >
                {createCardMutation.isPending ? "Creating..." : "Create Ticket"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewCardForm;
