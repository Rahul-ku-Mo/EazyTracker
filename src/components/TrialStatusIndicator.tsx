import React from 'react';
import { Link } from 'react-router-dom';


import { Clock, Sparkles, Crown } from 'lucide-react';
import { useTrialStatus } from '@/hooks/useTrialStatus';

export const TrialStatusIndicator: React.FC = () => {
  const { trialStatus } = useTrialStatus();

  // Don't show if loading or has active subscription
  if (!trialStatus || trialStatus.hasActiveSubscription) {
    return null;
  }

  const { daysRemaining, trialExpired } = trialStatus;
  const days = daysRemaining ?? 0;

  if (trialExpired) {
    return (
      <Link to="/billing" className="block">
        <div className="flex items-center space-x-2 p-2 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:border-red-800">
          <Clock className="w-4 h-4 text-red-600 dark:text-red-400" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-red-800 dark:text-red-300">Trial Expired</p>
            <p className="text-xs text-red-600 dark:text-red-400 truncate">Upgrade to continue</p>
          </div>
          <Crown className="w-4 h-4 text-red-600 dark:text-red-400" />
        </div>
      </Link>
    );
  }

  const getStatusColor = () => {
    if (days <= 3) {
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-800 dark:text-red-300',
        subtext: 'text-red-600 dark:text-red-400',
        icon: 'text-red-600 dark:text-red-400'
      };
    } else if (days <= 7) {
      return {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-800',
        text: 'text-orange-800 dark:text-orange-300',
        subtext: 'text-orange-600 dark:text-orange-400',
        icon: 'text-orange-600 dark:text-orange-400'
      };
    } else {
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-800 dark:text-blue-300',
        subtext: 'text-blue-600 dark:text-blue-400',
        icon: 'text-blue-600 dark:text-blue-400'
      };
    }
  };

  const colors = getStatusColor();

  return (
    <Link to="/billing" className="block">
      <div className={`flex items-center space-x-2 p-2 rounded-lg ${colors.bg} border ${colors.border} hover:opacity-80 transition-opacity`}>
        <Sparkles className={`w-4 h-4 ${colors.icon}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1">
            <p className={`text-xs font-medium ${colors.text}`}>Free Trial</p>
          </div>
          <p className={`text-xs ${colors.subtext} truncate`}>
            {days} day{days !== 1 ? 's' : ''} left
          </p>
        </div>
        <Crown className={`w-4 h-4 ${colors.icon}`} />
      </div>
    </Link>
  );
}; 