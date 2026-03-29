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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryIcon from '@mui/icons-material/History';
import petrozenLogo from '../../assets/images/petrozen-logo.svg';
import { useAuth } from '../../contexts/AuthContext';

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path?: string;
  permission?: string;   // required permission for non-admin users
  adminOnly?: boolean;   // only shown to admin
  children?: MenuItem[];
}

const allMenuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Companies', icon: <BusinessIcon />, path: '/companies', adminOnly: true },
  { text: 'Users', icon: <PeopleIcon />, path: '/users', permission: 'view_users' },
  { text: 'Party', icon: <ShoppingBagIcon />, path: '/party', permission: 'party:read' },
  { text: 'Categories', icon: <ShoppingBagIcon />, path: '/categories', permission: 'view_categories' },
  {
    text: 'Sales',
    icon: <PointOfSaleIcon />,
    children: [
      { text: 'Invoice', icon: <ReceiptIcon />, path: '/sales/invoice', permission: 'view_sales_invoices' },
      { text: 'Return', icon: <ReceiptIcon />, path: '/sales/return', permission: 'view_sales_returns' },
    ],
  },
  {
    text: 'Purchase',
    icon: <ShoppingCartIcon />,
    children: [
      { text: 'Invoice', icon: <ReceiptIcon />, path: '/purchase/invoice', permission: 'view_purchase_invoices' },
      { text: 'Return', icon: <ReceiptIcon />, path: '/purchase/return', permission: 'view_purchase_returns' },
    ],
  },
  { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory', permission: 'view_inventory_movements' },
  {
    text: 'Account',
    icon: <AccountBalanceIcon />,
    children: [
      { text: 'Expense', icon: <CreditCardIcon />, path: '/account/expense', permission: 'view_expenses' },
      { text: 'Journal Entry', icon: <ArticleIcon />, path: '/account/journal-entry', permission: 'view_journal_entries' },
      { text: 'Chart of Account', icon: <AccountTreeIcon />, path: '/account/chart-of-account', permission: 'view_chart_of_accounts' },
      { text: 'Opening Balance', icon: <AccountBalanceIcon />, path: '/account/opening-balance', permission: 'view_journal_entries' },
      { text: 'Bank Account', icon: <AccountBalanceIcon />, path: '/account/bank-account', permission: 'view_bank_accounts' },
      { text: 'Bank Deposit', icon: <AccountBalanceIcon />, path: '/account/bank-deposit', permission: 'view_bank_deposits' },
      { text: 'Other Payments', icon: <PaymentsIcon />, path: '/account/other-payments', permission: 'view_other_payments' },
    ],
  },
  { text: 'Tax', icon: <ReceiptIcon />, path: '/tax', permission: 'view_taxes' },
  {
    text: 'Reports',
    icon: <AssessmentIcon />,
    permission: 'view_journal_entries',
    children: [
      { text: 'Trial Balance', icon: <AssessmentIcon />, path: '/reports/trial-balance', permission: 'view_journal_entries' },
    ],
  },
  {
    text: 'Activity & Approval',
    icon: <HistoryIcon />,
    permission: 'view_activity',
    children: [
      { text: 'Activity', icon: <HistoryIcon />, path: '/activity' },
      { text: 'Approval', icon: <CheckCircleIcon />, path: '/approval' },
    ],
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onDrawerToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasPermission } = useAuth();
  const isAdmin = user?.roleName?.toLowerCase() === 'admin';
  const [openMenus, setOpenMenus] = useState<string[]>(['Account', 'Sales', 'Purchase']);

  const isItemVisible = (item: MenuItem): boolean => {
    if (isAdmin) return true;
    if (item.adminOnly) return false;
    if (item.permission) return hasPermission(item.permission);
    return true;
  };

  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items.reduce<MenuItem[]>((acc, item) => {
      if (item.children) {
        if (!isItemVisible(item)) return acc;
        const visibleChildren = item.children.filter((child) => isItemVisible(child));
        if (isAdmin || visibleChildren.length > 0) {
          acc.push({ ...item, children: isAdmin ? item.children : visibleChildren });
        }
      } else if (isItemVisible(item)) {
        acc.push(item);
      }
      return acc;
    }, []);
  };

  const menuItems = filterMenuItems(allMenuItems);

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
