import { query as defaultQuery } from '../config/database.js';

let activeQuery = defaultQuery;

/**
 * Sets a custom query runner (used for isolated testing without live database).
 * @param {Function} customFn 
 */
export function setQueryRunner(customFn) {
  activeQuery = customFn || defaultQuery;
}

/**
 * Resets query runner to the default database query function.
 */
export function resetQueryRunner() {
  activeQuery = defaultQuery;
}

/**
 * Finds a student profile by user_id.
 * Joins users and students tables.
 *
 * @param {string} userId - User UUID from users table.
 * @param {Function} [customQuery] - Optional query runner for direct override.
 * @returns {Promise<Object|null>} Safe profile row or null if not found.
 */
export async function findStudentByUserId(userId, customQuery = null) {
  if (!userId) return null;
  const runner = customQuery || activeQuery;

  const sql = `
    SELECT
      u.id AS user_id,
      u.identifier,
      u.email,
      u.phone,
      u.full_name,
      u.role,
      u.status,
      s.id AS student_id,
      s.admission_number,
      s.date_of_birth,
      s.gender,
      s.school_name,
      s.board,
      s.academic_track,
      s.address_text,
      s.created_at,
      s.updated_at
    FROM students s
    JOIN users u ON s.user_id = u.id
    WHERE u.id = ? AND u.role = 'student'
    LIMIT 1
  `;

  const rows = await runner(sql, [userId]);
  if (!rows || rows.length === 0) return null;
  return rows[0];
}

export default {
  findStudentByUserId,
  setQueryRunner,
  resetQueryRunner,
};
