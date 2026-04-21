# E2E Testing Guide

## Overview

End-to-end (E2E) tests verify that the application works correctly from a user's perspective. This project uses **Playwright** for comprehensive testing across multiple browsers.

## Setup

Playwright is already installed. Configuration is in `playwright.config.ts`.

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Debug tests
```bash
npm run test:e2e:debug
```

### Run tests for a specific file
```bash
npx playwright test e2e/auth.spec.ts
```

### Run tests in specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run single test
```bash
npx playwright test -g "should open login modal"
```

## Test Structure

Tests are located in the `/e2e` directory and follow the naming convention: `*.spec.ts`

### Example Test File
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    
    // Interact with page
    await page.click('button:has-text("Action")');
    
    // Assert expected behavior
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

## Best Practices

### 1. **Selectors**
- Use stable selectors (data-testid, role selectors)
- Avoid index-based selectors that break with layout changes

```typescript
// Good - semantic
await page.locator('button:has-text("Submit")').click();
await page.locator('[role="dialog"]').isVisible();

// Avoid - brittle
await page.locator('button').nth(2).click();
```

### 2. **Waits**
- Use Playwright's auto-waiting for elements
- Avoid arbitrary delays

```typescript
// Good - auto-waits
await page.locator('input[type="email"]').fill('user@example.com');

// Avoid
await page.waitForTimeout(1000);
```

### 3. **Test Isolation**
- Each test should be independent
- Use `beforeEach` for common setup

```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(500);
});
```

### 4. **Assertions**
- Use clear, specific assertions
- Include meaningful error messages

```typescript
await expect(page.locator('h1')).toContainText('Welcome');
await expect(page.locator('button')).toBeEnabled();
```

## Test Categories

### Authentication Tests
- Login/Logout flows
- Registration process
- Password reset
- Error handling

### Navigation Tests
- Page navigation
- Link functionality
- Menu interactions
- Back/forward browser buttons

### Form Tests
- Form submission
- Validation
- Error messages
- Keyboard navigation

### Accessibility Tests
- Keyboard navigation
- Screen reader compatibility
- Focus management
- ARIA attributes

## Debugging

### 1. **Inspector Mode**
```bash
npx playwright test --debug
```

### 2. **Screenshots on Failure**
Already enabled in config - screenshots saved in `test-results/`

### 3. **Trace Viewer**
```bash
npx playwright show-trace test-results/trace.zip
```

### 4. **Console Output**
```typescript
console.log('Debug info:', variable);
```

## CI/CD Integration

Tests run automatically in CI with:
- Retries on failure (2 retries)
- Single worker (no parallelization)
- Full traces on first retry
- Screenshots on failure

## Common Issues

### Port Already in Use
```bash
# Kill process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### Tests Timeout
- Check if dev server is running
- Increase timeout: `test.setTimeout(60000)`

### Flaky Tests
- Use explicit waits instead of timing
- Avoid hard-coded delays
- Use `waitForNavigation()` for page changes

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci)

## Next Steps

1. ✅ E2E tests setup complete
2. Add more comprehensive test coverage for:
   - Dashboard functionality
   - Job listings
   - User profiles
   - Chat system
3. Integrate with CI/CD pipeline
4. Set up test reporting dashboard
