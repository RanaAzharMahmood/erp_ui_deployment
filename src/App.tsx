import { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './components/layout/DashboardLayout'
import SuspenseRoute from './components/common/SuspenseRoute'

// Lazy load pages for better performance
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'))
const CompaniesPage = lazy(() => import('./pages/CompaniesPage'))
const AddCompanyPage = lazy(() => import('./pages/AddCompanyPage'))
const UpdateCompanyPage = lazy(() => import('./pages/UpdateCompanyPage'))
const CustomersPage = lazy(() => import('./pages/CustomersPage'))
const AddCustomerPage = lazy(() => import('./pages/AddCustomerPage'))
const UpdateCustomerPage = lazy(() => import('./pages/UpdateCustomerPage'))
const VendorsPage = lazy(() => import('./pages/VendorsPage'))
const AddVendorPage = lazy(() => import('./pages/AddVendorPage'))
const UpdateVendorPage = lazy(() => import('./pages/UpdateVendorPage'))
const TaxPage = lazy(() => import('./pages/TaxPage'))
const AddTaxPage = lazy(() => import('./pages/AddTaxPage'))
const UpdateTaxPage = lazy(() => import('./pages/UpdateTaxPage'))
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
              <CategoriesPage />
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
              <TaxPage />
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

