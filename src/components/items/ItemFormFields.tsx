import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  FormControl,
  FormHelperText,
  Select,
  MenuItem,
  Divider,
  InputLabel,
} from '@mui/material';
import { Inventory as InventoryIcon } from '@mui/icons-material';
import FormSection from '../common/FormSection';
import { ItemFormData, SelectOption, UNITS } from './types';
import { ItemFieldErrors } from '../../hooks/useItemForm';

// Type for select change value (string for most selects, number for IDs, boolean for toggles)
type SelectChangeValue = string | number | boolean;

interface ItemFormFieldsProps {
  formData: ItemFormData;
  fieldErrors?: ItemFieldErrors;
  categories: SelectOption[];
  companies: SelectOption[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: SelectChangeValue) => void;
}

const ItemFormFields: React.FC<ItemFormFieldsProps> = ({
  formData,
  fieldErrors = {},
  categories,
  companies,
  onInputChange,
  onSelectChange,
}) => {
  return (
    <FormSection title="Item Details" icon={<InventoryIcon />}>
      <Divider sx={{ mb: 3, mt: -1 }} />
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
            id="item-code-label"
          >
            Item Id *
          </Typography>
          <TextField
            fullWidth
            name="itemCode"
            value={formData.itemCode}
            onChange={onInputChange}
            placeholder="G1215"
            size="small"
            error={!!fieldErrors.itemCode}
            helperText={fieldErrors.itemCode}
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
            inputProps={{
              'aria-required': true,
              'aria-invalid': !!fieldErrors.itemCode,
              'aria-describedby': fieldErrors.itemCode ? 'item-code-error' : undefined,
              'aria-labelledby': 'item-code-label',
            }}
            FormHelperTextProps={{
              id: 'item-code-error',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
            id="item-hashcode-label"
          >
            Item Hash Code *
          </Typography>
          <TextField
            fullWidth
            name="itemHashCode"
            value={formData.itemHashCode}
            onChange={onInputChange}
            placeholder="REW01245"
            size="small"
            error={!!fieldErrors.itemHashCode}
            helperText={fieldErrors.itemHashCode}
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
            inputProps={{
              'aria-required': true,
              'aria-invalid': !!fieldErrors.itemHashCode,
              'aria-describedby': fieldErrors.itemHashCode ? 'item-hashcode-error' : undefined,
              'aria-labelledby': 'item-hashcode-label',
            }}
            FormHelperTextProps={{
              id: 'item-hashcode-error',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
            id="item-name-label"
          >
            Item Name *
          </Typography>
          <TextField
            fullWidth
            name="itemName"
            value={formData.itemName}
            onChange={onInputChange}
            placeholder="LPG Gas"
            size="small"
            error={!!fieldErrors.itemName}
            helperText={fieldErrors.itemName}
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
            inputProps={{
              'aria-required': true,
              'aria-invalid': !!fieldErrors.itemName,
              'aria-describedby': fieldErrors.itemName ? 'item-name-error' : undefined,
              'aria-labelledby': 'item-name-label',
            }}
            FormHelperTextProps={{
              id: 'item-name-error',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
            id="item-category-label"
          >
            Category *
          </Typography>
          <FormControl fullWidth size="small" error={!!fieldErrors.categoryId}>
            <Select
              value={formData.categoryId}
              onChange={(e) => onSelectChange('categoryId', e.target.value)}
              displayEmpty
              sx={{ bgcolor: 'white' }}
              aria-required="true"
              aria-invalid={!!fieldErrors.categoryId}
              aria-describedby={fieldErrors.categoryId ? 'item-category-error' : undefined}
              aria-labelledby="item-category-label"
            >
              <MenuItem value="" disabled>Select Category</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
            {fieldErrors.categoryId && (
              <FormHelperText id="item-category-error">{fieldErrors.categoryId}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
            id="item-unitprice-label"
          >
            Unite Price
          </Typography>
          <TextField
            fullWidth
            name="unitPrice"
            value={formData.unitPrice}
            onChange={onInputChange}
            placeholder="00"
            size="small"
            type="number"
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
            inputProps={{
              'aria-labelledby': 'item-unitprice-label',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
            id="item-purchaseprice-label"
          >
            Purchase Price
          </Typography>
          <TextField
            fullWidth
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={onInputChange}
            placeholder="00"
            size="small"
            type="number"
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
            inputProps={{
              'aria-labelledby': 'item-purchaseprice-label',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
            id="item-saleprice-label"
          >
            Sales Price
          </Typography>
          <TextField
            fullWidth
            name="salePrice"
            value={formData.salePrice}
            onChange={onInputChange}
            placeholder="00"
            size="small"
            type="number"
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
            inputProps={{
              'aria-labelledby': 'item-saleprice-label',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
            id="item-unit-label"
          >
            Measuring Units
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={formData.unitOfMeasure}
              onChange={(e) => onSelectChange('unitOfMeasure', e.target.value)}
              displayEmpty
              sx={{ bgcolor: 'white' }}
              aria-labelledby="item-unit-label"
            >
              <MenuItem value="" disabled>Select Unit</MenuItem>
              {UNITS.map((unit) => (
                <MenuItem key={unit} value={unit}>{unit}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
            id="item-openingstock-label"
          >
            Open Stocks
          </Typography>
          <TextField
            fullWidth
            name="openingStock"
            value={formData.openingStock}
            onChange={onInputChange}
            placeholder="Enter Open Stocks in  KG"
            size="small"
            type="number"
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
            inputProps={{
              'aria-labelledby': 'item-openingstock-label',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
            id="item-closingstock-label"
          >
            Close Stocks
          </Typography>
          <TextField
            fullWidth
            name="closingStock"
            value={formData.closingStock}
            onChange={onInputChange}
            placeholder="Enter Close Stocks in  KG"
            size="small"
            type="number"
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
            inputProps={{
              'aria-labelledby': 'item-closingstock-label',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
            id="item-company-label"
          >
            Company
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={formData.companyId}
              onChange={(e) => onSelectChange('companyId', e.target.value)}
              displayEmpty
              sx={{ bgcolor: 'white' }}
              aria-labelledby="item-company-label"
            >
              <MenuItem value="" disabled>Select Company</MenuItem>
              {companies.map((comp) => (
                <MenuItem key={comp.id} value={comp.id}>{comp.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Typography
            variant="body2"
            sx={{ mb: 0.5, fontWeight: 500 }}
            id="item-description-label"
          >
            Description
          </Typography>
          <TextField
            fullWidth
            name="description"
            value={formData.description}
            onChange={onInputChange}
            placeholder="Write About Item"
            multiline
            rows={4}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
            inputProps={{
              'aria-labelledby': 'item-description-label',
            }}
          />
        </Grid>
      </Grid>
    </FormSection>
  );
};

export default ItemFormFields;
