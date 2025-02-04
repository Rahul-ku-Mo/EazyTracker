import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../../components/ui/context-menu";
import { FileEdit, Settings, Trash, UserPlus } from "lucide-react";

interface BoardContextMenuProps {
  children: React.ReactNode;
  onOpen: () => void;
  onDelete: () => void;
  onInvite: () => void;
  onSettings: () => void;
}

export const BoardContextMenu = ({
  children,
  onOpen,
  onDelete,
  onInvite,
  onSettings,
}: BoardContextMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-36">
        <ContextMenuItem onClick={onOpen} className="text-xs">
          <FileEdit className="w-4 h-4 mr-2" />
          Open
        </ContextMenuItem>
        <ContextMenuItem onClick={onInvite} className="text-xs">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite
        </ContextMenuItem>
        <ContextMenuItem onClick={onDelete} className="text-xs text-red-600">
          <Trash className="w-4 h-4 mr-2" />
          Delete
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-xs" onClick={onSettings}>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
