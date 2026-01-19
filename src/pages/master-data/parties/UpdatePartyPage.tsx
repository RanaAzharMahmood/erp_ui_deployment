import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Grid,
  TextField,
  Button,
  Snackbar,
  Alert,
  Card,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Circle as CircleIcon,
  Add as AddIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import FormSection from '../../../components/common/FormSection';
import StatusSelector from '../../../components/common/StatusSelector';
import DangerZone from '../../../components/common/DangerZone';

interface PartyFormData {
  partyName: string;
  partyType: 'Customer' | 'Vendor' | '';
  ntnNumber: string;
  taxOffice: string;
  salesTaxNumber: string;
  address: string;
  contactName: string;
  contactCnic: string;
  contactEmail: string;
  contactNumber: string;
  principalActivity: string;
  companyId: number | '';
  status: 'Active' | 'Inactive';
}

const UpdatePartyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PartyFormData>({
    partyName: '',
    partyType: '',
    ntnNumber: '',
    taxOffice: '',
    salesTaxNumber: '',
    address: '',
    contactName: '',
    contactCnic: '',
    contactEmail: '',
    contactNumber: '',
    principalActivity: '',
    companyId: '',
    status: 'Active',
  });
  const [companies, setCompanies] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Load companies and party data
  useEffect(() => {
    const loadData = () => {
      try {
        // Load companies
        const savedCompanies = localStorage.getItem('companies');
        if (savedCompanies) {
          const parsed = JSON.parse(savedCompanies);
          setCompanies(parsed.map((c: any) => ({ id: c.id, name: c.companyName })));
        }

        // Load party data
        const savedParties = localStorage.getItem('parties');
        if (savedParties && id) {
          const parties = JSON.parse(savedParties);
          const party = parties.find((p: any) => p.id === id);
          if (party) {
            setFormData({
              partyName: party.partyName || '',
              partyType: party.partyType || '',
              ntnNumber: party.ntnNumber || '',
              taxOffice: party.taxOffice || '',
              salesTaxNumber: party.salesTaxNumber || '',
              address: party.address || '',
              contactName: party.contactName || '',
              contactCnic: party.contactCnic || '',
              contactEmail: party.contactEmail || '',
              contactNumber: party.contactNumber || '',
              principalActivity: party.principalActivity || '',
              companyId: party.companyId || '',
              status: party.isActive ? 'Active' : 'Inactive',
            });
            if (party.companyId) {
              setSelectedCompanies([party.companyId]);
            }
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSelectChange = useCallback((name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleStatusChange = useCallback((status: 'Active' | 'Inactive') => {
    setFormData((prev) => ({ ...prev, status }));
  }, []);

  const handleAddCompany = useCallback(() => {
    if (formData.companyId && !selectedCompanies.includes(formData.companyId as number)) {
      setSelectedCompanies((prev) => [...prev, formData.companyId as number]);
    }
  }, [formData.companyId, selectedCompanies]);

  const handleSubmit = useCallback(async () => {
    // Validation
    if (!formData.partyName || !formData.partyType || !formData.ntnNumber ||
        !formData.salesTaxNumber || !formData.contactName || !formData.contactCnic ||
        !formData.contactNumber) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Update in localStorage
      const parties = JSON.parse(localStorage.getItem('parties') || '[]');
      const company = companies.find(c => c.id === formData.companyId);

      const updatedParties = parties.map((p: any) => {
        if (p.id === id) {
          return {
            ...p,
            partyName: formData.partyName,
            partyType: formData.partyType,
            ntnNumber: formData.ntnNumber,
            taxOffice: formData.taxOffice,
            salesTaxNumber: formData.salesTaxNumber,
            address: formData.address,
            contactName: formData.contactName,
            contactCnic: formData.contactCnic,
            contactEmail: formData.contactEmail,
            contactNumber: formData.contactNumber,
            principalActivity: formData.principalActivity,
            companyId: formData.companyId,
            companyName: company?.name || p.companyName,
            isActive: formData.status === 'Active',
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });

      localStorage.setItem('parties', JSON.stringify(updatedParties));

      setSuccessMessage('Party updated successfully!');
      setTimeout(() => {
        navigate('/party');
      }, 1500);
    } catch (err) {
      console.error('Error updating party:', err);
      setError('Failed to update party. Please try again.');
      setIsSubmitting(false);
    }
  }, [formData, companies, id, navigate]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Are you sure you want to delete this party? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const parties = JSON.parse(localStorage.getItem('parties') || '[]');
      const updatedParties = parties.filter((p: any) => p.id !== id);
      localStorage.setItem('parties', JSON.stringify(updatedParties));

      setSuccessMessage('Party deleted successfully!');
      setTimeout(() => {
        navigate('/party');
      }, 1500);
    } catch (err) {
      console.error('Error deleting party:', err);
      setError('Failed to delete party. Please try again.');
      setIsDeleting(false);
    }
  }, [id, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/party');
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto', bgcolor: '#F9FAFB', minHeight: '100vh' }}>
      <PageHeader title="Update Party" showBackButton />

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          {/* Party Details */}
          <FormSection title="Party Details" icon={<BusinessIcon />}>
            <Divider sx={{ mb: 3, mt: -1 }} />
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Party Name *
                </Typography>
                <TextField
                  fullWidth
                  name="partyName"
                  value={formData.partyName}
                  onChange={handleInputChange}
                  placeholder="EST Gas"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Party Type *
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.partyType}
                    onChange={(e) => handleSelectChange('partyType', e.target.value)}
                    displayEmpty
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="" disabled>Select Party</MenuItem>
                    <MenuItem value="Customer">Customer</MenuItem>
                    <MenuItem value="Vendor">Vendor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  NTN Number *
                </Typography>
                <TextField
                  fullWidth
                  name="ntnNumber"
                  value={formData.ntnNumber}
                  onChange={handleInputChange}
                  placeholder="00000000"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Tax Office
                </Typography>
                <TextField
                  fullWidth
                  name="taxOffice"
                  value={formData.taxOffice}
                  onChange={handleInputChange}
                  placeholder="Lahore"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Sales Tex Number *
                </Typography>
                <TextField
                  fullWidth
                  name="salesTaxNumber"
                  value={formData.salesTaxNumber}
                  onChange={handleInputChange}
                  placeholder="000-0000"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Address
                </Typography>
                <TextField
                  fullWidth
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Write Your Address"
                  multiline
                  rows={4}
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                />
              </Grid>
            </Grid>
          </FormSection>

          <Box sx={{ mt: 3 }}>
            {/* Customer Details */}
            <FormSection title="Customer Details" icon={<PersonIcon />}>
              <Divider sx={{ mb: 3, mt: -1 }} />
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Name *
                  </Typography>
                  <TextField
                    fullWidth
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    placeholder="Harry John"
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    CNIC *
                  </Typography>
                  <TextField
                    fullWidth
                    name="contactCnic"
                    value={formData.contactCnic}
                    onChange={handleInputChange}
                    placeholder="00000-0000000-0"
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Email
                  </Typography>
                  <TextField
                    fullWidth
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    placeholder="example@example.com"
                    type="email"
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Contact Number *
                  </Typography>
                  <TextField
                    fullWidth
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="+92 000 0000000"
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Principal Activity
                  </Typography>
                  <TextField
                    fullWidth
                    name="principalActivity"
                    value={formData.principalActivity}
                    onChange={handleInputChange}
                    placeholder="Sales Agent,"
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Select Company
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.companyId}
                      onChange={(e) => handleSelectChange('companyId', e.target.value)}
                      displayEmpty
                      sx={{ bgcolor: 'white' }}
                    >
                      <MenuItem value="">Select Company</MenuItem>
                      {companies.map((company) => (
                        <MenuItem key={company.id} value={company.id}>
                          {company.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </FormSection>
          </Box>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Status with Company Selection */}
          <Card sx={{ p: 2.5, mb: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  bgcolor: 'rgba(255, 107, 53, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BusinessIcon sx={{ color: '#FF6B35', fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Status
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {selectedCompanies.map((compId) => {
              const comp = companies.find(c => c.id === compId);
              return (
                <Box key={compId} sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Select Company
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={compId}
                      sx={{ bgcolor: 'white' }}
                      disabled
                    >
                      <MenuItem value={compId}>{comp?.name || 'EST Gas'}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              );
            })}

            {selectedCompanies.length === 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Select Company
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.companyId}
                    onChange={(e) => handleSelectChange('companyId', e.target.value)}
                    displayEmpty
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="">Select Company</MenuItem>
                    {companies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddCompany}
              sx={{
                mb: 1,
                borderColor: '#E5E7EB',
                color: '#374151',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#D1D5DB',
                  bgcolor: '#F9FAFB',
                },
              }}
            >
              Add Company
            </Button>
          </Card>

          {/* Status */}
          <FormSection title="Status" icon={<CircleIcon />} sx={{ mb: 3 }}>
            <Divider sx={{ mb: 2, mt: -1 }} />
            <StatusSelector
              value={formData.status}
              onChange={handleStatusChange}
              options={['Active', 'Inactive']}
            />
          </FormSection>

          {/* Danger Zone */}
          <DangerZone
            onDelete={handleDelete}
            itemName="Party"
            isDeleting={isDeleting}
          />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleCancel}
              disabled={isSubmitting}
              sx={{
                py: 1.5,
                textTransform: 'none',
                borderColor: '#E5E7EB',
                color: '#374151',
                '&:hover': {
                  borderColor: '#D1D5DB',
                  bgcolor: '#F9FAFB',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              startIcon={<SaveIcon />}
              sx={{
                py: 1.5,
                textTransform: 'none',
                bgcolor: '#FF6B35',
                '&:hover': {
                  bgcolor: '#E55A2B',
                },
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UpdatePartyPage;
