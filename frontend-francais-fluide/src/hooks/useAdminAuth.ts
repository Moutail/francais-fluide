// src/hooks/useAdminAuth.ts
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export function useAdminAuth() {
  const { user, isAuthenticated, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(true);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const userRole = user.role;
      setIsAdmin(['admin', 'super_admin'].includes(userRole || ''));
      setIsSuperAdmin(userRole === 'super_admin');
      setCheckingPermissions(false);
    } else if (!loading) {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setCheckingPermissions(false);
    }
  }, [user, isAuthenticated, loading]);

  const redirectToAdmin = () => {
    window.location.href = '/admin';
  };

  const redirectToLogin = () => {
    window.location.href = '/auth/login';
  };

  return {
    isAdmin,
    isSuperAdmin,
    isAuthenticated,
    user,
    loading: loading || checkingPermissions,
    redirectToAdmin,
    redirectToLogin,
    hasAdminAccess: isAdmin,
    adminLevel: isSuperAdmin ? 'super_admin' : isAdmin ? 'admin' : 'none',
  };
}
