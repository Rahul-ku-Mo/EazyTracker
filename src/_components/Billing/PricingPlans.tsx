import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { useGetSubscriptionStatus } from "@/hooks/useBilling";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePaddle } from "@/context/PaddleProvider";
import { CheckoutOpenOptions } from "@paddle/paddle-js";

const planIcons = {
  free: Zap,
  pro: Sparkles,
  business: Crown,
};



// Your actual PulseBoard pricing plans
const plans = [
  {
    id: "free",
    name: "Free Trial",
    description: "Perfect for trying out PulseBoard",
    price: 0,
    period: "month",
    features: [
      "5 workspaces",
      "15 team members",
      "100 tasks per workspace",
      "1GB storage",
      "Basic task management",
      "7-day activity history",
      "Community support",
      "14-day free trial",
    ],
    paddlePrice: null,
    isCurrentPlan: true,
  },
  {
    id: "pro",
    name: "Professional",
    description: "For growing teams and businesses",
    price: 9.99,
    period: "month",
    features: [
      "15 workspaces",
      "100 team members",
      "Unlimited tasks",
      "10GB storage",
      "Advanced task management",
      "Team collaboration features",
      "30-day activity history",
      "Priority email support",
      // "Advanced analytics",
      // "Custom workspace templates",
    ],
    paddlePrice: import.meta.env.VITE_PADDLE_PRICE_ID_PRO || "price_pro",
    isPopular: true,
  },
  {
    id: "business",
    name: "Business",
    description: "For larger teams with advanced needs",
    price: 29.99,
    period: "month",
    features: [
      "Unlimited workspaces",
      "Unlimited team members",
      "Unlimited tasks",
      "100GB storage",
      "Full feature access",
      "Advanced team collaboration",
      "Unlimited activity history",
      "24/7 phone & email support",
      // "Advanced analytics & reporting",
      // "Custom integrations",
      // "SSO & advanced security",
      // "Dedicated account manager",
    ],
    paddlePrice:
      import.meta.env.VITE_PADDLE_PRICE_ID_BUSINESS || "price_business",
  },
];

// Feature comparison data for PulseBoard
const featureComparisonData = [
  {
    feature: "Workspaces",
    free: "5 workspaces",
    pro: "15 workspaces",
    business: "Unlimited",
  },
  {
    feature: "Team Members",
    free: "15 members",
    pro: "100 members",
    business: "Unlimited",
  },
  {
    feature: "Tasks per Workspace",
    free: "100 tasks",
    pro: "Unlimited",
    business: "Unlimited",
  },
  {
    feature: "Storage",
    free: "1GB",
    pro: "10GB",
    business: "100GB",
  },
  {
    feature: "Activity History",
    free: "7 days",
    pro: "30 days",
    business: "Unlimited",
  },
  {
    feature: "Advanced Analytics",
    free: "-",
    pro: "Yes",
    business: "Yes",
  },
  {
    feature: "Time Tracking",
    free: "-",
    pro: "Yes",
    business: "Yes",
  },
  {
    feature: "AI Features",
    free: "-",
    pro: "Yes",
    business: "Yes",
  },
  {
    feature: "Custom Fields (Coming Soon)",
    free: "-",
    pro: "Yes",
    business: "Yes",
  },
  {
    feature: "Priority Support",
    free: "-",
    pro: "Email only",
    business: "24/7 Phone & Email",
  },
  {
    feature: "SSO & Security (Coming Soon)",
    free: "-",
    pro: "-",
    business: "Yes",
  },
  {
    feature: "Custom Integrations (Coming Soon)",
    free: "-",
    pro: "-",
    business: "Yes",
  },
];

export const PricingPlans: React.FC = () => {
  const { data: subscription, isLoading } = useGetSubscriptionStatus();
  const paddle = usePaddle();

  const handlePlanPurchase = async (plan: any) => {
    if (!plan.paddlePrice) {
      alert("This plan is not available for purchase yet.");
      return;
    }

    const checkoutPlanOptions: CheckoutOpenOptions = {
      items: [{ priceId: plan.paddlePrice, quantity: 1 }],
      settings: {
        displayMode: "overlay",
        variant: "one-page",
        theme: localStorage.getItem("vite-ui-theme") as "light" | "dark",
      },
      customer: {
        email: localStorage.getItem("email") as string,
      },
    };

    try {
      paddle?.Checkout.open(checkoutPlanOptions);
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      alert("Failed to start checkout. Please try again.");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="relative">
              <CardHeader>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const PlanIcon = planIcons[plan.id as keyof typeof planIcons];
          const isCurrentPlan =
            subscription?.plan === plan.id || plan.isCurrentPlan;

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative transition-all duration-200 hover:shadow-lg max-h-[500px]"
              )}
            >
              <CardHeader className="text-center pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <PlanIcon className="w-5 h-5" />
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                  </div>
                </div>

                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  {plan.description}
                </CardDescription>

                <div className="py-4">
                  <div className="text-3xl font-bold">
                    {plan.price === 0 ? "Free" : formatPrice(plan.price)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {plan.price === 0
                      ? "14-day trial included"
                      : `per user per ${plan.period}`}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current plan
                    </Button>
                  ) : plan.id === "free" ? (
                    <Button variant="outline" className="w-full" disabled>
                      Free Trial
                    </Button>
                  ) : (
                    <Button
                      className={cn(
                        "w-full",
                        plan.isPopular
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                      )}
                      onClick={() => handlePlanPurchase(plan)}
                    >
                      {plan.id === "pro"
                        ? "Upgrade to Pro"
                        : "Upgrade to Business"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Compare features by plan</CardTitle>
          <CardDescription>
            Easily compare features across all available plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Feature</th>
                  <th className="text-center py-3 px-4 font-medium">
                    Free Trial
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    Professional
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    Business
                  </th>
                </tr>
              </thead>
              <tbody>
                {featureComparisonData.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4 font-medium">{row.feature}</td>
                    <td className="py-3 px-4 text-center">
                      {row.free === "-" ? (
                        <span className="text-gray-400">—</span>
                      ) : row.free === "Yes" ? (
                        <Check className="w-4 h-4 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {row.free}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.pro === "-" ? (
                        <span className="text-gray-400">—</span>
                      ) : row.pro === "Yes" ? (
                        <Check className="w-4 h-4 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {row.pro}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.business === "-" ? (
                        <span className="text-gray-400">—</span>
                      ) : row.business === "Yes" ? (
                        <Check className="w-4 h-4 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {row.business}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
