// Shared types for user form pages (AddUserPage, EditUserPage, etc.)

import type { UserCompanyAccess } from './common.types';

/**
 * Permission module structure for defining module-level permissions
 */
export interface PermissionModule {
  id: string;
  name: string;
  permissions: string[];
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
 */
export const PERMISSION_MODULES: PermissionModule[] = [
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
