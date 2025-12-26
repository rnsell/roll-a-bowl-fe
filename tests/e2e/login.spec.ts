import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Check that login page loads
    await expect(page).toHaveTitle(/Login/)
    
    // Check for email and password fields
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
  })

  test('should show validation errors for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Try to submit empty form
    await page.getByRole('button', { name: /login|sign in/i }).click()
    
    // Should show validation errors
    await expect(page.getByText(/email.*required/i)).toBeVisible()
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Fill in credentials
    await page.getByLabel(/email/i).fill('test-1762725202@testing.com')
    await page.getByLabel(/password/i).fill('DemoPassword123!')
    
    // Submit form
    await page.getByRole('button', { name: /login|sign in/i }).click()
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/)
  })
})

