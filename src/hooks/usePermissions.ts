import { useAuth } from '../contexts/AuthContext';
import { hasPermission as checkPermission, normalizeRole, Permission, Role } from '../config/permissions';
import { checkIsSuperAdmin } from '../config/admins';

export function usePermissions() {
  const { currentUser, userRole } = useAuth() || {};
  
  const rawRole = (currentUser?.role as string) || (userRole as string) || '';
  const effectiveRole = normalizeRole(rawRole);

  const hasPermission = (permission: Permission): boolean => {
    // Super admins, owners, management, project_lead and Admin roles always have full permissions
    const normRole = rawRole.toLowerCase().trim();
    const isOwnerOrAdmin = checkIsSuperAdmin(currentUser?.email) ||
      normRole === 'super_admin' ||
      normRole === 'owner' ||
      normRole === 'admin' ||
      normRole === 'management' ||
      normRole === 'project_lead' ||
      normRole === 'lead';
    
    if (isOwnerOrAdmin) return true;

    // Check specific user profile flag for finance permission
    if (permission === 'canViewFinance') {
      if (currentUser?.canViewFinance !== undefined) {
        return Boolean(currentUser.canViewFinance);
      }
    }
    
    return checkPermission(effectiveRole, permission);
  };

  return { hasPermission, role: effectiveRole };
}


