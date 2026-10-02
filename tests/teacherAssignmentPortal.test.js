import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import fs from 'fs';
import app from '../server/server.js';
import { generateAccessToken } from '../server/services/tokenService.js';
import assignmentRepo from '../server/repositories/assignmentRepository.js';
import studentAssignmentRepo from '../server/repositories/studentAssignmentRepository.js';

let server;
let baseUrl;

// Mock Identities
const mockTeacherUserA = {
  id: 'usr_tch_portal_01',
  role: 'teacher',
  identifier: 'faculty1@mstutorials.com',
  full_name: 'Dr. Vikram Seth',
};

const mockTeacherUserB = {
  id: 'usr_tch_portal_02',
  role: 'teacher',
  identifier: 'faculty2@mstutorials.com',
  full_name: 'Prof. Ananya Rao',
};

const mockStudentUser = {
  id: 'usr_stu_portal_01',
  role: 'student',
  identifier: 'AS26090',
  full_name: 'Rahul Sharma',
};

const mockSuperAdminUser = {
  id: 'usr_adm_super_01',
  role: 'admin',
  identifier: 'superadmin@mstutorials.com',
  full_name: 'Director Gupta',
};

const now = new Date();
const mockAssignmentRecord = {
  id: 'asgn_tch_test_01',
  title: 'Calculus Practice Sheet 1',
  description: 'Complete integrals from 1 to 15.',
  assignment_type: 'practice',
  max_score: 50,
  available_from: new Date(Date.now() - 3600000),
  due_at: new Date(Date.now() + 86400000 * 7),
  close_at: new Date(Date.now() + 86400000 * 10),
  late_policy: 'grace_period',
  resubmission_policy: 'single',
  max_resubmissions: 1,
  status: 'draft',
  created_by: 'usr_tch_portal_01',
  curriculum_node_id: 'cnode_test_01',
  chapter_id: 'chap_test_01',
  topic_id: 'top_test_01',
  subject_name: 'Mathematics',
  class_name: 'Class 12',
};

test.before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('--- Phase 5.10E-D: Teacher Assignment & Evaluation Management UI Test Suite ---', async (t) => {
  let teacherTokenA;
  let teacherTokenB;
  let studentToken;

  t.beforeEach(async () => {
    teacherTokenA = await generateAccessToken(mockTeacherUserA);
    teacherTokenB = await generateAccessToken(mockTeacherUserB);
    studentToken = await generateAccessToken(mockStudentUser);
  });

  await t.test('1. Teacher assignment route: accessible with valid teacher token', async () => {
    const origList = assignmentRepo.listAssignments;
    const origCount = assignmentRepo.countAssignments;
    assignmentRepo.listAssignments = async () => [mockAssignmentRecord];
    assignmentRepo.countAssignments = async () => 1;

    try {
      const res = await fetch(`${baseUrl}/api/v1/assignments`, {
        headers: { Authorization: `Bearer ${teacherTokenA}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.assignments.length, 1);
    } finally {
      assignmentRepo.listAssignments = origList;
      assignmentRepo.countAssignments = origCount;
    }
  });

  await t.test('2. Unauthenticated access to /api/v1/assignments returns 401', async () => {
    const res = await fetch(`${baseUrl}/api/v1/assignments`);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.ok(data.error);
  });

  await t.test('3. Non-teacher role (student) receives 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/v1/assignments`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.ok(data.error);
  });

  await t.test('4. Assignment list returns authored assignments with pagination', async () => {
    const origList = assignmentRepo.listAssignments;
    const origCount = assignmentRepo.countAssignments;
    assignmentRepo.listAssignments = async () => [mockAssignmentRecord];
    assignmentRepo.countAssignments = async () => 1;

    try {
      const res = await fetch(`${baseUrl}/api/v1/assignments?page=1&pageSize=10`, {
        headers: { Authorization: `Bearer ${teacherTokenA}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.pagination.page, 1);
      assert.equal(data.pagination.pageSize, 10);
      assert.equal(data.pagination.total, 1);
    } finally {
      assignmentRepo.listAssignments = origList;
      assignmentRepo.countAssignments = origCount;
    }
  });

  await t.test('5. Empty assignment list returns empty collection', async () => {
    const origList = assignmentRepo.listAssignments;
    const origCount = assignmentRepo.countAssignments;
    assignmentRepo.listAssignments = async () => [];
    assignmentRepo.countAssignments = async () => 0;

    try {
      const res = await fetch(`${baseUrl}/api/v1/assignments`, {
        headers: { Authorization: `Bearer ${teacherTokenA}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.data.assignments.length, 0);
      assert.equal(data.pagination.total, 0);
    } finally {
      assignmentRepo.listAssignments = origList;
      assignmentRepo.countAssignments = origCount;
    }
  });

  await t.test('6. Assignment filters by status and curriculumNodeId pass to repository', async () => {
    let capturedFilters = null;
    const origList = assignmentRepo.listAssignments;
    const origCount = assignmentRepo.countAssignments;
    assignmentRepo.listAssignments = async (filters) => {
      capturedFilters = filters;
      return [];
    };
    assignmentRepo.countAssignments = async () => 0;

    try {
      await fetch(`${baseUrl}/api/v1/assignments?status=draft&curriculumNodeId=node-abc`, {
        headers: { Authorization: `Bearer ${teacherTokenA}` },
      });
      assert.equal(capturedFilters.status, 'draft');
      assert.equal(capturedFilters.curriculumNodeId, 'node-abc');
      assert.equal(capturedFilters.createdBy, 'usr_tch_portal_01');
    } finally {
      assignmentRepo.listAssignments = origList;
      assignmentRepo.countAssignments = origCount;
    }
  });

  await t.test('7. Create assignment validation: missing required title returns 400', async () => {
    const res = await fetch(`${baseUrl}/api/v1/assignments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${teacherTokenA}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'Solve questions',
        curriculumNodeId: 'node-1',
      }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.error.code, 'VALIDATION_ERROR');
  });

  await t.test('8. Temporal validation: dueAt <= availableFrom returns 400', async () => {
    const res = await fetch(`${baseUrl}/api/v1/assignments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${teacherTokenA}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Title',
        description: 'Desc',
        curriculumNodeId: 'node-1',
        availableFrom: new Date(Date.now() + 100000).toISOString(),
        dueAt: new Date(Date.now() + 50000).toISOString(),
      }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.error.code, 'VALIDATION_ERROR');
  });

  await t.test('9. Save draft: valid assignment definition creates draft master record', async () => {
    const origGetNode = assignmentRepo.getCurriculumNodeById;
    const origCreateAsgn = assignmentRepo.createAssignment;
    const origCreateTargets = assignmentRepo.createAssignmentTargets;

    assignmentRepo.getCurriculumNodeById = async () => ({ id: 'cnode_valid' });
    assignmentRepo.createAssignment = async (rec) => rec;
    assignmentRepo.createAssignmentTargets = async (targets) => targets;

    try {
      const res = await fetch(`${baseUrl}/api/v1/assignments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${teacherTokenA}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Vectors and 3D Geometry',
          description: 'Solve all miscellaneous exercise questions.',
          assignmentType: 'homework',
          maxScore: 40,
          curriculumNodeId: 'cnode_valid',
          availableFrom: new Date(Date.now() - 1000).toISOString(),
          dueAt: new Date(Date.now() + 86400000 * 5).toISOString(),
          targets: [{ targetType: 'class', targetId: 'cls_12' }],
        }),
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.assignment.title, 'Vectors and 3D Geometry');
      assert.equal(data.data.assignment.status, 'draft');
      assert.equal(data.data.assignment.targets.length, 1);
    } finally {
      assignmentRepo.getCurriculumNodeById = origGetNode;
      assignmentRepo.createAssignment = origCreateAsgn;
      assignmentRepo.createAssignmentTargets = origCreateTargets;
    }
  });

  await t.test('10. Publish validation: non-existent assignment returns 404', async () => {
    const origGet = assignmentRepo.getAssignmentById;
    assignmentRepo.getAssignmentById = async () => null;

    try {
      const res = await fetch(`${baseUrl}/api/v1/assignments/non-existent-id/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherTokenA}` },
      });
      assert.equal(res.status, 404);
      const data = await res.json();
      assert.equal(data.error.code, 'NOT_FOUND');
    } finally {
      assignmentRepo.getAssignmentById = origGet;
    }
  });

  await t.test('11. Publish success: transitions to published and materializes student instances', async () => {
    const origGet = assignmentRepo.getAssignmentById;
    const origUpdateStatus = assignmentRepo.updateAssignmentStatus;
    const origGetTargets = assignmentRepo.getAssignmentTargets;
    const origGetEligible = assignmentRepo.getEligibleStudentsForTargets;
    const origCreateBatch = assignmentRepo.createStudentAssignmentsBatch;

    assignmentRepo.getAssignmentById = async () => ({
      id: 'asgn_draft_01',
      status: 'draft',
      created_by: 'usr_tch_portal_01',
    });
    assignmentRepo.updateAssignmentStatus = async () => {};
    assignmentRepo.getAssignmentTargets = async () => [{ id: 't1', target_type: 'class', target_id: 'cls_12' }];
    assignmentRepo.getEligibleStudentsForTargets = async () => ['stu_1', 'stu_2'];
    assignmentRepo.createStudentAssignmentsBatch = async () => {};

    try {
      const res = await fetch(`${baseUrl}/api/v1/assignments/asgn_draft_01/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherTokenA}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.data.assignment.status, 'published');
      assert.equal(data.data.assignment.materializedStudentCount, 2);
    } finally {
      assignmentRepo.getAssignmentById = origGet;
      assignmentRepo.updateAssignmentStatus = origUpdateStatus;
      assignmentRepo.getAssignmentTargets = origGetTargets;
      assignmentRepo.getEligibleStudentsForTargets = origGetEligible;
      assignmentRepo.createStudentAssignmentsBatch = origCreateBatch;
    }
  });

  await t.test('12. Assignment detail returns master record with targets', async () => {
    const origGet = assignmentRepo.getAssignmentById;
    const origTargets = assignmentRepo.getAssignmentTargets;

    assignmentRepo.getAssignmentById = async () => ({ ...mockAssignmentRecord });
    assignmentRepo.getAssignmentTargets = async () => [
      { id: 'tgt_1', assignment_id: 'asgn_tch_test_01', target_type: 'class', target_id: 'cls_12' },
    ];

    try {
      const res = await fetch(`${baseUrl}/api/v1/assignments/asgn_tch_test_01`, {
        headers: { Authorization: `Bearer ${teacherTokenA}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.data.assignment.title, 'Calculus Practice Sheet 1');
      assert.equal(data.data.assignment.targets.length, 1);
    } finally {
      assignmentRepo.getAssignmentById = origGet;
      assignmentRepo.getAssignmentTargets = origTargets;
    }
  });

  await t.test('13. Submission inbox: lists student submissions for assignment', async () => {
    const origGet = assignmentRepo.getAssignmentById;
    const origSubmissions = studentAssignmentRepo.getTeacherSubmissionsForAssignment;
    const origCount = studentAssignmentRepo.countTeacherSubmissionsForAssignment;

    assignmentRepo.getAssignmentById = async () => ({
      id: 'asgn_tch_test_01',
      created_by: 'usr_tch_portal_01',
    });
    studentAssignmentRepo.getTeacherSubmissionsForAssignment = async () => [
      {
        submission_id: 'sub_001',
        attempt_number: 1,
        submission_type: 'text',
        is_late: 0,
        submitted_at: now,
        student_assignment_id: 'sa_001',
        student_assignment_status: 'submitted',
        student_name: 'Rahul Sharma',
        admission_number: 'AS26090',
      },
    ];
    studentAssignmentRepo.countTeacherSubmissionsForAssignment = async () => 1;

    try {
      const res = await fetch(`${baseUrl}/api/v1/assignments/asgn_tch_test_01/submissions`, {
        headers: { Authorization: `Bearer ${teacherTokenA}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.data.submissions.length, 1);
      assert.equal(data.data.submissions[0].student_name, 'Rahul Sharma');
    } finally {
      assignmentRepo.getAssignmentById = origGet;
      studentAssignmentRepo.getTeacherSubmissionsForAssignment = origSubmissions;
      studentAssignmentRepo.countTeacherSubmissionsForAssignment = origCount;
    }
  });

  await t.test('14. Submission detail review retrieves student submission metadata', async () => {
    const origSub = studentAssignmentRepo.getSubmissionById;
    studentAssignmentRepo.getSubmissionById = async () => ({
      id: 'sub_001',
      student_assignment_id: 'sa_001',
      attempt_number: 1,
      submission_type: 'text',
      text_response: 'Integrals working...',
      assignment_id: 'asgn_tch_test_01',
      max_score: 50,
      student_name: 'Rahul Sharma',
      admission_number: 'AS26090',
    });

    try {
      const sub = await studentAssignmentRepo.getSubmissionById('sub_001');
      assert.equal(sub.id, 'sub_001');
      assert.equal(sub.attempt_number, 1);
      assert.equal(sub.student_name, 'Rahul Sharma');
    } finally {
      studentAssignmentRepo.getSubmissionById = origSub;
    }
  });

  await t.test('15. Evaluation: score awarded must be non-negative', async () => {
    const origSub = studentAssignmentRepo.getSubmissionById;
    const origAsgn = assignmentRepo.getAssignmentById;
    const origTeacher = studentAssignmentRepo.getTeacherByUserId;

    studentAssignmentRepo.getSubmissionById = async () => ({
      id: 'sub_001',
      assignment_id: 'asgn_tch_test_01',
      max_score: 50,
      student_assignment_id: 'sa_001',
    });
    assignmentRepo.getAssignmentById = async () => ({
      id: 'asgn_tch_test_01',
      created_by: 'usr_tch_portal_01',
    });
    studentAssignmentRepo.getTeacherByUserId = async () => ({ id: 'tch_rec_01' });

    try {
      const res = await fetch(`${baseUrl}/api/v1/assignments/submissions/sub_001/evaluate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${teacherTokenA}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scoreAwarded: -5,
          feedback: 'Negative marks not allowed',
          gradingStatus: 'evaluated',
        }),
      });
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.error.code, 'VALIDATION_ERROR');
    } finally {
      studentAssignmentRepo.getSubmissionById = origSub;
      assignmentRepo.getAssignmentById = origAsgn;
      studentAssignmentRepo.getTeacherByUserId = origTeacher;
    }
  });

  await t.test('16. Marks validation: score exceeding maxScore is rejected with 400', async () => {
    const origSub = studentAssignmentRepo.getSubmissionById;
    const origAsgn = assignmentRepo.getAssignmentById;
    const origTeacher = studentAssignmentRepo.getTeacherByUserId;

    studentAssignmentRepo.getSubmissionById = async () => ({
      id: 'sub_001',
      assignment_id: 'asgn_tch_test_01',
      max_score: 50,
      student_assignment_id: 'sa_001',
    });
    assignmentRepo.getAssignmentById = async () => ({
      id: 'asgn_tch_test_01',
      created_by: 'usr_tch_portal_01',
    });
    studentAssignmentRepo.getTeacherByUserId = async () => ({ id: 'tch_rec_01' });

    try {
      const res = await fetch(`${baseUrl}/api/v1/assignments/submissions/sub_001/evaluate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${teacherTokenA}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scoreAwarded: 55,
          feedback: 'Too high score',
          gradingStatus: 'evaluated',
        }),
      });
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.error.code, 'VALIDATION_ERROR');
    } finally {
      studentAssignmentRepo.getSubmissionById = origSub;
      assignmentRepo.getAssignmentById = origAsgn;
      studentAssignmentRepo.getTeacherByUserId = origTeacher;
    }
  });

  await t.test('17. Feedback required validation: empty feedback rejected with 400', async () => {
    const origSub = studentAssignmentRepo.getSubmissionById;
    const origAsgn = assignmentRepo.getAssignmentById;
    const origTeacher = studentAssignmentRepo.getTeacherByUserId;

    studentAssignmentRepo.getSubmissionById = async () => ({
      id: 'sub_001',
      assignment_id: 'asgn_tch_test_01',
      max_score: 50,
      student_assignment_id: 'sa_001',
    });
    assignmentRepo.getAssignmentById = async () => ({
      id: 'asgn_tch_test_01',
      created_by: 'usr_tch_portal_01',
    });
    studentAssignmentRepo.getTeacherByUserId = async () => ({ id: 'tch_rec_01' });

    try {
      const res = await fetch(`${baseUrl}/api/v1/assignments/submissions/sub_001/evaluate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${teacherTokenA}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scoreAwarded: 40,
          feedback: '   ',
          gradingStatus: 'evaluated',
        }),
      });
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.error.code, 'VALIDATION_ERROR');
    } finally {
      studentAssignmentRepo.getSubmissionById = origSub;
      assignmentRepo.getAssignmentById = origAsgn;
      studentAssignmentRepo.getTeacherByUserId = origTeacher;
    }
  });

  await t.test('18. Resubmission request: sets gradingStatus and updates student assignment', async () => {
    const origSub = studentAssignmentRepo.getSubmissionById;
    const origAsgn = assignmentRepo.getAssignmentById;
    const origTeacher = studentAssignmentRepo.getTeacherByUserId;
    const origEval = studentAssignmentRepo.createOrUpdateEvaluation;
    const origUpdateStatus = studentAssignmentRepo.updateStudentAssignmentStatus;

    studentAssignmentRepo.getSubmissionById = async () => ({
      id: 'sub_001',
      assignment_id: 'asgn_tch_test_01',
      max_score: 50,
      student_assignment_id: 'sa_001',
      attempt_number: 1,
    });
    assignmentRepo.getAssignmentById = async () => ({
      id: 'asgn_tch_test_01',
      created_by: 'usr_tch_portal_01',
    });
    studentAssignmentRepo.getTeacherByUserId = async () => ({ id: 'tch_rec_01' });
    studentAssignmentRepo.createOrUpdateEvaluation = async () => {};

    let recordedNewStatus = null;
    studentAssignmentRepo.updateStudentAssignmentStatus = async (saId, newStatus) => {
      recordedNewStatus = newStatus;
    };

    try {
      const res = await fetch(`${baseUrl}/api/v1/assignments/submissions/sub_001/evaluate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${teacherTokenA}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scoreAwarded: 20,
          feedback: 'Please recheck Question 5 substitution step and resubmit.',
          gradingStatus: 'resubmission_requested',
        }),
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.data.evaluation.gradingStatus, 'resubmission_requested');
      assert.equal(recordedNewStatus, 'resubmission_requested');
    } finally {
      studentAssignmentRepo.getSubmissionById = origSub;
      assignmentRepo.getAssignmentById = origAsgn;
      studentAssignmentRepo.getTeacherByUserId = origTeacher;
      studentAssignmentRepo.createOrUpdateEvaluation = origEval;
      studentAssignmentRepo.updateStudentAssignmentStatus = origUpdateStatus;
    }
  });

  await t.test('19. Evaluation status evaluated marks student assignment completed', async () => {
    const origSub = studentAssignmentRepo.getSubmissionById;
    const origAsgn = assignmentRepo.getAssignmentById;
    const origTeacher = studentAssignmentRepo.getTeacherByUserId;
    const origEval = studentAssignmentRepo.createOrUpdateEvaluation;
    const origUpdateStatus = studentAssignmentRepo.updateStudentAssignmentStatus;

    studentAssignmentRepo.getSubmissionById = async () => ({
      id: 'sub_001',
      assignment_id: 'asgn_tch_test_01',
      max_score: 50,
      student_assignment_id: 'sa_001',
      attempt_number: 1,
    });
    assignmentRepo.getAssignmentById = async () => ({
      id: 'asgn_tch_test_01',
      created_by: 'usr_tch_portal_01',
    });
    studentAssignmentRepo.getTeacherByUserId = async () => ({ id: 'tch_rec_01' });
    studentAssignmentRepo.createOrUpdateEvaluation = async () => {};

    let isCompletedFlag = null;
    studentAssignmentRepo.updateStudentAssignmentStatus = async (saId, newStatus, attempt, score, isCompleted) => {
      isCompletedFlag = isCompleted;
    };

    try {
      const res = await fetch(`${baseUrl}/api/v1/assignments/submissions/sub_001/evaluate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${teacherTokenA}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scoreAwarded: 48,
          feedback: 'Flawless mathematical formulation.',
          gradingStatus: 'evaluated',
        }),
      });
      assert.equal(res.status, 200);
      assert.equal(isCompletedFlag, true);
    } finally {
      studentAssignmentRepo.getSubmissionById = origSub;
      assignmentRepo.getAssignmentById = origAsgn;
      studentAssignmentRepo.getTeacherByUserId = origTeacher;
      studentAssignmentRepo.createOrUpdateEvaluation = origEval;
      studentAssignmentRepo.updateStudentAssignmentStatus = origUpdateStatus;
    }
  });

  await t.test('20. Teacher authorization boundary: unauthorized teacher cannot evaluate another teacher’s assignment (403)', async () => {
    const origSub = studentAssignmentRepo.getSubmissionById;
    const origAsgn = assignmentRepo.getAssignmentById;
    const origTeacher = studentAssignmentRepo.getTeacherByUserId;

    studentAssignmentRepo.getSubmissionById = async () => ({
      id: 'sub_001',
      assignment_id: 'asgn_tch_test_01',
      max_score: 50,
      student_assignment_id: 'sa_001',
    });
    // Created by Teacher A, but request is sent by Teacher B
    assignmentRepo.getAssignmentById = async () => ({
      id: 'asgn_tch_test_01',
      created_by: 'usr_tch_portal_01',
    });
    studentAssignmentRepo.getTeacherByUserId = async () => ({ id: 'tch_rec_02' });

    try {
      const res = await fetch(`${baseUrl}/api/v1/assignments/submissions/sub_001/evaluate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${teacherTokenB}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scoreAwarded: 45,
          feedback: 'Teacher B trying to grade',
          gradingStatus: 'evaluated',
        }),
      });
      assert.equal(res.status, 403);
      const data = await res.json();
      assert.equal(data.error.code, 'FORBIDDEN');
    } finally {
      studentAssignmentRepo.getSubmissionById = origSub;
      assignmentRepo.getAssignmentById = origAsgn;
      studentAssignmentRepo.getTeacherByUserId = origTeacher;
    }
  });

  await t.test('21. UI implementation and components exist on disk', () => {
    assert.ok(fs.existsSync('src/services/teacherService.js'));
    assert.ok(fs.existsSync('src/teacher/pages/TeacherAssignments.jsx'));
    assert.ok(fs.existsSync('src/teacher/pages/TeacherAssignmentCreate.jsx'));
    assert.ok(fs.existsSync('src/teacher/pages/TeacherAssignmentDetail.jsx'));
    assert.ok(fs.existsSync('src/teacher/pages/TeacherAssignmentSubmissions.jsx'));
    assert.ok(fs.existsSync('src/teacher/pages/TeacherSubmissionDetail.jsx'));
    assert.ok(fs.existsSync('src/teacher/components/TeacherHeader.jsx'));
    assert.ok(fs.existsSync('src/teacher/components/TeacherProtectedRoute.jsx'));
    assert.ok(fs.existsSync('src/layouts/TeacherPortalLayout.jsx'));
    assert.ok(fs.existsSync('src/styles/teacher-portal.css'));
    assert.ok(fs.existsSync('docs/teacher-assignment-ui-plan.md'));
  });

  await t.test('22. Public website routes remain functional', () => {
    const appSource = fs.readFileSync('src/App.jsx', 'utf-8');
    assert.ok(appSource.includes("currentPath === '/'"));
    assert.ok(appSource.includes("currentPath === '/about'"));
    assert.ok(appSource.includes("currentPath === '/programs'"));
    assert.ok(appSource.includes("currentPath === '/learning-system'"));
    assert.ok(appSource.includes("currentPath === '/resources'"));
    assert.ok(appSource.includes("currentPath === '/contact'"));
  });

  await t.test('23. Student portal routes remain functional without regression', () => {
    const appSource = fs.readFileSync('src/App.jsx', 'utf-8');
    assert.ok(appSource.includes("currentPath === '/student/login'"));
    assert.ok(appSource.includes("currentPath.startsWith('/student')"));
    assert.ok(appSource.includes('<StudentPortalLayout'));

    const studentLayout = fs.readFileSync('src/layouts/StudentPortalLayout.jsx', 'utf-8');
    assert.ok(studentLayout.includes('/student/assignments'));
    assert.ok(studentLayout.includes('StudentAssignments'));
    assert.ok(studentLayout.includes('StudentAssignmentDetail'));
  });
});
