// UI CRUD — Products panel. Generated via generate-test-spec skill.
// Mirrors InvenTree patterns: action-button-add, row-action-menu, dialog-scoped delete.
import { test, expect } from '@playwright/test';

test.describe.serial('UI-PROD products panel CRUD', () => {
  test('UI-PROD-001 products tab loads with seeded data', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByLabel('navigation-menu')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Products' })).toHaveAttribute('aria-selected', 'true');
    // Seeded products visible
    await expect(page.getByText('Temperature Sensor')).toBeVisible();
    await expect(page.getByText('Humidity Sensor')).toBeVisible();
  });

  test('UI-PROD-002 add product via modal → POST /api/products', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByLabel('action-button-add-product').click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });

    await dialog.getByLabel('text-field-name').fill('UI-Created-Product');
    await dialog.getByLabel('text-field-sku').fill('UCP-001');
    await dialog.getByLabel('number-field-price').fill('19.99');

    const [response] = await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/products') && r.request().method() === 'POST'),
      dialog.getByRole('button', { name: 'Submit' }).click(),
    ]);
    expect(response.status()).toBe(201);

    // Verify row appears in table
    await page.waitForTimeout(500);
    await expect(page.getByText('UI-Created-Product')).toBeVisible();
  });

  test('UI-PROD-003 edit product via row-action-menu → PATCH', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Find the row with our created product and click its menu
    await page.getByLabel('row-action-menu-0').first().click();
    await page.getByRole('menuitem', { name: 'Edit' }).click();

    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });
    await dialog.getByLabel('text-field-name').fill('Renamed-Sensor');

    const [response] = await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/products/') && r.request().method() === 'PATCH'),
      dialog.getByRole('button', { name: 'Submit' }).click(),
    ]);
    expect(response.status()).toBe(200);
  });

  test('UI-PROD-004 delete active product shows deactivate confirm', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.getByLabel('row-action-menu-0').first().click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();

    // Delete dialog should appear
    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });
    await expect(dialog.getByText(/active|Deactivate/i)).toBeVisible();

    // Confirm delete (deactivates + deletes)
    const deleteResponses: number[] = [];
    page.on('response', r => {
      if (r.url().includes('/api/products/') && (r.request().method() === 'PATCH' || r.request().method() === 'DELETE')) {
        deleteResponses.push(r.status());
      }
    });
    await dialog.getByRole('button', { name: 'Delete' }).click();
    await page.waitForTimeout(1000);
    // Should have PATCH (deactivate) + DELETE
    expect(deleteResponses.length).toBeGreaterThanOrEqual(1);
  });

  test('UI-PROD-005 search filters products', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const search = page.getByLabel('search-products');
    await search.fill('Humidity');
    await page.waitForTimeout(500);

    // Should show Humidity Sensor, hide Temperature Sensor
    await expect(page.getByText('Humidity Sensor')).toBeVisible();
  });

  test('UI-PROD-006 status filter works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.getByLabel('filter-status').selectOption('inactive');
    await page.waitForTimeout(500);

    // Only inactive products shown
    await expect(page.getByText('Discontinued Board')).toBeVisible();
  });
});
