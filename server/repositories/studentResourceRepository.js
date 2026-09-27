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
 * Builds the WHERE clauses and parameter list for student resource queries.
 * Scopes resources strictly to the authenticated student's active enrollment context:
 * - Active enrollment (session, board, class)
 * - Active curriculum nodes only (cn.is_active = 1)
 * - Published resources only (lr.is_published = 1)
 *
 * @param {string} userId - Authenticated user UUID from users table.
 * @param {Object} filters - Optional narrowing filters (subjectId, chapterId, topicId, resourceType, difficultyLevel).
 * @returns {{ whereSql: string, params: Array }}
 */
function buildResourceWhere(userId, filters = {}) {
  const whereClauses = [];
  const params = [userId];

  if (filters.subjectId && typeof filters.subjectId === 'string' && filters.subjectId.trim()) {
    whereClauses.push('cn.subject_id = ?');
    params.push(filters.subjectId.trim());
  }

  if (filters.chapterId && typeof filters.chapterId === 'string' && filters.chapterId.trim()) {
    whereClauses.push('lr.chapter_id = ?');
    params.push(filters.chapterId.trim());
  }

  if (filters.topicId && typeof filters.topicId === 'string' && filters.topicId.trim()) {
    whereClauses.push('lr.topic_id = ?');
    params.push(filters.topicId.trim());
  }

  if (filters.resourceType && typeof filters.resourceType === 'string' && filters.resourceType.trim()) {
    whereClauses.push('lr.resource_type = ?');
    params.push(filters.resourceType.trim());
  }

  if (filters.difficultyLevel && typeof filters.difficultyLevel === 'string' && filters.difficultyLevel.trim()) {
    whereClauses.push('lr.difficulty_level = ?');
    params.push(filters.difficultyLevel.trim());
  }

  const whereSql = whereClauses.length > 0 ? ` AND ${whereClauses.join(' AND ')}` : '';
  return { whereSql, params };
}

/**
 * Retrieves paginated learning resources for an authenticated student.
 * Scoped strictly to the student's active enrollment session, board, and class.
 *
 * @param {string} userId - Authenticated student user UUID.
 * @param {Object} [filters={}] - Optional narrowing filters.
 * @param {Object} [pagination={}] - Pagination parameters { limit, offset }.
 * @param {Function} [customQuery=null] - Optional query runner override.
 * @returns {Promise<Array>} List of raw resource records.
 */
export async function findResourcesByUserId(userId, filters = {}, pagination = {}, customQuery = null) {
  if (!userId) return [];
  const runner = customQuery || activeQuery;

  const limit = Math.max(1, parseInt(pagination.limit || 20, 10));
  const offset = Math.max(0, parseInt(pagination.offset || 0, 10));

  const { whereSql, params } = buildResourceWhere(userId, filters);
  params.push(limit, offset);

  const sql = `
    SELECT
      lr.id,
      lr.title,
      lr.description,
      lr.resource_type,
      lr.curriculum_node_id,
      lr.chapter_id,
      lr.topic_id,
      lr.storage_type,
      lr.file_url,
      lr.file_size_bytes,
      lr.mime_type,
      lr.duration_seconds,
      lr.difficulty_level,
      lr.created_at,
      lr.updated_at
    FROM users u
    JOIN students s ON s.user_id = u.id
    JOIN student_enrollments se ON se.id = (
      SELECT se2.id
      FROM student_enrollments se2
      JOIN academic_sessions ses2 ON se2.session_id = ses2.id
      WHERE se2.student_id = s.id AND se2.status = 'active'
      ORDER BY
        CASE WHEN ses2.status = 'active' THEN 1 ELSE 2 END,
        ses2.start_date DESC,
        se2.enrollment_date DESC,
        se2.created_at DESC
      LIMIT 1
    )
    JOIN curriculum_nodes cn ON cn.session_id = se.session_id
                            AND cn.board_id = se.board_id
                            AND cn.class_id = se.class_id
                            AND cn.is_active = 1
    JOIN learning_resources lr ON lr.curriculum_node_id = cn.id
                              AND lr.is_published = 1
    WHERE u.id = ? AND u.role = 'student'${whereSql}
    ORDER BY lr.created_at DESC, lr.id ASC
    LIMIT ? OFFSET ?
  `;

  const rows = await runner(sql, params);
  return rows || [];
}

/**
 * Counts total learning resources matching the student's authorized scope and filters.
 *
 * @param {string} userId - Authenticated student user UUID.
 * @param {Object} [filters={}] - Optional narrowing filters.
 * @param {Function} [customQuery=null] - Optional query runner override.
 * @returns {Promise<number>} Total matching resources.
 */
export async function countResourcesByUserId(userId, filters = {}, customQuery = null) {
  if (!userId) return 0;
  const runner = customQuery || activeQuery;

  const { whereSql, params } = buildResourceWhere(userId, filters);

  const sql = `
    SELECT COUNT(*) AS total
    FROM users u
    JOIN students s ON s.user_id = u.id
    JOIN student_enrollments se ON se.id = (
      SELECT se2.id
      FROM student_enrollments se2
      JOIN academic_sessions ses2 ON se2.session_id = ses2.id
      WHERE se2.student_id = s.id AND se2.status = 'active'
      ORDER BY
        CASE WHEN ses2.status = 'active' THEN 1 ELSE 2 END,
        ses2.start_date DESC,
        se2.enrollment_date DESC,
        se2.created_at DESC
      LIMIT 1
    )
    JOIN curriculum_nodes cn ON cn.session_id = se.session_id
                            AND cn.board_id = se.board_id
                            AND cn.class_id = se.class_id
                            AND cn.is_active = 1
    JOIN learning_resources lr ON lr.curriculum_node_id = cn.id
                              AND lr.is_published = 1
    WHERE u.id = ? AND u.role = 'student'${whereSql}
  `;

  const rows = await runner(sql, params);
  if (!rows || rows.length === 0) return 0;
  return Number(rows[0].total || 0);
}

/**
 * Retrieves a single learning resource by ID for an authenticated student.
 * Guarantees that the resource is published, active, and strictly within the student's authorized academic context.
 *
 * @param {string} userId - Authenticated student user UUID.
 * @param {string} resourceId - Learning resource UUID.
 * @param {Function} [customQuery=null] - Optional query runner override.
 * @returns {Promise<Object|null>} Raw resource record or null if not found or unauthorized.
 */
export async function findResourceById(userId, resourceId, customQuery = null) {
  if (!userId || !resourceId) return null;
  const runner = customQuery || activeQuery;

  const sql = `
    SELECT
      lr.id,
      lr.title,
      lr.description,
      lr.resource_type,
      lr.curriculum_node_id,
      lr.chapter_id,
      lr.topic_id,
      lr.storage_type,
      lr.file_url,
      lr.file_size_bytes,
      lr.mime_type,
      lr.duration_seconds,
      lr.difficulty_level,
      lr.created_at,
      lr.updated_at
    FROM users u
    JOIN students s ON s.user_id = u.id
    JOIN student_enrollments se ON se.id = (
      SELECT se2.id
      FROM student_enrollments se2
      JOIN academic_sessions ses2 ON se2.session_id = ses2.id
      WHERE se2.student_id = s.id AND se2.status = 'active'
      ORDER BY
        CASE WHEN ses2.status = 'active' THEN 1 ELSE 2 END,
        ses2.start_date DESC,
        se2.enrollment_date DESC,
        se2.created_at DESC
      LIMIT 1
    )
    JOIN curriculum_nodes cn ON cn.session_id = se.session_id
                            AND cn.board_id = se.board_id
                            AND cn.class_id = se.class_id
                            AND cn.is_active = 1
    JOIN learning_resources lr ON lr.curriculum_node_id = cn.id
                              AND lr.is_published = 1
    WHERE u.id = ? AND u.role = 'student' AND lr.id = ?
    LIMIT 1
  `;

  const rows = await runner(sql, [userId, resourceId]);
  if (!rows || rows.length === 0) return null;
  return rows[0];
}

export default {
  findResourcesByUserId,
  countResourcesByUserId,
  findResourceById,
  setQueryRunner,
  resetQueryRunner,
};
