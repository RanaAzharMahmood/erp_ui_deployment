// Shared types for user form pages (AddUserPage, EditUserPage, etc.)

import type { UserCompanyAccess } from './common.types';

/**
 * Permission module structure for defining module-level permissions
 */
export interface PermissionModule {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
}

/**
 * Extended UserCompanyAccess with module-specific permissions
 * Used in user forms to manage granular permission assignments
 */
export interface ExtendedUserCompanyAccess extends UserCompanyAccess {
  modulePermissions: Record<string, string[]>;
}

/**
 * Permission modules available in the system
 * Each module has a set of standard CRUD permissions
 * Option C: Grouped Master Data approach
 */
export const PERMISSION_MODULES: PermissionModule[] = [
  // Core Transaction Modules
  {
    id: 'sales',
    name: 'Sales Module',
    permissions: ['View', 'Add', 'Edit', 'Delete'],
  },
  {
    id: 'purchase',
    name: 'Purchase Module',
    permissions: ['View', 'Add', 'Edit', 'Delete'],
  },
  {
    id: 'finance',
    name: 'Finance & Accounting',
    permissions: ['View', 'Add', 'Edit', 'Delete'],
  },
  {
    id: 'inventory',
    name: 'Inventory Module',
    permissions: ['View', 'Add', 'Edit', 'Delete'],
  },

  // Master Data: Vendors & Parties
  {
    id: 'vendors_parties',
    name: 'Vendors & Parties',
    permissions: ['View', 'Add', 'Edit', 'Delete'],
    description: 'Manage vendors, parties, and customers',
  },

  // Master Data: Finance Settings
  {
    id: 'finance_settings',
    name: 'Finance Master Data',
    permissions: ['View', 'Add', 'Edit', 'Delete'],
    description: 'Taxes, bank accounts, chart of accounts',
  },

  // Master Data: Sales Settings
  {
    id: 'sales_settings',
    name: 'Sales Master Data',
    permissions: ['View', 'Add', 'Edit', 'Delete'],
    description: 'Categories, products, items',
  },

  // Expenses & Payments
  {
    id: 'expenses',
    name: 'Expenses & Payments',
    permissions: ['View', 'Add', 'Edit', 'Delete'],
    description: 'Approve & Pay permissions are granted automatically to managers',
  },

];

/**
 * Props for the CompanyAccessCard component
 */
export interface CompanyAccessCardProps {
  access: ExtendedUserCompanyAccess;
  companies: Array<{ id: number; name: string }>;
  onRemove: () => void;
  onRoleChange: (role: string) => void;
  onPermissionToggle: (moduleId: string, permission: string) => void;
  onSelectAll: (checked: boolean) => void;
  onModuleToggle: (moduleId: string, checked: boolean) => void;
  isFirst?: boolean;
}

/**
 * Props for the ImageUploadSection component
 */
export interface ImageUploadSectionProps {
  imagePreview: string;
  onImageUpload: (file: File) => Promise<void>;
  onImageRemove: () => void;
}
