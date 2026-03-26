import { Button } from "@/components/ui/button";
import { StorypointIcon } from "@/_components/shared/svg/SharedIcons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useState } from "react";

const storyPointOptions = [0, 1, 2, 4, 8, 16];

export const StoryDropdown = () => {
  const [storyPoints, setStoryPoints] = useState(0);

  const handleStoryPointsChange = (points: number) => {
    setStoryPoints(points);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-auto p-1 border dark:border-[#1b1d1c77] rounded-sm text-xs font-medium hover:bg-black flex items-center gap-1"
        >
        <StorypointIcon className="w-3 h-3 fill-current" /> {storyPoints === 0 ? "" : `${storyPoints}`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {storyPointOptions.map((points) => (
          <DropdownMenuItem
            key={points}
            onClick={() => handleStoryPointsChange(points)}
            className="flex items-center justify-between px-3 py-2 text-xs"
          >
            <div className="flex items-center gap-2">
              <StorypointIcon
                strokeWidth={3}
                className="size-4 fill-current text-muted-foreground"
              />
              <span className="text-xs">
                {points} Point{(points === 1 || points === 0) ? "" : "s"}
              </span>
            </div>
            {storyPoints === points && (
              <div className="size-2 rounded-full bg-green-500" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
