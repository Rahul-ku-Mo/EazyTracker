import React from 'react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar } from 'lucide-react';
import { useTrialStatus } from '@/hooks/useTrialStatus';

export const TrialProgressIndicator: React.FC = () => {
  const { trialStatus } = useTrialStatus();

  // Don't show if loading, has active subscription, or trial expired
  if (!trialStatus || trialStatus.hasActiveSubscription || trialStatus.trialExpired) {
    return null;
  }

  const { daysRemaining } = trialStatus;
  const totalTrialDays = 14;
  const days = daysRemaining ?? 0;
  const progressPercentage = ((totalTrialDays - days) / totalTrialDays) * 100;

  // Calculate color based on remaining days
  const getProgressColors = () => {
    if (days <= 3) {
      return {
        progressColor: 'bg-red-500',
        backgroundColor: 'bg-red-100 dark:bg-red-900/20',
        textColor: 'text-red-800 dark:text-red-300',
        badgeVariant: 'destructive' as const
      };
    } else if (days <= 7) {
      return {
        progressColor: 'bg-orange-500',
        backgroundColor: 'bg-orange-100 dark:bg-orange-900/20',
        textColor: 'text-orange-800 dark:text-orange-300',
        badgeVariant: 'secondary' as const
      };
    } else {
      return {
        progressColor: 'bg-blue-500',
        backgroundColor: 'bg-blue-100 dark:bg-blue-900/20',
        textColor: 'text-blue-800 dark:text-blue-300',
        badgeVariant: 'secondary' as const
      };
    }
  };

  const { progressColor, backgroundColor, textColor, badgeVariant } = getProgressColors();

  return (
    <div className={`${backgroundColor} border rounded-lg p-4 space-y-3`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className={`w-4 h-4 ${textColor}`} />
          <span className={`text-sm font-medium ${textColor}`}>Free Trial Progress</span>
        </div>
        <Badge variant={badgeVariant} className="text-xs">
          {days} day{days !== 1 ? 's' : ''} left
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className={`flex items-center gap-1 ${textColor}`}>
            <Calendar className="w-3 h-3" />
            Day {totalTrialDays - days + 1} of {totalTrialDays}
          </span>
          <span className={textColor}>
            {Math.round(progressPercentage)}% used
          </span>
        </div>
        
        <div className="relative">
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-white/50 dark:bg-gray-700/50"
          />
          <div 
            className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${progressColor}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Action Section */}
      <div className="flex items-center justify-between pt-1">
        <span className={`text-xs ${textColor} opacity-80`}>
          {days <= 3 
            ? 'Act fast! Trial ending soon.' 
            : days <= 7 
            ? 'Consider upgrading soon.' 
            : 'Enjoying your trial? Upgrade anytime.'}
        </span>
        <Link to="/billing">
          <Button size="sm" variant="outline" className="text-xs h-7 px-3">
            View Plans
          </Button>
        </Link>
      </div>
    </div>
  );
}; 