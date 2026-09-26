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
 * Finds a teacher profile by user_id.
 * Joins users and teachers tables.
 *
 * @param {string} userId - User UUID from users table.
 * @param {Function} [customQuery] - Optional query runner for direct override.
 * @returns {Promise<Object|null>} Safe profile row or null if not found.
 */
export async function findTeacherByUserId(userId, customQuery = null) {
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
      t.id AS teacher_id,
      t.faculty_code,
      t.qualification,
      t.specialization,
      t.joining_date,
      t.created_at,
      t.updated_at
    FROM teachers t
    JOIN users u ON t.user_id = u.id
    WHERE u.id = ? AND u.role = 'teacher'
    LIMIT 1
  `;

  const rows = await runner(sql, [userId]);
  if (!rows || rows.length === 0) return null;
  return rows[0];
}

export default {
  findTeacherByUserId,
  setQueryRunner,
  resetQueryRunner,
};
