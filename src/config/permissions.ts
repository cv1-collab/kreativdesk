export type Role = 'super_admin' | 'owner' | 'management' | 'employee' | 'client' | 'guest';

export type Permission =
  // Company & Finance
  | 'canManageCompany' // Edit company settings, delete company
  | 'canViewFinance'   // View company-wide financial data, invoices, subscriptions, company bank accounts
  | 'canViewProjectBudget' // View & manage project-specific BKP budgets and costs inside project workspace
  | 'canEditBilling'   // Change subscription, credit cards
  | 'canManageUsers'   // Invite/remove users in the company
  
  // Projects
  | 'canCreateProject'
  | 'canDeleteProject'
  | 'canViewAllProjects' // If false, only views assigned projects
  
  // Files & Features
  | 'canUploadFiles'
  | 'canDeleteFiles'
  | 'canUseAI'
  | 'canExportGLB'
  
  // Interaction
  | 'canComment'
  | 'canViewProjects'; // Basic read access to assigned/shared projects

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    'canManageCompany', 'canViewFinance', 'canViewProjectBudget', 'canEditBilling', 'canManageUsers',
    'canCreateProject', 'canDeleteProject', 'canViewAllProjects',
    'canUploadFiles', 'canDeleteFiles', 'canUseAI', 'canExportGLB',
    'canComment', 'canViewProjects'
  ],
  owner: [
    'canManageCompany', 'canViewFinance', 'canViewProjectBudget', 'canEditBilling', 'canManageUsers',
    'canCreateProject', 'canDeleteProject', 'canViewAllProjects',
    'canUploadFiles', 'canDeleteFiles', 'canUseAI', 'canExportGLB',
    'canComment', 'canViewProjects'
  ],
  management: [
    'canViewFinance',
    'canViewProjectBudget',
    'canManageCompany',
    'canManageUsers',
    'canCreateProject', 'canDeleteProject', 'canViewAllProjects',
    'canUploadFiles', 'canDeleteFiles', 'canUseAI', 'canExportGLB',
    'canComment', 'canViewProjects'
  ],
  employee: [
    'canCreateProject',
    'canViewProjectBudget',
    'canUploadFiles', 'canUseAI', 'canExportGLB', 'canDeleteFiles',
    'canComment', 'canViewProjects'
  ],
  client: [
    'canComment', 'canViewProjects'
  ],
  guest: [
    'canViewProjects'
  ]
};

export function normalizeRole(rawRole?: string | null): Role {
  if (!rawRole) return 'guest';
  const r = rawRole.toLowerCase().trim();
  if (r === 'super_admin' || r === 'superadmin') return 'super_admin';
  if (r === 'owner') return 'owner';
  if (r === 'management' || r === 'manager' || r === 'admin' || r === 'geschaeftsleitung') return 'management';
  if (r === 'project_lead' || r === 'lead' || r === 'employee' || r === 'internal' || r === 'editor' || r === 'member' || r === 'user' || r === 'team') return 'employee';
  if (r === 'client' || r === 'external') return 'client';
  if (r === 'guest' || r === 'viewer') return 'guest';
  return 'employee';
}

/**
 * Helper to check if a role has a specific permission
 */
export const hasPermission = (role: Role | string | undefined | null, permission: Permission): boolean => {
  if (!role) return false;
  const norm = normalizeRole(role);
  const permissions = ROLE_PERMISSIONS[norm];
  if (!permissions) return false;
  return permissions.includes(permission);
};

