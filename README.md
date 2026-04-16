# qa-harness-demo

End-to-end demonstration of the qa-harness test generation pipeline.

A 80-line Express mock server + OpenAPI spec → the `generate-test-spec` skill
produces 6 spec files covering every endpoint → 28 tests → all green in
under 500ms. Zero manual test authoring.

## What this proves

1. **OpenAPI spec → test coverage in minutes**, not hours.
2. **The same patterns** validated against InvenTree (real Django app) and Petstore (Swagger sandbox) work against a custom mock — the harness is truly generic.
3. **Business rules transfer**: the deactivate-before-delete pattern (InvenTree's INV-PARTS-001 bug) is encoded in the mock AND caught by the generated tests.
4. **All test types covered**: CRUD, parameterised query/filter, sub-resources (variants), negative/boundary, health smoke.

## Quick start

```bash
cd mock-server && npm install && node index.js &
cd ../automation/api && npm install && npx playwright test
```

Expected output: 28 passed (~500ms).

## Architecture

```
mock-server/
├── index.js          # 80-line Express server, in-memory CRUD
├── openapi.json      # Hand-written OpenAPI 3.0 spec (12 endpoints)
└── package.json

automation/api/
├── tests/
│   ├── products-crud.spec.ts    # 6 tests: list, create, get, update, delete-blocked, delete-after-deactivate
│   ├── products-query.spec.ts   # 6 tests: category filter, status filter, search, limit, offset
│   ├── categories-crud.spec.ts  # 5 tests: list, create, get, delete, validation error
│   ├── variants.spec.ts         # 3 tests: list, create, 404 on nonexistent product
│   ├── negative.spec.ts         # 6 tests: 404s, 400s, delete-active-blocked
│   └── health.spec.ts           # 2 tests: health endpoint + schema endpoint
└── playwright.config.ts
```

## How tests were generated

Each spec file was produced by the `generate-test-spec` Claude Code skill:

1. **Read** `~/.local/share/qa-harness/test-generation-prompt.md` (4 patterns + 5 anti-patterns + self-check)
2. **Query** `qa-examples` library for closest match (e.g. `petstore-full-coverage` for CRUD, `parameterised-query` for filters)
3. **Fill** the template pattern with the mock's endpoint paths + seed payload shapes
4. **Self-check**: every test has real `expect()` on status + body, cleanup in afterAll, no hardcoded IDs
5. **Run**: `npx playwright test` → green on first try

## The mock's business rules (mirroring real-world patterns)

| rule | endpoint | mirrors |
|---|---|---|
| Name required on create | POST /api/products → 400 | InvenTree POST /api/part/ |
| Active products cannot be deleted | DELETE /api/products/{id} → 400 | InvenTree INV-PARTS-001 |
| Hierarchical categories | POST /api/categories `parent` FK | InvenTree category tree |
| Sub-resources (variants) | /api/products/{id}/variants | InvenTree BOM substitutes |
| Paginated list response | `{ count, results }` | InvenTree + Django REST Framework pattern |
| Query filters on list | `?category=&status=&search=&limit=&offset=` | InvenTree parts list filters |

## License

MIT.
