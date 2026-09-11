import { useAuth } from '../contexts/AuthContext';
import { hasPermission as checkPermission, Permission, Role } from '../config/permissions';

export function usePermissions() {
  const { currentUser, userRole } = useAuth() || {};
  
  const hasPermission = (permission: Permission): boolean => {
    // Super admins, owners, management and Admin roles always have full permissions
    const normRole = (((currentUser?.role as string) || (userRole as string) || '')).toLowerCase();
    const isOwnerOrAdmin = normRole === 'super_admin' || normRole === 'owner' || normRole === 'admin' || normRole === 'management';
    
    if (isOwnerOrAdmin) return true;

    // Check specific user profile flag for finance permission
    if (permission === 'canViewFinance') {
      if (currentUser?.canViewFinance !== undefined) {
        return Boolean(currentUser.canViewFinance);
      }
    }
    
    return checkPermission(userRole as Role, permission);
  };

  return { hasPermission, role: userRole as Role };
}

