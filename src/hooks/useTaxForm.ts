import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaxFormData, INITIAL_TAX_FORM_DATA } from '../components/taxes/taxTypes';
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
          const taxesApi = getTaxesApi();
          const response = await taxesApi.getById(parseInt(taxId, 10));
          if (response.data) {
            setFormData(apiTaxToFormData(response.data));
          }
        } catch (apiError) {
          console.error('Error loading tax from API:', apiError);
          setError('Failed to load tax data');
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
      }

      setTimeout(() => {
        navigate('/tax');
      }, 1500);
    } catch (err: unknown) {
      console.error(`Error ${mode === 'add' ? 'creating' : 'updating'} tax:`, err);
      let errorMessage = `Failed to ${mode === 'add' ? 'create' : 'update'} tax. Please try again.`;
      const errorWithMessage = err as ErrorWithMessage;
      if (errorWithMessage.message) {
        errorMessage = errorWithMessage.message;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, mode, taxId, navigate, validateForm]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);

    try {
      const taxesApi = getTaxesApi();
      await taxesApi.delete(parseInt(taxId!, 10));

      setSuccessMessage('Tax deleted successfully!');
      setTimeout(() => {
        navigate('/tax');
      }, 1500);
    } catch (err: unknown) {
      console.error('Error deleting tax:', err);
      let errorMessage = 'Failed to delete tax. Please try again.';
      const errorWithMessage = err as ErrorWithMessage;
      if (errorWithMessage.message) {
        errorMessage = errorWithMessage.message;
      }
      setError(errorMessage);
      setIsDeleting(false);
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
