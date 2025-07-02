import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { getSubscriptionStatus, SubscriptionStatus } from "../apis/billing";
import { AuthContext } from "./AuthContext";

interface SubscriptionContextType {
  subscription: SubscriptionStatus | null;
  isLoading: boolean;
  isAccessRestricted: boolean;
  isTrialExpired: boolean;
  canAccessFeature: (feature: string) => boolean;
  refetchSubscription: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType>({} as SubscriptionContextType);

// Define pages that are allowed even when access is restricted
const ALLOWED_PAGES_WHEN_RESTRICTED = [
  "/billing",
  "/account",
  "/auth",
  "/", // Landing page
];

// Define features that require paid access
const PAID_FEATURES = [
  "advanced_analytics",
  "team_collaboration",
  "unlimited_projects",
  "priority_support",
  "custom_integrations",
];

const SubscriptionContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, accessToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Fetch subscription status
  const {
    data: subscription,
    isLoading,
    refetch: refetchSubscription,
  } = useQuery({
    queryKey: ["subscription-status"],
    queryFn: getSubscriptionStatus,
    enabled: !!isLoggedIn && !!accessToken,
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Check if access is restricted
  const isAccessRestricted = subscription?.accessRestricted || false;
  const isTrialExpired = subscription?.trialExpired || false;

  // Handle access control and redirection
  useEffect(() => {
    if (!isLoggedIn || isLoading || !subscription) return;

    const currentPath = location.pathname;
    const isAllowedPage = ALLOWED_PAGES_WHEN_RESTRICTED.some(allowedPath => 
      currentPath.startsWith(allowedPath)
    );

    // If access is restricted and user is not on an allowed page, redirect to billing
    if ((isAccessRestricted || isTrialExpired) && !isAllowedPage && !hasRedirected) {
      console.log("🚫 Access restricted - redirecting to billing page");
      setHasRedirected(true);
      
      // Show notification about restricted access
      const reason = isTrialExpired ? "trial has expired" : "payment is past due";
      const message = `Access restricted: Your ${reason}. Please update your payment method.`;
      
      // You can replace this with your notification system
      if (window.confirm(`${message}\n\nRedirect to billing page?`)) {
        navigate("/billing", { 
          replace: true,
          state: { accessRestricted: true, reason: message }
        });
      }
    }

    // Reset redirect flag when access is restored
    if (!isAccessRestricted && !isTrialExpired && hasRedirected) {
      setHasRedirected(false);
    }
  }, [
    subscription,
    isLoading,
    isLoggedIn,
    location.pathname,
    navigate,
    isAccessRestricted,
    isTrialExpired,
    hasRedirected
  ]);

  // Check if user can access a specific feature
  const canAccessFeature = (feature: string): boolean => {
    if (!subscription) return false;
    
    // Free plan users can't access paid features
    if (subscription.plan === "free" && PAID_FEATURES.includes(feature)) {
      return false;
    }
    
    // If access is restricted, no paid features allowed
    if (isAccessRestricted || isTrialExpired) {
      return !PAID_FEATURES.includes(feature);
    }
    
    return true;
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription: subscription || null,
        isLoading,
        isAccessRestricted,
        isTrialExpired,
        canAccessFeature,
        refetchSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

// Custom hook to use subscription context
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionContextProvider");
  }
  return context;
};

export { SubscriptionContextProvider, SubscriptionContext }; 