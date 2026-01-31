import React, { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

interface SuspenseRouteProps {
  children: React.ReactNode;
}

/**
 * Page loader component shown while lazy-loaded routes are loading
 */
const PageLoader: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      width: '100%',
    }}
  >
    <CircularProgress
      sx={{
        color: '#FF6B35',
      }}
      size={40}
    />
  </Box>
);

/**
 * Reusable Suspense wrapper for lazy-loaded routes
 * Automatically shows loading spinner while route component loads
 *
 * @example
 * <Route
 *   path="companies"
 *   element={
 *     <SuspenseRoute>
 *       <CompaniesPage />
 *     </SuspenseRoute>
 *   }
 * />
 */
export const SuspenseRoute: React.FC<SuspenseRouteProps> = ({ children }) => {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
};

export default SuspenseRoute;
