import { findAcademicContextByUserId } from '../repositories/studentAcademicContextRepository.js';

/**
 * Formats a Date object or date string to YYYY-MM-DD.
 * @param {Date|string|null} dateVal 
 * @returns {string|null}
 */
function formatDate(dateVal) {
  if (!dateVal) return null;
  if (dateVal instanceof Date) {
    return dateVal.toISOString().split('T')[0];
  }
  return String(dateVal).split('T')[0];
}

/**
 * Retrieves the academic enrollment context for an authenticated student.
 *
 * @param {string} userId - Authenticated user UUID.
 * @param {Function} [customQuery] - Optional query runner for isolated testing.
 * @returns {Promise<Object|null>} Safe academic context or null if student not found.
 */
export async function getStudentAcademicContext(userId, customQuery) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const raw = await findAcademicContextByUserId(userId, customQuery);
  if (!raw) {
    return null;
  }

  const student = {
    id: raw.student_id,
    admissionNumber: raw.admission_number,
    name: raw.student_name,
    email: raw.student_email || null,
  };

  // If the student exists but has no active enrollment record
  if (!raw.enrollment_id) {
    return {
      student,
      enrollment: null,
    };
  }

  const enrollment = {
    id: raw.enrollment_id,
    enrollmentDate: formatDate(raw.enrollment_date),
    status: raw.enrollment_status,
    rollNumber: raw.roll_number || null,
    session: {
      id: raw.session_id,
      sessionCode: raw.session_code,
      displayName: raw.session_display_name,
      startDate: formatDate(raw.session_start_date),
      endDate: formatDate(raw.session_end_date),
      status: raw.session_status,
    },
    board: {
      id: raw.board_id,
      code: raw.board_code,
      name: raw.board_name,
      status: raw.board_status,
    },
    class: {
      id: raw.class_id,
      gradeNumber: Number(raw.class_grade_number),
      code: raw.class_code,
      displayName: raw.class_display_name,
      stage: raw.class_stage,
      status: raw.class_status,
    },
    program: {
      id: raw.program_id,
      code: raw.program_code,
      name: raw.program_name,
      targetStage: raw.program_target_stage,
      status: raw.program_status,
    },
    batch: raw.batch_id
      ? {
          id: raw.batch_id,
          code: raw.batch_code,
          name: raw.batch_name,
          scheduleDescription: raw.batch_schedule || null,
          status: raw.batch_status,
        }
      : null,
  };

  return {
    student,
    enrollment,
  };
}

export default {
  getStudentAcademicContext,
};
