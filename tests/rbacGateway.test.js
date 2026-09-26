import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import http from 'http';
import app from '../server/server.js';
import { config } from '../server/config/environment.js';
import { generateAccessToken } from '../server/services/tokenService.js';
import { requireAuth } from '../server/middleware/authMiddleware.js';
import { requireRole } from '../server/middleware/roleMiddleware.js';
import {
  requireSelf,
  requireStudentSelf,
  requireParentOfStudent,
  requireTeacherAssignment,
} from '../server/middleware/ownershipMiddleware.js';
import { closePool } from '../server/config/database.js';

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
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

// Helper for mocking Express res object
function createMockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

test('--- Phase 5.3: Authentication + RBAC Gateway Test Suite ---', async (t) => {

  // =========================================================================
  // 1 to 5: Authentication Middleware (requireAuth)
  // =========================================================================
  await t.test('1. Missing token -> 401 Unauthorized', async () => {
    const req = { headers: {} };
    const res = createMockRes();
    let nextCalled = false;

    requireAuth(req, res, () => { nextCalled = true; });

    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
    assert.match(res.body.error, /access token is required/i);
  });

  await t.test('2. Invalid token (bad signature or malformed) -> 401 Unauthorized', async () => {
    const badToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature';
    const req = { headers: { authorization: `Bearer ${badToken}` } };
    const res = createMockRes();
    let nextCalled = false;

    requireAuth(req, res, () => { nextCalled = true; });

    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
    assert.match(res.body.error, /invalid or expired access token/i);
  });

  await t.test('3. Expired token -> 401 Unauthorized', async () => {
    const expiredToken = jwt.sign(
      { sub: 'usr_test_01', role: 'student', type: 'access' },
      config.auth.jwtSecret,
      { expiresIn: '-1s' }
    );
    const req = { headers: { authorization: `Bearer ${expiredToken}` } };
    const res = createMockRes();
    let nextCalled = false;

    requireAuth(req, res, () => { nextCalled = true; });

    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
    assert.match(res.body.error, /invalid or expired access token/i);
  });

  await t.test('4. Wrong token type (refresh token passed as access token) -> 401 Unauthorized', async () => {
    const refreshTokenAsJwt = jwt.sign(
      { sub: 'usr_test_02', role: 'student', type: 'refresh' },
      config.auth.jwtSecret,
      { expiresIn: '15m' }
    );
    const req = { headers: { authorization: `Bearer ${refreshTokenAsJwt}` } };
    const res = createMockRes();
    let nextCalled = false;

    requireAuth(req, res, () => { nextCalled = true; });

    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
    assert.match(res.body.error, /invalid token type/i);
  });

  await t.test('5. Valid token -> request.user populated and next() called', async () => {
    const userPayload = {
      id: 'usr_student_01',
      role: 'student',
      identifier: 'AS26090',
      full_name: 'Rahul Sharma',
    };
    const validToken = generateAccessToken(userPayload);
    const req = { headers: { authorization: `Bearer ${validToken}` } };
    const res = createMockRes();
    let nextCalled = false;

    requireAuth(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, true);
    assert.ok(req.user);
    assert.equal(req.user.id, 'usr_student_01');
    assert.equal(req.user.role, 'student');
    assert.equal(req.user.identifier, 'AS26090');
    assert.equal(req.user.name, 'Rahul Sharma');
    assert.equal(req.user.password_hash, undefined, 'Must not contain sensitive fields');
  });

  // =========================================================================
  // 6 to 10: Role Authorization (requireRole)
  // =========================================================================
  await t.test('6. Student accessing student route -> allowed', async () => {
    const req = { user: { id: 'u1', role: 'student' } };
    const res = createMockRes();
    let nextCalled = false;

    requireRole('student')(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, true);
    assert.equal(res.statusCode, null);
  });

  await t.test('7. Student accessing admin route -> 403 Forbidden', async () => {
    const req = { user: { id: 'u1', role: 'student' } };
    const res = createMockRes();
    let nextCalled = false;

    requireRole('admin')(req, res, () => { nextCalled = true; });

    assert.equal(res.statusCode, 403);
    assert.equal(nextCalled, false);
    assert.match(res.body.error, /insufficient role permissions/i);
  });

  await t.test('8. Parent accessing parent route -> allowed', async () => {
    const req = { user: { id: 'p1', role: 'parent' } };
    const res = createMockRes();
    let nextCalled = false;

    requireRole('parent')(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, true);
  });

  await t.test('9. Teacher accessing teacher route -> allowed', async () => {
    const req = { user: { id: 't1', role: 'teacher' } };
    const res = createMockRes();
    let nextCalled = false;

    requireRole('teacher')(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, true);
  });

  await t.test('10. Admin accessing admin route -> allowed', async () => {
    const req = { user: { id: 'a1', role: 'admin' } };
    const res = createMockRes();
    let nextCalled = false;

    requireRole('admin')(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, true);
  });

  // =========================================================================
  // 11 & 12: Ownership Authorization (Student Self Access)
  // =========================================================================
  await t.test('11. Student accessing own resource -> allowed', async () => {
    const mockQuery = async (sql, params) => {
      // Return 1 if user_id matches and target student matches
      if (params[0] === 'usr_student_01' && params[1] === 'AS26090') {
        return [{ ok: 1 }];
      }
      return [];
    };

    const req = {
      user: { id: 'usr_student_01', role: 'student' },
      params: { studentId: 'AS26090' },
    };
    const res = createMockRes();
    let nextCalled = false;

    await requireStudentSelf('studentId', mockQuery)(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, true);
  });

  await t.test('12. Student accessing another student\'s resource -> 403 Forbidden', async () => {
    const mockQuery = async () => []; // No record matching Student B under Student A's account

    const req = {
      user: { id: 'usr_student_01', role: 'student' },
      params: { studentId: 'AS26099' },
    };
    const res = createMockRes();
    let nextCalled = false;

    await requireStudentSelf('studentId', mockQuery)(req, res, () => { nextCalled = true; });

    assert.equal(res.statusCode, 403);
    assert.equal(nextCalled, false);
    assert.match(res.body.error, /only access your own student records/i);
  });

  // =========================================================================
  // 13 to 15: Parent-Child Relationship Authorization
  // =========================================================================
  await t.test('13. Parent accessing linked child -> allowed', async () => {
    const mockQuery = async (sql, params) => {
      if (params[0] === 'usr_parent_01' && params[1] === 'AS26090') {
        return [{ ok: 1 }];
      }
      return [];
    };

    const req = {
      user: { id: 'usr_parent_01', role: 'parent' },
      params: { studentId: 'AS26090' },
    };
    const res = createMockRes();
    let nextCalled = false;

    await requireParentOfStudent('studentId', mockQuery)(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, true);
  });

  await t.test('14. Parent accessing unlinked child -> 403 Forbidden', async () => {
    const mockQuery = async () => []; // Child 3 not linked to Parent 1

    const req = {
      user: { id: 'usr_parent_01', role: 'parent' },
      params: { studentId: 'AS26999' },
    };
    const res = createMockRes();
    let nextCalled = false;

    await requireParentOfStudent('studentId', mockQuery)(req, res, () => { nextCalled = true; });

    assert.equal(res.statusCode, 403);
    assert.equal(nextCalled, false);
    assert.match(res.body.error, /not authorized to access records for this student/i);
  });

  await t.test('15. Parent with multiple children can access each linked child', async () => {
    // Parent A has two children: AS26090 and AS26145
    const mockQuery = async (sql, params) => {
      const parentId = params[0];
      const targetChild = params[1];
      if (parentId === 'usr_parent_multi' && (targetChild === 'AS26090' || targetChild === 'AS26145')) {
        return [{ ok: 1 }];
      }
      return [];
    };

    // Child 1 access check
    const reqChild1 = {
      user: { id: 'usr_parent_multi', role: 'parent' },
      params: { studentId: 'AS26090' },
    };
    const resChild1 = createMockRes();
    let nextChild1 = false;
    await requireParentOfStudent('studentId', mockQuery)(reqChild1, resChild1, () => { nextChild1 = true; });
    assert.equal(nextChild1, true);

    // Child 2 access check
    const reqChild2 = {
      user: { id: 'usr_parent_multi', role: 'parent' },
      params: { studentId: 'AS26145' },
    };
    const resChild2 = createMockRes();
    let nextChild2 = false;
    await requireParentOfStudent('studentId', mockQuery)(reqChild2, resChild2, () => { nextChild2 = true; });
    assert.equal(nextChild2, true);

    // Unlinked child check
    const reqChild3 = {
      user: { id: 'usr_parent_multi', role: 'parent' },
      params: { studentId: 'AS26999' },
    };
    const resChild3 = createMockRes();
    let nextChild3 = false;
    await requireParentOfStudent('studentId', mockQuery)(reqChild3, resChild3, () => { nextChild3 = true; });
    assert.equal(resChild3.statusCode, 403);
    assert.equal(nextChild3, false);
  });

  // =========================================================================
  // 16 & 17: GET /api/auth/me Endpoint
  // =========================================================================
  await t.test('16. /api/auth/me with valid token -> returns safe identity', async () => {
    const user = {
      id: 'usr_auth_me_test',
      role: 'student',
      identifier: 'AS26090',
      full_name: 'Aditi Rao',
    };
    const token = generateAccessToken(user);

    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.user);
    assert.equal(data.user.id, 'usr_auth_me_test');
    assert.equal(data.user.role, 'student');
    assert.equal(data.user.identifier, 'AS26090');
    assert.equal(data.user.name, 'Aditi Rao');
    assert.equal(data.user.password_hash, undefined);
  });

  await t.test('17. /api/auth/me without token -> 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.match(data.error, /access token is required/i);
  });
});
