import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Check, Zap } from "lucide-react";
import { useGetSubscriptionStatus } from "@/hooks/useBilling";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePaddle } from "@/context/PaddleProvider";
import { CheckoutOpenOptions } from "@paddle/paddle-js";
import { CrownBillingIcon, ProBillingIcon, CheckIcon } from "../shared/svg/SharedIcons";

const planIcons = {
  free: Zap,
  pro: ProBillingIcon,
  team: CrownBillingIcon,
  enterprise: CrownBillingIcon,
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
      "2 projects",
      "5 workspaces per project",
      "15 team members",
      "100 cards per workspace",
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
      "10 projects",
      "15 workspaces per project",
      "100 team members",
      "Unlimited cards per workspace",
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
    id: "team",
    name: "Team",
    description: "For growing teams with scaling needs",
    price: 24.99,
    period: "month",
    features: [
      "25 projects",
      "30 workspaces per project",
      "250 team members",
      "Unlimited cards per workspace",
      "50GB storage",
      "Advanced task management",
      "Team collaboration features",
      "90-day activity history",
      "Priority email support",
      "Advanced analytics",
      "Time tracking",
      "AI Features",
    ],
    paddlePrice:
      import.meta.env.VITE_PADDLE_PRICE_ID_TEAM || "price_team",
    isPopular: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations with advanced needs",
    price: 99.99,
    period: "month",
    features: [
      "Unlimited projects",
      "Unlimited workspaces per project",
      "Unlimited team members",
      "Unlimited cards per workspace",
      "100GB storage",
      "Full feature access",
      "Advanced team collaboration",
      "Unlimited activity history",
      "24/7 phone & email support",
      "Advanced analytics & reporting",
      "Custom integrations (Coming Soon)",
      "SSO & advanced security (Coming Soon)",
    ],
    paddlePrice:
      import.meta.env.VITE_PADDLE_PRICE_ID_ENTERPRISE || "price_enterprise",
  },
];

// Feature comparison data for PulseBoard
const featureComparisonData = [
  {
    feature: "Projects",
    free: "2 projects",
    pro: "10 projects",
    team: "25 projects",
    enterprise: "Unlimited",
  },
  {
    feature: "Workspaces per Project",
    free: "5 workspaces",
    pro: "15 workspaces",
    team: "30 workspaces",
    enterprise: "Unlimited",
  },
  {
    feature: "Team Members",
    free: "15 members",
    pro: "100 members",
    team: "250 members",
    enterprise: "Unlimited",
  },
  {
    feature: "Cards per Workspace",
    free: "100 cards",
    pro: "Unlimited",
    team: "Unlimited",
    enterprise: "Unlimited",
  },
  {
    feature: "Storage",
    free: "1GB",
    pro: "10GB",
    team: "50GB",
    enterprise: "100GB",
  },
  {
    feature: "Activity History",
    free: "7 days",
    pro: "30 days",
    team: "90 days",
    enterprise: "Unlimited",
  },
  {
    feature: "Advanced Analytics",
    free: "-",
    pro: "Yes",
    team: "Yes",
    enterprise: "Yes",
  },
  {
    feature: "Time Tracking",
    free: "-",
    pro: "Yes",
    team: "Yes",
    enterprise: "Yes",
  },
  {
    feature: "AI Features",
    free: "-",
    pro: "Yes",
    team: "Yes",
    enterprise: "Yes",
  },
  {
    feature: "Custom Fields (Coming Soon)",
    free: "-",
    pro: "Yes",
    team: "Yes",
    enterprise: "Yes",
  },
  {
    feature: "Priority Support",
    free: "-",
    pro: "Email only",
    team: "Email Priority",
    enterprise: "24/7 Phone & Email",
  },
  {
    feature: "SSO & Security (Coming Soon)",
    free: "-",
    pro: "-",
    team: "-",
    enterprise: "Yes",
  },
  {
    feature: "Custom Integrations (Coming Soon)",
    free: "-",
    pro: "-",
    team: "-",
    enterprise: "Yes",
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const PlanIcon = planIcons[plan.id as keyof typeof planIcons];
          const isCurrentPlan =
            subscription?.plan === plan.id || plan.isCurrentPlan;

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative transition-all duration-200 hover:shadow-lg flex flex-col h-full"
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

              <CardContent className="space-y-4 flex-1 flex flex-col">
                <ul className="space-y-2 flex-1 overflow-y-auto max-h-[240px] pr-2">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start space-x-2 text-sm"
                    >
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="flex-1">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 mt-auto">
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
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                      )}
                      onClick={() => handlePlanPurchase(plan)}
                    >
                      {plan.id === "pro"
                        ? "Upgrade to Pro"
                        : plan.id === "team"
                          ? "Upgrade to Team"
                          : "Upgrade to Enterprise"}
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
                    Team
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {featureComparisonData.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4 font-medium !text-base">{row.feature}</td>
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
                        <CheckIcon className="w-4 h-4 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {row.pro}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.team === "-" ? (
                        <span className="text-gray-400">—</span>
                      ) : row.team === "Yes" ? (
                        <CheckIcon className="w-4 h-4 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {row.team}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row.enterprise === "-" ? (
                        <span className="text-gray-400">—</span>
                      ) : row.enterprise === "Yes" ? (
                        <CheckIcon className="w-4 h-4 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {row.enterprise}
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
