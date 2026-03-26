import { useFeatureAccess } from './useBilling';

export type PlanType = 'free' | 'pro' | 'team' | 'enterprise';
export type FeatureType = 'analytics' | 'timeTracking' | 'customFields' | 'aiFeatures' | 'prioritySupport';

// Feature requirements mapping
const FEATURE_REQUIREMENTS: Record<FeatureType, PlanType> = {
  analytics: 'pro',
  timeTracking: 'pro',
  customFields: 'pro',
  aiFeatures: 'pro',
  prioritySupport: 'team',
};

// Plan hierarchy for comparison
const PLAN_HIERARCHY: Record<PlanType, number> = {
  free: 0,
  pro: 1,
  team: 2,
  enterprise: 3,
};

export const useFeatureGating = () => {
  const {
    subscription,
    plans,
    getCurrentPlanLimits,
    isFreePlan,
    isProPlan,
    isTeamPlan,
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
  const getUpgradeMessage = (feature: FeatureType | 'projects' | 'members' | 'storage'): string => {
    const currentPlan = subscription?.plan?.toLowerCase();
    
    if (feature === 'projects') {
      if (currentPlan === 'enterprise') {
        return `You have unlimited projects.`;
      }
      if (currentPlan === 'team') {
        return `You've reached your project limit. Upgrade to Enterprise for unlimited projects and advanced features.`;
      }
      if (currentPlan === 'pro') {
        return `You've reached your project limit. Upgrade to Team for 25 projects or Enterprise for unlimited.`;
      }
      return `You've reached your project limit. Upgrade to Professional for 10 projects.`;
    }
    
    if (feature === 'members') {
      if (currentPlan === 'enterprise') {
        return `You have unlimited team members.`;
      }
      if (currentPlan === 'team') {
        return `You've reached your team member limit. Upgrade to Enterprise for unlimited team members.`;
      }
      if (currentPlan === 'pro') {
        return `You've reached your team member limit. Upgrade to Team for 250 members or Enterprise for unlimited.`;
      }
      return `You've reached your team member limit. Upgrade to Professional for 100 members.`;
    }
    
    if (feature === 'storage') {
      if (currentPlan === 'enterprise') {
        return `You have 100GB storage.`;
      }
      if (currentPlan === 'team') {
        return `You've reached your storage limit. Upgrade to Enterprise for 100GB storage.`;
      }
      if (currentPlan === 'pro') {
        return `You've reached your storage limit. Upgrade to Team for 50GB or Enterprise for 100GB.`;
      }
      return `You've reached your storage limit. Upgrade to Professional for 10GB storage.`;
    }
    
    const requiredPlan = FEATURE_REQUIREMENTS[feature as FeatureType];
    
    // If user is on free plan
    if (currentPlan === 'free' || !currentPlan) {
      const planName = requiredPlan === 'pro' ? 'Professional' : requiredPlan === 'team' ? 'Team' : 'Enterprise';
      return `This feature requires a ${planName} subscription. Upgrade to unlock ${feature}.`;
    }
    
    // If user is on pro plan and needs higher tier
    if (currentPlan === 'pro' && (requiredPlan === 'team' || requiredPlan === 'enterprise')) {
      const planName = requiredPlan === 'team' ? 'Team' : 'Enterprise';
      return `This feature requires a ${planName} subscription. Upgrade to unlock ${feature} and other advanced features.`;
    }
    
    // If user is on team plan and needs enterprise
    if (currentPlan === 'team' && requiredPlan === 'enterprise') {
      return `This feature requires an Enterprise subscription. Upgrade to unlock ${feature} and other advanced features.`;
    }
    
    // If user is on enterprise (shouldn't happen but fallback)
    if (currentPlan === 'enterprise') {
      return `Contact our sales team for custom solutions and additional features.`;
    }
    
    // Default fallback
    const planName = requiredPlan === 'pro' ? 'Professional' : requiredPlan === 'team' ? 'Team' : 'Enterprise';
    return `This feature requires a ${planName} subscription. Upgrade to unlock ${feature}.`;
  };

  // Check if user can create more of a resource type
  const canCreate = (resourceType: 'projects' | 'members', currentCount: number = 0) => {
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
  const getUsagePercentage = (type: 'projects' | 'members'): number => {
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

  // Get the appropriate upgrade action based on current plan
  const getUpgradeAction = () => {
    const currentPlan = subscription?.plan?.toLowerCase();
    
    switch (currentPlan) {
      case 'free':
        return {
          action: 'upgrade',
          target: 'pro',
          url: '/billing',
          text: 'Upgrade to Pro'
        };
      case 'pro':
        return {
          action: 'upgrade',
          target: 'team',
          url: '/billing',
          text: 'Upgrade to Team'
        };
      case 'team':
        return {
          action: 'upgrade',
          target: 'enterprise',
          url: '/billing',
          text: 'Upgrade to Enterprise'
        };
      case 'enterprise':
        return {
          action: 'contact',
          target: 'custom',
          url: 'mailto:support@pulseboard.co.in?subject=Enterprise%20Custom%20Solution%20Inquiry',
          text: 'Contact Sales'
        };
      default:
        return {
          action: 'upgrade',
          target: 'pro',
          url: '/billing',
          text: 'Upgrade to Pro'
        };
    }
  };

  return {
    // Plan info
    currentPlan: subscription?.plan as PlanType,
    isFreePlan,
    isProPlan,
    isTeamPlan,
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
    getUpgradeAction,
    isHigherPlan,
    
    // Raw data
    subscription,
    plans,
  };
}; 