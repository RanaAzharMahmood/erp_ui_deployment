import { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from './contexts/AuthContext'
import { useCompany } from './contexts/CompanyContext'
import LoginPage from './pages/auth/LoginPage'
import DashboardLayout from './components/layout/DashboardLayout'
import SuspenseRoute from './components/common/SuspenseRoute'

// Lazy load pages for better performance
// Dashboard
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))

// Master Data - Companies
const CompaniesPage = lazy(() => import('./pages/master-data/companies/CompaniesPage'))
const AddCompanyPage = lazy(() => import('./pages/master-data/companies/AddCompanyPage'))
const UpdateCompanyPage = lazy(() => import('./pages/master-data/companies/UpdateCompanyPage'))


// Master Data - Users
const UsersPage = lazy(() => import('./pages/master-data/users/UsersPage'))
const AddUserPage = lazy(() => import('./pages/master-data/users/AddUserPage'))
const UpdateUserPage = lazy(() => import('./pages/master-data/users/UpdateUserPage'))

// Master Data - Taxes
const TaxListPage = lazy(() => import('./pages/master-data/taxes/TaxListPage'))
const AddTaxPage = lazy(() => import('./pages/master-data/taxes/AddTaxPage'))
const UpdateTaxPage = lazy(() => import('./pages/master-data/taxes/UpdateTaxPage'))

// Master Data - Categories
const CategoryListPage = lazy(() => import('./pages/master-data/categories/CategoryListPage'))
const AddCategoryPage = lazy(() => import('./pages/master-data/categories/AddCategoryPage'))
const UpdateCategoryPage = lazy(() => import('./pages/master-data/categories/UpdateCategoryPage'))

// Master Data - Items/Inventory
const InventoryListPage = lazy(() => import('./pages/master-data/items/InventoryListPage'))
const AddItemPage = lazy(() => import('./pages/master-data/items/AddItemPage'))
const UpdateItemPage = lazy(() => import('./pages/master-data/items/UpdateItemPage'))

// Master Data - Parties
const PartyListPage = lazy(() => import('./pages/master-data/parties/PartyListPage'))
const AddPartyPage = lazy(() => import('./pages/master-data/parties/AddPartyPage'))
const UpdatePartyPage = lazy(() => import('./pages/master-data/parties/UpdatePartyPage'))

// Master Data - Bank Accounts
const BankAccountListPage = lazy(() => import('./pages/master-data/bank-accounts/BankAccountListPage'))
const AddBankAccountPage = lazy(() => import('./pages/master-data/bank-accounts/AddBankAccountPage'))


// Sales
const SalesInvoiceListPage = lazy(() => import('./pages/sales/invoices/SalesInvoiceListPage'))
const AddSalesInvoicePage = lazy(() => import('./pages/sales/invoices/AddSalesInvoicePage'))
const SalesReturnListPage = lazy(() => import('./pages/sales/returns/SalesReturnListPage'))
const AddSalesReturnPage = lazy(() => import('./pages/sales/returns/AddSalesReturnPage'))

// Purchase
const PurchaseInvoiceListPage = lazy(() => import('./pages/purchase/invoices/PurchaseInvoiceListPage'))
const AddPurchaseInvoicePage = lazy(() => import('./pages/purchase/invoices/AddPurchaseInvoicePage'))
const PurchaseReturnListPage = lazy(() => import('./pages/purchase/returns/PurchaseReturnListPage'))
const AddPurchaseReturnPage = lazy(() => import('./pages/purchase/returns/AddPurchaseReturnPage'))

// Accounting
const ExpenseListPage = lazy(() => import('./pages/accounting/expenses/ExpenseListPage'))
const AddExpensePage = lazy(() => import('./pages/accounting/expenses/AddExpensePage'))
const BankDepositListPage = lazy(() => import('./pages/accounting/bank-deposits/BankDepositListPage'))
const AddBankDepositPage = lazy(() => import('./pages/accounting/bank-deposits/AddBankDepositPage'))
const JournalEntryListPage = lazy(() => import('./pages/accounting/journal-entries/JournalEntryListPage'))
const AddJournalEntryPage = lazy(() => import('./pages/accounting/journal-entries/AddJournalEntryPage'))
const OtherPaymentsListPage = lazy(() => import('./pages/accounting/other-payments/OtherPaymentsListPage'))
const AddOtherPaymentsPage = lazy(() => import('./pages/accounting/other-payments/AddOtherPaymentsPage'))
const ChartOfAccountPage = lazy(() => import('./pages/accounting/chart-of-accounts/ChartOfAccountPage'))
const AddChartOfAccountPage = lazy(() => import('./pages/accounting/chart-of-accounts/AddChartOfAccountPage'))
const OpeningBalancePage = lazy(() => import('./pages/accounting/opening-balance/OpeningBalancePage'))
const TrialBalancePage = lazy(() => import('./pages/reports/TrialBalancePage'))
const ReportsHubPage = lazy(() => import('./pages/reports/ReportsHubPage'))
const GeneralLedgerPage = lazy(() => import('./pages/reports/GeneralLedgerPage'))
const ReportViewerPage = lazy(() => import('./pages/reports/ReportViewerPage'))

// Company Selection
const SelectCompanyPage = lazy(() => import('./pages/company/SelectCompanyPage'))

// Activity & Approval
const ActivityPage = lazy(() => import('./pages/activity/ActivityPage'))
const ApprovalPage = lazy(() => import('./pages/activity/ApprovalPage'))

// Other
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: '#F5F5F5',
        }}
      >
        <CircularProgress sx={{ color: '#FF6B35' }} />
      </Box>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

const PermissionRoute: React.FC<{
  permission?: string
  adminOnly?: boolean
  children: React.ReactNode
}> = ({ permission, adminOnly, children }) => {
  const { hasPermission, user } = useAuth()
  const isAdmin = user?.roleName?.toLowerCase() === 'admin'

  if (isAdmin) return <>{children}</>
  if (adminOnly) return <Navigate to="/dashboard" replace />
  if (permission && !hasPermission(permission)) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}

function App() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const { selectedCompany } = useCompany()
  const isAdmin = user?.roleName?.toLowerCase() === 'admin'

  // Show loading spinner during initial auth check
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: '#F5F5F5',
        }}
      >
        <CircularProgress sx={{ color: '#FF6B35' }} />
      </Box>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={!isAdmin && !selectedCompany ? '/select-company' : '/'} replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/select-company"
        element={
          <ProtectedRoute>
            <SuspenseRoute>
              <SelectCompanyPage />
            </SuspenseRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <Navigate
              to={!isAdmin && !selectedCompany ? '/select-company' : '/dashboard'}
              replace
            />
          }
        />
        <Route
          path="dashboard"
          element={
            <SuspenseRoute>
              <DashboardPage />
            </SuspenseRoute>
          }
        />

        <Route
          path="categories"
          element={
            <PermissionRoute permission="view_categories">
              <SuspenseRoute>
                <CategoryListPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="companies"
          element={
            <PermissionRoute adminOnly>
              <SuspenseRoute>
                <CompaniesPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="companies/add"
          element={
            <PermissionRoute adminOnly>
              <SuspenseRoute>
                <AddCompanyPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="companies/update/:id"
          element={
            <PermissionRoute adminOnly>
              <SuspenseRoute>
                <UpdateCompanyPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />


        <Route
          path="tax"
          element={
            <PermissionRoute permission="view_taxes">
              <SuspenseRoute>
                <TaxListPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="tax/add"
          element={
            <PermissionRoute permission="view_taxes">
              <SuspenseRoute>
                <AddTaxPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="tax/update/:id"
          element={
            <PermissionRoute permission="view_taxes">
              <SuspenseRoute>
                <UpdateTaxPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="users"
          element={
            <PermissionRoute permission="view_users">
              <SuspenseRoute>
                <UsersPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="users/add"
          element={
            <PermissionRoute permission="view_users">
              <SuspenseRoute>
                <AddUserPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="users/edit/:id"
          element={
            <PermissionRoute permission="view_users">
              <SuspenseRoute>
                <UpdateUserPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="party"
          element={
            <PermissionRoute permission="party:read">
              <SuspenseRoute>
                <PartyListPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="party/add"
          element={
            <PermissionRoute permission="party:read">
              <SuspenseRoute>
                <AddPartyPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="party/update/:id"
          element={
            <PermissionRoute permission="party:read">
              <SuspenseRoute>
                <UpdatePartyPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="inventory"
          element={
            <PermissionRoute permission="view_inventory_movements">
              <SuspenseRoute>
                <InventoryListPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="inventory/add"
          element={
            <PermissionRoute permission="view_inventory_movements">
              <SuspenseRoute>
                <AddItemPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="inventory/update/:id"
          element={
            <PermissionRoute permission="view_inventory_movements">
              <SuspenseRoute>
                <UpdateItemPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="categories/add"
          element={
            <PermissionRoute permission="view_categories">
              <SuspenseRoute>
                <AddCategoryPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="categories/update/:id"
          element={
            <PermissionRoute permission="view_categories">
              <SuspenseRoute>
                <UpdateCategoryPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        {/* Account Routes */}
        <Route
          path="account/expense"
          element={
            <PermissionRoute permission="view_expenses">
              <SuspenseRoute>
                <ExpenseListPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="account/expense/add"
          element={
            <PermissionRoute permission="view_expenses">
              <SuspenseRoute>
                <AddExpensePage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="account/expense/update/:id"
          element={
            <PermissionRoute permission="view_expenses">
              <SuspenseRoute>
                <AddExpensePage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="account/bank-deposit"
          element={
            <PermissionRoute permission="view_bank_deposits">
              <SuspenseRoute>
                <BankDepositListPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="account/bank-deposit/add"
          element={
            <PermissionRoute permission="view_bank_deposits">
              <SuspenseRoute>
                <AddBankDepositPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="account/bank-deposit/update/:id"
          element={
            <PermissionRoute permission="view_bank_deposits">
              <SuspenseRoute>
                <AddBankDepositPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="account/journal-entry"
          element={
            <PermissionRoute permission="view_journal_entries">
              <SuspenseRoute>
                <JournalEntryListPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="account/journal-entry/add"
          element={
            <PermissionRoute permission="view_journal_entries">
              <SuspenseRoute>
                <AddJournalEntryPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="account/journal-entry/update/:id"
          element={
            <PermissionRoute permission="view_journal_entries">
              <SuspenseRoute>
                <AddJournalEntryPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="account/bank-account"
          element={
            <PermissionRoute permission="view_bank_accounts">
              <SuspenseRoute>
                <BankAccountListPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="account/bank-account/add"
          element={
            <PermissionRoute permission="view_bank_accounts">
              <SuspenseRoute>
                <AddBankAccountPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="account/bank-account/update/:id"
          element={
            <PermissionRoute permission="view_bank_accounts">
              <SuspenseRoute>
                <AddBankAccountPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="account/other-payments"
          element={
            <PermissionRoute permission="view_other_payments">
              <SuspenseRoute>
                <OtherPaymentsListPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="account/other-payments/add"
          element={
            <PermissionRoute permission="view_other_payments">
              <SuspenseRoute>
                <AddOtherPaymentsPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="account/other-payments/update/:id"
          element={
            <PermissionRoute permission="view_other_payments">
              <SuspenseRoute>
                <AddOtherPaymentsPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="account/chart-of-account/add"
          element={
            <PermissionRoute permission="view_chart_of_accounts">
              <SuspenseRoute>
                <AddChartOfAccountPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="account/chart-of-account/update/:id"
          element={
            <PermissionRoute permission="view_chart_of_accounts">
              <SuspenseRoute>
                <AddChartOfAccountPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="account/chart-of-account"
          element={
            <PermissionRoute permission="view_chart_of_accounts">
              <SuspenseRoute>
                <ChartOfAccountPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="account/opening-balance"
          element={
            <PermissionRoute permission="view_journal_entries">
              <SuspenseRoute>
                <OpeningBalancePage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="reports"
          element={
            <PermissionRoute permission="view_journal_entries">
              <SuspenseRoute>
                <ReportsHubPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="reports/trial-balance"
          element={
            <PermissionRoute permission="view_journal_entries">
              <SuspenseRoute>
                <TrialBalancePage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="reports/general-ledger"
          element={
            <PermissionRoute permission="view_journal_entries">
              <SuspenseRoute>
                <GeneralLedgerPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="reports/viewer"
          element={
            <PermissionRoute permission="view_journal_entries">
              <SuspenseRoute>
                <ReportViewerPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        {/* Purchase Routes */}
        <Route
          path="purchase/invoice"
          element={
            <PermissionRoute permission="view_purchase_invoices">
              <SuspenseRoute>
                <PurchaseInvoiceListPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="purchase/invoice/add"
          element={
            <PermissionRoute permission="view_purchase_invoices">
              <SuspenseRoute>
                <AddPurchaseInvoicePage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="purchase/invoice/update/:id"
          element={
            <PermissionRoute permission="view_purchase_invoices">
              <SuspenseRoute>
                <AddPurchaseInvoicePage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="purchase/return"
          element={
            <PermissionRoute permission="view_purchase_returns">
              <SuspenseRoute>
                <PurchaseReturnListPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="purchase/return/add"
          element={
            <PermissionRoute permission="view_purchase_returns">
              <SuspenseRoute>
                <AddPurchaseReturnPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="purchase/return/update/:id"
          element={
            <PermissionRoute permission="view_purchase_returns">
              <SuspenseRoute>
                <AddPurchaseReturnPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        {/* Activity & Approval Routes */}
        <Route
          path="activity"
          element={
            <PermissionRoute permission="view_activity">
              <SuspenseRoute>
                <ActivityPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="approval"
          element={
            <PermissionRoute permission="view_activity">
              <SuspenseRoute>
                <ApprovalPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        {/* Sales Routes */}
        <Route
          path="sales/invoice"
          element={
            <PermissionRoute permission="view_sales_invoices">
              <SuspenseRoute>
                <SalesInvoiceListPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="sales/invoice/add"
          element={
            <PermissionRoute permission="view_sales_invoices">
              <SuspenseRoute>
                <AddSalesInvoicePage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="sales/invoice/update/:id"
          element={
            <PermissionRoute permission="view_sales_invoices">
              <SuspenseRoute>
                <AddSalesInvoicePage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="sales/return"
          element={
            <PermissionRoute permission="view_sales_returns">
              <SuspenseRoute>
                <SalesReturnListPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="sales/return/add"
          element={
            <PermissionRoute permission="view_sales_returns">
              <SuspenseRoute>
                <AddSalesReturnPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
        <Route
          path="sales/return/update/:id"
          element={
            <PermissionRoute permission="view_sales_returns">
              <SuspenseRoute>
                <AddSalesReturnPage />
              </SuspenseRoute>
            </PermissionRoute>
          }
        />
      </Route>
      <Route
        path="*"
        element={
          <SuspenseRoute>
            <NotFoundPage />
          </SuspenseRoute>
        }
      />
    </Routes>
  )
}

export default App
