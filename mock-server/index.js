// Minimal REST mock — Products + Categories + Variants.
// Inspired by InvenTree Parts + Petstore patterns.
// In-memory store, no persistence. ~80 lines.

const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── In-memory store ──────────────────────────────────────────────
let nextId = 100;
const categories = [
  { id: 1, name: 'Electronics', parent: null },
  { id: 2, name: 'Sensors', parent: 1 },
];
const products = [
  { id: 1, name: 'Temperature Sensor', sku: 'TS-001', category: 2, status: 'active', price: 12.5 },
  { id: 2, name: 'Humidity Sensor', sku: 'HS-001', category: 2, status: 'active', price: 8.0 },
  { id: 3, name: 'Discontinued Board', sku: 'DB-001', category: 1, status: 'inactive', price: 0 },
];
const variants = [];

// ── Products CRUD ────────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  let list = [...products];
  if (req.query.category) list = list.filter(p => p.category == req.query.category);
  if (req.query.status) list = list.filter(p => p.status === req.query.status);
  if (req.query.search) list = list.filter(p => p.name.toLowerCase().includes(req.query.search.toLowerCase()));
  const limit = parseInt(req.query.limit) || list.length;
  const offset = parseInt(req.query.offset) || 0;
  res.json({ count: list.length, results: list.slice(offset, offset + limit) });
});

app.post('/api/products', (req, res) => {
  const { name, sku, category, status, price } = req.body;
  if (!name) return res.status(400).json({ name: ['This field is required.'] });
  const product = { id: ++nextId, name, sku: sku || `SKU-${nextId}`, category: category || null, status: status || 'active', price: price || 0 };
  products.push(product);
  res.status(201).json(product);
});

app.get('/api/products/:id', (req, res) => {
  const p = products.find(x => x.id == req.params.id);
  if (!p) return res.status(404).json({ detail: 'Not found.' });
  res.json(p);
});

app.patch('/api/products/:id', (req, res) => {
  const p = products.find(x => x.id == req.params.id);
  if (!p) return res.status(404).json({ detail: 'Not found.' });
  Object.assign(p, req.body);
  res.json(p);
});

app.delete('/api/products/:id', (req, res) => {
  const idx = products.findIndex(x => x.id == req.params.id);
  if (idx < 0) return res.status(404).json({ detail: 'Not found.' });
  if (products[idx].status === 'active') return res.status(400).json({ detail: 'Deactivate before deleting.' });
  products.splice(idx, 1);
  res.status(204).send();
});

// ── Variants (sub-resource of products) ──────────────────────────
app.get('/api/products/:id/variants', (req, res) => {
  const list = variants.filter(v => v.product == req.params.id);
  res.json(list);
});

app.post('/api/products/:id/variants', (req, res) => {
  const p = products.find(x => x.id == req.params.id);
  if (!p) return res.status(404).json({ detail: 'Not found.' });
  const v = { id: ++nextId, product: parseInt(req.params.id), name: req.body.name || `Variant-${nextId}`, sku: req.body.sku || `V-${nextId}` };
  variants.push(v);
  res.status(201).json(v);
});

// ── Categories CRUD ──────────────────────────────────────────────
app.get('/api/categories', (_req, res) => res.json(categories));
app.post('/api/categories', (req, res) => {
  if (!req.body.name) return res.status(400).json({ name: ['This field is required.'] });
  const c = { id: ++nextId, name: req.body.name, parent: req.body.parent || null };
  categories.push(c);
  res.status(201).json(c);
});
app.get('/api/categories/:id', (req, res) => {
  const c = categories.find(x => x.id == req.params.id);
  if (!c) return res.status(404).json({ detail: 'Not found.' });
  res.json(c);
});
app.delete('/api/categories/:id', (req, res) => {
  const idx = categories.findIndex(x => x.id == req.params.id);
  if (idx < 0) return res.status(404).json({ detail: 'Not found.' });
  categories.splice(idx, 1);
  res.status(204).send();
});

// ── OpenAPI spec endpoint ────────────────────────────────────────
app.get('/api/schema', (_req, res) => res.json(require('./openapi.json')));

// ── Reset (re-seed in-memory store for test isolation) ───────────
app.post('/api/reset', (_req, res) => {
  products.length = 0;
  products.push(
    { id: 1, name: 'Temperature Sensor', sku: 'TS-001', category: 2, status: 'active', price: 12.5 },
    { id: 2, name: 'Humidity Sensor', sku: 'HS-001', category: 2, status: 'active', price: 8.0 },
    { id: 3, name: 'Discontinued Board', sku: 'DB-001', category: 1, status: 'inactive', price: 0 },
  );
  categories.length = 0;
  categories.push(
    { id: 1, name: 'Electronics', parent: null },
    { id: 2, name: 'Sensors', parent: 1 },
  );
  variants.length = 0;
  nextId = 100;
  res.json({ status: 'reset' });
});

// ── Health ───────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', version: '1.0.0' }));

const PORT = process.env.PORT || 3456;
app.listen(PORT, () => console.log(`[mock] listening on http://localhost:${PORT}`));
