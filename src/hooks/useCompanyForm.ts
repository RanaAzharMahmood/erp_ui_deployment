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

  // Handle text input changes
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
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

  // Validate form
  const validateForm = useCallback((): boolean => {
    if (
      !formData.companyName ||
      !formData.ntnNumber ||
      !formData.industry ||
      !formData.companyEmail
    ) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
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
