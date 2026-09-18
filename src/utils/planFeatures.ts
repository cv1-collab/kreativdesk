import { checkIsSuperAdmin } from '../config/admins';
export type PlanTier = 'Starter' | 'Pro' | 'Expert' | 'Studio' | 'Agency' | 'Enterprise' | 'Trial' | 'Free Trial';

export const PLAN_FEATURES: Record<string, { maxProjects: number; storageLimit: number; features: string[] }> = {
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
    features: ['2d_viewer', 'budget_tracking', 'meet_chat', 'document_hub', '3d_bim', 'ai_audit', 'mobile_app', 'invoice_studio', 'api_webhooks', 'custom_branding', 'branding'] 
  },
  Studio: {
    maxProjects: 9999,
    storageLimit: 250 * 1024 * 1024 * 1024,
    features: ['2d_viewer', 'budget_tracking', 'meet_chat', 'document_hub', '3d_bim', 'ai_audit', 'mobile_app', 'invoice_studio', 'api_webhooks', 'custom_branding', 'branding']
  },
  Agency: {
    maxProjects: 9999,
    storageLimit: 250 * 1024 * 1024 * 1024,
    features: ['2d_viewer', 'budget_tracking', 'meet_chat', 'document_hub', '3d_bim', 'ai_audit', 'mobile_app', 'invoice_studio', 'api_webhooks', 'custom_branding', 'branding']
  },
  Enterprise: {
    maxProjects: 9999,
    storageLimit: 250 * 1024 * 1024 * 1024,
    features: ['2d_viewer', 'budget_tracking', 'meet_chat', 'document_hub', '3d_bim', 'ai_audit', 'mobile_app', 'invoice_studio', 'api_webhooks', 'custom_branding', 'branding']
  }
};

export function hasFeature(user: any, featureId: string): boolean {
  if (!user) return false;
  
  // Super Admin override
  if (checkIsSuperAdmin(user.email)) return true;
  
  // Normalize feature identifier alias
  const normalizedFeature = featureId === 'branding' ? 'custom_branding' : featureId;

  // Determine effective plan: company plan takes precedence for workspace members and team members
  const plan = user.companyPlan || user.plan;
  if (!plan) return false;

  // Manual High-Ticket Plans & Trials have unlimited access to all features
  if (
    plan.includes('Trial') || 
    plan === 'Enterprise' || 
    plan === 'Studio' || 
    plan === 'Agency' || 
    plan === 'Expert'
  ) return true; 
  
  const mappedPlan = PLAN_FEATURES[plan as PlanTier];
  if (!mappedPlan) {
    // If plan string is 'Workspace Member' or user is team member, inherit access
    const role = (user.role || '').toLowerCase();
    if (role === 'employee' || role === 'management' || String(plan).toLowerCase().includes('workspace')) {
      return true;
    }
    return false;
  }

  return mappedPlan.features.includes(featureId) || mappedPlan.features.includes(normalizedFeature);
}
