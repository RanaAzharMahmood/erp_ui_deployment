// Shared types and constants for Item forms

export interface ItemFormData {
  itemCode: string;
  itemHashCode: string;
  itemName: string;
  categoryId: number | '';
  unitPrice: string;
  purchasePrice: string;
  salePrice: string;
  unitOfMeasure: string;
  openingStock: string;
  closingStock: string;
  companyId: number | '';
  description: string;
  status: 'Active' | 'Prospect' | 'Inactive';
}

export interface SelectOption {
  id: number;
  name: string;
}

export const UNITS = ['KG', 'Metric Ton', 'Piece', 'Liter', 'Meter'];

export const INITIAL_ITEM_FORM_DATA: ItemFormData = {
  itemCode: '',
  itemHashCode: '',
  itemName: '',
  categoryId: '',
  unitPrice: '',
  purchasePrice: '',
  salePrice: '',
  unitOfMeasure: '',
  openingStock: '',
  closingStock: '',
  companyId: '',
  description: '',
  status: 'Active',
};
