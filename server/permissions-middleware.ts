import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Extend Express Request to include user permissions
declare global {
  namespace Express {
    interface Request {
      userPermissions?: string[];
    }
  }
}

/**
 * Middleware to load user permissions into request
 */
export async function loadUserPermissions(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.isAuthenticated() && req.user) {
      const permissions = await storage.getUserPermissions(req.user.id);
      req.userPermissions = permissions.map(p => p.permission_name);
    } else {
      req.userPermissions = [];
    }
    next();
  } catch (error) {
    console.error("Error loading user permissions:", error);
    req.userPermissions = [];
    next();
  }
}

/**
 * Middleware to check if user has required permission
 */
export function requirePermission(permissionName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Admin users have all permissions
    if (req.user?.role?.toLowerCase() === 'admin' || req.user?.role?.toLowerCase() === 'administrator') {
      return next();
    }

    // Check if user has the required permission
    if (!req.userPermissions || !req.userPermissions.includes(permissionName)) {
      return res.status(403).json({
        error: "Permission denied",
        required: permissionName,
        message: `You don't have the '${permissionName}' permission to access this resource.`
      });
    }

    next();
  };
}

/**
 * Middleware to check if user has ANY of the required permissions
 */
export function requireAnyPermission(permissionNames: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Admin users have all permissions
    if (req.user?.role?.toLowerCase() === 'admin' || req.user?.role?.toLowerCase() === 'administrator') {
      return next();
    }

    // Check if user has any of the required permissions
    const hasPermission = permissionNames.some(perm =>
      req.userPermissions?.includes(perm)
    );

    if (!hasPermission) {
      return res.status(403).json({
        error: "Permission denied",
        required: permissionNames,
        message: `You need one of these permissions: ${permissionNames.join(', ')}`
      });
    }

    next();
  };
}

/**
 * Middleware to check if user has ALL required permissions
 */
export function requireAllPermissions(permissionNames: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Admin users have all permissions
    if (req.user?.role?.toLowerCase() === 'admin' || req.user?.role?.toLowerCase() === 'administrator') {
      return next();
    }

    // Check if user has all required permissions
    const hasAllPermissions = permissionNames.every(perm =>
      req.userPermissions?.includes(perm)
    );

    if (!hasAllPermissions) {
      const missingPermissions = permissionNames.filter(perm =>
        !req.userPermissions?.includes(perm)
      );

      return res.status(403).json({
        error: "Permission denied",
        required: permissionNames,
        missing: missingPermissions,
        message: `You're missing these permissions: ${missingPermissions.join(', ')}`
      });
    }

    next();
  };
}

/**
 * Middleware to require admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user?.role?.toLowerCase() !== 'admin' && req.user?.role?.toLowerCase() !== 'administrator') {
    return res.status(403).json({
      error: "Admin access required",
      message: "This action requires administrator privileges."
    });
  }

  next();
}
