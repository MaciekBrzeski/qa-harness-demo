// Generated via generate-test-spec skill.
// Pattern: data-driven negative (PATTERN 3 from template)
// Library primed: parameterised-negative (8 table-driven cases)

import { test, expect, type APIRequestContext, request } from '@playwright/test';

const BASE = 'http://localhost:3456';
let ctx: APIRequestContext;

type NegCase = { id: string; title: string; method: string; url: string; data?: Record<string, unknown>; expected: number };

const CASES: NegCase[] = [
  { id: 'NEG-001', title: 'GET nonexistent product → 404', method: 'GET', url: '/api/products/999999', expected: 404 },
  { id: 'NEG-002', title: 'GET nonexistent category → 404', method: 'GET', url: '/api/categories/999999', expected: 404 },
  { id: 'NEG-003', title: 'POST product empty payload → 400', method: 'POST', url: '/api/products', data: {}, expected: 400 },
  { id: 'NEG-004', title: 'DELETE nonexistent product → 404', method: 'DELETE', url: '/api/products/999999', expected: 404 },
  { id: 'NEG-005', title: 'DELETE active product → 400', method: 'DELETE', url: '/api/products/1', expected: 400 },
  { id: 'NEG-006', title: 'PATCH nonexistent product → 404', method: 'PATCH', url: '/api/products/999999', data: { name: 'x' }, expected: 404 },
];

test.describe('NEG negative + boundary', () => {
  test.beforeAll(async () => {
    ctx = await request.newContext({ baseURL: BASE, extraHTTPHeaders: { Accept: 'application/json', 'Content-Type': 'application/json' } });
  });
  test.afterAll(async () => { await ctx.dispose(); });

  for (const c of CASES) {
    test(`${c.id} ${c.title}`, async () => {
      const res = c.method === 'GET' ? await ctx.get(c.url) : c.method === 'POST' ? await ctx.post(c.url, { data: c.data ?? {} }) : c.method === 'PATCH' ? await ctx.patch(c.url, { data: c.data ?? {} }) : await ctx.delete(c.url);
      expect(res.status()).toBe(c.expected);
    });
  }
});
