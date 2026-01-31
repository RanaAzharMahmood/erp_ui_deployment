import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  ShoppingBag as ShoppingBagIcon,
  PointOfSale as PointOfSaleIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  ExpandLess,
  ExpandMore,
  CreditCard as CreditCardIcon,
  Article as ArticleIcon,
  AccountTree as AccountTreeIcon,
  Payments as PaymentsIcon,
} from '@mui/icons-material';
import petrozenLogo from '../../assets/images/petrozen-logo.svg';

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Companies', icon: <BusinessIcon />, path: '/companies' },
  { text: 'Users', icon: <PeopleIcon />, path: '/users' },
  { text: 'Party', icon: <ShoppingBagIcon />, path: '/party' },
  { text: 'Categories', icon: <ShoppingBagIcon />, path: '/categories' },
  {
    text: 'Sales',
    icon: <PointOfSaleIcon />,
    children: [
      { text: 'Invoice', icon: <ReceiptIcon />, path: '/sales/invoice' },
      { text: 'Return', icon: <ReceiptIcon />, path: '/sales/return' },
    ],
  },
  {
    text: 'Purchase',
    icon: <ShoppingCartIcon />,
    children: [
      { text: 'Invoice', icon: <ReceiptIcon />, path: '/purchase/invoice' },
      { text: 'Return', icon: <ReceiptIcon />, path: '/purchase/return' },
    ],
  },
  { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
  {
    text: 'Account',
    icon: <AccountBalanceIcon />,
    children: [
      { text: 'Expense', icon: <CreditCardIcon />, path: '/account/expense' },
      { text: 'Journal Entry', icon: <ArticleIcon />, path: '/account/journal-entry' },
      { text: 'Chart of Account', icon: <AccountTreeIcon />, path: '/account/chart-of-account' },
      { text: 'Bank Account', icon: <AccountBalanceIcon />, path: '/account/bank-account' },
      { text: 'Bank Deposit', icon: <AccountBalanceIcon />, path: '/account/bank-deposit' },
      { text: 'Other Payments', icon: <PaymentsIcon />, path: '/account/other-payments' },
    ],
  },
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
  const [openMenus, setOpenMenus] = useState<string[]>(['Account', 'Sales', 'Purchase']);

  const handleMenuClick = (item: MenuItem) => {
    if (item.children) {
      setOpenMenus((prev) =>
        prev.includes(item.text)
          ? prev.filter((m) => m !== item.text)
          : [...prev, item.text]
      );
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const isSelected = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isParentSelected = (item: MenuItem) => {
    if (!item.children) return false;
    return item.children.some((child) => isSelected(child.path));
  };

  const renderMenuItem = (item: MenuItem, isChild = false) => {
    const selected = isSelected(item.path);
    const hasChildren = !!item.children;
    const isOpen = openMenus.includes(item.text);
    const parentSelected = isParentSelected(item);

    return (
      <React.Fragment key={item.text}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={() => handleMenuClick(item)}
            sx={{
              borderRadius: '8px',
              mx: isChild ? 1 : 0.5,
              ml: isChild ? 3 : 0.5,
              py: isChild ? 1 : 1.5,
              bgcolor: selected
                ? '#FF6B35'
                : parentSelected
                ? 'rgba(255, 107, 53, 0.08)'
                : 'transparent',
              color: selected ? '#FFFFFF' : parentSelected ? '#FF6B35' : '#666666',
              '&:hover': {
                bgcolor: selected ? '#FF6B35' : 'rgba(255, 107, 53, 0.08)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ListItemIcon
              sx={{
                color: selected ? '#FFFFFF' : parentSelected ? '#FF6B35' : '#666666',
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: isChild ? '13px' : '14px',
                fontWeight: selected ? 600 : 400,
              }}
            />
            {hasChildren && (isOpen ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>
        {hasChildren && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderMenuItem(child, true))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

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
        {menuItems.map((item) => renderMenuItem(item))}
      </List>
    </Box>
  );
};

export default Sidebar;
