import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import fs from 'fs';
import app from '../server/server.js';
import { generateAccessToken } from '../server/services/tokenService.js';
import studentAssignmentRepo from '../server/repositories/studentAssignmentRepository.js';

let server;
let baseUrl;

// Mock Student User for Testing
const mockStudentUser = {
  id: 'usr_stu_portal_01',
  role: 'student',
  identifier: 'AS26090',
  full_name: 'Rahul Sharma',
};

const mockTeacherUser = {
  id: 'usr_tch_portal_01',
  role: 'teacher',
  identifier: 'faculty@mstutorials.com',
  full_name: 'Dr. Vikram Seth',
};

const now = new Date();
const mockAssignmentData = {
  id: 'sa_portal_001',
  assignment_id: 'asgn_portal_001',
  student_id: 'stu_portal_01',
  status: 'assigned',
  first_opened_at: null,
  current_attempt: 0,
  final_score: null,
  is_completed: 0,
  created_at: now,
  updated_at: now,
  title: 'Quadratic Equations Practice Set 1',
  description: 'Solve questions 1 through 10 in your notebook.',
  assignment_type: 'homework',
  max_score: 50,
  available_from: new Date(Date.now() - 3600000),
  due_at: new Date(Date.now() + 86400000 * 7),
  close_at: new Date(Date.now() + 86400000 * 10),
  late_policy: 'grace_period',
  resubmission_policy: 'single',
  max_resubmissions: 1,
  assignment_master_status: 'published',
  author_name: 'Dr. Vikram Seth',
  subject_name: 'Mathematics',
  subject_code: 'MATH-10',
  class_name: 'Class 10',
  chapter_title: 'Quadratic Equations',
  chapter_number: 4,
  topic_title: 'Nature of Roots',
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

test('--- Phase 5.10E-C: Student Portal Assignment UI Integration Test Suite ---', async (t) => {
  let studentToken;

  t.beforeEach(async () => {
    studentToken = await generateAccessToken(mockStudentUser);
  });

  await t.test('1. Unauthenticated request to /api/v1/student/assignments returns 401', async () => {
    const res = await fetch(`${baseUrl}/api/v1/student/assignments`);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.ok(data.error);
  });

  await t.test('2. Teacher cannot access student assignment portal route -> 403', async () => {
    const teacherToken = await generateAccessToken(mockTeacherUser);
    const res = await fetch(`${baseUrl}/api/v1/student/assignments`, {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.ok(data.error);
  });

  await t.test('3. Authenticated student can query assignment queue with filters and pagination', async () => {
    // Mock repository methods
    const origGetStudent = studentAssignmentRepo.getStudentByUserId;
    const origList = studentAssignmentRepo.listStudentAssignments;
    const origCount = studentAssignmentRepo.countStudentAssignments;

    studentAssignmentRepo.getStudentByUserId = async () => ({ id: 'stu_portal_01' });
    studentAssignmentRepo.listStudentAssignments = async () => [mockAssignmentData];
    studentAssignmentRepo.countStudentAssignments = async () => 1;

    try {
      const res = await fetch(`${baseUrl}/api/v1/student/assignments?page=1&pageSize=10&status=assigned`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(Array.isArray(data.data.assignments), true);
      assert.equal(data.data.assignments.length, 1);
      assert.equal(data.data.assignments[0].title, 'Quadratic Equations Practice Set 1');
      assert.equal(data.pagination.page, 1);
      assert.equal(data.pagination.total, 1);
    } finally {
      studentAssignmentRepo.getStudentByUserId = origGetStudent;
      studentAssignmentRepo.listStudentAssignments = origList;
      studentAssignmentRepo.countStudentAssignments = origCount;
    }
  });

  await t.test('4. Empty assignment list returns empty collection with pagination', async () => {
    const origGetStudent = studentAssignmentRepo.getStudentByUserId;
    const origList = studentAssignmentRepo.listStudentAssignments;
    const origCount = studentAssignmentRepo.countStudentAssignments;

    studentAssignmentRepo.getStudentByUserId = async () => ({ id: 'stu_portal_01' });
    studentAssignmentRepo.listStudentAssignments = async () => [];
    studentAssignmentRepo.countStudentAssignments = async () => 0;

    try {
      const res = await fetch(`${baseUrl}/api/v1/student/assignments`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.assignments.length, 0);
      assert.equal(data.pagination.total, 0);
    } finally {
      studentAssignmentRepo.getStudentByUserId = origGetStudent;
      studentAssignmentRepo.listStudentAssignments = origList;
      studentAssignmentRepo.countStudentAssignments = origCount;
    }
  });

  await t.test('5. Non-existent assignment detail returns 404', async () => {
    const origGetStudent = studentAssignmentRepo.getStudentByUserId;
    const origDetail = studentAssignmentRepo.getStudentAssignmentDetail;

    studentAssignmentRepo.getStudentByUserId = async () => ({ id: 'stu_portal_01' });
    studentAssignmentRepo.getStudentAssignmentDetail = async () => null;

    try {
      const res = await fetch(`${baseUrl}/api/v1/student/assignments/non-existent-id`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      assert.equal(res.status, 404);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.error.code, 'NOT_FOUND');
    } finally {
      studentAssignmentRepo.getStudentByUserId = origGetStudent;
      studentAssignmentRepo.getStudentAssignmentDetail = origDetail;
    }
  });

  await t.test('6. Valid assignment detail returns instructions, deadlines, and submissions', async () => {
    const origGetStudent = studentAssignmentRepo.getStudentByUserId;
    const origDetail = studentAssignmentRepo.getStudentAssignmentDetail;
    const origOpened = studentAssignmentRepo.markStudentAssignmentOpened;
    const origSubmissions = studentAssignmentRepo.getSubmissionsByStudentAssignmentId;

    studentAssignmentRepo.getStudentByUserId = async () => ({ id: 'stu_portal_01' });
    studentAssignmentRepo.getStudentAssignmentDetail = async () => ({ ...mockAssignmentData });
    studentAssignmentRepo.markStudentAssignmentOpened = async () => {};
    studentAssignmentRepo.getSubmissionsByStudentAssignmentId = async () => [
      {
        id: 'sub_001',
        attempt_number: 1,
        submission_type: 'text',
        text_response: 'Step 1: x = (-b +- sqrt(D)) / 2a',
        is_late: 0,
        submitted_at: now,
        score_awarded: 45,
        grading_status: 'evaluated',
        feedback: 'Excellent working steps.',
        evaluator_name: 'Dr. Vikram Seth',
      },
    ];

    try {
      const res = await fetch(`${baseUrl}/api/v1/student/assignments/sa_portal_001`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.data.assignment.title, 'Quadratic Equations Practice Set 1');
      assert.equal(data.data.assignment.submissions.length, 1);
      assert.equal(data.data.assignment.submissions[0].score_awarded, 45);
      assert.equal(data.data.assignment.submissions[0].evaluator_name, 'Dr. Vikram Seth');
    } finally {
      studentAssignmentRepo.getStudentByUserId = origGetStudent;
      studentAssignmentRepo.getStudentAssignmentDetail = origDetail;
      studentAssignmentRepo.markStudentAssignmentOpened = origOpened;
      studentAssignmentRepo.getSubmissionsByStudentAssignmentId = origSubmissions;
    }
  });

  await t.test('7. Student submission attempt increments attempt number monotonically', async () => {
    const origGetStudent = studentAssignmentRepo.getStudentByUserId;
    const origDetail = studentAssignmentRepo.getStudentAssignmentDetail;
    const origSubmissions = studentAssignmentRepo.getSubmissionsByStudentAssignmentId;
    const origCreateSub = studentAssignmentRepo.createSubmission;
    const origUpdateStatus = studentAssignmentRepo.updateStudentAssignmentStatus;

    studentAssignmentRepo.getStudentByUserId = async () => ({ id: 'stu_portal_01' });
    studentAssignmentRepo.getStudentAssignmentDetail = async () => ({
      ...mockAssignmentData,
      status: 'assigned',
    });
    studentAssignmentRepo.getSubmissionsByStudentAssignmentId = async () => [];
    let savedSubmission = null;
    studentAssignmentRepo.createSubmission = async (sub) => {
      savedSubmission = sub;
      return sub;
    };
    studentAssignmentRepo.updateStudentAssignmentStatus = async () => {};

    try {
      const res = await fetch(`${baseUrl}/api/v1/student/assignments/sa_portal_001/submissions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${studentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionType: 'text',
          textResponse: 'Here is my complete solution.',
        }),
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(savedSubmission.attemptNumber, 1);
      assert.equal(savedSubmission.submissionType, 'text');
      assert.equal(data.data.submission.attemptNumber, 1);
    } finally {
      studentAssignmentRepo.getStudentByUserId = origGetStudent;
      studentAssignmentRepo.getStudentAssignmentDetail = origDetail;
      studentAssignmentRepo.getSubmissionsByStudentAssignmentId = origSubmissions;
      studentAssignmentRepo.createSubmission = origCreateSub;
      studentAssignmentRepo.updateStudentAssignmentStatus = origUpdateStatus;
    }
  });

  await t.test('8. UI Plan and components exist in repository', async () => {
    assert.equal(fs.existsSync('docs/student-assignment-ui-plan.md'), true);
    assert.equal(fs.existsSync('src/student/pages/StudentAssignments.jsx'), true);
    assert.equal(fs.existsSync('src/student/pages/StudentAssignmentDetail.jsx'), true);
  });

  await t.test('9. StudentSidebar contains active Assignments link without Soon badge', async () => {
    const sidebarContent = fs.readFileSync('src/student/components/StudentSidebar.jsx', 'utf-8');
    assert.match(sidebarContent, /id:\s*'assignments'/);
    assert.match(sidebarContent, /path:\s*'\/student\/assignments'/);
    // Must NOT have badge: 'Soon'
    assert.doesNotMatch(sidebarContent, /id:\s*'assignments',\s*label:\s*'Assignments',\s*path:\s*'\/student\/assignments',\s*icon:\s*FileCheck2,\s*badge:\s*'Soon'/);
  });

  await t.test('10. StudentPortalLayout mounts /student/assignments and detail routes', async () => {
    const layoutContent = fs.readFileSync('src/layouts/StudentPortalLayout.jsx', 'utf-8');
    assert.match(layoutContent, /import StudentAssignments from '\.\.\/student\/pages\/StudentAssignments\.jsx'/);
    assert.match(layoutContent, /import StudentAssignmentDetail from '\.\.\/student\/pages\/StudentAssignmentDetail\.jsx'/);
    assert.match(layoutContent, /if \(currentPath === '\/student\/assignments'\)/);
    assert.match(layoutContent, /if \(currentPath\.startsWith\('\/student\/assignments\/'\)\)/);
  });

  await t.test('11. StudentDashboard includes quick-access card to Assignments', async () => {
    const dashboardContent = fs.readFileSync('src/student/pages/StudentDashboard.jsx', 'utf-8');
    assert.match(dashboardContent, /title="Assignments & Practice"/);
    assert.match(dashboardContent, /\/student\/assignments/);
  });

  await t.test('12. studentService contains all assignment API methods', async () => {
    const serviceContent = fs.readFileSync('src/services/studentService.js', 'utf-8');
    assert.match(serviceContent, /getAssignments\(/);
    assert.match(serviceContent, /getAssignmentById\(/);
    assert.match(serviceContent, /submitAssignment\(/);
    assert.match(serviceContent, /getSubmissions\(/);
  });

  await t.test('13. Public website routes and student portal routes are mapped in App.jsx', async () => {
    const appContent = fs.readFileSync('src/App.jsx', 'utf-8');
    const publicRoutes = ["'/'", "''", "'/about'", "'/programs'", "'/learning-system'", "'/resources'", "'/contact'"];
    for (const route of publicRoutes) {
      assert.ok(appContent.includes(route), `Route ${route} should exist in App.jsx`);
    }
    assert.match(appContent, /currentPath === '\/student\/login'/);
    assert.match(appContent, /currentPath\.startsWith\('\/student'\)/);
  });
});
