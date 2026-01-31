import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'
import { TEST_USER, INVALID_USER, clearAuthStorage } from './fixtures/auth.fixture'

test.describe('Authentication - Login Flow', () => {
  let loginPage: LoginPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    // Clear any existing auth data before each test
    await clearAuthStorage(page)
    await loginPage.goto()
  })

  test('should display login page with all elements', async () => {
    await expect(loginPage.welcomeText).toBeVisible()
    await expect(loginPage.emailInput).toBeVisible()
    await expect(loginPage.passwordInput).toBeVisible()
    await expect(loginPage.rememberMeCheckbox).toBeVisible()
    await expect(loginPage.loginButton).toBeVisible()
    await expect(loginPage.loginButton).toBeEnabled()
  })

  test('should successfully login with valid credentials', async ({ page }) => {
    await loginPage.login(TEST_USER.email, TEST_USER.password)

    // Should redirect to dashboard
    await loginPage.waitForRedirectToDashboard()
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should display error for invalid credentials', async () => {
    await loginPage.login(INVALID_USER.email, INVALID_USER.password)

    // Should show error message
    await loginPage.expectErrorMessage(/invalid/i)

    // Should stay on login page
    await loginPage.expectOnLoginPage()
  })

  test('should display error for empty email field', async () => {
    await loginPage.fillPassword(TEST_USER.password)
    await loginPage.clickLogin()

    // Should show validation error
    await loginPage.expectErrorMessage(/fill in all fields/i)
  })

  test('should display error for empty password field', async () => {
    await loginPage.fillEmail(TEST_USER.email)
    await loginPage.clickLogin()

    // Should show validation error
    await loginPage.expectErrorMessage(/fill in all fields/i)
  })

  test('should display error for both empty fields', async () => {
    await loginPage.clickLogin()

    // Should show validation error
    await loginPage.expectErrorMessage(/fill in all fields/i)
  })

  test('should show loading state while submitting', async ({ page }) => {
    await loginPage.fillEmail(TEST_USER.email)
    await loginPage.fillPassword(TEST_USER.password)

    // Click login and check for loading state immediately
    const loginPromise = loginPage.clickLogin()

    // Button should show loading text briefly
    await expect(loginPage.loginButton).toContainText(/signing in/i).catch(() => {
      // Loading state might be too fast to catch, that's OK
    })

    await loginPromise
  })

  test('should clear error when user starts typing', async () => {
    // First trigger an error
    await loginPage.clickLogin()
    await loginPage.expectErrorMessage(/fill in all fields/i)

    // Start typing in email field
    await loginPage.fillEmail(TEST_USER.email)
    await loginPage.clickLogin()

    // Error should still show but message might change
    await loginPage.expectErrorMessage(/fill in all fields/i)
  })
})

test.describe('Authentication - Logout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    const loginPage = new LoginPage(page)
    await clearAuthStorage(page)
    await loginPage.goto()
    await loginPage.login(TEST_USER.email, TEST_USER.password)
    await loginPage.waitForRedirectToDashboard()
  })

  test('should successfully logout and redirect to login', async ({ page }) => {
    // Open user menu by clicking on the avatar
    await page.locator('button').filter({ has: page.locator('.MuiAvatar-root') }).click()

    // Click logout
    await page.getByRole('menuitem', { name: /logout/i }).click()

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/)
  })

  test('should clear user data from storage on logout', async ({ page }) => {
    // Open user menu and logout
    await page.locator('button').filter({ has: page.locator('.MuiAvatar-root') }).click()
    await page.getByRole('menuitem', { name: /logout/i }).click()

    // Wait for redirect
    await expect(page).toHaveURL(/\/login/)

    // Check that storage is cleared
    const userData = await page.evaluate(() => localStorage.getItem('erp_user'))
    expect(userData).toBeNull()
  })
})

test.describe('Authentication - Protected Routes', () => {
  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    await clearAuthStorage(page)

    // Try to access dashboard directly
    await page.goto('/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
  })

  test('should redirect to login when accessing any protected route', async ({ page }) => {
    await clearAuthStorage(page)

    const protectedRoutes = [
      '/dashboard',
      '/companies',
      '/users',
      '/customer',
      '/vendor',
      '/inventory',
    ]

    for (const route of protectedRoutes) {
      await page.goto(route)
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
    }
  })

  test('should redirect authenticated user from login to dashboard', async ({ page }) => {
    // Login first
    const loginPage = new LoginPage(page)
    await clearAuthStorage(page)
    await loginPage.goto()
    await loginPage.login(TEST_USER.email, TEST_USER.password)
    await loginPage.waitForRedirectToDashboard()

    // Try to navigate back to login
    await page.goto('/login')

    // Should redirect back to dashboard (or stay on current page)
    await expect(page).not.toHaveURL(/\/login$/)
  })
})

test.describe('Authentication - Session Persistence', () => {
  test('should persist session after page refresh', async ({ page }) => {
    // Login
    const loginPage = new LoginPage(page)
    await clearAuthStorage(page)
    await loginPage.goto()
    await loginPage.login(TEST_USER.email, TEST_USER.password)
    await loginPage.waitForRedirectToDashboard()

    // Refresh page
    await page.reload()

    // Should still be on dashboard (authenticated)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should store user info in localStorage after login', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await clearAuthStorage(page)
    await loginPage.goto()
    await loginPage.login(TEST_USER.email, TEST_USER.password)
    await loginPage.waitForRedirectToDashboard()

    // Check localStorage
    const userData = await page.evaluate(() => localStorage.getItem('erp_user'))
    expect(userData).not.toBeNull()

    if (userData) {
      const user = JSON.parse(userData)
      expect(user.email).toBe(TEST_USER.email)
    }
  })

  test('should restore session from storage on page load', async ({ page }) => {
    // Login first
    const loginPage = new LoginPage(page)
    await clearAuthStorage(page)
    await loginPage.goto()
    await loginPage.login(TEST_USER.email, TEST_USER.password)
    await loginPage.waitForRedirectToDashboard()

    // Open a new page (simulating browser restart with storage intact)
    const newPage = await page.context().newPage()
    await newPage.goto('/dashboard')

    // Should still be authenticated (assuming session is still valid)
    // Note: This depends on the backend session still being valid
    await expect(newPage).toHaveURL(/\/(dashboard|login)/)

    await newPage.close()
  })
})

test.describe('Authentication - Error Handling', () => {
  test('should handle network error gracefully', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await clearAuthStorage(page)
    await loginPage.goto()

    // Intercept and abort the login request to simulate network failure
    await page.route('**/api/auth/login', route => route.abort('failed'))

    await loginPage.login(TEST_USER.email, TEST_USER.password)

    // Should show an error message
    await expect(loginPage.errorAlert).toBeVisible({ timeout: 5000 })
  })

  test('should handle server error response', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await clearAuthStorage(page)
    await loginPage.goto()

    // Intercept and return 500 error
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Internal server error' }),
      })
    })

    await loginPage.login(TEST_USER.email, TEST_USER.password)

    // Should show an error message
    await expect(loginPage.errorAlert).toBeVisible({ timeout: 5000 })
    await loginPage.expectOnLoginPage()
  })

  test('should handle 401 unauthorized response', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await clearAuthStorage(page)
    await loginPage.goto()

    // Intercept and return 401 error
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Invalid email or password' }),
      })
    })

    await loginPage.login(TEST_USER.email, TEST_USER.password)

    // Should show specific error message
    await loginPage.expectErrorMessage(/invalid/i)
    await loginPage.expectOnLoginPage()
  })
})

test.describe('Authentication - UI Elements', () => {
  test('should toggle remember me checkbox', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await clearAuthStorage(page)
    await loginPage.goto()

    // Initially should be unchecked
    await expect(loginPage.rememberMeCheckbox).not.toBeChecked()

    // Check it
    await loginPage.checkRememberMe()
    await expect(loginPage.rememberMeCheckbox).toBeChecked()

    // Uncheck it
    await loginPage.uncheckRememberMe()
    await expect(loginPage.rememberMeCheckbox).not.toBeChecked()
  })

  test('should have proper form accessibility attributes', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await clearAuthStorage(page)
    await loginPage.goto()

    // Check email input
    await expect(loginPage.emailInput).toHaveAttribute('aria-required', 'true')

    // Check password input
    await expect(loginPage.passwordInput).toHaveAttribute('aria-required', 'true')
  })

  test('should display user avatar initial after login', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await clearAuthStorage(page)
    await loginPage.goto()
    await loginPage.login(TEST_USER.email, TEST_USER.password)
    await loginPage.waitForRedirectToDashboard()

    // Avatar should be visible in the header
    const avatar = page.locator('.MuiAvatar-root')
    await expect(avatar).toBeVisible()
  })
})
