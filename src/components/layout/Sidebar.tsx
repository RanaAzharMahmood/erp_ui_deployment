import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  ShoppingBag as ShoppingBagIcon,
  LocalShipping as LocalShippingIcon,
  PointOfSale as PointOfSaleIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Companies', icon: <BusinessIcon />, path: '/companies' },
  { text: 'Users', icon: <PeopleIcon />, path: '/users' },
  { text: 'Customer', icon: <ShoppingBagIcon />, path: '/customer' },
  { text: 'Vander', icon: <LocalShippingIcon />, path: '/vander' },
  { text: 'Sales', icon: <PointOfSaleIcon />, path: '/sales' },
  { text: 'Purchase', icon: <ShoppingCartIcon />, path: '/purchase' },
  { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
  { text: 'Account', icon: <AccountBalanceIcon />, path: '/account' },
  { text: 'Tax', icon: <ReceiptIcon />, path: '/tax' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onDrawerToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#FAFAFA',
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid #E0E0E0',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Typography
            sx={{
              color: 'white',
              fontSize: '20px',
              fontWeight: 700,
            }}
          >
            P
          </Typography>
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '18px',
            color: '#1A1A1A',
            letterSpacing: '0.5px',
          }}
        >
          PETROZEN
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ pt: 2, px: 1, flex: 1, overflowY: 'auto' }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: '8px',
                  mx: 0.5,
                  py: 1.5,
                  bgcolor: isSelected ? '#FF6B35' : 'transparent',
                  color: isSelected ? '#FFFFFF' : '#666666',
                  '&:hover': {
                    bgcolor: isSelected ? '#FF6B35' : 'rgba(255, 107, 53, 0.08)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isSelected ? '#FFFFFF' : '#666666',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '14px',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default Sidebar;
