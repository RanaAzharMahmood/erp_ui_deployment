import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PartyFormData,
  initialPartyFormData,
  Company,
} from '../components/parties/types';
import { getPartiesApi, getCompaniesApi } from '../generated/api/client';
import {
  CreatePartyRequest,
  UpdatePartyRequest,
  CreatePartyRequestPartyTypeEnum,
  UpdatePartyRequestPartyTypeEnum
} from '../generated/api';

interface UsePartyFormOptions {
  partyId?: string;
  mode: 'add' | 'update';
}

// Type for API company response
interface ApiCompanyResponse {
  id?: number;
  name?: string;
  companyName?: string;
}

// Type for API error with json method
interface ApiError {
  json?: () => Promise<{ message?: string }>;
}

// Type for select change value
type SelectChangeValue = string | number | boolean | number[];

interface UsePartyFormReturn {
  formData: PartyFormData;
  companies: Company[];
  selectedCompanies: number[];
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

export const usePartyForm = ({ partyId, mode }: UsePartyFormOptions): UsePartyFormReturn => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PartyFormData>(initialPartyFormData);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(mode === 'update');

  // Load companies and party data (for update mode)
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load companies from API
        try {
          const companiesApi = getCompaniesApi();
          const companiesResponse = await companiesApi.v1ApiCompaniesGet();
          if (companiesResponse.data) {
            const apiCompanies = companiesResponse.data.map((c: ApiCompanyResponse) => ({
              id: c.id ?? 0,
              name: c.name || c.companyName || '',
            }));
            setCompanies(apiCompanies);
          }
        } catch (companyError) {
          console.error('Error loading companies from API:', companyError);
          setError('Failed to load companies');
        }

        // Load party data for update mode
        if (mode === 'update' && partyId) {
          try {
            const partiesApi = getPartiesApi();
            const partyResponse = await partiesApi.v1ApiPartiesIdGet(parseInt(partyId, 10));
            if (partyResponse.data) {
              const party = partyResponse.data;
              const existingCompanyIds = party.companyId ? [party.companyId as number] : [];
              setFormData({
                partyName: party.partyName || '',
                partyType: (party.partyType as 'Customer' | 'Vendor' | '') || '',
                ntnNumber: party.ntnNumber || '',
                taxOffice: party.taxOffice || '',
                salesTaxNumber: party.salesTaxNumber || '',
                address: party.address || '',
                contactName: party.contactName || '',
                contactCnic: party.contactCnic || '',
                contactEmail: party.contactEmail || '',
                contactNumber: party.contactNumber || '',
                principalActivity: party.principalActivity || '',
                companyId: party.companyId || '',
                companyIds: existingCompanyIds,
                status: party.isActive ? 'Active' : 'Inactive',
              });
              if (party.companyId) {
                setSelectedCompanies([party.companyId as number]);
              }
            }
          } catch (partyError) {
            console.error('Error loading party from API:', partyError);
            setError('Failed to load party data');
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [partyId, mode]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSelectChange = useCallback((name: string, value: SelectChangeValue) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleStatusChange = useCallback((status: 'Active' | 'Inactive') => {
    setFormData((prev) => ({ ...prev, status }));
  }, []);

  const validateForm = useCallback((): boolean => {
    if (
      !formData.partyName ||
      !formData.partyType ||
      !formData.ntnNumber ||
      !formData.salesTaxNumber ||
      !formData.contactName ||
      !formData.contactCnic ||
      !formData.contactNumber
    ) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const partiesApi = getPartiesApi();

      if (mode === 'add') {
        const createData: CreatePartyRequest = {
          partyName: formData.partyName,
          partyType: formData.partyType === 'Customer'
            ? CreatePartyRequestPartyTypeEnum.Customer
            : CreatePartyRequestPartyTypeEnum.Vendor,
          ntnNumber: formData.ntnNumber,
          taxOffice: formData.taxOffice || undefined,
          salesTaxNumber: formData.salesTaxNumber,
          address: formData.address || undefined,
          contactName: formData.contactName,
          contactCnic: formData.contactCnic,
          contactEmail: formData.contactEmail || undefined,
          contactNumber: formData.contactNumber,
          principalActivity: formData.principalActivity || undefined,
          companyId: formData.companyIds.length > 0 ? formData.companyIds[0] : undefined,
        };

        await partiesApi.v1ApiPartiesPost(createData);
        setSuccessMessage('Party created successfully!');
      } else {
        const updateData: UpdatePartyRequest = {
          partyName: formData.partyName,
          partyType: formData.partyType === 'Customer'
            ? UpdatePartyRequestPartyTypeEnum.Customer
            : UpdatePartyRequestPartyTypeEnum.Vendor,
          ntnNumber: formData.ntnNumber,
          taxOffice: formData.taxOffice || undefined,
          salesTaxNumber: formData.salesTaxNumber,
          address: formData.address || undefined,
          contactName: formData.contactName,
          contactCnic: formData.contactCnic,
          contactEmail: formData.contactEmail || undefined,
          contactNumber: formData.contactNumber,
          principalActivity: formData.principalActivity || undefined,
          companyId: formData.companyIds.length > 0 ? formData.companyIds[0] : undefined,
          isActive: formData.status === 'Active',
        };

        await partiesApi.v1ApiPartiesIdPut(updateData, parseInt(partyId!, 10));
        setSuccessMessage('Party updated successfully!');
      }

      setTimeout(() => {
        navigate('/party');
      }, 1500);
    } catch (err: unknown) {
      console.error(`Error ${mode === 'add' ? 'creating' : 'updating'} party:`, err);

      let errorMessage = `Failed to ${mode === 'add' ? 'create' : 'update'} party. Please try again.`;
      const apiError = err as ApiError;
      if (apiError.json) {
        try {
          const errorData = await apiError.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Use default error message
        }
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, mode, partyId, navigate, validateForm]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);

    try {
      const partiesApi = getPartiesApi();
      await partiesApi.v1ApiPartiesIdDelete(parseInt(partyId!, 10));

      setSuccessMessage('Party deleted successfully!');
      setTimeout(() => {
        navigate('/party');
      }, 1500);
    } catch (err: unknown) {
      console.error('Error deleting party:', err);

      let errorMessage = 'Failed to delete party. Please try again.';
      const apiError = err as ApiError;
      if (apiError.json) {
        try {
          const errorData = await apiError.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Use default error message
        }
      }

      setError(errorMessage);
      setIsDeleting(false);
    }
  }, [partyId, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/party');
  }, [navigate]);

  return {
    formData,
    companies,
    selectedCompanies,
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
