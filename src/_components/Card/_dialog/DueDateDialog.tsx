import { useState } from "react";
import { addDays } from "date-fns";

import { Button } from "../../../components/ui/button";
import { Calendar } from "../../../components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useCardMutation } from "../_mutations/useCardMutations";

export const DueDateDialog = ({
  cardId,
  isOpen,
  closeDialog,
}: {
  cardId: string;
  isOpen: boolean;
  closeDialog: () => void;
}) => {
  const [tempDate, setTempDate] = useState<Date | undefined>();

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setTempDate(selectedDate);
  };

  const { updateCardMutation } = useCardMutation();

  const handleSave = () => {
    if (tempDate) {
      setTempDate(tempDate);

      updateCardMutation.mutate({
        dueDate: tempDate,
        cardId,
      });
    }
    closeDialog();
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-fit">
        <DialogHeader>
          <DialogTitle>Set due date</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <Select
            onValueChange={(value) =>
              handleDateSelect(addDays(new Date(), parseInt(value)))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Quick select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Today</SelectItem>
              <SelectItem value="1">Tomorrow</SelectItem>
              <SelectItem value="3">In 3 days</SelectItem>
              <SelectItem value="7">In a week</SelectItem>
            </SelectContent>
          </Select>

          <div className="border rounded-md">
            <Calendar
              mode="single"
              selected={tempDate}
              onSelect={handleDateSelect}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeDialog}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
