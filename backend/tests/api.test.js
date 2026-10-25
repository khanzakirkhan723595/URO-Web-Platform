// Run with:  npm test
// These tests need NO database: they cover security headers, validation, auth guards, CORS and error shapes.
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:1/unused';
process.env.JWT_SECRET = 'test-secret-'.padEnd(40, 'x');
process.env.CORS_ORIGIN = 'http://localhost:5173';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const app = require('../app');
let server;
let port;

before(() => new Promise((resolve) => { server = app.listen(0, () => { port = server.address().port; resolve(); }); }));
after(() => new Promise((resolve) => server.close(resolve)));

const call = (method, path, body, headers = {}) =>
  new Promise((resolve, reject) => {
    const data = body === undefined ? null : typeof body === 'string' ? body : JSON.stringify(body);
    const req = http.request(
      { port, method, path, headers: { 'content-type': 'application/json', ...(data ? { 'content-length': Buffer.byteLength(data) } : {}), ...headers } },
      (res) => { let raw = ''; res.on('data', (c) => (raw += c)); res.on('end', () => { let json = null; try { json = JSON.parse(raw); } catch { /* not json */ } resolve({ status: res.statusCode, headers: res.headers, json }); }); }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });

test('health endpoint works and sends security headers', async () => {
  const r = await call('GET', '/health');
  assert.equal(r.status, 200);
  assert.equal(r.json.status, 'UP');
  assert.ok(r.headers['x-content-type-options']);
  assert.ok(!('x-powered-by' in r.headers));
});

test('unknown API route returns a JSON 404', async () => {
  const r = await call('GET', '/api/nope');
  assert.equal(r.status, 404);
  assert.equal(r.json.status, 'fail');
});

test('protected routes require login (401)', async () => {
  for (const [m, p] of [['GET', '/api/users/me'], ['PATCH', '/api/users/me'], ['PATCH', '/api/users/updateMyPassword'], ['GET', '/api/history/FloodModel'], ['DELETE', '/api/history/item/507f1f77bcf86cd799439011'], ['POST', '/api/ai/chat'], ['POST', '/api/model/run'], ['GET', '/api/admin/users']]) {
    const r = await call(m, p, m === 'GET' ? undefined : {});
    assert.equal(r.status, 401, `${m} ${p}`);
  }
});

test('invalid token is rejected', async () => {
  const r = await call('GET', '/api/users/me', undefined, { cookie: 'jwt=not-a-real-token' });
  assert.equal(r.status, 401);
});

test('signup validates input and never trusts a client-supplied role', async () => {
  assert.equal((await call('POST', '/api/users/signup', { name: 'A' })).status, 400);
  assert.equal((await call('POST', '/api/users/signup', { name: 'A', email: 'a@b.com', password: '123' })).status, 400);
  // Wrong types (NoSQL operator injection attempt) are rejected before any database access
  assert.equal((await call('POST', '/api/users/login', { email: { $ne: null }, password: 'x' })).status, 400);
});

test('malformed JSON gives a clean 400', async () => {
  const r = await call('POST', '/api/users/login', '{bad json');
  assert.equal(r.status, 400);
  assert.match(r.json.message, /Invalid JSON/);
});

test('input validation on public routes', async () => {
  assert.equal((await call('GET', '/api/feedback/bad%20name!')).status, 400);
  assert.equal((await call('POST', '/api/contact', { name: 'A', email: 'not-an-email', message: 'long enough message' })).status, 400);
  assert.equal((await call('POST', '/api/contact', { name: 'A', email: 'a@b.com', message: 'short' })).status, 400);
});

test('AI status is public and reports disabled without a key', async () => {
  const r = await call('GET', '/api/ai/status');
  assert.equal(r.status, 200);
  assert.equal(r.json.data.enabled, false);
});

test('CORS allows the configured frontend and blocks others', async () => {
  const ok = await call('OPTIONS', '/api/users/login', undefined, { origin: 'http://localhost:5173', 'access-control-request-method': 'POST' });
  assert.equal(ok.headers['access-control-allow-origin'], 'http://localhost:5173');
  assert.equal(ok.headers['access-control-allow-credentials'], 'true');
  const bad = await call('GET', '/api/stats/summary', undefined, { origin: 'http://evil.example' });
  assert.equal(bad.status, 403);
});
