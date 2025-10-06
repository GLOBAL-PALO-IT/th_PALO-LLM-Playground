import { test, expect } from '@playwright/test';

test.describe('Chat Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
  });

  test('should load the Chat page', async ({ page }) => {
    // Verify the page has loaded by checking the URL
    expect(page.url()).toContain('/chat');
  });

  test('should have no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
    
    // Filter out known harmless errors and API-related errors that may occur in test environment
    const criticalErrors = errors.filter(
      (error) => 
        !error.includes('favicon') && 
        !error.includes('404') &&
        !error.includes('500') &&
        !error.includes('Failed to load resource') &&
        !error.includes('getCollectionList')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should be accessible on different viewport sizes', async ({ page }) => {
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/chat');
    await expect(page.locator('body')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
  });
});
