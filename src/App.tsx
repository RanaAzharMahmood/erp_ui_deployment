import { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/auth/LoginPage'
import DashboardLayout from './components/layout/DashboardLayout'
import SuspenseRoute from './components/common/SuspenseRoute'

// Lazy load pages for better performance
// Master Data - Companies
const CompaniesPage = lazy(() => import('./pages/master-data/companies/CompaniesPage'))
const AddCompanyPage = lazy(() => import('./pages/master-data/companies/AddCompanyPage'))
const UpdateCompanyPage = lazy(() => import('./pages/master-data/companies/UpdateCompanyPage'))

// Master Data - Customers
const CustomersPage = lazy(() => import('./pages/master-data/customers/CustomersPage'))
const AddCustomerPage = lazy(() => import('./pages/master-data/customers/AddCustomerPage'))
const UpdateCustomerPage = lazy(() => import('./pages/master-data/customers/UpdateCustomerPage'))

// Master Data - Vendors
const VendorsPage = lazy(() => import('./pages/master-data/vendors/VendorsPage'))
const AddVendorPage = lazy(() => import('./pages/master-data/vendors/AddVendorPage'))
const UpdateVendorPage = lazy(() => import('./pages/master-data/vendors/UpdateVendorPage'))

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

// Inventory
const ProductsPage = lazy(() => import('./pages/inventory/ProductsPage'))

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

// Other
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <SuspenseRoute>
              <ProductsPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="products"
          element={
            <SuspenseRoute>
              <ProductsPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="categories"
          element={
            <SuspenseRoute>
              <CategoryListPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="companies"
          element={
            <SuspenseRoute>
              <CompaniesPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="companies/add"
          element={
            <SuspenseRoute>
              <AddCompanyPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="companies/update/:id"
          element={
            <SuspenseRoute>
              <UpdateCompanyPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="customer"
          element={
            <SuspenseRoute>
              <CustomersPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="customer/add"
          element={
            <SuspenseRoute>
              <AddCustomerPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="customer/update/:id"
          element={
            <SuspenseRoute>
              <UpdateCustomerPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="vendor"
          element={
            <SuspenseRoute>
              <VendorsPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="vendor/add"
          element={
            <SuspenseRoute>
              <AddVendorPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="vendor/update/:id"
          element={
            <SuspenseRoute>
              <UpdateVendorPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="tax"
          element={
            <SuspenseRoute>
              <TaxListPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="tax/add"
          element={
            <SuspenseRoute>
              <AddTaxPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="tax/update/:id"
          element={
            <SuspenseRoute>
              <UpdateTaxPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="users"
          element={
            <SuspenseRoute>
              <UsersPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="users/add"
          element={
            <SuspenseRoute>
              <AddUserPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="users/edit/:id"
          element={
            <SuspenseRoute>
              <UpdateUserPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="party"
          element={
            <SuspenseRoute>
              <PartyListPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="party/add"
          element={
            <SuspenseRoute>
              <AddPartyPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="party/update/:id"
          element={
            <SuspenseRoute>
              <UpdatePartyPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="inventory"
          element={
            <SuspenseRoute>
              <InventoryListPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="inventory/add"
          element={
            <SuspenseRoute>
              <AddItemPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="inventory/update/:id"
          element={
            <SuspenseRoute>
              <UpdateItemPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="categories/add"
          element={
            <SuspenseRoute>
              <AddCategoryPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="categories/update/:id"
          element={
            <SuspenseRoute>
              <UpdateCategoryPage />
            </SuspenseRoute>
          }
        />
        {/* Account Routes */}
        <Route
          path="account/expense"
          element={
            <SuspenseRoute>
              <ExpenseListPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="account/expense/add"
          element={
            <SuspenseRoute>
              <AddExpensePage />
            </SuspenseRoute>
          }
        />
        <Route
          path="account/expense/update/:id"
          element={
            <SuspenseRoute>
              <AddExpensePage />
            </SuspenseRoute>
          }
        />
        <Route
          path="account/bank-deposit"
          element={
            <SuspenseRoute>
              <BankDepositListPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="account/bank-deposit/add"
          element={
            <SuspenseRoute>
              <AddBankDepositPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="account/bank-deposit/update/:id"
          element={
            <SuspenseRoute>
              <AddBankDepositPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="account/journal-entry"
          element={
            <SuspenseRoute>
              <JournalEntryListPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="account/journal-entry/add"
          element={
            <SuspenseRoute>
              <AddJournalEntryPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="account/journal-entry/update/:id"
          element={
            <SuspenseRoute>
              <AddJournalEntryPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="account/bank-account"
          element={
            <SuspenseRoute>
              <BankAccountListPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="account/bank-account/add"
          element={
            <SuspenseRoute>
              <AddBankAccountPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="account/bank-account/update/:id"
          element={
            <SuspenseRoute>
              <AddBankAccountPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="account/other-payments"
          element={
            <SuspenseRoute>
              <OtherPaymentsListPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="account/other-payments/add"
          element={
            <SuspenseRoute>
              <AddOtherPaymentsPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="account/other-payments/update/:id"
          element={
            <SuspenseRoute>
              <AddOtherPaymentsPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="account/chart-of-account"
          element={
            <SuspenseRoute>
              <ChartOfAccountPage />
            </SuspenseRoute>
          }
        />
        {/* Purchase Routes */}
        <Route
          path="purchase/invoice"
          element={
            <SuspenseRoute>
              <PurchaseInvoiceListPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="purchase/invoice/add"
          element={
            <SuspenseRoute>
              <AddPurchaseInvoicePage />
            </SuspenseRoute>
          }
        />
        <Route
          path="purchase/invoice/update/:id"
          element={
            <SuspenseRoute>
              <AddPurchaseInvoicePage />
            </SuspenseRoute>
          }
        />
        <Route
          path="purchase/return"
          element={
            <SuspenseRoute>
              <PurchaseReturnListPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="purchase/return/add"
          element={
            <SuspenseRoute>
              <AddPurchaseReturnPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="purchase/return/update/:id"
          element={
            <SuspenseRoute>
              <AddPurchaseReturnPage />
            </SuspenseRoute>
          }
        />
        {/* Sales Routes */}
        <Route
          path="sales/invoice"
          element={
            <SuspenseRoute>
              <SalesInvoiceListPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="sales/invoice/add"
          element={
            <SuspenseRoute>
              <AddSalesInvoicePage />
            </SuspenseRoute>
          }
        />
        <Route
          path="sales/invoice/update/:id"
          element={
            <SuspenseRoute>
              <AddSalesInvoicePage />
            </SuspenseRoute>
          }
        />
        <Route
          path="sales/return"
          element={
            <SuspenseRoute>
              <SalesReturnListPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="sales/return/add"
          element={
            <SuspenseRoute>
              <AddSalesReturnPage />
            </SuspenseRoute>
          }
        />
        <Route
          path="sales/return/update/:id"
          element={
            <SuspenseRoute>
              <AddSalesReturnPage />
            </SuspenseRoute>
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
