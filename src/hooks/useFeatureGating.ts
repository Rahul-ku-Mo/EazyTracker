import { useFeatureAccess } from './useBilling';

export type PlanType = 'free' | 'pro' | 'enterprise';
export type FeatureType = 'analytics' | 'timeTracking' | 'customFields' | 'aiFeatures' | 'prioritySupport';

// Feature requirements mapping
const FEATURE_REQUIREMENTS: Record<FeatureType, PlanType> = {
  analytics: 'pro',
  timeTracking: 'pro',
  customFields: 'pro',
  aiFeatures: 'pro',
  prioritySupport: 'enterprise',
};

// Plan hierarchy for comparison
const PLAN_HIERARCHY: Record<PlanType, number> = {
  free: 0,
  pro: 1,
  enterprise: 2,
};

export const useFeatureGating = () => {
  const {
    subscription,
    plans,
    getCurrentPlanLimits,
    isFreePlan,
    isProPlan,
    isEnterprisePlan,
  } = useFeatureAccess();

  // Check if user has access to a specific feature
  const hasFeature = (feature: FeatureType): boolean => {
    if (!subscription) return false;
    
    const requiredPlan = FEATURE_REQUIREMENTS[feature];
    const currentPlan = subscription.plan as PlanType;
    
    return PLAN_HIERARCHY[currentPlan] >= PLAN_HIERARCHY[requiredPlan];
  };

  // Get upgrade message for a feature or resource
  const getUpgradeMessage = (feature: FeatureType | 'projects' | 'teamMembers' | 'imageUploads'): string => {
    if (feature === 'projects') {
      return `You've reached your project limit. Upgrade to Professional for unlimited projects.`;
    }
    if (feature === 'teamMembers') {
      return `You've reached your team member limit. Upgrade to Professional for more team members.`;
    }
    if (feature === 'imageUploads') {
      return `You've reached your image upload limit. Upgrade to Professional for more uploads.`;
    }
    
    const requiredPlan = FEATURE_REQUIREMENTS[feature as FeatureType];
    const planName = requiredPlan === 'pro' ? 'Professional' : 'Enterprise';
    
    return `This feature requires a ${planName} subscription. Upgrade to unlock ${feature}.`;
  };

  // Check if user can create more of a resource type
  const canCreate = (resourceType: 'projects' | 'teamMembers', currentCount: number = 0) => {
    if (!limits) {
      return { canCreate: false, remaining: 0 };
    }
    
    const limit = limits[resourceType];
    
    // If limit is -1, it means unlimited
    if (limit === -1) {
      return { canCreate: true, remaining: -1 };
    }
    
    const remaining = Math.max(0, limit - currentCount);
    return {
      canCreate: remaining > 0,
      remaining
    };
  };

  // Get current plan limits
  const limits = getCurrentPlanLimits();

  // Get usage statistics (from the billing hook)
  const getUsagePercentage = (type: 'projects' | 'teamMembers'): number => {
    if (!limits) return 0;
    
    const limit = limits[type];
    if (limit === -1) return 0; // Unlimited
    
    // This would need to be populated from usage stats
    // For now, return 0 as placeholder
    return 0;
  };

  // Feature-specific checks
  const canUseAnalytics = hasFeature('analytics');
  const canUseTimeTracking = hasFeature('timeTracking');
  const canUseCustomFields = hasFeature('customFields');
  const canUseAI = hasFeature('aiFeatures');
  const hasPrioritySupport = hasFeature('prioritySupport');

  // Plan comparison helpers
  const isHigherPlan = (targetPlan: PlanType): boolean => {
    if (!subscription) return false;
    const currentPlan = subscription.plan as PlanType;
    return PLAN_HIERARCHY[currentPlan] >= PLAN_HIERARCHY[targetPlan];
  };

  const needsUpgrade = (feature: FeatureType): boolean => {
    return !hasFeature(feature);
  };

  return {
    // Plan info
    currentPlan: subscription?.plan as PlanType,
    isFreePlan,
    isProPlan,
    isEnterprisePlan,
    
    // Feature checks
    hasFeature,
    canUseAnalytics,
    canUseTimeTracking,
    canUseCustomFields,
    canUseAI,
    hasPrioritySupport,
    
    // Resource limits
    canCreate,
    limits,
    getUsagePercentage,
    
    // Upgrade helpers
    needsUpgrade,
    getUpgradeMessage,
    isHigherPlan,
    
    // Raw data
    subscription,
    plans,
  };
}; 