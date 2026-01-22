export interface VendorFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  taxId: string;
  paymentTerms: string;
  bankName: string;
  bankAccountNo: string;
  notes: string;
  companyId?: number;
  isActive: boolean;
}

export interface Vendor extends VendorFormData {
  id: number;
  companyName?: string;
  createdAt: string;
  updatedAt: string;
}

export const initialVendorFormState: VendorFormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  taxId: '',
  paymentTerms: '',
  bankName: '',
  bankAccountNo: '',
  notes: '',
  companyId: undefined,
  isActive: true,
};
