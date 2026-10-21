import { AlertTriangle, CheckCircle, Clock, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MilestoneItem } from "@/apis/project";
import { calculateMilestoneStats, formatMilestoneForDisplay } from "@/utils/milestoneUtils";

interface MilestoneValidationProps {
  milestones: MilestoneItem[];
  showWarnings?: boolean;
  showStats?: boolean;
  compact?: boolean;
}

export const MilestoneValidation = ({ 
  milestones, 
  showWarnings = true, 
  showStats = true,
  compact = false 
}: MilestoneValidationProps) => {
  const stats = calculateMilestoneStats(milestones);
  const overdueMilestones = milestones.filter(m => {
    const formatted = formatMilestoneForDisplay(m);
    return formatted.isOverdue;
  });
  const dueSoonMilestones = milestones.filter(m => {
    const formatted = formatMilestoneForDisplay(m);
    return formatted.isDueSoon;
  });

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <Badge variant="outline">
          {stats.completed}/{stats.total} Complete
        </Badge>
        {stats.overdue > 0 && (
          <Badge variant="destructive">
            {stats.overdue} Overdue
          </Badge>
        )}
        {stats.dueSoon > 0 && (
          <Badge variant="secondary">
            {stats.dueSoon} Due Soon
          </Badge>
        )}
        {stats.totalBudget > 0 && (
          <Badge variant="outline">
            <DollarSign className="size-3 mr-1" />
            ${stats.totalBudget.toLocaleString()}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <CheckCircle className="size-4" />
          Milestone Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.completed}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{stats.remaining}</div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{stats.overdue}</div>
              <div className="text-xs text-muted-foreground">Overdue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{stats.completionRate}%</div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>
        )}

        {stats.totalBudget > 0 && (
          <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
            <DollarSign className="size-4 text-green-600" />
            <span className="font-medium">Total Budget: ${stats.totalBudget.toLocaleString()}</span>
          </div>
        )}

        {showWarnings && (overdueMilestones.length > 0 || dueSoonMilestones.length > 0) && (
          <div className="space-y-2">
            {overdueMilestones.length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertTriangle className="size-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-sm text-red-700 dark:text-red-300">
                    {overdueMilestones.length} Overdue Milestone{overdueMilestones.length > 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {overdueMilestones.slice(0, 2).map(m => m.title).join(', ')}
                    {overdueMilestones.length > 2 && ` and ${overdueMilestones.length - 2} more...`}
                  </div>
                </div>
              </div>
            )}

            {dueSoonMilestones.length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <Clock className="size-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-sm text-yellow-700 dark:text-yellow-300">
                    {dueSoonMilestones.length} Due Soon
                  </div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    {dueSoonMilestones.slice(0, 2).map(m => m.title).join(', ')}
                    {dueSoonMilestones.length > 2 && ` and ${dueSoonMilestones.length - 2} more...`}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {milestones.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No milestones defined yet. Add some milestones to track your project progress.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MilestoneValidation;
