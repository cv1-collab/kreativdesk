import { checkIsSuperAdmin } from '../config/admins';
export type PlanTier = 'Starter' | 'Pro' | 'Expert' | 'Trial' | 'Free Trial';

export const PLAN_FEATURES = {
  Starter: {
    maxProjects: 3,
    storageLimit: 5 * 1024 * 1024 * 1024, // 5 GB
    features: ['2d_viewer', 'budget_tracking', 'meet_chat', 'document_hub'] 
  },
  Pro: {
    maxProjects: 9999, // Unlimited
    storageLimit: 50 * 1024 * 1024 * 1024, // 50 GB
    features: ['2d_viewer', 'budget_tracking', 'meet_chat', 'document_hub', '3d_bim', 'ai_audit', 'mobile_app'] 
  },
  Expert: {
    maxProjects: 9999,
    storageLimit: 250 * 1024 * 1024 * 1024, // 250 GB
    features: ['2d_viewer', 'budget_tracking', 'meet_chat', 'document_hub', '3d_bim', 'ai_audit', 'mobile_app', 'invoice_studio', 'api_webhooks', 'custom_branding'] 
  }
};

export function hasFeature(user: any, featureId: string): boolean {
  if (!user) return false;
  
  // Super Admin override
  if (checkIsSuperAdmin(user.email)) return true;
  
  const plan = user.plan;
  if (!plan) return false;

  // Manual High-Ticket Plans & Trials
  if (plan.includes('Trial') || plan === 'Enterprise' || plan === 'Studio' || plan === 'Agency') return true; 
  
  const mappedPlan = PLAN_FEATURES[plan as PlanTier];
  if (!mappedPlan) return false;
  return mappedPlan.features.includes(featureId);
}
