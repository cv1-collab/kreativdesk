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
      normRole === 'geschaeftsleitung';
    
    if (isOwnerOrAdmin) return true;

    // ZERO LEAKAGE: External contractors (Field Guest), guests, clients, and partners MUST NEVER access finance or budgets
    const isExternalOrGuest = 
      effectiveRole === 'guest' || 
      effectiveRole === 'client' ||
      normRole.includes('guest') ||
      normRole.includes('extern') ||
      normRole.includes('partner') ||
      normRole.includes('contractor') ||
      normRole.includes('handwerker') ||
      normRole.includes('subcontractor');

    if (isExternalOrGuest) {
      if (
        permission === 'canViewFinance' || 
        permission === 'canViewProjectBudget' || 
        permission === 'canEditBilling' ||
        permission === 'canManageCompany' ||
        permission === 'canManageUsers'
      ) {
        return false;
      }
    }

    // Check specific user profile flag for finance permission (only for internal team members)
    if (permission === 'canViewFinance') {
      if (currentUser?.canViewFinance !== undefined) {
        return Boolean(currentUser.canViewFinance);
      }
    }
    
    return checkPermission(effectiveRole, permission);
  };

  return { hasPermission, role: effectiveRole };
}


