// Generated via generate-test-spec skill.
// Pattern: API table-driven CRUD
// Library primed: api-category (InvenTree category pattern)

import { test, expect, type APIRequestContext, request } from '@playwright/test';

const BASE = 'http://localhost:3456';
let ctx: APIRequestContext;
let createdId: number | undefined;

test.describe.serial('CAT-CRUD categories lifecycle', () => {
  test.beforeAll(async () => {
    ctx = await request.newContext({ baseURL: BASE, extraHTTPHeaders: { Accept: 'application/json', 'Content-Type': 'application/json' } });
  });
  test.afterAll(async () => {
    if (createdId) await ctx.delete(`/api/categories/${createdId}`).catch(() => undefined);
    await ctx.dispose();
  });

  test('CAT-001 GET /api/categories lists seeded categories', async () => {
    const res = await ctx.get('/api/categories');
    expect(res.status()).toBe(200);
    const list = await res.json() as Array<{ id: number; name: string }>;
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]!.name).toBeDefined();
  });

  test('CAT-002 POST /api/categories creates', async () => {
    const res = await ctx.post('/api/categories', { data: { name: `Demo-Cat-${Date.now()}`, parent: 1 } });
    expect(res.status()).toBe(201);
    const body = await res.json() as { id: number; parent: number };
    createdId = body.id;
    expect(body.parent).toBe(1);
  });

  test('CAT-003 GET /api/categories/{id} retrieves', async () => {
    const res = await ctx.get(`/api/categories/${createdId}`);
    expect(res.status()).toBe(200);
    expect((await res.json() as { id: number }).id).toBe(createdId);
  });

  test('CAT-004 DELETE /api/categories/{id} removes', async () => {
    const res = await ctx.delete(`/api/categories/${createdId}`);
    expect(res.status()).toBe(204);
    createdId = undefined;
  });

  test('CAT-005 POST without name returns 400', async () => {
    const res = await ctx.post('/api/categories', { data: {} });
    expect(res.status()).toBe(400);
  });
});
