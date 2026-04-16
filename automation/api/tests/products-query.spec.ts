// Generated via generate-test-spec skill.
// Pattern: data-driven query (PATTERN 3 variant for filter tests)
// Library primed: parameterised-query (7 filter variants in cases[] loop)

import { test, expect, type APIRequestContext, request } from '@playwright/test';

const BASE = 'http://localhost:3456';
let ctx: APIRequestContext;

type QueryCase = {
  id: string;
  title: string;
  url: string;
  assert: (body: { count: number; results: unknown[] }) => void;
};

test.describe.serial('PROD-QUERY product filters', () => {
  test.beforeAll(async () => {
    ctx = await request.newContext({ baseURL: BASE, extraHTTPHeaders: { Accept: 'application/json' } });
  });
  test.afterAll(async () => { await ctx.dispose(); });

  const cases: QueryCase[] = [
    { id: 'QUERY-001', title: 'filter by category=2', url: '/api/products?category=2',
      assert: (b) => { expect(b.results.length).toBeGreaterThan(0); b.results.forEach((p: any) => expect(p.category).toBe(2)); } },
    { id: 'QUERY-002', title: 'filter by status=active', url: '/api/products?status=active',
      assert: (b) => { b.results.forEach((p: any) => expect(p.status).toBe('active')); } },
    { id: 'QUERY-003', title: 'filter by status=inactive', url: '/api/products?status=inactive',
      assert: (b) => { b.results.forEach((p: any) => expect(p.status).toBe('inactive')); } },
    { id: 'QUERY-004', title: 'search by name substring', url: '/api/products?search=Sensor',
      assert: (b) => { expect(b.count).toBeGreaterThan(0); b.results.forEach((p: any) => expect(p.name.toLowerCase()).toContain('sensor')); } },
    { id: 'QUERY-005', title: 'limit=1 returns 1 result', url: '/api/products?limit=1',
      assert: (b) => { expect(b.results.length).toBe(1); } },
    { id: 'QUERY-006', title: 'offset=1 skips first', url: '/api/products?limit=1&offset=1',
      assert: (b) => { expect(b.results.length).toBe(1); } },
  ];

  for (const c of cases) {
    test(`${c.id} ${c.title}`, async () => {
      const res = await ctx.get(c.url);
      expect(res.status()).toBe(200);
      c.assert(await res.json() as { count: number; results: unknown[] });
    });
  }
});
