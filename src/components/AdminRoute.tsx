import { checkIsSuperAdmin } from '../config/admins';
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!checkIsSuperAdmin(currentUser.email)) {
    return <Navigate to="/app" />;
  }

  return <>{children}</>;
}
