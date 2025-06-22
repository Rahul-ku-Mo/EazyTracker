import { 
  Globe, 
  Lock, 
  MoreHorizontal, 
  Link, 
  Copy, 
  Trash2, 
  Type, 
  Maximize, 
  Settings, 
  Edit3, 
  Download, 
  Upload, 
  Clock, 
  Bell,
  Star,
  Archive,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/context/ThemeProvider";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface HeaderProps {
 
  isPublic: boolean;

  onPrivacyToggle: () => void;
  lastEditedBy?: string;
  lastEditedTime?: string;
  onShare?: () => void;
  shareButtonText?: string;
  isEditMode?: boolean;
  hasUnsavedChanges?: boolean;
  onSave?: () => void;
  onDiscard?: () => void;
  isSaving?: boolean;
}

const NoteHeader: React.FC<HeaderProps> = ({
  isPublic,
  onPrivacyToggle,
  lastEditedBy = "You",
  lastEditedTime = "just now",
  onShare,
  shareButtonText = "Share",
  isEditMode = false,
  hasUnsavedChanges = false,
  onSave,
  onDiscard,
  isSaving = false
}) => {
  const { isDark } = useTheme();
  
 
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="flex items-center justify-between px-4 py-4 sticky top-0 z-10 bg-white dark:bg-zinc-900">
        {/* Left side - Sidebar Toggle, Breadcrumb, and Privacy */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Sidebar Toggle */}
          {isEditMode && <SidebarTrigger className="h-8 w-8" />}
          
          {/* Breadcrumb Navigation */}
          {isEditMode && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Notes</span>
              <span>/</span>
              <span>Edit</span>
            </div>
          )}
          
          {/* Privacy Badge */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrivacyToggle}
            className={`flex items-center gap-2 px-3 py-1.5 h-8 rounded-lg text-xs font-medium transition-all hover:scale-105 ${
              isDark 
                ? 'hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200' 
                : 'hover:bg-zinc-100/80 text-zinc-600 hover:text-zinc-800'
            }`}
          >
            {isPublic ? (
              <>
                <Globe className="w-4 h-4 text-emerald-500" />
                <span>Public</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-zinc-500" />
                <span>Private</span>
              </>
            )}
          </Button>
       
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Unsaved changes indicator */}
          {isEditMode && hasUnsavedChanges && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Unsaved changes
              </span>
            </div>
          )}

          {/* Last edited info */}
          <div className={`hidden md:flex items-center gap-1 text-xs ${
            isDark ? 'text-zinc-500' : 'text-zinc-500'
          }`}>
            <span>Edited {lastEditedTime}</span>
          </div>

          {/* Edit Mode Actions */}
          {isEditMode && (
            <>
              {hasUnsavedChanges && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDiscard}
                  className="h-8 px-3 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                >
                  Discard
                </Button>
              )}
              
              <Button
                onClick={onSave}
                disabled={!hasUnsavedChanges || isSaving}
                size="sm"
                className="h-8 px-4 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}

          {/* Share/Mode Toggle Button */}
          <Button
            variant={isEditMode ? "outline" : "default"}
            size="sm"
            onClick={onShare}
            className={`h-8 px-4 text-xs font-medium transition-all ${
              isEditMode 
                ? 'hover:bg-zinc-100 dark:hover:bg-zinc-800' 
                : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
            }`}
          >
            {shareButtonText}
          </Button>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2">
              {/* View Options */}
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 px-2 py-1">
                  Display
                </DropdownMenuLabel>
                <DropdownMenuItem className="flex items-center justify-between px-3 py-2 rounded-md">
                  <div className="flex items-center gap-3">
                    <Type className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm">Small text</span>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="flex items-center justify-between px-3 py-2 rounded-md">
                  <div className="flex items-center gap-3">
                    <Maximize className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm">Full width</span>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="my-2" />

              {/* Quick Actions */}
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 px-2 py-1">
                  Actions
                </DropdownMenuLabel>
                
                <DropdownMenuItem onClick={copyLink} className="px-3 py-2 rounded-md">
                  <Link className="w-4 h-4 mr-3 text-zinc-500" />
                  <span className="text-sm">Copy link</span>
                  <span className="ml-auto text-xs text-zinc-400">⌘L</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="px-3 py-2 rounded-md">
                  <Copy className="w-4 h-4 mr-3 text-zinc-500" />
                  <span className="text-sm">Duplicate note</span>
                  <span className="ml-auto text-xs text-zinc-400">⌘D</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="px-3 py-2 rounded-md">
                  <Star className="w-4 h-4 mr-3 text-zinc-500" />
                  <span className="text-sm">Add to favorites</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="px-3 py-2 rounded-md">
                  <Tag className="w-4 h-4 mr-3 text-zinc-500" />
                  <span className="text-sm">Add tags</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="px-3 py-2 rounded-md">
                  <Archive className="w-4 h-4 mr-3 text-zinc-500" />
                  <span className="text-sm">Archive note</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="my-2" />

              {/* Note Settings */}
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 px-2 py-1">
                  Settings
                </DropdownMenuLabel>
                
                <DropdownMenuItem className="px-3 py-2 rounded-md">
                  <Settings className="w-4 h-4 mr-3 text-zinc-500" />
                  <span className="text-sm">Note settings</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="px-3 py-2 rounded-md">
                  <Edit3 className="w-4 h-4 mr-3 text-zinc-500" />
                  <span className="text-sm">Suggest edits</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="px-3 py-2 rounded-md">
                  <Bell className="w-4 h-4 mr-3 text-zinc-500" />
                  <span className="text-sm">Notifications</span>
                  <span className="ml-auto text-xs text-zinc-400">Off</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="my-2" />

              {/* Import/Export */}
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 px-2 py-1">
                  Data
                </DropdownMenuLabel>
                
                <DropdownMenuItem className="px-3 py-2 rounded-md">
                  <Upload className="w-4 h-4 mr-3 text-zinc-500" />
                  <span className="text-sm">Export note</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="px-3 py-2 rounded-md">
                  <Download className="w-4 h-4 mr-3 text-zinc-500" />
                  <span className="text-sm">Import content</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="px-3 py-2 rounded-md">
                  <Clock className="w-4 h-4 mr-3 text-zinc-500" />
                  <span className="text-sm">Version history</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="my-2" />

              <DropdownMenuItem className="px-3 py-2 rounded-md text-red-600 dark:text-red-400">
                <Trash2 className="w-4 h-4 mr-3" />
                <span className="text-sm">Delete note</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2" />

              <div className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                Last edited by {lastEditedBy} • {lastEditedTime}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
  );
};

export default NoteHeader;
