/**
 * Permission mapping utility
 * Maps frontend module permissions to backend permission IDs and vice versa
 */

// Backend permission IDs mapped by module and action
// Note: These map frontend module selections to backend permission names
export const PERMISSION_MAP: Record<string, Record<string, string>> = {
  // Core Transaction Modules (mapped to invoice permissions)
  sales: {
    View: 'view_sales_invoices',
    Add: 'create_sales_invoices',
    Edit: 'edit_sales_invoices',
    Delete: 'delete_sales_invoices',
  },
  purchase: {
    View: 'view_purchase_invoices',
    Add: 'create_purchase_invoices',
    Edit: 'edit_purchase_invoices',
    Delete: 'delete_purchase_invoices',
  },
  finance: {
    View: 'view_journal_entries',
    Add: 'create_journal_entries',
    Edit: 'edit_journal_entries',
    Delete: 'delete_journal_entries',
  },
  inventory: {
    View: 'view_items',
    Add: 'create_items',  // Admin only
    Edit: 'edit_items',   // Admin only
    Delete: 'delete_items', // Admin only
  },

  // Master Data: Vendors & Parties
  vendors_parties: {
    View: 'view_vendors,party:read',  // Multiple permissions
    Add: 'create_vendors,party:create',
    Edit: 'edit_vendors,party:update',
    Delete: 'delete_vendors,party:delete',
  },

  // Master Data: Finance Settings (Taxes, Bank Accounts, CoA)
  finance_settings: {
    View: 'view_taxes,view_bank_accounts,view_chart_of_accounts',
    Add: 'create_taxes,create_bank_accounts,create_chart_of_accounts',
    Edit: 'edit_taxes,edit_bank_accounts,edit_chart_of_accounts',
    Delete: 'delete_taxes,delete_bank_accounts,delete_chart_of_accounts',
  },

  // Master Data: Sales Settings (Categories, Products)
  sales_settings: {
    View: 'view_categories,view_products',
    Add: 'create_categories,create_products', // Products = Admin only
    Edit: 'edit_categories,edit_products',
    Delete: 'delete_categories,delete_products',
  },

  // Expenses & Payments with Approval
  expenses: {
    View: 'view_expenses,view_other_payments',
    Add: 'create_expenses,create_other_payments',
    Edit: 'edit_expenses,edit_other_payments',
    Delete: 'delete_expenses,delete_other_payments',
    Approve: 'approve_expenses,approve_other_payments',
    Pay: 'pay_expenses,pay_other_payments',
  },

};

// Reverse mapping: permission name -> { module, action } (built from PERMISSION_MAP)
export const PERMISSION_NAME_REVERSE_MAP: Record<string, { module: string; action: string }> = (() => {
  const map: Record<string, { module: string; action: string }> = {};
  for (const [module, actions] of Object.entries(PERMISSION_MAP)) {
    for (const [action, nameStr] of Object.entries(actions)) {
      for (const name of nameStr.split(',').map((n) => n.trim())) {
        map[name] = { module, action };
      }
    }
  }
  return map;
})();

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
 * Convert frontend module permissions to backend permission names
 * @param modulePermissions - Object with module IDs as keys and permission arrays as values
 * @returns Array of permission names to send to backend
 */
export function modulePermissionsToNames(
  modulePermissions: Record<string, string[]>
): string[] {
  const permissionNames: string[] = [];

  for (const [moduleId, permissions] of Object.entries(modulePermissions)) {
    const moduleMap = PERMISSION_MAP[moduleId];
    if (!moduleMap) continue;

    for (const permission of permissions) {
      const backendNames = moduleMap[permission];
      if (backendNames) {
        // Split by comma in case multiple permissions map to one action
        const names = backendNames.split(',').map(n => n.trim());
        permissionNames.push(...names);
      }
    }
  }

  return permissionNames;
}

/**
 * Legacy: Convert frontend module permissions to backend permission IDs
 * @deprecated Use modulePermissionsToNames instead
 */
export function modulePermissionsToIds(
  _modulePermissions: Record<string, string[]>
): number[] {
  // For backward compatibility, return empty for now
  // Backend should use permission names instead of IDs
  return [];
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
    // Look up by name first (covers dynamically created permissions), fall back to ID
    const mapping = PERMISSION_NAME_REVERSE_MAP[perm.name] || PERMISSION_ID_MAP[perm.id];
    if (!mapping) continue;

    if (!modulePermissions[mapping.module]) {
      modulePermissions[mapping.module] = [];
    }
    if (!modulePermissions[mapping.module].includes(mapping.action)) {
      modulePermissions[mapping.module].push(mapping.action);
    }
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
 * @returns Array of { companyId, roleId, permissionNames } for API
 */
export function companyAccessToApiFormat(
  companyAccess: Array<{ companyId: number; roleId?: number; roleName?: string; modulePermissions: Record<string, string[]> }>
): Array<{ companyId: number; roleId?: number; permissionNames: string[] }> {
  return companyAccess.map((access) => {
    // Manager and Admin get all permissions
    const isManagerOrAdmin = access.roleName === 'Manager' || access.roleName === 'Admin';
    // Get roleId from access or from role name mapping
    const roleId = access.roleId || (access.roleName ? ROLE_NAME_TO_ID[access.roleName] : undefined);
    return {
      companyId: access.companyId,
      roleId,
      // Use permission names instead of IDs
      permissionNames: isManagerOrAdmin ? [] : modulePermissionsToNames(access.modulePermissions),
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
