import React from 'react';
import {
  Box,
  Card,
  Typography,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import type { LowStockItem } from '../../../types/dashboard.types';
import { DASHBOARD_COLORS, COLORS } from '../../../constants/colors';

interface LowStockTableProps {
  data: LowStockItem[];
}

const getUrgencyColor = (urgency: LowStockItem['urgency']): string => {
  switch (urgency) {
    case 'critical':
      return DASHBOARD_COLORS.urgency.critical;
    case 'warning':
      return DASHBOARD_COLORS.urgency.warning;
    case 'low':
      return DASHBOARD_COLORS.urgency.low;
    default:
      return COLORS.text.muted;
  }
};

const LowStockTable: React.FC<LowStockTableProps> = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      sx={{
        height: '100%',
        border: `1px solid ${COLORS.border.default}`,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          px: { xs: 1.5, sm: 2, md: 2.5 },
          py: { xs: 1.5, sm: 2 },
          borderBottom: `1px solid ${COLORS.border.default}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: COLORS.text.primary,
            fontWeight: 600,
            fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
          }}
        >
          Low Stock Items
        </Typography>
      </Box>
      <List
        sx={{
          flex: 1,
          overflow: 'auto',
          py: 0,
        }}
      >
        {data.map((item, index) => (
          <ListItem
            key={item.id}
            sx={{
              px: { xs: 1.5, sm: 2, md: 2.5 },
              py: { xs: 1, sm: 1.25, md: 1.5 },
              borderBottom:
                index < data.length - 1
                  ? `1px solid ${COLORS.border.light}`
                  : 'none',
              '&:hover': {
                backgroundColor: COLORS.background.hover,
              },
            }}
          >
            <FiberManualRecordIcon
              sx={{
                fontSize: { xs: 8, md: 10 },
                color: getUrgencyColor(item.urgency),
                mr: { xs: 1, md: 1.5 },
              }}
            />
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: COLORS.text.primary,
                    mb: 0.25,
                    fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.itemName}
                </Typography>
              }
              secondary={
                <Box
                  component="span"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 0.5, md: 1 },
                    flexWrap: 'wrap',
                  }}
                >
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{ 
                      color: COLORS.text.muted,
                      fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                      display: isMobile ? 'none' : 'inline',
                    }}
                  >
                    {item.sku}
                  </Typography>
                  {!isMobile && (
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ color: COLORS.text.muted }}
                    >
                      •
                    </Typography>
                  )}
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      color: getUrgencyColor(item.urgency),
                      fontWeight: 600,
                      fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                    }}
                  >
                    {item.currentStock} / {item.reorderLevel}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
      {data.length === 0 && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: COLORS.text.muted, fontSize: { xs: '0.75rem', md: '0.875rem' } }}
          >
            No low stock items
          </Typography>
        </Box>
      )}
    </Card>
  );
};

export default LowStockTable;
