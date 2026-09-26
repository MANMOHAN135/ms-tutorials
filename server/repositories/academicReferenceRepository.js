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
 * Retrieves all academic sessions ordered by start_date ASC.
 * @param {Function} [customQuery] - Optional query runner override.
 * @returns {Promise<Array>} List of academic session rows.
 */
export async function findAllSessions(customQuery = null) {
  const runner = customQuery || activeQuery;
  const sql = `
    SELECT
      id,
      session_code,
      display_name,
      start_date,
      end_date,
      status,
      created_at,
      updated_at
    FROM academic_sessions
    ORDER BY start_date ASC
  `;
  const rows = await runner(sql, []);
  return rows || [];
}

/**
 * Retrieves all educational boards ordered by code ASC.
 * @param {Function} [customQuery] - Optional query runner override.
 * @returns {Promise<Array>} List of board rows.
 */
export async function findAllBoards(customQuery = null) {
  const runner = customQuery || activeQuery;
  const sql = `
    SELECT
      id,
      code,
      name,
      description,
      status,
      created_at,
      updated_at
    FROM boards
    ORDER BY code ASC
  `;
  const rows = await runner(sql, []);
  return rows || [];
}

/**
 * Retrieves all academic classes ordered by grade_number ASC.
 * @param {Function} [customQuery] - Optional query runner override.
 * @returns {Promise<Array>} List of class rows.
 */
export async function findAllClasses(customQuery = null) {
  const runner = customQuery || activeQuery;
  const sql = `
    SELECT
      id,
      grade_number,
      code,
      display_name,
      stage,
      status,
      created_at,
      updated_at
    FROM classes
    ORDER BY grade_number ASC
  `;
  const rows = await runner(sql, []);
  return rows || [];
}

/**
 * Retrieves all educational programs ordered by code ASC.
 * @param {Function} [customQuery] - Optional query runner override.
 * @returns {Promise<Array>} List of program rows.
 */
export async function findAllPrograms(customQuery = null) {
  const runner = customQuery || activeQuery;
  const sql = `
    SELECT
      id,
      code,
      name,
      description,
      target_stage,
      status,
      created_at,
      updated_at
    FROM programs
    ORDER BY code ASC
  `;
  const rows = await runner(sql, []);
  return rows || [];
}

/**
 * Retrieves all academic subjects ordered by name ASC.
 * Preserves parent_subject_id for Science component modeling.
 * @param {Function} [customQuery] - Optional query runner override.
 * @returns {Promise<Array>} List of subject rows.
 */
export async function findAllSubjects(customQuery = null) {
  const runner = customQuery || activeQuery;
  const sql = `
    SELECT
      id,
      code,
      name,
      parent_subject_id,
      color_code,
      status,
      created_at,
      updated_at
    FROM subjects
    ORDER BY name ASC
  `;
  const rows = await runner(sql, []);
  return rows || [];
}

export default {
  findAllSessions,
  findAllBoards,
  findAllClasses,
  findAllPrograms,
  findAllSubjects,
  setQueryRunner,
  resetQueryRunner,
};
