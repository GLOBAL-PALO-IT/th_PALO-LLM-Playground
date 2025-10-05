import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should redirect to /ragAgentic', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the redirect to complete
    await page.waitForURL('**/ragAgentic');
    
    // Verify we're on the ragAgentic page
    expect(page.url()).toContain('/ragAgentic');
  });

  test('should load without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');
    await page.waitForURL('**/ragAgentic');
    
    // Check that no JavaScript errors occurred
    expect(errors).toHaveLength(0);
  });
});
