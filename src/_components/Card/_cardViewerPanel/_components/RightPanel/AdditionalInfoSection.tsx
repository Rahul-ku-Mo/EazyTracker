import { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Triangle, Check } from "lucide-react";
import { AdditionalInfoIcon, StorypointIcon } from "@/_components/shared/svg/SharedIcons";
import { useCardMutation } from "../../../_mutations/useCardMutations";
import { KanbanContext } from "@/context/KanbanProvider";

interface AdditionalInfoSectionProps {
  cardId: number;
  storyPoints: number;
}

const formatDate = (date?: Date | string | null) => {
  if (!date) return "";
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(dateObj);
};

export const AdditionalInfoSection = ({ 
  cardId, 
  storyPoints: initialStoryPoints, 
}: AdditionalInfoSectionProps) => {
  const { updateCardMutation } = useCardMutation();
  const [storyPoints, setStoryPoints] = useState(initialStoryPoints);
  
  const { project } = useContext(KanbanContext);

  // Sync storyPoints state with props
  useEffect(() => {
    setStoryPoints(initialStoryPoints);
  }, [initialStoryPoints]);

  const handleStoryPointsChange = (points: number) => {
    setStoryPoints(points);
    updateCardMutation.mutate({ cardId, storyPoints: points });
  };

  const storyPointOptions = [0, 1, 2, 4, 8, 16];

  return (
    <div className="p-2 space-y-3">
      <div className="flex items-center gap-2">
        <AdditionalInfoIcon className="size-4 text-primary" />
        <span className="text-sm font-medium text-primary">
          Additional Info
        </span>
      </div>

      <div className="space-y-3 text-sm">

      <div className="flex justify-between items-start">
          <span className="text-muted-foreground text-base">
            Project
          </span>
            <span className="text-right">
              {project?.title}
            </span>
          </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-sm">Created</span>
          <span className="text-sm font-medium">
            {formatDate(new Date()) || "Mar 24, 2025"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-sm">
            Story Points
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-sm font-medium hover:bg-muted flex items-center gap-1"
              >
                <StorypointIcon className="w-3 h-3 fill-current" />
                {storyPoints === 0
                  ? "No est."
                  : `${storyPoints}`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => handleStoryPointsChange(0)}
                className="flex items-center justify-between px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Triangle
                    strokeWidth={3}
                    className="w-3 h-3 fill-current text-muted-foreground"
                  />
                  <span>No est.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">0</span>
                  {storyPoints === 0 && (
                    <Check
                      strokeWidth={3}
                      className="w-3 h-3 text-green-500"
                    />
                  )}
                </div>
              </DropdownMenuItem>
              {storyPointOptions.slice(1).map((points) => (
                <DropdownMenuItem
                  key={points}
                  onClick={() => handleStoryPointsChange(points)}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <StorypointIcon
                      strokeWidth={3}
                      className="w-3 h-3 fill-current text-muted-foreground"
                    />
                    <span>
                      {points} Point{points !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {storyPoints === points && (
                    <Check
                      strokeWidth={3}
                      className="w-3 h-3 text-green-500"
                    />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
