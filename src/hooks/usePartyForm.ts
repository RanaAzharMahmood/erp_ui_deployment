import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PartyFormData,
  initialPartyFormData,
  Company,
  PartyData,
} from '../components/parties/types';
import { getPartiesApi, getCompaniesApi } from '../generated/api/client';
import { CreatePartyRequest, UpdatePartyRequest } from '../generated/api';

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
type SelectChangeValue = string | number | boolean;

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
  handleAddCompany: () => void;
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
              name: c.name ?? '',
            }));
            setCompanies(apiCompanies);
            // Cache in localStorage
            localStorage.setItem('companies', JSON.stringify(apiCompanies));
          }
        } catch (companyError) {
          console.error('Error loading companies from API:', companyError);
          // Fallback to localStorage
          const savedCompanies = localStorage.getItem('companies');
          if (savedCompanies) {
            const parsed = JSON.parse(savedCompanies) as ApiCompanyResponse[];
            setCompanies(parsed.map((c) => ({ id: c.id ?? 0, name: c.companyName || c.name || '' })));
          }
        }

        // Load party data for update mode
        if (mode === 'update' && partyId) {
          try {
            const partiesApi = getPartiesApi();
            const partyResponse = await partiesApi.v1ApiPartiesIdGet(parseInt(partyId, 10));
            if (partyResponse.data) {
              const party = partyResponse.data;
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
                status: party.isActive ? 'Active' : 'Inactive',
              });
              if (party.companyId) {
                setSelectedCompanies([party.companyId as number]);
              }
            }
          } catch (partyError) {
            console.error('Error loading party from API:', partyError);
            // Fallback to localStorage
            const savedParties = localStorage.getItem('parties');
            if (savedParties) {
              const parties: PartyData[] = JSON.parse(savedParties);
              const party = parties.find((p) => String(p.id) === partyId);
              if (party) {
                setFormData({
                  partyName: party.partyName || '',
                  partyType: party.partyType || '',
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
                  status: party.isActive ? 'Active' : 'Inactive',
                });
                if (party.companyId) {
                  setSelectedCompanies([party.companyId as number]);
                }
              }
            }
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

  const handleAddCompany = useCallback(() => {
    if (formData.companyId && !selectedCompanies.includes(formData.companyId as number)) {
      setSelectedCompanies((prev) => [...prev, formData.companyId as number]);
    }
  }, [formData.companyId, selectedCompanies]);

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
          partyType: formData.partyType as 'Customer' | 'Vendor',
          ntnNumber: formData.ntnNumber,
          taxOffice: formData.taxOffice || undefined,
          salesTaxNumber: formData.salesTaxNumber,
          address: formData.address || undefined,
          contactName: formData.contactName,
          contactCnic: formData.contactCnic,
          contactEmail: formData.contactEmail || undefined,
          contactNumber: formData.contactNumber,
          principalActivity: formData.principalActivity || undefined,
          companyId: formData.companyId ? (formData.companyId as number) : undefined,
        };

        await partiesApi.v1ApiPartiesPost(createData);
        setSuccessMessage('Party created successfully!');

        // Update localStorage cache
        try {
          const response = await partiesApi.v1ApiPartiesGet();
          if (response.data?.data) {
            localStorage.setItem('parties', JSON.stringify(response.data.data));
          }
        } catch {
          // Ignore cache update error
        }
      } else {
        const updateData: UpdatePartyRequest = {
          partyName: formData.partyName,
          partyType: formData.partyType as 'Customer' | 'Vendor',
          ntnNumber: formData.ntnNumber,
          taxOffice: formData.taxOffice || undefined,
          salesTaxNumber: formData.salesTaxNumber,
          address: formData.address || undefined,
          contactName: formData.contactName,
          contactCnic: formData.contactCnic,
          contactEmail: formData.contactEmail || undefined,
          contactNumber: formData.contactNumber,
          principalActivity: formData.principalActivity || undefined,
          companyId: formData.companyId ? (formData.companyId as number) : undefined,
          isActive: formData.status === 'Active',
        };

        await partiesApi.v1ApiPartiesIdPut(updateData, parseInt(partyId!, 10));
        setSuccessMessage('Party updated successfully!');

        // Update localStorage cache
        try {
          const response = await partiesApi.v1ApiPartiesGet();
          if (response.data?.data) {
            localStorage.setItem('parties', JSON.stringify(response.data.data));
          }
        } catch {
          // Ignore cache update error
        }
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
      setIsSubmitting(false);
    }
  }, [formData, mode, partyId, navigate, validateForm]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);

    try {
      const partiesApi = getPartiesApi();
      await partiesApi.v1ApiPartiesIdDelete(parseInt(partyId!, 10));

      // Update localStorage cache
      try {
        const response = await partiesApi.v1ApiPartiesGet();
        if (response.data?.data) {
          localStorage.setItem('parties', JSON.stringify(response.data.data));
        }
      } catch {
        // Fallback: remove from localStorage
        const parties: PartyData[] = JSON.parse(localStorage.getItem('parties') || '[]');
        const updatedParties = parties.filter((p) => String(p.id) !== partyId);
        localStorage.setItem('parties', JSON.stringify(updatedParties));
      }

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
    handleAddCompany,
    handleSubmit,
    handleDelete,
    handleCancel,
    setError,
    setSuccessMessage,
  };
};
