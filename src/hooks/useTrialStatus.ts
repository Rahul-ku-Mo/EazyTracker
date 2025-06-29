import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/apis/config';
import Cookies from 'js-cookie';

interface TrialStatus {
  onTrial: boolean;
  trialExpired: boolean;
  daysRemaining: number | null;
  hasActiveSubscription: boolean;
  accountCreated?: string;
}

export const useTrialStatus = () => {
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false);
  const [isTrialBannerDismissed, setIsTrialBannerDismissed] = useState(() => {
    // Check localStorage for dismissed banner
    return localStorage.getItem('trial-banner-dismissed') === 'true';
  });
  
  // Only run if user is authenticated (has accessToken)
  const isAuthenticated = !!Cookies.get('accessToken');

  const { data: trialStatus, isLoading, error } = useQuery<TrialStatus>({
    queryKey: ['trialStatus'],
    queryFn: async () => {
      const response = await apiClient.get('/auth/trial-status');
      return response.data;
    },
    enabled: isAuthenticated, // Only run when authenticated
    refetchInterval: isAuthenticated ? 5 * 60 * 1000 : false, // Check every 5 minutes only if authenticated
    retry: false,
  });

  // Show modal when trial expires
  useEffect(() => {
    if (trialStatus?.trialExpired && !trialStatus?.hasActiveSubscription) {
      // Show popup after a short delay to ensure page is loaded
      const timer = setTimeout(() => {
        setShowTrialExpiredModal(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [trialStatus]);

  // Reset banner dismissal when trial status changes significantly
  useEffect(() => {
    if (trialStatus?.hasActiveSubscription || trialStatus?.trialExpired) {
      localStorage.removeItem('trial-banner-dismissed');
      setIsTrialBannerDismissed(false);
    }
  }, [trialStatus?.hasActiveSubscription, trialStatus?.trialExpired]);

  const dismissTrialModal = () => {
    setShowTrialExpiredModal(false);
    // Set a flag in localStorage to not show again for this session
    localStorage.setItem('trialModalDismissed', 'true');
  };

  const dismissTrialBanner = useCallback(() => {
    localStorage.setItem('trial-banner-dismissed', 'true');
    setIsTrialBannerDismissed(true);
  }, []);

  const shouldShowTrialModal = () => {
    const dismissed = localStorage.getItem('trialModalDismissed');
    return showTrialExpiredModal && !dismissed;
  };

  return {
    trialStatus,
    isLoading,
    error,
    showTrialExpiredModal: shouldShowTrialModal(),
    dismissTrialModal,
    isTrialBannerDismissed,
    dismissTrialBanner,
    isTrialExpired: trialStatus?.trialExpired && !trialStatus?.hasActiveSubscription,
    daysRemaining: trialStatus?.daysRemaining || 0,
    onTrial: trialStatus?.onTrial || false,
  };
}; 