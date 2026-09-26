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
 * Finds a parent profile by user_id.
 * Joins users and parents tables.
 *
 * @param {string} userId - User UUID from users table.
 * @param {Function} [customQuery] - Optional query runner for direct override.
 * @returns {Promise<Object|null>} Safe profile row or null if not found.
 */
export async function findParentByUserId(userId, customQuery = null) {
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
      p.id AS parent_id,
      p.parent_code,
      p.occupation,
      p.alternate_phone,
      p.emergency_contact_phone,
      p.created_at,
      p.updated_at
    FROM parents p
    JOIN users u ON p.user_id = u.id
    WHERE u.id = ? AND u.role = 'parent'
    LIMIT 1
  `;

  const rows = await runner(sql, [userId]);
  if (!rows || rows.length === 0) return null;
  return rows[0];
}

/**
 * Finds all linked children for a parent by parent's user_id.
 * Joins parents, parent_student, students, and users tables.
 *
 * @param {string} userId - Parent's user UUID.
 * @param {Function} [customQuery] - Optional query runner for direct override.
 * @returns {Promise<Array<Object>>} List of linked children records.
 */
export async function findLinkedChildrenByParentUserId(userId, customQuery = null) {
  if (!userId) return [];
  const runner = customQuery || activeQuery;

  const sql = `
    SELECT
      s.id AS student_id,
      s.admission_number,
      u.full_name AS name,
      u.email,
      u.phone,
      ps.relationship_type,
      ps.is_primary_contact,
      s.date_of_birth,
      s.gender,
      s.school_name,
      s.board,
      s.academic_track,
      s.created_at,
      s.updated_at
    FROM parent_student ps
    JOIN parents p ON ps.parent_id = p.id
    JOIN students s ON ps.student_id = s.id
    JOIN users u ON s.user_id = u.id
    WHERE p.user_id = ?
    ORDER BY s.admission_number ASC
  `;

  const rows = await runner(sql, [userId]);
  return rows || [];
}

export default {
  findParentByUserId,
  findLinkedChildrenByParentUserId,
  setQueryRunner,
  resetQueryRunner,
};
