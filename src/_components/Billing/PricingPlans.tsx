import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { useGetPlans, useCreateCheckoutSession, useGetSubscriptionStatus } from '@/hooks/useBilling';
import { Skeleton } from '@/components/ui/skeleton';

interface PricingPlansProps {
  showCurrentPlan?: boolean;
}

const planIcons = {
  free: Zap,
  pro: Sparkles,
  team: Crown,
  enterprise: Crown,
};

const planColors = {
  free: 'bg-gray-100 dark:bg-gray-800',
  pro: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800',
  team: 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 dark:from-purple-900/20 dark:to-pink-900/20 dark:border-purple-800',
  enterprise: 'bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 dark:from-purple-900/20 dark:to-violet-900/20 dark:border-purple-800',
};

export const PricingPlans: React.FC<PricingPlansProps> = ({ showCurrentPlan = true }) => {
  const { data: plans, isLoading } = useGetPlans();
  const { data: subscription } = useGetSubscriptionStatus();
  const createCheckoutSession = useCreateCheckoutSession();

  const handleUpgrade = async (plan: any) => {
    if (!plan.paddlePrice) {
      alert('This plan is not available for purchase yet.');
      return;
    }

    try {
      const response = await createCheckoutSession.mutateAsync({
        priceId: plan.paddlePrice,
        successUrl: `${window.location.origin}/billing?success=true`,
        cancelUrl: `${window.location.origin}/billing?canceled=true`,
      });

      // Redirect to Paddle checkout
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="relative">
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-20" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!plans) return null;

  const currentPlan = subscription?.plan || 'free';

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => {
        const Icon = planIcons[plan.id as keyof typeof planIcons] || Zap;
        const isCurrentPlan = currentPlan === plan.id;
        const isPro = plan.id === 'pro';
        const isEnterprise = plan.id === 'enterprise';

        return (
          <Card
            key={plan.id}
            className={`relative ${planColors[plan.id as keyof typeof planColors]} ${
              isCurrentPlan 
                ? 'ring-2 ring-green-500 shadow-lg scale-105 bg-green-50/50 dark:bg-green-900/10' 
                : isPro 
                ? 'ring-2 ring-blue-500 shadow-lg' 
                : isEnterprise
                ? 'ring-2 ring-purple-500 shadow-lg'
                : ''
            }`}
          >
            {isPro && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-3 py-1">Most Popular</Badge>
              </div>
            )}

            {isEnterprise && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-500 text-white px-3 py-1">Premium</Badge>
              </div>
            )}

            {showCurrentPlan && isCurrentPlan && (
              <div className="absolute -top-3 right-4">
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  Current Plan
                </Badge>
              </div>
            )}

            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-xl text-gray-900 dark:text-white">{plan.name}</CardTitle>
              </div>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                {plan.description}
              </CardDescription>
              <div className="mt-4">
                <div className="flex items-baseline justify-center space-x-1">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {plan.price === 0 ? 'Free' : formatPrice(plan.price, plan.currency)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">/{plan.interval}</span>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Limits display */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Plan Limits</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <div>
                    Projects: {plan.limits.projects === -1 ? 'Unlimited' : plan.limits.projects}
                  </div>
                  <div>
                    Members: {plan.limits.members === -1 ? 'Unlimited' : plan.limits.members}
                  </div>
                  <div>
                    Tasks: {plan.limits.tasksPerProject === -1 ? 'Unlimited' : plan.limits.tasksPerProject}
                  </div>
                  <div>
                    History: {plan.limits.activityHistoryDays} days
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              {isCurrentPlan ? (
                <Button variant="outline" className="w-full bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700" disabled>
                  Current Plan
                </Button>
              ) : plan.id === 'free' ? (
                <Button variant="outline" className="w-full" disabled>
                  Always Free
                </Button>
              ) : (
                <Button
                  className={`w-full ${
                    isPro 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : isEnterprise
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : ''
                  }`}
                  onClick={() => handleUpgrade(plan)}
                  disabled={createCheckoutSession.isPending}
                  variant={isPro || isEnterprise ? 'default' : 'outline'}
                >
                  {createCheckoutSession.isPending ? 'Processing...' : `Upgrade to ${plan.name}`}
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}; 