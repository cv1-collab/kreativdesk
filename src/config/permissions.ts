export type Role = 'super_admin' | 'owner' | 'management' | 'employee' | 'client' | 'guest';

export type Permission =
  // Company & Finance
  | 'canManageCompany' // Edit company settings, delete company
  | 'canViewFinance'   // View financial data, invoices, subscriptions
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
    'canManageCompany', 'canViewFinance', 'canEditBilling', 'canManageUsers',
    'canCreateProject', 'canDeleteProject', 'canViewAllProjects',
    'canUploadFiles', 'canDeleteFiles', 'canUseAI', 'canExportGLB',
    'canComment', 'canViewProjects'
  ],
  owner: [
    'canManageCompany', 'canViewFinance', 'canEditBilling', 'canManageUsers',
    'canCreateProject', 'canDeleteProject', 'canViewAllProjects',
    'canUploadFiles', 'canDeleteFiles', 'canUseAI', 'canExportGLB',
    'canComment', 'canViewProjects'
  ],
  management: [
    'canViewFinance',
    'canManageCompany',
    'canManageUsers',
    'canCreateProject', 'canDeleteProject', 'canViewAllProjects',
    'canUploadFiles', 'canDeleteFiles', 'canUseAI', 'canExportGLB',
    'canComment', 'canViewProjects'
  ],
  employee: [
    'canCreateProject',
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

/**
 * Helper to check if a role has a specific permission
 */
export const hasPermission = (role: Role | undefined | null, permission: Permission): boolean => {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
};
