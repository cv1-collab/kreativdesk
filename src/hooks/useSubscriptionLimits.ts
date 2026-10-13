import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

export type PlanName = 'Starter' | 'Pro' | 'Team Starter' | 'Expert' | 'Expert Trial' | 'Studio' | 'Agency' | 'Enterprise' | 'Free Trial';

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
    maxStorageGB: 15,
    maxSeats: 1, // Single user
    hasInvoicing: false,
    hasApiAccess: false,
    hasCustomBranding: false,
  },
  'Expert Trial': {
    maxProjects: -1,
    maxStorageGB: 250,
    maxSeats: 3,
    hasInvoicing: true,
    hasApiAccess: true,
    hasCustomBranding: true,
  },
  'Starter': {
    maxProjects: 3,
    maxStorageGB: 15,
    maxSeats: 1, // B2C Single user
    hasInvoicing: false,
    hasApiAccess: false,
    hasCustomBranding: false,
  },
  'Pro': {
    maxProjects: -1, // Unlimited
    maxStorageGB: 100,
    maxSeats: 1,
    hasInvoicing: false,
    hasApiAccess: false,
    hasCustomBranding: false,
  },
  'Team Starter': {
    maxProjects: -1,
    maxStorageGB: 250,
    maxSeats: 3,
    hasInvoicing: true,
    hasApiAccess: true,
    hasCustomBranding: true,
  },
  'Expert': {
    maxProjects: -1,
    maxStorageGB: 250,
    maxSeats: 3,
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
    maxSeats: 25,
    hasInvoicing: true,
    hasApiAccess: true,
    hasCustomBranding: true,
  }
};

export function useSubscriptionLimits() {
  const { currentUser } = useAuth();
  const rawPlan = currentUser?.companyPlan || currentUser?.plan || 'Free Trial';

  return useMemo(() => {
    let plan = rawPlan as PlanName;
    if (rawPlan === 'Expert Trial' || rawPlan.toLowerCase().includes('expert')) {
      plan = 'Expert Trial';
    } else if (rawPlan.includes('Trial')) {
      plan = 'Free Trial';
    } else if (rawPlan.toLowerCase().includes('enterprise')) {
      plan = 'Enterprise';
    } else if (rawPlan.includes('Workspace')) {
      plan = 'Pro';
    } else if (!PLAN_LIMITS[plan]) {
      plan = 'Free Trial';
    }
    
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS['Free Trial'];

    return { limits, currentPlan: plan };
  }, [rawPlan]);
}
