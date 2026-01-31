import { test as base, Page } from '@playwright/test'

/**
 * Test credentials for authentication tests
 * These should match seeded test data in the database
 */
export const TEST_USER = {
  email: 'admin@example.com',
  password: 'password123',
  name: 'Admin User',
}

export const INVALID_USER = {
  email: 'invalid@example.com',
  password: 'wrongpassword',
}

/**
 * Helper function to perform login
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByRole('textbox', { name: /email/i }).fill(email)
  await page.getByRole('textbox', { name: /password/i }).fill(password)
  await page.getByRole('button', { name: /login/i }).click()
}

/**
 * Helper function to perform logout
 */
export async function logout(page: Page) {
  // Click on the avatar/user menu
  await page.locator('[data-testid="account-menu"]').click().catch(() => {
    // Fallback: click on avatar
    return page.locator('button').filter({ has: page.locator('.MuiAvatar-root') }).click()
  })
  // Click logout option
  await page.getByRole('menuitem', { name: /logout/i }).click()
}

/**
 * Helper function to clear auth storage
 */
export async function clearAuthStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('erp_user')
    localStorage.removeItem('erp_permissions')
    localStorage.removeItem('erp_companies')
    localStorage.removeItem('erp_token_expiry')
  })
}

/**
 * Extended test fixture with authentication helpers
 */
export const test = base.extend<{
  authenticatedPage: Page
}>({
  authenticatedPage: async ({ page }, use) => {
    // Perform login before test
    await login(page, TEST_USER.email, TEST_USER.password)
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 })
    // Use the authenticated page
    await use(page)
  },
})

export { expect } from '@playwright/test'
