import bcrypt from 'bcryptjs';
import { config } from '../config/environment.js';

/**
 * Hashes a plaintext password using bcrypt with a configurable work factor.
 * Plaintext passwords are never logged, persisted, or returned.
 *
 * @param {string} password - The plaintext password to hash.
 * @param {number} [saltRounds] - Optional override for salt rounds.
 * @returns {Promise<string>} The generated bcrypt hash.
 */
export async function hashPassword(password, saltRounds = config.auth.bcryptSaltRounds) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string.');
  }
  const rounds = Number.isInteger(saltRounds) && saltRounds > 0 ? saltRounds : 12;
  const salt = await bcrypt.genSalt(rounds);
  return await bcrypt.hash(password, salt);
}

/**
 * Verifies a plaintext password against a stored bcrypt hash.
 * Performs constant-time comparison to prevent timing attacks.
 *
 * @param {string} password - The candidate plaintext password.
 * @param {string} passwordHash - The stored bcrypt hash.
 * @returns {Promise<boolean>} True if valid, false otherwise.
 */
export async function verifyPassword(password, passwordHash) {
  if (!password || !passwordHash || typeof password !== 'string' || typeof passwordHash !== 'string') {
    return false;
  }
  try {
    return await bcrypt.compare(password, passwordHash);
  } catch (error) {
    // If hash is malformed, fail safely with false rather than throwing
    return false;
  }
}

export default {
  hashPassword,
  verifyPassword,
};
