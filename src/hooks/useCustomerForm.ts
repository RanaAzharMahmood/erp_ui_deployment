import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SelectChangeEvent } from '@mui/material';
import {
  CustomerFormData,
  CustomerStatus,
  initialCustomerFormState,
  apiToFormData,
  formDataToApiRequest,
} from '../types/customer.types';
import { customerApi } from '../services/customerApi';

const CUSTOMER_LIST_PATH = '/customer';

interface UseCustomerFormOptions {
  customerId?: string;
}

export type CustomerFieldErrors = Record<string, string>;

interface UseCustomerFormReturn {
  formData: CustomerFormData;
  fieldErrors: CustomerFieldErrors;
  customerExists: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSelectChange: (e: SelectChangeEvent) => void;
  handleStatusChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => Promise<void>;
  handleDelete: () => Promise<void>;
  handleCancel: () => void;
  navigateToList: () => void;
}

export const useCustomerForm = (
  options: UseCustomerFormOptions = {}
): UseCustomerFormReturn => {
  const { customerId } = options;
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CustomerFormData>(initialCustomerFormState);
  const [fieldErrors, setFieldErrors] = useState<CustomerFieldErrors>({});
  const [customerExists, setCustomerExists] = useState(true);
  const [isLoading, setIsLoading] = useState(!!customerId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!customerId;

  // Load customer data if editing
  useEffect(() => {
    if (customerId) {
      const loadCustomer = async () => {
        setIsLoading(true);
        setError(null);

        try {
          const response = await customerApi.getCustomerById(Number(customerId));
          if (response.success && response.data) {
            setFormData(apiToFormData(response.data));
            setCustomerExists(true);
          } else {
            setCustomerExists(false);
          }
        } catch (err: unknown) {
          console.error('Error loading customer:', err);
          const errorMessage = err instanceof Error ? err.message : 'Failed to load customer';
          setError(errorMessage);
          setCustomerExists(false);
        } finally {
          setIsLoading(false);
        }
      };

      loadCustomer();
    }
  }, [customerId]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Clear field error when user starts typing
      setFieldErrors((prev) => {
        if (prev[name]) {
          const { [name]: _, ...rest } = prev;
          return rest;
        }
        return prev;
      });
    },
    []
  );

  const handleSelectChange = useCallback(
    (e: SelectChangeEvent) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Clear field error when user selects
      setFieldErrors((prev) => {
        if (prev[name]) {
          const { [name]: _, ...rest } = prev;
          return rest;
        }
        return prev;
      });
    },
    []
  );

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        status: e.target.value as CustomerStatus,
      }));
    },
    []
  );

  const validateForm = useCallback((): boolean => {
    const errors: CustomerFieldErrors = {};

    // Validate required fields
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email || !formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Invalid email format';
    }

    if (!formData.companyId) {
      errors.companyId = 'Company is required';
    }

    // Validate phone format (optional)
    if (formData.phone && formData.phone.trim()) {
      if (!/^\+?[\d\s\-()]+$/.test(formData.phone.trim())) {
        errors.phone = 'Invalid phone format';
      }
    }

    // Validate credit limit (optional)
    if (formData.creditLimit) {
      const creditLimit = Number(formData.creditLimit);
      if (isNaN(creditLimit) || creditLimit < 0) {
        errors.creditLimit = 'Credit limit must be a non-negative number';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return false;
    }

    setFieldErrors({});
    return true;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const apiData = formDataToApiRequest(formData);

      if (isEditMode && customerId) {
        // Update existing customer
        await customerApi.updateCustomer(Number(customerId), apiData);
      } else {
        // Create new customer
        await customerApi.createCustomer(apiData);
      }

      navigate(CUSTOMER_LIST_PATH);
    } catch (err: unknown) {
      console.error('Error saving customer:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save customer';
      setError(errorMessage);

      // Handle specific error messages from API
      if (errorMessage.toLowerCase().includes('email')) {
        setFieldErrors((prev) => ({ ...prev, email: errorMessage }));
      }
    } finally {
      setIsSaving(false);
    }
  }, [formData, isEditMode, customerId, navigate, validateForm]);

  const handleDelete = useCallback(async () => {
    if (!customerId) return;

    setIsSaving(true);
    setError(null);

    try {
      await customerApi.deleteCustomer(Number(customerId));
      navigate(CUSTOMER_LIST_PATH);
    } catch (err: unknown) {
      console.error('Error deleting customer:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete customer';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [customerId, navigate]);

  const handleCancel = useCallback(() => {
    navigate(CUSTOMER_LIST_PATH);
  }, [navigate]);

  const navigateToList = useCallback(() => {
    navigate(CUSTOMER_LIST_PATH);
  }, [navigate]);

  return {
    formData,
    fieldErrors,
    customerExists,
    isLoading,
    isSaving,
    error,
    handleInputChange,
    handleSelectChange,
    handleStatusChange,
    handleSubmit,
    handleDelete,
    handleCancel,
    navigateToList,
  };
};

export default useCustomerForm;
