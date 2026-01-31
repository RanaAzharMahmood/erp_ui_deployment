import { useState, useCallback } from 'react';

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
  autoHideDuration: number;
}

interface UseSnackbarReturn {
  snackbarState: SnackbarState;
  showSnackbar: (message: string, severity?: SnackbarSeverity, duration?: number) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  closeSnackbar: () => void;
}

const defaultState: SnackbarState = {
  open: false,
  message: '',
  severity: 'info',
  autoHideDuration: 5000,
};

/**
 * Hook for managing snackbar notifications
 */
export function useSnackbar(): UseSnackbarReturn {
  const [snackbarState, setSnackbarState] = useState<SnackbarState>(defaultState);

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarSeverity = 'info', duration: number = 5000) => {
      setSnackbarState({
        open: true,
        message,
        severity,
        autoHideDuration: duration,
      });
    },
    []
  );

  const showSuccess = useCallback((message: string) => {
    showSnackbar(message, 'success');
  }, [showSnackbar]);

  const showError = useCallback((message: string) => {
    showSnackbar(message, 'error');
  }, [showSnackbar]);

  const showWarning = useCallback((message: string) => {
    showSnackbar(message, 'warning');
  }, [showSnackbar]);

  const showInfo = useCallback((message: string) => {
    showSnackbar(message, 'info');
  }, [showSnackbar]);

  const closeSnackbar = useCallback(() => {
    setSnackbarState((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    snackbarState,
    showSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeSnackbar,
  };
}

export default useSnackbar;
