import { useAuth } from '../contexts/AuthContext';
import { hasPermission as checkPermission, Permission, Role } from '../config/permissions';

export function usePermissions() {
  const { currentUser, userRole } = useAuth() || {};
  
  const hasPermission = (permission: Permission): boolean => {
    // Super admins and owners always have full permissions
    if (userRole === 'super_admin' || userRole === 'owner') return true;

    // Check specific user profile flag for finance permission
    if (permission === 'canViewFinance' && currentUser?.canViewFinance !== undefined) {
      return Boolean(currentUser.canViewFinance);
    }
    
    return checkPermission(userRole as Role, permission);
  };

  return { hasPermission, role: userRole as Role };
}

