import { query as defaultQuery } from '../config/database.js';

let activeQuery = defaultQuery;

export function setQueryRunner(customFn) {
  activeQuery = customFn || defaultQuery;
}

export function resetQueryRunner() {
  activeQuery = defaultQuery;
}

/**
 * Creates a new master assignment definition.
 */
export async function createAssignment(assignmentData, customQuery = null) {
  const runner = customQuery || activeQuery;
  const sql = `
    INSERT INTO assignments (
      id, curriculum_node_id, chapter_id, topic_id,
      title, description, assignment_type, max_score,
      available_from, due_at, close_at, late_policy,
      resubmission_policy, max_resubmissions, status, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    assignmentData.id,
    assignmentData.curriculumNodeId,
    assignmentData.chapterId || null,
    assignmentData.topicId || null,
    assignmentData.title,
    assignmentData.description,
    assignmentData.assignmentType || 'homework',
    assignmentData.maxScore !== undefined ? assignmentData.maxScore : null,
    assignmentData.availableFrom,
    assignmentData.dueAt,
    assignmentData.closeAt || null,
    assignmentData.latePolicy || 'reject',
    assignmentData.resubmissionPolicy || 'none',
    assignmentData.maxResubmissions || 0,
    assignmentData.status || 'draft',
    assignmentData.createdBy,
  ];

  await runner(sql, params);
  return assignmentData;
}

/**
 * Inserts one or more targeting rules for an assignment.
 */
export async function createAssignmentTargets(targets, customQuery = null) {
  if (!targets || targets.length === 0) return [];
  const runner = customQuery || activeQuery;

  for (const target of targets) {
    const sql = `
      INSERT INTO assignment_targets (
        id, assignment_id, target_type, target_id
      ) VALUES (?, ?, ?, ?)
    `;
    await runner(sql, [target.id, target.assignmentId, target.targetType, target.targetId]);
  }

  return targets;
}

/**
 * Retrieves an assignment by ID with author and curriculum details.
 */
export async function getAssignmentById(id, customQuery = null) {
  if (!id) return null;
  const runner = customQuery || activeQuery;

  const sql = `
    SELECT
      a.id,
      a.curriculum_node_id,
      a.chapter_id,
      a.topic_id,
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
      a.status,
      a.created_by,
      a.created_at,
      a.updated_at,
      u.full_name AS author_name,
      sub.name AS subject_name,
      sub.code AS subject_code,
      c.display_name AS class_name,
      b.code AS board_code,
      ch.title AS chapter_title,
      ch.chapter_number,
      t.title AS topic_title,
      t.topic_code
    FROM assignments a
    JOIN users u ON a.created_by = u.id
    JOIN curriculum_nodes cn ON a.curriculum_node_id = cn.id
    JOIN subjects sub ON cn.subject_id = sub.id
    JOIN classes c ON cn.class_id = c.id
    JOIN boards b ON cn.board_id = b.id
    LEFT JOIN chapters ch ON a.chapter_id = ch.id
    LEFT JOIN topics t ON a.topic_id = t.id
    WHERE a.id = ?
    LIMIT 1
  `;

  const rows = await runner(sql, [id]);
  return rows && rows.length > 0 ? rows[0] : null;
}

/**
 * Retrieves targets associated with an assignment.
 */
export async function getAssignmentTargets(assignmentId, customQuery = null) {
  if (!assignmentId) return [];
  const runner = customQuery || activeQuery;

  const sql = `
    SELECT
      at.id,
      at.assignment_id,
      at.target_type,
      at.target_id,
      at.created_at
    FROM assignment_targets at
    WHERE at.assignment_id = ?
  `;

  return (await runner(sql, [assignmentId])) || [];
}

/**
 * Lists assignments authored by a teacher or visible to admin.
 */
export async function listAssignments(filters = {}, pagination = { page: 1, pageSize: 20 }, customQuery = null) {
  const runner = customQuery || activeQuery;
  const whereClauses = [];
  const params = [];

  if (filters.createdBy) {
    whereClauses.push('a.created_by = ?');
    params.push(filters.createdBy);
  }

  if (filters.status) {
    whereClauses.push('a.status = ?');
    params.push(filters.status);
  }

  if (filters.curriculumNodeId) {
    whereClauses.push('a.curriculum_node_id = ?');
    params.push(filters.curriculumNodeId);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const offset = (pagination.page - 1) * pagination.pageSize;

  const sql = `
    SELECT
      a.id,
      a.curriculum_node_id,
      a.chapter_id,
      a.topic_id,
      a.title,
      a.assignment_type,
      a.max_score,
      a.available_from,
      a.due_at,
      a.close_at,
      a.late_policy,
      a.resubmission_policy,
      a.max_resubmissions,
      a.status,
      a.created_by,
      a.created_at,
      u.full_name AS author_name,
      sub.name AS subject_name,
      c.display_name AS class_name
    FROM assignments a
    JOIN users u ON a.created_by = u.id
    JOIN curriculum_nodes cn ON a.curriculum_node_id = cn.id
    JOIN subjects sub ON cn.subject_id = sub.id
    JOIN classes c ON cn.class_id = c.id
    ${whereSql}
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `;

  params.push(pagination.pageSize, offset);
  return (await runner(sql, params)) || [];
}

/**
 * Counts assignments for pagination.
 */
export async function countAssignments(filters = {}, customQuery = null) {
  const runner = customQuery || activeQuery;
  const whereClauses = [];
  const params = [];

  if (filters.createdBy) {
    whereClauses.push('a.created_by = ?');
    params.push(filters.createdBy);
  }

  if (filters.status) {
    whereClauses.push('a.status = ?');
    params.push(filters.status);
  }

  if (filters.curriculumNodeId) {
    whereClauses.push('a.curriculum_node_id = ?');
    params.push(filters.curriculumNodeId);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const sql = `SELECT COUNT(*) AS total FROM assignments a ${whereSql}`;

  const rows = await runner(sql, params);
  return rows && rows.length > 0 ? Number(rows[0].total) : 0;
}

/**
 * Updates assignment status (e.g. draft -> published, cancelled, archived).
 */
export async function updateAssignmentStatus(id, status, customQuery = null) {
  const runner = customQuery || activeQuery;
  const sql = `UPDATE assignments SET status = ? WHERE id = ?`;
  await runner(sql, [status, id]);
}

/**
 * Resolves active enrolled student IDs for given assignment targets.
 */
export async function getEligibleStudentsForTargets(targets, customQuery = null) {
  if (!targets || targets.length === 0) return [];
  const runner = customQuery || activeQuery;

  const studentIds = new Set();

  for (const target of targets) {
    if (target.target_type === 'batch') {
      const sql = `
        SELECT DISTINCT student_id
        FROM student_enrollments
        WHERE batch_id = ? AND status = 'active'
      `;
      const rows = await runner(sql, [target.target_id]);
      if (rows) {
        rows.forEach(r => studentIds.add(r.student_id));
      }
    } else if (target.target_type === 'class') {
      const sql = `
        SELECT DISTINCT student_id
        FROM student_enrollments
        WHERE class_id = ? AND status = 'active'
      `;
      const rows = await runner(sql, [target.target_id]);
      if (rows) {
        rows.forEach(r => studentIds.add(r.student_id));
      }
    } else if (target.target_type === 'student') {
      const sql = `
        SELECT DISTINCT student_id
        FROM student_enrollments
        WHERE student_id = ? AND status = 'active'
      `;
      const rows = await runner(sql, [target.target_id]);
      if (rows && rows.length > 0) {
        studentIds.add(target.target_id);
      }
    }
  }

  return Array.from(studentIds);
}

/**
 * Materializes student_assignments records for eligible students.
 */
export async function createStudentAssignmentsBatch(items, customQuery = null) {
  if (!items || items.length === 0) return [];
  const runner = customQuery || activeQuery;

  for (const item of items) {
    const sql = `
      INSERT INTO student_assignments (
        id, assignment_id, student_id, status
      ) VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP
    `;
    await runner(sql, [item.id, item.assignmentId, item.studentId, item.status || 'assigned']);
  }

  return items;
}

/**
 * Validates existence of curriculum node.
 */
export async function getCurriculumNodeById(id, customQuery = null) {
  if (!id) return null;
  const runner = customQuery || activeQuery;
  const sql = `
    SELECT id, session_id, board_id, class_id, subject_id, is_active
    FROM curriculum_nodes
    WHERE id = ?
    LIMIT 1
  `;
  const rows = await runner(sql, [id]);
  return rows && rows.length > 0 ? rows[0] : null;
}

/**
 * Validates chapter belonging to curriculum node.
 */
export async function getChapterById(id, curriculumNodeId, customQuery = null) {
  if (!id) return null;
  const runner = customQuery || activeQuery;
  const sql = `
    SELECT id, curriculum_node_id, chapter_number, title
    FROM chapters
    WHERE id = ? AND curriculum_node_id = ?
    LIMIT 1
  `;
  const rows = await runner(sql, [id, curriculumNodeId]);
  return rows && rows.length > 0 ? rows[0] : null;
}

/**
 * Validates topic belonging to chapter.
 */
export async function getTopicById(id, chapterId, customQuery = null) {
  if (!id) return null;
  const runner = customQuery || activeQuery;
  const sql = `
    SELECT id, chapter_id, topic_code, title
    FROM topics
    WHERE id = ? AND chapter_id = ?
    LIMIT 1
  `;
  const rows = await runner(sql, [id, chapterId]);
  return rows && rows.length > 0 ? rows[0] : null;
}

export default {
  setQueryRunner,
  resetQueryRunner,
  createAssignment,
  createAssignmentTargets,
  getAssignmentById,
  getAssignmentTargets,
  listAssignments,
  countAssignments,
  updateAssignmentStatus,
  getEligibleStudentsForTargets,
  createStudentAssignmentsBatch,
  getCurriculumNodeById,
  getChapterById,
  getTopicById,
};
