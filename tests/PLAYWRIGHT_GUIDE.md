# Playwright Quick Reference

## Useful Commands

### Test Execution
```bash
# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test tests/e2e/homepage.spec.ts

# Run tests matching a pattern
npx playwright test --grep "homepage"

# Run tests in a specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Interactive & Debug Modes
```bash
# UI Mode - Interactive test runner
npm run test:e2e:ui

# Debug mode with inspector
npm run test:e2e:debug

# Run with headed browser (see what's happening)
npm run test:e2e:headed

# Step through tests with debugger
npx playwright test --debug
```

### Reports
```bash
# Show HTML report
npm run test:e2e:report

# Generate trace viewer
npx playwright show-trace trace.zip
```

### Code Generation
```bash
# Generate test code by recording interactions
npx playwright codegen http://localhost:3000

# Generate tests for specific page
npx playwright codegen http://localhost:3000/chat
```

## Common Test Patterns

### Basic Navigation
```typescript
test('navigate to page', async ({ page }) => {
  await page.goto('/chat');
  expect(page.url()).toContain('/chat');
});
```

### Finding Elements
```typescript
// By text
await page.getByText('Submit').click();

// By role
await page.getByRole('button', { name: 'Submit' }).click();

// By label
await page.getByLabel('Username').fill('testuser');

// By placeholder
await page.getByPlaceholder('Enter your name').fill('John');

// By test ID
await page.getByTestId('submit-button').click();

// CSS selector
await page.locator('.class-name').click();
```

### Interactions
```typescript
// Click
await page.getByRole('button').click();

// Type text
await page.getByLabel('Search').fill('playwright');

// Press keys
await page.getByLabel('Search').press('Enter');

// Select option
await page.getByLabel('Country').selectOption('US');

// Check/uncheck
await page.getByLabel('Accept terms').check();
await page.getByLabel('Subscribe').uncheck();
```

### Assertions
```typescript
// Visibility
await expect(page.getByText('Welcome')).toBeVisible();
await expect(page.getByText('Loading')).toBeHidden();

// Text content
await expect(page.getByRole('heading')).toHaveText('Dashboard');
await expect(page.getByRole('alert')).toContainText('Error');

// URL
expect(page.url()).toContain('/dashboard');
await expect(page).toHaveURL(/.*dashboard/);

// Count
await expect(page.getByRole('listitem')).toHaveCount(5);
```

### Waiting
```typescript
// Wait for element
await page.waitForSelector('.loaded');

// Wait for navigation
await page.waitForURL('**/dashboard');

// Wait for load state
await page.waitForLoadState('networkidle');
await page.waitForLoadState('domcontentloaded');

// Wait for timeout (use sparingly)
await page.waitForTimeout(1000);
```

### Screenshots
```typescript
// Full page screenshot
await page.screenshot({ path: 'screenshot.png', fullPage: true });

// Element screenshot
await page.locator('.header').screenshot({ path: 'header.png' });
```

## Tips & Best Practices

1. **Use data-testid for stable selectors**
   ```html
   <button data-testid="submit-btn">Submit</button>
   ```
   ```typescript
   await page.getByTestId('submit-btn').click();
   ```

2. **Avoid hard-coded waits**
   ```typescript
   // Bad
   await page.waitForTimeout(5000);
   
   // Good
   await page.waitForLoadState('networkidle');
   await expect(page.getByText('Loaded')).toBeVisible();
   ```

3. **Use page.goto() baseURL from config**
   ```typescript
   // Config has baseURL: 'http://localhost:3000'
   await page.goto('/chat'); // Goes to http://localhost:3000/chat
   ```

4. **Handle dynamic content**
   ```typescript
   // Wait for dynamic content
   await expect(page.getByRole('list')).toBeVisible();
   await expect(page.getByRole('listitem')).toHaveCount(5);
   ```

5. **Use test.describe for organization**
   ```typescript
   test.describe('Feature Name', () => {
     test.beforeEach(async ({ page }) => {
       await page.goto('/feature');
     });
     
     test('test 1', async ({ page }) => { });
     test('test 2', async ({ page }) => { });
   });
   ```

## Environment Variables

Create a `.env` file in the root:
```bash
OPENAI_API_KEY=your_key_here
```

Access in tests:
```typescript
test('uses API', async ({ page }) => {
  // Environment variables are available via process.env
  expect(process.env.OPENAI_API_KEY).toBeDefined();
});
```

## Troubleshooting

### Browser not installed
```bash
npm run playwright:install
```

### Port already in use
Stop any existing dev servers on port 3000 before running tests.

### Flaky tests
- Use proper waits instead of `waitForTimeout`
- Increase timeout in config if needed
- Use `test.retry()` for inherently flaky operations

### Debug specific test
```bash
npx playwright test tests/e2e/homepage.spec.ts --debug
```

## Resources
- [Playwright Docs](https://playwright.dev/docs/intro)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors](https://playwright.dev/docs/selectors)
- [Assertions](https://playwright.dev/docs/test-assertions)
