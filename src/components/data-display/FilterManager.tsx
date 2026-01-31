import React, { useState, useCallback, useMemo } from 'react';
import {
  Popover,
  Card,
  Grid,
  Box,
  Button,
  Typography,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

export interface FilterField {
  name: string;
  label: string;
  value: string | number;
  component: React.ReactNode;
}

export interface SavedFilter {
  id: string;
  name: string;
  values: Record<string, string | number>;
  timestamp: number;
}

interface FilterManagerProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  fields: FilterField[];
  onApply: () => void;
  onReset: () => void;
}

const FilterManager: React.FC<FilterManagerProps> = ({
  open,
  anchorEl,
  onClose,
  fields,
  onApply,
  onReset,
}) => {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  // Check if current filter has at least one value
  const hasFilterValues = useMemo(() => {
    return fields.some((field) => {
      const value = field.value;
      return value !== '' && value !== null && value !== undefined;
    });
  }, [fields]);

  // Check if current filter is duplicate
  const isDuplicateFilter = useMemo(() => {
    return savedFilters.some((filter) => {
      return fields.every((field) => filter.values[field.name] === field.value);
    });
  }, [fields, savedFilters]);

  // Generate filter name based on selected values
  const generateFilterName = useCallback(() => {
    const selectedFields = fields.filter((field) => {
      const value = field.value;
      return value !== '' && value !== null && value !== undefined;
    });

    if (selectedFields.length === 0) return 'Filter';

    return selectedFields
      .map((field) => `${field.label}: ${field.value}`)
      .join(', ')
      .substring(0, 50);
  }, [fields]);

  // Save current filter
  const handleSaveFilter = useCallback(() => {
    if (!hasFilterValues) return;
    if (isDuplicateFilter) return;

    const filterValues = fields.reduce((acc, field) => {
      acc[field.name] = field.value;
      return acc;
    }, {} as Record<string, string | number>);

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: generateFilterName(),
      values: filterValues,
      timestamp: Date.now(),
    };

    // Keep only latest 3 filters
    const updatedFilters = [newFilter, ...savedFilters].slice(0, 3);
    setSavedFilters(updatedFilters);
  }, [hasFilterValues, isDuplicateFilter, fields, savedFilters, generateFilterName]);

  // Apply saved filter
  const handleApplySavedFilter = useCallback(
    (filter: SavedFilter) => {
      // This will be handled by the parent component through a callback
      // We'll emit a custom event that parent can listen to
      const event = new CustomEvent('applySavedFilter', {
        detail: { filterId: filter.id, values: filter.values },
      });
      window.dispatchEvent(event);
      onClose();
    },
    [onClose]
  );

  // Delete saved filter
  const handleDeleteSavedFilter = useCallback(
    (filterId: string) => {
      const updatedFilters = savedFilters.filter((f) => f.id !== filterId);
      setSavedFilters(updatedFilters);
    },
    [savedFilters]
  );

  // Handle apply and close
  const handleApplyFilters = useCallback(() => {
    onApply();
    onClose();
  }, [onApply, onClose]);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      sx={{ mt: 1 }}
    >
      <Card sx={{ p: 3, minWidth: 400, border: '2px solid #FF6B35' }}>
        <Grid container spacing={2}>
          {/* Filter Fields */}
          {fields.map((field) => (
            <Grid item xs={12} key={field.name}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography
                  sx={{
                    minWidth: 100,
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
                >
                  {field.label}
                </Typography>
                <Box sx={{ flex: 1 }}>{field.component}</Box>
              </Box>
            </Grid>
          ))}

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                justifyContent: 'flex-end',
                mt: 1,
              }}
            >
              <Button
                variant="outlined"
                size="small"
                startIcon={<SaveIcon sx={{ fontSize: 16 }} />}
                onClick={handleSaveFilter}
                disabled={!hasFilterValues || isDuplicateFilter}
                sx={{
                  textTransform: 'none',
                  borderColor: '#4CAF50',
                  color: '#4CAF50',
                  fontSize: '0.813rem',
                  '&:hover': {
                    borderColor: '#4CAF50',
                    bgcolor: 'rgba(76, 175, 80, 0.04)',
                  },
                  '&.Mui-disabled': {
                    borderColor: '#E0E0E0',
                    color: '#BDBDBD',
                  },
                }}
                title={
                  !hasFilterValues
                    ? 'Select at least one filter'
                    : isDuplicateFilter
                    ? 'This filter is already saved'
                    : 'Save current filter'
                }
              >
                Save Filter
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={onReset}
                sx={{
                  textTransform: 'none',
                  borderColor: '#E0E0E0',
                  color: 'text.secondary',
                  fontSize: '0.813rem',
                  '&:hover': {
                    borderColor: '#BDBDBD',
                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                  },
                }}
              >
                Clear Filter
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleApplyFilters}
                sx={{
                  textTransform: 'none',
                  bgcolor: '#FF6B35',
                  fontSize: '0.813rem',
                  '&:hover': { bgcolor: '#E55A2B' },
                }}
              >
                Apply Filter
              </Button>
            </Box>
          </Grid>

          {/* Saved Filters Section */}
          {savedFilters.length > 0 && (
            <Grid item xs={12}>
              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: '1px solid #E0E0E0',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    mb: 1,
                    display: 'block',
                  }}
                >
                  Saved Filters ({savedFilters.length}/3)
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {savedFilters.map((filter) => (
                    <Box
                      key={filter.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        bgcolor: 'rgba(0, 0, 0, 0.02)',
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      <Chip
                        label={filter.name}
                        size="small"
                        onClick={() => handleApplySavedFilter(filter)}
                        sx={{
                          flex: 1,
                          justifyContent: 'flex-start',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          maxWidth: 'calc(100% - 32px)',
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          },
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSavedFilter(filter.id);
                        }}
                        sx={{
                          width: 24,
                          height: 24,
                          color: '#EF5350',
                          '&:hover': {
                            bgcolor: 'rgba(239, 83, 80, 0.08)',
                          },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </Card>
    </Popover>
  );
};

export default FilterManager;
