import { Page, Locator, expect } from '@playwright/test'

/**
 * Page Object Model for the Login Page
 */
export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly rememberMeCheckbox: Locator
  readonly loginButton: Locator
  readonly errorAlert: Locator
  readonly welcomeText: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByRole('textbox', { name: /email/i })
    this.passwordInput = page.locator('input[type="password"]')
    this.rememberMeCheckbox = page.getByRole('checkbox', { name: /remember me/i })
    this.loginButton = page.getByRole('button', { name: /login/i })
    this.errorAlert = page.getByRole('alert')
    this.welcomeText = page.getByText(/welcome back/i)
  }

  async goto() {
    await this.page.goto('/login')
    await this.welcomeText.waitFor({ state: 'visible' })
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email)
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password)
  }

  async checkRememberMe() {
    await this.rememberMeCheckbox.check()
  }

  async uncheckRememberMe() {
    await this.rememberMeCheckbox.uncheck()
  }

  async clickLogin() {
    await this.loginButton.click()
  }

  async login(email: string, password: string, rememberMe = false) {
    await this.fillEmail(email)
    await this.fillPassword(password)
    if (rememberMe) {
      await this.checkRememberMe()
    }
    await this.clickLogin()
  }

  async getErrorMessage(): Promise<string> {
    await this.errorAlert.waitFor({ state: 'visible', timeout: 5000 })
    return await this.errorAlert.textContent() || ''
  }

  async expectErrorMessage(message: string) {
    await expect(this.errorAlert).toBeVisible()
    await expect(this.errorAlert).toContainText(message)
  }

  async expectNoError() {
    await expect(this.errorAlert).not.toBeVisible()
  }

  async expectLoginButtonDisabled() {
    await expect(this.loginButton).toBeDisabled()
  }

  async expectLoginButtonEnabled() {
    await expect(this.loginButton).toBeEnabled()
  }

  async expectOnLoginPage() {
    await expect(this.page).toHaveURL(/\/login/)
    await expect(this.welcomeText).toBeVisible()
  }

  async waitForRedirectToDashboard() {
    await this.page.waitForURL('**/dashboard', { timeout: 10000 })
  }
}
