export interface TaxFormData {
  taxId: string;
  taxName: string;
  taxPercentage: string;
  taxDate: string;
  note: string;
  status: 'Active' | 'Prospect' | 'Inactive';
}

export interface TaxRecord {
  id: string;
  taxId: string;
  taxName: string;
  taxPercentage: number;
  taxDate: string;
  note: string;
  isActive: boolean;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export const INITIAL_TAX_FORM_DATA: TaxFormData = {
  taxId: '',
  taxName: '',
  taxPercentage: '',
  taxDate: '',
  note: '',
  status: 'Active',
};
