import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the unified dashboard', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the homepage (not redirected)
    expect(page.url()).not.toContain('/ragAgentic');
    expect(page.url()).toMatch(/\/$|\/$/);
    
    // Check for dashboard elements
    await expect(page.getByRole('heading', { name: 'PALO LLM Playground' })).toBeVisible();
    await expect(page.getByPlaceholder('Search examples...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
  });

  test('should load without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that no JavaScript errors occurred
    expect(errors).toHaveLength(0);
  });

  test('should display example cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that example cards are visible
    await expect(page.getByRole('heading', { name: 'Shell Agent' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Basic Chat' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'RAG with Chat' })).toBeVisible();
  });

  test('should filter examples by category', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click on RAG category
    await page.getByRole('button', { name: 'RAG', exact: true }).click();
    
    // Check that RAG examples are shown
    await expect(page.getByRole('heading', { name: 'RAG Chunking Raw Text' })).toBeVisible();
    
    // Check that non-RAG examples are hidden
    await expect(page.getByRole('heading', { name: 'Shell Agent' })).not.toBeVisible();
  });

  test('should search examples', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Type in search box
    await page.getByPlaceholder('Search examples...').fill('chat');
    
    // Check that chat examples are shown
    await expect(page.getByRole('heading', { name: 'Basic Chat' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Chat With Tools' })).toBeVisible();
    
    // Check that non-chat examples are hidden
    await expect(page.getByRole('heading', { name: 'Shell Agent' })).not.toBeVisible();
  });
});
