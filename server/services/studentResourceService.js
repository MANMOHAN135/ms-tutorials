import {
  findResourcesByUserId,
  countResourcesByUserId,
  findResourceById,
} from '../repositories/studentResourceRepository.js';
import { getStudentAcademicContext } from './studentAcademicContextService.js';

/**
 * Normalizes a raw database learning resource row to a clean camelCase DTO.
 * Explicitly excludes internal/audit fields such as uploaded_by and is_published.
 *
 * @param {Object} row - Raw MySQL row.
 * @returns {Object|null} Normalized learning resource DTO.
 */
export function mapResource(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description || null,
    resourceType: row.resource_type,
    curriculumNodeId: row.curriculum_node_id,
    chapterId: row.chapter_id || null,
    topicId: row.topic_id || null,
    storageType: row.storage_type,
    fileUrl: row.file_url,
    fileSizeBytes: row.file_size_bytes != null ? Number(row.file_size_bytes) : null,
    mimeType: row.mime_type || null,
    durationSeconds: row.duration_seconds != null ? Number(row.duration_seconds) : null,
    difficultyLevel: row.difficulty_level,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Retrieves a paginated collection of learning resources for an authenticated student.
 * If the student has no active enrollment, safely returns an empty paginated collection without error.
 *
 * @param {string} userId - Authenticated user UUID.
 * @param {Object} [filters={}] - Narrowing filters (subjectId, chapterId, topicId, resourceType, difficultyLevel).
 * @param {Object} [pagination={}] - Pagination parameters (page, pageSize).
 * @param {Function} [customQuery=null] - Optional query runner override.
 * @returns {Promise<Object|null>} Collection and pagination envelope, or null if student does not exist.
 */
export async function getStudentResources(userId, filters = {}, pagination = {}, customQuery = null) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  // 1. Resolve student academic context
  const academicContext = await getStudentAcademicContext(userId, customQuery);
  if (!academicContext) {
    return null; // Student record not found in identity domain
  }

  const page = Math.max(1, parseInt(pagination.page || 1, 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(pagination.pageSize || 20, 10)));

  // 2. Unenrolled student: safely return empty paginated result
  if (!academicContext.enrollment) {
    return {
      resources: [],
      pagination: {
        page,
        pageSize,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  // 3. Query total count and records within authorized enrollment scope
  const total = await countResourcesByUserId(userId, filters, customQuery);
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  if (total === 0) {
    return {
      resources: [],
      pagination: {
        page,
        pageSize,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  const offset = (page - 1) * pageSize;
  const rows = await findResourcesByUserId(
    userId,
    filters,
    { limit: pageSize, offset },
    customQuery
  );

  return {
    resources: rows.map(mapResource),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext,
      hasPrev,
    },
  };
}

/**
 * Retrieves a single learning resource by ID for an authenticated student.
 * Guarantees that the resource is published and belongs to the student's active enrollment scope.
 *
 * @param {string} userId - Authenticated user UUID.
 * @param {string} resourceId - Learning resource UUID.
 * @param {Function} [customQuery=null] - Optional query runner override.
 * @returns {Promise<Object|null>} Normalized resource DTO or null if not found/unauthorized.
 */
export async function getStudentResourceById(userId, resourceId, customQuery = null) {
  if (!userId || !resourceId) return null;

  // 1. Verify student academic context
  const academicContext = await getStudentAcademicContext(userId, customQuery);
  if (!academicContext || !academicContext.enrollment) {
    return null; // Unenrolled students cannot access resources
  }

  // 2. Fetch resource strictly scoped by user enrollment context
  const row = await findResourceById(userId, resourceId, customQuery);
  if (!row) {
    return null;
  }

  return mapResource(row);
}

export default {
  mapResource,
  getStudentResources,
  getStudentResourceById,
};
