import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";
import { Calendar } from "../../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";

export function DueDatePicker({
  dueDate,
  setDueDate,
}: {
  dueDate: Date | undefined ;
  setDueDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-fit justify-start text-left font-normal text-xs h-8",
            !dueDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon />
          {dueDate ? format(dueDate, "PPP") : <span>Due Date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dueDate}
          onSelect={(date) => date && setDueDate(date)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
