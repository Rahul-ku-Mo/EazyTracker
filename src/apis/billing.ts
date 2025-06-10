import { apiClient } from './config';
import Cookies from 'js-cookie';
import axios from 'axios';

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  paddlePrice?: string;
  features: string[];
  limits: {
    projects: number;
    members: number;
    tasksPerProject: number;
    storageGB: number;
    activityHistoryDays: number;
  };
  popular: boolean;
}

export interface SubscriptionStatus {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  subscriptionId?: string;
  trialEnd?: string | null;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface BillingPortalResponse {
  url: string;
}

// Get available plans
export const getPlans = async (): Promise<Plan[]> => {
  const response = await apiClient.get('/billing/plans');
  return response.data;
};

// Get user's subscription status
export const getSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  const response = await apiClient.get('/billing/subscription');
  return response.data;
};

// Create checkout session for subscription
export const createCheckoutSession = async (data: {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<CheckoutSessionResponse> => {
  const response = await apiClient.post('/billing/create-checkout-session', data);
  return response.data;
};

// Create billing portal session
export const createBillingPortalSession = async (data: {
  returnUrl: string;
}): Promise<BillingPortalResponse> => {
  const response = await apiClient.post('/billing/create-portal-session', data);
  return response.data;
};

// Cancel subscription
export const cancelSubscription = async (): Promise<{ message: string; currentPeriodEnd: string }> => {
  const response = await apiClient.post('/billing/cancel-subscription');
  return response.data;
};

// Reactivate subscription
export const reactivateSubscription = async (): Promise<{ message: string; status: string }> => {
  const response = await apiClient.post('/billing/reactivate-subscription');
  return response.data;
};

export const getUsageStatistics = async (): Promise<any> => {
  try {
    const accessToken = Cookies.get('accessToken');
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/billing/usage-stats`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 200) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching usage statistics:', error);
    // For new applications, return empty statistics instead of failing
    return {
      members: { current: 0, limit: null },
      projects: { current: 0, limit: null },
      tasksPerProject: { current: 0, limit: null },
      storageUsed: { current: 0, limit: null },
    };
  }
}; 