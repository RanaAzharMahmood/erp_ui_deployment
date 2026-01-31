/**
 * Permission mapping utility
 * Maps frontend module permissions to backend permission IDs and vice versa
 */

// Backend permission IDs mapped by module and action
export const PERMISSION_MAP: Record<string, Record<string, number>> = {
  sales: {
    View: 21,
    Add: 22,
    Edit: 23,
    Delete: 24,
  },
  purchase: {
    View: 1,
    Add: 2,
    Edit: 3,
    Delete: 4,
  },
  finance: {
    View: 9,
    Add: 10,
    Edit: 11,
    Delete: 12,
  },
  inventory: {
    View: 5,
    Add: 6,
    Edit: 7,
    Delete: 8,
  },
};

// Reverse mapping: permission ID -> { module, action }
export const PERMISSION_ID_MAP: Record<number, { module: string; action: string }> = {
  21: { module: 'sales', action: 'View' },
  22: { module: 'sales', action: 'Add' },
  23: { module: 'sales', action: 'Edit' },
  24: { module: 'sales', action: 'Delete' },
  1: { module: 'purchase', action: 'View' },
  2: { module: 'purchase', action: 'Add' },
  3: { module: 'purchase', action: 'Edit' },
  4: { module: 'purchase', action: 'Delete' },
  9: { module: 'finance', action: 'View' },
  10: { module: 'finance', action: 'Add' },
  11: { module: 'finance', action: 'Edit' },
  12: { module: 'finance', action: 'Delete' },
  5: { module: 'inventory', action: 'View' },
  6: { module: 'inventory', action: 'Add' },
  7: { module: 'inventory', action: 'Edit' },
  8: { module: 'inventory', action: 'Delete' },
};

/**
 * Convert frontend module permissions to backend permission IDs
 * @param modulePermissions - Object with module IDs as keys and permission arrays as values
 * @returns Array of permission IDs
 */
export function modulePermissionsToIds(
  modulePermissions: Record<string, string[]>
): number[] {
  const permissionIds: number[] = [];

  for (const [moduleId, permissions] of Object.entries(modulePermissions)) {
    const moduleMap = PERMISSION_MAP[moduleId];
    if (!moduleMap) continue;

    for (const permission of permissions) {
      const permissionId = moduleMap[permission];
      if (permissionId !== undefined) {
        permissionIds.push(permissionId);
      }
    }
  }

  return permissionIds;
}

/**
 * Convert backend permission IDs to frontend module permissions
 * @param permissionIds - Array of permission IDs
 * @returns Object with module IDs as keys and permission arrays as values
 */
export function idsToModulePermissions(
  permissionIds: number[]
): Record<string, string[]> {
  const modulePermissions: Record<string, string[]> = {};

  for (const id of permissionIds) {
    const mapping = PERMISSION_ID_MAP[id];
    if (!mapping) continue;

    if (!modulePermissions[mapping.module]) {
      modulePermissions[mapping.module] = [];
    }
    modulePermissions[mapping.module].push(mapping.action);
  }

  return modulePermissions;
}

/**
 * Convert backend permission names to frontend module permissions
 * @param permissionNames - Array of permission objects with id and name
 * @returns Object with module IDs as keys and permission arrays as values
 */
export function permissionNamesToModulePermissions(
  permissions: Array<{ id: number; name: string }>
): Record<string, string[]> {
  const modulePermissions: Record<string, string[]> = {};

  for (const perm of permissions) {
    const mapping = PERMISSION_ID_MAP[perm.id];
    if (!mapping) continue;

    if (!modulePermissions[mapping.module]) {
      modulePermissions[mapping.module] = [];
    }
    modulePermissions[mapping.module].push(mapping.action);
  }

  return modulePermissions;
}

// All permission IDs for Manager/Admin roles
export const ALL_PERMISSION_IDS = Object.values(PERMISSION_MAP).flatMap(
  (module) => Object.values(module)
);

// Role name to ID mapping
export const ROLE_NAME_TO_ID: Record<string, number> = {
  Admin: 1,
  Manager: 2,
  User: 3,
  Employee: 4,
};

/**
 * Convert company access with module permissions to API format
 * @param companyAccess - Array of company access objects with modulePermissions, roleName, and roleId
 * @returns Array of { companyId, roleId, permissionIds } for API
 */
export function companyAccessToApiFormat(
  companyAccess: Array<{ companyId: number; roleId?: number; roleName?: string; modulePermissions: Record<string, string[]> }>
): Array<{ companyId: number; roleId?: number; permissionIds: number[] }> {
  return companyAccess.map((access) => {
    // Manager and Admin get all permissions
    const isManagerOrAdmin = access.roleName === 'Manager' || access.roleName === 'Admin';
    // Get roleId from access or from role name mapping
    const roleId = access.roleId || (access.roleName ? ROLE_NAME_TO_ID[access.roleName] : undefined);
    return {
      companyId: access.companyId,
      roleId,
      permissionIds: isManagerOrAdmin ? ALL_PERMISSION_IDS : modulePermissionsToIds(access.modulePermissions),
    };
  });
}

/**
 * Convert API companiesWithPermissions to frontend format
 * @param companiesWithPermissions - Array from API response
 * @returns Partial company access objects with modulePermissions
 */
export function apiToCompanyAccess(
  companiesWithPermissions: Array<{
    id: number;
    name: string;
    permissions: Array<{ id: number; name: string }>;
  }>
): Array<{ companyId: number; companyName: string; modulePermissions: Record<string, string[]> }> {
  return companiesWithPermissions.map((company) => ({
    companyId: company.id,
    companyName: company.name,
    modulePermissions: permissionNamesToModulePermissions(company.permissions),
  }));
}
