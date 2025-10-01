import { useAuth } from "./use-auth";

export type Permission = {
  id: number;
  permission_name: string;
  category: string;
  description: string | null;
};

/**
 * Hook to access user permissions
 */
export function usePermissions() {
  const { user } = useAuth();

  const permissions = (user as any)?.permissions || [];
  const permissionDetails = (user as any)?.permissionDetails || [];

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permissionName: string): boolean => {
    // Admins have all permissions
    if (user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'administrator') {
      return true;
    }

    return permissions.includes(permissionName);
  };

  /**
   * Check if user has ANY of the given permissions
   */
  const hasAnyPermission = (permissionNames: string[]): boolean => {
    // Admins have all permissions
    if (user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'administrator') {
      return true;
    }

    return permissionNames.some(perm => permissions.includes(perm));
  };

  /**
   * Check if user has ALL of the given permissions
   */
  const hasAllPermissions = (permissionNames: string[]): boolean => {
    // Admins have all permissions
    if (user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'administrator') {
      return true;
    }

    return permissionNames.every(perm => permissions.includes(perm));
  };

  /**
   * Check if user is admin
   */
  const isAdmin = (): boolean => {
    return user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'administrator';
  };

  /**
   * Get permissions by category
   */
  const getPermissionsByCategory = (category: string): Permission[] => {
    return permissionDetails.filter((p: Permission) => p.category === category);
  };

  return {
    permissions,
    permissionDetails,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    getPermissionsByCategory,
  };
}
