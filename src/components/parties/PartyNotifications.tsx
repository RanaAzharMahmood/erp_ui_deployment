import React from 'react';
import { Snackbar, Alert } from '@mui/material';

interface PartyNotificationsProps {
  successMessage: string;
  error: string;
  onCloseSuccess: () => void;
  onCloseError: () => void;
}

const PartyNotifications: React.FC<PartyNotificationsProps> = ({
  successMessage,
  error,
  onCloseSuccess,
  onCloseError,
}) => {
  return (
    <>
      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={onCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={onCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={onCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={onCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PartyNotifications;
