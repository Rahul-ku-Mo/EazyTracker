import { ReactNode, useState } from "react";
import { MoreHorizontal, Calendar, X } from "lucide-react";

import { useCardMutation } from "../../../_mutations/useCardMutations";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DueDateDropdownProps {
  children: ReactNode;
  cardId: number;
  currentDueDate?: Date | null;
}

export const DueDateDropdown = ({
  children,
  cardId,
  currentDueDate,
}: DueDateDropdownProps) => {
  const [open, setOpen] = useState(false);
  const { updateCardMutation } = useCardMutation();

  const handleSetDueDate = (date: Date) => {
    updateCardMutation.mutate({
      cardId,
      dueDate: date,
    });
    setOpen(false);
  };

  const handleRemoveDueDate = () => {
    updateCardMutation.mutate({
      cardId,
      dueDate: null,
    });
    setOpen(false);
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const getEndOfWeekDate = () => {
    const today = new Date();
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay())); // Sunday
    return endOfWeek;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <MoreHorizontal className="size-4 cursor-pointer" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[220px]">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Calendar className="size-4" />
            Set due date
          </DropdownMenuLabel>

          {currentDueDate && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1 text-sm text-muted-foreground">
                Current: {formatDate(new Date(currentDueDate))}
              </div>
              <DropdownMenuItem
                onClick={handleRemoveDueDate}
                className="text-red-600 focus:text-red-600"
              >
                <X className="size-4 mr-2" />
                Remove due date
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => handleSetDueDate(getTomorrowDate())}
              disabled={updateCardMutation.isPending}
            >
              Tomorrow
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSetDueDate(getEndOfWeekDate())}
              disabled={updateCardMutation.isPending}
            >
              End of this week
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Custom due date</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="mx-2 p-0">
                {children}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
