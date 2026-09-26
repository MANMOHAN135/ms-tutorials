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
 * Finds an admin profile by user_id.
 * Joins users and admins tables.
 *
 * @param {string} userId - User UUID from users table.
 * @param {Function} [customQuery] - Optional query runner for direct override.
 * @returns {Promise<Object|null>} Safe profile row or null if not found.
 */
export async function findAdminByUserId(userId, customQuery = null) {
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
      a.id AS admin_id,
      a.admin_code,
      a.access_level,
      a.department,
      a.created_at,
      a.updated_at
    FROM admins a
    JOIN users u ON a.user_id = u.id
    WHERE u.id = ? AND u.role = 'admin'
    LIMIT 1
  `;

  const rows = await runner(sql, [userId]);
  if (!rows || rows.length === 0) return null;
  return rows[0];
}

export default {
  findAdminByUserId,
  setQueryRunner,
  resetQueryRunner,
};
