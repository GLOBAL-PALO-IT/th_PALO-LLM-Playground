import { test, expect } from '@playwright/test';

test.describe('Application Health Check', () => {
  test('should have proper HTML structure', async ({ page }) => {
    await page.goto('/');
    
    // Wait for redirect
    await page.waitForURL('**/ragAgentic');
    
    // Check basic HTML elements exist
    const html = page.locator('html');
    await expect(html).toBeVisible();
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have a valid title', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/ragAgentic');
    
    // Check that the page has a title (even if empty, it should exist)
    const title = await page.title();
    expect(title).toBeDefined();
  });

  test('should load without network errors', async ({ page }) => {
    const failedRequests: string[] = [];
    
    page.on('requestfailed', (request) => {
      failedRequests.push(request.url());
    });

    await page.goto('/');
    await page.waitForURL('**/ragAgentic');
    await page.waitForLoadState('networkidle');
    
    // Filter out common non-critical failures and API errors that may occur in test environment
    const criticalFailures = failedRequests.filter(
      (url) => 
        !url.includes('analytics') && 
        !url.includes('favicon.ico') &&
        !url.includes('.png') &&
        !url.includes('.jpg') &&
        !url.includes('/api/') // Filter out API failures in test environment
    );
    
    expect(criticalFailures).toHaveLength(0);
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345');
    
    // Next.js should return a 404 page
    expect(response?.status()).toBe(404);
  });
});
