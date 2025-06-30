import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Check, Crown, Sparkles, Zap, Info, ArrowUpCircle, ArrowDownCircle, Loader2 } from "lucide-react";
import { useGetPlans, useGetSubscriptionStatus, useUpdateSubscription, useCancelSubscription } from "@/hooks/useBilling";
import { Skeleton } from "@/components/ui/skeleton";
import { usePaddle } from "@/context/PaddleProvider";
import { CheckoutOpenOptions } from "@paddle/paddle-js";

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
  free: "bg-gray-100 dark:bg-gray-800",
  pro: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800",
  team: "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 dark:from-purple-900/20 dark:to-pink-900/20 dark:border-purple-800",
  enterprise:
    "bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 dark:from-purple-900/20 dark:to-violet-900/20 dark:border-purple-800",
};

export const PricingPlans: React.FC<PricingPlansProps> = ({
  showCurrentPlan = true,
}) => {
  const { data: plans, isLoading } = useGetPlans();
  const { data: subscription } = useGetSubscriptionStatus();
  const paddle = usePaddle();
  const updateSubscription = useUpdateSubscription();
  const cancelSubscription = useCancelSubscription();

  // Dialog state for confirmation
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    plan: any;
    actionType: string;
  }>({
    isOpen: false,
    plan: null,
    actionType: ''
  });

  // Plan hierarchy for determining upgrade/downgrade
  const planHierarchy = { free: 0, pro: 1, enterprise: 2 };

  const determineActionType = (currentPlan: string, targetPlan: string) => {
    const currentIndex = planHierarchy[currentPlan as keyof typeof planHierarchy] ?? 0;
    const targetIndex = planHierarchy[targetPlan as keyof typeof planHierarchy] ?? 0;
    
    if (targetIndex > currentIndex) return 'upgrade';
    if (targetIndex < currentIndex) return 'downgrade';
    return 'same';
  };

  const handlePlanChange = async (plan: any) => {
    if (!plan.paddlePrice) {
      alert("This plan is not available for purchase yet.");
      return;
    }

    const currentPlan = subscription?.plan || "free";
    const actionType = determineActionType(currentPlan, plan.id);
    const hasActiveSubscription = subscription && subscription.status && subscription.status !== "canceled" && currentPlan !== "free";

    // Prevent downgrade to free - users must cancel subscription instead
    if (hasActiveSubscription && plan.id === "free") {
      setConfirmDialog({
        isOpen: true,
        plan: plan,
        actionType: 'cancel'
      });
      return;
    }

    // For truly free users (no active subscription), use Paddle checkout
    if (!hasActiveSubscription && currentPlan === "free") {
      const checkoutPlanOptions: CheckoutOpenOptions = {
        items: [{ priceId: plan.paddlePrice, quantity: 1 }],
        settings: {
          displayMode: "overlay",
          variant: "one-page",
          theme: localStorage.getItem("vite-ui-theme") as "light" | "dark",
        },
        customer: {
          email: localStorage.getItem("email") as string,
        }
      };

      try {
        paddle?.Checkout.open(checkoutPlanOptions);
      } catch (error) {
        console.error("Failed to create checkout session:", error);
        alert("Failed to start checkout. Please try again.");
      }
      return;
    }

    // For existing paid subscriptions, show confirmation dialog for upgrades/downgrades
    setConfirmDialog({
      isOpen: true,
      plan: plan,
      actionType: actionType
    });
  };

  const handleConfirmPlanChange = async () => {
    if (!confirmDialog.plan) return;

    try {
      if (confirmDialog.actionType === 'cancel') {
        // Handle subscription cancellation
        await cancelSubscription.mutateAsync();
      } else {
        // Handle subscription update (upgrade/downgrade)
        await updateSubscription.mutateAsync({
          newPriceId: confirmDialog.plan.paddlePrice,
          prorationBillingMode: 'prorated_immediately'
        });
      }
      
      // Close dialog on success
      setConfirmDialog({ isOpen: false, plan: null, actionType: '' });
    } catch (error) {
      console.error("Failed to update subscription:", error);
      // Keep dialog open to show error state
    }
  };

  const getPriceChangeInfo = () => {
    if (!confirmDialog.plan || !subscription) return '';
    
    const currentPlan = plans?.find(p => p.id === subscription.plan);
    const targetPlan = confirmDialog.plan;
    
    if (!currentPlan || !subscription.currentPeriodStart || !subscription.currentPeriodEnd) return '';
    
    const now = new Date();
    const periodStart = new Date(subscription.currentPeriodStart);
    const periodEnd = new Date(subscription.currentPeriodEnd);
    
    // Calculate total billing period in milliseconds
    const totalPeriodMs = periodEnd.getTime() - periodStart.getTime();
    
    // Calculate remaining time in the current billing period
    const remainingTimeMs = Math.max(0, periodEnd.getTime() - now.getTime());
    
    // Calculate prorated percentage (how much of the billing period is left)
    const proratedPercentage = remainingTimeMs / totalPeriodMs;
    
    const currentPrice = currentPlan.price;
    const newPrice = targetPlan.price;
    const priceDiff = newPrice - currentPrice;
    
    // Calculate the prorated amount
    const proratedAmount = Math.abs(priceDiff) * proratedPercentage;
    
    // Calculate remaining days for better user understanding
    const remainingDays = Math.ceil(remainingTimeMs / (1000 * 60 * 60 * 24));
    
    if (confirmDialog.actionType === 'upgrade') {
      return `You'll be charged $${proratedAmount.toFixed(2)} prorated for the remaining ${remainingDays} days of your current billing cycle (${(proratedPercentage * 100).toFixed(1)}% of the $${priceDiff.toFixed(2)} price difference).`;
    } else {
      return `You'll receive a credit of $${proratedAmount.toFixed(2)} applied to your next billing cycle, calculated for the remaining ${remainingDays} days (${(proratedPercentage * 100).toFixed(1)}% of the $${Math.abs(priceDiff).toFixed(2)} price difference).`;
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
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

  const currentPlan = subscription?.plan || "free";

  return (
    <>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const Icon = planIcons[plan.id as keyof typeof planIcons] || Zap;
          const isCurrentPlan = currentPlan === plan.id;
          const isPro = plan.id === "pro";
          const isEnterprise = plan.id === "enterprise";
          const actionType = determineActionType(currentPlan, plan.id);

          return (
            <Card
              key={plan.id}
              className={`relative ${
                planColors[plan.id as keyof typeof planColors]
              } ${
                isCurrentPlan
                  ? "ring-2 ring-green-500 shadow-lg scale-105 bg-green-50/50 dark:bg-green-900/10"
                  : isPro
                  ? "ring-2 ring-blue-500 shadow-lg"
                  : isEnterprise
                  ? "ring-2 ring-purple-500 shadow-lg"
                  : ""
              }`}
            >
              {isPro && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              {isEnterprise && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white px-3 py-1">
                    Premium
                  </Badge>
                </div>
              )}

              {showCurrentPlan && isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  >
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    {plan.name}
                  </CardTitle>
                </div>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {plan.price === 0
                        ? "Free"
                        : formatPrice(plan.price, plan.currency)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        /{plan.interval}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Limits display */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Plan Limits
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <div>
                      Projects:{" "}
                      {plan.limits.projects === -1
                        ? "Unlimited"
                        : plan.limits.projects}
                    </div>
                    <div>
                      Members:{" "}
                      {plan.limits.members === -1
                        ? "Unlimited"
                        : plan.limits.members}
                    </div>
                    <div>
                      Tasks:{" "}
                      {plan.limits.tasksPerProject === -1
                        ? "Unlimited"
                        : plan.limits.tasksPerProject}
                    </div>
                    <div>History: {plan.limits.activityHistoryDays} days</div>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                {isCurrentPlan ? (
                  <Button
                    variant="outline"
                    className="w-full bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700"
                    disabled
                  >
                    Current Plan
                  </Button>
                ) : plan.id === "free" ? (
                  actionType === 'downgrade' ? (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handlePlanChange(plan)}
                      disabled={updateSubscription.isPending}
                    >
                      {updateSubscription.isPending ? "Processing..." : "Cancel Subscription"}
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      Always Free
                    </Button>
                  )
                ) : (
                  <Button
                    className={`w-full ${
                      isPro
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : isEnterprise
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : ""
                    }`}
                    onClick={() => handlePlanChange(plan)}
                    variant={isPro || isEnterprise ? "default" : "outline"}
                    disabled={updateSubscription.isPending}
                  >
                    {updateSubscription.isPending 
                      ? "Processing..." 
                      : `${actionType === 'upgrade' ? 'Upgrade' : actionType === 'downgrade' ? 'Downgrade' : 'Switch'} to ${plan.name}`
                    }
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && setConfirmDialog({ isOpen: false, plan: null, actionType: '' })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {confirmDialog.actionType === 'upgrade' ? (
                <ArrowUpCircle className="w-5 h-5 text-green-600" />
              ) : confirmDialog.actionType === 'cancel' ? (
                <ArrowDownCircle className="w-5 h-5 text-red-600" />
              ) : (
                <ArrowDownCircle className="w-5 h-5 text-orange-600" />
              )}
              <span>
                {confirmDialog.actionType === 'upgrade' 
                  ? 'Upgrade Plan' 
                  : confirmDialog.actionType === 'cancel' 
                  ? 'Cancel Subscription' 
                  : 'Downgrade Plan'
                }
              </span>
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.actionType === 'cancel' 
                ? 'You want to switch to the Free plan. This requires canceling your current subscription.'
                : `You're about to ${confirmDialog.actionType} to the ${confirmDialog.plan?.name} plan.`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>
                {confirmDialog.actionType === 'cancel' 
                  ? 'How cancellation works' 
                  : `How ${confirmDialog.actionType}s work`
                }
              </AlertTitle>
              <AlertDescription className="text-sm text-gray-600 dark:text-gray-400">
                {confirmDialog.actionType === 'cancel' ? (
                  <>
                    • Your subscription will be canceled at the end of the current billing period<br/>
                    • You'll retain access to paid features until then<br/>
                    • After cancellation, you'll automatically switch to the Free plan<br/>
                    • No refund will be issued for the remaining period
                  </>
                ) : confirmDialog.actionType === 'upgrade' ? (
                  <>
                    • Your new plan features will be available immediately<br/>
                    • You'll be charged prorated amount for the current billing period<br/>
                    • Next billing cycle will use the new plan pricing
                  </>
                ) : (
                  <>
                    • You'll keep current features until your billing period ends<br/>
                    • You'll receive credit applied to your next bill<br/>
                    • New plan limits will take effect at next billing cycle
                  </>
                )}
              </AlertDescription>
            </Alert>

            {confirmDialog.plan && confirmDialog.actionType !== 'cancel' && (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div className="text-sm">
                  <div className="font-medium text-gray-900 dark:text-white mb-1">
                    Billing Details:
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {getPriceChangeInfo()}
                  </div>
                </div>
              </div>
            )}

            {confirmDialog.actionType === 'cancel' && subscription && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <div className="text-sm">
                  <div className="font-medium text-red-900 dark:text-red-300 mb-1">
                    Cancellation Details:
                  </div>
                  <div className="text-red-700 dark:text-red-400">
                    Your subscription will remain active until {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'the end of your billing period'}.
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialog({ isOpen: false, plan: null, actionType: '' })}
              disabled={updateSubscription.isPending || cancelSubscription.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmPlanChange}
              disabled={updateSubscription.isPending || cancelSubscription.isPending}
              className={
                confirmDialog.actionType === 'cancel' 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : confirmDialog.actionType === 'upgrade' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-orange-600 hover:bg-orange-700'
              }
            >
              {(updateSubscription.isPending || cancelSubscription.isPending) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Confirm ${
                  confirmDialog.actionType === 'cancel' 
                    ? 'Cancellation' 
                    : confirmDialog.actionType === 'upgrade' 
                    ? 'Upgrade' 
                    : 'Downgrade'
                }`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
