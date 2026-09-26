import {
  findAllSessions,
  findAllBoards,
  findAllClasses,
  findAllPrograms,
  findAllSubjects,
} from '../repositories/academicReferenceRepository.js';

/**
 * Retrieves all academic sessions with safe reference fields.
 * @param {Function} [customQuery] - Optional query runner for isolated testing.
 * @returns {Promise<Array<Object>>} Normalized academic sessions.
 */
export async function getAcademicSessions(customQuery) {
  const rows = await findAllSessions(customQuery);
  return rows.map((row) => ({
    id: row.id,
    sessionCode: row.session_code,
    displayName: row.display_name,
    startDate: row.start_date instanceof Date
      ? row.start_date.toISOString().split('T')[0]
      : (row.start_date ? String(row.start_date).split('T')[0] : null),
    endDate: row.end_date instanceof Date
      ? row.end_date.toISOString().split('T')[0]
      : (row.end_date ? String(row.end_date).split('T')[0] : null),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Retrieves all educational boards with safe reference fields.
 * @param {Function} [customQuery] - Optional query runner for isolated testing.
 * @returns {Promise<Array<Object>>} Normalized educational boards.
 */
export async function getAcademicBoards(customQuery) {
  const rows = await findAllBoards(customQuery);
  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description || null,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Retrieves all academic classes with safe reference fields.
 * @param {Function} [customQuery] - Optional query runner for isolated testing.
 * @returns {Promise<Array<Object>>} Normalized academic classes.
 */
export async function getAcademicClasses(customQuery) {
  const rows = await findAllClasses(customQuery);
  return rows.map((row) => ({
    id: row.id,
    gradeNumber: row.grade_number,
    code: row.code,
    displayName: row.display_name,
    stage: row.stage,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Retrieves all educational programs with safe reference fields.
 * @param {Function} [customQuery] - Optional query runner for isolated testing.
 * @returns {Promise<Array<Object>>} Normalized educational programs.
 */
export async function getAcademicPrograms(customQuery) {
  const rows = await findAllPrograms(customQuery);
  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description || null,
    targetStage: row.target_stage,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Retrieves all academic subjects with safe reference fields.
 * Preserves parentSubjectId for component modeling (Science -> Physics/Chemistry/Biology).
 * @param {Function} [customQuery] - Optional query runner for isolated testing.
 * @returns {Promise<Array<Object>>} Normalized academic subjects.
 */
export async function getAcademicSubjects(customQuery) {
  const rows = await findAllSubjects(customQuery);
  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    parentSubjectId: row.parent_subject_id || null,
    colorCode: row.color_code || null,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export default {
  getAcademicSessions,
  getAcademicBoards,
  getAcademicClasses,
  getAcademicPrograms,
  getAcademicSubjects,
};
