import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Divider,
  CircularProgress,
  Alert,
  ClickAwayListener,
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  TableChart as TableChartIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import {
  getJournalEntriesApi,
  getCompaniesApi,
  JournalEntry,
  JournalEntryLine,
} from '../../generated/api/client';

// ── Types ──────────────────────────────────────────────────────────────────────

interface GLRow {
  date: string;
  account: string;
  voucherNo: string;
  voucherType: string;
  debit: number;
  credit: number;
  balance: number;
}

interface FilterState {
  companyId: number | '';
  dateFrom: string;
  dateTo: string;
  status: string;
  reference: string;
}

// ── Filter Panel ───────────────────────────────────────────────────────────────

interface FilterPanelProps {
  filters: FilterState;
  companies: Array<{ id: number; name: string }>;
  onApply: (f: FilterState) => void;
  onClose: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, companies, onApply, onClose }) => {
  const [local, setLocal] = useState<FilterState>(filters);

  const set = (key: keyof FilterState, value: string | number) =>
    setLocal((prev) => ({ ...prev, [key]: value }));

  const handleClear = () =>
    setLocal({ companyId: '', dateFrom: '', dateTo: '', status: '', reference: '' });

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '100%',
        left: 0,
        zIndex: 1300,
        mt: 1,
        width: 480,
        bgcolor: '#fff',
        border: '2px solid #FF6B35',
        borderRadius: '12px',
        p: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}
    >
      {/* Company */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, gap: 2 }}>
        <Typography sx={{ width: 100, fontSize: 14, color: '#555', flexShrink: 0 }}>Company</Typography>
        <FormControl size="small" sx={{ flex: 1 }}>
          <Select
            value={local.companyId}
            displayEmpty
            onChange={(e) => set('companyId', e.target.value as number)}
            MenuProps={{ disablePortal: true }}
          >
            <MenuItem value=""><em>All</em></MenuItem>
            {companies.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Date Range */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2.5, gap: 2 }}>
        <Typography sx={{ width: 100, fontSize: 14, color: '#555', flexShrink: 0, pt: 1 }}>Date Range</Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flex: 1 }}>
          <TextField
            size="small"
            type="date"
            value={local.dateFrom}
            onChange={(e) => set('dateFrom', e.target.value)}
            InputLabelProps={{ shrink: true }}
            label="From"
            sx={{ flex: 1, minWidth: 0 }}
          />
          <TextField
            size="small"
            type="date"
            value={local.dateTo}
            onChange={(e) => set('dateTo', e.target.value)}
            InputLabelProps={{ shrink: true }}
            label="To"
            sx={{ flex: 1, minWidth: 0 }}
          />
        </Box>
      </Box>

      {/* Reference */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, gap: 2 }}>
        <Typography sx={{ width: 100, fontSize: 14, color: '#555', flexShrink: 0 }}>Reference</Typography>
        <TextField
          size="small"
          sx={{ flex: 1 }}
          placeholder="All"
          value={local.reference}
          onChange={(e) => set('reference', e.target.value)}
        />
      </Box>

      {/* Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Typography sx={{ width: 100, fontSize: 14, color: '#555', flexShrink: 0 }}>Status</Typography>
        <FormControl size="small" sx={{ flex: 1 }}>
          <Select
            value={local.status}
            displayEmpty
            onChange={(e) => set('status', e.target.value as string)}
            MenuProps={{ disablePortal: true }}
          >
            <MenuItem value=""><em>All</em></MenuItem>
            <MenuItem value="posted">Posted</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="void">Void</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button
          size="small"
          startIcon={<SaveIcon sx={{ fontSize: 16 }} />}
          sx={{ color: '#555', textTransform: 'none' }}
        >
          Save Filter
        </Button>
        <Button
          size="small"
          onClick={handleClear}
          sx={{ color: '#555', textTransform: 'none' }}
        >
          Clear Filter
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={() => { onApply(local); onClose(); }}
          sx={{
            bgcolor: '#FF6B35',
            '&:hover': { bgcolor: '#E55A25' },
            textTransform: 'none',
            borderRadius: '8px',
          }}
        >
          Apply Filter
        </Button>
      </Box>
    </Box>
  );
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function buildGLRows(entries: JournalEntry[]): GLRow[] {
  const rows: GLRow[] = [];
  let runningBalance = 0;

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  for (const entry of sorted) {
    const lines: JournalEntryLine[] = entry.lines ?? [];
    for (const line of lines) {
      runningBalance += line.debit - line.credit;
      rows.push({
        date: entry.date,
        account: line.accountName ?? `Account #${line.accountId}`,
        voucherNo: entry.entryNumber,
        voucherType: entry.reference ?? entry.description ?? 'Journal',
        debit: line.debit,
        credit: line.credit,
        balance: runningBalance,
      });
    }
  }

  return rows;
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

function fmt(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Page ───────────────────────────────────────────────────────────────────────

const GeneralLedgerPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.roleName?.toLowerCase() === 'admin';

  const [companies, setCompanies] = useState<Array<{ id: number; name: string }>>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const defaultCompanyId = user?.selectedCompanyId || '';

  const [activeFilters, setActiveFilters] = useState<FilterState>({
    companyId: defaultCompanyId,
    dateFrom: '',
    dateTo: '',
    status: 'posted',
    reference: '',
  });

  const [rows, setRows] = useState<GLRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportMeta, setReportMeta] = useState({ companyName: '', dateFrom: '', dateTo: '' });

  // Load companies for admin
  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      try {
        const api = getCompaniesApi();
        const res = await api.v1ApiCompaniesGet();
        const raw = res?.data;
        const list: any[] = Array.isArray(raw) ? raw : Array.isArray((raw as any)?.data) ? (raw as any).data : [];
        const mapped = list.map((c: any) => ({ id: c.id, name: c.name || c.companyName || '' }));
        setCompanies(mapped);
        if (mapped.length > 0 && !activeFilters.companyId) {
          setActiveFilters((prev) => ({ ...prev, companyId: mapped[0].id }));
        }
      } catch { /* ignore */ }
    };
    load();
  }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = useCallback(async () => {
    if (!activeFilters.companyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const api = getJournalEntriesApi();
      const res = await api.getAll({
        companyId: activeFilters.companyId as number,
        dateFrom: activeFilters.dateFrom || undefined,
        dateTo: activeFilters.dateTo || undefined,
        status: (activeFilters.status as any) || undefined,
        includeLines: true,
        limit: 500,
      });

      const entries = res.data?.data ?? [];
      const glRows = buildGLRows(entries);
      setRows(glRows);

      const companyName =
        entries[0]?.companyName ??
        companies.find((c) => c.id === activeFilters.companyId)?.name ??
        '';

      setReportMeta({
        companyName,
        dateFrom: activeFilters.dateFrom,
        dateTo: activeFilters.dateTo,
      });

      setHasRun(true);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [activeFilters, companies]);

  // Export to CSV
  const handleExportCSV = () => {
    const header = ['Date', 'Account', 'Voucher No', 'Voucher Type', 'Debit', 'Credit', 'Balance'];
    const csvRows = rows.map((r) =>
      [
        formatDate(r.date),
        r.account,
        r.voucherNo,
        r.voucherType,
        r.debit.toFixed(2),
        r.credit.toFixed(2),
        r.balance.toFixed(2),
      ].join(',')
    );
    const csv = [header.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `general-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader title="General Ledger" showBackButton />

      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        {/* Left — filter bar + table */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Filter bar */}
          <Paper sx={{ p: 2, mb: 3, overflow: 'visible' }}>
            <Box sx={{ position: 'relative', zIndex: 1200 }} ref={filterRef}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setFilterOpen((v) => !v)}
                sx={{
                  borderRadius: '8px',
                  borderColor: '#E0E0E0',
                  color: '#555',
                  textTransform: 'none',
                }}
              >
                Filter
              </Button>

              {filterOpen && (
                <ClickAwayListener onClickAway={() => setFilterOpen(false)}>
                  <Box sx={{ position: 'relative' }}>
                    <FilterPanel
                      filters={activeFilters}
                      companies={companies}
                      onApply={(f) => {
                        setActiveFilters(f);
                        setHasRun(false);
                      }}
                      onClose={() => setFilterOpen(false)}
                    />
                  </Box>
                </ClickAwayListener>
              )}
            </Box>
          </Paper>

          {/* Generate button */}
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              onClick={fetchData}
              disabled={isLoading || !activeFilters.companyId}
              startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
              sx={{ bgcolor: '#FF6B35', '&:hover': { bgcolor: '#E55A25' }, textTransform: 'none', borderRadius: '8px' }}
            >
              {isLoading ? 'Loading...' : 'Generate Report'}
            </Button>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Report body */}
          {hasRun && !isLoading && (
            <Paper sx={{ p: 3 }}>
              {/* Company logo placeholder + title */}
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    px: 2,
                    py: 1,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: '#FF6B35',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {reportMeta.companyName?.[0] ?? 'C'}
                  </Box>
                  <Typography fontWeight={600} fontSize={14}>
                    {reportMeta.companyName}
                  </Typography>
                </Box>

                <Typography variant="h5" fontWeight={700} align="center" gutterBottom>
                  General Ledger Report
                </Typography>

                {/* Metadata row */}
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 3,
                    mb: 2,
                    fontSize: '13px',
                    color: '#555',
                  }}
                >
                  <span>
                    <b>Company Name:</b>{' '}
                    <span style={{ color: '#333' }}>{reportMeta.companyName || '—'}</span>
                  </span>
                  <span>
                    <b>Status:</b>{' '}
                    <span style={{ color: '#333' }}>{activeFilters.status || 'All'}</span>
                  </span>
                  {activeFilters.reference && (
                    <span>
                      <b>Reference:</b>{' '}
                      <span style={{ color: '#333' }}>{activeFilters.reference}</span>
                    </span>
                  )}
                  {(reportMeta.dateFrom || reportMeta.dateTo) && (
                    <span>
                      <b>Date Range:</b>{' '}
                      <span style={{ color: '#333' }}>
                        {reportMeta.dateFrom
                          ? new Date(reportMeta.dateFrom + 'T00:00:00').toLocaleDateString()
                          : '∞'}{' '}
                        –{' '}
                        {reportMeta.dateTo
                          ? new Date(reportMeta.dateTo + 'T00:00:00').toLocaleDateString()
                          : '∞'}
                      </span>
                    </span>
                  )}
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {rows.length === 0 ? (
                <Alert severity="info">No journal entries found for the selected filters.</Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                        <TableCell sx={{ fontWeight: 700, width: 90 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Account</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 120 }}>Voucher No</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: 130 }}>Voucher type</TableCell>
                        <TableCell sx={{ fontWeight: 700, textAlign: 'right', width: 140 }}>
                          Debit (Total)
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, textAlign: 'right', width: 140 }}>
                          Credit (Total)
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, textAlign: 'right', width: 140 }}>
                          Balance
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell sx={{ fontSize: '13px', color: '#555' }}>
                            {formatDate(row.date)}
                          </TableCell>
                          <TableCell sx={{ fontSize: '13px' }}>{row.account}</TableCell>
                          <TableCell sx={{ fontSize: '13px', color: '#555' }}>{row.voucherNo}</TableCell>
                          <TableCell sx={{ fontSize: '13px' }}>{row.voucherType}</TableCell>
                          <TableCell sx={{ textAlign: 'right', fontSize: '13px' }}>
                            {row.debit > 0 ? `${fmt(row.debit)} PKR` : '—'}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right', fontSize: '13px' }}>
                            {row.credit > 0 ? `${fmt(row.credit)} PKR` : '—'}
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: 'right',
                              fontSize: '13px',
                              fontWeight: 600,
                              color: row.balance >= 0 ? '#1F2937' : '#EF4444',
                            }}
                          >
                            {fmt(Math.abs(row.balance))} PKR
                            {row.balance < 0 ? ' CR' : ''}
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Totals row */}
                      <TableRow sx={{ bgcolor: '#1F2937' }}>
                        <TableCell colSpan={4} sx={{ color: '#fff', fontWeight: 700 }}>
                          TOTAL
                        </TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, textAlign: 'right' }}>
                          {fmt(totalDebit)} PKR
                        </TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, textAlign: 'right' }}>
                          {fmt(totalCredit)} PKR
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            textAlign: 'right',
                            color:
                              Math.abs(totalDebit - totalCredit) < 0.01 ? '#4ADE80' : '#F87171',
                          }}
                        >
                          {Math.abs(totalDebit - totalCredit) < 0.01
                            ? 'Balanced'
                            : `${fmt(Math.abs(totalDebit - totalCredit))} PKR`}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          )}

          {!hasRun && !isLoading && (
            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
              <Typography>Apply filters and click Generate Report to view the ledger.</Typography>
            </Box>
          )}
        </Box>

        {/* Right — action buttons */}
        {hasRun && !isLoading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 7, flexShrink: 0, width: 180 }}>
            <Button
              variant="outlined"
              startIcon={<TableChartIcon />}
              onClick={handleExportCSV}
              sx={{
                borderColor: '#22C55E',
                color: '#22C55E',
                textTransform: 'none',
                borderRadius: '8px',
                py: 1,
                '&:hover': { borderColor: '#16A34A', bgcolor: '#F0FDF4' },
              }}
            >
              Export in CSV
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handlePrint}
              sx={{
                bgcolor: '#FF6B35',
                '&:hover': { bgcolor: '#E55A25' },
                textTransform: 'none',
                borderRadius: '8px',
                py: 1,
              }}
            >
              Download
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GeneralLedgerPage;
