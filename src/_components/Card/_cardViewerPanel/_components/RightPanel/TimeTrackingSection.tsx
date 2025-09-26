import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TimeTrackingIcon } from "@/_components/shared/svg/SharedIcons";

interface TimeTrackingSectionProps {
  cardId: number;
  timeSpent?: string;
  progressPercentage?: number;
}

export const TimeTrackingSection = ({ 
  cardId, 
  timeSpent = "2h 15m", 
  progressPercentage = 45 
}: TimeTrackingSectionProps) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`analytics?task=${cardId}`);
  };

  return (
    <div className="p-2 dark:bg-[#101010]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TimeTrackingIcon
            strokeWidth={3}
            className="size-4 text-primary"
          />
          <span className="text-xs font-medium text-primary">
            Time Tracking
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={handleViewDetails}
        >
          View Details
        </Button>
      </div>

      <div className="space-y-2">
        <div className="relative w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg">
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-lg transition-all duration-300"
            style={{ width: `${Math.min(Math.max(progressPercentage, 0), 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground text-xs">Time Spent</span>
          <span className="text-xs font-medium">{timeSpent}</span>
        </div>
      </div>
    </div>
  );
};
