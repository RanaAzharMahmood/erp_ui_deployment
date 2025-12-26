import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Alert,
  MenuItem,
  Select,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Circle as CircleIcon,
  ArrowBack as ArrowBackIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface TaxFormData {
  taxId: string;
  taxName: string;
  taxPercentage: string;
  taxDate: string;
  note: string;
  status: 'Active' | 'Prospect' | 'Inactive';
}

const TAX_PERCENTAGES = ['16%', '18%', '05%', '19%', '20%'];

const initialFormState: TaxFormData = {
  taxId: '',
  taxName: '',
  taxPercentage: '',
  taxDate: '',
  note: '',
  status: 'Active',
};

const UpdateTaxPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<TaxFormData>(initialFormState);
  const [taxExists, setTaxExists] = useState(true);

  useEffect(() => {
    // Load tax data from localStorage
    const savedTaxes = localStorage.getItem('taxes');
    if (savedTaxes && id) {
      const taxes = JSON.parse(savedTaxes);
      const tax = taxes.find((t: any) => t.id === id);
      if (tax) {
        setFormData({
          taxId: tax.taxId,
          taxName: tax.taxName,
          taxPercentage: tax.taxPercentage,
          taxDate: tax.taxDate || '',
          note: tax.note || '',
          status: tax.status,
        });
      } else {
        setTaxExists(false);
      }
    } else {
      setTaxExists(false);
    }
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
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
    if (!formData.taxId || !formData.taxName || !formData.taxPercentage) {
      alert('Please fill in all required fields');
      return;
    }

    // Get existing taxes
    const savedTaxes = localStorage.getItem('taxes');
    if (savedTaxes && id) {
      const taxes = JSON.parse(savedTaxes);
      const updatedTaxes = taxes.map((tax: any) =>
        tax.id === id ? { ...tax, ...formData } : tax
      );

      // Save to localStorage
      localStorage.setItem('taxes', JSON.stringify(updatedTaxes));

      // Navigate back to taxes list
      navigate('/tax');
    }
  };

  const handleDelete = () => {
    if (
      window.confirm(
        'Are you sure you want to delete this tax? This action cannot be undone.'
      )
    ) {
      const savedTaxes = localStorage.getItem('taxes');
      if (savedTaxes && id) {
        const taxes = JSON.parse(savedTaxes);
        const updatedTaxes = taxes.filter((t: any) => t.id !== id);
        localStorage.setItem('taxes', JSON.stringify(updatedTaxes));
        navigate('/tax');
      }
    }
  };

  const handleCancel = () => {
    navigate('/tax');
  };

  if (!taxExists) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Tax not found
        </Typography>
        <Button onClick={() => navigate('/tax')} variant="contained">
          Back to Taxes
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton
          onClick={() => navigate('/tax')}
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
          Update Tax
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          {/* Tax Details Card */}
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
                <ReceiptIcon sx={{ color: '#FF6B35', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Tax Details
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tax Id"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  placeholder="16551546"
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tax Name"
                  name="taxName"
                  value={formData.taxName}
                  onChange={handleInputChange}
                  placeholder="for this"
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tax %age</InputLabel>
                  <Select
                    name="taxPercentage"
                    value={formData.taxPercentage}
                    label="Tax %age"
                    onChange={handleSelectChange}
                  >
                    {TAX_PERCENTAGES.map((percentage) => (
                      <MenuItem key={percentage} value={percentage}>
                        {percentage}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tax Date"
                  name="taxDate"
                  type="date"
                  value={formData.taxDate}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Note"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Assert"
                  multiline
                  rows={3}
                  size="small"
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Status Card */}
          <Card sx={{ p: 3, borderRadius: 2, mb: 3 }}>
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

          {/* Danger Zone Card */}
          <Card
            sx={{
              p: 3,
              borderRadius: 2,
              mb: 3,
              border: '2px solid #EF5350',
              bgcolor: 'rgba(239, 83, 80, 0.02)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  bgcolor: 'rgba(239, 83, 80, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <WarningIcon sx={{ color: '#EF5350', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#EF5350' }}>
                Danger Zone
              </Typography>
            </Box>

            <Alert severity="warning" sx={{ mb: 2 }}>
              These actions are permanent and cannot be undone. Please proceed with
              caution.
            </Alert>

            <Button
              fullWidth
              variant="contained"
              onClick={handleDelete}
              sx={{
                bgcolor: 'rgba(239, 83, 80, 0.15)',
                color: '#EF5350',
                textTransform: 'none',
                py: 1.5,
                '&:hover': {
                  bgcolor: 'rgba(239, 83, 80, 0.25)',
                },
              }}
            >
              Delete Item
            </Button>
          </Card>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
              Save Changes
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UpdateTaxPage;
