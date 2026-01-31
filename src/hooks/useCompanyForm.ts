import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CompanyFormData, Status } from '../types/common.types';
import { optimizeImage, validateImage } from '../utils/imageOptimizer';
import { getCompaniesApi } from '../generated/api/client';
import type { ApiCompaniesBody, CompaniesIdBody } from '../generated/api/api';

// Initial form state for creating a new company
export const initialCompanyFormState: CompanyFormData = {
  companyName: '',
  ntnNumber: '',
  website: '',
  industry: '',
  salesTaxNumber: '',
  companyEmail: '',
  address: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  status: 'Active',
  logo: '',
  user: '',
  subscriptionEnd: '',
};

interface UseCompanyFormOptions {
  mode: 'create' | 'update';
  companyId?: string;
  initialData?: CompanyFormData;
}

// Field-level validation errors
interface FieldErrors {
  companyName?: string;
  ntnNumber?: string;
  industry?: string;
  companyEmail?: string;
}

interface UseCompanyFormReturn {
  formData: CompanyFormData;
  setFormData: React.Dispatch<React.SetStateAction<CompanyFormData>>;
  logoPreview: string;
  setLogoPreview: React.Dispatch<React.SetStateAction<string>>;
  isSubmitting: boolean;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  successMessage: string;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string>>;
  fieldErrors: FieldErrors;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleStatusChange: (status: Status) => void;
  handleLogoUpload: (file: File) => Promise<void>;
  handleLogoRemove: () => void;
  handleSubmit: () => Promise<void>;
  handleCancel: () => void;
  validateForm: () => boolean;
}

/**
 * Custom hook for managing company form state and operations
 * Used by both AddCompanyPage and UpdateCompanyPage
 */
export const useCompanyForm = ({
  mode,
  companyId,
  initialData,
}: UseCompanyFormOptions): UseCompanyFormReturn => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CompanyFormData>(
    initialData || initialCompanyFormState
  );
  const [logoPreview, setLogoPreview] = useState<string>(initialData?.logo || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Handle text input changes
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Clear field error when user types
      if (name in fieldErrors) {
        setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [fieldErrors]
  );

  // Handle status changes
  const handleStatusChange = useCallback((status: Status) => {
    setFormData((prev) => ({ ...prev, status }));
  }, []);

  // Handle logo upload with optimization
  const handleLogoUpload = useCallback(async (file: File) => {
    // Validate image
    const validation = validateImage(file, 2);
    if (!validation.valid) {
      setError(validation.error || 'Invalid image file');
      return;
    }

    try {
      // Optimize image (resize to max 200x200, 80% quality)
      const optimizedLogo = await optimizeImage(file, {
        maxWidth: 200,
        maxHeight: 200,
        quality: 0.8,
        format: 'image/jpeg',
      });

      setLogoPreview(optimizedLogo);
      setFormData((prev) => ({ ...prev, logo: optimizedLogo }));
    } catch (err) {
      console.error('Error optimizing image:', err);
      setError('Failed to upload image. Please try again.');
    }
  }, []);

  // Handle logo removal
  const handleLogoRemove = useCallback(() => {
    setLogoPreview('');
    setFormData((prev) => ({ ...prev, logo: '' }));
  }, []);

  // Validate form with field-level errors
  const validateForm = useCallback((): boolean => {
    const errors: FieldErrors = {};
    let isValid = true;

    if (!formData.companyName?.trim()) {
      errors.companyName = 'Company name is required';
      isValid = false;
    }

    if (!formData.ntnNumber?.trim()) {
      errors.ntnNumber = 'NTN number is required';
      isValid = false;
    }

    if (!formData.industry?.trim()) {
      errors.industry = 'Industry is required';
      isValid = false;
    }

    if (!formData.companyEmail?.trim()) {
      errors.companyEmail = 'Company email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyEmail)) {
      errors.companyEmail = 'Please enter a valid email address';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const companiesApi = getCompaniesApi();

      if (mode === 'create') {
        // Prepare API payload for create
        const payload: ApiCompaniesBody = {
          name: formData.companyName,
          address: formData.address || undefined,
          city: undefined,
          phone: formData.contactPhone || undefined,
          logoUrl: formData.logo || undefined,
          ntnNumber: formData.ntnNumber || undefined,
          salesTaxRegistrationNo: formData.salesTaxNumber || undefined,
          website: formData.website || undefined,
          industry: formData.industry || undefined,
          email: formData.companyEmail || undefined,
          contactName: formData.contactName || undefined,
          contactEmail: formData.contactEmail || undefined,
          isActive: formData.status === 'Active',
        };

        // Call API
        await companiesApi.v1ApiCompaniesPost(payload);

        // Note: localStorage cache will be updated when useCompanies hook refetches data
        // This ensures data consistency between API and cache

        setSuccessMessage('Company created successfully!');
      } else {
        // Prepare API payload for update
        const payload: CompaniesIdBody = {
          name: formData.companyName,
          address: formData.address || undefined,
          city: undefined,
          phone: formData.contactPhone || undefined,
          logoUrl: formData.logo || undefined,
          ntnNumber: formData.ntnNumber || undefined,
          salesTaxRegistrationNo: formData.salesTaxNumber || undefined,
          website: formData.website || undefined,
          industry: formData.industry || undefined,
          email: formData.companyEmail || undefined,
          contactName: formData.contactName || undefined,
          contactEmail: formData.contactEmail || undefined,
          isActive: formData.status === 'Active',
        };

        // Call API
        await companiesApi.v1ApiCompaniesIdPut(payload, Number(companyId));

        // Note: localStorage cache will be updated when useCompanies hook refetches data
        // This ensures data consistency between API and cache

        setSuccessMessage('Company updated successfully!');
      }

      // Navigate back with slight delay for better UX
      setTimeout(() => {
        navigate('/companies');
      }, 1500);
    } catch (err: unknown) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} company:`, err);
      setError(`Failed to ${mode === 'create' ? 'create' : 'update'} company. Please try again.`);
      setIsSubmitting(false);
    }
  }, [formData, mode, companyId, navigate, validateForm]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    navigate('/companies');
  }, [navigate]);

  return {
    formData,
    setFormData,
    logoPreview,
    setLogoPreview,
    isSubmitting,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    fieldErrors,
    handleInputChange,
    handleStatusChange,
    handleLogoUpload,
    handleLogoRemove,
    handleSubmit,
    handleCancel,
    validateForm,
  };
};

export default useCompanyForm;
