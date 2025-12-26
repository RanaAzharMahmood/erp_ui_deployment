import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
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
  Category as CategoryIcon,
} from '@mui/icons-material';
import petrozenLogo from '../../assets/images/petrozen-logo.svg';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Companies', icon: <BusinessIcon />, path: '/companies' },
  { text: 'Users', icon: <PeopleIcon />, path: '/users' },
  { text: 'Categories', icon: <CategoryIcon />, path: '/categories' },
  { text: 'Products', icon: <InventoryIcon />, path: '/products' },
  { text: 'Customer', icon: <ShoppingBagIcon />, path: '/customer' },
  { text: 'Vendor', icon: <LocalShippingIcon />, path: '/vendor' },
  { text: 'Sales', icon: <PointOfSaleIcon />, path: '/sales' },
  { text: 'Purchase', icon: <ShoppingCartIcon />, path: '/purchase' },
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
          justifyContent: 'center',
          borderBottom: '1px solid #E0E0E0',
        }}
      >
        <img 
          src={petrozenLogo} 
          alt="PETROZEN" 
          style={{ 
            height: '45px',
            width: 'auto',
          }} 
        />
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
