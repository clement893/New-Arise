/**
 * usePermissions Hook
 * Gestion des permissions et rôles utilisateur
 */

import { useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export type Permission = string;
export type Role = string;

export interface PermissionConfig {
  permissions?: Permission[];
  roles?: Role[];
  requireAll?: boolean; // If true, user must have ALL permissions/roles
}

export interface UsePermissionsOptions {
  userRole?: Role;
  userPermissions?: Permission[];
}

export interface UsePermissionsReturn {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  hasAllRoles: (roles: Role[]) => boolean;
  canAccess: (config: PermissionConfig) => boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  userRole?: Role;
  userPermissions: Permission[];
}

// Default admin role
const ADMIN_ROLE = 'admin';

// Default super admin role with all permissions
const SUPER_ADMIN_ROLE = 'super_admin';

export function usePermissions(options?: UsePermissionsOptions): UsePermissionsReturn {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  // Get user role and permissions from session or options
  const userRole = useMemo(() => {
    if (options?.userRole) return options.userRole;
    if (session?.user?.role) return session.user.role as Role;
    return undefined;
  }, [session, options?.userRole]);

  const userPermissions = useMemo(() => {
    if (options?.userPermissions) return options.userPermissions;
    // In a real app, you might fetch permissions from the session or API
    // For now, we'll derive from role
    if (userRole === SUPER_ADMIN_ROLE || userRole === ADMIN_ROLE) {
      return ['*']; // All permissions
    }
    return [];
  }, [userRole, options?.userPermissions]);

  const isAdmin = useMemo(() => {
    return userRole === ADMIN_ROLE || userRole === SUPER_ADMIN_ROLE;
  }, [userRole]);

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!isAuthenticated) return false;
      if (isAdmin) return true; // Admins have all permissions
      if (userPermissions.includes('*')) return true; // Super admin
      return userPermissions.includes(permission);
    },
    [isAuthenticated, isAdmin, userPermissions]
  );

  const hasAnyPermission = useCallback(
    (permissions: Permission[]): boolean => {
      if (!isAuthenticated) return false;
      if (isAdmin) return true;
      if (userPermissions.includes('*')) return true;
      return permissions.some((perm) => userPermissions.includes(perm));
    },
    [isAuthenticated, isAdmin, userPermissions]
  );

  const hasAllPermissions = useCallback(
    (permissions: Permission[]): boolean => {
      if (!isAuthenticated) return false;
      if (isAdmin) return true;
      if (userPermissions.includes('*')) return true;
      return permissions.every((perm) => userPermissions.includes(perm));
    },
    [isAuthenticated, isAdmin, userPermissions]
  );

  const hasRole = useCallback(
    (role: Role): boolean => {
      if (!isAuthenticated) return false;
      return userRole === role;
    },
    [isAuthenticated, userRole]
  );

  const hasAnyRole = useCallback(
    (roles: Role[]): boolean => {
      if (!isAuthenticated) return false;
      if (!userRole) return false;
      return roles.includes(userRole);
    },
    [isAuthenticated, userRole]
  );

  const hasAllRoles = useCallback(
    (roles: Role[]): boolean => {
      if (!isAuthenticated) return false;
      // A user typically has one role, so this checks if user's role is in the list
      if (!userRole) return false;
      return roles.includes(userRole);
    },
    [isAuthenticated, userRole]
  );

  const canAccess = useCallback(
    (config: PermissionConfig): boolean => {
      if (!isAuthenticated) return false;

      const { permissions = [], roles = [], requireAll = false } = config;

      // Check roles first
      if (roles.length > 0) {
        const hasRequiredRole = requireAll
          ? hasAllRoles(roles)
          : hasAnyRole(roles);
        if (!hasRequiredRole) return false;
      }

      // Check permissions
      if (permissions.length > 0) {
        const hasRequiredPermissions = requireAll
          ? hasAllPermissions(permissions)
          : hasAnyPermission(permissions);
        if (!hasRequiredPermissions) return false;
      }

      return true;
    },
    [isAuthenticated, hasAnyRole, hasAllRoles, hasAnyPermission, hasAllPermissions]
  );

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    canAccess,
    isAdmin,
    isAuthenticated,
    userRole,
    userPermissions,
  };
}

