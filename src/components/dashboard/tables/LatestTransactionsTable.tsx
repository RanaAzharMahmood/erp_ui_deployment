import React from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { Transaction } from '../../../types/dashboard.types';
import { COLORS } from '../../../constants/colors';
import { formatCurrency, formatDate, formatCompactNumber } from '../../../utils/formatters';

interface LatestTransactionsTableProps {
  data: Transaction[];
}

const getStatusStyles = (status: Transaction['status']) => {
  switch (status) {
    case 'Completed':
      return {
        bgcolor: COLORS.successLight,
        color: COLORS.success,
        border: `1px solid ${COLORS.success}`,
      };
    case 'Pending':
      return {
        bgcolor: COLORS.warningLight,
        color: COLORS.warning,
        border: `1px solid ${COLORS.warning}`,
      };
    case 'Cancelled':
      return {
        bgcolor: COLORS.errorLight,
        color: COLORS.error,
        border: `1px solid ${COLORS.error}`,
      };
    default:
      return {
        bgcolor: COLORS.background.default,
        color: COLORS.text.secondary,
        border: `1px solid ${COLORS.border.default}`,
      };
  }
};

const getTypeStyles = (type: Transaction['type']) => {
  switch (type) {
    case 'Sale':
      return { color: COLORS.success };
    case 'Purchase':
      return { color: '#3B82F6' };
    case 'Return':
      return { color: COLORS.warning };
    case 'Payment':
      return { color: '#8B5CF6' };
    default:
      return { color: COLORS.text.secondary };
  }
};

const LatestTransactionsTable: React.FC<LatestTransactionsTableProps> = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  return (
    <Card
      sx={{
        height: '100%',
        border: `1px solid ${COLORS.border.default}`,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          px: { xs: 1.5, sm: 2, md: 2.5 },
          py: { xs: 1.5, sm: 2 },
          borderBottom: `1px solid ${COLORS.border.default}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: COLORS.text.primary,
            fontWeight: 600,
            fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
          }}
        >
          Latest Transactions
        </Typography>
      </Box>
      <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
        <Table size="small" stickyHeader sx={{ minWidth: isMobile ? 500 : 'auto' }}>
          <TableHead>
            <TableRow>
              {!isMobile && (
                <TableCell
                  sx={{
                    bgcolor: COLORS.table.headerBg,
                    color: COLORS.text.secondary,
                    fontWeight: 600,
                    fontSize: { xs: 10, sm: 11, md: 12 },
                    py: { xs: 1, sm: 1.25, md: 1.5 },
                    px: { xs: 1, sm: 1.5, md: 2 },
                    whiteSpace: 'nowrap',
                  }}
                >
                  Transaction ID
                </TableCell>
              )}
              <TableCell
                sx={{
                  bgcolor: COLORS.table.headerBg,
                  color: COLORS.text.secondary,
                  fontWeight: 600,
                  fontSize: { xs: 10, sm: 11, md: 12 },
                  py: { xs: 1, sm: 1.25, md: 1.5 },
                  px: { xs: 1, sm: 1.5, md: 2 },
                  whiteSpace: 'nowrap',
                }}
              >
                Customer
              </TableCell>
              <TableCell
                sx={{
                  bgcolor: COLORS.table.headerBg,
                  color: COLORS.text.secondary,
                  fontWeight: 600,
                  fontSize: { xs: 10, sm: 11, md: 12 },
                  py: { xs: 1, sm: 1.25, md: 1.5 },
                  px: { xs: 1, sm: 1.5, md: 2 },
                  whiteSpace: 'nowrap',
                }}
              >
                Date
              </TableCell>
              <TableCell
                sx={{
                  bgcolor: COLORS.table.headerBg,
                  color: COLORS.text.secondary,
                  fontWeight: 600,
                  fontSize: { xs: 10, sm: 11, md: 12 },
                  py: { xs: 1, sm: 1.25, md: 1.5 },
                  px: { xs: 1, sm: 1.5, md: 2 },
                  whiteSpace: 'nowrap',
                }}
              >
                Type
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  bgcolor: COLORS.table.headerBg,
                  color: COLORS.text.secondary,
                  fontWeight: 600,
                  fontSize: { xs: 10, sm: 11, md: 12 },
                  py: { xs: 1, sm: 1.25, md: 1.5 },
                  px: { xs: 1, sm: 1.5, md: 2 },
                  whiteSpace: 'nowrap',
                }}
              >
                Amount
              </TableCell>
              <TableCell
                sx={{
                  bgcolor: COLORS.table.headerBg,
                  color: COLORS.text.secondary,
                  fontWeight: 600,
                  fontSize: { xs: 10, sm: 11, md: 12 },
                  py: { xs: 1, sm: 1.25, md: 1.5 },
                  px: { xs: 1, sm: 1.5, md: 2 },
                  whiteSpace: 'nowrap',
                }}
              >
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((transaction) => (
              <TableRow
                key={transaction.id}
                sx={{
                  '&:hover': {
                    backgroundColor: COLORS.table.rowHover,
                  },
                }}
              >
                {!isMobile && (
                  <TableCell
                    sx={{
                      color: COLORS.primary,
                      fontWeight: 500,
                      fontSize: { xs: 11, sm: 12, md: 13 },
                      py: { xs: 1, sm: 1.25, md: 1.5 },
                      px: { xs: 1, sm: 1.5, md: 2 },
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {transaction.transactionId}
                  </TableCell>
                )}
                <TableCell
                  sx={{
                    color: COLORS.text.primary,
                    fontSize: { xs: 11, sm: 12, md: 13 },
                    py: { xs: 1, sm: 1.25, md: 1.5 },
                    px: { xs: 1, sm: 1.5, md: 2 },
                    maxWidth: { xs: 100, sm: 150, md: 'none' },
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {transaction.customerName}
                </TableCell>
                <TableCell
                  sx={{
                    color: COLORS.text.secondary,
                    fontSize: { xs: 11, sm: 12, md: 13 },
                    py: { xs: 1, sm: 1.25, md: 1.5 },
                    px: { xs: 1, sm: 1.5, md: 2 },
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isMobile 
                    ? formatDate(transaction.date, { month: 'short', day: 'numeric' })
                    : formatDate(transaction.date)}
                </TableCell>
                <TableCell sx={{ py: { xs: 1, sm: 1.25, md: 1.5 }, px: { xs: 1, sm: 1.5, md: 2 } }}>
                  <Typography
                    variant="body2"
                    sx={{
                      ...getTypeStyles(transaction.type),
                      fontWeight: 500,
                      fontSize: { xs: 11, sm: 12, md: 13 },
                    }}
                  >
                    {transaction.type}
                  </Typography>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: COLORS.text.primary,
                    fontWeight: 500,
                    fontSize: { xs: 11, sm: 12, md: 13 },
                    py: { xs: 1, sm: 1.25, md: 1.5 },
                    px: { xs: 1, sm: 1.5, md: 2 },
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isMobile || isTablet 
                    ? formatCompactNumber(transaction.amount) 
                    : formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell sx={{ py: { xs: 1, sm: 1.25, md: 1.5 }, px: { xs: 1, sm: 1.5, md: 2 } }}>
                  <Chip
                    label={isMobile ? transaction.status.charAt(0) : transaction.status}
                    size="small"
                    sx={{
                      ...getStatusStyles(transaction.status),
                      fontWeight: 500,
                      fontSize: { xs: 9, sm: 10, md: 11 },
                      height: { xs: 20, sm: 22, md: 24 },
                      minWidth: isMobile ? 24 : 'auto',
                      '& .MuiChip-label': {
                        px: isMobile ? 0.5 : 1,
                      },
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {data.length === 0 && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: COLORS.text.muted, fontSize: { xs: '0.75rem', md: '0.875rem' } }}
          >
            No recent transactions
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default LatestTransactionsTable;
