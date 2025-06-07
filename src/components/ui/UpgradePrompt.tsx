import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Crown, Sparkles, Zap, ArrowRight, Lock } from 'lucide-react';
import { useFeatureGating, FeatureType, PlanType } from '@/hooks/useFeatureGating';
import { cn } from '@/lib/utils';

interface UpgradePromptProps {
  feature: FeatureType;
  title?: string;
  description?: string;
  className?: string;
  variant?: 'card' | 'inline' | 'modal';
  showIcon?: boolean;
}

const planIcons = {
  free: Zap,
  pro: Sparkles,
  enterprise: Crown,
};

const planColors = {
  free: 'text-gray-500',
  pro: 'text-blue-500',
  enterprise: 'text-purple-500',
};

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  feature,
  title,
  description,
  className,
  variant = 'card',
  showIcon = true,
}) => {
  const { getUpgradeMessage, needsUpgrade } = useFeatureGating();

  // Don't show if user already has access
  if (!needsUpgrade(feature)) {
    return null;
  }

  const requiredPlan: PlanType = feature === 'prioritySupport' 
    ? 'enterprise' 
    : 'pro';

  const Icon = planIcons[requiredPlan];
  const upgradeMessage = getUpgradeMessage(feature);
  const planName = requiredPlan === 'pro' ? 'Professional' : 'Enterprise';

  if (variant === 'inline') {
    return (
      <div className={cn(
        "flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg",
        className
      )}>
        <div className="flex items-center space-x-3">
          {showIcon && <Lock className="w-4 h-4 text-blue-500" />}
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {title || `${planName} Feature`}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {description || upgradeMessage}
            </p>
          </div>
        </div>
        <Link to="/workspace/billing">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            Upgrade
          </Button>
        </Link>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div className={cn(
        "text-center p-6 bg-white dark:bg-gray-800 rounded-lg border",
        className
      )}>
        {showIcon && (
          <div className={cn(
            "w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center",
            requiredPlan === 'pro' 
              ? 'bg-blue-100 dark:bg-blue-900/30' 
              : 'bg-purple-100 dark:bg-purple-900/30'
          )}>
            <Icon className={cn(
              "w-6 h-6",
              planColors[requiredPlan]
            )} />
          </div>
        )}
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title || `Upgrade to ${planName}`}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {description || upgradeMessage}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/pricing">
            <Button variant="outline" className="w-full sm:w-auto">
              View Plans
            </Button>
          </Link>
          <Link to="/workspace/billing">
            <Button className={cn(
              "w-full sm:w-auto",
              requiredPlan === 'pro' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-purple-600 hover:bg-purple-700'
            )}>
              Upgrade Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <Card className={cn(
      "border-dashed border-2",
      requiredPlan === 'pro' 
        ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10' 
        : 'border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10',
      className
    )}>
      <CardHeader className="text-center pb-4">
        {showIcon && (
          <div className={cn(
            "w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center",
            requiredPlan === 'pro' 
              ? 'bg-blue-100 dark:bg-blue-900/30' 
              : 'bg-purple-100 dark:bg-purple-900/30'
          )}>
            <Icon className={cn(
              "w-6 h-6",
              planColors[requiredPlan]
            )} />
          </div>
        )}
        
        <div className="flex items-center justify-center mb-2">
          <Badge className={cn(
            "text-xs",
            requiredPlan === 'pro' 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
              : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
          )}>
            {planName} Required
          </Badge>
        </div>
        
        <CardTitle className="text-lg">
          {title || `Unlock ${feature.charAt(0).toUpperCase() + feature.slice(1)}`}
        </CardTitle>
        
        <CardDescription>
          {description || upgradeMessage}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/pricing" className="flex-1">
            <Button variant="outline" className="w-full">
              View Plans
            </Button>
          </Link>
          <Link to="/workspace/billing" className="flex-1">
            <Button className={cn(
              "w-full",
              requiredPlan === 'pro' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-purple-600 hover:bg-purple-700'
            )}>
              Upgrade Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}; 