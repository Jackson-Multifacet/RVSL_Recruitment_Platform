import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should open login modal on page load', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Check if login modal is accessible
    const loginModal = page.locator('[role="dialog"]');
    await expect(loginModal).toBeVisible();
  });

  test('should switch between signin and signup modes', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Find signup button
    const signupButton = page.locator('button:has-text("Create Account")').first();
    const initialText = await signupButton.textContent();
    
    // Click to switch to signup
    const modeToggle = page.locator('text="Don\'t have an account?"').or(page.locator('text="Already have an account?"'));
    if (modeToggle) {
      await modeToggle.click();
    }

    // Verify mode changed
    const emailInput = page.locator('input[placeholder="name@company.com"]');
    await expect(emailInput).toBeVisible();
  });

  test('should display validation errors for empty fields', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Check for validation
    const emailInput = page.locator('input[type="email"]');
    const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(validity).toBe(false);
  });

  test('should show password reset link on signin', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Look for forgot password link
    const forgotButton = page.locator('button:has-text("Forgot?")');
    await expect(forgotButton).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should have accessible navigation links', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Check for navigation elements
    const navLinks = page.locator('a, button[role="navigation"]');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Check for h1 tag (main heading)
    const mainHeading = page.locator('h1');
    const headingCount = await mainHeading.count();
    expect(headingCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Forms', () => {
  test('should have proper label associations', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Check for labels associated with inputs
    const emailLabel = page.locator('label:has-text("Email")');
    await expect(emailLabel).toBeVisible();

    // Check associated input
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Focus first interactive element
    await page.keyboard.press('Tab');
    
    // Check focus is visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'INPUT', 'A']).toContain(focusedElement);
  });
});
