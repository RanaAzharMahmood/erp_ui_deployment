import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  VendorFormData,
  Vendor,
  initialVendorFormState,
} from '../components/vendors/types';
import { vendorService } from '../services';

const VENDORS_STORAGE_KEY = 'vendors';
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

        // Fallback to localStorage
        const savedVendors = localStorage.getItem(VENDORS_STORAGE_KEY);
        if (savedVendors) {
          const vendors: Vendor[] = JSON.parse(savedVendors);
          const vendor = vendors.find((v) => v.id === parseInt(vendorId, 10));
          if (vendor) {
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
          } else {
            setVendorExists(false);
          }
        } else {
          setVendorExists(false);
        }
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

      // Update localStorage backup
      try {
        const response = await vendorService.getAll({ limit: 100 });
        localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(response.data));
      } catch {
        // Ignore localStorage backup errors
      }

      navigate(VENDOR_LIST_PATH);
    } catch (err) {
      console.error('Error saving vendor:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save vendor';
      setError(errorMessage);

      // Fallback to localStorage for offline support
      try {
        const existingVendors: Vendor[] = JSON.parse(
          localStorage.getItem(VENDORS_STORAGE_KEY) || '[]'
        );

        if (isEditMode && vendorId) {
          const updatedVendors = existingVendors.map((vendor) =>
            vendor.id === parseInt(vendorId, 10)
              ? { ...vendor, ...formData, updatedAt: new Date().toISOString() }
              : vendor
          );
          localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(updatedVendors));
        } else {
          const newVendor: Vendor = {
            ...formData,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem(
            VENDORS_STORAGE_KEY,
            JSON.stringify([...existingVendors, newVendor])
          );
        }
        navigate(VENDOR_LIST_PATH);
      } catch {
        // If localStorage also fails, keep the error displayed
      }
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

      // Update localStorage backup
      try {
        const savedVendors = localStorage.getItem(VENDORS_STORAGE_KEY);
        if (savedVendors) {
          const vendors: Vendor[] = JSON.parse(savedVendors);
          const updatedVendors = vendors.filter((v) => v.id !== parseInt(vendorId, 10));
          localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(updatedVendors));
        }
      } catch {
        // Ignore localStorage errors
      }

      navigate(VENDOR_LIST_PATH);
    } catch (err) {
      console.error('Error deleting vendor:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete vendor';
      setError(errorMessage);

      // Fallback to localStorage
      try {
        const savedVendors = localStorage.getItem(VENDORS_STORAGE_KEY);
        if (savedVendors) {
          const vendors: Vendor[] = JSON.parse(savedVendors);
          const updatedVendors = vendors.filter((v) => v.id !== parseInt(vendorId, 10));
          localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(updatedVendors));
          navigate(VENDOR_LIST_PATH);
        }
      } catch {
        // If localStorage also fails, keep the error displayed
      }
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
