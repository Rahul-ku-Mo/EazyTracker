import React from "react";
import { useSubscription } from "../context/SubscriptionContext";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { Clock, CreditCard, X } from "lucide-react";

interface SubscriptionBannerProps {
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({
  dismissible = false,
  onDismiss,
  className = "",
}) => {
  const { isAccessRestricted, isTrialExpired } = useSubscription();
  const navigate = useNavigate();

  // Don't show banner if user has active subscription
  if (!isAccessRestricted && !isTrialExpired) {
    return null;
  }

  // Don't show on billing pages to avoid redundancy
  if (window.location.pathname.includes('/billing')) {
    return null;
  }

  const getAlertData = () => {
    if (isTrialExpired) {
      return {
        icon: Clock,
        variant: "destructive" as const,
        title: "Free Trial Expired",
        description: "Your 14-day free trial has ended. Choose a plan to continue using PulseBoard.",
        actionText: "Choose Plan",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-800",
        iconColor: "text-red-600",
      };
    }

    if (isAccessRestricted) {
      return {
        icon: CreditCard,
        variant: "destructive" as const,
        title: "Payment Past Due",
        description: "Your payment is overdue. Please update your payment method to restore full access.",
        actionText: "Update Payment",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200", 
        textColor: "text-orange-800",
        iconColor: "text-orange-600",
      };
    }

    return null;
  };

  const alertData = getAlertData();
  if (!alertData) return null;

  const { icon: IconComponent, title, description, actionText, bgColor, borderColor, textColor, iconColor } = alertData;

  return (
    <div className={`w-full ${className}`}>
      <Alert className={`${bgColor} ${borderColor} border-l-4 relative`}>
        <IconComponent className={`h-4 w-4 ${iconColor}`} />
        <AlertDescription className={textColor}>
          <div className="flex items-center justify-between w-full">
            <div className="flex-1">
              <div className="font-semibold text-sm mb-1">{title}</div>
              <div className="text-sm">{description}</div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button 
                onClick={() => navigate("/workspace/billing")}
                size="sm"
                variant={isTrialExpired ? "destructive" : "default"}
                className="whitespace-nowrap"
              >
                {actionText}
              </Button>
              {dismissible && onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="h-6 w-6 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SubscriptionBanner; 