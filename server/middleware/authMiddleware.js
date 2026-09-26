import { verifyAccessToken } from '../services/tokenService.js';

/**
 * requireAuth Middleware
 * 
 * Verifies the short-lived access JWT from the HTTP Authorization header.
 * Attaches a safe user identity object to req.user.
 * Rejects missing, malformed, expired, or wrong-type tokens with 401 Unauthorized.
 * 
 * Safe req.user structure:
 * {
 *   id: string (UUID),
 *   role: 'student' | 'parent' | 'teacher' | 'admin',
 *   identifier: string (e.g. AS26090 or email),
 *   name: string
 * }
 */
export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || typeof authHeader !== 'string') {
      return res.status(401).json({ error: 'Unauthorized: Access token is required.' });
    }

    const parts = authHeader.trim().split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return res.status(401).json({ error: 'Unauthorized: Malformed Authorization header. Expected Bearer <token>.' });
    }

    const token = parts[1];
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (jwtError) {
      // Differentiate expired vs invalid without leaking internal signature details
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired access token.' });
    }

    // Validate token purpose / type
    if (decoded.type !== 'access') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token type.' });
    }

    // Validate required claims
    if (!decoded.sub || !decoded.role) {
      return res.status(401).json({ error: 'Unauthorized: Token claims are incomplete.' });
    }

    // Attach safe user identity to request object
    req.user = {
      id: decoded.sub,
      role: decoded.role,
      identifier: decoded.identifier,
      name: decoded.name,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Authentication failed.' });
  }
}

export default requireAuth;
