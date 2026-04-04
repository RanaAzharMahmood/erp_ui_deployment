import React, { useState, useCallback } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from '@mui/material'
import {
  Download as DownloadIcon,
  TableChart as TableChartIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import { useAuth } from '../../contexts/AuthContext'
import { useCompany } from '../../contexts/CompanyContext'
import { useCompanies } from '../../hooks'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface ReportConfig {
  label: string;
  endpoint: string;
  params: { key: string; label: string; type: 'month' | 'year' | 'date' | 'customerId' | 'bankAccountId' }[];
}

const REPORT_TYPES: Record<string, ReportConfig> = {
  'monthly-tax-report': {
    label: 'Monthly Tax Report',
    endpoint: '/v1/api/reports/monthly-tax-report',
    params: [
      { key: 'month', label: 'Month', type: 'month' },
      { key: 'year', label: 'Year', type: 'year' },
    ],
  },
  'yearly-tax-report': {
    label: 'Yearly Tax Report',
    endpoint: '/v1/api/reports/yearly-tax-report',
    params: [{ key: 'year', label: 'Year', type: 'year' }],
  },
  'company-year-report': {
    label: 'Company Year Report (Purchase & Sales)',
    endpoint: '/v1/api/reports/company-year-report',
    params: [{ key: 'year', label: 'Year', type: 'year' }],
  },
  'daily-expense-sheet': {
    label: 'Daily Expense Sheet',
    endpoint: '/v1/api/reports/daily-expense-sheet',
    params: [
      { key: 'month', label: 'Month', type: 'month' },
      { key: 'year', label: 'Year', type: 'year' },
    ],
  },
  'sales-ledger': {
    label: 'Sales Ledger',
    endpoint: '/v1/api/reports/sales-ledger',
    params: [
      { key: 'customerId', label: 'Customer ID', type: 'customerId' },
      { key: 'startDate', label: 'Start Date', type: 'date' },
      { key: 'endDate', label: 'End Date', type: 'date' },
    ],
  },
  'monthly-stock-sheet': {
    label: 'Monthly Stock Sheet',
    endpoint: '/v1/api/reports/monthly-stock-sheet',
    params: [
      { key: 'month', label: 'Month', type: 'month' },
      { key: 'year', label: 'Year', type: 'year' },
    ],
  },
  'cheque-book-detail': {
    label: 'Cheque Book Detail',
    endpoint: '/v1/api/reports/cheque-book-detail',
    params: [
      { key: 'bankAccountId', label: 'Bank Account ID', type: 'bankAccountId' },
      { key: 'startDate', label: 'Start Date', type: 'date' },
      { key: 'endDate', label: 'End Date', type: 'date' },
    ],
  },
}

const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
  { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
  { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i)

interface ColDef { header: string; key: string; align?: 'left' | 'right'; format?: 'number' }

// Column definitions per report type. "rows" key indicates which field in the response contains the array.
const REPORT_COLUMNS: Record<string, { rowsKey: string; columns: ColDef[] }> = {
  'monthly-tax-report': {
    rowsKey: '_single', // single-object report, render as key-value table
    columns: [
      { header: 'Sale Value (Ex-GST)', key: 'salesExGst', align: 'right', format: 'number' },
      { header: 'GST on Sales', key: 'gstOnSales', align: 'right', format: 'number' },
      { header: 'Total Sale (Inc-GST)', key: 'salesTotalIncGst', align: 'right', format: 'number' },
      { header: 'Purchase Value (Ex-GST)', key: 'purchasesExGst', align: 'right', format: 'number' },
      { header: 'GST on Purchases', key: 'gstOnPurchases', align: 'right', format: 'number' },
      { header: 'Total Purchase (Inc-GST)', key: 'purchasesTotalIncGst', align: 'right', format: 'number' },
      { header: 'Net GST Payable', key: 'netGstPayable', align: 'right', format: 'number' },
    ],
  },
  'yearly-tax-report': {
    rowsKey: 'months',
    columns: [
      { header: 'Month', key: 'month' },
      { header: 'Sales (Ex-GST)', key: 'salesExGst', align: 'right', format: 'number' },
      { header: 'GST on Sales', key: 'gstOnSales', align: 'right', format: 'number' },
      { header: 'Purchases (Ex-GST)', key: 'purchasesExGst', align: 'right', format: 'number' },
      { header: 'GST on Purchases', key: 'gstOnPurchases', align: 'right', format: 'number' },
      { header: 'Net GST', key: 'netGstPayable', align: 'right', format: 'number' },
      { header: 'Tax Paid', key: 'taxPaid', align: 'right', format: 'number' },
      { header: 'Balance', key: 'balancePayable', align: 'right', format: 'number' },
      { header: 'Cumulative', key: 'cumulativeBalance', align: 'right', format: 'number' },
    ],
  },
  'company-year-report': {
    rowsKey: 'months',
    columns: [
      { header: 'Month', key: 'month' },
      { header: 'Sales Qty', key: 'salesQty', align: 'right', format: 'number' },
      { header: 'Sales Rate', key: 'salesRate', align: 'right', format: 'number' },
      { header: 'Sales Ex-Value', key: 'salesExValue', align: 'right', format: 'number' },
      { header: 'Sales GST', key: 'salesGst', align: 'right', format: 'number' },
      { header: 'Sales Total', key: 'salesTotal', align: 'right', format: 'number' },
      { header: 'Purchase Qty', key: 'purchaseQty', align: 'right', format: 'number' },
      { header: 'Purchase Rate', key: 'purchaseRate', align: 'right', format: 'number' },
      { header: 'Purchase Ex-Value', key: 'purchaseExValue', align: 'right', format: 'number' },
      { header: 'Purchase GST', key: 'purchaseGst', align: 'right', format: 'number' },
      { header: 'Purchase Total', key: 'purchaseTotal', align: 'right', format: 'number' },
    ],
  },
  'daily-expense-sheet': {
    rowsKey: 'rows',
    columns: [
      { header: 'Date', key: 'date' },
      { header: 'Description', key: 'description' },
      { header: 'Received', key: 'received', align: 'right', format: 'number' },
      { header: 'Expenses', key: 'expenses', align: 'right', format: 'number' },
      { header: 'Balance', key: 'balance', align: 'right', format: 'number' },
    ],
  },
  'sales-ledger': {
    rowsKey: 'rows',
    columns: [
      { header: 'Date', key: 'date' },
      { header: 'Particular', key: 'particular' },
      { header: 'L.F', key: 'lf' },
      { header: 'Value', key: 'value', align: 'right', format: 'number' },
      { header: 'S.Tax', key: 'salesTax', align: 'right', format: 'number' },
      { header: 'Value+Tax', key: 'valuePlusTax', align: 'right', format: 'number' },
      { header: 'Debit', key: 'debit', align: 'right', format: 'number' },
      { header: 'Credit', key: 'credit', align: 'right', format: 'number' },
      { header: 'DR/CR', key: 'drCr' },
      { header: 'Balance', key: 'balance', align: 'right', format: 'number' },
    ],
  },
  'monthly-stock-sheet': {
    rowsKey: 'rows',
    columns: [
      { header: 'Item Code', key: 'itemCode' },
      { header: 'Item Name', key: 'itemName' },
      { header: 'Unit', key: 'unit' },
      { header: 'Opening', key: 'openingQty', align: 'right', format: 'number' },
      { header: 'Sales Qty', key: 'salesQty', align: 'right', format: 'number' },
      { header: 'Sales Rate', key: 'salesRate', align: 'right', format: 'number' },
      { header: 'Sales Amt', key: 'salesAmount', align: 'right', format: 'number' },
      { header: 'Purch Qty', key: 'purchaseQty', align: 'right', format: 'number' },
      { header: 'Purch Rate', key: 'purchaseRate', align: 'right', format: 'number' },
      { header: 'Purch Amt', key: 'purchaseAmount', align: 'right', format: 'number' },
      { header: 'Closing', key: 'closingQty', align: 'right', format: 'number' },
    ],
  },
  'cheque-book-detail': {
    rowsKey: 'rows',
    columns: [
      { header: 'Sr#', key: 'srNo' },
      { header: 'Date', key: 'date' },
      { header: 'Cheque No', key: 'chequeNumber' },
      { header: 'Cash', key: 'cash', align: 'right', format: 'number' },
    ],
  },
}

function fmtNum(val: unknown): string {
  if (val === null || val === undefined || val === '' || val === 0) return '—'
  const n = Number(val)
  if (isNaN(n)) return String(val)
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const ReportViewerPage: React.FC = () => {
  const { user } = useAuth()
  const { selectedCompany } = useCompany()
  const { companies } = useCompanies()
  const isAdmin = user?.roleName?.toLowerCase() === 'admin'
  const [searchParams] = useSearchParams()

  const initialType = searchParams.get('type') || ''
  const [reportType, setReportType] = useState(initialType)
  const [companyId, setCompanyId] = useState<number | ''>(
    isAdmin ? '' : (selectedCompany?.id || user?.selectedCompanyId || '')
  )
  const [paramValues, setParamValues] = useState<Record<string, string>>({
    month: String(new Date().getMonth() + 1),
    year: String(currentYear),
  })
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const config = reportType ? REPORT_TYPES[reportType] : null

  const setParam = (key: string, value: string) => {
    setParamValues((prev) => ({ ...prev, [key]: value }))
  }

  const buildUrl = useCallback((format?: string) => {
    if (!config) return ''
    const params = new URLSearchParams()
    const cid = companyId || selectedCompany?.id || user?.selectedCompanyId
    if (cid) params.set('companyId', String(cid))
    config.params.forEach((p) => {
      const val = paramValues[p.key]
      if (val) params.set(p.key, val)
    })
    if (format) params.set('format', format)
    return `${API_BASE}${config.endpoint}?${params.toString()}`
  }, [config, companyId, selectedCompany, user, paramValues])

  const handleGenerate = useCallback(async () => {
    if (!config) return
    setIsLoading(true)
    setError(null)
    setData(null)

    try {
      const url = buildUrl()
      const token = localStorage.getItem('erp_token') || localStorage.getItem('auth_token')
      const res = await fetch(url, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Failed to generate report')
      }
      const json = await res.json()
      setData(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
    } finally {
      setIsLoading(false)
    }
  }, [config, buildUrl])

  const handleDownload = useCallback((format: 'excel' | 'pdf') => {
    const url = buildUrl(format)
    const token = localStorage.getItem('erp_token') || localStorage.getItem('auth_token')

    // Use fetch to download with auth
    fetch(url, {
      credentials: 'include',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error('Download failed')
        return res.blob()
      })
      .then((blob) => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `${reportType}.${format === 'excel' ? 'xlsx' : 'pdf'}`
        a.click()
        URL.revokeObjectURL(a.href)
      })
      .catch(() => setError('Download failed. Please try again.'))
  }, [buildUrl, reportType])

  const canGenerate = !!reportType && !!(companyId || selectedCompany?.id || user?.selectedCompanyId)

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <PageHeader title="Report Viewer" showBackButton />

      {/* Report Selection & Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Select Report
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 280 }}>
            <Select
              value={reportType}
              displayEmpty
              onChange={(e) => { setReportType(e.target.value); setData(null); }}
            >
              <MenuItem value="">-- Select Report Type --</MenuItem>
              {Object.entries(REPORT_TYPES).map(([key, cfg]) => (
                <MenuItem key={key} value={key}>{cfg.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {isAdmin && (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={companyId}
                displayEmpty
                onChange={(e) => setCompanyId(e.target.value as number)}
              >
                <MenuItem value="">-- Select Company --</MenuItem>
                {companies.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        {config && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
              Parameters
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {config.params.map((p) => {
                if (p.type === 'month') {
                  return (
                    <FormControl key={p.key} size="small" sx={{ minWidth: 160 }}>
                      <Select value={paramValues[p.key] || ''} onChange={(e) => setParam(p.key, e.target.value)} displayEmpty>
                        <MenuItem value="">-- {p.label} --</MenuItem>
                        {MONTHS.map((m) => <MenuItem key={m.value} value={String(m.value)}>{m.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  )
                }
                if (p.type === 'year') {
                  return (
                    <FormControl key={p.key} size="small" sx={{ minWidth: 120 }}>
                      <Select value={paramValues[p.key] || ''} onChange={(e) => setParam(p.key, e.target.value)} displayEmpty>
                        <MenuItem value="">-- {p.label} --</MenuItem>
                        {YEARS.map((y) => <MenuItem key={y} value={String(y)}>{y}</MenuItem>)}
                      </Select>
                    </FormControl>
                  )
                }
                if (p.type === 'date') {
                  return (
                    <TextField
                      key={p.key}
                      size="small"
                      type="date"
                      label={p.label}
                      value={paramValues[p.key] || ''}
                      onChange={(e) => setParam(p.key, e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ minWidth: 160 }}
                    />
                  )
                }
                return (
                  <TextField
                    key={p.key}
                    size="small"
                    label={p.label}
                    value={paramValues[p.key] || ''}
                    onChange={(e) => setParam(p.key, e.target.value)}
                    sx={{ minWidth: 140 }}
                  />
                )
              })}
            </Box>
          </>
        )}

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={!canGenerate || isLoading}
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{ bgcolor: '#FF6B35', '&:hover': { bgcolor: '#E55A25' }, textTransform: 'none', borderRadius: '8px' }}
          >
            {isLoading ? 'Generating...' : 'Generate Report'}
          </Button>

          {data && (
            <>
              <Button
                variant="outlined"
                startIcon={<TableChartIcon />}
                onClick={() => handleDownload('excel')}
                sx={{ borderColor: '#22C55E', color: '#22C55E', textTransform: 'none', borderRadius: '8px', '&:hover': { borderColor: '#16A34A', bgcolor: '#F0FDF4' } }}
              >
                Download Excel
              </Button>
              <Button
                variant="outlined"
                startIcon={<PdfIcon />}
                onClick={() => handleDownload('pdf')}
                sx={{ borderColor: '#EF4444', color: '#EF4444', textTransform: 'none', borderRadius: '8px', '&:hover': { borderColor: '#DC2626', bgcolor: '#FEF2F2' } }}
              >
                Download PDF
              </Button>
            </>
          )}
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Tabular Results */}
      {data && reportType && (() => {
        const colConfig = REPORT_COLUMNS[reportType]
        if (!colConfig) return null

        // Get rows array from data
        let rows: Record<string, unknown>[]
        if (colConfig.rowsKey === '_single') {
          // Single-object report — render as metric/value table
          rows = colConfig.columns.map((col) => ({ metric: col.header, value: (data as Record<string, unknown>)[col.key] }))
        } else {
          rows = ((data as Record<string, unknown>)[colConfig.rowsKey] as Record<string, unknown>[]) || []
        }

        const isSingle = colConfig.rowsKey === '_single'
        const displayCols = isSingle
          ? [{ header: 'Metric', key: 'metric' }, { header: 'Amount', key: 'value', align: 'right' as const, format: 'number' as const }]
          : colConfig.columns

        return (
          <Paper sx={{ p: 3, borderRadius: '12px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {config?.label} — Results
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" startIcon={<DownloadIcon />} onClick={() => handleDownload('excel')} sx={{ textTransform: 'none', color: '#22C55E' }}>Excel</Button>
                <Button size="small" startIcon={<DownloadIcon />} onClick={() => handleDownload('pdf')} sx={{ textTransform: 'none', color: '#EF4444' }}>PDF</Button>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {displayCols.map((col) => (
                      <TableCell
                        key={col.key}
                        align={col.align === 'right' ? 'right' : 'left'}
                        sx={{ fontWeight: 700, bgcolor: '#F8FAFC', fontSize: '0.8rem' }}
                      >
                        {col.header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={displayCols.length} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No data found for the selected parameters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row, idx) => (
                      <TableRow key={idx} hover sx={{ '&:nth-of-type(odd)': { bgcolor: '#FAFAFA' } }}>
                        {displayCols.map((col) => (
                          <TableCell
                            key={col.key}
                            align={col.align === 'right' ? 'right' : 'left'}
                            sx={{ fontSize: '0.8rem' }}
                          >
                            {col.format === 'number' ? fmtNum(row[col.key]) : String(row[col.key] ?? '')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )
      })()}
    </Box>
  )
}

export default ReportViewerPage
