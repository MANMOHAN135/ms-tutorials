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
 * Finds the current academic enrollment context for an authenticated student by user_id.
 * Traverses: users -> students -> student_enrollments -> academic_sessions, boards, classes, programs, batches.
 * Enforces that student_enrollments.board_id is the authoritative board context.
 *
 * @param {string} userId - Authenticated user UUID from users table.
 * @param {Function} [customQuery] - Optional query runner for isolated testing.
 * @returns {Promise<Object|null>} Raw joined database record or null if student not found.
 */
export async function findAcademicContextByUserId(userId, customQuery = null) {
  if (!userId) return null;
  const runner = customQuery || activeQuery;

  const sql = `
    SELECT
      s.id AS student_id,
      s.admission_number,
      u.full_name AS student_name,
      u.email AS student_email,
      se.id AS enrollment_id,
      se.enrollment_date,
      se.status AS enrollment_status,
      se.roll_number,
      se.created_at AS enrollment_created_at,
      ses.id AS session_id,
      ses.session_code,
      ses.display_name AS session_display_name,
      ses.start_date AS session_start_date,
      ses.end_date AS session_end_date,
      ses.status AS session_status,
      b.id AS board_id,
      b.code AS board_code,
      b.name AS board_name,
      b.status AS board_status,
      c.id AS class_id,
      c.grade_number AS class_grade_number,
      c.code AS class_code,
      c.display_name AS class_display_name,
      c.stage AS class_stage,
      c.status AS class_status,
      p.id AS program_id,
      p.code AS program_code,
      p.name AS program_name,
      p.target_stage AS program_target_stage,
      p.status AS program_status,
      bat.id AS batch_id,
      bat.code AS batch_code,
      bat.name AS batch_name,
      bat.schedule_description AS batch_schedule,
      bat.status AS batch_status
    FROM users u
    JOIN students s ON s.user_id = u.id
    LEFT JOIN student_enrollments se ON se.student_id = s.id AND se.status = 'active'
    LEFT JOIN academic_sessions ses ON se.session_id = ses.id
    LEFT JOIN boards b ON se.board_id = b.id
    LEFT JOIN classes c ON se.class_id = c.id
    LEFT JOIN programs p ON se.program_id = p.id
    LEFT JOIN batches bat ON se.batch_id = bat.id
    WHERE u.id = ? AND u.role = 'student'
    ORDER BY
      CASE WHEN ses.status = 'active' THEN 1 ELSE 2 END,
      ses.start_date DESC,
      se.enrollment_date DESC,
      se.created_at DESC
    LIMIT 1
  `;

  const rows = await runner(sql, [userId]);
  if (!rows || rows.length === 0) return null;
  return rows[0];
}

export default {
  findAcademicContextByUserId,
  setQueryRunner,
  resetQueryRunner,
};
