import React from "react";
import { useSubscription } from "../context/SubscriptionContext";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CreditCard, Clock } from "lucide-react";

interface AccessControlGuardProps {
  children: React.ReactNode;
  feature?: string; // Optional feature name for granular control
  fallback?: React.ReactNode; // Custom fallback component
  showAlert?: boolean; // Whether to show restriction alert
}

const AccessControlGuard: React.FC<AccessControlGuardProps> = ({
  children,
  feature,
  fallback,
  showAlert = true,
}) => {
  const { isAccessRestricted, isTrialExpired, canAccessFeature, isLoading } = useSubscription();
  const navigate = useNavigate();

  // Show loading state while fetching subscription
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check feature-specific access if feature is specified
  if (feature && !canAccessFeature(feature)) {
    if (fallback) return <>{fallback}</>;
    
    return showAlert ? (
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          This feature requires a paid plan. 
          <Button 
            variant="link" 
            className="p-0 h-auto text-orange-600 underline ml-1"
            onClick={() => navigate("/workspace/billing")}
          >
            Upgrade now
          </Button>
        </AlertDescription>
      </Alert>
    ) : null;
  }

  // Check general access restrictions
  if (isAccessRestricted || isTrialExpired) {
    if (fallback) return <>{fallback}</>;

    const icon = isTrialExpired ? Clock : CreditCard;
    const IconComponent = icon;
    const title = isTrialExpired ? "Trial Expired" : "Payment Past Due";
    const description = isTrialExpired 
      ? "Your free trial has expired. Please choose a plan to continue using PulseBoard."
      : "Your payment is past due. Please update your payment method to restore access.";

    return showAlert ? (
      <div className="max-w-md mx-auto mt-8">
        <Alert className="border-red-200 bg-red-50">
          <IconComponent className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-semibold mb-1">{title}</div>
            <div className="text-sm mb-3">{description}</div>
            <Button 
              onClick={() => navigate("/workspace/billing")}
              className="bg-red-600 hover:bg-red-700 text-white"
              size="sm"
            >
              {isTrialExpired ? "Choose Plan" : "Update Payment"}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    ) : null;
  }

  // If all checks pass, render children
  return <>{children}</>;
};

// Higher-order component version for wrapping entire components
export const withAccessControl = (
  WrappedComponent: React.ComponentType<any>,
  options?: Omit<AccessControlGuardProps, 'children'>
) => {
  return (props: any) => (
    <AccessControlGuard {...options}>
      <WrappedComponent {...props} />
    </AccessControlGuard>
  );
};

// Hook for manual access checking
export const useAccessControl = () => {
  const { subscription, isAccessRestricted, isTrialExpired, canAccessFeature } = useSubscription();
  
  return {
    hasAccess: !isAccessRestricted && !isTrialExpired,
    canUseFeature: canAccessFeature,
    subscription,
    isAccessRestricted,
    isTrialExpired,
  };
};

export default AccessControlGuard; 