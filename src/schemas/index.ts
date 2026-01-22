/**
 * Zod Validation Schemas for ERP Application
 *
 * This file contains all validation schemas for form validation across the ERP app.
 * Each schema exports both the Zod schema and the inferred TypeScript type.
 *
 * Note: Zod must be installed: npm install zod
 */

import { z } from 'zod';

// ============================================================================
// Common Validation Patterns
// ============================================================================

/**
 * Phone number validation - accepts various formats
 * Examples: +92-300-1234567, 0300-1234567, 03001234567
 */
const phoneRegex = /^(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}$/;

/**
 * CNIC validation - Pakistani National ID format
 * Format: XXXXX-XXXXXXX-X or 13 digits without dashes
 */
const cnicRegex = /^(\d{5}-\d{7}-\d{1}|\d{13})$/;

/**
 * NTN Number validation - National Tax Number format
 * Accepts alphanumeric with optional dashes
 */
const ntnRegex = /^[A-Za-z0-9-]{5,20}$/;

// ============================================================================
// Status Enums
// ============================================================================

export const statusSchema = z.enum(['Active', 'Prospect', 'Inactive']);
export const activeInactiveSchema = z.enum(['Active', 'Inactive']);
export const partyTypeSchema = z.enum(['Customer', 'Vendor', '']);

export type Status = z.infer<typeof statusSchema>;
export type ActiveInactiveStatus = z.infer<typeof activeInactiveSchema>;
export type PartyType = z.infer<typeof partyTypeSchema>;

// ============================================================================
// Customer Schema (aligned with backend API model)
// ============================================================================

export const customerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(150, 'Name must be less than 150 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(phoneRegex, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(1000, 'Address must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .max(120, 'City must be less than 120 characters')
    .optional()
    .or(z.literal('')),
  state: z
    .string()
    .max(120, 'State must be less than 120 characters')
    .optional()
    .or(z.literal('')),
  country: z
    .string()
    .max(120, 'Country must be less than 120 characters')
    .optional()
    .or(z.literal('')),
  postalCode: z
    .string()
    .max(20, 'Postal code must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  taxId: z
    .string()
    .max(50, 'Tax ID must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  creditLimit: z
    .union([z.string(), z.number()])
    .refine(
      (val) => val === '' || (typeof val === 'number' && val >= 0) || (!isNaN(Number(val)) && Number(val) >= 0),
      'Credit limit must be a non-negative number'
    )
    .optional()
    .or(z.literal('')),
  paymentTerms: z
    .string()
    .max(100, 'Payment terms must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  companyId: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== null && val !== undefined, 'Company is required'),
  status: activeInactiveSchema,
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

// ============================================================================
// Vendor Schema (aligned with backend API model)
// ============================================================================

export const vendorSchema = z.object({
  name: z
    .string()
    .min(1, 'Vendor name is required')
    .max(200, 'Vendor name must be less than 200 characters'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(50, 'Phone must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(1000, 'Address must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .max(100, 'City must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  state: z
    .string()
    .max(100, 'State must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  country: z
    .string()
    .max(100, 'Country must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  postalCode: z
    .string()
    .max(20, 'Postal code must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  taxId: z
    .string()
    .max(50, 'Tax ID must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  paymentTerms: z
    .string()
    .max(100, 'Payment terms must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  bankName: z
    .string()
    .max(200, 'Bank name must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  bankAccountNo: z
    .string()
    .max(50, 'Bank account number must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  companyId: z
    .number()
    .positive('Company ID must be a positive number')
    .optional(),
  isActive: z.boolean(),
});

export type VendorFormValues = z.infer<typeof vendorSchema>;

// ============================================================================
// Item/Inventory Schema
// ============================================================================

export const itemSchema = z.object({
  itemCode: z
    .string()
    .min(1, 'Item code is required')
    .max(50, 'Item code must be less than 50 characters'),
  itemHashCode: z
    .string()
    .max(50, 'Item hash code must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  itemName: z
    .string()
    .min(1, 'Item name is required')
    .max(150, 'Item name must be less than 150 characters'),
  categoryId: z.union([
    z.number().positive('Please select a category'),
    z.literal(''),
  ]),
  unitPrice: z
    .string()
    .refine(
      (val) => val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
      'Unit price must be a valid positive number'
    )
    .optional()
    .or(z.literal('')),
  purchasePrice: z
    .string()
    .refine(
      (val) => val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
      'Purchase price must be a valid positive number'
    )
    .optional()
    .or(z.literal('')),
  salePrice: z
    .string()
    .refine(
      (val) => val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
      'Sale price must be a valid positive number'
    )
    .optional()
    .or(z.literal('')),
  unitOfMeasure: z
    .string()
    .max(50, 'Unit of measure must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  openingStock: z
    .string()
    .refine(
      (val) => val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
      'Opening stock must be a valid positive number'
    )
    .optional()
    .or(z.literal('')),
  closingStock: z
    .string()
    .refine(
      (val) => val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
      'Closing stock must be a valid positive number'
    )
    .optional()
    .or(z.literal('')),
  companyId: z.union([
    z.number().positive('Please select a company'),
    z.literal(''),
  ]).optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  status: statusSchema,
});

export type ItemFormValues = z.infer<typeof itemSchema>;

// ============================================================================
// Tax Schema
// ============================================================================

export const taxSchema = z.object({
  taxId: z
    .string()
    .min(1, 'Tax ID is required')
    .max(50, 'Tax ID must be less than 50 characters'),
  taxName: z
    .string()
    .max(100, 'Tax name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  taxPercentage: z
    .string()
    .min(1, 'Tax percentage is required')
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0 && num <= 100;
      },
      'Tax percentage must be between 0 and 100'
    ),
  taxDate: z
    .string()
    .optional()
    .or(z.literal('')),
  note: z
    .string()
    .max(500, 'Note must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  status: statusSchema,
});

export type TaxFormValues = z.infer<typeof taxSchema>;

// ============================================================================
// Category Schema
// ============================================================================

export const categorySchema = z.object({
  categoryName: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be less than 100 characters'),
  companyId: z.union([
    z.number().positive('Please select a company'),
    z.literal(''),
  ]).optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  status: activeInactiveSchema,
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

// ============================================================================
// Party Schema
// ============================================================================

export const partySchema = z.object({
  partyName: z
    .string()
    .min(1, 'Party name is required')
    .max(150, 'Party name must be less than 150 characters'),
  partyType: z.union([
    z.literal('Customer'),
    z.literal('Vendor'),
    z.literal(''),
  ]).refine((val) => val !== '', 'Party type is required'),
  ntnNumber: z
    .string()
    .min(1, 'NTN number is required')
    .regex(ntnRegex, 'Please enter a valid NTN number'),
  taxOffice: z
    .string()
    .max(100, 'Tax office must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  salesTaxNumber: z
    .string()
    .min(1, 'Sales tax number is required')
    .max(30, 'Sales tax number must be less than 30 characters'),
  address: z
    .string()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  contactName: z
    .string()
    .min(1, 'Contact name is required')
    .max(100, 'Contact name must be less than 100 characters'),
  contactCnic: z
    .string()
    .min(1, 'Contact CNIC is required')
    .regex(cnicRegex, 'Please enter a valid CNIC (e.g., 12345-1234567-1)'),
  contactEmail: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  contactNumber: z
    .string()
    .min(1, 'Contact number is required')
    .regex(phoneRegex, 'Please enter a valid phone number'),
  principalActivity: z
    .string()
    .max(200, 'Principal activity must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  companyId: z.union([
    z.number().positive('Please select a company'),
    z.literal(''),
  ]).optional(),
  status: activeInactiveSchema,
});

export type PartyFormValues = z.infer<typeof partySchema>;

// ============================================================================
// User Schema
// ============================================================================

export const userSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(phoneRegex, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  cnic: z
    .string()
    .regex(cnicRegex, 'Please enter a valid CNIC (e.g., 12345-1234567-1)')
    .optional()
    .or(z.literal('')),
  about: z
    .string()
    .max(500, 'About must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  status: activeInactiveSchema,
});

export type UserFormValues = z.infer<typeof userSchema>;

// User schema with password (for registration/create)
export const userWithPasswordSchema = userSchema.extend({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type UserWithPasswordFormValues = z.infer<typeof userWithPasswordSchema>;

// ============================================================================
// Company Schema
// ============================================================================

export const companySchema = z.object({
  companyName: z
    .string()
    .min(1, 'Company name is required')
    .max(150, 'Company name must be less than 150 characters'),
  ntnNumber: z
    .string()
    .min(1, 'NTN number is required')
    .regex(ntnRegex, 'Please enter a valid NTN number'),
  industry: z
    .string()
    .min(1, 'Industry is required')
    .max(100, 'Industry must be less than 100 characters'),
  website: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  salesTaxNumber: z
    .string()
    .max(30, 'Sales tax number must be less than 30 characters')
    .optional()
    .or(z.literal('')),
  companyEmail: z
    .string()
    .min(1, 'Company email is required')
    .email('Please enter a valid email address'),
  address: z
    .string()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  contactName: z
    .string()
    .max(100, 'Contact name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  contactEmail: z
    .string()
    .email('Please enter a valid contact email')
    .optional()
    .or(z.literal('')),
  contactPhone: z
    .string()
    .regex(phoneRegex, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  status: statusSchema,
  logo: z.string().optional(),
  user: z.string().optional(),
  subscriptionEnd: z.string().optional(),
});

export type CompanyFormValues = z.infer<typeof companySchema>;

// ============================================================================
// Login Schema
// ============================================================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validates form data against a schema and returns formatted errors
 * @param schema - Zod schema to validate against
 * @param data - Form data to validate
 * @returns Object with isValid flag and errors record
 */
export function validateForm<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { isValid: boolean; errors: Record<string, string>; data?: z.infer<T> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { isValid: true, errors: {}, data: result.data };
  }

  const errors: Record<string, string> = {};
  // Safely iterate over errors with null check
  const errorList = result.error?.errors ?? [];
  errorList.forEach((err) => {
    const path = err.path.join('.');
    if (path && !errors[path]) {
      errors[path] = err.message;
    }
  });

  return { isValid: false, errors };
}

/**
 * Gets the first error message for a specific field
 * @param errors - Zod validation errors
 * @param fieldName - Name of the field to get error for
 * @returns Error message or empty string
 */
export function getFieldError(
  errors: z.ZodError | null | undefined,
  fieldName: string
): string {
  if (!errors) return '';

  const fieldError = errors.errors.find(
    (err) => err.path.join('.') === fieldName
  );

  return fieldError?.message || '';
}

/**
 * Creates a validation function that can be used with form libraries
 * @param schema - Zod schema to validate against
 * @returns Validation function
 */
export function createValidator<T extends z.ZodSchema>(schema: T) {
  return (data: unknown): Record<string, string> | null => {
    const result = schema.safeParse(data);

    if (result.success) {
      return null;
    }

    const errors: Record<string, string> = {};
    result.error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (path && !errors[path]) {
        errors[path] = err.message;
      }
    });

    return errors;
  };
}
