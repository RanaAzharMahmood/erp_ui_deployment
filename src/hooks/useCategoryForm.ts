import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanies } from './useCompanies';
import { getCategoriesApi } from '../generated/api/client';
import { useCompany } from '../contexts/CompanyContext';
import { useAuth } from '../contexts/AuthContext';

export interface CategoryFormData {
  categoryName: string;
  companyId: number | '';
  description: string;
  status: 'Active' | 'Inactive';
}

export interface Company {
  id: number;
  name: string;
}

export interface UseCategoryFormOptions {
  categoryId?: string;
  mode: 'create' | 'edit';
}

export type CategoryFieldErrors = Record<string, string>;

// Type for API category response
interface ApiCategoryResponse {
  categoryName?: string;
  companyId?: number;
  description?: string;
  isActive?: boolean;
}

// Type for API error with json method
interface ApiError {
  status?: number;
  json?: () => Promise<{ message?: string }>;
}

// Type for select change value
type SelectChangeValue = string | number | boolean;

export interface UseCategoryFormReturn {
  formData: CategoryFormData;
  fieldErrors: CategoryFieldErrors;
  companies: Company[];
  isSubmitting: boolean;
  isDeleting: boolean;
  loading: boolean;
  error: string;
  successMessage: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: SelectChangeValue) => void;
  handleStatusChange: (status: 'Active' | 'Inactive') => void;
  handleSubmit: () => Promise<void>;
  handleDelete: () => Promise<void>;
  handleCancel: () => void;
  setError: (error: string) => void;
  setSuccessMessage: (message: string) => void;
}

const initialFormData: CategoryFormData = {
  categoryName: '',
  companyId: '',
  description: '',
  status: 'Active',
};

export const useCategoryForm = ({
  categoryId,
  mode,
}: UseCategoryFormOptions): UseCategoryFormReturn => {
  const navigate = useNavigate();
  const { selectedCompany } = useCompany();
  const { user } = useAuth();
  const isAdmin = user?.roleName?.toLowerCase() === 'admin';
  const [formData, setFormData] = useState<CategoryFormData>({
    ...initialFormData,
    companyId: (!isAdmin && selectedCompany) ? selectedCompany.id : '',
  });
  const [fieldErrors, setFieldErrors] = useState<CategoryFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(mode === 'edit');

  // Use the shared companies hook (proven to work across other pages)
  const { companies: companiesData, refetch: refetchCompanies } = useCompanies();
  const companies: Company[] = companiesData.map((c) => ({ id: c.id, name: c.name }));

  // Refetch companies on mount to ensure fresh data
  useEffect(() => {
    refetchCompanies();
  }, [refetchCompanies]);

  // Load category data for edit mode
  useEffect(() => {
    const loadCategoryData = async () => {
      if (mode !== 'edit' || !categoryId) return;

      try {
        const categoriesApi = getCategoriesApi();
        const categoryResponse = await categoriesApi.v1ApiCategoriesIdGet(Number(categoryId));
        if (categoryResponse.data) {
          const category = categoryResponse.data as ApiCategoryResponse;
          setFormData({
            categoryName: category.categoryName || '',
            companyId: category.companyId || '',
            description: category.description || '',
            status: category.isActive ? 'Active' : 'Inactive',
          });
        }
      } catch (err: unknown) {
        console.error('Error loading category:', err);
        const apiError = err as ApiError;
        if (apiError.status === 401) {
          setError('Session expired. Please login again.');
        } else {
          setError('Failed to load category data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadCategoryData();
  }, [categoryId, mode]);

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

  const handleStatusChange = useCallback((status: 'Active' | 'Inactive') => {
    setFormData((prev) => ({ ...prev, status }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: CategoryFieldErrors = {};

    if (!formData.categoryName.trim()) {
      errors.categoryName = 'Category name is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData.categoryName]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const categoriesApi = getCategoriesApi();

      if (mode === 'create') {
        await categoriesApi.v1ApiCategoriesPost({
          categoryName: formData.categoryName,
          description: formData.description || undefined,
          companyId: formData.companyId ? Number(formData.companyId) : undefined,
        } as Parameters<typeof categoriesApi.v1ApiCategoriesPost>[0] & { companyId?: number });
        setSuccessMessage('Category created successfully!');
      } else {
        await categoriesApi.v1ApiCategoriesIdPut(
          {
            categoryName: formData.categoryName,
            description: formData.description || undefined,
            isActive: formData.status === 'Active',
            companyId: formData.companyId ? Number(formData.companyId) : undefined,
          } as Parameters<typeof categoriesApi.v1ApiCategoriesIdPut>[0] & { companyId?: number },
          Number(categoryId)
        );
        setSuccessMessage('Category updated successfully!');
      }

      setTimeout(() => {
        navigate('/categories');
      }, 1500);
    } catch (err: unknown) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} category:`, err);

      // Handle API error response
      const apiError = err as ApiError;
      if (apiError.json) {
        try {
          const errorData = await apiError.json();
          setError(errorData.message || `Failed to ${mode === 'create' ? 'create' : 'update'} category.`);
        } catch {
          setError(`Failed to ${mode === 'create' ? 'create' : 'update'} category. Please try again.`);
        }
      } else {
        setError(`Failed to ${mode === 'create' ? 'create' : 'update'} category. Please try again.`);
      }
      setIsSubmitting(false);
    }
  }, [formData, categoryId, mode, navigate, validateForm]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    setError('');

    try {
      const categoriesApi = getCategoriesApi();
      await categoriesApi.v1ApiCategoriesIdDelete(Number(categoryId));

      setSuccessMessage('Category deleted successfully!');
      setTimeout(() => {
        navigate('/categories');
      }, 1500);
    } catch (err: unknown) {
      console.error('Error deleting category:', err);

      // Handle API error response
      const apiError = err as ApiError;
      if (apiError.json) {
        try {
          const errorData = await apiError.json();
          setError(errorData.message || 'Failed to delete category.');
        } catch {
          setError('Failed to delete category. Please try again.');
        }
      } else {
        setError('Failed to delete category. Please try again.');
      }
      setIsDeleting(false);
    }
  }, [categoryId, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/categories');
  }, [navigate]);

  return {
    formData,
    fieldErrors,
    companies,
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

export default useCategoryForm;
