import { query as defaultQuery } from '../config/database.js';

let activeQuery = defaultQuery;

export function setQueryRunner(customFn) {
  activeQuery = customFn || defaultQuery;
}

export function resetQueryRunner() {
  activeQuery = defaultQuery;
}

/**
 * Resolves internal student ID from authenticated user ID.
 */
export async function getStudentByUserId(userId, customQuery = null) {
  if (!userId) return null;
  const runner = customQuery || activeQuery;
  const sql = `
    SELECT s.id, s.user_id, s.admission_number, u.full_name, u.email
    FROM students s
    JOIN users u ON s.user_id = u.id
    WHERE u.id = ? AND u.role = 'student'
    LIMIT 1
  `;
  const rows = await runner(sql, [userId]);
  return rows && rows.length > 0 ? rows[0] : null;
}

/**
 * Resolves internal teacher ID from authenticated user ID.
 */
export async function getTeacherByUserId(userId, customQuery = null) {
  if (!userId) return null;
  const runner = customQuery || activeQuery;
  const sql = `
    SELECT t.id, t.user_id, t.faculty_code, u.full_name, u.email
    FROM teachers t
    JOIN users u ON t.user_id = u.id
    WHERE u.id = ? AND u.role = 'teacher'
    LIMIT 1
  `;
  const rows = await runner(sql, [userId]);
  return rows && rows.length > 0 ? rows[0] : null;
}

/**
 * Builds WHERE conditions for student assignment queries.
 */
function buildStudentAssignmentWhere(studentId, filters = {}) {
  const whereClauses = ['sa.student_id = ?', "a.status = 'published'"];
  const params = [studentId];

  if (filters.status) {
    if (filters.status === 'pending') {
      whereClauses.push("sa.status IN ('assigned', 'in_progress', 'resubmission_requested')");
    } else if (filters.status === 'submitted') {
      whereClauses.push("sa.status = 'submitted'");
    } else if (filters.status === 'evaluated') {
      whereClauses.push("sa.status = 'evaluated'");
    } else {
      whereClauses.push('sa.status = ?');
      params.push(filters.status);
    }
  }

  if (filters.subjectId) {
    whereClauses.push('cn.subject_id = ?');
    params.push(filters.subjectId);
  }

  if (filters.chapterId) {
    whereClauses.push('a.chapter_id = ?');
    params.push(filters.chapterId);
  }

  return {
    whereSql: `WHERE ${whereClauses.join(' AND ')}`,
    params,
  };
}

/**
 * Lists assignments for a student with pagination and status filters.
 */
export async function listStudentAssignments(studentId, filters = {}, pagination = { page: 1, pageSize: 20 }, customQuery = null) {
  const runner = customQuery || activeQuery;
  const { whereSql, params } = buildStudentAssignmentWhere(studentId, filters);

  const offset = (pagination.page - 1) * pagination.pageSize;
  const sql = `
    SELECT
      sa.id,
      sa.assignment_id,
      sa.student_id,
      sa.status,
      sa.first_opened_at,
      sa.current_attempt,
      sa.final_score,
      sa.is_completed,
      sa.created_at,
      sa.updated_at,
      a.title,
      a.assignment_type,
      a.max_score,
      a.available_from,
      a.due_at,
      a.close_at,
      a.late_policy,
      a.resubmission_policy,
      sub.name AS subject_name,
      sub.code AS subject_code,
      c.display_name AS class_name,
      ch.title AS chapter_title,
      ch.chapter_number,
      t.title AS topic_title
    FROM student_assignments sa
    JOIN assignments a ON sa.assignment_id = a.id
    JOIN curriculum_nodes cn ON a.curriculum_node_id = cn.id
    JOIN subjects sub ON cn.subject_id = sub.id
    JOIN classes c ON cn.class_id = c.id
    LEFT JOIN chapters ch ON a.chapter_id = ch.id
    LEFT JOIN topics t ON a.topic_id = t.id
    ${whereSql}
    ORDER BY
      CASE WHEN sa.status IN ('assigned', 'in_progress', 'resubmission_requested') THEN 1 ELSE 2 END,
      a.due_at ASC,
      sa.updated_at DESC
    LIMIT ? OFFSET ?
  `;

  params.push(pagination.pageSize, offset);
  return (await runner(sql, params)) || [];
}

/**
 * Counts assignments for pagination.
 */
export async function countStudentAssignments(studentId, filters = {}, customQuery = null) {
  const runner = customQuery || activeQuery;
  const { whereSql, params } = buildStudentAssignmentWhere(studentId, filters);

  const sql = `
    SELECT COUNT(*) AS total
    FROM student_assignments sa
    JOIN assignments a ON sa.assignment_id = a.id
    JOIN curriculum_nodes cn ON a.curriculum_node_id = cn.id
    ${whereSql}
  `;

  const rows = await runner(sql, params);
  return rows && rows.length > 0 ? Number(rows[0].total) : 0;
}

/**
 * Retrieves full details of a student's personal assignment instance with strict student ownership verification.
 */
export async function getStudentAssignmentDetail(studentAssignmentId, studentId, customQuery = null) {
  if (!studentAssignmentId || !studentId) return null;
  const runner = customQuery || activeQuery;

  const sql = `
    SELECT
      sa.id,
      sa.assignment_id,
      sa.student_id,
      sa.status,
      sa.first_opened_at,
      sa.current_attempt,
      sa.final_score,
      sa.is_completed,
      sa.created_at,
      sa.updated_at,
      a.title,
      a.description,
      a.assignment_type,
      a.max_score,
      a.available_from,
      a.due_at,
      a.close_at,
      a.late_policy,
      a.resubmission_policy,
      a.max_resubmissions,
      a.status AS assignment_master_status,
      u.full_name AS author_name,
      sub.name AS subject_name,
      sub.code AS subject_code,
      c.display_name AS class_name,
      ch.title AS chapter_title,
      ch.chapter_number,
      t.title AS topic_title
    FROM student_assignments sa
    JOIN assignments a ON sa.assignment_id = a.id
    JOIN users u ON a.created_by = u.id
    JOIN curriculum_nodes cn ON a.curriculum_node_id = cn.id
    JOIN subjects sub ON cn.subject_id = sub.id
    JOIN classes c ON cn.class_id = c.id
    LEFT JOIN chapters ch ON a.chapter_id = ch.id
    LEFT JOIN topics t ON a.topic_id = t.id
    WHERE sa.id = ? AND sa.student_id = ?
    LIMIT 1
  `;

  const rows = await runner(sql, [studentAssignmentId, studentId]);
  return rows && rows.length > 0 ? rows[0] : null;
}

/**
 * Retrieves student assignment by ID regardless of student (used internally by evaluation/admin).
 */
export async function getStudentAssignmentById(studentAssignmentId, customQuery = null) {
  if (!studentAssignmentId) return null;
  const runner = customQuery || activeQuery;

  const sql = `
    SELECT
      sa.id,
      sa.assignment_id,
      sa.student_id,
      sa.status,
      sa.current_attempt,
      sa.final_score,
      sa.is_completed,
      a.title,
      a.max_score,
      a.due_at,
      a.close_at,
      a.late_policy,
      a.resubmission_policy,
      a.max_resubmissions,
      a.status AS assignment_status,
      a.available_from
    FROM student_assignments sa
    JOIN assignments a ON sa.assignment_id = a.id
    WHERE sa.id = ?
    LIMIT 1
  `;

  const rows = await runner(sql, [studentAssignmentId]);
  return rows && rows.length > 0 ? rows[0] : null;
}

/**
 * Inserts a new student submission attempt.
 */
export async function createSubmission(submissionData, customQuery = null) {
  const runner = customQuery || activeQuery;
  const sql = `
    INSERT INTO submissions (
      id, student_assignment_id, attempt_number,
      submission_type, text_response, external_link,
      is_late, submitted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    submissionData.id,
    submissionData.studentAssignmentId,
    submissionData.attemptNumber,
    submissionData.submissionType || 'text',
    submissionData.textResponse || null,
    submissionData.externalLink || null,
    submissionData.isLate ? 1 : 0,
    submissionData.submittedAt || new Date(),
  ];

  await runner(sql, params);
  return submissionData;
}

/**
 * Inserts attachment metadata records for a submission.
 */
export async function createSubmissionAttachments(attachments, customQuery = null) {
  if (!attachments || attachments.length === 0) return [];
  const runner = customQuery || activeQuery;

  for (const att of attachments) {
    const sql = `
      INSERT INTO submission_attachments (
        id, submission_id, storage_path,
        original_filename, mime_type, file_size_bytes
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    await runner(sql, [
      att.id,
      att.submissionId,
      att.storagePath,
      att.originalFilename,
      att.mimeType,
      att.fileSizeBytes,
    ]);
  }

  return attachments;
}

/**
 * Updates student assignment status, current attempt counter, and score.
 */
export async function updateStudentAssignmentStatus(studentAssignmentId, status, currentAttempt, finalScore = null, isCompleted = false, customQuery = null) {
  const runner = customQuery || activeQuery;
  const sql = `
    UPDATE student_assignments
    SET status = ?, current_attempt = ?, final_score = ?, is_completed = ?
    WHERE id = ?
  `;
  await runner(sql, [status, currentAttempt, finalScore, isCompleted ? 1 : 0, studentAssignmentId]);
}

/**
 * Marks student assignment as opened (audit timestamp).
 */
export async function markStudentAssignmentOpened(studentAssignmentId, customQuery = null) {
  const runner = customQuery || activeQuery;
  const sql = `
    UPDATE student_assignments
    SET first_opened_at = CURRENT_TIMESTAMP
    WHERE id = ? AND first_opened_at IS NULL
  `;
  await runner(sql, [studentAssignmentId]);
}

/**
 * Retrieves submissions for a student assignment with evaluation and attachment details.
 */
export async function getSubmissionsByStudentAssignmentId(studentAssignmentId, customQuery = null) {
  if (!studentAssignmentId) return [];
  const runner = customQuery || activeQuery;

  const sql = `
    SELECT
      sub.id,
      sub.student_assignment_id,
      sub.attempt_number,
      sub.submission_type,
      sub.text_response,
      sub.external_link,
      sub.is_late,
      sub.submitted_at,
      e.id AS evaluation_id,
      e.score_awarded,
      e.grading_status,
      e.feedback,
      e.evaluated_at,
      tu.full_name AS evaluator_name
    FROM submissions sub
    LEFT JOIN evaluations e ON e.submission_id = sub.id
    LEFT JOIN teachers t ON e.evaluated_by = t.id
    LEFT JOIN users tu ON t.user_id = tu.id
    WHERE sub.student_assignment_id = ?
    ORDER BY sub.attempt_number ASC
  `;

  return (await runner(sql, [studentAssignmentId])) || [];
}

/**
 * Retrieves attachments for a submission.
 */
export async function getAttachmentsBySubmissionId(submissionId, customQuery = null) {
  if (!submissionId) return [];
  const runner = customQuery || activeQuery;

  const sql = `
    SELECT
      sa.id,
      sa.submission_id,
      sa.original_filename,
      sa.mime_type,
      sa.file_size_bytes,
      sa.created_at
    FROM submission_attachments sa
    WHERE sa.submission_id = ?
  `;

  return (await runner(sql, [submissionId])) || [];
}

/**
 * Retrieves submission by ID with context.
 */
export async function getSubmissionById(submissionId, customQuery = null) {
  if (!submissionId) return null;
  const runner = customQuery || activeQuery;

  const sql = `
    SELECT
      sub.id,
      sub.student_assignment_id,
      sub.attempt_number,
      sub.submission_type,
      sub.text_response,
      sub.external_link,
      sub.is_late,
      sub.submitted_at,
      sa.assignment_id,
      sa.student_id,
      sa.status AS student_assignment_status,
      a.max_score,
      a.title AS assignment_title,
      u.full_name AS student_name,
      s.admission_number
    FROM submissions sub
    JOIN student_assignments sa ON sub.student_assignment_id = sa.id
    JOIN assignments a ON sa.assignment_id = a.id
    JOIN students s ON sa.student_id = s.id
    JOIN users u ON s.user_id = u.id
    WHERE sub.id = ?
    LIMIT 1
  `;

  const rows = await runner(sql, [submissionId]);
  return rows && rows.length > 0 ? rows[0] : null;
}

/**
 * Creates or updates an evaluation for a submission.
 */
export async function createOrUpdateEvaluation(evalData, customQuery = null) {
  const runner = customQuery || activeQuery;
  const sql = `
    INSERT INTO evaluations (
      id, submission_id, evaluated_by, score_awarded, grading_status, feedback, evaluated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      evaluated_by = VALUES(evaluated_by),
      score_awarded = VALUES(score_awarded),
      grading_status = VALUES(grading_status),
      feedback = VALUES(feedback),
      evaluated_at = VALUES(evaluated_at)
  `;

  await runner(sql, [
    evalData.id,
    evalData.submissionId,
    evalData.evaluatedBy,
    evalData.scoreAwarded !== undefined ? evalData.scoreAwarded : null,
    evalData.gradingStatus || 'evaluated',
    evalData.feedback,
    evalData.evaluatedAt || new Date(),
  ]);

  return evalData;
}

/**
 * Retrieves teacher view of submissions for an assignment.
 */
export async function getTeacherSubmissionsForAssignment(assignmentId, filters = {}, pagination = { page: 1, pageSize: 20 }, customQuery = null) {
  const runner = customQuery || activeQuery;
  const whereClauses = ['sa.assignment_id = ?'];
  const params = [assignmentId];

  if (filters.status) {
    whereClauses.push('sa.status = ?');
    params.push(filters.status);
  }

  const whereSql = `WHERE ${whereClauses.join(' AND ')}`;
  const offset = (pagination.page - 1) * pagination.pageSize;

  const sql = `
    SELECT
      sub.id AS submission_id,
      sub.attempt_number,
      sub.submission_type,
      sub.is_late,
      sub.submitted_at,
      sa.id AS student_assignment_id,
      sa.status AS student_assignment_status,
      sa.final_score,
      u.full_name AS student_name,
      s.admission_number,
      e.id AS evaluation_id,
      e.score_awarded,
      e.grading_status,
      e.feedback,
      e.evaluated_at
    FROM student_assignments sa
    JOIN students s ON sa.student_id = s.id
    JOIN users u ON s.user_id = u.id
    LEFT JOIN submissions sub ON sub.student_assignment_id = sa.id AND sub.attempt_number = sa.current_attempt
    LEFT JOIN evaluations e ON e.submission_id = sub.id
    ${whereSql}
    ORDER BY
      CASE WHEN sa.status = 'submitted' THEN 1 ELSE 2 END,
      sub.submitted_at DESC
    LIMIT ? OFFSET ?
  `;

  params.push(pagination.pageSize, offset);
  return (await runner(sql, params)) || [];
}

/**
 * Counts submissions for teacher assignment view.
 */
export async function countTeacherSubmissionsForAssignment(assignmentId, filters = {}, customQuery = null) {
  const runner = customQuery || activeQuery;
  const whereClauses = ['sa.assignment_id = ?'];
  const params = [assignmentId];

  if (filters.status) {
    whereClauses.push('sa.status = ?');
    params.push(filters.status);
  }

  const whereSql = `WHERE ${whereClauses.join(' AND ')}`;
  const sql = `SELECT COUNT(*) AS total FROM student_assignments sa ${whereSql}`;

  const rows = await runner(sql, params);
  return rows && rows.length > 0 ? Number(rows[0].total) : 0;
}

export default {
  setQueryRunner,
  resetQueryRunner,
  getStudentByUserId,
  getTeacherByUserId,
  listStudentAssignments,
  countStudentAssignments,
  getStudentAssignmentDetail,
  getStudentAssignmentById,
  createSubmission,
  createSubmissionAttachments,
  updateStudentAssignmentStatus,
  markStudentAssignmentOpened,
  getSubmissionsByStudentAssignmentId,
  getAttachmentsBySubmissionId,
  getSubmissionById,
  createOrUpdateEvaluation,
  getTeacherSubmissionsForAssignment,
  countTeacherSubmissionsForAssignment,
};
