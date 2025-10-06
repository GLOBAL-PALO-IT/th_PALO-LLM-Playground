import { test, expect } from '@playwright/test';

/**
 * Example tests demonstrating common Playwright patterns
 * These tests serve as a reference for writing new tests
 */

test.describe('Example Tests - Common Patterns', () => {
  test('Example 1: Basic page load and navigation', async ({ page }) => {
    // Navigate to a page
    await page.goto('/chat');
    
    // Verify URL
    expect(page.url()).toContain('/chat');
    
    // Navigate to another page
    await page.goto('/ragAgentic');
    expect(page.url()).toContain('/ragAgentic');
  });

  test('Example 2: Checking page structure', async ({ page }) => {
    await page.goto('/chat');
    
    // Check that the page has loaded by verifying HTML structure
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check for the Next.js root div (common in Next.js apps)
    const root = page.locator('#__next');
    await expect(root).toBeAttached();
  });

  test('Example 3: Responsive design testing', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ 
        width: viewport.width, 
        height: viewport.height 
      });
      
      await page.goto('/chat');
      
      // Verify page is still usable at this viewport
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Example 4: Monitoring console errors', async ({ page }) => {
    const errors: string[] = [];
    
    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
    
    // Filter out known harmless errors
    const criticalErrors = errors.filter(
      (error) => !error.includes('favicon') && !error.includes('404')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('Example 5: Testing page metadata', async ({ page }) => {
    await page.goto('/chat');
    
    // Check page title
    const title = await page.title();
    expect(title).toBeDefined();
    
    // Check for meta tags (if your app has them)
    const metaDescription = page.locator('meta[name="description"]');
    // Note: This might not exist, so we just check it doesn't throw
    await metaDescription.count();
  });

  test('Example 6: Performance - Page load time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load in reasonable time (adjust threshold as needed)
    expect(loadTime).toBeLessThan(10000); // 10 seconds
  });

  test('Example 7: Multiple page loads', async ({ page }) => {
    const pages = ['/chat', '/ragAgentic', '/chatWithTools'];
    
    for (const pagePath of pages) {
      const response = await page.goto(pagePath);
      
      // All pages should return 200 status
      expect(response?.status()).toBe(200);
      
      // Verify we're on the correct page
      expect(page.url()).toContain(pagePath);
    }
  });

  test.skip('Example 8: Skipped test - API interaction (requires API key)', async ({ page }) => {
    // This test is skipped because it requires an API key
    // Use test.skip() for tests that shouldn't run in certain environments
    await page.goto('/chat');
    // ... test that requires API interaction
  });
});

test.describe('Example Tests - Testing Hooks', () => {
  // beforeEach runs before each test in this describe block
  test.beforeEach(async ({ page }) => {
    // Navigate to the page before each test
    await page.goto('/chat');
  });

  // afterEach runs after each test in this describe block
  test.afterEach(async ({ page }) => {
    // Clean up if needed (e.g., clear localStorage)
    await page.evaluate(() => localStorage.clear());
  });

  test('Test 1 with beforeEach', async ({ page }) => {
    // Page is already on /chat thanks to beforeEach
    expect(page.url()).toContain('/chat');
  });

  test('Test 2 with beforeEach', async ({ page }) => {
    // Page is already on /chat thanks to beforeEach
    expect(page.url()).toContain('/chat');
  });
});

// You can organize tests by feature/section
test.describe('Example Tests - By Feature', () => {
  test.describe('Chat Feature', () => {
    test('loads chat interface', async ({ page }) => {
      await page.goto('/chat');
      expect(page.url()).toContain('/chat');
    });
  });

  test.describe('RAG Feature', () => {
    test('loads RAG interface', async ({ page }) => {
      await page.goto('/ragAgentic');
      expect(page.url()).toContain('/ragAgentic');
    });
  });
});
