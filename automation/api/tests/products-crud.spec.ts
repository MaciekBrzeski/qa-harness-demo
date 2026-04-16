// Generated via generate-test-spec skill.
// Pattern: API table-driven CRUD (from test-generation-prompt.md PATTERN 1)
// Library primed: petstore-full-coverage (21-endpoint single-file shape)
// Anti-pattern avoided: deactivate-before-delete (InvenTree INV-PARTS-001 pattern)

import { test, expect, type APIRequestContext, request } from '@playwright/test';

const BASE = 'http://localhost:3456';
let ctx: APIRequestContext;
let createdId: number | undefined;

test.describe.serial('PROD-CRUD products lifecycle', () => {
  test.beforeAll(async () => {
    ctx = await request.newContext({ baseURL: BASE, extraHTTPHeaders: { Accept: 'application/json', 'Content-Type': 'application/json' } });
  });
  test.afterAll(async () => {
    if (createdId) {
      await ctx.patch(`/api/products/${createdId}`, { data: { status: 'inactive' } }).catch(() => undefined);
      await ctx.delete(`/api/products/${createdId}`).catch(() => undefined);
    }
    await ctx.dispose();
  });

  test('PROD-001 GET /api/products returns paginated list', async () => {
    const res = await ctx.get('/api/products');
    expect(res.status()).toBe(200);
    const body = await res.json() as { count: number; results: unknown[] };
    expect(body.count).toBeGreaterThan(0);
    expect(Array.isArray(body.results)).toBe(true);
  });

  test('PROD-002 POST /api/products creates a product', async () => {
    const res = await ctx.post('/api/products', {
      data: { name: `Demo-${Date.now()}`, sku: `D-${Date.now()}`, category: 1, price: 9.99 },
    });
    expect(res.status()).toBe(201);
    const body = await res.json() as { id: number; name: string; status: string };
    createdId = body.id;
    expect(createdId).toBeDefined();
    expect(body.status).toBe('active');
  });

  test('PROD-003 GET /api/products/{id} retrieves', async () => {
    const res = await ctx.get(`/api/products/${createdId}`);
    expect(res.status()).toBe(200);
    expect((await res.json() as { id: number }).id).toBe(createdId);
  });

  test('PROD-004 PATCH /api/products/{id} updates name', async () => {
    const res = await ctx.patch(`/api/products/${createdId}`, { data: { name: 'Updated-Demo' } });
    expect(res.status()).toBe(200);
    expect((await res.json() as { name: string }).name).toBe('Updated-Demo');
  });

  test('PROD-005 DELETE active product returns 400', async () => {
    // Business rule: must deactivate before delete (same as InvenTree INV-PARTS-001)
    const res = await ctx.delete(`/api/products/${createdId}`);
    expect(res.status()).toBe(400);
  });

  test('PROD-006 PATCH inactive + DELETE succeeds', async () => {
    await ctx.patch(`/api/products/${createdId}`, { data: { status: 'inactive' } });
    const res = await ctx.delete(`/api/products/${createdId}`);
    expect(res.status()).toBe(204);
    createdId = undefined; // cleaned up in-test
  });
});
