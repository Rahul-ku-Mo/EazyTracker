import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FolderOpen, 
  Clock, 
  BarChart3, 
  Zap, 
  Crown, 
  Sparkles,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { useGetUsageStatistics } from '@/hooks/useBilling';
import { useFeatureGating } from '@/hooks/useFeatureGating';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const planIcons = {
  free: Zap,
  pro: Sparkles,
  enterprise: Crown,
};

const planColors = {
  free: 'text-gray-500 dark:text-gray-400',
  pro: 'text-blue-500 dark:text-blue-400',
  enterprise: 'text-purple-500 dark:text-purple-400',
};

export const UsageDashboard: React.FC = () => {
  const { data: usage, isLoading } = useGetUsageStatistics();
  const { currentPlan, canUseAnalytics, canUseTimeTracking, canUseAI } = useFeatureGating();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!usage) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500 dark:text-gray-400">Unable to load usage statistics</p>
        </CardContent>
      </Card>
    );
  }

  const PlanIcon = planIcons[currentPlan || 'free'];

  const getUsageColor = (current: number, limit: number | null) => {
    if (limit === null) return 'text-green-600'; // Unlimited
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Progress color helper (currently unused but may be needed for future features)
  // const getProgressColor = (current: number, limit: number | null) => {
  //   if (limit === null) return 'bg-green-500'; // Unlimited
  //   const percentage = (current / limit) * 100;
  //   if (percentage >= 90) return 'bg-red-500';
  //   if (percentage >= 75) return 'bg-yellow-500';
  //   return 'bg-green-500';
  // };

  const formatLimit = (limit: number | null) => {
    return limit === null ? 'Unlimited' : limit.toString();
  };

  const getUsagePercentage = (current: number, limit: number | null) => {
    if (limit === null) return 0; // Unlimited shows as 0%
    return Math.min((current / limit) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                currentPlan === 'pro' 
                  ? 'bg-blue-100 dark:bg-blue-900/30' 
                  : currentPlan === 'enterprise'
                  ? 'bg-purple-100 dark:bg-purple-900/30'
                  : 'bg-gray-100 dark:bg-gray-800'
              )}>
                <PlanIcon className={cn(
                  "w-5 h-5",
                  planColors[currentPlan || 'free']
                )} />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  {currentPlan === 'free' ? 'Free Trial' : 
                   currentPlan === 'pro' ? 'Professional' : 
                   'Enterprise'} Plan
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Current subscription and usage overview
                </CardDescription>
              </div>
            </div>
            <Link to="/billing">
              <Button variant="outline" size="sm">
                Manage Plan
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Usage Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Projects */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FolderOpen className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Projects</CardTitle>
              </div>
              {usage.usage.projects.limit !== null && 
               usage.usage.projects.current >= usage.usage.projects.limit && (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-2xl font-bold",
                  getUsageColor(usage.usage.projects.current, usage.usage.projects.limit)
                )}>
                  {usage.usage.projects.current}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  of {formatLimit(usage.usage.projects.limit)}
                </span>
              </div>
              {usage.usage.projects.limit !== null && (
                <Progress 
                  value={getUsagePercentage(usage.usage.projects.current, usage.usage.projects.limit)}
                  className="h-2"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-green-500 dark:text-green-400" />
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Team Members</CardTitle>
              </div>
              {usage.usage.teamMembers.limit !== null && 
               usage.usage.teamMembers.current >= usage.usage.teamMembers.limit && (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-2xl font-bold",
                  getUsageColor(usage.usage.teamMembers.current, usage.usage.teamMembers.limit)
                )}>
                  {usage.usage.teamMembers.current}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  of {formatLimit(usage.usage.teamMembers.limit)}
                </span>
              </div>
              {usage.usage.teamMembers.limit !== null && (
                <Progress 
                  value={getUsagePercentage(usage.usage.teamMembers.current, usage.usage.teamMembers.limit)}
                  className="h-2"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Storage */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Storage</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-2xl font-bold",
                  getUsageColor(usage.usage.storageGB.current, usage.usage.storageGB.limit)
                )}>
                  {usage.usage.storageGB.current}GB
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  of {formatLimit(usage.usage.storageGB.limit)}GB
                </span>
              </div>
              {usage.usage.storageGB.limit !== null && (
                <Progress 
                  value={getUsagePercentage(usage.usage.storageGB.current, usage.usage.storageGB.limit)}
                  className="h-2"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Image Uploads */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Image Uploads</CardTitle>
              </div>
              {usage.usage.imageUploads?.limit !== null && 
               usage.usage.imageUploads?.current >= usage.usage.imageUploads?.limit && (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-2xl font-bold",
                  getUsageColor(usage.usage.imageUploads?.current || 0, usage.usage.imageUploads?.limit || null)
                )}>
                  {usage.usage.imageUploads?.current || 0}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  of {formatLimit(usage.usage.imageUploads?.limit || null)}
                </span>
              </div>
              {usage.usage.imageUploads?.limit !== null && (
                <Progress 
                  value={getUsagePercentage(usage.usage.imageUploads?.current || 0, usage.usage.imageUploads?.limit || null)}
                  className="h-2"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Access */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white">Feature Access</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Features available with your current plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className={cn(
                "w-4 h-4",
                canUseAnalytics ? "text-green-500" : "text-gray-400"
              )} />
              <span className={cn(
                "text-sm",
                canUseAnalytics ? "text-gray-900 dark:text-white" : "text-gray-400"
              )}>
                Analytics
              </span>
              <Badge variant={canUseAnalytics ? "default" : "secondary"} className="text-xs">
                {canUseAnalytics ? "Active" : "Locked"}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className={cn(
                "w-4 h-4",
                canUseTimeTracking ? "text-green-500" : "text-gray-400"
              )} />
              <span className={cn(
                "text-sm",
                canUseTimeTracking ? "text-gray-900 dark:text-white" : "text-gray-400"
              )}>
                Time Tracking
              </span>
              <Badge variant={canUseTimeTracking ? "default" : "secondary"} className="text-xs">
                {canUseTimeTracking ? "Active" : "Locked"}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Sparkles className={cn(
                "w-4 h-4",
                canUseAI ? "text-green-500" : "text-gray-400"
              )} />
              <span className={cn(
                "text-sm",
                canUseAI ? "text-gray-900 dark:text-white" : "text-gray-400"
              )}>
                AI Features
              </span>
              <Badge variant={canUseAI ? "default" : "secondary"} className="text-xs">
                {canUseAI ? "Active" : "Locked"}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Crown className={cn(
                "w-4 h-4",
                usage.features.prioritySupport ? "text-green-500" : "text-gray-400"
              )} />
              <span className={cn(
                "text-sm",
                usage.features.prioritySupport ? "text-gray-900 dark:text-white" : "text-gray-400"
              )}>
                Priority Support
              </span>
              <Badge variant={usage.features.prioritySupport ? "default" : "secondary"} className="text-xs">
                {usage.features.prioritySupport ? "Active" : "Locked"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 