import { query } from '../config/database.js';
import { config } from '../config/environment.js';

/**
 * Normalizes identifier input (trims whitespace and handles case sensitivity for emails).
 */
export function normalizeIdentifier(identifier) {
  if (!identifier || typeof identifier !== 'string') return '';
  const trimmed = identifier.trim();
  // If it's an email format, lowercase it
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }
  // If it's a student ID (e.g. AS26090), uppercase it
  return trimmed.toUpperCase();
}

/**
 * Retrieves a user record by identifier and role for authentication.
 * Fetches only the required authentication and lockout fields.
 *
 * @param {string} rawIdentifier - Student ID (AS26090) or registered email.
 * @param {string} role - 'student' | 'parent' | 'teacher' | 'admin'.
 * @param {Function} [customQuery] - Optional query function for testing without live DB.
 * @returns {Promise<Object|null>} The user authentication record or null if not found.
 */
export async function findUserForAuth(rawIdentifier, role, customQuery = query) {
  if (!rawIdentifier || !role) return null;
  const identifier = normalizeIdentifier(rawIdentifier);

  const sql = `
    SELECT
      id,
      identifier,
      email,
      password_hash,
      role,
      full_name,
      status,
      failed_login_attempts,
      locked_until,
      last_login_at
    FROM users
    WHERE (identifier = ? OR (email IS NOT NULL AND email = ?))
      AND role = ?
    LIMIT 1
  `;

  const rows = await customQuery(sql, [identifier, identifier, role]);
  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0];
}

/**
 * Checks whether an account is currently locked due to exceeded failed login attempts.
 *
 * @param {Object} user - The user record with locked_until field.
 * @returns {boolean} True if currently locked, false otherwise.
 */
export function isAccountLocked(user) {
  if (!user || !user.locked_until) return false;
  const lockTime = new Date(user.locked_until).getTime();
  const now = Date.now();
  return lockTime > now;
}

/**
 * Increments failed login attempts and applies a temporary account lock if the threshold is reached.
 *
 * @param {string} userId - The user ID.
 * @param {number} currentAttempts - Current failed_login_attempts counter.
 * @param {Function} [customQuery] - Optional query function for testing.
 * @returns {Promise<{ isNowLocked: boolean, lockedUntil: Date|null }>}
 */
export async function recordFailedLogin(userId, currentAttempts = 0, customQuery = query) {
  const newAttempts = currentAttempts + 1;
  const threshold = config.auth.maxFailedLoginAttempts;
  let lockedUntil = null;
  let isNowLocked = false;

  if (newAttempts >= threshold) {
    isNowLocked = true;
    lockedUntil = new Date(Date.now() + config.auth.lockoutDurationMinutes * 60 * 1000);
  }

  const sql = `
    UPDATE users
    SET
      failed_login_attempts = ?,
      locked_until = ?
    WHERE id = ?
  `;

  await customQuery(sql, [newAttempts, lockedUntil, userId]);

  return { isNowLocked, lockedUntil };
}

/**
 * Resets failed login counters and updates last_login_at upon successful authentication.
 *
 * @param {string} userId - The user ID.
 * @param {Function} [customQuery] - Optional query function for testing.
 */
export async function recordSuccessfulLogin(userId, customQuery = query) {
  const sql = `
    UPDATE users
    SET
      failed_login_attempts = 0,
      locked_until = NULL,
      last_login_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  await customQuery(sql, [userId]);
}

/**
 * Strips all sensitive authentication fields before returning a user object to clients.
 *
 * @param {Object} user - Raw database user object.
 * @returns {Object} Safe public user profile.
 */
export function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    role: user.role,
    identifier: user.identifier,
    name: user.full_name,
    email: user.email || undefined,
  };
}

export default {
  normalizeIdentifier,
  findUserForAuth,
  isAccountLocked,
  recordFailedLogin,
  recordSuccessfulLogin,
  sanitizeUser,
};
