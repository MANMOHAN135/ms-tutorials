import crypto from 'crypto';
import { query } from '../config/database.js';
import { generateRefreshToken, hashRefreshToken } from './tokenService.js';

/**
 * Creates and persists a new refresh token for a user.
 * Persists ONLY the SHA-256 cryptographic hash to the database.
 * Returns the raw token to be delivered via an HttpOnly cookie.
 *
 * @param {string} userId - The internal user ID.
 * @param {string} [ipAddress] - Client IP address.
 * @param {string} [deviceFingerprint] - User-Agent / client identifier.
 * @param {Function} [customQuery] - Optional query function for testing.
 * @returns {Promise<{ rawToken: string, expiresAt: Date }>}
 */
export async function createAndSaveRefreshToken(userId, ipAddress = null, deviceFingerprint = null, customQuery = query) {
  const { rawToken, tokenHash, expiresAt } = generateRefreshToken();
  const tokenId = crypto.randomUUID();

  const sql = `
    INSERT INTO refresh_tokens (
      id,
      user_id,
      token_hash,
      device_fingerprint,
      ip_address,
      expires_at,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;

  await customQuery(sql, [
    tokenId,
    userId,
    tokenHash,
    deviceFingerprint ? String(deviceFingerprint).substring(0, 255) : null,
    ipAddress ? String(ipAddress).substring(0, 45) : null,
    expiresAt,
  ]);

  return { rawToken, expiresAt };
}

/**
 * Validates a raw refresh token by hashing it and checking expiration, revocation, and user status.
 *
 * @param {string} rawToken - The incoming raw refresh token.
 * @param {Function} [customQuery] - Optional query function for testing.
 * @returns {Promise<{ valid: boolean, reason?: string, user?: Object, tokenRecord?: Object }>}
 */
export async function validateRefreshToken(rawToken, customQuery = query) {
  if (!rawToken || typeof rawToken !== 'string') {
    return { valid: false, reason: 'Refresh token must be a non-empty string.' };
  }

  const tokenHash = hashRefreshToken(rawToken);

  const sql = `
    SELECT
      rt.id AS token_id,
      rt.user_id,
      rt.token_hash,
      rt.expires_at,
      rt.revoked_at,
      u.id AS u_id,
      u.identifier AS u_identifier,
      u.email AS u_email,
      u.role AS u_role,
      u.full_name AS u_full_name,
      u.status AS u_status
    FROM refresh_tokens rt
    INNER JOIN users u ON rt.user_id = u.id
    WHERE rt.token_hash = ?
    LIMIT 1
  `;

  const rows = await customQuery(sql, [tokenHash]);
  if (!rows || rows.length === 0) {
    return { valid: false, reason: 'Token not found or unrecognized.' };
  }

  const record = rows[0];

  // 1. Check revocation
  if (record.revoked_at) {
    return { valid: false, reason: 'Token has been revoked.' };
  }

  // 2. Check expiration
  const expiryTime = new Date(record.expires_at).getTime();
  if (expiryTime <= Date.now()) {
    return { valid: false, reason: 'Token has expired.' };
  }

  // 3. Check user active status
  if (record.u_status !== 'active') {
    return { valid: false, reason: 'Associated user account is not active.' };
  }

  return {
    valid: true,
    user: {
      id: record.u_id,
      identifier: record.u_identifier,
      email: record.u_email,
      role: record.u_role,
      full_name: record.u_full_name,
      status: record.u_status,
    },
    tokenRecord: {
      id: record.token_id,
      userId: record.user_id,
      expiresAt: record.expires_at,
    },
  };
}

/**
 * Revokes a single refresh token by recording the revocation timestamp.
 *
 * @param {string} rawToken - The raw refresh token to revoke.
 * @param {Function} [customQuery] - Optional query function for testing.
 * @returns {Promise<boolean>} True if found and revoked, false otherwise.
 */
export async function revokeRefreshToken(rawToken, customQuery = query) {
  if (!rawToken || typeof rawToken !== 'string') return false;
  const tokenHash = hashRefreshToken(rawToken);

  const sql = `
    UPDATE refresh_tokens
    SET revoked_at = CURRENT_TIMESTAMP
    WHERE token_hash = ? AND revoked_at IS NULL
  `;

  const result = await customQuery(sql, [tokenHash]);
  return Boolean(result && (result.affectedRows > 0 || result.changedRows > 0));
}

/**
 * Revokes all active refresh tokens belonging to a specified user (used for global session termination).
 *
 * @param {string} userId - The user ID.
 * @param {Function} [customQuery] - Optional query function for testing.
 * @returns {Promise<number>} Number of tokens revoked.
 */
export async function revokeAllTokensForUser(userId, customQuery = query) {
  if (!userId) return 0;

  const sql = `
    UPDATE refresh_tokens
    SET revoked_at = CURRENT_TIMESTAMP
    WHERE user_id = ? AND revoked_at IS NULL
  `;

  const result = await customQuery(sql, [userId]);
  return result?.affectedRows || 0;
}

export default {
  createAndSaveRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
  revokeAllTokensForUser,
};
