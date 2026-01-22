import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ItemFormData, SelectOption, INITIAL_ITEM_FORM_DATA } from '../components/items/types';
import { itemSchema, validateForm as zodValidateForm } from '../schemas';
import { getItemsApi, getCategoriesApi, getCompaniesApi } from '../generated/api/client';

interface UseItemFormOptions {
  itemId?: string;
  onSuccess?: () => void;
}

export type ItemFieldErrors = Record<string, string>;

// Type for API category response
interface ApiCategoryResponse {
  id?: number;
  categoryName?: string;
}

// Type for API company response
interface ApiCompanyResponse {
  id?: number;
  companyName?: string;
}

// Type for API item response
interface ApiItemResponse {
  itemCode?: string;
  itemName?: string;
  categoryId?: number;
  unitPrice?: number;
  purchasePrice?: number;
  salePrice?: number;
  unitOfMeasure?: string;
  openingStock?: number;
  currentStock?: number;
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

interface UseItemFormReturn {
  formData: ItemFormData;
  setFormData: React.Dispatch<React.SetStateAction<ItemFormData>>;
  fieldErrors: ItemFieldErrors;
  categories: SelectOption[];
  companies: SelectOption[];
  isSubmitting: boolean;
  isDeleting: boolean;
  loading: boolean;
  error: string;
  successMessage: string;
  setError: (error: string) => void;
  setSuccessMessage: (message: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: SelectChangeValue) => void;
  handleStatusChange: (status: 'Active' | 'Prospect' | 'Inactive') => void;
  handleCreate: () => Promise<void>;
  handleUpdate: () => Promise<void>;
  handleDelete: () => Promise<void>;
  handleCancel: () => void;
}

export function useItemForm(options: UseItemFormOptions = {}): UseItemFormReturn {
  const { itemId, onSuccess } = options;
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ItemFormData>(INITIAL_ITEM_FORM_DATA);
  const [fieldErrors, setFieldErrors] = useState<ItemFieldErrors>({});
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [companies, setCompanies] = useState<SelectOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(!!itemId);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load categories and companies from API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories from API
        const categoriesApi = getCategoriesApi();
        const categoriesResponse = await categoriesApi.v1ApiCategoriesGet(true);
        if (categoriesResponse.data) {
          setCategories(
            categoriesResponse.data.map((c: ApiCategoryResponse) => ({
              id: c.id ?? 0,
              name: c.categoryName ?? '',
            }))
          );
        }

        // Load companies from API
        const companiesApi = getCompaniesApi();
        const companiesResponse = await companiesApi.v1ApiCompaniesGet(true);
        if (companiesResponse.data) {
          setCompanies(
            companiesResponse.data.map((c: ApiCompanyResponse) => ({
              id: c.id ?? 0,
              name: c.companyName ?? '',
            }))
          );
        }

        // Load existing item data if itemId is provided (edit mode)
        if (itemId) {
          const itemsApi = getItemsApi();
          const itemResponse = await itemsApi.v1ApiItemsIdGet(Number(itemId));
          if (itemResponse.data) {
            const item = itemResponse.data as ApiItemResponse;
            setFormData({
              itemCode: item.itemCode || '',
              itemHashCode: '',
              itemName: item.itemName || '',
              categoryId: item.categoryId || '',
              unitPrice: String(item.unitPrice || ''),
              purchasePrice: String(item.purchasePrice || ''),
              salePrice: String(item.salePrice || ''),
              unitOfMeasure: item.unitOfMeasure || '',
              openingStock: String(item.openingStock || ''),
              closingStock: String(item.currentStock || ''),
              companyId: item.companyId || '',
              description: item.description || '',
              status: item.isActive ? 'Active' : 'Inactive',
            });
          }
        }
      } catch (err: unknown) {
        console.error('Error loading data:', err);
        const apiError = err as ApiError;
        if (apiError.status === 401) {
          setError('Session expired. Please login again.');
        } else {
          setError('Failed to load data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [itemId]);

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

  const validateForm = useCallback(() => {
    // Use Zod schema validation
    const result = zodValidateForm(itemSchema, formData);

    if (!result.isValid) {
      setFieldErrors(result.errors);
      // Get the first error message to display as general error
      const errorMessages = Object.values(result.errors);
      if (errorMessages.length > 0) {
        setError(errorMessages[0]);
      }
      return false;
    }

    setFieldErrors({});
    setError('');
    return true;
  }, [formData]);

  const handleCreate = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const itemsApi = getItemsApi();

      await itemsApi.v1ApiItemsPost({
        itemCode: formData.itemCode,
        itemName: formData.itemName,
        categoryId: Number(formData.categoryId),
        description: formData.description || undefined,
        unitPrice: parseFloat(formData.unitPrice) || 0,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        salePrice: parseFloat(formData.salePrice) || 0,
        taxRate: 0, // Default tax rate
        unitOfMeasure: formData.unitOfMeasure,
        openingStock: parseFloat(formData.openingStock) || 0,
        currentStock: parseFloat(formData.closingStock) || 0,
      });

      setSuccessMessage('Item created successfully!');
      setTimeout(() => {
        onSuccess?.();
        navigate('/inventory');
      }, 1500);
    } catch (err: unknown) {
      console.error('Error creating item:', err);

      // Handle API error response
      const apiError = err as ApiError;
      if (apiError.json) {
        try {
          const errorData = await apiError.json();
          setError(errorData.message || 'Failed to create item.');
        } catch {
          setError('Failed to create item. Please try again.');
        }
      } else {
        setError('Failed to create item. Please try again.');
      }
      setIsSubmitting(false);
    }
  }, [formData, navigate, validateForm, onSuccess]);

  const handleUpdate = useCallback(async () => {
    if (!validateForm() || !itemId) return;

    setIsSubmitting(true);
    setError('');

    try {
      const itemsApi = getItemsApi();

      await itemsApi.v1ApiItemsIdPut(
        {
          itemCode: formData.itemCode,
          itemName: formData.itemName,
          categoryId: Number(formData.categoryId),
          description: formData.description || undefined,
          unitPrice: parseFloat(formData.unitPrice) || 0,
          purchasePrice: parseFloat(formData.purchasePrice) || 0,
          salePrice: parseFloat(formData.salePrice) || 0,
          taxRate: 0, // Default tax rate
          unitOfMeasure: formData.unitOfMeasure,
          openingStock: parseFloat(formData.openingStock) || 0,
          currentStock: parseFloat(formData.closingStock) || 0,
          isActive: formData.status === 'Active',
        },
        Number(itemId)
      );

      setSuccessMessage('Item updated successfully!');
      setTimeout(() => {
        onSuccess?.();
        navigate('/inventory');
      }, 1500);
    } catch (err: unknown) {
      console.error('Error updating item:', err);

      // Handle API error response
      const apiError = err as ApiError;
      if (apiError.json) {
        try {
          const errorData = await apiError.json();
          setError(errorData.message || 'Failed to update item.');
        } catch {
          setError('Failed to update item. Please try again.');
        }
      } else {
        setError('Failed to update item. Please try again.');
      }
      setIsSubmitting(false);
    }
  }, [formData, itemId, navigate, validateForm, onSuccess]);

  const handleDelete = useCallback(async () => {
    if (!itemId) return;

    setIsDeleting(true);
    setError('');

    try {
      const itemsApi = getItemsApi();
      await itemsApi.v1ApiItemsIdDelete(Number(itemId));

      setSuccessMessage('Item deleted successfully!');
      setTimeout(() => {
        onSuccess?.();
        navigate('/inventory');
      }, 1500);
    } catch (err: unknown) {
      console.error('Error deleting item:', err);

      // Handle API error response
      const apiError = err as ApiError;
      if (apiError.json) {
        try {
          const errorData = await apiError.json();
          setError(errorData.message || 'Failed to delete item.');
        } catch {
          setError('Failed to delete item. Please try again.');
        }
      } else {
        setError('Failed to delete item. Please try again.');
      }
      setIsDeleting(false);
    }
  }, [itemId, navigate, onSuccess]);

  const handleCancel = useCallback(() => {
    navigate('/inventory');
  }, [navigate]);

  return {
    formData,
    setFormData,
    fieldErrors,
    categories,
    companies,
    isSubmitting,
    isDeleting,
    loading,
    error,
    successMessage,
    setError,
    setSuccessMessage,
    handleInputChange,
    handleSelectChange,
    handleStatusChange,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleCancel,
  };
}

export default useItemForm;
