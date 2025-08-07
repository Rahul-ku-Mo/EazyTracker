import * as React from "react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "../../../components/ui/dropdown-menu";
import { DateUpdatedIcon } from "@/_components/shared/svg/ViewOptionsIcons";

export function DueDatePickerDropdown({
  dueDate,
  setDueDate,
}: {
  dueDate: Date | undefined;
  setDueDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "w-fit px-2 h-7 text-xs rounded-sm dark:bg-black dark:border-[#1b1d1c] font-normal flex items-center gap-1 border"
          )}
        >
          <DateUpdatedIcon className="size-4" />
          {dueDate ? format(dueDate, "PPP") : "Due Date"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-1 w-auto">
        <Calendar
          mode="single"
          selected={dueDate}
          onSelect={(date) => date && setDueDate(date)}
          initialFocus
        />
        <Button
          variant="default"
          size="sm"
          className="mx-auto w-full mt-1"
          onClick={() => setDueDate(undefined)}
        >
          Clear
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
