import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "../../components/ui/context-menu";
import { cn } from "../../lib/utils";
import { Flag, Tag, CheckSquare, Plus, User } from "lucide-react";
import { useCardMutation } from "./_mutations/useCardMutations";
import { useMembers } from "../../hooks/useMembers";
import { useParams } from "react-router-dom";
import { TUser } from "../../types";

interface ContextMenuItem {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  shortcut?: string;
  className?: string;
}

interface CardContextMenuProps {
  children: React.ReactNode;
  items: ContextMenuItem[];
  cardId: string;
}

const CardContextMenu = ({ children, items, cardId }: CardContextMenuProps) => {
 
  const { id } = useParams();

  // TODO: get members from the database who are in the same board
  const { members, isPending } = useMembers(id as string);

  const { updateCardMutation } = useCardMutation();

  const updatePriorityForATicket = (priority: string) => {
    updateCardMutation.mutate({
      priority,
      cardId: parseInt(cardId),
    });
  };

  const updateAssigneeForATicket = (userId: string) => {
    updateCardMutation.mutate({
      cardId: parseInt(cardId),
      assigneeId: userId,
    });
  };

  const updateLabelForATicket = (label: string) => {
    updateCardMutation.mutate({
      cardId: parseInt(cardId),
      label,
    });
  };


  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {items.map((item, index) => (
          <div key={item.label}>
            {item.label === "Set priority" ? (
              <ContextMenuSub>
                <ContextMenuSubTrigger className="gap-2 text-xs">
                  <Flag className="w-3 h-3 mr-2" />
                  Set priority
                </ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-48">
                  <ContextMenuItem
                    className="gap-2 text-xs"
                    onClick={() => updatePriorityForATicket("urgent")}
                  >
                    <Flag className="w-3 h-3 text-red-500" />
                    Urgent
                    <ContextMenuShortcut>⌘1</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="gap-2 text-xs"
                    onClick={() => updatePriorityForATicket("high")}
                  >
                    <Flag className="w-3 h-3 text-amber-500" />
                    High
                    <ContextMenuShortcut>⌘2</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="gap-2 text-xs"
                    onClick={() => updatePriorityForATicket("medium")}
                  >
                    <Flag className="w-3 h-3 text-blue-500" />
                    Medium
                    <ContextMenuShortcut>⌘3</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="gap-2 text-xs"
                    onClick={() => updatePriorityForATicket("low")}
                  >
                    <Flag className="w-3 h-3 text-green-500" />
                    Low
                    <ContextMenuShortcut>⌘4</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    className="gap-2 text-xs text-muted-foreground"
                    onClick={() => updatePriorityForATicket("")}
                  >
                    <Flag className="w-3 h-3" />
                    No priority
                    <ContextMenuShortcut>⌘0</ContextMenuShortcut>
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
            ) : item.label === "Assignee" ? (
              <ContextMenuSub>
                <ContextMenuSubTrigger className="gap-2 text-xs">
                  <User className="w-3 h-3 mr-2" />
                  Assignee
                </ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-48">
                  {!isPending &&
                    members?.map((member: TUser) => (
                      <ContextMenuItem
                        key={member.id}
                        className="gap-2 text-xs"
                        onClick={() => updateAssigneeForATicket(member.id)}
                      >
                        <div className="flex items-center justify-center w-3 h-3 rounded-full bg-muted">
                          {member.imageUrl ? (
                            <img
                              src={member.imageUrl}
                              alt={member.username}
                              className="w-full h-full rounded-full"
                            />
                          ) : (
                            member.username.charAt(0)
                          )}
                        </div>
                        {member.username}
                      </ContextMenuItem>
                    ))}
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    className="gap-2 text-xs text-muted-foreground"
                    onClick={() => updateAssigneeForATicket("")}
                  >
                    <User className="w-3 h-3" />
                    Unassigned
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
            ) : item.label === "Add label" ? (
              <ContextMenuSub>
                <ContextMenuSubTrigger className="gap-2 text-xs" >
                  <Tag className="w-3 h-3 mr-2" />
                  Add label
                </ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-48">
                  <ContextMenuItem className="gap-2 text-xs" onClick={() => updateLabelForATicket("Feature")}>
                    <Tag className="w-3 h-3 text-emerald-500" />
                    Feature
                  </ContextMenuItem>
                  <ContextMenuItem className="gap-2 text-xs" onClick={() => updateLabelForATicket("Bug")}>
                    <Tag className="w-3 h-3 text-blue-500" />
                    Bug
                  </ContextMenuItem>
                  <ContextMenuItem className="gap-2 text-xs" onClick={() => updateLabelForATicket("Enhancement")}>
                    <Tag className="w-3 h-3 text-purple-500" />
                    Enhancement
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem className="gap-2 text-xs">
                    <Plus className="w-3 h-3" />
                    Create new label
                    <ContextMenuShortcut>⌘N</ContextMenuShortcut>
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
            ) : item.label === "Add checklist" ? (
              <ContextMenuSub>
                <ContextMenuSubTrigger className="gap-2 text-xs">
                  <CheckSquare className="w-3 h-3 mr-2" />
                  Add checklist
                </ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-48">
                  <ContextMenuItem className="gap-2 text-xs">
                    <CheckSquare className="w-3 h-3" />
                    To Do
                  </ContextMenuItem>
                  <ContextMenuItem className="gap-2 text-xs">
                    <CheckSquare className="w-3 h-3" />
                    In Progress
                  </ContextMenuItem>
                  <ContextMenuItem className="gap-2 text-xs">
                    <CheckSquare className="w-3 h-3" />
                    Done
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem className="gap-2 text-xs">
                    <Plus className="w-3 h-3" />
                    Create new checklist
                    <ContextMenuShortcut>⌘L</ContextMenuShortcut>
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
            ) : (
              <ContextMenuItem
                onClick={item.onClick}
                className={cn("text-xs gap-2", item.className)}
              >
                {item.icon}
                {item.label}
                {item.shortcut && (
                  <ContextMenuShortcut>{item.shortcut}</ContextMenuShortcut>
                )}
              </ContextMenuItem>
            )}
            {index === items.length - 2 && <ContextMenuSeparator />}
          </div>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default CardContextMenu;
