import React from "react";
import { Settings, Search } from "lucide-react";

import { Input } from "./ui/input";

import { ViewOptions } from "@/store/useViewOptionsStore";

interface BoardViewBarProps {
  currentView: "kanban" | "listview";
  viewOptions: ViewOptions;
  onOptionsChange: (options: Partial<ViewOptions>) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  members?: Array<{
    id: string;
    name: string;
    username: string;
    imageUrl?: string;
  }>;
  onOpenViewOptions?: () => void;
}

const BoardViewBar: React.FC<BoardViewBarProps> = ({
  searchQuery = "",
  onSearchChange,
  onOpenViewOptions,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-1.5 h-10 bg-white dark:bg-black gap-4 shadow-sm">
      {/* Left side - Search */}
      <div className="flex items-center gap-3 flex-1">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-6 h-8 !text-xs border-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none shadow-none placeholder:text-xs"
          />
        </div>
      </div>

      {/* Right side - Filters and Options */}
          <Settings className="h-4 w-4 cursor-pointer" onClick={onOpenViewOptions} />
    
    </div>
  );
};

export default BoardViewBar;
