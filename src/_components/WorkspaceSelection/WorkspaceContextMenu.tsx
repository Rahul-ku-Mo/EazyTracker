import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { FileEdit, Settings, Trash, UserPlus, Star } from "lucide-react";

interface WorkspaceContextMenuProps {
  children: React.ReactNode;
  onOpen: () => void;
  onDelete: () => void;
  onInvite: () => void;
  onSettings: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
  isToggling?: boolean;
}

export const WorkspaceContextMenu = ({
  children,
  onOpen,
  onDelete,
  onInvite,
  onSettings,
  onToggleFavorite,
  isFavorite,
  isToggling = false,
}: WorkspaceContextMenuProps) => {
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
        <ContextMenuItem 
          onClick={onToggleFavorite} 
          className="text-xs"
          disabled={isToggling}
        >
          <Star className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
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