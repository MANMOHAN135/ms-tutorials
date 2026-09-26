import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/environment.js';

/**
 * Generates a short-lived access JWT containing minimal authorization claims.
 * Does not expose passwords, hashes, or sensitive profile details.
 *
 * @param {Object} user - User record { id, role, identifier, full_name }
 * @returns {string} Signed JWT access token
 */
export function generateAccessToken(user) {
  if (!user || !user.id || !user.role) {
    throw new Error('User identity and role are required to issue an access token.');
  }

  const payload = {
    sub: user.id,
    role: user.role,
    identifier: user.identifier,
    name: user.full_name,
    type: 'access',
  };

  return jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtAccessExpiresIn,
  });
}

/**
 * Verifies and decodes an access JWT.
 *
 * @param {string} token - The raw JWT access token.
 * @returns {Object} Decoded payload if valid.
 */
export function verifyAccessToken(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Access token must be a non-empty string.');
  }
  return jwt.verify(token, config.auth.jwtSecret);
}

/**
 * Generates a cryptographically secure random refresh token and its SHA-256 hash.
 * Only the SHA-256 hash is persisted to MySQL; the raw token is returned to be set in an HttpOnly cookie.
 *
 * @returns {{ rawToken: string, tokenHash: string, expiresAt: Date }}
 */
export function generateRefreshToken() {
  const rawToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = hashRefreshToken(rawToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.auth.refreshTokenExpiresInDays);

  return {
    rawToken,
    tokenHash,
    expiresAt,
  };
}

/**
 * Produces a deterministic SHA-256 hex hash of a raw refresh token.
 *
 * @param {string} rawToken - The raw random token string.
 * @returns {string} 64-character SHA-256 hex string.
 */
export function hashRefreshToken(rawToken) {
  if (!rawToken || typeof rawToken !== 'string') {
    throw new Error('Raw refresh token must be a valid string.');
  }
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export default {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashRefreshToken,
};
