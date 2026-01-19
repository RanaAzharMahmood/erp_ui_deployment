/**
 * Centralized color constants for the ERP UI application.
 * Use these constants instead of hardcoded color values throughout the codebase.
 */

// Primary brand colors
export const COLORS = {
  // Primary orange - main action buttons, highlights
  primary: '#FF6B35',
  primaryHover: '#E55A2B',

  // Success/Green - positive actions, active status
  success: '#10B981',
  successHover: '#059669',
  successLight: 'rgba(16, 185, 129, 0.1)',
  successBorder: '#10B981',

  // Error/Red - destructive actions, error states, inactive status
  error: '#EF4444',
  errorHover: '#DC2626',
  errorLight: 'rgba(239, 68, 68, 0.1)',
  errorBorder: '#EF4444',

  // Warning/Yellow - warnings, pending states
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.1)',

  // Neutral/Gray palette
  text: {
    primary: '#374151',
    secondary: '#6B7280',
    muted: '#9CA3AF',
    disabled: '#D1D5DB',
  },

  // Background colors
  background: {
    default: '#F9FAFB',
    paper: '#FFFFFF',
    hover: 'rgba(16, 185, 129, 0.04)',
  },

  // Border colors
  border: {
    default: '#E5E7EB',
    light: '#F3F4F6',
    dark: '#D1D5DB',
  },

  // Table colors
  table: {
    headerBg: '#F9FAFB',
    rowHover: '#F3F4F6',
    border: '#E5E7EB',
  },

  // Sidebar colors
  sidebar: {
    background: '#374151',
    backgroundDark: '#1F2937',
    text: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.7)',
    hoverBg: 'rgba(255, 255, 255, 0.08)',
    activeBg: 'rgba(255, 107, 53, 0.15)',
    activeText: '#FF6B35',
    divider: 'rgba(255, 255, 255, 0.1)',
  },
} as const;

// Status chip styles helper
export const getStatusChipStyles = (status: 'Active' | 'Inactive' | 'Submit' | 'Reject' | 'Pending') => {
  switch (status) {
    case 'Active':
    case 'Submit':
      return {
        bgcolor: COLORS.successLight,
        color: COLORS.success,
        border: `1px solid ${COLORS.successBorder}`,
      };
    case 'Inactive':
    case 'Reject':
      return {
        bgcolor: COLORS.errorLight,
        color: COLORS.error,
        border: `1px solid ${COLORS.errorBorder}`,
      };
    case 'Pending':
      return {
        bgcolor: COLORS.warningLight,
        color: COLORS.warning,
        border: `1px solid ${COLORS.warning}`,
      };
    default:
      return {
        bgcolor: COLORS.background.default,
        color: COLORS.text.secondary,
        border: `1px solid ${COLORS.border.default}`,
      };
  }
};

// Common button styles
export const buttonStyles = {
  primary: {
    bgcolor: COLORS.primary,
    '&:hover': { bgcolor: COLORS.primaryHover },
  },
  success: {
    borderColor: COLORS.success,
    color: COLORS.success,
    '&:hover': {
      borderColor: COLORS.successHover,
      bgcolor: COLORS.background.hover,
    },
  },
  outlined: {
    borderColor: COLORS.border.default,
    color: COLORS.text.primary,
  },
};

// Dashboard-specific colors
export const DASHBOARD_COLORS = {
  kpiBackgrounds: {
    sales: 'rgba(255, 107, 53, 0.1)',      // Orange light
    purchase: 'rgba(59, 130, 246, 0.1)',   // Blue light
    profit: 'rgba(16, 185, 129, 0.1)',     // Green light
    stock: 'rgba(139, 92, 246, 0.1)',      // Purple light
    receivable: 'rgba(245, 158, 11, 0.1)', // Yellow light
    payable: 'rgba(239, 68, 68, 0.1)',     // Red light
  },
  kpiIcons: {
    sales: '#FF6B35',
    purchase: '#3B82F6',
    profit: '#10B981',
    stock: '#8B5CF6',
    receivable: '#F59E0B',
    payable: '#EF4444',
  },
  charts: {
    sales: '#FF6B35',
    purchases: '#3B82F6',
    inventory: '#10B981',
    product1: '#FF6B35',
    product2: '#3B82F6',
    product3: '#10B981',
    product4: '#8B5CF6',
  },
  urgency: {
    critical: '#EF4444',
    warning: '#F59E0B',
    low: '#10B981',
  },
} as const;

export default COLORS;
