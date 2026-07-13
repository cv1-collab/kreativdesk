import { useAuth } from '../contexts/AuthContext';
import { hasPermission as checkPermission, Permission, Role } from '../config/permissions';

export function usePermissions() {
  const { userRole } = useAuth();
  
  const hasPermission = (permission: Permission): boolean => {
    // If the role is super admin email, they can do anything
    // (Actual super admin check might also check email, but we rely on role here)
    if (userRole === 'super_admin') return true;
    
    return checkPermission(userRole as Role, permission);
  };

  return { hasPermission, role: userRole as Role };
}
