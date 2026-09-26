import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../server/server.js';
import { closePool } from '../server/config/database.js';

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    // Start on ephemeral port 0
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await closePool();
});

test('--- Phase 5.2: Auth Route Integration Suite ---', async (t) => {
  await t.test('GET /api/health returns operational status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.service, 'MS Tutorials Backend API');
    assert.ok(data.database);
    assert.equal(typeof data.database.connected, 'boolean');
  });

  await t.test('POST /api/auth/login rejects malformed request (missing role)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'AS26090', password: 'password123' }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.error, /role is required/i);
  });

  await t.test('POST /api/auth/login rejects invalid role', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'superhacker', identifier: 'AS26090', password: 'password123' }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.error, /role is required/i);
  });

  await t.test('POST /api/auth/login rejects empty password', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'student', identifier: 'AS26090', password: '' }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.error, /password is required/i);
  });

  await t.test('POST /api/auth/refresh rejects request without refresh token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.match(data.error, /refresh token is required/i);
  });

  await t.test('POST /api/auth/logout succeeds and responds with success message', async () => {
    const res = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.match(data.message, /logged out successfully/i);
  });
});
