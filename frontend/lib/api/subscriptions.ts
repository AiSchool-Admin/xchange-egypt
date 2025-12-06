import apiClient from './client';

// ============================================
// Subscriptions API
// ============================================

export type SubscriptionTier = 'FREE' | 'BASIC' | 'PROFESSIONAL' | 'BUSINESS' | 'ENTERPRISE';

export interface PlanFeature {
  name: string;
  nameAr: string;
  included: boolean;
  limit?: number;
}

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PlanFeature[];
  maxListings: number;
  maxImages: number;
  featuredListings: number;
  boostCredits: number;
  prioritySupport: boolean;
  analyticsAccess: boolean;
  apiAccess: boolean;
  customBranding: boolean;
  xcoinMultiplier: number;
  monthlyXcoin: number;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  plan: SubscriptionPlan;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  autoRenew: boolean;
  cancelAtPeriodEnd: boolean;
}

export interface PlansResponse {
  success: boolean;
  data: {
    plans: SubscriptionPlan[];
  };
}

// Get all plans
export const getPlans = async (): Promise<PlansResponse> => {
  const response = await apiClient.get('/subscriptions/plans');
  return response.data;
};

// Get my subscription
export const getMySubscription = async () => {
  const response = await apiClient.get('/subscriptions/my-subscription');
  return response.data;
};

// Subscribe to a plan
export const subscribe = async (planId: string, billingCycle: 'MONTHLY' | 'YEARLY') => {
  const response = await apiClient.post('/subscriptions/subscribe', {
    planId,
    billingCycle,
  });
  return response.data;
};

// Cancel subscription
export const cancelSubscription = async () => {
  const response = await apiClient.post('/subscriptions/cancel');
  return response.data;
};

// Resume subscription
export const resumeSubscription = async () => {
  const response = await apiClient.post('/subscriptions/resume');
  return response.data;
};

// Get subscription usage
export const getUsage = async () => {
  const response = await apiClient.get('/subscriptions/usage');
  return response.data;
};
