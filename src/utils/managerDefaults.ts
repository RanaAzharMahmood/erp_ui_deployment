/**
 * Manager Default Permissions
 * These permissions are automatically granted to all Manager roles
 * No UI indication - granted silently
 */

export const MANAGER_DEFAULT_PERMISSIONS = [
  // Dashboard & Reporting
  'view_dashboard',
  'view_reports',
  'view_activity_logs',

  // User Management (CRUD)
  'view_users',
  'create_users',
  'edit_users',
  'delete_users',

  // Approval Workflows - Expenses
  'view_expenses',
  'approve_expenses',
  'pay_expenses',

  // Approval Workflows - Purchase Returns
  'view_purchase_returns',
  'approve_purchase_returns',
  'complete_purchase_returns',

  // Approval Workflows - Sales Returns
  'view_sales_returns',
  'approve_sales_returns',
  'complete_sales_returns',
];

/**
 * Get manager default permissions as a set for easy checking
 */
export function getManagerDefaultPermissionSet(): Set<string> {
  return new Set(MANAGER_DEFAULT_PERMISSIONS);
}

/**
 * Check if a permission is a manager default
 */
export function isManagerDefaultPermission(permissionName: string): boolean {
  return MANAGER_DEFAULT_PERMISSIONS.includes(permissionName);
}

/**
 * Merge additional permissions with manager defaults
 * Ensures defaults are always included
 */
export function mergeWithManagerDefaults(additionalPermissions: string[]): string[] {
  const all = new Set([...MANAGER_DEFAULT_PERMISSIONS, ...additionalPermissions]);
  return Array.from(all).sort();
}

/**
 * Get only non-default permissions (for display purposes)
 */
export function getNonDefaultPermissions(permissions: string[]): string[] {
  const defaults = new Set(MANAGER_DEFAULT_PERMISSIONS);
  return permissions.filter(p => !defaults.has(p));
}
