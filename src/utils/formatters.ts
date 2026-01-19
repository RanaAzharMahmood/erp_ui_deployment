/**
 * Formatting utilities for the ERP application
 */

export interface CurrencyFormatOptions {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  showSymbol?: boolean;
}

/**
 * Format a number as currency (PKR by default)
 * @param value - The numeric value to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number,
  options: CurrencyFormatOptions = {}
): string => {
  const {
    locale = 'en-PK',
    currency = 'PKR',
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    showSymbol = true,
  } = options;

  if (showSymbol) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(value);
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
};

/**
 * Format a number with compact notation (e.g., 1.2M, 500K)
 * @param value - The numeric value to format
 * @returns Formatted compact string
 */
export const formatCompactNumber = (value: number): string => {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

/**
 * Format a date string
 * @param dateString - ISO date string
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

/**
 * Format a percentage value
 * @param value - The numeric value (0-100 or 0-1)
 * @param isDecimal - Whether the value is a decimal (0-1) or percentage (0-100)
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value: number,
  isDecimal = false
): string => {
  const percentValue = isDecimal ? value * 100 : value;
  return `${percentValue.toFixed(1)}%`;
};
