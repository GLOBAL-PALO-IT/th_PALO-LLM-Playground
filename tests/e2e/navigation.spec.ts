import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to different pages', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation to chat page
    await page.goto('/chat');
    expect(page.url()).toContain('/chat');
    
    // Test navigation to ragAgentic page
    await page.goto('/ragAgentic');
    expect(page.url()).toContain('/ragAgentic');
    
    // Test navigation to chatWithTools page
    await page.goto('/chatWithTools');
    expect(page.url()).toContain('/chatWithTools');
  });

  test('should have working back and forward navigation', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/ragAgentic');
    await page.waitForLoadState('networkidle');
    
    // Go back to chat
    await Promise.all([
      page.waitForURL('**/chat', { timeout: 5000 }),
      page.goBack()
    ]);
    expect(page.url()).toContain('/chat');
    
    // Go forward to ragAgentic
    await Promise.all([
      page.waitForURL('**/ragAgentic', { timeout: 5000 }),
      page.goForward()
    ]);
    expect(page.url()).toContain('/ragAgentic');
  });
});
