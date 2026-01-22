import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaxFormData, TaxRecord, INITIAL_TAX_FORM_DATA } from '../components/taxes/taxTypes';
import { getTaxesApi, CreateTaxRequest, UpdateTaxRequest, Tax } from '../generated/api/client';

interface UseTaxFormOptions {
  mode: 'add' | 'update';
  taxId?: string;
}

export type TaxFieldErrors = Record<string, string>;

// Type for select change value
type SelectChangeValue = string | number | boolean;

// Type for error with message property
interface ErrorWithMessage {
  message?: string;
}

interface UseTaxFormReturn {
  formData: TaxFormData;
  fieldErrors: TaxFieldErrors;
  isSubmitting: boolean;
  isDeleting: boolean;
  loading: boolean;
  error: string;
  successMessage: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: SelectChangeValue) => void;
  handleStatusChange: (status: 'Active' | 'Prospect' | 'Inactive') => void;
  handleSubmit: () => Promise<void>;
  handleDelete: () => Promise<void>;
  handleCancel: () => void;
  setError: (error: string) => void;
  setSuccessMessage: (message: string) => void;
}

// Helper function to convert API Tax to TaxFormData
const apiTaxToFormData = (tax: Tax): TaxFormData => ({
  taxId: tax.code || '',
  taxName: tax.name || '',
  taxPercentage: String(tax.rate || ''),
  taxDate: tax.createdAt ? tax.createdAt.split('T')[0] : '',
  note: tax.description || '',
  status: tax.isActive ? 'Active' : 'Inactive',
});

// Helper function to convert API Tax to TaxRecord for localStorage cache
const apiTaxToRecord = (tax: Tax): TaxRecord => ({
  id: String(tax.id),
  taxId: tax.code || '',
  taxName: tax.name || '',
  taxPercentage: tax.rate || 0,
  taxDate: tax.createdAt ? tax.createdAt.split('T')[0] : '',
  note: tax.description || '',
  isActive: tax.isActive,
  status: tax.isActive ? 'Active' : 'Inactive',
  createdAt: tax.createdAt,
  updatedAt: tax.updatedAt,
});

export const useTaxForm = ({ mode, taxId }: UseTaxFormOptions): UseTaxFormReturn => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TaxFormData>(INITIAL_TAX_FORM_DATA);
  const [fieldErrors, setFieldErrors] = useState<TaxFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(mode === 'update');

  // Load tax data for update mode
  useEffect(() => {
    const loadData = async () => {
      if (mode === 'update' && taxId) {
        try {
          // Try to load from API first
          const taxesApi = getTaxesApi();
          const response = await taxesApi.getById(parseInt(taxId, 10));
          if (response.data) {
            const tax = response.data;
            setFormData(apiTaxToFormData(tax));
            // Update localStorage cache
            try {
              const savedTaxes: TaxRecord[] = JSON.parse(localStorage.getItem('taxes') || '[]');
              const updatedTaxes = savedTaxes.map((t) =>
                t.id === taxId ? apiTaxToRecord(tax) : t
              );
              if (!savedTaxes.find((t) => t.id === taxId)) {
                updatedTaxes.push(apiTaxToRecord(tax));
              }
              localStorage.setItem('taxes', JSON.stringify(updatedTaxes));
            } catch {
              // Ignore cache update error
            }
          }
        } catch (apiError) {
          console.error('Error loading tax from API:', apiError);
          // Fallback to localStorage
          try {
            const savedTaxes = localStorage.getItem('taxes');
            if (savedTaxes) {
              const taxes: TaxRecord[] = JSON.parse(savedTaxes);
              const tax = taxes.find((t) => t.id === taxId);
              if (tax) {
                setFormData({
                  taxId: tax.taxId || '',
                  taxName: tax.taxName || '',
                  taxPercentage: String(tax.taxPercentage || ''),
                  taxDate: tax.taxDate || '',
                  note: tax.note || '',
                  status: tax.isActive ? 'Active' : 'Inactive',
                });
              }
            }
          } catch (localStorageError) {
            console.error('Error loading tax from localStorage:', localStorageError);
          }
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [mode, taxId]);

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

  const handleSelectChange = useCallback((name: string, value: SelectChangeValue) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when selection changes
    setFieldErrors((prev) => {
      if (prev[name]) {
        const { [name]: _, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  const handleStatusChange = useCallback((status: 'Active' | 'Prospect' | 'Inactive') => {
    setFormData((prev) => ({ ...prev, status }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: TaxFieldErrors = {};

    if (!formData.taxId.trim()) {
      errors.taxId = 'Tax ID is required';
    }

    if (!formData.taxPercentage) {
      errors.taxPercentage = 'Tax percentage is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData.taxId, formData.taxPercentage]);

  const updateLocalStorageCache = async () => {
    try {
      const taxesApi = getTaxesApi();
      const response = await taxesApi.getAll();
      if (response.data) {
        const taxRecords = response.data.map(apiTaxToRecord);
        localStorage.setItem('taxes', JSON.stringify(taxRecords));
      }
    } catch {
      // Ignore cache update error
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const taxesApi = getTaxesApi();

      if (mode === 'add') {
        const createData: CreateTaxRequest = {
          name: formData.taxName || formData.taxId,
          code: formData.taxId,
          rate: parseFloat(formData.taxPercentage),
          type: 'exclusive', // Default type
          description: formData.note || undefined,
        };

        await taxesApi.create(createData);
        setSuccessMessage('Tax created successfully!');

        // Update localStorage cache
        await updateLocalStorageCache();
      } else {
        const updateData: UpdateTaxRequest = {
          name: formData.taxName || formData.taxId,
          code: formData.taxId,
          rate: parseFloat(formData.taxPercentage),
          description: formData.note || undefined,
          isActive: formData.status === 'Active',
        };

        await taxesApi.update(parseInt(taxId!, 10), updateData);
        setSuccessMessage('Tax updated successfully!');

        // Update localStorage cache
        await updateLocalStorageCache();
      }

      setTimeout(() => {
        navigate('/tax');
      }, 1500);
    } catch (err: unknown) {
      console.error(`Error ${mode === 'add' ? 'creating' : 'updating'} tax:`, err);

      // Try localStorage fallback for offline support
      try {
        const taxes: TaxRecord[] = JSON.parse(localStorage.getItem('taxes') || '[]');

        if (mode === 'add') {
          const newTax: TaxRecord = {
            id: String(Date.now()),
            taxId: formData.taxId,
            taxName: formData.taxName,
            taxPercentage: parseFloat(formData.taxPercentage),
            taxDate: formData.taxDate,
            note: formData.note,
            isActive: formData.status === 'Active',
            status: formData.status,
            createdAt: new Date().toISOString(),
          };

          taxes.push(newTax);
          localStorage.setItem('taxes', JSON.stringify(taxes));
          setSuccessMessage('Tax saved locally (offline mode). Will sync when online.');
        } else {
          const updatedTaxes = taxes.map((tax) => {
            if (tax.id === taxId) {
              return {
                ...tax,
                taxId: formData.taxId,
                taxName: formData.taxName,
                taxPercentage: parseFloat(formData.taxPercentage),
                taxDate: formData.taxDate,
                note: formData.note,
                isActive: formData.status === 'Active',
                status: formData.status,
                updatedAt: new Date().toISOString(),
              };
            }
            return tax;
          });

          localStorage.setItem('taxes', JSON.stringify(updatedTaxes));
          setSuccessMessage('Tax saved locally (offline mode). Will sync when online.');
        }

        setTimeout(() => {
          navigate('/tax');
        }, 1500);
      } catch (localError) {
        // Both API and localStorage failed
        let errorMessage = `Failed to ${mode === 'add' ? 'create' : 'update'} tax. Please try again.`;
        const errorWithMessage = err as ErrorWithMessage;
        if (errorWithMessage.message) {
          errorMessage = errorWithMessage.message;
        }
        setError(errorMessage);
        setIsSubmitting(false);
      }
    }
  }, [formData, mode, taxId, navigate, validateForm]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);

    try {
      const taxesApi = getTaxesApi();
      await taxesApi.delete(parseInt(taxId!, 10));

      // Update localStorage cache
      await updateLocalStorageCache();

      setSuccessMessage('Tax deleted successfully!');
      setTimeout(() => {
        navigate('/tax');
      }, 1500);
    } catch (err: unknown) {
      console.error('Error deleting tax:', err);

      // Try localStorage fallback for offline support
      try {
        const taxes: TaxRecord[] = JSON.parse(localStorage.getItem('taxes') || '[]');
        const updatedTaxes = taxes.filter((t) => t.id !== taxId);
        localStorage.setItem('taxes', JSON.stringify(updatedTaxes));

        setSuccessMessage('Tax deleted locally (offline mode). Will sync when online.');
        setTimeout(() => {
          navigate('/tax');
        }, 1500);
      } catch (localError) {
        // Both API and localStorage failed
        let errorMessage = 'Failed to delete tax. Please try again.';
        const errorWithMessage = err as ErrorWithMessage;
        if (errorWithMessage.message) {
          errorMessage = errorWithMessage.message;
        }
        setError(errorMessage);
        setIsDeleting(false);
      }
    }
  }, [taxId, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/tax');
  }, [navigate]);

  return {
    formData,
    fieldErrors,
    isSubmitting,
    isDeleting,
    loading,
    error,
    successMessage,
    handleInputChange,
    handleSelectChange,
    handleStatusChange,
    handleSubmit,
    handleDelete,
    handleCancel,
    setError,
    setSuccessMessage,
  };
};
