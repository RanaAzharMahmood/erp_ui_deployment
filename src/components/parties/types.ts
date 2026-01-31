export interface PartyFormData {
  partyName: string;
  partyType: 'Customer' | 'Vendor' | '';
  ntnNumber: string;
  taxOffice: string;
  salesTaxNumber: string;
  address: string;
  contactName: string;
  contactCnic: string;
  contactEmail: string;
  contactNumber: string;
  principalActivity: string;
  companyId: number | '';
  companyIds: number[];
  status: 'Active' | 'Inactive';
}

export const initialPartyFormData: PartyFormData = {
  partyName: '',
  partyType: '',
  ntnNumber: '',
  taxOffice: '',
  salesTaxNumber: '',
  address: '',
  contactName: '',
  contactCnic: '',
  contactEmail: '',
  contactNumber: '',
  principalActivity: '',
  companyId: '',
  companyIds: [],
  status: 'Active',
};

export interface Company {
  id: number;
  name: string;
}

export interface PartyData {
  id: string;
  partyName: string;
  partyType: 'Customer' | 'Vendor' | '';
  ntnNumber: string;
  taxOffice: string;
  salesTaxNumber: string;
  address: string;
  contactName: string;
  contactCnic: string;
  contactEmail: string;
  contactNumber: string;
  principalActivity: string;
  companyId: number | '';
  companyIds: number[];
  companyName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}
