import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, X, Mail } from "lucide-react";
import { MemberIcon } from "@/_components/shared/svg/SharedIcons";
import { useCardMutation } from "../../../_mutations/useCardMutations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useNewCardMutation } from "@/_components/Card/_newCardComponentsAndActions/new-card-mutations";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [open, setOpen] = useState(false);
  const { updateCardMutation } = useCardMutation();
  const { teamData } = useNewCardMutation();

  const teamMembers = teamData?.members || [];
  const assignedMembers = assignees || [];

  const handleAssignMember = (memberId: string) => {
    updateCardMutation.mutate({
      cardId,
      assigneeId: memberId,
    });
    setOpen(false);
  };

  const handleUnassign = () => {
    updateCardMutation.mutate({
      cardId,
      assigneeId: null,
    });
    setOpen(false);
  };

  return (
    <div className="flex justify-between items-center rounded-md p-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-primary">Assignee</span>
      </div>

      {assignedMembers.length > 0 ? (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium cursor-pointer hover:bg-muted-foreground/10 rounded-sm transition-all ease-in">
                    <Avatar className="size-4">
                      <AvatarImage src={assignedMembers[0].imageUrl} />
                      <AvatarFallback className="text-xs">
                        {(assignedMembers[0].name || assignedMembers[0].email)
                          ?.charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate max-w-20">
                      {assignedMembers[0].name ||
                        assignedMembers[0].username ||
                        assignedMembers[0].email}
                    </span>
                  </div>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent
                side="left"
                className="bg-popover text-popover-foreground border border-border p-0"
              >
                <div className="p-3 w-[260px]">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarImage src={assignedMembers[0].imageUrl} />
                      <AvatarFallback className="text-sm">
                        {(assignedMembers[0].name || assignedMembers[0].email)
                          ?.charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {assignedMembers[0].name ||
                          assignedMembers[0].username ||
                          assignedMembers[0].email}
                      </div>
                      {assignedMembers[0].username && (
                        <div className="text-xs text-muted-foreground truncate">
                          @{assignedMembers[0].username}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 text-xs">
                    {assignedMembers[0].name && (
                      <div className="flex items-center gap-2">
                        <MemberIcon className="size-3 text-muted-foreground" />
                        <span className="truncate">
                          {assignedMembers[0].name}
                        </span>
                      </div>
                    )}

                    {assignedMembers[0].email && (
                      <div className="flex items-center gap-2">
                        <Mail className="size-3 text-muted-foreground" />
                        <span className="truncate">
                          {assignedMembers[0].email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent
            align="end"
            className="w-[220px] max-h-80 overflow-y-auto relative"
          >
            <DropdownMenuItem
              onClick={handleUnassign}
              className="text-red-600 focus:text-red-600"
            >
              <X className="size-4 mr-2" />
              Remove assignee
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {teamMembers
              .filter((member: any) => member.id !== assignedMembers[0].id)
              .map((member: any) => (
                <DropdownMenuItem
                  key={member.id}
                  onClick={() => handleAssignMember(member.id)}
                  disabled={updateCardMutation.isPending}
                  className="flex items-center gap-2 p-2"
                >
                  <Avatar className="size-5">
                    <AvatarImage src={member.imageUrl} />
                    <AvatarFallback className="text-xs">
                      {(member.name || member.email)?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-xs font-medium truncate flex-1">
                    {member.name || member.username || member.email}
                  </div>
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-fit h-fit p-1.5">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[220px]">
            <DropdownMenuLabel className="flex items-center gap-2">
              <MemberIcon className="size-4" />
              Assign to member
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {teamMembers.map((member: any) => (
              <DropdownMenuItem
                key={member.id}
                onClick={() => handleAssignMember(member.id)}
                disabled={updateCardMutation.isPending}
                className="flex items-center gap-2 p-2"
              >
                <Avatar className="size-5">
                  <AvatarImage src={member.imageUrl} />
                  <AvatarFallback className="text-xs">
                    {(member.name || member.email)?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs font-medium truncate flex-1">
                  {member.name || member.username || member.email}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
