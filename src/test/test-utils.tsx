/**
 * Test utilities and custom render function for React Testing Library
 *
 * This file provides a custom render function that wraps components with
 * commonly needed providers (Router, Theme, Auth, etc.)
 */

import React, { ReactElement, ReactNode } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { BrowserRouter, MemoryRouter, MemoryRouterProps } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

// Create a default test theme (can be customized)
const testTheme = createTheme({
  palette: {
    mode: 'light',
  },
})

/**
 * Mock Auth Context for testing
 */
interface MockUser {
  id: string
  email: string
  name: string
}

interface MockAuthContextValue {
  user: MockUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const defaultMockAuth: MockAuthContextValue = {
  user: { id: '1', email: 'test@example.com', name: 'Test User' },
  isAuthenticated: true,
  login: async () => true,
  logout: () => {},
}

const MockAuthContext = React.createContext<MockAuthContextValue>(defaultMockAuth)

export const MockAuthProvider: React.FC<{
  children: ReactNode
  value?: Partial<MockAuthContextValue>
}> = ({ children, value = {} }) => {
  const contextValue = { ...defaultMockAuth, ...value }
  return (
    <MockAuthContext.Provider value={contextValue}>
      {children}
    </MockAuthContext.Provider>
  )
}

export const useMockAuth = () => React.useContext(MockAuthContext)

/**
 * All providers wrapper for testing
 */
interface AllProvidersProps {
  children: ReactNode
  authValue?: Partial<MockAuthContextValue>
  initialEntries?: string[]
}

const AllProviders: React.FC<AllProvidersProps> = ({
  children,
  authValue,
  initialEntries = ['/'],
}) => {
  return (
    <ThemeProvider theme={testTheme}>
      <CssBaseline />
      <MemoryRouter initialEntries={initialEntries}>
        <MockAuthProvider value={authValue}>
          {children}
        </MockAuthProvider>
      </MemoryRouter>
    </ThemeProvider>
  )
}

/**
 * Custom render options
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authValue?: Partial<MockAuthContextValue>
  initialEntries?: string[]
}

/**
 * Custom render function that wraps components with providers
 *
 * @example
 * // Basic usage
 * const { getByText } = renderWithProviders(<MyComponent />)
 *
 * @example
 * // With custom auth state
 * const { getByText } = renderWithProviders(<MyComponent />, {
 *   authValue: { isAuthenticated: false }
 * })
 *
 * @example
 * // With initial route
 * const { getByText } = renderWithProviders(<MyComponent />, {
 *   initialEntries: ['/dashboard']
 * })
 */
export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  const { authValue, initialEntries, ...renderOptions } = options

  const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
    <AllProviders authValue={authValue} initialEntries={initialEntries}>
      {children}
    </AllProviders>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

/**
 * Simple render with just BrowserRouter (for components that don't need full providers)
 */
export const renderWithRouter = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => {
  const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
    <BrowserRouter>{children}</BrowserRouter>
  )

  return render(ui, { wrapper: Wrapper, ...options })
}

/**
 * Render with MemoryRouter for testing specific routes
 */
export const renderWithMemoryRouter = (
  ui: ReactElement,
  routerProps?: MemoryRouterProps,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => {
  const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
    <MemoryRouter {...routerProps}>{children}</MemoryRouter>
  )

  return render(ui, { wrapper: Wrapper, ...options })
}

/**
 * Render with MUI ThemeProvider only
 */
export const renderWithTheme = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => {
  const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
    <ThemeProvider theme={testTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )

  return render(ui, { wrapper: Wrapper, ...options })
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Export the default render as well
export { render }
