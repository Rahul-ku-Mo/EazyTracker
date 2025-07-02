import React from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Sparkles, ArrowRight, X } from 'lucide-react';
import { useTrialStatus } from '@/hooks/useTrialStatus';

export const TrialStatusBanner: React.FC = () => {
  const { trialStatus, dismissTrialBanner, isTrialBannerDismissed } = useTrialStatus();

  // Don't show banner if:
  // - Trial status is loading
  // - User has active subscription
  // - Trial has expired (handled by modal)
  // - Banner is dismissed
  if (!trialStatus || trialStatus.hasActiveSubscription || trialStatus.trialExpired || isTrialBannerDismissed) {
    return null;
  }

  const { daysRemaining } = trialStatus;
  const days = daysRemaining ?? 0;

  // Show different variants based on days remaining
  const getVariantAndMessage = () => {
    if (days <= 3) {
      return {
        variant: 'destructive' as const,
        color: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
        icon: Clock,
        title: 'Trial ending soon!',
        message: `Only ${days} day${days !== 1 ? 's' : ''} left in your free trial`
      };
    } else if (days <= 7) {
      return {
        variant: 'default' as const,
        color: 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300',
        icon: Clock,
        title: 'Trial reminder',
        message: `${days} days left in your free trial`
      };
    } else {
      return {
        variant: 'default' as const,
        color: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
        icon: Sparkles,
        title: 'Free trial active',
        message: `${days} days remaining in your trial`
      };
    }
  };

  const { color, icon: Icon, title, message } = getVariantAndMessage();

  return (
    <div className={`${color} border rounded-lg p-4 mx-4 my-4 relative`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium">{title}</h3>
              <Badge variant="secondary" className="text-xs">
                {days} day{days !== 1 ? 's' : ''} left
              </Badge>
            </div>
            <p className="text-sm opacity-90 mt-1">
              {message}. Upgrade to continue using all features after your trial ends.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link to="/billing">
            <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
              Upgrade Now
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissTrialBanner}
            className="text-gray-500 hover:text-gray-700 p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}; 