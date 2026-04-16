// UI smoke — shell loads, nav visible, tabs present.
import { test, expect } from '@playwright/test';

test.describe('UI-SMOKE demo app shell', () => {
  test('SMOKE-001 app loads with title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Products Demo');
  });

  test('SMOKE-002 navigation menu button visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByLabel('navigation-menu')).toBeVisible();
  });

  test('SMOKE-003 Products + Categories tabs present', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('tab', { name: 'Products' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Categories' })).toBeVisible();
  });

  test('SMOKE-004 add-product button visible on load', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByLabel('action-button-add-product')).toBeVisible();
  });
});
