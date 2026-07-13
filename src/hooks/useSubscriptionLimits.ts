import { useAuth } from '../contexts/AuthContext';

export type PlanName = 'Starter' | 'Pro' | 'Expert' | 'Studio' | 'Agency' | 'Enterprise' | 'Free Trial';

export interface SubscriptionLimits {
  maxProjects: number;      // -1 means unlimited
  maxStorageGB: number;
  maxSeats: number;
  hasInvoicing: boolean;
  hasApiAccess: boolean;
  hasCustomBranding: boolean;
}

export const PLAN_LIMITS: Record<PlanName, SubscriptionLimits> = {
  'Free Trial': {
    maxProjects: 3,
    maxStorageGB: 5,
    maxSeats: 3,
    hasInvoicing: false,
    hasApiAccess: false,
    hasCustomBranding: false,
  },
  'Starter': {
    maxProjects: 3,
    maxStorageGB: 5,
    maxSeats: 1, // B2C Single user
    hasInvoicing: false,
    hasApiAccess: false,
    hasCustomBranding: false,
  },
  'Pro': {
    maxProjects: -1, // Unlimited
    maxStorageGB: 50,
    maxSeats: 1,
    hasInvoicing: false,
    hasApiAccess: false,
    hasCustomBranding: false,
  },
  'Expert': {
    maxProjects: -1,
    maxStorageGB: 250,
    maxSeats: 1,
    hasInvoicing: true,
    hasApiAccess: true,
    hasCustomBranding: true,
  },
  'Studio': {
    maxProjects: -1,
    maxStorageGB: 500,
    maxSeats: 5,
    hasInvoicing: true,
    hasApiAccess: true,
    hasCustomBranding: true,
  },
  'Agency': {
    maxProjects: -1,
    maxStorageGB: 2000,
    maxSeats: 15,
    hasInvoicing: true,
    hasApiAccess: true,
    hasCustomBranding: true,
  },
  'Enterprise': {
    maxProjects: -1,
    maxStorageGB: -1, // Unlimited
    maxSeats: 30,
    hasInvoicing: true,
    hasApiAccess: true,
    hasCustomBranding: true,
  }
};

export function useSubscriptionLimits() {
  const { currentUser } = useAuth();
  const plan = (currentUser?.plan || 'Free Trial') as PlanName;
  
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS['Free Trial'];

  return { limits, currentPlan: plan };
}
