import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getPlans,
  getSubscriptionStatus,
  createCheckoutSession,
  createBillingPortalSession,
  cancelSubscription,
  reactivateSubscription,
  getUsageStatistics,
  type Plan,
  type SubscriptionStatus,
} from '../apis/billing';

// Query keys
export const BILLING_QUERY_KEYS = {
  PLANS: ['billing', 'plans'] as const,
  SUBSCRIPTION: ['billing', 'subscription'] as const,
  USAGE_STATS: ['billing', 'usage-stats'] as const,
};

// Hook to get available plans
export const useGetPlans = () => {
  return useQuery<Plan[]>({
    queryKey: BILLING_QUERY_KEYS.PLANS,
    queryFn: getPlans,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Hook to get subscription status
export const useGetSubscriptionStatus = () => {
  return useQuery<SubscriptionStatus>({
    queryKey: BILLING_QUERY_KEYS.SUBSCRIPTION,
    queryFn: getSubscriptionStatus,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Hook to get usage statistics
export const useGetUsageStatistics = () => {
  return useQuery({
    queryKey: BILLING_QUERY_KEYS.USAGE_STATS,
    queryFn: getUsageStatistics,
    staleTime: 1000 * 60 * 1, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when user comes back to tab
  });
};

// Hook to create checkout session
export const useCreateCheckoutSession = () => {
  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (data) => {
      // Redirect to payment checkout
      window.location.href = data.url;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create checkout session');
    },
  });
};

// Hook to create billing portal session
export const useCreateBillingPortalSession = () => {
  return useMutation({
    mutationFn: createBillingPortalSession,
    onSuccess: (data) => {
      // Redirect to billing portal
      window.location.href = data.url;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to access billing portal');
    },
  });
};

// Hook to cancel subscription
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: (data) => {
      toast.success(data.message);
      // Invalidate and refetch subscription status
      queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.SUBSCRIPTION });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to cancel subscription');
    },
  });
};

// Hook to reactivate subscription
export const useReactivateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactivateSubscription,
    onSuccess: (data) => {
      toast.success(data.message);
      // Invalidate and refetch subscription status
      queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.SUBSCRIPTION });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to reactivate subscription');
    },
  });
};

// Helper hook to check if user has access to a feature
export const useFeatureAccess = () => {
  const { data: subscription } = useGetSubscriptionStatus();
  const { data: plans } = useGetPlans();

  const checkFeatureAccess = (requiredPlan: 'free' | 'pro' | 'enterprise') => {
    if (!subscription || !plans) return false;

    const currentPlan = subscription.plan;
    const planHierarchy = ['free', 'pro', 'enterprise'];
    
    const currentPlanIndex = planHierarchy.indexOf(currentPlan);
    const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);
    
    return currentPlanIndex >= requiredPlanIndex;
  };

  const getCurrentPlanLimits = () => {
    if (!subscription || !plans) return null;

    const currentPlan = plans.find(plan => plan.id === subscription.plan);
    return currentPlan?.limits || null;
  };

  const isWithinLimits = (type: 'projects' | 'members' | 'tasksPerProject', current: number) => {
    const limits = getCurrentPlanLimits();
    if (!limits) return false;

    const limit = limits[type];
    return limit === -1 || current < limit; // -1 means unlimited
  };

  return {
    subscription,
    plans,
    checkFeatureAccess,
    getCurrentPlanLimits,
    isWithinLimits,
    isFreePlan: subscription?.plan === 'free',
    isProPlan: subscription?.plan === 'pro',
    isEnterprisePlan: subscription?.plan === 'enterprise',
  };
}; 