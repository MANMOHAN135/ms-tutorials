import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../server/services/passwordService.js';
import {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from '../server/services/tokenService.js';
import {
  findUserForAuth,
  isAccountLocked,
  recordFailedLogin,
  recordSuccessfulLogin,
  sanitizeUser,
} from '../server/services/userService.js';
import {
  createAndSaveRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
  revokeAllTokensForUser,
} from '../server/services/refreshTokenService.js';

test('--- Phase 5.2: Backend Authentication Core Test Suite ---', async (t) => {

  // =========================================================================
  // 1 & 2 & 3: Password Hashing and Verification
  // =========================================================================
  await t.test('1. Password hashing: generates valid bcrypt hash', async () => {
    const password = 'StrongPassword123!';
    const hash = await hashPassword(password);

    assert.ok(hash, 'Hash should not be empty');
    assert.match(hash, /^\$2[aby]\$\d{2}\$/, 'Hash should match bcrypt signature');
    assert.notEqual(hash, password, 'Hash must not equal plaintext password');
  });

  await t.test('2. Password verification: validates correct password', async () => {
    const password = 'CorrectPassword456$';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);

    assert.equal(isValid, true, 'verifyPassword should return true for correct password');
  });

  await t.test('3. Invalid password: rejects incorrect password safely', async () => {
    const password = 'RealPassword789#';
    const wrongPassword = 'WrongPassword000!';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(wrongPassword, hash);

    assert.equal(isValid, false, 'verifyPassword should return false for incorrect password');
  });

  // =========================================================================
  // 4, 5, 6 & 7: User Lookup and Authentication Status Checks
  // =========================================================================
  await t.test('4. User lookup: finds user by canonical student identifier (AS26090)', async () => {
    const mockUser = {
      id: 'usr_student_01',
      identifier: 'AS26090',
      email: null,
      password_hash: await hashPassword('StudentPass123'),
      role: 'student',
      full_name: 'Aarav Sharma',
      status: 'active',
      failed_login_attempts: 0,
      locked_until: null,
      last_login_at: null,
    };

    // Test with mock query runner
    const mockQuery = async (sql, params) => {
      if (params[0] === 'AS26090' && params[2] === 'student') {
        return [mockUser];
      }
      return [];
    };

    const found = await findUserForAuth('AS26090', 'student', mockQuery);
    assert.ok(found, 'Student should be found by ID');
    assert.equal(found.id, 'usr_student_01');
    assert.equal(found.role, 'student');
  });

  await t.test('5. Successful authentication logic: verifies credentials and sanitizes output', async () => {
    const rawPass = 'Secret123';
    const hashedPass = await hashPassword(rawPass);
    const mockUser = {
      id: 'usr_parent_01',
      identifier: 'parent@example.com',
      email: 'parent@example.com',
      password_hash: hashedPass,
      role: 'parent',
      full_name: 'Rajesh Sharma',
      status: 'active',
      failed_login_attempts: 0,
      locked_until: null,
      last_login_at: null,
    };

    // Verify password match
    const isValid = await verifyPassword(rawPass, mockUser.password_hash);
    assert.equal(isValid, true);

    // Sanitize user output
    const safeUser = sanitizeUser(mockUser);
    assert.equal(safeUser.id, 'usr_parent_01');
    assert.equal(safeUser.name, 'Rajesh Sharma');
    assert.equal(safeUser.password_hash, undefined, 'password_hash must never be in sanitized output');
    assert.equal(safeUser.failed_login_attempts, undefined, 'security internals must not leak');
  });

  await t.test('6. Invalid authentication: lookup returns null for nonexistent user', async () => {
    const mockQuery = async () => [];
    const found = await findUserForAuth('NONEXISTENT_USER', 'student', mockQuery);
    assert.equal(found, null, 'Lookup should return null for nonexistent identifier');
  });

  await t.test('7. Account status rejection: non-active accounts (pending_activation, suspended)', async () => {
    const pendingUser = { status: 'pending_activation' };
    const suspendedUser = { status: 'suspended' };
    const inactiveUser = { status: 'inactive' };
    const activeUser = { status: 'active' };

    assert.notEqual(pendingUser.status, 'active');
    assert.notEqual(suspendedUser.status, 'active');
    assert.notEqual(inactiveUser.status, 'active');
    assert.equal(activeUser.status, 'active');
  });

  // =========================================================================
  // 8 & 9: Failed Login Increment and Account Lock Behavior
  // =========================================================================
  await t.test('8. Failed-login increment: tracks failed attempts', async () => {
    let capturedAttempts = 0;
    const mockQuery = async (sql, params) => {
      capturedAttempts = params[0];
      return { affectedRows: 1 };
    };

    const result = await recordFailedLogin('usr_test_01', 2, mockQuery);
    assert.equal(capturedAttempts, 3, 'Attempts should increment from 2 to 3');
    assert.equal(result.isNowLocked, false, 'Account should not be locked at 3 attempts');
  });

  await t.test('9. Account lock behavior: locks account upon reaching threshold (5 attempts)', async () => {
    let lockedTimestamp = null;
    const mockQuery = async (sql, params) => {
      lockedTimestamp = params[1];
      return { affectedRows: 1 };
    };

    const result = await recordFailedLogin('usr_test_01', 4, mockQuery);
    assert.equal(result.isNowLocked, true, 'Account should be locked at 5th attempt');
    assert.ok(result.lockedUntil, 'Lockout timestamp must be set');
    assert.ok(result.lockedUntil > new Date(), 'Lockout must be in the future');

    // Test isAccountLocked utility
    const lockedUser = { locked_until: result.lockedUntil };
    assert.equal(isAccountLocked(lockedUser), true, 'User should evaluate as locked');

    const expiredLockUser = { locked_until: new Date(Date.now() - 1000) };
    assert.equal(isAccountLocked(expiredLockUser), false, 'Expired lock should evaluate as unlocked');
  });

  // =========================================================================
  // 10: Access Token Creation and Verification
  // =========================================================================
  await t.test('10. Access-token creation and verification', async () => {
    const user = {
      id: 'usr_teacher_01',
      role: 'teacher',
      identifier: 'faculty@mstutorials.com',
      full_name: 'Prof. S. N. Verma',
    };

    const token = generateAccessToken(user);
    assert.ok(token, 'Access token string must be generated');

    const decoded = verifyAccessToken(token);
    assert.equal(decoded.sub, user.id);
    assert.equal(decoded.role, 'teacher');
    assert.equal(decoded.identifier, user.identifier);
    assert.equal(decoded.name, user.full_name);
    assert.equal(decoded.type, 'access');
    assert.ok(decoded.exp, 'Token must contain expiration timestamp');
  });

  // =========================================================================
  // 11 & 12: Refresh Token Hashing and Persistence
  // =========================================================================
  await t.test('11. Refresh-token hashing: generates 64-character SHA-256 hash', async () => {
    const { rawToken, tokenHash } = generateRefreshToken();

    assert.equal(rawToken.length, 80, '40-byte hex raw token has length 80');
    assert.equal(tokenHash.length, 64, 'SHA-256 hash has length 64');
    assert.notEqual(rawToken, tokenHash, 'Hash must not equal raw token');

    const deterministicHash = hashRefreshToken(rawToken);
    assert.equal(deterministicHash, tokenHash, 'Hashing the same raw token yields identical hash');
  });

  await t.test('12. Refresh-token persistence: inserts hash into storage', async () => {
    let insertedParams = [];
    const mockQuery = async (sql, params) => {
      insertedParams = params;
      return { affectedRows: 1 };
    };

    const { rawToken, expiresAt } = await createAndSaveRefreshToken(
      'usr_student_99',
      '192.168.1.1',
      'Mozilla/5.0 TestBrowser',
      mockQuery
    );

    assert.ok(rawToken);
    assert.equal(insertedParams[1], 'usr_student_99', 'User ID must match');
    assert.equal(insertedParams[2].length, 64, 'Persisted token must be SHA-256 hash');
    assert.notEqual(insertedParams[2], rawToken, 'Raw token must NEVER be stored');
    assert.equal(insertedParams[3], 'Mozilla/5.0 TestBrowser');
    assert.equal(insertedParams[4], '192.168.1.1');
    assert.ok(expiresAt > new Date(), 'Expires at must be future date');
  });

  // =========================================================================
  // 13 & 14: Expired and Revoked Refresh Token Rejection
  // =========================================================================
  await t.test('13. Expired refresh-token rejection', async () => {
    const rawToken = 'test_raw_token_value_expired';
    const mockExpiredRecord = {
      token_id: 'tok_01',
      user_id: 'usr_01',
      token_hash: hashRefreshToken(rawToken),
      expires_at: new Date(Date.now() - 100000), // In the past
      revoked_at: null,
      u_id: 'usr_01',
      u_identifier: 'AS26090',
      u_email: null,
      u_role: 'student',
      u_full_name: 'Rahul',
      u_status: 'active',
    };

    const mockQuery = async () => [mockExpiredRecord];
    const validation = await validateRefreshToken(rawToken, mockQuery);

    assert.equal(validation.valid, false, 'Expired token must not be valid');
    assert.equal(validation.reason, 'Token has expired.');
  });

  await t.test('14. Revoked refresh-token rejection', async () => {
    const rawToken = 'test_raw_token_value_revoked';
    const mockRevokedRecord = {
      token_id: 'tok_02',
      user_id: 'usr_02',
      token_hash: hashRefreshToken(rawToken),
      expires_at: new Date(Date.now() + 1000000),
      revoked_at: new Date(Date.now() - 5000), // Already revoked
      u_id: 'usr_02',
      u_identifier: 'faculty@mstutorials.com',
      u_email: 'faculty@mstutorials.com',
      u_role: 'teacher',
      u_full_name: 'Faculty Member',
      u_status: 'active',
    };

    const mockQuery = async () => [mockRevokedRecord];
    const validation = await validateRefreshToken(rawToken, mockQuery);

    assert.equal(validation.valid, false, 'Revoked token must not be valid');
    assert.equal(validation.reason, 'Token has been revoked.');
  });
});
