/**
 * Sample test file to verify Vitest + React Testing Library setup
 *
 * This file tests the basic App component and routing functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithMemoryRouter } from '../test/test-utils'

// Mock the AuthContext module
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: true,
    user: { id: '1', email: 'test@example.com', name: 'Test User' },
    login: vi.fn(),
    logout: vi.fn(),
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock lazy-loaded components to avoid async loading issues in tests
vi.mock('../pages/dashboard/DashboardPage', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}))

vi.mock('../pages/auth/LoginPage', () => ({
  default: () => <div data-testid="login-page">Login Page</div>,
}))

vi.mock('../components/layout/DashboardLayout', () => ({
  default: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="dashboard-layout">
      Dashboard Layout
      {children}
    </div>
  ),
}))

// Import App after mocks are set up
import App from '../App'
import { useAuth } from '../contexts/AuthContext'

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when user is authenticated', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        login: vi.fn(),
        logout: vi.fn(),
      })
    })

    it('renders the dashboard layout for authenticated users', async () => {
      renderWithMemoryRouter(<App />, { initialEntries: ['/dashboard'] })

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
      })
    })

    it('redirects from root to dashboard', async () => {
      renderWithMemoryRouter(<App />, { initialEntries: ['/'] })

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
      })
    })

    it('redirects authenticated users from login page to home', async () => {
      renderWithMemoryRouter(<App />, { initialEntries: ['/login'] })

      await waitFor(() => {
        // Should redirect to dashboard, not show login page
        expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
      })
    })
  })

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: false,
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
      })
    })

    it('shows login page for unauthenticated users', async () => {
      renderWithMemoryRouter(<App />, { initialEntries: ['/login'] })

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument()
      })
    })

    it('redirects unauthenticated users to login page', async () => {
      renderWithMemoryRouter(<App />, { initialEntries: ['/dashboard'] })

      await waitFor(() => {
        expect(screen.queryByTestId('dashboard-layout')).not.toBeInTheDocument()
      })
    })
  })
})

describe('Test Setup Verification', () => {
  it('should have access to vitest globals', () => {
    expect(true).toBe(true)
  })

  it('should have jest-dom matchers available', () => {
    const div = document.createElement('div')
    div.textContent = 'Hello'
    document.body.appendChild(div)

    expect(div).toBeInTheDocument()
    expect(div).toHaveTextContent('Hello')

    document.body.removeChild(div)
  })

  it('should be able to mock functions with vi', () => {
    const mockFn = vi.fn()
    mockFn('test')

    expect(mockFn).toHaveBeenCalledWith('test')
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should have access to DOM APIs via jsdom', () => {
    expect(window).toBeDefined()
    expect(document).toBeDefined()
    expect(document.createElement).toBeDefined()
  })
})
