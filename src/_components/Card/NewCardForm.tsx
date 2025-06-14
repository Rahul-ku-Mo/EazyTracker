import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

import NewCardActions from "./_formComponents/NewCardActions";
import { useCardMutation } from "./_mutations/useCardMutations";

import { NewCardDescriptionEditor } from "./NewCardDescriptionEditor";

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
  const [labels, setLabels] = useState<string[]>([]);
  const [assignee, setAssignee] = useState<string | null>(null);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[700px] gap-0"
        isCloseButtonRequired={false}
      >
        <DialogHeader className="flex-row items-center justify-between space-y-0">
          <DialogTitle className="sr-only">New Issue</DialogTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground">{columnName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            ref={titleRef}
            name="title"
            placeholder="What's on your mind?"
            className="px-0 text-base border-0 shadow-none placeholder:text-muted-foreground/60 md:text-base focus-visible:ring-0"
          />
          <NewCardDescriptionEditor
            description={description}
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
          />

          <div className="flex items-center justify-end pt-4">
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={createCardMutation.isPending}
                className="h-8 text-xs"
              >
                {createCardMutation.isPending ? "Creating..." : "Create card"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewCardForm;
