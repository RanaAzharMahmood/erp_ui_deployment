import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  ChevronRight as ChevronRightIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

interface ReportItem {
  label: string;
  path: string;
  params?: Record<string, string>;
}

interface ReportCategory {
  title: string;
  items: ReportItem[];
}

const ALL_CATEGORIES: ReportCategory[] = [
  {
    title: 'Sales Reports',
    items: [
      { label: 'Monthly Sales Report', path: '/reports/general-ledger', params: { type: 'sales', period: 'monthly' } },
      { label: 'Quarter Sales Report', path: '/reports/general-ledger', params: { type: 'sales', period: 'quarterly' } },
      { label: 'Annual Sales Report', path: '/reports/general-ledger', params: { type: 'sales', period: 'annual' } },
    ],
  },
  {
    title: 'Purchase Reports',
    items: [
      { label: 'Monthly Purchase Report', path: '/reports/general-ledger', params: { type: 'purchase', period: 'monthly' } },
      { label: 'Quarter Purchase Report', path: '/reports/general-ledger', params: { type: 'purchase', period: 'quarterly' } },
      { label: 'Annual Purchase Report', path: '/reports/general-ledger', params: { type: 'purchase', period: 'annual' } },
    ],
  },
  {
    title: 'Tax Reports',
    items: [
      { label: 'Monthly Tax Report', path: '/reports/general-ledger', params: { type: 'tax', period: 'monthly' } },
      { label: 'Quarter Tax Report', path: '/reports/general-ledger', params: { type: 'tax', period: 'quarterly' } },
      { label: 'Annual Tax Report', path: '/reports/general-ledger', params: { type: 'tax', period: 'annual' } },
    ],
  },
  {
    title: 'Audit Reports',
    items: [
      { label: 'Monthly Audit Report', path: '/reports/general-ledger', params: { type: 'audit', period: 'monthly' } },
      { label: 'Quarter Audit Report', path: '/reports/general-ledger', params: { type: 'audit', period: 'quarterly' } },
      { label: 'Annual Audit Report', path: '/reports/general-ledger', params: { type: 'audit', period: 'annual' } },
    ],
  },
];

const ACCOUNTING_REPORTS: ReportItem[] = [
  { label: 'General Ledger', path: '/reports/general-ledger' },
  { label: 'Trial Balance', path: '/reports/trial-balance' },
];

const ReportsHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const query = search.toLowerCase();

  const filteredCategories = ALL_CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) => item.label.toLowerCase().includes(query)),
  })).filter((cat) => cat.title.toLowerCase().includes(query) || cat.items.length > 0);

  const filteredAccounting = ACCOUNTING_REPORTS.filter((r) =>
    r.label.toLowerCase().includes(query)
  );

  const handleNavigate = (item: ReportItem) => {
    if (item.params) {
      const params = new URLSearchParams(item.params);
      navigate(`${item.path}?${params.toString()}`);
    } else {
      navigate(item.path);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Reports
      </Typography>

      {/* Top bar */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          sx={{ borderRadius: '8px', borderColor: '#E0E0E0', color: '#555', textTransform: 'none' }}
        >
          Filter
        </Button>
        <Box sx={{ flex: 1 }} />
        <TextField
          size="small"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: '#9E9E9E' }} />
              </InputAdornment>
            ),
          }}
          sx={{ width: 240 }}
        />
      </Paper>

      {/* Accounting reports row */}
      {filteredAccounting.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Paper sx={{ borderRadius: '12px', overflow: 'hidden' }}>
            <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AccountBalanceIcon sx={{ color: '#FF6B35', fontSize: 28 }} />
              <Typography variant="subtitle1" fontWeight={700}>
                Accounting Reports
              </Typography>
            </Box>
            <Divider />
            <List disablePadding>
              {filteredAccounting.map((item, idx) => (
                <React.Fragment key={item.label}>
                  {idx > 0 && <Divider />}
                  <ListItemButton
                    onClick={() => handleNavigate(item)}
                    sx={{
                      py: 1.5,
                      px: 2.5,
                      bgcolor: '#FFF5F0',
                      '&:hover': { bgcolor: '#FFE8DC' },
                    }}
                  >
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: '14px', color: '#333' }}
                    />
                    <ChevronRightIcon sx={{ color: '#FF6B35', fontSize: 20 }} />
                  </ListItemButton>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
      )}

      {/* Category grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        {filteredCategories.map((category) => (
          <Paper key={category.title} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
            {/* Card header */}
            <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AccountBalanceIcon sx={{ color: '#FF6B35', fontSize: 28 }} />
              <Typography variant="subtitle1" fontWeight={700}>
                {category.title}
              </Typography>
            </Box>
            <Divider />

            {/* Items */}
            <List disablePadding>
              {category.items.map((item, idx) => (
                <React.Fragment key={item.label}>
                  {idx > 0 && <Divider />}
                  <ListItemButton
                    onClick={() => handleNavigate(item)}
                    sx={{
                      py: 1.5,
                      px: 2.5,
                      bgcolor: '#FFF5F0',
                      '&:hover': { bgcolor: '#FFE8DC' },
                    }}
                  >
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: '14px', color: '#333' }}
                    />
                    <ChevronRightIcon sx={{ color: '#FF6B35', fontSize: 20 }} />
                  </ListItemButton>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default ReportsHubPage;
