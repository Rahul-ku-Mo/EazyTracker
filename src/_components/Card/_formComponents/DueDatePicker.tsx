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
          type="button"
          variant={"outline"}
          className={cn(
            "w-fit px-2 justify-start text-left font-normal text-xs h-7 rounded-sm",
            !dueDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon />
          {dueDate && format(dueDate, "PPP") }
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-1" align="start" side="bottom">
        <Calendar
          mode="single"
          selected={dueDate}
          onSelect={(date) => date && setDueDate(date)}
          initialFocus
        />
        <Button variant="default" size="sm" className="mx-auto w-full" onClick={() => setDueDate(undefined)}>
          Clear
        </Button>
      </PopoverContent>
    </Popover>  
  );
}
