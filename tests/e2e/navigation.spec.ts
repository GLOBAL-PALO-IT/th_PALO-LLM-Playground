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
    await page.waitForURL('**/chat');
    
    await page.goto('/ragAgentic');
    await page.waitForURL('**/ragAgentic');
    
    // Go back to chat
    await page.goBack();
    await page.waitForURL('**/chat');
    expect(page.url()).toContain('/chat');
    
    // Go forward to ragAgentic
    await page.goForward();
    await page.waitForURL('**/ragAgentic');
    expect(page.url()).toContain('/ragAgentic');
  });
});
