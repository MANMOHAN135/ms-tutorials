const VALID_ROLES = ['student', 'parent', 'teacher', 'admin'];

/**
 * requireRole Middleware Factory
 * 
 * Verifies that the authenticated user possesses one of the allowed roles.
 * Returns 401 if unauthenticated; returns 403 Forbidden if authenticated but unauthorized.
 * 
 * Examples:
 *   requireRole('student')
 *   requireRole('admin')
 *   requireRole('teacher', 'admin')
 * 
 * @param {...string} allowedRoles - List of authorized roles.
 * @returns {Function} Express middleware.
 */
export function requireRole(...allowedRoles) {
  // Validate middleware declaration
  if (allowedRoles.length === 0) {
    throw new Error('requireRole requires at least one allowed role.');
  }

  for (const role of allowedRoles) {
    if (!VALID_ROLES.includes(role)) {
      throw new Error(`Invalid role specified in requireRole: "${role}". Must be one of: ${VALID_ROLES.join(', ')}`);
    }
  }

  return (req, res, next) => {
    // 1. Verify that authentication preceded this check
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    // 2. Check if the verified user role is permitted
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    // 3. User is authenticated, but lacks permissions -> 403 Forbidden
    return res.status(403).json({ error: 'Forbidden: Insufficient role permissions.' });
  };
}

export default requireRole;
