// Generated via generate-test-spec skill.
// Pattern: sub-resource CRUD (mirrors InvenTree BOM substitutes pattern)
// Library primed: bom-substitute-delete (nested dialog/sub-resource)

import { test, expect, type APIRequestContext, request } from '@playwright/test';

const BASE = 'http://localhost:3456';
let ctx: APIRequestContext;

test.describe.serial('VAR variants sub-resource', () => {
  test.beforeAll(async () => {
    ctx = await request.newContext({ baseURL: BASE, extraHTTPHeaders: { Accept: 'application/json', 'Content-Type': 'application/json' } });
  });
  test.afterAll(async () => { await ctx.dispose(); });

  test('VAR-001 GET /api/products/1/variants returns list', async () => {
    const res = await ctx.get('/api/products/1/variants');
    expect(res.status()).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });

  test('VAR-002 POST /api/products/1/variants creates variant', async () => {
    const res = await ctx.post('/api/products/1/variants', { data: { name: 'Red Version', sku: `V-${Date.now()}` } });
    expect(res.status()).toBe(201);
    const body = await res.json() as { id: number; product: number; name: string };
    expect(body.product).toBe(1);
    expect(body.name).toBe('Red Version');
  });

  test('VAR-003 POST variant on nonexistent product returns 404', async () => {
    const res = await ctx.post('/api/products/999999/variants', { data: { name: 'X' } });
    expect(res.status()).toBe(404);
  });
});
