import React, { useState, useCallback, useMemo } from 'react';
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
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search as SearchIcon, Print as PrintIcon } from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import PageError from '../../components/common/PageError';
import { useAuth } from '../../contexts/AuthContext';
import {
  getTrialBalanceApi,
  getCompaniesApi,
  TrialBalanceLine,
} from '../../generated/api/client';

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  asset: 'Asset',
  liability: 'Liability',
  equity: 'Equity',
  revenue: 'Revenue',
  cost_of_sales: 'Cost of Sales',
  expense: 'Expense',
};

const ACCOUNT_TYPE_ORDER = ['asset', 'liability', 'equity', 'revenue', 'cost_of_sales', 'expense'];

const ACCOUNT_TYPE_COLORS: Record<string, string> = {
  asset: '#DBEAFE',
  liability: '#FEE2E2',
  equity: '#D1FAE5',
  revenue: '#FEF3C7',
  cost_of_sales: '#FCE7F3',
  expense: '#EDE9FE',
};

const TrialBalancePage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.roleName?.toLowerCase() === 'admin';

  const [companies, setCompanies] = useState<Array<{ id: number; name: string }>>([]);
  const [companiesLoaded, setCompaniesLoaded] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | ''>(
    !isAdmin && user?.selectedCompanyId ? user.selectedCompanyId : ''
  );
  const [asOf, setAsOf] = useState<string>(new Date().toISOString().slice(0, 10));
  const [lines, setLines] = useState<TrialBalanceLine[]>([]);
  const [reportAsOf, setReportAsOf] = useState<string>('');
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [loadError, setLoadError] = useState<unknown>(null);

  // Load companies for admin selector (lazy — on first render)
  React.useEffect(() => {
    if (!isAdmin || companiesLoaded) return;
    const load = async () => {
      try {
        const api = getCompaniesApi();
        const response = await api.v1ApiCompaniesGet();
        if (response.data) {
          const mapped = response.data.map((c: any) => ({ id: c.id, name: c.name || '' }));
          setCompanies(mapped);
          if (mapped.length > 0 && !selectedCompanyId) setSelectedCompanyId(mapped[0].id);
        }
      } catch { /* ignore */ }
      setCompaniesLoaded(true);
    };
    load();
  }, [isAdmin, companiesLoaded, selectedCompanyId]);

  const fetchTrialBalance = useCallback(async () => {
    if (!selectedCompanyId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const api = getTrialBalanceApi();
      const result = await api.getTrialBalance(selectedCompanyId as number, asOf);
      setLines(result.data.lines);
      setTotalDebit(result.data.totalDebit);
      setTotalCredit(result.data.totalCredit);
      setReportAsOf(result.data.asOf);
      setHasRun(true);
    } catch (err) {
      setLoadError(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCompanyId, asOf]);

  // Group lines by account type
  const linesByType = useMemo(() => {
    const groups: Record<string, TrialBalanceLine[]> = {};
    for (const line of lines) {
      if (!groups[line.accountType]) groups[line.accountType] = [];
      groups[line.accountType].push(line);
    }
    return groups;
  }, [lines]);

  const handlePrint = () => window.print();

  if (loadError) {
    return <PageError error={loadError} onRetry={fetchTrialBalance} />;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
      <PageHeader title="Trial Balance" showBackButton />

      {/* Filter bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {isAdmin && (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Company</InputLabel>
              <Select
                value={selectedCompanyId}
                label="Company"
                onChange={(e) => { setSelectedCompanyId(e.target.value as number); setHasRun(false); }}
              >
                {companies.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            label="As of Date"
            type="date"
            value={asOf}
            onChange={(e) => { setAsOf(e.target.value); setHasRun(false); }}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ width: 180 }}
            helperText="View balances up to this date"
          />

          <Button
            variant="contained"
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
            onClick={fetchTrialBalance}
            disabled={isLoading || !selectedCompanyId}
          >
            {isLoading ? 'Loading...' : 'Generate'}
          </Button>

          {hasRun && (
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
              Print
            </Button>
          )}
        </Box>
      </Paper>

      {/* Report */}
      {hasRun && !isLoading && (
        <Paper sx={{ p: 2 }}>
          {/* Report header */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>Trial Balance</Typography>
            <Typography variant="body2" color="text.secondary">
              As of {new Date(reportAsOf + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {lines.length === 0 ? (
            <Alert severity="info">No transactions found up to this date.</Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F3F4F6' }}>
                    <TableCell sx={{ fontWeight: 700, width: 80 }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Account Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 120 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right', width: 140 }}>Debit</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right', width: 140 }}>Credit</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right', width: 140 }}>Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ACCOUNT_TYPE_ORDER.filter((t) => linesByType[t]?.length > 0).map((accountType) => (
                    <React.Fragment key={accountType}>
                      {/* Section header */}
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          sx={{
                            bgcolor: ACCOUNT_TYPE_COLORS[accountType] ?? '#F3F4F6',
                            fontWeight: 700,
                            fontSize: '13px',
                            py: 0.75,
                          }}
                        >
                          {ACCOUNT_TYPE_LABELS[accountType] ?? accountType}
                        </TableCell>
                      </TableRow>

                      {linesByType[accountType].map((line) => (
                        <TableRow key={line.accountId} hover>
                          <TableCell sx={{ fontSize: '13px', color: '#6B7280' }}>{line.accountCode}</TableCell>
                          <TableCell sx={{ fontSize: '13px' }}>{line.accountName}</TableCell>
                          <TableCell>
                            <Chip
                              label={ACCOUNT_TYPE_LABELS[line.accountType] ?? line.accountType}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '11px' }}
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right', fontSize: '13px' }}>
                            {line.totalDebit > 0
                              ? line.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                              : '—'}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right', fontSize: '13px' }}>
                            {line.totalCredit > 0
                              ? line.totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                              : '—'}
                          </TableCell>
                          <TableCell sx={{
                            textAlign: 'right',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: line.balance >= 0 ? '#1F2937' : '#EF4444',
                          }}>
                            {Math.abs(line.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            {line.balance < 0 ? ' CR' : ''}
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}

                  {/* Grand totals */}
                  <TableRow sx={{ bgcolor: '#1F2937' }}>
                    <TableCell colSpan={3} sx={{ color: '#fff', fontWeight: 700 }}>TOTAL</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700, textAlign: 'right' }}>
                      {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 700, textAlign: 'right' }}>
                      {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell sx={{
                      color: Math.abs(totalDebit - totalCredit) < 0.01 ? '#4ADE80' : '#F87171',
                      fontWeight: 700,
                      textAlign: 'right',
                    }}>
                      {Math.abs(totalDebit - totalCredit) < 0.01
                        ? 'Balanced'
                        : Math.abs(totalDebit - totalCredit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* Empty state before first run */}
      {!hasRun && !isLoading && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Typography>Select a date and click Generate to view the trial balance.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default TrialBalancePage;
