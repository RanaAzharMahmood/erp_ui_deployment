import { useState, useCallback, useEffect } from 'react';
import { PERMISSION_MODULES, type ExtendedUserCompanyAccess } from '../types/user-form.types';

// Re-export for convenience
export { PERMISSION_MODULES, type ExtendedUserCompanyAccess } from '../types/user-form.types';

export interface UseCompanyAccessOptions {
  companies: Array<{ id: number; name: string }>;
  initialAccess?: ExtendedUserCompanyAccess[];
  onError?: (message: string) => void;
}

export interface UseCompanyAccessReturn {
  extendedCompanyAccess: ExtendedUserCompanyAccess[];
  selectedCompanyId: number | '';
  setSelectedCompanyId: React.Dispatch<React.SetStateAction<number | ''>>;
  handleAddCompany: () => void;
  handleRemoveCompany: (companyId: number) => void;
  handleUpdateCompanyRole: (companyId: number, roleName: string) => void;
  handleTogglePermission: (companyId: number, moduleId: string, permission: string) => void;
  handleSelectAll: (companyId: number, checked: boolean) => void;
  handleModuleToggle: (companyId: number, moduleId: string, checked: boolean) => void;
  totalPermissions: number;
  uniqueRoles: number;
  availableCompanies: Array<{ id: number; name: string }>;
  resetAccess: () => void;
  setExtendedCompanyAccess: React.Dispatch<React.SetStateAction<ExtendedUserCompanyAccess[]>>;
}

/**
 * Custom hook to manage company access state for user forms.
 * Handles adding/removing companies, role updates, and permission management.
 */
export const useCompanyAccess = ({
  companies,
  initialAccess = [],
  onError,
}: UseCompanyAccessOptions): UseCompanyAccessReturn => {
  const [extendedCompanyAccess, setExtendedCompanyAccess] = useState<ExtendedUserCompanyAccess[]>(
    initialAccess
  );
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | ''>('');

  // Initialize with initialAccess when it changes (for edit mode)
  useEffect(() => {
    if (initialAccess.length > 0) {
      setExtendedCompanyAccess(initialAccess);
    }
  }, [initialAccess]);

  // Add company access
  const handleAddCompany = useCallback(() => {
    if (!selectedCompanyId) {
      onError?.('Please select a company');
      return;
    }

    // Check if company already added
    if (extendedCompanyAccess.some((access) => access.companyId === selectedCompanyId)) {
      onError?.('Company already added');
      return;
    }

    const company = companies.find((c) => c.id === selectedCompanyId);
    if (!company) return;

    const newAccess: ExtendedUserCompanyAccess = {
      companyId: selectedCompanyId,
      companyName: company.name,
      roleId: 4,
      roleName: 'Employee',
      permissions: [],
      modulePermissions: {},
    };

    setExtendedCompanyAccess((prev) => [...prev, newAccess]);
    setSelectedCompanyId('');
  }, [selectedCompanyId, companies, extendedCompanyAccess, onError]);

  // Remove company access
  const handleRemoveCompany = useCallback((companyId: number) => {
    setExtendedCompanyAccess((prev) =>
      prev.filter((access) => access.companyId !== companyId)
    );
  }, []);

  // Update company role
  const handleUpdateCompanyRole = useCallback((companyId: number, roleName: string) => {
    const roleId =
      roleName === 'Admin' ? 1 : roleName === 'Manager' ? 2 : roleName === 'Employee' ? 3 : 4;

    setExtendedCompanyAccess((prev) =>
      prev.map((access) =>
        access.companyId === companyId ? { ...access, roleId, roleName } : access
      )
    );
  }, []);

  // Toggle permission for company module
  const handleTogglePermission = useCallback(
    (companyId: number, moduleId: string, permission: string) => {
      setExtendedCompanyAccess((prev) =>
        prev.map((access) => {
          if (access.companyId !== companyId) return access;

          const currentModulePerms = access.modulePermissions[moduleId] || [];
          const hasPermission = currentModulePerms.includes(permission);

          return {
            ...access,
            modulePermissions: {
              ...access.modulePermissions,
              [moduleId]: hasPermission
                ? currentModulePerms.filter((p) => p !== permission)
                : [...currentModulePerms, permission],
            },
          };
        })
      );
    },
    []
  );

  // Select/deselect all permissions for a company
  const handleSelectAll = useCallback((companyId: number, checked: boolean) => {
    setExtendedCompanyAccess((prev) =>
      prev.map((access) => {
        if (access.companyId !== companyId) return access;

        const newModulePermissions: Record<string, string[]> = {};
        PERMISSION_MODULES.forEach((module) => {
          newModulePermissions[module.id] = checked ? [...module.permissions] : [];
        });

        return {
          ...access,
          modulePermissions: newModulePermissions,
        };
      })
    );
  }, []);

  // Toggle all permissions for a module
  const handleModuleToggle = useCallback(
    (companyId: number, moduleId: string, checked: boolean) => {
      setExtendedCompanyAccess((prev) =>
        prev.map((access) => {
          if (access.companyId !== companyId) return access;

          const module = PERMISSION_MODULES.find((m) => m.id === moduleId);
          if (!module) return access;

          return {
            ...access,
            modulePermissions: {
              ...access.modulePermissions,
              [moduleId]: checked ? [...module.permissions] : [],
            },
          };
        })
      );
    },
    []
  );

  // Calculate total permissions
  const totalPermissions = extendedCompanyAccess.reduce((sum, access) => {
    return (
      sum +
      Object.values(access.modulePermissions).reduce(
        (moduleSum, perms) => moduleSum + perms.length,
        0
      )
    );
  }, 0);

  // Calculate unique roles
  const uniqueRoles = new Set(extendedCompanyAccess.map((a) => a.roleName)).size;

  // Get available companies (not already added)
  const availableCompanies = companies.filter(
    (company) => !extendedCompanyAccess.some((access) => access.companyId === company.id)
  );

  // Reset access to initial state
  const resetAccess = useCallback(() => {
    setExtendedCompanyAccess(initialAccess);
    setSelectedCompanyId('');
  }, [initialAccess]);

  return {
    extendedCompanyAccess,
    selectedCompanyId,
    setSelectedCompanyId,
    handleAddCompany,
    handleRemoveCompany,
    handleUpdateCompanyRole,
    handleTogglePermission,
    handleSelectAll,
    handleModuleToggle,
    totalPermissions,
    uniqueRoles,
    availableCompanies,
    resetAccess,
    setExtendedCompanyAccess,
  };
};

export default useCompanyAccess;
