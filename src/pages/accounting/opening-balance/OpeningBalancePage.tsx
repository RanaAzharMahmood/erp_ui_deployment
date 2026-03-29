import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TextField,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Save as SaveIcon, AccountBalance as AccountBalanceIcon } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import TableSkeleton from '../../../components/common/TableSkeleton';
import PageError from '../../../components/common/PageError';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getOpeningBalanceApi,
  getCompaniesApi,
  ChartOfAccount,
  OpeningBalanceEntry,
} from '../../../generated/api/client';

interface RowState {
  accountId: number;
  debit: string;
  credit: string;
}

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  asset: 'Asset',
  liability: 'Liability',
  equity: 'Equity',
  revenue: 'Revenue',
  cost_of_sales: 'Cost of Sales',
  expense: 'Expense',
};

const ACCOUNT_TYPE_ORDER = ['asset', 'liability', 'equity', 'revenue', 'cost_of_sales', 'expense'];

const OpeningBalancePage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.roleName?.toLowerCase() === 'admin';

  // For non-admin, use their selectedCompanyId directly
  // For admin, show a company selector
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | ''>(
    !isAdmin && user?.selectedCompanyId ? user.selectedCompanyId : ''
  );
  const [companies, setCompanies] = useState<Array<{ id: number; name: string }>>([]);

  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [rows, setRows] = useState<RowState[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [hasExisting, setHasExisting] = useState(false);
  const [existingEntryNumber, setExistingEntryNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Load companies list (for admin selector)
  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      try {
        const api = getCompaniesApi();
        const response = await api.v1ApiCompaniesGet();
        if (response.data) {
          const mapped = response.data.map((c: any) => ({ id: c.id, name: c.name || '' }));
          setCompanies(mapped);
          if (mapped.length > 0) setSelectedCompanyId(mapped[0].id);
        }
      } catch {
        // non-critical — admin can try again
      }
    };
    load();
  }, [isAdmin]);

  const loadData = useCallback(async (companyId: number) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const api = getOpeningBalanceApi();
      const result = await api.getOpeningBalances(companyId);
      const { openingBalance, accounts: fetchedAccounts } = result.data;

      setAccounts(fetchedAccounts);

      const existingMap: Record<number, { debit: number; credit: number }> = {};
      if (openingBalance) {
        setHasExisting(true);
        setExistingEntryNumber(openingBalance.entryNumber);
        setDate(openingBalance.date.slice(0, 10));
        for (const line of openingBalance.lines) {
          existingMap[line.accountId] = { debit: line.debit, credit: line.credit };
        }
      } else {
        setHasExisting(false);
        setExistingEntryNumber('');
      }

      setRows(
        fetchedAccounts.map((a) => ({
          accountId: a.id,
          debit: existingMap[a.id]?.debit ? String(existingMap[a.id].debit) : '',
          credit: existingMap[a.id]?.credit ? String(existingMap[a.id].credit) : '',
        }))
      );
    } catch (err) {
      setLoadError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadData(selectedCompanyId);
    }
  }, [selectedCompanyId, loadData]);

  const handleDebitChange = (accountId: number, value: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.accountId === accountId
          ? { ...r, debit: value, credit: value ? '' : r.credit }
          : r
      )
    );
  };

  const handleCreditChange = (accountId: number, value: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.accountId === accountId
          ? { ...r, credit: value, debit: value ? '' : r.debit }
          : r
      )
    );
  };

  const totalDebit = useMemo(() => rows.reduce((s, r) => s + (parseFloat(r.debit) || 0), 0), [rows]);
  const totalCredit = useMemo(() => rows.reduce((s, r) => s + (parseFloat(r.credit) || 0), 0), [rows]);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference < 0.01;

  const handleSave = async () => {
    if (!selectedCompanyId) return;
    setIsSaving(true);
    try {
      const api = getOpeningBalanceApi();
      const entries: OpeningBalanceEntry[] = rows
        .filter((r) => parseFloat(r.debit) > 0 || parseFloat(r.credit) > 0)
        .map((r) => ({
          accountId: r.accountId,
          debit: parseFloat(r.debit) || 0,
          credit: parseFloat(r.credit) || 0,
        }));

      await api.saveOpeningBalances(selectedCompanyId, entries, date);
      setHasExisting(true);
      setSnackbar({ open: true, message: 'Opening balances saved successfully!', severity: 'success' });
      await loadData(selectedCompanyId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save opening balances';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const accountsByType = useMemo(() => {
    const groups: Record<string, ChartOfAccount[]> = {};
    for (const a of accounts) {
      if (!groups[a.accountType]) groups[a.accountType] = [];
      groups[a.accountType].push(a);
    }
    return groups;
  }, [accounts]);

  const rowByAccountId = useMemo(() => {
    const map: Record<number, RowState> = {};
    for (const r of rows) map[r.accountId] = r;
    return map;
  }, [rows]);

  if (loadError) {
    return <PageError error={loadError} onRetry={() => selectedCompanyId && loadData(selectedCompanyId)} />;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader title="Opening Balance" showBackButton />

      {hasExisting && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Opening balance already exists (Entry: <strong>{existingEntryNumber}</strong>). Saving again will replace it.
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <AccountBalanceIcon color="primary" />
          <Typography variant="h6">Opening Balance Entry</Typography>
          <Box sx={{ flexGrow: 1 }} />

          {/* Company selector — admin only */}
          {isAdmin && (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Company</InputLabel>
              <Select
                value={selectedCompanyId}
                label="Company"
                onChange={(e) => setSelectedCompanyId(e.target.value as number)}
              >
                {companies.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            label="Entry Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ width: 180 }}
          />
        </Box>

        {/* No company selected yet */}
        {!selectedCompanyId && (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">Select a company to view opening balances.</Typography>
          </Box>
        )}

        {/* Loading skeleton */}
        {selectedCompanyId && isLoading && <TableSkeleton rows={10} columns={5} />}

        {/* Account table */}
        {selectedCompanyId && !isLoading && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F3F4F6' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Account Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Debit (DR)</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Credit (CR)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ACCOUNT_TYPE_ORDER.filter((t) => accountsByType[t]?.length > 0).map((accountType) => (
                  <React.Fragment key={accountType}>
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        sx={{ bgcolor: '#E5E7EB', fontWeight: 700, fontSize: '13px', py: 0.75 }}
                      >
                        {ACCOUNT_TYPE_LABELS[accountType] ?? accountType}
                      </TableCell>
                    </TableRow>
                    {accountsByType[accountType].map((account) => {
                      const row = rowByAccountId[account.id];
                      return (
                        <TableRow key={account.id} hover>
                          <TableCell sx={{ fontSize: '13px', color: '#6B7280' }}>{account.accountCode}</TableCell>
                          <TableCell sx={{ fontSize: '13px' }}>{account.accountName}</TableCell>
                          <TableCell>
                            <Chip
                              label={ACCOUNT_TYPE_LABELS[account.accountType] ?? account.accountType}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '11px' }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={row?.debit ?? ''}
                              onChange={(e) => handleDebitChange(account.id, e.target.value)}
                              placeholder="0.00"
                              inputProps={{ min: 0, step: '0.01', style: { textAlign: 'right' } }}
                              sx={{ width: 130 }}
                              disabled={!!row?.credit}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={row?.credit ?? ''}
                              onChange={(e) => handleCreditChange(account.id, e.target.value)}
                              placeholder="0.00"
                              inputProps={{ min: 0, step: '0.01', style: { textAlign: 'right' } }}
                              sx={{ width: 130 }}
                              disabled={!!row?.debit}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                ))}

                {/* Totals row */}
                <TableRow sx={{ bgcolor: '#F9FAFB', borderTop: '2px solid #E5E7EB' }}>
                  <TableCell colSpan={3} sx={{ fontWeight: 700 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right', color: '#1F2937' }}>
                    {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right', color: '#1F2937' }}>
                    {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>

                {/* Difference row */}
                {!isBalanced && (totalDebit > 0 || totalCredit > 0) && (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ color: '#EF4444', fontWeight: 600 }}>
                      Difference (DR must equal CR to save)
                    </TableCell>
                    <TableCell colSpan={2} sx={{ color: '#EF4444', fontWeight: 600, textAlign: 'right' }}>
                      {difference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {selectedCompanyId && !isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={!isBalanced || isSaving || totalDebit === 0}
            >
              {isSaving ? 'Saving...' : 'Save Opening Balances'}
            </Button>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OpeningBalancePage;
