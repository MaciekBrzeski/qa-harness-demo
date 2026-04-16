// Smoke test — health endpoint
import { test, expect, type APIRequestContext, request } from '@playwright/test';

let ctx: APIRequestContext;

test.describe('HEALTH smoke', () => {
  test.beforeAll(async () => { ctx = await request.newContext({ baseURL: 'http://localhost:3456' }); });
  test.afterAll(async () => { await ctx.dispose(); });

  test('HEALTH-001 GET /api/health returns ok', async () => {
    const res = await ctx.get('/api/health');
    expect(res.status()).toBe(200);
    const body = await res.json() as { status: string; version: string };
    expect(body.status).toBe('ok');
    expect(body.version).toBe('1.0.0');
  });

  test('HEALTH-002 GET /api/schema returns OpenAPI doc', async () => {
    const res = await ctx.get('/api/schema');
    expect(res.status()).toBe(200);
    const body = await res.json() as { openapi?: string; paths?: Record<string, unknown> };
    expect(body.openapi).toBe('3.0.3');
    expect(Object.keys(body.paths!).length).toBeGreaterThan(5);
  });
});
