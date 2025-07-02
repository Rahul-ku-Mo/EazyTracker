import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CalendarDays, CreditCard, AlertTriangle, CheckCircle, Users, FolderKanban, ListTodo, TrendingUp } from 'lucide-react';
import {
  useGetSubscriptionStatus,
  useGetPlans,
  useGetUsageStatistics,
} from '@/hooks/useBilling';
import { type Plan } from '@/apis/billing';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

// No more mock data - using real API data

export const BillingOverview: React.FC = () => {
  const { data: subscription, isLoading } = useGetSubscriptionStatus();
  const { data: plans } = useGetPlans();
  const { data: usageStats, isLoading: isLoadingUsage } = useGetUsageStatistics();
 
  

  const getStatusColor = (status: string, cancelAtPeriodEnd: boolean) => {
    if (cancelAtPeriodEnd) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
    if (status === 'active') return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    if (status === 'past_due') return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    if (status === 'canceled') return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
  };

  const getStatusText = (status: string, cancelAtPeriodEnd: boolean) => {
    if (cancelAtPeriodEnd) return 'Canceling';
    if (status === 'active') return 'Active';
    if (status === 'past_due') return 'Past Due';
    if (status === 'canceled') return 'Canceled';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const calculateUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };



  if (isLoading || isLoadingUsage) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!subscription) return null;

  const currentPlan = plans?.find((plan: Plan) => plan.id === subscription.plan);
  const isFreePlan = subscription.plan === 'free';

  return (
    <div className="space-y-6">
      {/* Trial Alert */}
      {subscription.trialEnd && new Date(subscription.trialEnd) > new Date() && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/50">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            Your free trial ends on {format(new Date(subscription.trialEnd), 'MMM dd, yyyy')}. 
            Upgrade your plan to continue using all features after the trial period.
          </AlertDescription>
        </Alert>
      )}

      {/* Trial Expired Alert */}
      {subscription.trialEnd && new Date(subscription.trialEnd) <= new Date() && isFreePlan && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            Your free trial has expired. Please upgrade to a paid plan to continue using premium features.
          </AlertDescription>
        </Alert>
      )}

      {/* Subscription Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Subscription Overview</span>
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Plan</span>
                <Badge className="text-xs">
                  {currentPlan?.name || subscription.plan}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                <Badge 
                  className={`text-xs ${getStatusColor(subscription.status, subscription.cancelAtPeriodEnd)}`}
                  variant="secondary"
                >
                  {getStatusText(subscription.status, subscription.cancelAtPeriodEnd)}
                </Badge>
              </div>

              <div className="space-y-2">
                {!isFreePlan && subscription.currentPeriodEnd && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {subscription.cancelAtPeriodEnd ? 'Active Until' : 'Next Billing Date'}
                    </span>
                    <div className="flex items-center space-x-1">
                      <CalendarDays className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 items-end">
            {!isFreePlan && subscription?.subscriptionId && (
              <Button
                variant="outline"
                onClick={() => {
                  // Open Paddle customer portal - use the URL from the provided example
                  const portalUrl = `https://customer-portal.paddle.com/cpl_01jxaz0q9y721z5gf8xpgnxazy`;
                  window.open(portalUrl, '_blank');
                }}
                className="flex items-center space-x-2 w-full"
              >
                <CreditCard className="w-4 h-4" />
                <span>Manage Plan</span>
              </Button>
            )}
          
          </div>
          </div>
          {/* Actions */}
        
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Current Usage</span>
          </CardTitle>
          <CardDescription>
            Track your usage against plan limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Team Members */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Team Members</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {usageStats?.usage?.teamMembers?.current || 0} / {
                    usageStats?.usage?.teamMembers?.limit === null 
                      ? '∞' 
                      : usageStats?.usage?.teamMembers?.limit || '∞'
                  }
                </span>
              </div>
              {usageStats?.usage?.teamMembers?.limit !== null && (
                <Progress 
                  value={calculateUsagePercentage(
                    usageStats?.usage?.teamMembers?.current || 0, 
                    usageStats?.usage?.teamMembers?.limit || 0
                  )} 
                  className="h-2"
                />
              )}
            </div>

            {/* Projects */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FolderKanban className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Projects</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {usageStats?.usage?.projects?.current || 0} / {
                    usageStats?.usage?.projects?.limit === null 
                      ? '∞' 
                      : usageStats?.usage?.projects?.limit || '∞'
                  }
                </span>
              </div>
              {usageStats?.usage?.projects?.limit !== null && (
                <Progress 
                  value={calculateUsagePercentage(
                    usageStats?.usage?.projects?.current || 0, 
                    usageStats?.usage?.projects?.limit || 0
                  )} 
                  className="h-2"
                />
              )}
            </div>

            {/* Tasks per Project */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ListTodo className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Tasks per Project</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {usageStats?.usage?.tasksPerProject?.current || 0} / {
                    usageStats?.usage?.tasksPerProject?.limit === null 
                      ? '∞' 
                      : usageStats?.usage?.tasksPerProject?.limit || '∞'
                  }
                </span>
              </div>
              {usageStats?.usage?.tasksPerProject?.limit !== null && (
                <Progress 
                  value={calculateUsagePercentage(
                    usageStats?.usage?.tasksPerProject?.current || 0, 
                    usageStats?.usage?.tasksPerProject?.limit || 0
                  )} 
                  className="h-2"
                />
              )}
            </div>

            {/* Total Tasks */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Total Tasks</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {usageStats?.usage?.totalTasks?.current || 0} / Unlimited
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Total tasks created across all projects
              </div>
            </div>

            {/* Storage */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Storage</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {usageStats?.usage?.storageGB?.current || 0}GB / {
                    usageStats?.usage?.storageGB?.limit === null 
                      ? '∞' 
                      : `${usageStats?.usage?.storageGB?.limit || 1}GB`
                  }
                </span>
              </div>
              {usageStats?.usage?.storageGB?.limit !== null && (
                <Progress 
                  value={calculateUsagePercentage(
                    usageStats?.usage?.storageGB?.current || 0, 
                    usageStats?.usage?.storageGB?.limit || 1
                  )} 
                  className="h-2"
                />
              )}
            </div>

            {/* Activity History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Activity History</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {/* Get activity history days from the plan based on current subscription */}
                  {subscription?.plan === 'enterprise' ? '∞' : 
                   subscription?.plan === 'pro' ? '30' : '7'} days
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Keep track of changes and updates to your projects
              </div>
            </div>
          </div>

          {/* Usage Warnings */}
          {usageStats && (
            <div className="space-y-2">
              {usageStats?.usage?.teamMembers?.limit !== null && usageStats?.usage?.teamMembers && 
               calculateUsagePercentage(usageStats.usage.teamMembers.current, usageStats.usage.teamMembers.limit) >= 80 && (
                <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/50">
                  <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <AlertDescription className="text-orange-800 dark:text-orange-200">
                    You're approaching your team member limit. Consider upgrading your plan to add more members.
                  </AlertDescription>
                </Alert>
              )}

              {usageStats?.usage?.projects?.limit !== null && usageStats?.usage?.projects &&
               calculateUsagePercentage(usageStats.usage.projects.current, usageStats.usage.projects.limit) >= 80 && (
                <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/50">
                  <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <AlertDescription className="text-orange-800 dark:text-orange-200">
                    You're approaching your project limit. Consider upgrading your plan to create more projects.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts */}
      {subscription.cancelAtPeriodEnd && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/50">
          <AlertDescription className="text-orange-800 dark:text-orange-200 flex items-center">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mr-2" />
            Your subscription will be canceled on{' '}
            {subscription.currentPeriodEnd && format(new Date(subscription.currentPeriodEnd), 'MMMM dd, yyyy')}.
            You'll continue to have access to all features until then.
          </AlertDescription>
        </Alert>
      )}

      {subscription.status === 'past_due' && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50">
          <AlertDescription className="text-red-800 dark:text-red-200 flex items-center">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
            Your payment is past due. Please update your payment method to continue using premium features.
          </AlertDescription>
        </Alert>
      )}

      {isFreePlan && (
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50">
          <AlertDescription className="text-blue-800 dark:text-blue-200 flex items-center">
          <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
            You're currently on the free plan. Upgrade to unlock more features and increased limits.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}; 