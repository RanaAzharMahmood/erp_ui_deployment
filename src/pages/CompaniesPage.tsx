import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Avatar,
  InputAdornment,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface Company {
  id: string;
  companyName: string;
  industry: string;
  user: string;
  status: 'Active' | 'Inactive';
  subscriptionEnd: string;
  logo?: string;
}

const INDUSTRIES = [
  'Gas & Fuel',
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Education',
  'Other',
];

const STATUSES = ['Active', 'Inactive'];

const initialFormState: Omit<Company, 'id'> = {
  companyName: '',
  industry: '',
  user: '',
  status: 'Active',
  subscriptionEnd: '',
  logo: '',
};

const CompaniesPage: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState(initialFormState);

  // Load companies from localStorage
  useEffect(() => {
    const savedCompanies = localStorage.getItem('companies');
    if (savedCompanies) {
      const parsedCompanies = JSON.parse(savedCompanies);
      setCompanies(parsedCompanies);
      setFilteredCompanies(parsedCompanies);
    } else {
      // Initialize with sample data
      const sampleData: Company[] = [
        {
          id: '1',
          companyName: 'Petrozen Gases and Fuels PTV',
          industry: 'Gas & Fuel',
          user: '124',
          status: 'Active',
          subscriptionEnd: '2025-12-31',
        },
        {
          id: '2',
          companyName: 'Petrozen Gases and Fuels PTV',
          industry: 'Gas & Fuel',
          user: '124',
          status: 'Active',
          subscriptionEnd: '2025-12-31',
        },
        {
          id: '3',
          companyName: 'Petrozen Gases and Fuels PTV',
          industry: 'Gas & Fuel',
          user: '124',
          status: 'Active',
          subscriptionEnd: '2025-12-31',
        },
      ];
      setCompanies(sampleData);
      setFilteredCompanies(sampleData);
      localStorage.setItem('companies', JSON.stringify(sampleData));
    }
  }, []);

  // Filter companies based on search and filters
  useEffect(() => {
    let filtered = companies;

    if (searchTerm) {
      filtered = filtered.filter(
        (company) =>
          company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.user.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedIndustry) {
      filtered = filtered.filter((company) => company.industry === selectedIndustry);
    }

    if (selectedStatus) {
      filtered = filtered.filter((company) => company.status === selectedStatus);
    }

    setFilteredCompanies(filtered);
  }, [searchTerm, selectedIndustry, selectedStatus, companies]);

  const handleOpenDialog = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        companyName: company.companyName,
        industry: company.industry,
        user: company.user,
        status: company.status,
        subscriptionEnd: company.subscriptionEnd,
        logo: company.logo || '',
      });
    } else {
      setEditingCompany(null);
      setFormData(initialFormState);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCompany(null);
    setFormData(initialFormState);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.companyName || !formData.industry || !formData.user) {
      alert('Please fill in all required fields');
      return;
    }

    let updatedCompanies: Company[];

    if (editingCompany) {
      updatedCompanies = companies.map((company) =>
        company.id === editingCompany.id
          ? { ...formData, id: editingCompany.id }
          : company
      );
    } else {
      const newCompany: Company = {
        ...formData,
        id: Date.now().toString(),
      };
      updatedCompanies = [...companies, newCompany];
    }

    setCompanies(updatedCompanies);
    localStorage.setItem('companies', JSON.stringify(updatedCompanies));
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      const updatedCompanies = companies.filter((company) => company.id !== id);
      setCompanies(updatedCompanies);
      localStorage.setItem('companies', JSON.stringify(updatedCompanies));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Companies
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/companies/add')}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
            bgcolor: '#FF6B35',
            '&:hover': {
              bgcolor: '#FF8E53',
            },
          }}
        >
          Add Company
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Select Companies</InputLabel>
              <Select
                value={selectedIndustry}
                label="Select Companies"
                onChange={(e) => setSelectedIndustry(e.target.value)}
              >
                <MenuItem value="">All Industries</MenuItem>
                {INDUSTRIES.map((industry) => (
                  <MenuItem key={industry} value={industry}>
                    {industry}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Logo</TableCell>
                <TableCell>Company Name</TableCell>
                <TableCell>Industry</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Subscription End</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      No companies found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company) => (
                  <TableRow key={company.id} hover>
                    <TableCell>
                      <Avatar
                        sx={{
                          bgcolor: 'grey.400',
                          width: 40,
                          height: 40,
                        }}
                        src={company.logo}
                      >
                        {company.logo ? null : '🍎'}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {company.companyName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {company.industry}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {company.user}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={company.status}
                        size="small"
                        sx={{
                          bgcolor:
                            company.status === 'Active'
                              ? 'rgba(76, 175, 80, 0.1)'
                              : 'rgba(158, 158, 158, 0.1)',
                          color:
                            company.status === 'Active'
                              ? 'success.main'
                              : 'text.secondary',
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(company.subscriptionEnd)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(company)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(company.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCompany ? 'Edit Company' : 'Add New Company'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Industry</InputLabel>
              <Select
                name="industry"
                value={formData.industry}
                label="Industry"
                onChange={handleSelectChange}
              >
                {INDUSTRIES.map((industry) => (
                  <MenuItem key={industry} value={industry}>
                    {industry}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="User"
              name="user"
              value={formData.user}
              onChange={handleInputChange}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                label="Status"
                onChange={handleSelectChange}
              >
                {STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Subscription End Date"
              name="subscriptionEnd"
              type="date"
              value={formData.subscriptionEnd}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
            <TextField
              fullWidth
              label="Logo URL (optional)"
              name="logo"
              value={formData.logo}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            {editingCompany ? 'Update' : 'Add'} Company
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompaniesPage;
