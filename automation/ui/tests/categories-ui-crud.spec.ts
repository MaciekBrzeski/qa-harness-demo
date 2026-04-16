// UI CRUD — Categories panel.
import { test, expect } from '@playwright/test';

test.describe.serial('UI-CAT categories panel CRUD', () => {
  test('UI-CAT-001 switch to categories tab', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByRole('tab', { name: 'Categories' }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Electronics')).toBeVisible();
    await expect(page.getByText('Sensors')).toBeVisible();
  });

  test('UI-CAT-002 add category via modal → POST /api/categories', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByRole('tab', { name: 'Categories' }).click();
    await page.waitForTimeout(300);

    await page.getByLabel('action-button-add-category').click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });
    await dialog.getByLabel('text-field-name').fill('UI-Category');

    const [response] = await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/categories') && r.request().method() === 'POST'),
      dialog.getByRole('button', { name: 'Submit' }).click(),
    ]);
    expect(response.status()).toBe(201);
    await page.waitForTimeout(500);
    await expect(page.getByText('UI-Category')).toBeVisible();
  });

  test('UI-CAT-003 delete category via row-action-menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByRole('tab', { name: 'Categories' }).click();
    await page.waitForTimeout(500);

    // Find the last row (our created category) and delete it
    const menus = page.locator('[aria-label^="row-action-menu-"]');
    const lastMenu = menus.last();
    await lastMenu.click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();

    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });

    const [response] = await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/categories/') && r.request().method() === 'DELETE'),
      dialog.getByRole('button', { name: 'Delete' }).click(),
    ]);
    expect(response.status()).toBe(204);
  });
});
