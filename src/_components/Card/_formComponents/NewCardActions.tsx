import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../../components/ui/select";
import { Users, Tags, ChevronDown } from "lucide-react";
import { cn } from "../../../lib/utils";
import { DueDatePicker } from "./DueDatePicker";

type TNewCardActionsProps = {
  dueDate: Date | undefined;
  setDueDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
};

const NewCardActions = ({ dueDate, setDueDate }: TNewCardActionsProps) => {
  return (
    <div className="flex gap-2">
      <Select name="priority">
        <SelectTrigger
          className={cn(
            "w-[120px] h-8 text-xs",
            "opacity-60 hover:opacity-100 transition-opacity",
            "focus:opacity-100",
            "data-[state=open]:opacity-100"
          )}
        >
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="urgent" className="text-xs">
            🔴 Urgent
          </SelectItem>
          <SelectItem value="high" className="text-xs">
            🟡 High
          </SelectItem>
          <SelectItem value="medium" className="text-xs">
            🟢 Medium
          </SelectItem>
          <SelectItem value="low" className="text-xs">
            ⚪ Low
          </SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        className={cn(
          "h-8 text-xs",
          "opacity-60 hover:opacity-100 transition-opacity",
          "focus-visible:opacity-100"
        )}
      >
        <Users className="w-4 h-4 mr-2" />
        Assignee
        <ChevronDown className="w-4 h-4 ml-2" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        className={cn(
          "h-8 text-xs",
          "opacity-60 hover:opacity-100 transition-opacity",
          "focus-visible:opacity-100"
        )}
      >
        <Tags className="w-4 h-4 mr-2" />
        Labels
        <ChevronDown className="w-4 h-4 ml-2" />
      </Button>

      <DueDatePicker dueDate={dueDate} setDueDate={setDueDate} />
    </div>
  );
};

export default NewCardActions;
