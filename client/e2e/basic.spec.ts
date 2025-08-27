import { test, expect } from '@playwright/test';

test.describe('Basic functionality', () => {
  test('health check endpoint works', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
  });

  test('join form renders correctly', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('h1')).toContainText('GG Poker');
    await expect(page.locator('h2')).toContainText('Join a Game');
    
    // Check form elements
    await expect(page.locator('input[placeholder="Enter your name"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Enter room code"]')).toBeVisible();
    await expect(page.locator('button:has-text("Join Room")')).toBeVisible();
    await expect(page.locator('button:has-text("Create New Room")')).toBeVisible();
  });

  test('connection status shows connected', async ({ page }) => {
    await page.goto('/');
    
    // Wait for socket connection
    await expect(page.locator('.connection-status')).toContainText('Connected', { timeout: 5000 });
  });

  test('two clients can load simultaneously', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Load both pages
    await Promise.all([
      page1.goto('/'),
      page2.goto('/')
    ]);
    
    // Both should show the join form
    await expect(page1.locator('h1')).toContainText('GG Poker');
    await expect(page2.locator('h1')).toContainText('GG Poker');
    
    // Both should connect to the server
    await expect(page1.locator('.connection-status')).toContainText('Connected', { timeout: 5000 });
    await expect(page2.locator('.connection-status')).toContainText('Connected', { timeout: 5000 });
    
    await context1.close();
    await context2.close();
  });

  test('form validation works', async ({ page }) => {
    await page.goto('/');
    
    const joinButton = page.locator('button:has-text("Join Room")');
    const createButton = page.locator('button:has-text("Create New Room")');
    
    // Initially disabled
    await expect(joinButton).toBeDisabled();
    await expect(createButton).toBeDisabled();
    
    // Fill name only
    await page.fill('input[placeholder="Enter your name"]', 'TestPlayer');
    await expect(joinButton).toBeDisabled(); // Still disabled without room code
    await expect(createButton).not.toBeDisabled(); // Create should be enabled
    
    // Fill room code
    await page.fill('input[placeholder="Enter room code"]', 'ABC123');
    await expect(joinButton).not.toBeDisabled(); // Now enabled
  });
});