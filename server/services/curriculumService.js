import {
  findAllNodes,
  findNodeById,
  findChaptersByNodeId,
  findChapterById,
  findTopicsByChapterId,
  findTopicById,
} from '../repositories/curriculumRepository.js';

/**
 * Normalizes a raw database curriculum node row to a clean camelCase DTO.
 * @param {Object} row - Raw MySQL row.
 * @returns {Object|null} Normalized curriculum node.
 */
function mapCurriculumNode(row) {
  if (!row) return null;
  return {
    id: row.id,
    sessionId: row.session_id,
    boardId: row.board_id,
    classId: row.class_id,
    subjectId: row.subject_id,
    syllabusVersion: row.syllabus_version,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Normalizes a raw database chapter row to a clean camelCase DTO.
 * @param {Object} row - Raw MySQL row.
 * @returns {Object|null} Normalized chapter.
 */
function mapChapter(row) {
  if (!row) return null;
  return {
    id: row.id,
    curriculumNodeId: row.curriculum_node_id,
    chapterNumber: Number(row.chapter_number),
    title: row.title,
    description: row.description || null,
    estimatedTeachingHours: row.estimated_teaching_hours != null
      ? Number(row.estimated_teaching_hours)
      : null,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Normalizes a raw database topic row to a clean camelCase DTO.
 * @param {Object} row - Raw MySQL row.
 * @returns {Object|null} Normalized topic.
 */
function mapTopic(row) {
  if (!row) return null;
  return {
    id: row.id,
    chapterId: row.chapter_id,
    sequenceOrder: Number(row.sequence_order),
    topicCode: row.topic_code,
    title: row.title,
    description: row.description || null,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Retrieves all curriculum nodes with safe fields.
 * @param {Function} [customQuery] - Optional query runner override.
 * @returns {Promise<Array<Object>>} Normalized curriculum nodes.
 */
export async function getCurriculumNodes(customQuery) {
  const rows = await findAllNodes(customQuery);
  return rows.map(mapCurriculumNode);
}

/**
 * Retrieves a single curriculum node by ID.
 * @param {string} id - The node UUID.
 * @param {Function} [customQuery] - Optional query runner override.
 * @returns {Promise<Object|null>} Normalized node or null if not found.
 */
export async function getCurriculumNodeById(id, customQuery) {
  if (!id || typeof id !== 'string') return null;
  const row = await findNodeById(id, customQuery);
  return mapCurriculumNode(row);
}

/**
 * Retrieves chapters belonging to a specific curriculum node.
 * Validates node existence first; returns null if node does not exist.
 * @param {string} nodeId - The curriculum node UUID.
 * @param {Function} [customQuery] - Optional query runner override.
 * @returns {Promise<Array<Object>|null>} List of chapters or null if node not found.
 */
export async function getChaptersByNodeId(nodeId, customQuery) {
  if (!nodeId || typeof nodeId !== 'string') return null;
  const node = await findNodeById(nodeId, customQuery);
  if (!node) {
    return null;
  }
  const rows = await findChaptersByNodeId(nodeId, customQuery);
  return rows.map(mapChapter);
}

/**
 * Retrieves a single chapter by ID.
 * @param {string} id - The chapter UUID.
 * @param {Function} [customQuery] - Optional query runner override.
 * @returns {Promise<Object|null>} Normalized chapter or null if not found.
 */
export async function getChapterById(id, customQuery) {
  if (!id || typeof id !== 'string') return null;
  const row = await findChapterById(id, customQuery);
  return mapChapter(row);
}

/**
 * Retrieves topics belonging to a specific chapter.
 * Validates chapter existence first; returns null if chapter does not exist.
 * @param {string} chapterId - The chapter UUID.
 * @param {Function} [customQuery] - Optional query runner override.
 * @returns {Promise<Array<Object>|null>} List of topics or null if chapter not found.
 */
export async function getTopicsByChapterId(chapterId, customQuery) {
  if (!chapterId || typeof chapterId !== 'string') return null;
  const chapter = await findChapterById(chapterId, customQuery);
  if (!chapter) {
    return null;
  }
  const rows = await findTopicsByChapterId(chapterId, customQuery);
  return rows.map(mapTopic);
}

/**
 * Retrieves a single topic by ID.
 * @param {string} id - The topic UUID.
 * @param {Function} [customQuery] - Optional query runner override.
 * @returns {Promise<Object|null>} Normalized topic or null if not found.
 */
export async function getTopicById(id, customQuery) {
  if (!id || typeof id !== 'string') return null;
  const row = await findTopicById(id, customQuery);
  return mapTopic(row);
}

export default {
  getCurriculumNodes,
  getCurriculumNodeById,
  getChaptersByNodeId,
  getChapterById,
  getTopicsByChapterId,
  getTopicById,
};
