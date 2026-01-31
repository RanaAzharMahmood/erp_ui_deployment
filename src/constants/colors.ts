/**
 * Centralized color constants for the ERP UI application.
 * Use these constants instead of hardcoded color values throughout the codebase.
 */

// Primary brand colors
export const COLORS = {
  // Primary orange - main action buttons, highlights
  primary: '#FF6B35',
  primaryHover: '#E55A2B',

  // Success/Green - positive actions, active status, edit buttons
  success: '#4CAF50',
  successHover: '#43A047',
  successLight: 'rgba(76, 175, 80, 0.1)',
  successBorder: '#4CAF50',

  // Edit alias (maps to success)
  edit: '#4CAF50',
  editHover: '#43A047',

  // Error/Red - destructive actions, error states, inactive status, delete buttons
  error: '#EF5350',
  errorHover: '#E53935',
  errorLight: 'rgba(239, 83, 80, 0.1)',
  errorBorder: '#EF5350',

  // Delete alias (maps to error)
  delete: '#EF5350',
  deleteHover: '#E53935',

  // Warning/Yellow - warnings, pending states
  warning: '#FF9800',
  warningLight: 'rgba(255, 152, 0, 0.1)',

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
    profit: 'rgba(76, 175, 80, 0.1)',      // Green light (updated to match success)
    stock: 'rgba(139, 92, 246, 0.1)',      // Purple light
    receivable: 'rgba(255, 152, 0, 0.1)',  // Yellow light (updated to match warning)
    payable: 'rgba(239, 83, 80, 0.1)',     // Red light (updated to match error)
  },
  kpiIcons: {
    sales: '#FF6B35',
    purchase: '#3B82F6',
    profit: '#4CAF50',    // Updated to match success
    stock: '#8B5CF6',
    receivable: '#FF9800', // Updated to match warning
    payable: '#EF5350',    // Updated to match error
  },
  charts: {
    sales: '#FF6B35',
    purchases: '#3B82F6',
    inventory: '#4CAF50', // Updated to match success
    product1: '#FF6B35',
    product2: '#3B82F6',
    product3: '#4CAF50',  // Updated to match success
    product4: '#8B5CF6',
  },
  urgency: {
    critical: '#EF5350',  // Updated to match error
    warning: '#FF9800',   // Updated to match warning
    low: '#4CAF50',       // Updated to match success
  },
} as const;

export default COLORS;
