import { useState } from "react";
import { Button } from "@/components/ui/button";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { MemberIcon } from "@/_components/shared/svg/SharedIcons";
import { useCardMutation } from "../../../_mutations/useCardMutations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useNewCardMutation } from "@/_components/Card/_newCardComponentsAndActions/new-card-mutations";

// Types
interface TeamMember {
  id: string;
  name: string;
  email: string;
  username?: string;
  imageUrl?: string;
}

interface AssigneesDropdownProps {
  cardId: number;
  assignees: TeamMember[];
}



export const AssigneesDropdown = ({
  cardId,
  assignees,
}: AssigneesDropdownProps) => {

  const { updateCardMutation } = useCardMutation();
  
  const { teamData } = useNewCardMutation()

  const teamMembers = teamData?.members || [];

  // Find assigned members - use assignees array if available
  const assignedMembers = assignees || [];

  const handleAssignMember = (memberId: string) => {
    updateCardMutation.mutate({
      cardId,
      assigneeId: memberId,
    });
  };

  const handleUnassign = (memberId?: string) => {
    console.log("Unassigning member:", memberId, "from card:", cardId);
    if (memberId) {
      updateCardMutation.mutate({
        cardId,
        assigneeId: null,
      });
    } 
  };

  return (
    <div className="space-y-3 rounded-md p-2 dark:bg-[#101010]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MemberIcon strokeWidth={3} className="size-4 text-primary" />
          <span className="text-xs font-medium text-primary">Assignee</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs rounded-sm dark:bg-black dark:border-[#1b1d1c]  font-normal flex items-center"
            >
              <MemberIcon className="w-3 h-3" />
              <span className="text-xs">Assignee</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="h-52 overflow-auto">
            {teamMembers.map((member : any ) => {
              const isSelected = assignedMembers.some(
                (m) => m.id === member.id
              );
              return (
                <DropdownMenuItem
                  key={member.id}
                  onClick={() => handleAssignMember(member.id)}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-sm cursor-pointer transition-colors",
                    isSelected
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-accent"
                  )}
                >
                  <Avatar className="size-4">
                    <AvatarImage src={member.imageUrl} />
                    <AvatarFallback className="text-xs">
                      {(member.name || member.email)?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-xs font-medium truncate flex-1 min-w-0">
                    {member.name || member.username || member.email}
                  </div>
                  {isSelected && <Check className="w-3 h-3 text-primary" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
