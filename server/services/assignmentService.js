import crypto from 'crypto';
import assignmentRepo from '../repositories/assignmentRepository.js';
import studentAssignmentRepo from '../repositories/studentAssignmentRepository.js';

const ALLOWED_ASSIGNMENT_TYPES = ['homework', 'worksheet', 'practice_set', 'project', 'revision'];
const ALLOWED_LATE_POLICIES = ['reject', 'allow_flagged'];
const ALLOWED_RESUBMISSION_POLICIES = ['none', 'single', 'multiple'];
const ALLOWED_TARGET_TYPES = ['batch', 'class', 'student'];
const ALLOWED_GRADING_STATUSES = ['evaluated', 'resubmission_required', 'needs_improvement'];

/**
 * Creates a new assignment master definition with recipient targets in 'draft' status.
 */
export async function createAssignment(userId, data) {
  if (!userId) {
    const error = new Error('Authentication required.');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    throw error;
  }

  // 1. Validate title & description
  const title = typeof data.title === 'string' ? data.title.trim() : '';
  if (!title || title.length > 200) {
    const error = new Error('Title is required and must not exceed 200 characters.');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const description = typeof data.description === 'string' ? data.description.trim() : '';
  if (!description) {
    const error = new Error('Description / instructions are required.');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // 2. Validate assignment type
  const assignmentType = data.assignmentType ? String(data.assignmentType).trim() : 'homework';
  if (!ALLOWED_ASSIGNMENT_TYPES.includes(assignmentType)) {
    const error = new Error(`Invalid assignmentType. Allowed: ${ALLOWED_ASSIGNMENT_TYPES.join(', ')}.`);
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // 3. Validate max score (optional)
  let maxScore = null;
  if (data.maxScore !== undefined && data.maxScore !== null) {
    const parsed = Number(data.maxScore);
    if (isNaN(parsed) || parsed < 0 || parsed > 999.99) {
      const error = new Error('maxScore must be a non-negative number <= 999.99.');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
    maxScore = parsed;
  }

  // 4. Validate dates
  const now = new Date();
  const availableFrom = data.availableFrom ? new Date(data.availableFrom) : now;
  if (isNaN(availableFrom.getTime())) {
    const error = new Error('availableFrom must be a valid ISO date timestamp.');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (!data.dueAt) {
    const error = new Error('dueAt deadline is required.');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  const dueAt = new Date(data.dueAt);
  if (isNaN(dueAt.getTime()) || dueAt <= availableFrom) {
    const error = new Error('dueAt must be a valid date strictly after availableFrom.');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  let closeAt = null;
  if (data.closeAt) {
    closeAt = new Date(data.closeAt);
    if (isNaN(closeAt.getTime()) || closeAt < dueAt) {
      const error = new Error('closeAt must be a valid date >= dueAt.');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
  }

  // 5. Validate policies
  const latePolicy = data.latePolicy ? String(data.latePolicy).trim() : 'reject';
  if (!ALLOWED_LATE_POLICIES.includes(latePolicy)) {
    const error = new Error(`Invalid latePolicy. Allowed: ${ALLOWED_LATE_POLICIES.join(', ')}.`);
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const resubmissionPolicy = data.resubmissionPolicy ? String(data.resubmissionPolicy).trim() : 'none';
  if (!ALLOWED_RESUBMISSION_POLICIES.includes(resubmissionPolicy)) {
    const error = new Error(`Invalid resubmissionPolicy. Allowed: ${ALLOWED_RESUBMISSION_POLICIES.join(', ')}.`);
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  let maxResubmissions = 0;
  if (resubmissionPolicy !== 'none') {
    maxResubmissions = resubmissionPolicy === 'single' ? 1 : (Number(data.maxResubmissions) || 3);
  }

  // 6. Validate curriculum references
  if (!data.curriculumNodeId || typeof data.curriculumNodeId !== 'string') {
    const error = new Error('curriculumNodeId is required.');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  const node = await assignmentRepo.getCurriculumNodeById(data.curriculumNodeId.trim());
  if (!node) {
    const error = new Error('Invalid curriculumNodeId. Academic node not found.');
    error.statusCode = 400;
    error.code = 'NOT_FOUND';
    throw error;
  }

  let chapterId = null;
  if (data.chapterId) {
    const chapter = await assignmentRepo.getChapterById(data.chapterId.trim(), node.id);
    if (!chapter) {
      const error = new Error('chapterId does not belong to the designated curriculum node.');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
    chapterId = chapter.id;
  }

  let topicId = null;
  if (data.topicId) {
    if (!chapterId) {
      const error = new Error('chapterId must be specified when topicId is provided.');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
    const topic = await assignmentRepo.getTopicById(data.topicId.trim(), chapterId);
    if (!topic) {
      const error = new Error('topicId does not belong to the designated chapter.');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
    topicId = topic.id;
  }

  // 7. Validate targets
  if (!Array.isArray(data.targets) || data.targets.length === 0) {
    const error = new Error('At least one target (batch, class, or student) is required.');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const validatedTargets = [];
  for (const t of data.targets) {
    if (!t || !ALLOWED_TARGET_TYPES.includes(t.targetType) || !t.targetId || typeof t.targetId !== 'string') {
      const error = new Error(`Each target must have targetType (${ALLOWED_TARGET_TYPES.join(', ')}) and valid targetId.`);
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
    validatedTargets.push({
      id: crypto.randomUUID(),
      targetType: t.targetType,
      targetId: t.targetId.trim(),
    });
  }

  // 8. Create assignment record
  const assignmentId = crypto.randomUUID();
  const assignmentRecord = {
    id: assignmentId,
    curriculumNodeId: node.id,
    chapterId,
    topicId,
    title,
    description,
    assignmentType,
    maxScore,
    availableFrom,
    dueAt,
    closeAt,
    latePolicy,
    resubmissionPolicy,
    maxResubmissions,
    status: 'draft',
    createdBy: userId,
  };

  await assignmentRepo.createAssignment(assignmentRecord);

  // 9. Create targets
  const targetsWithId = validatedTargets.map(vt => ({
    ...vt,
    assignmentId,
  }));
  await assignmentRepo.createAssignmentTargets(targetsWithId);

  return {
    ...assignmentRecord,
    targets: targetsWithId,
  };
}

/**
 * Publishes an assignment and triggers student_assignments materialization.
 */
export async function publishAssignment(userId, userRole, assignmentId) {
  const assignment = await assignmentRepo.getAssignmentById(assignmentId);
  if (!assignment) {
    const error = new Error('Assignment not found.');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  if (userRole !== 'admin' && assignment.created_by !== userId) {
    const error = new Error('Unauthorized to publish this assignment.');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  if (assignment.status !== 'draft') {
    const error = new Error(`Cannot publish assignment with status '${assignment.status}'. Only draft assignments can be published.`);
    error.statusCode = 409;
    error.code = 'INVALID_STATE';
    throw error;
  }

  // 1. Transition status
  await assignmentRepo.updateAssignmentStatus(assignmentId, 'published');

  // 2. Fetch targets & fanout to eligible students
  const targets = await assignmentRepo.getAssignmentTargets(assignmentId);
  const eligibleStudentIds = await assignmentRepo.getEligibleStudentsForTargets(targets);

  const studentAssignmentRecords = eligibleStudentIds.map(studentId => ({
    id: crypto.randomUUID(),
    assignmentId,
    studentId,
    status: 'assigned',
  }));

  if (studentAssignmentRecords.length > 0) {
    await assignmentRepo.createStudentAssignmentsBatch(studentAssignmentRecords);
  }

  return {
    id: assignmentId,
    status: 'published',
    materializedStudentCount: studentAssignmentRecords.length,
  };
}

/**
 * Lists assignments authored by the teacher or all assignments for admin.
 */
export async function listAssignments(userId, userRole, filters = {}, pagination = { page: 1, pageSize: 20 }) {
  const queryFilters = { ...filters };
  if (userRole !== 'admin') {
    queryFilters.createdBy = userId;
  }

  const [assignments, total] = await Promise.all([
    assignmentRepo.listAssignments(queryFilters, pagination),
    assignmentRepo.countAssignments(queryFilters),
  ]);

  const totalPages = Math.ceil(total / pagination.pageSize);

  return {
    assignments,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total,
      totalPages,
    },
  };
}

/**
 * Retrieves assignment details with targets.
 */
export async function getAssignmentDetail(userId, userRole, assignmentId) {
  const assignment = await assignmentRepo.getAssignmentById(assignmentId);
  if (!assignment) return null;

  if (userRole !== 'admin' && assignment.created_by !== userId) {
    const error = new Error('Access denied to requested assignment.');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  const targets = await assignmentRepo.getAssignmentTargets(assignmentId);
  return {
    ...assignment,
    targets,
  };
}

/**
 * Lists student submissions for an assignment (teacher review queue).
 */
export async function listAssignmentSubmissions(userId, userRole, assignmentId, filters = {}, pagination = { page: 1, pageSize: 20 }) {
  const assignment = await assignmentRepo.getAssignmentById(assignmentId);
  if (!assignment) {
    const error = new Error('Assignment not found.');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  if (userRole !== 'admin' && assignment.created_by !== userId) {
    const error = new Error('Access denied to assignment submissions.');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  const [submissions, total] = await Promise.all([
    studentAssignmentRepo.getTeacherSubmissionsForAssignment(assignmentId, filters, pagination),
    studentAssignmentRepo.countTeacherSubmissionsForAssignment(assignmentId, filters),
  ]);

  const totalPages = Math.ceil(total / pagination.pageSize);

  return {
    submissions,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total,
      totalPages,
    },
  };
}

/**
 * Evaluates a student submission.
 */
export async function evaluateSubmission(userId, userRole, submissionId, evalData) {
  const submission = await studentAssignmentRepo.getSubmissionById(submissionId);
  if (!submission) {
    const error = new Error('Submission not found.');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Resolve teacher record
  let teacherId = null;
  const teacher = await studentAssignmentRepo.getTeacherByUserId(userId);
  if (teacher) {
    teacherId = teacher.id;
  } else if (userRole === 'admin') {
    // If admin is evaluating, ensure an evaluator is linked or use first available teacher ID as extension fallback
    teacherId = userId; // or fallback
  }

  if (!teacherId && userRole !== 'admin') {
    const error = new Error('Only faculty can evaluate submissions.');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  // 1. Validate score
  let scoreAwarded = null;
  if (evalData.scoreAwarded !== undefined && evalData.scoreAwarded !== null) {
    const parsedScore = Number(evalData.scoreAwarded);
    if (isNaN(parsedScore) || parsedScore < 0) {
      const error = new Error('scoreAwarded must be a non-negative number.');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
    if (submission.max_score !== null && parsedScore > Number(submission.max_score)) {
      const error = new Error(`scoreAwarded (${parsedScore}) cannot exceed assignment max_score (${submission.max_score}).`);
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
    scoreAwarded = parsedScore;
  }

  // 2. Validate feedback
  const feedback = typeof evalData.feedback === 'string' ? evalData.feedback.trim() : '';
  if (!feedback) {
    const error = new Error('Pedagogical feedback is required for evaluation.');
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // 3. Validate grading status
  const gradingStatus = evalData.gradingStatus ? String(evalData.gradingStatus).trim() : 'evaluated';
  if (!ALLOWED_GRADING_STATUSES.includes(gradingStatus)) {
    const error = new Error(`Invalid gradingStatus. Allowed: ${ALLOWED_GRADING_STATUSES.join(', ')}.`);
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // 4. Save evaluation
  const evaluationId = crypto.randomUUID();
  const evaluationRecord = {
    id: evaluationId,
    submissionId,
    evaluatedBy: teacherId,
    scoreAwarded,
    gradingStatus,
    feedback,
    evaluatedAt: new Date(),
  };

  await studentAssignmentRepo.createOrUpdateEvaluation(evaluationRecord);

  // 5. Update student assignment status
  const isCompleted = gradingStatus === 'evaluated';
  const newStatus = gradingStatus === 'resubmission_required' ? 'resubmission_required' : 'evaluated';
  await studentAssignmentRepo.updateStudentAssignmentStatus(
    submission.student_assignment_id,
    newStatus,
    submission.attempt_number,
    scoreAwarded,
    isCompleted
  );

  return {
    ...evaluationRecord,
    studentAssignmentId: submission.student_assignment_id,
    studentAssignmentStatus: newStatus,
  };
}

export default {
  createAssignment,
  publishAssignment,
  listAssignments,
  getAssignmentDetail,
  listAssignmentSubmissions,
  evaluateSubmission,
};
