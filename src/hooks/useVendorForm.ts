import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  VendorFormData,
  initialVendorFormState,
} from '../components/vendors/types';
import { vendorService } from '../services';

const VENDOR_LIST_PATH = '/vendor';

interface UseVendorFormOptions {
  vendorId?: string;
}

export type VendorFieldErrors = Record<string, string>;

interface UseVendorFormReturn {
  formData: VendorFormData;
  fieldErrors: VendorFieldErrors;
  vendorExists: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleStatusChange: (checked: boolean) => void;
  handleSubmit: () => Promise<void>;
  handleCancel: () => void;
  handleDelete: () => Promise<void>;
  navigateToList: () => void;
}

export const useVendorForm = (options: UseVendorFormOptions = {}): UseVendorFormReturn => {
  const { vendorId } = options;
  const navigate = useNavigate();
  const [formData, setFormData] = useState<VendorFormData>(initialVendorFormState);
  const [fieldErrors, setFieldErrors] = useState<VendorFieldErrors>({});
  const [vendorExists, setVendorExists] = useState(true);
  const [isLoading, setIsLoading] = useState(!!vendorId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = Boolean(vendorId);

  // Load vendor data for edit mode
  useEffect(() => {
    if (!isEditMode || !vendorId) return;

    const loadVendor = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await vendorService.getById(parseInt(vendorId, 10));
        const vendor = response.data;

        setFormData({
          name: vendor.name,
          email: vendor.email || '',
          phone: vendor.phone || '',
          address: vendor.address || '',
          city: vendor.city || '',
          state: vendor.state || '',
          country: vendor.country || '',
          postalCode: vendor.postalCode || '',
          taxId: vendor.taxId || '',
          paymentTerms: vendor.paymentTerms || '',
          bankName: vendor.bankName || '',
          bankAccountNo: vendor.bankAccountNo || '',
          notes: vendor.notes || '',
          companyId: vendor.companyId,
          isActive: vendor.isActive,
        });
        setVendorExists(true);
      } catch (err) {
        console.error('Error loading vendor:', err);
        setError(err instanceof Error ? err.message : 'Failed to load vendor');
        setVendorExists(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadVendor();
  }, [vendorId, isEditMode]);

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

  const handleStatusChange = useCallback((checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isActive: checked,
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: VendorFieldErrors = {};

    // Required field validation
    if (!formData.name.trim()) {
      errors.name = 'Vendor name is required';
    }

    // Email validation (if provided)
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Invalid email format';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        country: formData.country.trim() || undefined,
        postalCode: formData.postalCode.trim() || undefined,
        taxId: formData.taxId.trim() || undefined,
        paymentTerms: formData.paymentTerms.trim() || undefined,
        bankName: formData.bankName.trim() || undefined,
        bankAccountNo: formData.bankAccountNo.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        companyId: formData.companyId,
        isActive: formData.isActive,
      };

      if (isEditMode && vendorId) {
        // Update existing vendor
        await vendorService.update(parseInt(vendorId, 10), submitData);
      } else {
        // Create new vendor
        await vendorService.create(submitData);
      }

      navigate(VENDOR_LIST_PATH);
    } catch (err) {
      console.error('Error saving vendor:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save vendor';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isEditMode, vendorId, navigate, validateForm]);

  const handleDelete = useCallback(async () => {
    if (!isEditMode || !vendorId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await vendorService.delete(parseInt(vendorId, 10));
      navigate(VENDOR_LIST_PATH);
    } catch (err) {
      console.error('Error deleting vendor:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete vendor';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [isEditMode, vendorId, navigate]);

  const handleCancel = useCallback(() => {
    navigate(VENDOR_LIST_PATH);
  }, [navigate]);

  const navigateToList = useCallback(() => {
    navigate(VENDOR_LIST_PATH);
  }, [navigate]);

  return {
    formData,
    fieldErrors,
    vendorExists,
    isLoading,
    isSubmitting,
    error,
    handleInputChange,
    handleStatusChange,
    handleSubmit,
    handleCancel,
    handleDelete,
    navigateToList,
  };
};

export default useVendorForm;
