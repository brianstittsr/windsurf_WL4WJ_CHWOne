/**
 * RBAC Override
 * 
 * This file provides global overrides for RBAC functionality.
 * It ensures all permission and role checks return true.
 */

// Global flag to indicate RBAC is disabled
export const RBAC_DISABLED = true;

/**
 * Check if a user has a specific permission
 * Always returns true when RBAC is disabled
 */
export function hasPermission(user: any, permission: string): boolean {
  return true;
}

/**
 * Check if a user has a specific role
 * Always returns true when RBAC is disabled
 */
export function checkRole(user: any, role: string): boolean {
  return true;
}

/**
 * Get user's role
 * Always returns 'ADMIN' when RBAC is disabled
 */
export function getUserRole(user: any): string {
  return 'ADMIN';
}

/**
 * Check if user is approved
 * Always returns true when RBAC is disabled
 */
export function isUserApproved(user: any): boolean {
  return true;
}

/**
 * Get all permissions for a user
 * Returns wildcard permission when RBAC is disabled
 */
export function getUserPermissions(user: any): string[] {
  return ['*'];
}
