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
import type { OverdueInvoice } from '../../../types/dashboard.types';
import { COLORS, DASHBOARD_COLORS } from '../../../constants/colors';
import { formatCurrency, formatDate, formatCompactNumber } from '../../../utils/formatters';

interface OverdueInvoicesTableProps {
  data: OverdueInvoice[];
}

const getStatusStyles = (status: OverdueInvoice['status']) => {
  switch (status) {
    case 'Critical':
      return {
        bgcolor: COLORS.errorLight,
        color: COLORS.error,
        border: `1px solid ${COLORS.error}`,
      };
    case 'Overdue':
      return {
        bgcolor: COLORS.warningLight,
        color: COLORS.warning,
        border: `1px solid ${COLORS.warning}`,
      };
    case 'Warning':
      return {
        bgcolor: 'rgba(245, 158, 11, 0.1)',
        color: '#D97706',
        border: '1px solid #D97706',
      };
    default:
      return {
        bgcolor: COLORS.background.default,
        color: COLORS.text.secondary,
        border: `1px solid ${COLORS.border.default}`,
      };
  }
};

const getDaysOverdueColor = (days: number): string => {
  if (days > 10) return DASHBOARD_COLORS.urgency.critical;
  if (days > 5) return DASHBOARD_COLORS.urgency.warning;
  return COLORS.text.secondary;
};

const OverdueInvoicesTable: React.FC<OverdueInvoicesTableProps> = ({ data }) => {
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
          Overdue Invoices
        </Typography>
      </Box>
      <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
        <Table size="small" stickyHeader sx={{ minWidth: isMobile ? 450 : 'auto' }}>
          <TableHead>
            <TableRow>
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
                  Invoice #
                </TableCell>
              )}
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
                {isMobile ? 'Days' : 'Due Date'}
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
            {data.map((invoice) => (
              <TableRow
                key={invoice.id}
                sx={{
                  '&:hover': {
                    backgroundColor: COLORS.table.rowHover,
                  },
                }}
              >
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
                  {invoice.customerName}
                </TableCell>
                {!isMobile && (
                  <TableCell
                    sx={{
                      color: COLORS.text.secondary,
                      fontSize: { xs: 11, sm: 12, md: 13 },
                      py: { xs: 1, sm: 1.25, md: 1.5 },
                      px: { xs: 1, sm: 1.5, md: 2 },
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {invoice.invoiceNumber}
                  </TableCell>
                )}
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
                    ? formatCompactNumber(invoice.amount) 
                    : formatCurrency(invoice.amount)}
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: { xs: 11, sm: 12, md: 13 },
                    py: { xs: 1, sm: 1.25, md: 1.5 },
                    px: { xs: 1, sm: 1.5, md: 2 },
                  }}
                >
                  {isMobile ? (
                    <Typography
                      variant="caption"
                      sx={{
                        color: getDaysOverdueColor(invoice.daysOverdue),
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                    >
                      {invoice.daysOverdue}d
                    </Typography>
                  ) : (
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: COLORS.text.secondary,
                          fontSize: { sm: 12, md: 13 },
                        }}
                      >
                        {formatDate(invoice.dueDate)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: getDaysOverdueColor(invoice.daysOverdue),
                          fontWeight: 600,
                          fontSize: { sm: 10, md: 11 },
                        }}
                      >
                        {invoice.daysOverdue} days overdue
                      </Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell sx={{ py: { xs: 1, sm: 1.25, md: 1.5 }, px: { xs: 1, sm: 1.5, md: 2 } }}>
                  <Chip
                    label={isMobile ? invoice.status.charAt(0) : invoice.status}
                    size="small"
                    sx={{
                      ...getStatusStyles(invoice.status),
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
            No overdue invoices
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default OverdueInvoicesTable;
