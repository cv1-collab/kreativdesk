import { checkIsSuperAdmin } from '../config/admins';
export type PlanTier =
  | 'Starter'
  | 'Pro'
  | 'Team Starter'
  | 'Expert'
  | 'Studio'
  | 'Studio OS'
  | 'Agency'
  | 'Agency OS'
  | 'Enterprise'
  | 'Enterprise OS'
  | 'Trial'
  | 'Free Trial';

const FULL_FEATURES = [
  '2d_viewer',
  'budget_tracking',
  'meet_chat',
  'document_hub',
  '3d_bim',
  'ai_audit',
  'mobile_app',
  'invoice_studio',
  'api_webhooks',
  'custom_branding',
  'branding',
  'controlling',
  'rbac',
  'bexioIntegration'
];

export const PLAN_FEATURES: Record<string, { maxProjects: number; storageLimit: number; features: string[] }> = {
  Starter: {
    maxProjects: 3,
    storageLimit: 15 * 1024 * 1024 * 1024, // 15 GB
    features: ['2d_viewer', 'budget_tracking', 'meet_chat', 'document_hub']
  },
  Pro: {
    maxProjects: 9999, // Unlimited
    storageLimit: 100 * 1024 * 1024 * 1024, // 100 GB
    features: ['2d_viewer', 'budget_tracking', 'meet_chat', 'document_hub', '3d_bim', 'ai_audit', 'mobile_app', 'bexioIntegration']
  },
  'Team Starter': {
    maxProjects: 9999,
    storageLimit: 250 * 1024 * 1024 * 1024, // 250 GB
    features: FULL_FEATURES
  },
  Expert: {
    maxProjects: 9999,
    storageLimit: 250 * 1024 * 1024 * 1024, // 250 GB
    features: FULL_FEATURES
  },
  Studio: {
    maxProjects: 9999,
    storageLimit: 500 * 1024 * 1024 * 1024,
    features: FULL_FEATURES
  },
  'Studio OS': {
    maxProjects: 9999,
    storageLimit: 500 * 1024 * 1024 * 1024,
    features: FULL_FEATURES
  },
  Agency: {
    maxProjects: 9999,
    storageLimit: 2000 * 1024 * 1024 * 1024,
    features: FULL_FEATURES
  },
  'Agency OS': {
    maxProjects: 9999,
    storageLimit: 2000 * 1024 * 1024 * 1024,
    features: FULL_FEATURES
  },
  Enterprise: {
    maxProjects: 9999,
    storageLimit: 5000 * 1024 * 1024 * 1024,
    features: FULL_FEATURES
  },
  'Enterprise OS': {
    maxProjects: 9999,
    storageLimit: 5000 * 1024 * 1024 * 1024,
    features: FULL_FEATURES
  }
};

export function hasFeature(user: any, featureId: string): boolean {
  if (!user) return false;

  // Super Admin override
  if (checkIsSuperAdmin(user.email)) return true;

  // Normalize feature identifier alias
  const normalizedFeature = featureId === 'branding' ? 'custom_branding' : featureId;

  // Determine effective plan: company plan takes precedence for workspace members and team members
  const plan = String(user.companyPlan || user.plan || '');
  if (!plan) return false;

  const planLower = plan.toLowerCase();

  // Manual High-Ticket Plans & Trials have unlimited access to all features
  if (
    planLower.includes('trial') ||
    planLower.includes('enterprise') ||
    planLower.includes('studio') ||
    planLower.includes('agency') ||
    planLower.includes('team starter') ||
    planLower.includes('expert')
  ) {
    return true;
  }

  const matchedKey = Object.keys(PLAN_FEATURES).find(k => k.toLowerCase() === planLower);
  const mappedPlan = matchedKey ? PLAN_FEATURES[matchedKey] : PLAN_FEATURES[plan as PlanTier];
  if (!mappedPlan) {
    // If plan string is 'Workspace Member' or user is team member, inherit access
    const role = (user.role || '').toLowerCase();
    if (['admin', 'project_lead', 'projektleiter', 'employee', 'management'].includes(role) || planLower.includes('workspace')) {
      return true;
    }
    return false;
  }

  return mappedPlan.features.includes(featureId) || mappedPlan.features.includes(normalizedFeature);
}
