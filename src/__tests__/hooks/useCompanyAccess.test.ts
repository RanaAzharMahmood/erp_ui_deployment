/**
 * Tests for useCompanyAccess hook
 *
 * This file demonstrates testing custom React hooks using @testing-library/react's renderHook.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCompanyAccess, PERMISSION_MODULES } from '../../hooks/useCompanyAccess'
import type { ExtendedUserCompanyAccess } from '../../types/user-form.types'

// Sample test data
const mockCompanies = [
  { id: 1, name: 'Company A' },
  { id: 2, name: 'Company B' },
  { id: 3, name: 'Company C' },
]

const mockInitialAccess: ExtendedUserCompanyAccess[] = [
  {
    companyId: 1,
    companyName: 'Company A',
    roleId: 1,
    roleName: 'Admin',
    permissions: [],
    modulePermissions: {
      sales: ['View', 'Add'],
      purchase: ['View'],
    },
  },
]

describe('useCompanyAccess', () => {
  let mockOnError: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnError = vi.fn()
  })

  describe('initialization', () => {
    it('should initialize with empty access when no initial access provided', () => {
      const { result } = renderHook(() =>
        useCompanyAccess({
          companies: mockCompanies,
          onError: mockOnError,
        })
      )

      expect(result.current.extendedCompanyAccess).toEqual([])
      expect(result.current.selectedCompanyId).toBe('')
    })

    it('should initialize with provided initial access', () => {
      const { result } = renderHook(() =>
        useCompanyAccess({
          companies: mockCompanies,
          initialAccess: mockInitialAccess,
          onError: mockOnError,
        })
      )

      expect(result.current.extendedCompanyAccess).toEqual(mockInitialAccess)
    })

    it('should calculate available companies correctly', () => {
      const { result } = renderHook(() =>
        useCompanyAccess({
          companies: mockCompanies,
          initialAccess: mockInitialAccess,
          onError: mockOnError,
        })
      )

      // Company A is already added, so only B and C should be available
      expect(result.current.availableCompanies).toHaveLength(2)
      expect(result.current.availableCompanies.map((c) => c.id)).toEqual([2, 3])
    })
  })

  describe('handleAddCompany', () => {
    it('should add a new company when valid company is selected', () => {
      const { result } = renderHook(() =>
        useCompanyAccess({
          companies: mockCompanies,
          onError: mockOnError,
        })
      )

      // Select a company
      act(() => {
        result.current.setSelectedCompanyId(2)
      })

      expect(result.current.selectedCompanyId).toBe(2)

      // Add the company
      act(() => {
        result.current.handleAddCompany()
      })

      expect(result.current.extendedCompanyAccess).toHaveLength(1)
      expect(result.current.extendedCompanyAccess[0].companyId).toBe(2)
      expect(result.current.extendedCompanyAccess[0].companyName).toBe('Company B')
      expect(result.current.extendedCompanyAccess[0].roleName).toBe('Employee')
      expect(result.current.selectedCompanyId).toBe('') // Should reset after adding
    })

    it('should call onError when no company is selected', () => {
      const { result } = renderHook(() =>
        useCompanyAccess({
          companies: mockCompanies,
          onError: mockOnError,
        })
      )

      act(() => {
        result.current.handleAddCompany()
      })

      expect(mockOnError).toHaveBeenCalledWith('Please select a company')
      expect(result.current.extendedCompanyAccess).toHaveLength(0)
    })

    it('should call onError when company is already added', () => {
      const { result } = renderHook(() =>
        useCompanyAccess({
          companies: mockCompanies,
          initialAccess: mockInitialAccess,
          onError: mockOnError,
        })
      )

      // Try to add Company A which is already in initialAccess
      act(() => {
        result.current.setSelectedCompanyId(1)
      })

      act(() => {
        result.current.handleAddCompany()
      })

      expect(mockOnError).toHaveBeenCalledWith('Company already added')
    })
  })

  describe('handleRemoveCompany', () => {
    it('should remove a company from the access list', () => {
      const { result } = renderHook(() =>
        useCompanyAccess({
          companies: mockCompanies,
          initialAccess: mockInitialAccess,
          onError: mockOnError,
        })
      )

      expect(result.current.extendedCompanyAccess).toHaveLength(1)

      act(() => {
        result.current.handleRemoveCompany(1)
      })

      expect(result.current.extendedCompanyAccess).toHaveLength(0)
    })

    it('should not affect other companies when removing', () => {
      const multipleAccess: ExtendedUserCompanyAccess[] = [
        ...mockInitialAccess,
        {
          companyId: 2,
          companyName: 'Company B',
          roleId: 3,
          roleName: 'Employee',
          permissions: [],
          modulePermissions: {},
        },
      ]

      const { result } = renderHook(() =>
        useCompanyAccess({
          companies: mockCompanies,
          initialAccess: multipleAccess,
          onError: mockOnError,
        })
      )

      act(() => {
        result.current.handleRemoveCompany(1)
      })

      expect(result.current.extendedCompanyAccess).toHaveLength(1)
      expect(result.current.extendedCompanyAccess[0].companyId).toBe(2)
    })
  })

  describe('handleUpdateCompanyRole', () => {
    it('should update the role for a company', () => {
      const { result } = renderHook(() =>
        useCompanyAccess({
          companies: mockCompanies,
          initialAccess: mockInitialAccess,
          onError: mockOnError,
        })
      )

      act(() => {
        result.current.handleUpdateCompanyRole(1, 'Manager')
      })

      expect(result.current.extendedCompanyAccess[0].roleName).toBe('Manager')
      expect(result.current.extendedCompanyAccess[0].roleId).toBe(2)
    })

    it('should correctly map role names to role IDs', () => {
      const { result } = renderHook(() =>
        useCompanyAccess({
          companies: mockCompanies,
          initialAccess: mockInitialAccess,
          onError: mockOnError,
        })
      )

      const roleTests = [
        { name: 'Admin', expectedId: 1 },
        { name: 'Manager', expectedId: 2 },
        { name: 'Employee', expectedId: 3 },
        { name: 'Other', expectedId: 4 },
      ]

      for (const { name, expectedId } of roleTests) {
        act(() => {
          result.current.handleUpdateCompanyRole(1, name)
        })
        expect(result.current.extendedCompanyAccess[0].roleId).toBe(expectedId)
      }
    })
  })

  describe('handleTogglePermission', () => {
    it('should add a permission when not present', () => {
      const { result } = renderHook(() =>
        useCompanyAccess({
          companies: mockCompanies,
          initialAccess: mockInitialAccess,
          onError: mockOnError,
        })
      )

      // Add 'Edit' to sales module (which only has 'View' and 'Add')
      act(() => {
        result.current.handleTogglePermission(1, 'sales', 'Edit')
      })

      expect(result.current.extendedCompanyAccess[0].modulePermissions.sales).toContain('Edit')
      expect(result.current.extendedCompanyAccess[0].modulePermissions.sales).toHaveLength(3)
    })

    it('should remove a permission when already present', () => {
      const { result } = renderHook(() =>
        useCompanyAccess({
          companies: mockCompanies,
          initialAccess: mockInitialAccess,
          onError: mockOnError,
        })
      )

      // Remove 'View' from sales module
      act(() => {
        result.current.handleTogglePermission(1, 'sales', 'View')
      })

      expect(result.current.extendedCompanyAccess[0].modulePermissions.sales).not.toContain('View')
      expect(result.current.extendedCompanyAccess[0].modulePermissions.sales).toHaveLength(1)
    })
  })

  describe('handleSelectAll', () => {
    it('should select all permissions for a company when checked', () => {
      const { result } = renderHook(() =>
        useCompanyAccess({
          companies: mockCompanies,
          initialAccess: mockInitialAccess,
          onError: mockOnError,
        })
      )

      act(() => {
        result.current.handleSelectAll(1, true)
      })

      // Should have all permissions for all modules
      PERMISSION_MODULES.forEach((module) => {
        expect(result.current.extendedCompanyAccess[0].modulePermissions[module.id]).toEqual(
          module.permissions
        )
      })
    })

    it('should deselect all permissions for a company when unchecked', () => {
      const { result } = renderHook(() =>
        useCompanyAccess({
          companies: mockCompanies,
          initialAccess: mockInitialAccess,
          onError: mockOnError,
        })
      )

      act(() => {
        result.current.handleSelectAll(1, false)
      })

      // Should have no permissions for any module
      PERMISSION_MODULES.forEach((module) => {
        expect(result.current.extendedCompanyAccess[0].modulePermissions[module.id]).toEqual([])
      })
    })
  })

  describe('handleModuleToggle', () => {
    it('should select all permissions for a module when checked', () => {
      const { result } = renderHook(() =>
        useCompanyAccess({
          companies: mockCompanies,
          initialAccess: mockInitialAccess,
          onError: mockOnError,
        })
      )

      act(() => {
        result.current.handleModuleToggle(1, 'inventory', true)
      })

      expect(result.current.extendedCompanyAccess[0].modulePermissions.inventory).toEqual([
        'View',
        'Add',
        'Edit',
        'Delete',
      ])
    })

    it('should deselect all permissions for a module when unchecked', () => {
      const { result } = renderHook(() =>
        useCompanyAccess({
          companies: mockCompanies,
          initialAccess: mockInitialAccess,
          onError: mockOnError,
        })
      )

      act(() => {
        result.current.handleModuleToggle(1, 'sales', false)
      })

      expect(result.current.extendedCompanyAccess[0].modulePermissions.sales).toEqual([])
    })
  })

  describe('computed values', () => {
    it('should calculate totalPermissions correctly', () => {
      const { result } = renderHook(() =>
        useCompanyAccess({
          companies: mockCompanies,
          initialAccess: mockInitialAccess,
          onError: mockOnError,
        })
      )

      // Initial access has: sales (2) + purchase (1) = 3 permissions
      expect(result.current.totalPermissions).toBe(3)
    })

    it('should calculate uniqueRoles correctly', () => {
      const multipleAccess: ExtendedUserCompanyAccess[] = [
        ...mockInitialAccess,
        {
          companyId: 2,
          companyName: 'Company B',
          roleId: 1,
          roleName: 'Admin', // Same role as Company A
          permissions: [],
          modulePermissions: {},
        },
        {
          companyId: 3,
          companyName: 'Company C',
          roleId: 3,
          roleName: 'Employee',
          permissions: [],
          modulePermissions: {},
        },
      ]

      const { result } = renderHook(() =>
        useCompanyAccess({
          companies: mockCompanies,
          initialAccess: multipleAccess,
          onError: mockOnError,
        })
      )

      // 2 unique roles: Admin, Employee
      expect(result.current.uniqueRoles).toBe(2)
    })
  })

  describe('resetAccess', () => {
    it('should reset to initial access state', () => {
      const { result } = renderHook(() =>
        useCompanyAccess({
          companies: mockCompanies,
          initialAccess: mockInitialAccess,
          onError: mockOnError,
        })
      )

      // Make some changes
      act(() => {
        result.current.setSelectedCompanyId(2)
        result.current.handleAddCompany()
        result.current.handleTogglePermission(1, 'sales', 'Delete')
      })

      expect(result.current.extendedCompanyAccess).toHaveLength(2)

      // Reset
      act(() => {
        result.current.resetAccess()
      })

      expect(result.current.extendedCompanyAccess).toEqual(mockInitialAccess)
      expect(result.current.selectedCompanyId).toBe('')
    })
  })
})
