import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  CalendarDays,
  CreditCard,
  AlertTriangle,
  Zap,
  DatabaseIcon,
} from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";
import {
  useGetSubscriptionStatus,
  useGetUsageStatistics,
} from "@/hooks/useBilling";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useFeatureGating } from "@/hooks/useFeatureGating";
import {
  AIIcon,
  AnalyticsIcon,
  CrownIcon,
  CrownBillingIcon,
  MaxTaskIcon,
  MemberIcon,
  ProBillingIcon,
  TotalTaskIcon,
  TotalWorkspaceIcon,
  TimeIcon,
} from "../shared/svg/SharedIcons";

const planIcons = {
  free: Zap,
  pro: ProBillingIcon,
  team: CrownBillingIcon,
  enterprise: CrownBillingIcon,
};

const planColors = {
  free: "text-gray-500 dark:text-gray-400",
  pro: "text-blue-500 dark:text-blue-400",
  team: "text-indigo-500 dark:text-indigo-400",
  enterprise: "text-purple-500 dark:text-purple-400",
};

export const BillingOverview: React.FC = () => {
  const { data: subscription, isLoading } = useGetSubscriptionStatus();
  const { data: usageStats, isLoading: isLoadingUsage } =
    useGetUsageStatistics();
  const { currentPlan, canUseAnalytics, canUseTimeTracking, canUseAI } =
    useFeatureGating();
  const { isAdmin } = useSubscription();

  // Only show billing information to admins
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
              <p className="text-muted-foreground">
                Only team administrators can view billing and subscription information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getUsageColor = (current: number, limit: number | null) => {
    if (limit === null) return "text-green-600"; // Unlimited
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  const formatLimit = (limit: number | null) => {
    return limit === null ? "Unlimited" : limit.toString();
  };

  const getUsagePercentage = (current: number, limit: number | null) => {
    if (limit === null) return 0; // Unlimited shows as 0%
    return Math.min((current / limit) * 100, 100);
  };

  if (isLoading || isLoadingUsage) {
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

  if (!usageStats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500 dark:text-gray-400">
            Unable to load usage statistics
          </p>
        </CardContent>
      </Card>
    );
  }

  const PlanIcon = planIcons[currentPlan || "free"];

  return (
    <div className="space-y-6">
      {/* Trial Alert */}
      {subscription?.trialEnd &&
        new Date(subscription.trialEnd) > new Date() && (
          <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/50">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              Your free trial ends on{" "}
              {format(new Date(subscription.trialEnd), "MMM dd, yyyy")}. Upgrade
              your plan to continue using all features after the trial period.
            </AlertDescription>
          </Alert>
        )}

      {/* Plan Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  currentPlan === "pro"
                    ? "bg-blue-100 dark:bg-blue-900/30"
                    : currentPlan === "team"
                      ? "bg-indigo-100 dark:bg-indigo-900/30"
                      : currentPlan === "enterprise"
                        ? "bg-purple-100 dark:bg-purple-900/30"
                        : "bg-gray-100 dark:bg-gray-800"
                )}
              >
                <PlanIcon
                  className={cn("w-5 h-5", planColors[currentPlan || "free"])}
                />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  {currentPlan === "free"
                    ? "Free Trial"
                    : currentPlan === "pro"
                      ? "Professional"
                      : currentPlan === "team"
                        ? "Team"
                        : "Enterprise"}{" "}
                  Plan
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Current subscription and usage overview
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Usage Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Workspaces */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TotalWorkspaceIcon className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                  Projects
                </CardTitle>
              </div>
              {usageStats.usage.projects.limit !== null &&
                usageStats.usage.projects.current >=
                  usageStats.usage.projects.limit && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-2xl font-bold",
                    getUsageColor(
                      usageStats.usage.projects.current,
                      usageStats.usage.projects.limit
                    )
                  )}
                >
                  {usageStats.usage.projects.current}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  of {formatLimit(usageStats.usage.projects.limit)}
                </span>
              </div>
              {usageStats.usage.projects.limit !== null && (
                <Progress
                  value={getUsagePercentage(
                    usageStats.usage.projects.current,
                    usageStats.usage.projects.limit
                  )}
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
                <MemberIcon className="w-4 h-4 text-green-500 dark:text-green-400" />
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                  Team Members
                </CardTitle>
              </div>
              {usageStats.usage.teamMembers.limit !== null &&
                usageStats.usage.teamMembers.current >=
                  usageStats.usage.teamMembers.limit && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-2xl font-bold",
                    getUsageColor(
                      usageStats.usage.teamMembers.current,
                      usageStats.usage.teamMembers.limit
                    )
                  )}
                >
                  {usageStats.usage.teamMembers.current}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  of {formatLimit(usageStats.usage.teamMembers.limit)}
                </span>
              </div>
              {usageStats.usage.teamMembers.limit !== null && (
                <Progress
                  value={getUsagePercentage(
                    usageStats.usage.teamMembers.current,
                    usageStats.usage.teamMembers.limit
                  )}
                  className="h-2"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tasks per Workspace */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MaxTaskIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                  Max Cards/Workspace
                </CardTitle>
              </div>
              {usageStats.usage.cardsPerWorkspace?.limit !== null &&
                usageStats.usage.cardsPerWorkspace?.current >=
                  usageStats.usage.cardsPerWorkspace?.limit && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-2xl font-bold",
                    getUsageColor(
                      usageStats.usage.cardsPerWorkspace?.current || 0,
                      usageStats.usage.cardsPerWorkspace?.limit || null
                    )
                  )}
                >
                  {usageStats.usage.cardsPerWorkspace?.current || 0}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  of{" "}
                  {formatLimit(usageStats.usage.cardsPerWorkspace?.limit || null)}
                </span>
              </div>
              {usageStats.usage.cardsPerWorkspace?.limit !== null && (
                <Progress
                  value={getUsagePercentage(
                    usageStats.usage.cardsPerWorkspace?.current || 0,
                    usageStats.usage.cardsPerWorkspace?.limit || null
                  )}
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
                <DatabaseIcon className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                  Storage
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-2xl font-bold",
                    getUsageColor(
                      usageStats.usage.storageGB.current,
                      usageStats.usage.storageGB.limit
                    )
                  )}
                >
                  {usageStats.usage.storageGB.current}GB
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  of {formatLimit(usageStats.usage.storageGB.limit)}GB
                </span>
              </div>
              {usageStats.usage.storageGB.limit !== null && (
                <Progress
                  value={getUsagePercentage(
                    usageStats.usage.storageGB.current,
                    usageStats.usage.storageGB.limit
                  )}
                  className="h-2"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total Tasks */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TotalTaskIcon className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                  Total Tasks
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {usageStats.usage.totalCards?.current || 0}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  cards created
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Access */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white">
            Feature Access
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Features available with your current plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-2">
              <AnalyticsIcon
                className={cn(
                  "w-4 h-4",
                  canUseAnalytics ? "text-green-500" : "text-gray-400"
                )}
              />
              <span
                className={cn(
                  "text-sm",
                  canUseAnalytics
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-400"
                )}
              >
                Analytics
              </span>
              <Badge
                variant={canUseAnalytics ? "default" : "secondary"}
                className="text-xs"
              >
                {canUseAnalytics ? "Active" : "Locked"}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <TimeIcon
                className={cn(
                  "w-4 h-4",
                  canUseTimeTracking ? "text-green-500" : "text-gray-400"
                )}
              />
              <span
                className={cn(
                  "text-sm",
                  canUseTimeTracking
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-400"
                )}
              >
                Time Tracking
              </span>
              <Badge
                variant={canUseTimeTracking ? "default" : "secondary"}
                className="text-xs"
              >
                {canUseTimeTracking ? "Active" : "Locked"}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <AIIcon
                className={cn(
                  "w-4 h-4",
                  canUseAI ? "text-green-500" : "text-gray-400"
                )}
              />
              <span
                className={cn(
                  "text-sm",
                  canUseAI ? "text-gray-900 dark:text-white" : "text-gray-400"
                )}
              >
                AI Features
              </span>
              <Badge
                variant={canUseAI ? "default" : "secondary"}
                className="text-xs"
              >
                {canUseAI ? "Active" : "Locked"}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <CrownIcon
                className={cn(
                  "w-4 h-4",
                  usageStats.features?.prioritySupport
                    ? "text-green-500"
                    : "text-gray-400"
                )}
              />
              <span
                className={cn(
                  "text-sm",
                  usageStats.features?.prioritySupport
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-400"
                )}
              >
                Priority Support
              </span>
              <Badge
                variant={
                  usageStats.features?.prioritySupport ? "default" : "secondary"
                }
                className="text-xs"
              >
                {usageStats.features?.prioritySupport ? "Active" : "Locked"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Management */}
      {subscription &&
        subscription.plan !== "free" &&
        subscription.subscriptionId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Subscription Management</span>
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscription.currentPeriodEnd && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {subscription.cancelAtPeriodEnd
                        ? "Active Until"
                        : "Next Billing Date"}
                    </span>
                    <div className="flex items-center space-x-1">
                      <CalendarDays className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {format(
                          new Date(subscription.currentPeriodEnd),
                          "MMM dd, yyyy"
                        )}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={() => {
                    const portalUrl = `https://customer-portal.paddle.com/cpl_01jxaz0q9y721z5gf8xpgnxazy`;
                    window.open(portalUrl, "_blank");
                  }}
                  className="flex items-center space-x-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Manage Billing</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
};
