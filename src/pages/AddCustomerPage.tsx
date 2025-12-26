import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Grid,
  TextField,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  IconButton,
} from '@mui/material';
import {
  ShoppingBag as ShoppingBagIcon,
  Business as BusinessIcon,
  Circle as CircleIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

interface CustomerFormData {
  name: string;
  cnic: string;
  email: string;
  contactNumber: string;
  principalActivity: string;
  companyName: string;
  ntnNumber: string;
  salesTaxNumber: string;
  taxOffice: string;
  address: string;
  status: 'Active' | 'Prospect' | 'Inactive';
}

const initialFormState: CustomerFormData = {
  name: '',
  cnic: '',
  email: '',
  contactNumber: '',
  principalActivity: '',
  companyName: '',
  ntnNumber: '',
  salesTaxNumber: '',
  taxOffice: '',
  address: '',
  status: 'Active',
};

const AddCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CustomerFormData>(initialFormState);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      status: e.target.value as 'Active' | 'Prospect' | 'Inactive',
    }));
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.name || !formData.email || !formData.cnic) {
      alert('Please fill in all required fields');
      return;
    }

    // Get existing customers
    const existingCustomers = JSON.parse(
      localStorage.getItem('customers') || '[]'
    );

    // Create new customer
    const newCustomer = {
      ...formData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Save to localStorage
    localStorage.setItem(
      'customers',
      JSON.stringify([...existingCustomers, newCustomer])
    );

    // Navigate back to customers list
    navigate('/customer');
  };

  const handleCancel = () => {
    navigate('/customer');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton
          onClick={() => navigate('/customer')}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1A1A1A' }}>
          Add Customer
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          {/* Customer Details Card */}
          <Card sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  bgcolor: 'rgba(255, 107, 53, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShoppingBagIcon sx={{ color: '#FF6B35', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Customer Details
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Harry John"
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CNIC"
                  name="cnic"
                  value={formData.cnic}
                  onChange={handleInputChange}
                  placeholder="00000-0000000-0"
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@example.com"
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="+92 000 0000000"
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Principal Activity"
                  name="principalActivity"
                  value={formData.principalActivity}
                  onChange={handleInputChange}
                  placeholder="Sales Agent,"
                  size="small"
                />
              </Grid>
            </Grid>
          </Card>

          {/* Company Details Card */}
          <Card sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  bgcolor: 'rgba(255, 107, 53, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BusinessIcon sx={{ color: '#FF6B35', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Company Details
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="EST Gas"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="NTN Number"
                  name="ntnNumber"
                  value={formData.ntnNumber}
                  onChange={handleInputChange}
                  placeholder="00000000"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Sales Tax Number"
                  name="salesTaxNumber"
                  value={formData.salesTaxNumber}
                  onChange={handleInputChange}
                  placeholder="000-0000"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tax Office"
                  name="taxOffice"
                  value={formData.taxOffice}
                  onChange={handleInputChange}
                  placeholder="Lahore"
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Write Your Address"
                  multiline
                  rows={4}
                  size="small"
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Status Card */}
          <Card sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  bgcolor: 'rgba(255, 107, 53, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CircleIcon sx={{ color: '#FF6B35', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Status
              </Typography>
            </Box>

            <FormControl component="fieldset">
              <RadioGroup
                name="status"
                value={formData.status}
                onChange={handleStatusChange}
              >
                <FormControlLabel
                  value="Active"
                  control={
                    <Radio
                      sx={{
                        color: '#FF6B35',
                        '&.Mui-checked': {
                          color: '#FF6B35',
                        },
                      }}
                    />
                  }
                  label="Active"
                />
                <FormControlLabel
                  value="Prospect"
                  control={
                    <Radio
                      sx={{
                        color: '#FF6B35',
                        '&.Mui-checked': {
                          color: '#FF6B35',
                        },
                      }}
                    />
                  }
                  label="Prospect"
                />
                <FormControlLabel
                  value="Inactive"
                  control={
                    <Radio
                      sx={{
                        color: '#FF6B35',
                        '&.Mui-checked': {
                          color: '#FF6B35',
                        },
                      }}
                    />
                  }
                  label="Inactive"
                />
              </RadioGroup>
            </FormControl>
          </Card>

          {/* Action Buttons */}
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleCancel}
              sx={{
                py: 1.5,
                textTransform: 'none',
                borderColor: '#E0E0E0',
                color: '#666666',
                '&:hover': {
                  borderColor: '#BDBDBD',
                  bgcolor: 'rgba(0, 0, 0, 0.02)',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              sx={{
                py: 1.5,
                textTransform: 'none',
                bgcolor: '#FF6B35',
                '&:hover': {
                  bgcolor: '#FF8E53',
                },
              }}
            >
              Add Customer
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddCustomerPage;
