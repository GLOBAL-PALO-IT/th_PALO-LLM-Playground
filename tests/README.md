# E2E Tests with Playwright

This directory contains end-to-end tests for the PALO-LLM-Playground project using Playwright.

## Setup

### First-time Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npm run playwright:install
```

## Running Tests

### Run all tests (headless mode)
```bash
npm run test:e2e
```

### Run tests with UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug tests
```bash
npm run test:e2e:debug
```

### View test report
```bash
npm run test:e2e:report
```

## Test Structure

The tests are organized as follows:

- `homepage.spec.ts` - Tests for the homepage and redirect behavior
- `rag-agentic.spec.ts` - Tests for the RAG Agentic page
- `chat.spec.ts` - Tests for the Chat page
- `navigation.spec.ts` - Tests for navigation between pages

## Writing New Tests

When adding new tests:

1. Create a new `.spec.ts` file in the `tests/e2e` directory
2. Import the test utilities:
```typescript
import { test, expect } from '@playwright/test';
```

3. Use descriptive test names and organize tests in `describe` blocks:
```typescript
test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    // Test implementation
  });
});
```

## Configuration

The Playwright configuration is located in `playwright.config.ts` at the root of the project. Key settings:

- **baseURL**: `http://localhost:3000`
- **webServer**: Automatically starts the dev server before running tests
- **Projects**: Tests run on Chromium, Firefox, and WebKit browsers

## CI/CD

Tests automatically run on:
- Push to `main` or `master` branches
- Pull requests to `main` or `master` branches

The CI workflow is defined in `.github/workflows/playwright.yml`.

## Troubleshooting

### Browser installation fails
If `npm run playwright:install` fails, try:
```bash
npx playwright install chromium
```

### Tests fail locally but pass in CI
Make sure your dev server is not already running on port 3000.

### Tests timeout
Increase the timeout in `playwright.config.ts` if needed.

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
