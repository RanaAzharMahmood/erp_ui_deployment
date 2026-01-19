import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Print as PrintIcon,
  GridOn as GridIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import TableSkeleton from '../../../components/common/TableSkeleton';

// Parent Account Structure
const PARENT_ACCOUNTS = {
  Assets: [
    {
      code: '110',
      name: 'Current Assets',
      children: [
        { code: '111', name: 'Cash', systemName: 'Cash' },
        { code: '112', name: 'Bank', systemName: 'Bank' },
        { code: '113', name: 'Inventory', systemName: 'Inventory' },
      ],
    },
    {
      code: '120',
      name: 'Non Current Assets',
      children: [
        { code: '121', name: 'Fixed Assets', systemName: 'Fixed Assets' },
      ],
    },
  ],
  Liabilities: [
    {
      code: '200',
      name: 'Current Liabilities',
      children: [],
    },
    {
      code: '210',
      name: 'Non Current Liabilities',
      children: [],
    },
  ],
  Equity: [
    {
      code: '202',
      name: 'Equity',
      children: [],
    },
  ],
  Revenue: [
    {
      code: '300',
      name: 'Revenue',
      children: [],
    },
  ],
  Expenses: [
    {
      code: '400',
      name: 'Direct Cost',
      children: [],
    },
    {
      code: '410',
      name: 'Depreciation',
      children: [],
    },
    {
      code: '420',
      name: 'Expense',
      children: [],
    },
  ],
};

interface Account {
  id: string;
  code: string;
  name: string;
  systemName: string;
  parentCode: string;
  accountType: 'Assets' | 'Liabilities' | 'Equity' | 'Revenue' | 'Expenses';
  balance: number;
  companyId?: number;
  companyName: string;
  createdAt: string;
}

const ChartOfAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [expandedSections, setExpandedSections] = useState<string[]>(['110', '111', '112', '120', '121', '202', '400', '410', '420']);
  const [companies, setCompanies] = useState<Array<{ id: number; name: string }>>([]);

  const tabs = ['All', 'Asset', 'Equity', 'Expenses', 'Liabilities', 'Revenue'];

  // Load accounts and companies
  useEffect(() => {
    const loadData = () => {
      try {
        const savedAccounts = localStorage.getItem('chartOfAccounts');
        if (savedAccounts) {
          setAccounts(JSON.parse(savedAccounts));
        }

        const savedCompanies = localStorage.getItem('companies');
        if (savedCompanies) {
          const parsed = JSON.parse(savedCompanies);
          setCompanies(parsed.map((c: { id: number; companyName: string }) => ({
            id: c.id,
            name: c.companyName,
          })));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    setTimeout(loadData, 500);
  }, []);

  const handleAddAccount = useCallback(() => {
    navigate('/account/chart-of-account/add');
  }, [navigate]);

  const handleEditAccount = useCallback((id: string) => {
    navigate(`/account/chart-of-account/update/${id}`);
  }, [navigate]);

  const handleDeleteAccount = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      const updatedAccounts = accounts.filter((a) => a.id !== id);
      setAccounts(updatedAccounts);
      localStorage.setItem('chartOfAccounts', JSON.stringify(updatedAccounts));
    }
  }, [accounts]);

  const toggleSection = useCallback((code: string) => {
    setExpandedSections((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }, []);

  // Filter accounts by tab
  const getFilteredAccountType = useCallback(() => {
    switch (selectedTab) {
      case 1: return 'Assets';
      case 2: return 'Equity';
      case 3: return 'Expenses';
      case 4: return 'Liabilities';
      case 5: return 'Revenue';
      default: return null;
    }
  }, [selectedTab]);

  const filteredAccounts = useMemo(() => {
    const accountType = getFilteredAccountType();
    return accounts.filter((account) => {
      const matchesSearch =
        !searchTerm ||
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = !accountType || account.accountType === accountType;
      const matchesCompany = !selectedCompany || account.companyName === selectedCompany;

      return matchesSearch && matchesType && matchesCompany;
    });
  }, [accounts, searchTerm, selectedCompany, getFilteredAccountType]);

  // Group accounts by parent
  const groupedAccounts = useMemo(() => {
    const groups: Record<string, Account[]> = {};
    filteredAccounts.forEach((account) => {
      if (!groups[account.parentCode]) {
        groups[account.parentCode] = [];
      }
      groups[account.parentCode].push(account);
    });
    return groups;
  }, [filteredAccounts]);

  // Calculate totals by account type
  const calculateTypeTotal = useCallback((type: string) => {
    return filteredAccounts
      .filter((a) => a.accountType === type)
      .reduce((sum, a) => sum + (a.balance || 0), 0);
  }, [filteredAccounts]);

  // Calculate parent total
  const calculateParentTotal = useCallback((parentCode: string) => {
    return filteredAccounts
      .filter((a) => a.parentCode === parentCode)
      .reduce((sum, a) => sum + (a.balance || 0), 0);
  }, [filteredAccounts]);

  const renderAccountRow = (account: Account) => (
    <Box
      key={account.id}
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 1.5,
        px: 2,
        borderBottom: '1px solid #E5E7EB',
        '&:hover': { bgcolor: '#F9FAFB' },
      }}
    >
      <Typography sx={{ width: '15%', pl: 6, color: '#6B7280', fontSize: '14px' }}>
        {account.code}
      </Typography>
      <Typography sx={{ width: '25%', fontSize: '14px' }}>
        {account.name}
      </Typography>
      <Typography sx={{ width: '20%', color: '#FF6B35', fontSize: '14px' }}>
        {account.systemName}
      </Typography>
      <Typography sx={{ width: '20%', fontSize: '14px', textAlign: 'right' }}>
        {account.balance.toLocaleString()} PKR
      </Typography>
      <Box sx={{ width: '20%', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <IconButton size="small" sx={{ color: '#6B7280' }}>
          <DescriptionIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => handleEditAccount(account.id)} sx={{ color: '#6B7280' }}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => handleDeleteAccount(account.id)} sx={{ color: '#EF4444' }}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );

  const renderParentSection = (parent: { code: string; name: string; children?: { code: string; name: string; systemName: string }[] }, type: string) => {
    const isExpanded = expandedSections.includes(parent.code);
    const childAccounts = groupedAccounts[parent.code] || [];
    const total = calculateParentTotal(parent.code);

    return (
      <Box key={parent.code}>
        {/* Parent Row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 1.5,
            px: 2,
            borderBottom: '1px solid #E5E7EB',
            cursor: 'pointer',
            '&:hover': { bgcolor: '#F9FAFB' },
          }}
          onClick={() => toggleSection(parent.code)}
        >
          <Box sx={{ width: '15%', display: 'flex', alignItems: 'center', pl: 2 }}>
            {isExpanded ? <ExpandLessIcon fontSize="small" sx={{ mr: 1 }} /> : <ExpandMoreIcon fontSize="small" sx={{ mr: 1 }} />}
          </Box>
          <Typography sx={{ width: '25%', fontWeight: 500, fontSize: '14px' }}>
            {parent.name}
          </Typography>
          <Typography sx={{ width: '20%' }}></Typography>
          <Typography sx={{ width: '20%', fontSize: '14px', textAlign: 'right' }}>
            {total.toLocaleString()} PKR
          </Typography>
          <Box sx={{ width: '20%', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/account/chart-of-account/add?parent=${parent.code}&type=${type}`);
              }}
              sx={{
                color: '#FF6B35',
                textTransform: 'none',
                fontSize: '12px',
              }}
            >
              Add A New Account
            </Button>
          </Box>
        </Box>

        {/* Child Accounts */}
        <Collapse in={isExpanded}>
          {childAccounts.map((account) => renderAccountRow(account))}
          {parent.children?.map((child) => {
            const childAccountsForSubParent = groupedAccounts[child.code] || [];
            const childTotal = calculateParentTotal(child.code);
            const isChildExpanded = expandedSections.includes(child.code);

            return (
              <Box key={child.code}>
                {/* Sub-parent Row */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    py: 1.5,
                    px: 2,
                    borderBottom: '1px solid #E5E7EB',
                    bgcolor: '#FAFAFA',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#F5F5F5' },
                  }}
                  onClick={() => toggleSection(child.code)}
                >
                  <Box sx={{ width: '15%', display: 'flex', alignItems: 'center', pl: 4 }}>
                    {isChildExpanded ? <ExpandLessIcon fontSize="small" sx={{ mr: 1 }} /> : <ExpandMoreIcon fontSize="small" sx={{ mr: 1 }} />}
                  </Box>
                  <Typography sx={{ width: '25%', fontWeight: 500, fontSize: '14px', color: '#6B7280' }}>
                    {child.name}
                  </Typography>
                  <Typography sx={{ width: '20%' }}></Typography>
                  <Typography sx={{ width: '20%', fontSize: '14px', textAlign: 'right' }}>
                    {childTotal.toLocaleString()} PKR
                  </Typography>
                  <Box sx={{ width: '20%', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/account/chart-of-account/add?parent=${child.code}&type=${type}`);
                      }}
                      sx={{
                        color: '#FF6B35',
                        textTransform: 'none',
                        fontSize: '12px',
                      }}
                    >
                      Add A New Account
                    </Button>
                  </Box>
                </Box>

                {/* Sub-child Accounts */}
                <Collapse in={isChildExpanded}>
                  {childAccountsForSubParent.map((account) => renderAccountRow(account))}
                </Collapse>
              </Box>
            );
          })}
        </Collapse>
      </Box>
    );
  };

  const renderAccountTypeSection = (type: keyof typeof PARENT_ACCOUNTS) => {
    const parents = PARENT_ACCOUNTS[type];
    const total = calculateTypeTotal(type);

    return (
      <Box key={type} sx={{ mb: 2 }}>
        {/* Type Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 2,
            px: 2,
            borderBottom: '2px solid #E5E7EB',
            bgcolor: '#FAFAFA',
          }}
        >
          <Typography sx={{ width: '60%', fontWeight: 600, fontSize: '16px' }}>
            {type === 'Expenses' ? 'Expense' : type}
          </Typography>
          <Typography sx={{ width: '20%', fontWeight: 600, fontSize: '16px', textAlign: 'right' }}>
            {total.toLocaleString()}
          </Typography>
          <Box sx={{ width: '20%' }}></Box>
        </Box>

        {/* Parent Sections */}
        {parents.map((parent) => renderParentSection(parent, type))}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Chart of Account</Typography>
        <TableSkeleton rows={10} columns={5} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Chart of Acount
        </Typography>
      </Box>

      {/* Toolbar */}
      <Card sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            displayEmpty
            sx={{ bgcolor: 'white' }}
          >
            <MenuItem value="">EST Gas</MenuItem>
            {companies.map((company) => (
              <MenuItem key={company.id} value={company.name}>{company.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          placeholder="Search"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9CA3AF' }} />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
        />

        <Box sx={{ flexGrow: 1 }} />

        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          sx={{
            borderColor: '#10B981',
            color: '#10B981',
            textTransform: 'none',
            '&:hover': { borderColor: '#059669', bgcolor: 'rgba(16, 185, 129, 0.04)' },
          }}
        >
          Print List
        </Button>

        <Button
          variant="outlined"
          startIcon={<GridIcon />}
          sx={{
            borderColor: '#10B981',
            color: '#10B981',
            textTransform: 'none',
            '&:hover': { borderColor: '#059669', bgcolor: 'rgba(16, 185, 129, 0.04)' },
          }}
        >
          Export To CSV
        </Button>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddAccount}
          sx={{
            bgcolor: '#FF6B35',
            textTransform: 'none',
            '&:hover': { bgcolor: '#E55A2B' },
          }}
        >
          Add Account
        </Button>
      </Card>

      {/* Tabs */}
      <Box sx={{ mb: 2 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, value) => setSelectedTab(value)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              minWidth: 100,
              fontWeight: 500,
            },
            '& .Mui-selected': {
              bgcolor: '#FF6B35',
              color: 'white !important',
              borderRadius: '4px 4px 0 0',
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab} label={tab} />
          ))}
        </Tabs>
      </Box>

      {/* Table Header */}
      <Card sx={{ boxShadow: 'none', border: '1px solid #E5E7EB' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 1.5,
            px: 2,
            borderBottom: '2px solid #E5E7EB',
            bgcolor: '#F9FAFB',
          }}
        >
          <Typography sx={{ width: '15%', fontWeight: 600, fontSize: '14px', color: '#374151' }}>
            Code
          </Typography>
          <Typography sx={{ width: '25%', fontWeight: 600, fontSize: '14px', color: '#374151' }}>
            Name
          </Typography>
          <Typography sx={{ width: '20%', fontWeight: 600, fontSize: '14px', color: '#374151' }}>
            System Name
          </Typography>
          <Typography sx={{ width: '20%', fontWeight: 600, fontSize: '14px', color: '#374151', textAlign: 'right' }}>
            Balance
          </Typography>
          <Typography sx={{ width: '20%', fontWeight: 600, fontSize: '14px', color: '#374151', textAlign: 'right' }}>
            Actions
          </Typography>
        </Box>

        {/* Account Sections */}
        {selectedTab === 0 ? (
          <>
            {renderAccountTypeSection('Assets')}
            {renderAccountTypeSection('Liabilities')}
            {renderAccountTypeSection('Equity')}
            {renderAccountTypeSection('Expenses')}
            {renderAccountTypeSection('Revenue')}
          </>
        ) : (
          renderAccountTypeSection(
            selectedTab === 1 ? 'Assets' :
            selectedTab === 2 ? 'Equity' :
            selectedTab === 3 ? 'Expenses' :
            selectedTab === 4 ? 'Liabilities' : 'Revenue'
          )
        )}
      </Card>
    </Box>
  );
};

export default ChartOfAccountPage;
