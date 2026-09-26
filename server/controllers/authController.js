import { config } from '../config/environment.js';
import { verifyPassword } from '../services/passwordService.js';
import {
  findUserForAuth,
  isAccountLocked,
  recordFailedLogin,
  recordSuccessfulLogin,
  sanitizeUser,
} from '../services/userService.js';
import { generateAccessToken } from '../services/tokenService.js';
import {
  createAndSaveRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
} from '../services/refreshTokenService.js';

const VALID_ROLES = ['student', 'parent', 'teacher', 'admin'];

/**
 * Helper to build the secure cookie configuration for refresh tokens.
 */
function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: config.auth.cookieSecure,
    sameSite: config.auth.cookieSameSite,
    path: '/api/auth',
    maxAge: config.auth.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000,
  };
}

/**
 * POST /api/auth/login
 * Role-aware authentication endpoint.
 */
export async function login(req, res) {
  try {
    const { role, identifier, password } = req.body || {};

    // 1. Validate inputs safely without revealing internal errors
    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Valid role is required (student, parent, teacher, admin).' });
    }
    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return res.status(400).json({ error: 'Identifier is required.' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required.' });
    }

    // 2. Locate user
    const user = await findUserForAuth(identifier, role);
    if (!user) {
      // Generic sanitized response to avoid user enumeration
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // 3. Verify lockout status
    if (isAccountLocked(user)) {
      return res.status(401).json({
        error: 'Invalid credentials or account is temporarily locked. Please try again later.',
      });
    }

    // 4. Verify account active state
    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // 5. Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      await recordFailedLogin(user.id, user.failed_login_attempts);
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // 6. Record successful authentication
    await recordSuccessfulLogin(user.id);

    // 7. Generate tokens
    const accessToken = generateAccessToken(user);
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const { rawToken } = await createAndSaveRefreshToken(user.id, clientIp, userAgent);

    // 8. Attach HttpOnly Cookie
    res.cookie(config.auth.refreshTokenCookieName, rawToken, getRefreshCookieOptions());

    // 9. Send safe response (never exposes password, hashes, or security internals)
    return res.status(200).json({
      user: sanitizeUser(user),
      accessToken,
    });
  } catch (error) {
    console.error('Authentication Error during login:', error.message);
    return res.status(500).json({ error: 'An unexpected internal error occurred.' });
  }
}

/**
 * POST /api/auth/refresh
 * Exchanges a valid HttpOnly refresh token for a fresh access token.
 */
export async function refresh(req, res) {
  try {
    // Read refresh token from HttpOnly cookie or fallback body
    const rawToken = req.cookies?.[config.auth.refreshTokenCookieName] || req.body?.refreshToken;

    if (!rawToken) {
      return res.status(401).json({ error: 'Refresh token is required.' });
    }

    const validation = await validateRefreshToken(rawToken);
    if (!validation.valid) {
      res.clearCookie(config.auth.refreshTokenCookieName, { path: '/api/auth' });
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }

    // Generate fresh access token for the authenticated user
    const accessToken = generateAccessToken(validation.user);

    return res.status(200).json({
      accessToken,
    });
  } catch (error) {
    console.error('Authentication Error during token refresh:', error.message);
    return res.status(500).json({ error: 'An unexpected internal error occurred.' });
  }
}

/**
 * POST /api/auth/logout
 * Revokes the current refresh token and clears the HttpOnly cookie.
 */
export async function logout(req, res) {
  try {
    const rawToken = req.cookies?.[config.auth.refreshTokenCookieName] || req.body?.refreshToken;

    if (rawToken) {
      await revokeRefreshToken(rawToken);
    }

    res.clearCookie(config.auth.refreshTokenCookieName, { path: '/api/auth' });

    return res.status(200).json({
      message: 'Logged out successfully.',
    });
  } catch (error) {
    console.error('Authentication Error during logout:', error.message);
    return res.status(500).json({ error: 'An unexpected internal error occurred.' });
  }
}

export default {
  login,
  refresh,
  logout,
};
