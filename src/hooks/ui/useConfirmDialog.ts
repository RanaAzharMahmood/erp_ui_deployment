import { useState, useCallback } from 'react';

interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  confirmColor: 'primary' | 'error' | 'success';
  onConfirm: () => void;
}

interface UseConfirmDialogReturn {
  dialogState: ConfirmDialogState;
  openDialog: (options: Partial<ConfirmDialogState> & { onConfirm: () => void }) => void;
  closeDialog: () => void;
  confirmAndClose: () => void;
}

const defaultState: ConfirmDialogState = {
  open: false,
  title: 'Confirm Action',
  message: 'Are you sure you want to proceed?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  confirmColor: 'primary',
  onConfirm: () => {},
};

/**
 * Hook for managing confirm dialog state
 */
export function useConfirmDialog(): UseConfirmDialogReturn {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>(defaultState);

  const openDialog = useCallback(
    (options: Partial<ConfirmDialogState> & { onConfirm: () => void }) => {
      setDialogState({
        ...defaultState,
        ...options,
        open: true,
      });
    },
    []
  );

  const closeDialog = useCallback(() => {
    setDialogState((prev) => ({ ...prev, open: false }));
  }, []);

  const confirmAndClose = useCallback(() => {
    dialogState.onConfirm();
    closeDialog();
  }, [dialogState, closeDialog]);

  return {
    dialogState,
    openDialog,
    closeDialog,
    confirmAndClose,
  };
}

export default useConfirmDialog;
