import crypto from 'crypto';
import studentAssignmentRepo from '../repositories/studentAssignmentRepository.js';

const ALLOWED_SUBMISSION_TYPES = ['text', 'file_upload', 'external_link', 'hybrid'];

/**
 * Lists assignments for the authenticated student with status filters and pagination.
 */
export async function getStudentAssignments(userId, filters = {}, pagination = { page: 1, pageSize: 20 }) {
  const student = await studentAssignmentRepo.getStudentByUserId(userId);
  if (!student) return null;

  const [assignments, total] = await Promise.all([
    studentAssignmentRepo.listStudentAssignments(student.id, filters, pagination),
    studentAssignmentRepo.countStudentAssignments(student.id, filters),
  ]);

  const now = new Date();
  const enrichedAssignments = assignments.map(a => {
    let displayStatus = a.status;
    const dueAt = new Date(a.due_at);
    if (['assigned', 'in_progress'].includes(a.status) && now > dueAt) {
      displayStatus = 'overdue';
    }
    return {
      ...a,
      display_status: displayStatus,
    };
  });

  const totalPages = Math.ceil(total / pagination.pageSize);

  return {
    assignments: enrichedAssignments,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total,
      totalPages,
    },
  };
}

/**
 * Retrieves comprehensive detail of a student's personal assignment instance.
 * Guarantees that the assignment belongs strictly to the authenticated student.
 */
export async function getStudentAssignmentDetail(userId, studentAssignmentId) {
  const student = await studentAssignmentRepo.getStudentByUserId(userId);
  if (!student) return null;

  const detail = await studentAssignmentRepo.getStudentAssignmentDetail(studentAssignmentId, student.id);
  if (!detail) return null;

  // Mark as opened if not already opened
  if (!detail.first_opened_at) {
    await studentAssignmentRepo.markStudentAssignmentOpened(studentAssignmentId);
  }

  // Fetch submission history
  const submissions = await studentAssignmentRepo.getSubmissionsByStudentAssignmentId(studentAssignmentId);

  // Derive display status
  const now = new Date();
  let displayStatus = detail.status;
  const dueAt = new Date(detail.due_at);
  if (['assigned', 'in_progress'].includes(detail.status) && now > dueAt) {
    displayStatus = 'overdue';
  }

  return {
    ...detail,
    display_status: displayStatus,
    submissions,
  };
}

/**
 * Creates a student submission attempt with validation of policies and attempts.
 */
export async function submitAssignment(userId, studentAssignmentId, submissionData) {
  const student = await studentAssignmentRepo.getStudentByUserId(userId);
  if (!student) {
    const error = new Error('Student account not found.');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  const assignment = await studentAssignmentRepo.getStudentAssignmentDetail(studentAssignmentId, student.id);
  if (!assignment) {
    const error = new Error('Assignment not found.');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  if (assignment.assignment_master_status !== 'published') {
    const error = new Error('Assignment is not open for submission.');
    error.statusCode = 400;
    error.code = 'ASSIGNMENT_NOT_OPEN';
    throw error;
  }

  // 1. Check window & deadlines
  const now = new Date();
  const availableFrom = new Date(assignment.available_from);
  if (now < availableFrom) {
    const error = new Error('Assignment is not yet available for submission.');
    error.statusCode = 400;
    error.code = 'NOT_YET_AVAILABLE';
    throw error;
  }

  const dueAt = new Date(assignment.due_at);
  const isLate = now > dueAt;

  if (isLate) {
    const latePolicy = assignment.late_policy || 'reject_late';
    if (latePolicy === 'reject_late' || latePolicy === 'reject') {
      const error = new Error('Assignment deadline has passed. Late submissions are not accepted.');
      error.statusCode = 400;
      error.code = 'DEADLINE_PASSED';
      throw error;
    }
    if (latePolicy === 'grace_period') {
      if (assignment.close_at) {
        const closeAt = new Date(assignment.close_at);
        if (now > closeAt) {
          const error = new Error('Grace period has expired. Submissions are now closed.');
          error.statusCode = 400;
          error.code = 'GRACE_PERIOD_EXPIRED';
          throw error;
        }
      }
    } else if (latePolicy === 'allow_late' || latePolicy === 'allow_flagged') {
      if (assignment.close_at) {
        const closeAt = new Date(assignment.close_at);
        if (now > closeAt) {
          const error = new Error('Assignment submission cut-off window has closed.');
          error.statusCode = 400;
          error.code = 'SUBMISSION_CLOSED';
          throw error;
        }
      }
    }
  }

  // 2. Check submission attempts & resubmission policy
  const existingSubmissions = await studentAssignmentRepo.getSubmissionsByStudentAssignmentId(studentAssignmentId);
  const attemptCount = existingSubmissions.length;

  if (attemptCount > 0) {
    if (assignment.status !== 'resubmission_requested') {
      const error = new Error('Assignment has already been submitted and is awaiting evaluation or completed.');
      error.statusCode = 400;
      error.code = 'ALREADY_SUBMITTED';
      throw error;
    }

    if (assignment.resubmission_policy === 'none') {
      const error = new Error('Resubmissions are not permitted for this assignment.');
      error.statusCode = 400;
      error.code = 'RESUBMISSION_DISALLOWED';
      throw error;
    }

    if (assignment.resubmission_policy === 'single' && attemptCount >= 2) {
      const error = new Error('Maximum submission attempts (2) reached.');
      error.statusCode = 400;
      error.code = 'MAX_ATTEMPTS_REACHED';
      throw error;
    }

    if (assignment.resubmission_policy === 'multiple' && attemptCount >= (assignment.max_resubmissions + 1)) {
      const error = new Error(`Maximum submission attempts (${assignment.max_resubmissions + 1}) reached.`);
      error.statusCode = 400;
      error.code = 'MAX_ATTEMPTS_REACHED';
      throw error;
    }
  }

  // 3. Validate submission payload
  const submissionType = submissionData.submissionType ? String(submissionData.submissionType).trim() : 'text';
  if (!ALLOWED_SUBMISSION_TYPES.includes(submissionType)) {
    const error = new Error(`Invalid submissionType. Allowed: ${ALLOWED_SUBMISSION_TYPES.join(', ')}.`);
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const textResponse = typeof submissionData.textResponse === 'string' ? submissionData.textResponse.trim() : null;
  const externalLink = typeof submissionData.externalLink === 'string' ? submissionData.externalLink.trim() : null;

  if (['text', 'hybrid'].includes(submissionType) && !textResponse) {
    const error = new Error('textResponse is required for this submission type.');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (submissionType === 'external_link' && !externalLink) {
    const error = new Error('externalLink is required for external link submissions.');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // 4. Create submission attempt (monotonically sequential attempt numbering: 1 -> 2 -> 3 ...)
  const submissionId = crypto.randomUUID();
  const attemptNumber = attemptCount + 1;

  const submissionRecord = {
    id: submissionId,
    studentAssignmentId,
    attemptNumber,
    submissionType,
    textResponse,
    externalLink,
    isLate,
    submittedAt: now,
  };

  await studentAssignmentRepo.createSubmission(submissionRecord);

  // 5. Save attachment metadata if provided
  if (Array.isArray(submissionData.attachments) && submissionData.attachments.length > 0) {
    const attachmentRecords = submissionData.attachments.map(att => ({
      id: crypto.randomUUID(),
      submissionId,
      storagePath: String(att.storagePath || '').trim(),
      originalFilename: String(att.originalFilename || 'document').trim(),
      mimeType: String(att.mimeType || 'application/octet-stream').trim(),
      fileSizeBytes: Number(att.fileSizeBytes) || 0,
    }));
    await studentAssignmentRepo.createSubmissionAttachments(attachmentRecords);
  }

  // 6. Update student_assignments status (submitted on 1st attempt, resubmitted on subsequent attempts)
  const nextStatus = attemptNumber > 1 ? 'resubmitted' : 'submitted';
  await studentAssignmentRepo.updateStudentAssignmentStatus(
    studentAssignmentId,
    nextStatus,
    attemptNumber,
    null,
    false
  );

  return {
    ...submissionRecord,
    studentAssignmentStatus: nextStatus,
  };
}

/**
 * Retrieves submission history for a student assignment.
 */
export async function getStudentSubmissions(userId, studentAssignmentId) {
  const student = await studentAssignmentRepo.getStudentByUserId(userId);
  if (!student) return null;

  const assignment = await studentAssignmentRepo.getStudentAssignmentDetail(studentAssignmentId, student.id);
  if (!assignment) return null;

  return await studentAssignmentRepo.getSubmissionsByStudentAssignmentId(studentAssignmentId);
}

export default {
  getStudentAssignments,
  getStudentAssignmentDetail,
  submitAssignment,
  getStudentSubmissions,
};
