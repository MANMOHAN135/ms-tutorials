import { query } from '../config/database.js';

/**
 * requireSelf Middleware
 * 
 * Ensures an authenticated user can only access their own user-level resource.
 * Example: GET /api/users/:userId
 * 
 * @param {string} [paramName='userId'] - The route parameter containing target user ID.
 * @returns {Function} Express middleware.
 */
export function requireSelf(paramName = 'userId') {
  return (req, res, next) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    const targetUserId = req.params[paramName] || req.query[paramName] || req.body?.[paramName];

    // System Admins possess institutional override authority
    if (req.user.role === 'admin') {
      return next();
    }

    if (!targetUserId || targetUserId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You cannot access another user\'s resource.' });
    }

    return next();
  };
}

/**
 * requireStudentSelf Middleware Factory
 * 
 * Verifies that an authenticated student is requesting their own student profile/records.
 * Prevents Student A from accessing Student B's academic data.
 * 
 * @param {string} [studentParam='studentId'] - Parameter containing student UUID or admission number.
 * @param {Function} [customQuery=query] - Optional query runner for isolated unit testing.
 * @returns {Function} Express middleware.
 */
export function requireStudentSelf(studentParam = 'studentId', customQuery = query) {
  return async (req, res, next) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    // Admins possess override inspection authority
    if (req.user.role === 'admin') {
      return next();
    }

    // Must be a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Forbidden: Insufficient role permissions.' });
    }

    const targetStudentId = req.params[studentParam] || req.query[studentParam] || req.body?.[studentParam];
    if (!targetStudentId) {
      return res.status(400).json({ error: 'Bad Request: Student identifier is required.' });
    }

    try {
      const sql = `
        SELECT 1
        FROM students
        WHERE user_id = ?
          AND (id = ? OR user_id = ? OR admission_number = ?)
        LIMIT 1
      `;

      const rows = await customQuery(sql, [
        req.user.id,
        targetStudentId,
        targetStudentId,
        targetStudentId,
      ]);

      if (!rows || rows.length === 0) {
        return res.status(403).json({ error: 'Forbidden: You may only access your own student records.' });
      }

      return next();
    } catch (error) {
      console.error('Ownership Verification Error (Student):', error.message);
      return res.status(500).json({ error: 'An unexpected internal error occurred.' });
    }
  };
}

/**
 * requireParentOfStudent Middleware Factory
 * 
 * Verifies that an authenticated parent is linked to the requested child via the parent_student table.
 * Supports multi-child families (Parent A -> Child 1, Child 2) while blocking unlinked children (Child 3).
 * 
 * @param {string} [studentParam='studentId'] - Parameter containing student UUID or admission number.
 * @param {Function} [customQuery=query] - Optional query runner for isolated unit testing.
 * @returns {Function} Express middleware.
 */
export function requireParentOfStudent(studentParam = 'studentId', customQuery = query) {
  return async (req, res, next) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    // Admins possess institutional override authority
    if (req.user.role === 'admin') {
      return next();
    }

    // Must be a parent
    if (req.user.role !== 'parent') {
      return res.status(403).json({ error: 'Forbidden: Insufficient role permissions.' });
    }

    const targetStudentId = req.params[studentParam] || req.query[studentParam] || req.body?.[studentParam];
    if (!targetStudentId) {
      return res.status(400).json({ error: 'Bad Request: Student identifier is required.' });
    }

    try {
      const sql = `
        SELECT 1
        FROM parent_student ps
        INNER JOIN parents p ON ps.parent_id = p.id
        INNER JOIN students s ON ps.student_id = s.id
        WHERE p.user_id = ?
          AND (s.id = ? OR s.user_id = ? OR s.admission_number = ?)
        LIMIT 1
      `;

      const rows = await customQuery(sql, [
        req.user.id,
        targetStudentId,
        targetStudentId,
        targetStudentId,
      ]);

      if (!rows || rows.length === 0) {
        return res.status(403).json({
          error: 'Forbidden: You are not authorized to access records for this student.',
        });
      }

      return next();
    } catch (error) {
      console.error('Ownership Verification Error (Parent-Child):', error.message);
      return res.status(500).json({ error: 'An unexpected internal error occurred.' });
    }
  };
}

/**
 * requireTeacherAssignment Middleware Factory (Architectural Extension Hook)
 * 
 * Foundation for future Phase 9/11 teacher batch and subject authorization.
 * Documented extension point: will verify teacher assignment once batch/subject tables are implemented.
 * 
 * @returns {Function} Express middleware.
 */
export function requireTeacherAssignment() {
  return (req, res, next) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Forbidden: Insufficient role permissions.' });
    }

    // Future extension: Check teacher_batches junction table when created in later phases
    return next();
  };
}

export default {
  requireSelf,
  requireStudentSelf,
  requireParentOfStudent,
  requireTeacherAssignment,
};
