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
 * Retrieves all curriculum nodes ordered by created_at ASC.
 * @param {Function} [customQuery] - Optional query runner override.
 * @returns {Promise<Array>} List of curriculum node rows.
 */
export async function findAllNodes(customQuery = null) {
  const runner = customQuery || activeQuery;
  const sql = `
    SELECT
      id,
      session_id,
      board_id,
      class_id,
      subject_id,
      syllabus_version,
      is_active,
      created_at,
      updated_at
    FROM curriculum_nodes
    ORDER BY created_at ASC
  `;
  const rows = await runner(sql, []);
  return rows || [];
}

/**
 * Retrieves a single curriculum node by its primary key ID.
 * @param {string} id - The curriculum node UUID.
 * @param {Function} [customQuery] - Optional query runner override.
 * @returns {Promise<Object|null>} The node row or null if not found.
 */
export async function findNodeById(id, customQuery = null) {
  const runner = customQuery || activeQuery;
  const sql = `
    SELECT
      id,
      session_id,
      board_id,
      class_id,
      subject_id,
      syllabus_version,
      is_active,
      created_at,
      updated_at
    FROM curriculum_nodes
    WHERE id = ?
    LIMIT 1
  `;
  const rows = await runner(sql, [id]);
  return rows && rows.length > 0 ? rows[0] : null;
}

/**
 * Retrieves chapters belonging to a specific curriculum node ordered by chapter_number ASC.
 * @param {string} nodeId - The parent curriculum node UUID.
 * @param {Function} [customQuery] - Optional query runner override.
 * @returns {Promise<Array>} List of chapter rows.
 */
export async function findChaptersByNodeId(nodeId, customQuery = null) {
  const runner = customQuery || activeQuery;
  const sql = `
    SELECT
      id,
      curriculum_node_id,
      chapter_number,
      title,
      description,
      estimated_teaching_hours,
      status,
      created_at,
      updated_at
    FROM chapters
    WHERE curriculum_node_id = ?
    ORDER BY chapter_number ASC
  `;
  const rows = await runner(sql, [nodeId]);
  return rows || [];
}

/**
 * Retrieves a single chapter by its primary key ID.
 * @param {string} id - The chapter UUID.
 * @param {Function} [customQuery] - Optional query runner override.
 * @returns {Promise<Object|null>} The chapter row or null if not found.
 */
export async function findChapterById(id, customQuery = null) {
  const runner = customQuery || activeQuery;
  const sql = `
    SELECT
      id,
      curriculum_node_id,
      chapter_number,
      title,
      description,
      estimated_teaching_hours,
      status,
      created_at,
      updated_at
    FROM chapters
    WHERE id = ?
    LIMIT 1
  `;
  const rows = await runner(sql, [id]);
  return rows && rows.length > 0 ? rows[0] : null;
}

/**
 * Retrieves topics belonging to a specific chapter ordered by sequence_order ASC.
 * @param {string} chapterId - The parent chapter UUID.
 * @param {Function} [customQuery] - Optional query runner override.
 * @returns {Promise<Array>} List of topic rows.
 */
export async function findTopicsByChapterId(chapterId, customQuery = null) {
  const runner = customQuery || activeQuery;
  const sql = `
    SELECT
      id,
      chapter_id,
      sequence_order,
      topic_code,
      title,
      description,
      status,
      created_at,
      updated_at
    FROM topics
    WHERE chapter_id = ?
    ORDER BY sequence_order ASC
  `;
  const rows = await runner(sql, [chapterId]);
  return rows || [];
}

/**
 * Retrieves a single topic by its primary key ID.
 * @param {string} id - The topic UUID.
 * @param {Function} [customQuery] - Optional query runner override.
 * @returns {Promise<Object|null>} The topic row or null if not found.
 */
export async function findTopicById(id, customQuery = null) {
  const runner = customQuery || activeQuery;
  const sql = `
    SELECT
      id,
      chapter_id,
      sequence_order,
      topic_code,
      title,
      description,
      status,
      created_at,
      updated_at
    FROM topics
    WHERE id = ?
    LIMIT 1
  `;
  const rows = await runner(sql, [id]);
  return rows && rows.length > 0 ? rows[0] : null;
}

export default {
  findAllNodes,
  findNodeById,
  findChaptersByNodeId,
  findChapterById,
  findTopicsByChapterId,
  findTopicById,
  setQueryRunner,
  resetQueryRunner,
};
