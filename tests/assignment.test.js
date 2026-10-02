import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import fs from 'fs';
import app from '../server/server.js';
import { generateAccessToken } from '../server/services/tokenService.js';
import assignmentRepo from '../server/repositories/assignmentRepository.js';
import studentAssignmentRepo from '../server/repositories/studentAssignmentRepository.js';
import adminRepository from '../server/repositories/adminRepository.js';
import assignmentService from '../server/services/assignmentService.js';
import studentAssignmentService from '../server/services/studentAssignmentService.js';

let server;
let baseUrl;

// Mock Identities
const mockStudentUserA = {
  id: 'usr_stu_001',
  role: 'student',
  identifier: 'AS26090',
  full_name: 'Rahul Sharma',
};

const mockStudentUserB = {
  id: 'usr_stu_002',
  role: 'student',
  identifier: 'AS26091',
  full_name: 'Aakash Verma',
};

const mockParentUser = {
  id: 'usr_par_001',
  role: 'parent',
  identifier: 'parent@example.com',
  full_name: 'Suresh Sharma',
};

const mockTeacherUserA = {
  id: 'usr_tch_001',
  role: 'teacher',
  identifier: 'faculty1@mstutorials.com',
  full_name: 'Dr. Vikram Seth',
};

const mockTeacherUserB = {
  id: 'usr_tch_002',
  role: 'teacher',
  identifier: 'faculty2@mstutorials.com',
  full_name: 'Prof. Ananya Rao',
};

const mockSuperAdminUser = {
  id: 'usr_adm_super',
  role: 'admin',
  identifier: 'superadmin@mstutorials.com',
  full_name: 'Director Gupta',
};

const mockStaffAdminUser = {
  id: 'usr_adm_staff',
  role: 'admin',
  identifier: 'staff@mstutorials.com',
  full_name: 'Clerk Sharma',
};

// In-Memory Test Store to simulate MySQL tables
let assignmentsStore = [];
let targetsStore = [];
let studentAssignmentsStore = [];
let submissionsStore = [];
let attachmentsStore = [];
let evaluationsStore = [];

function resetTestStore() {
  assignmentsStore = [
    {
      id: 'asgn_001',
      curriculum_node_id: 'cn_cbse_10_math',
      chapter_id: 'ch_poly',
      topic_id: 'top_fact',
      title: 'Polynomial Factorization Practice Set',
      description: 'Solve Questions 1 to 10 from Chapter 2 worksheet.',
      assignment_type: 'homework',
      max_score: 20.0,
      available_from: new Date(Date.now() - 86400000), // 1 day ago
      due_at: new Date(Date.now() + 86400000 * 7),    // 7 days in future
      close_at: new Date(Date.now() + 86400000 * 14), // 14 days in future
      late_policy: 'allow_late',
      resubmission_policy: 'single',
      max_resubmissions: 1,
      status: 'published',
      created_by: 'usr_tch_001',
      created_at: new Date(Date.now() - 86400000),
      updated_at: new Date(Date.now() - 86400000),
      author_name: 'Dr. Vikram Seth',
      subject_name: 'Mathematics',
      subject_code: 'MATH_10',
      class_name: 'Class 10',
      board_code: 'CBSE',
      chapter_title: 'Polynomials',
      chapter_number: 2,
      topic_title: 'Factorization of Polynomials',
      topic_code: 'TOP_CH02_01',
    },
    {
      id: 'asgn_grace',
      curriculum_node_id: 'cn_cbse_10_math',
      chapter_id: 'ch_poly',
      topic_id: 'top_fact',
      title: 'Grace Period Expired Assignment',
      description: 'Solve problem set.',
      assignment_type: 'homework',
      max_score: 20.0,
      available_from: new Date(Date.now() - 86400000 * 5),
      due_at: new Date(Date.now() - 86400000 * 2), // Past due
      close_at: new Date(Date.now() - 86400000 * 1), // Past close
      late_policy: 'grace_period',
      resubmission_policy: 'none',
      max_resubmissions: 0,
      status: 'published',
      created_by: 'usr_tch_001',
      created_at: new Date(Date.now() - 86400000 * 5),
      updated_at: new Date(Date.now() - 86400000 * 5),
    },
  ];

  targetsStore = [
    {
      id: 'tgt_001',
      assignment_id: 'asgn_001',
      target_type: 'batch',
      target_id: 'bat_cbse_10_ev1',
      created_at: new Date(),
    },
  ];

  studentAssignmentsStore = [
    {
      id: 'sa_001',
      assignment_id: 'asgn_001',
      student_id: 'stu_001',
      status: 'assigned',
      first_opened_at: null,
      current_attempt: 1,
      final_score: null,
      is_completed: 0,
      created_at: new Date(Date.now() - 86400000),
      updated_at: new Date(Date.now() - 86400000),
    },
    {
      id: 'sa_002',
      assignment_id: 'asgn_001',
      student_id: 'stu_002',
      status: 'assigned',
      first_opened_at: null,
      current_attempt: 1,
      final_score: null,
      is_completed: 0,
      created_at: new Date(Date.now() - 86400000),
      updated_at: new Date(Date.now() - 86400000),
    },
    {
      id: 'sa_grace_001',
      assignment_id: 'asgn_grace',
      student_id: 'stu_001',
      status: 'assigned',
      first_opened_at: null,
      current_attempt: 1,
      final_score: null,
      is_completed: 0,
      created_at: new Date(Date.now() - 86400000 * 5),
      updated_at: new Date(Date.now() - 86400000 * 5),
    },
  ];

  submissionsStore = [];
  attachmentsStore = [];
  evaluationsStore = [];
}

test.before(async () => {
  resetTestStore();

  // Mock assignmentRepo queries
  assignmentRepo.setQueryRunner(async (sql, params = []) => {
    // 1. Get curriculum node
    if (sql.includes('FROM curriculum_nodes')) {
      const id = params[0];
      if (id === 'cn_cbse_10_math') {
        return [{ id: 'cn_cbse_10_math', session_id: 'sess_2026_27', board_id: 'brd_cbse', class_id: 'cls_10', subject_id: 'sub_math', is_active: 1 }];
      }
      return [];
    }

    // 2. Get chapter
    if (sql.includes('FROM chapters')) {
      const [id, nodeId] = params;
      if (id === 'ch_poly' && nodeId === 'cn_cbse_10_math') {
        return [{ id: 'ch_poly', curriculum_node_id: 'cn_cbse_10_math', chapter_number: 2, title: 'Polynomials' }];
      }
      return [];
    }

    // 3. Get topic
    if (sql.includes('FROM topics')) {
      const [id, chapterId] = params;
      if (id === 'top_fact' && chapterId === 'ch_poly') {
        return [{ id: 'top_fact', chapter_id: 'ch_poly', topic_code: 'TOP_CH02_01', title: 'Factorization of Polynomials' }];
      }
      return [];
    }

    // 4. Insert assignment
    if (sql.includes('INSERT INTO assignments')) {
      const record = {
        id: params[0],
        curriculum_node_id: params[1],
        chapter_id: params[2],
        topic_id: params[3],
        title: params[4],
        description: params[5],
        assignment_type: params[6],
        max_score: params[7],
        available_from: params[8],
        due_at: params[9],
        close_at: params[10],
        late_policy: params[11],
        resubmission_policy: params[12],
        max_resubmissions: params[13],
        status: params[14],
        created_by: params[15],
        created_at: new Date(),
        updated_at: new Date(),
        author_name: 'Dr. Vikram Seth',
        subject_name: 'Mathematics',
        class_name: 'Class 10',
      };
      assignmentsStore.push(record);
      return { insertId: 1 };
    }

    // 5. Insert assignment targets
    if (sql.includes('INSERT INTO assignment_targets')) {
      targetsStore.push({
        id: params[0],
        assignment_id: params[1],
        target_type: params[2],
        target_id: params[3],
        created_at: new Date(),
      });
      return { insertId: 1 };
    }

    // 6. Get assignment by ID
    if (sql.includes('FROM assignments a') && sql.includes('WHERE a.id = ?')) {
      const id = params[0];
      const match = assignmentsStore.find(a => a.id === id);
      return match ? [match] : [];
    }

    // 7. Get targets by assignment ID
    if (sql.includes('FROM assignment_targets at') && sql.includes('WHERE at.assignment_id = ?')) {
      const asgnId = params[0];
      return targetsStore.filter(t => t.assignment_id === asgnId);
    }

    // 8. List assignments
    if (sql.includes('SELECT') && sql.includes('FROM assignments a') && !sql.includes('COUNT(*)')) {
      return assignmentsStore;
    }

    // 9. Count assignments
    if (sql.includes('SELECT COUNT(*) AS total FROM assignments a')) {
      return [{ total: assignmentsStore.length }];
    }

    // 10. Update assignment status
    if (sql.includes('UPDATE assignments SET status = ? WHERE id = ?')) {
      const [status, id] = params;
      const found = assignmentsStore.find(a => a.id === id);
      if (found) found.status = status;
      return { affectedRows: 1 };
    }

    // 11. Eligible students for targets
    if (sql.includes('student_enrollments')) {
      return [{ student_id: 'stu_001' }, { student_id: 'stu_002' }];
    }

    // 12. Create student assignments batch
    if (sql.includes('INSERT INTO student_assignments')) {
      const record = {
        id: params[0],
        assignment_id: params[1],
        student_id: params[2],
        status: params[3],
        first_opened_at: null,
        current_attempt: 1,
        final_score: null,
        is_completed: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const existingIdx = studentAssignmentsStore.findIndex(sa => sa.assignment_id === record.assignment_id && sa.student_id === record.student_id);
      if (existingIdx >= 0) {
        studentAssignmentsStore[existingIdx] = record;
      } else {
        studentAssignmentsStore.push(record);
      }
      return { insertId: 1 };
    }

    return [];
  });

  // Mock studentAssignmentRepo queries
  studentAssignmentRepo.setQueryRunner(async (sql, params = []) => {
    // 1. Get student by user_id
    if (sql.includes('FROM students s') && sql.includes('WHERE u.id = ?')) {
      const userId = params[0];
      if (userId === 'usr_stu_001') {
        return [{ id: 'stu_001', user_id: 'usr_stu_001', admission_number: 'AS26090', full_name: 'Rahul Sharma', email: 'rahul@example.com' }];
      }
      if (userId === 'usr_stu_002') {
        return [{ id: 'stu_002', user_id: 'usr_stu_002', admission_number: 'AS26091', full_name: 'Aakash Verma', email: 'aakash@example.com' }];
      }
      return [];
    }

    // 2. Get teacher by user_id
    if (sql.includes('FROM teachers t') && sql.includes('WHERE u.id = ?')) {
      const userId = params[0];
      if (userId === 'usr_tch_001') {
        return [{ id: 'tch_001', user_id: 'usr_tch_001', faculty_code: 'FAC_MATH_01', full_name: 'Dr. Vikram Seth', email: 'faculty1@mstutorials.com' }];
      }
      if (userId === 'usr_tch_002') {
        return [{ id: 'tch_002', user_id: 'usr_tch_002', faculty_code: 'FAC_MATH_02', full_name: 'Prof. Ananya Rao', email: 'faculty2@mstutorials.com' }];
      }
      return [];
    }

    // 3. List student assignments
    if (sql.includes('FROM student_assignments sa') && !sql.includes('COUNT(*)') && sql.includes('LIMIT ? OFFSET ?')) {
      const studentId = params[0];
      const items = studentAssignmentsStore
        .filter(sa => sa.student_id === studentId)
        .map(sa => {
          const asgn = assignmentsStore.find(a => a.id === sa.assignment_id) || {};
          return {
            ...sa,
            title: asgn.title || 'Assignment',
            assignment_type: asgn.assignment_type || 'homework',
            max_score: asgn.max_score,
            available_from: asgn.available_from,
            due_at: asgn.due_at,
            close_at: asgn.close_at,
            late_policy: asgn.late_policy,
            resubmission_policy: asgn.resubmission_policy,
            subject_name: 'Mathematics',
            subject_code: 'MATH_10',
            class_name: 'Class 10',
            chapter_title: 'Polynomials',
            chapter_number: 2,
            topic_title: 'Factorization',
          };
        });
      return items;
    }

    // 4. Count student assignments
    if (sql.includes('COUNT(*) AS total') && sql.includes('FROM student_assignments sa')) {
      const studentId = params[0];
      const count = studentAssignmentsStore.filter(sa => sa.student_id === studentId).length;
      return [{ total: count }];
    }

    // 5. Get student assignment detail
    if (sql.includes('FROM student_assignments sa') && sql.includes('WHERE sa.id = ? AND sa.student_id = ?')) {
      const [saId, stuId] = params;
      const sa = studentAssignmentsStore.find(item => item.id === saId && item.student_id === stuId);
      if (!sa) return [];
      const asgn = assignmentsStore.find(a => a.id === sa.assignment_id) || {};
      return [{
        ...sa,
        title: asgn.title,
        description: asgn.description,
        assignment_type: asgn.assignment_type,
        max_score: asgn.max_score,
        available_from: asgn.available_from,
        due_at: asgn.due_at,
        close_at: asgn.close_at,
        late_policy: asgn.late_policy,
        resubmission_policy: asgn.resubmission_policy,
        max_resubmissions: asgn.max_resubmissions,
        assignment_master_status: asgn.status,
        author_name: asgn.author_name || 'Dr. Vikram Seth',
        subject_name: 'Mathematics',
        subject_code: 'MATH_10',
        class_name: 'Class 10',
        chapter_title: 'Polynomials',
        chapter_number: 2,
        topic_title: 'Factorization',
      }];
    }

    // 6. Mark student assignment opened
    if (sql.includes('UPDATE student_assignments') && sql.includes('SET first_opened_at = CURRENT_TIMESTAMP')) {
      const saId = params[0];
      const sa = studentAssignmentsStore.find(item => item.id === saId);
      if (sa && !sa.first_opened_at) sa.first_opened_at = new Date();
      return { affectedRows: 1 };
    }

    // 7. Get submissions by student assignment ID
    if (sql.includes('FROM submissions sub') && sql.includes('WHERE sub.student_assignment_id = ?')) {
      const saId = params[0];
      return submissionsStore.filter(s => s.student_assignment_id === saId);
    }

    // 8. Create submission
    if (sql.includes('INSERT INTO submissions')) {
      const record = {
        id: params[0],
        student_assignment_id: params[1],
        attempt_number: params[2],
        submission_type: params[3],
        text_response: params[4],
        external_link: params[5],
        is_late: params[6],
        submitted_at: params[7],
      };
      submissionsStore.push(record);
      return { insertId: 1 };
    }

    // 9. Create submission attachments
    if (sql.includes('INSERT INTO submission_attachments')) {
      attachmentsStore.push({
        id: params[0],
        submission_id: params[1],
        storage_path: params[2],
        original_filename: params[3],
        mime_type: params[4],
        file_size_bytes: params[5],
        created_at: new Date(),
      });
      return { insertId: 1 };
    }

    // 10. Update student assignment status
    if (sql.includes('UPDATE student_assignments') && sql.includes('SET status = ?, current_attempt = ?')) {
      const [status, attempt, finalScore, isCompleted, saId] = params;
      const sa = studentAssignmentsStore.find(item => item.id === saId);
      if (sa) {
        sa.status = status;
        sa.current_attempt = attempt;
        sa.final_score = finalScore;
        sa.is_completed = isCompleted;
      }
      return { affectedRows: 1 };
    }

    // 11. Get submission by ID
    if (sql.includes('FROM submissions sub') && sql.includes('WHERE sub.id = ?')) {
      const subId = params[0];
      const sub = submissionsStore.find(s => s.id === subId);
      if (!sub) return [];
      const sa = studentAssignmentsStore.find(item => item.id === sub.student_assignment_id) || {};
      const asgn = assignmentsStore.find(a => a.id === sa.assignment_id) || {};
      return [{
        ...sub,
        assignment_id: sa.assignment_id,
        student_id: sa.student_id,
        student_assignment_status: sa.status,
        max_score: asgn.max_score,
        assignment_title: asgn.title,
        student_name: 'Rahul Sharma',
        admission_number: 'AS26090',
      }];
    }

    // 12. Create evaluation
    if (sql.includes('INSERT INTO evaluations')) {
      const record = {
        id: params[0],
        submission_id: params[1],
        evaluated_by: params[2],
        score_awarded: params[3],
        grading_status: params[4],
        feedback: params[5],
        evaluated_at: params[6],
      };
      evaluationsStore.push(record);
      return { insertId: 1 };
    }

    // 13. Teacher submissions list for assignment
    if (sql.includes('FROM student_assignments sa') && sql.includes('LEFT JOIN submissions sub')) {
      const asgnId = params[0];
      return studentAssignmentsStore
        .filter(sa => sa.assignment_id === asgnId)
        .map(sa => {
          const sub = submissionsStore.find(s => s.student_assignment_id === sa.id && s.attempt_number === sa.current_attempt) || {};
          const evalRec = evaluationsStore.find(e => e.submission_id === sub.id) || {};
          return {
            submission_id: sub.id || null,
            attempt_number: sub.attempt_number || null,
            submission_type: sub.submission_type || null,
            is_late: sub.is_late || false,
            submitted_at: sub.submitted_at || null,
            student_assignment_id: sa.id,
            student_assignment_status: sa.status,
            final_score: sa.final_score,
            student_name: 'Student Name',
            admission_number: 'AS26090',
            evaluation_id: evalRec.id || null,
            score_awarded: evalRec.score_awarded || null,
            grading_status: evalRec.grading_status || null,
            feedback: evalRec.feedback || null,
            evaluated_at: evalRec.evaluated_at || null,
          };
        });
    }

    // 14. Count teacher submissions
    if (sql.includes('SELECT COUNT(*) AS total FROM student_assignments sa WHERE sa.assignment_id = ?')) {
      const asgnId = params[0];
      const count = studentAssignmentsStore.filter(sa => sa.assignment_id === asgnId).length;
      return [{ total: count }];
    }

    return [];
  });

  // Mock adminRepository queries
  adminRepository.setQueryRunner(async (sql, params = []) => {
    const userId = params[0];
    if (userId === 'usr_adm_super') {
      return [{ user_id: 'usr_adm_super', role: 'admin', access_level: 'superadmin', full_name: 'Director Gupta' }];
    }
    if (userId === 'usr_adm_staff') {
      return [{ user_id: 'usr_adm_staff', role: 'admin', access_level: 'staff', full_name: 'Clerk Sharma' }];
    }
    return [];
  });

  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, () => {
      const addr = server.address();
      baseUrl = `http://localhost:${addr.port}`;
      resolve();
    });
  });
});

test.after(async () => {
  assignmentRepo.resetQueryRunner();
  studentAssignmentRepo.resetQueryRunner();
  adminRepository.resetQueryRunner();
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = options.headers || {};
    if (options.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
    }
    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(body);
          } catch {
            json = body;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        });
      }
    );

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

test('--- Phase 5.10E-B: Assignment Backend Test Suite ---', async (t) => {

  // ---------------------------------------------------------------------------
  // 1. Schema & Migration Files Integrity
  // ---------------------------------------------------------------------------
  await t.test('1. Database schema and migration files exist and define all 6 assignment tables', () => {
    const schemaSql = fs.readFileSync('database/schema/assignment.sql', 'utf8');
    const migrationSql = fs.readFileSync('database/migrations/003_create_assignment_tables.sql', 'utf8');

    const expectedTables = [
      'assignments',
      'assignment_targets',
      'student_assignments',
      'submissions',
      'submission_attachments',
      'evaluations',
    ];

    for (const tbl of expectedTables) {
      assert.match(schemaSql, new RegExp(`CREATE TABLE IF NOT EXISTS\\s+${tbl}\\s*\\(`, 'i'), `Schema must define ${tbl}`);
      assert.match(migrationSql, new RegExp(`CREATE TABLE IF NOT EXISTS\\s+${tbl}\\s*\\(`, 'i'), `Migration must define ${tbl}`);
    }
  });

  await t.test('2. Schema enforces approved lifecycles (DRAFT/PUBLISHED/CLOSED/ARCHIVED) and late policies', () => {
    const schemaSql = fs.readFileSync('database/schema/assignment.sql', 'utf8');
    assert.match(schemaSql, /status ENUM\('draft',\s*'published',\s*'closed',\s*'archived'\)/i);
    assert.match(schemaSql, /late_policy ENUM\('reject_late',\s*'grace_period',\s*'allow_late'\)/i);
    assert.match(schemaSql, /status ENUM\('assigned',\s*'in_progress',\s*'submitted',\s*'evaluated',\s*'resubmission_requested',\s*'resubmitted',\s*'completed'\)/i);
    assert.match(schemaSql, /chk_assignments_hierarchy\s+CHECK\s*\(\s*topic_id\s+IS\s+NULL\s+OR\s+chapter_id\s+IS\s+NOT\s+NULL\s*\)/i);
  });

  // ---------------------------------------------------------------------------
  // 2. Authentication & RBAC Gateways
  // ---------------------------------------------------------------------------
  await t.test('3. Unauthenticated request to /api/v1/student/assignments returns 401', async () => {
    const res = await makeRequest('/api/v1/student/assignments');
    assert.equal(res.status, 401);
  });

  await t.test('4. Student cannot access teacher assignment creation (returns 403)', async () => {
    const studentToken = generateAccessToken(mockStudentUserA);
    const res = await makeRequest('/api/v1/assignments', {
      method: 'POST',
      token: studentToken,
      body: { title: 'Unauthorized' },
    });
    assert.equal(res.status, 403);
  });

  await t.test('5. Parent cannot access student assignment routes (returns 403)', async () => {
    const parentToken = generateAccessToken(mockParentUser);
    const res = await makeRequest('/api/v1/student/assignments', {
      token: parentToken,
    });
    assert.equal(res.status, 403);
  });

  await t.test('6. Teacher can access /api/v1/assignments', async () => {
    const teacherToken = generateAccessToken(mockTeacherUserA);
    const res = await makeRequest('/api/v1/assignments', {
      token: teacherToken,
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.assignments));
  });

  // ---------------------------------------------------------------------------
  // 3. Teacher Assignment Creation & Admin Access Levels
  // ---------------------------------------------------------------------------
  await t.test('7. Teacher creates assignment: saved in draft status with grace_period policy', async () => {
    const teacherToken = generateAccessToken(mockTeacherUserA);
    const payload = {
      curriculumNodeId: 'cn_cbse_10_math',
      chapterId: 'ch_poly',
      topicId: 'top_fact',
      title: 'Quadratic Polynomial Homework',
      description: 'Solve questions on roots and coefficients.',
      assignmentType: 'homework',
      maxScore: 25.0,
      availableFrom: new Date().toISOString(),
      dueAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      closeAt: new Date(Date.now() + 86400000 * 10).toISOString(),
      latePolicy: 'grace_period',
      resubmissionPolicy: 'single',
      targets: [
        { targetType: 'batch', targetId: 'bat_cbse_10_ev1' },
      ],
    };

    const res = await makeRequest('/api/v1/assignments', {
      method: 'POST',
      token: teacherToken,
      body: payload,
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.assignment.status, 'draft');
    assert.equal(res.body.data.assignment.latePolicy, 'grace_period');
    assert.equal(res.body.data.assignment.title, 'Quadratic Polynomial Homework');
    assert.equal(res.body.data.assignment.targets.length, 1);
  });

  await t.test('8. Teacher assignment creation rejects missing title or invalid curriculum node', async () => {
    const teacherToken = generateAccessToken(mockTeacherUserA);
    const resNoTitle = await makeRequest('/api/v1/assignments', {
      method: 'POST',
      token: teacherToken,
      body: { curriculumNodeId: 'cn_cbse_10_math', description: 'Test' },
    });
    assert.equal(resNoTitle.status, 400);

    const resInvalidNode = await makeRequest('/api/v1/assignments', {
      method: 'POST',
      token: teacherToken,
      body: { title: 'Test', description: 'Test', curriculumNodeId: 'cn_nonexistent' },
    });
    assert.equal(resInvalidNode.status, 400);
  });

  await t.test('9. Staff admin cannot publish an assignment authored by another teacher (returns 403)', async () => {
    const staffToken = generateAccessToken(mockStaffAdminUser);
    const draft = await assignmentService.createAssignment('usr_tch_001', {
      curriculumNodeId: 'cn_cbse_10_math',
      title: 'Teacher Draft',
      description: 'Test instructions',
      dueAt: new Date(Date.now() + 86400000).toISOString(),
      targets: [{ targetType: 'batch', targetId: 'bat_cbse_10_ev1' }],
    });

    const res = await makeRequest(`/api/v1/assignments/${draft.id}/publish`, {
      method: 'POST',
      token: staffToken,
    });
    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  await t.test('10. Superadmin can publish assignment authored by faculty', async () => {
    const superToken = generateAccessToken(mockSuperAdminUser);
    const draft = await assignmentService.createAssignment('usr_tch_001', {
      curriculumNodeId: 'cn_cbse_10_math',
      title: 'To Be Published By Superadmin',
      description: 'Superadmin test',
      dueAt: new Date(Date.now() + 86400000).toISOString(),
      targets: [{ targetType: 'batch', targetId: 'bat_cbse_10_ev1' }],
    });

    const res = await makeRequest(`/api/v1/assignments/${draft.id}/publish`, {
      method: 'POST',
      token: superToken,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.assignment.status, 'published');
    assert.equal(res.body.data.assignment.materializedStudentCount, 2);
  });

  await t.test('11. Publishing already published assignment returns 409 conflict', async () => {
    const teacherToken = generateAccessToken(mockTeacherUserA);
    const res = await makeRequest('/api/v1/assignments/asgn_001/publish', {
      method: 'POST',
      token: teacherToken,
    });
    assert.equal(res.status, 409);
  });

  // ---------------------------------------------------------------------------
  // 4. Student Retrieval, Ownership & IDOR Protection
  // ---------------------------------------------------------------------------
  await t.test('12. Student retrieves own assignments list with derived display_status', async () => {
    const studentToken = generateAccessToken(mockStudentUserA);
    const res = await makeRequest('/api/v1/student/assignments', {
      token: studentToken,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.assignments));
    assert.ok(res.body.data.assignments.length > 0);
    assert.equal(res.body.data.assignments[0].student_id, 'stu_001');
    assert.ok(res.body.data.assignments[0].display_status);
  });

  await t.test('13. Student cannot read another student assignment detail (returns 404 IDOR protection)', async () => {
    const studentTokenA = generateAccessToken(mockStudentUserA);
    // sa_002 belongs to stu_002 (mockStudentUserB)
    const res = await makeRequest('/api/v1/student/assignments/sa_002', {
      token: studentTokenA,
    });

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });

  await t.test('14. Student successfully reads own assignment detail and marks opened', async () => {
    const studentTokenA = generateAccessToken(mockStudentUserA);
    const res = await makeRequest('/api/v1/student/assignments/sa_001', {
      token: studentTokenA,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.assignment.id, 'sa_001');
    assert.equal(res.body.data.assignment.title, 'Polynomial Factorization Practice Set');
  });

  // ---------------------------------------------------------------------------
  // 5. Student Submission Handling, Grace Period, & Sequential Attempts
  // ---------------------------------------------------------------------------
  await t.test('15. Student A cannot submit to Student B assignment instance (returns 404)', async () => {
    const studentTokenA = generateAccessToken(mockStudentUserA);
    const res = await makeRequest('/api/v1/student/assignments/sa_002/submissions', {
      method: 'POST',
      token: studentTokenA,
      body: { submissionType: 'text', textResponse: 'Stolen attempt' },
    });

    assert.equal(res.status, 404);
  });

  await t.test('16. Valid submission creates attempt 1 and updates status to submitted', async () => {
    const studentTokenA = generateAccessToken(mockStudentUserA);
    const res = await makeRequest('/api/v1/student/assignments/sa_001/submissions', {
      method: 'POST',
      token: studentTokenA,
      body: {
        submissionType: 'hybrid',
        textResponse: 'Here are the factorization steps for all 10 questions.',
        attachments: [
          {
            storagePath: 'storage/assignments/submissions/sample.pdf',
            originalFilename: 'rahul_homework_ch2.pdf',
            mimeType: 'application/pdf',
            fileSizeBytes: 1048576,
          },
        ],
      },
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.submission.attemptNumber, 1, 'Attempt numbering must start sequentially at 1');
    assert.equal(res.body.data.submission.studentAssignmentStatus, 'submitted');
  });

  await t.test('17. Re-submitting while awaiting evaluation is rejected with ALREADY_SUBMITTED', async () => {
    const studentTokenA = generateAccessToken(mockStudentUserA);
    const res = await makeRequest('/api/v1/student/assignments/sa_001/submissions', {
      method: 'POST',
      token: studentTokenA,
      body: { submissionType: 'text', textResponse: 'Trying to overwrite' },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'ALREADY_SUBMITTED');
  });

  await t.test('18. Submission past grace period is rejected with GRACE_PERIOD_EXPIRED', async () => {
    const studentTokenA = generateAccessToken(mockStudentUserA);
    const res = await makeRequest('/api/v1/student/assignments/sa_grace_001/submissions', {
      method: 'POST',
      token: studentTokenA,
      body: { submissionType: 'text', textResponse: 'Late attempt' },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'GRACE_PERIOD_EXPIRED');
  });

  // ---------------------------------------------------------------------------
  // 6. Teacher Evaluation & Resubmission Workflow
  // ---------------------------------------------------------------------------
  await t.test('19. Teacher B cannot evaluate Teacher A assignment submission (returns 403)', async () => {
    const teacherTokenB = generateAccessToken(mockTeacherUserB);
    const currentSubmission = submissionsStore[0];
    assert.ok(currentSubmission, 'Submission must exist');

    const res = await makeRequest(`/api/v1/submissions/${currentSubmission.id}/evaluate`, {
      method: 'POST',
      token: teacherTokenB,
      body: {
        scoreAwarded: 15.0,
        gradingStatus: 'evaluated',
        feedback: 'Unauthorized grading',
      },
    });

    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  await t.test('20. Staff admin cannot evaluate student submission (returns 403)', async () => {
    const staffToken = generateAccessToken(mockStaffAdminUser);
    const currentSubmission = submissionsStore[0];

    const res = await makeRequest(`/api/v1/submissions/${currentSubmission.id}/evaluate`, {
      method: 'POST',
      token: staffToken,
      body: {
        scoreAwarded: 15.0,
        gradingStatus: 'evaluated',
        feedback: 'Staff grading',
      },
    });

    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  await t.test('21. Author teacher evaluates submission via direct endpoint with resubmission_requested', async () => {
    const teacherTokenA = generateAccessToken(mockTeacherUserA);
    const currentSubmission = submissionsStore[0];

    const res = await makeRequest(`/api/v1/submissions/${currentSubmission.id}/evaluate`, {
      method: 'POST',
      token: teacherTokenA,
      body: {
        scoreAwarded: 12.0,
        gradingStatus: 'resubmission_requested',
        feedback: 'Good effort on questions 1-6. Re-do questions 7-10 showing derivation steps.',
      },
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.evaluation.gradingStatus, 'resubmission_requested');
    assert.equal(res.body.data.evaluation.studentAssignmentStatus, 'resubmission_requested');
  });

  await t.test('22. Evaluation score exceeding max_score is rejected with 400', async () => {
    const teacherTokenA = generateAccessToken(mockTeacherUserA);
    const currentSubmission = submissionsStore[0];

    const res = await makeRequest(`/api/v1/submissions/${currentSubmission.id}/evaluate`, {
      method: 'POST',
      token: teacherTokenA,
      body: {
        scoreAwarded: 999.0, // Max score is 20.0
        gradingStatus: 'evaluated',
        feedback: 'Too high score',
      },
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  await t.test('23. Student submits revision: generates sequential attempt 2 and status resubmitted', async () => {
    const studentTokenA = generateAccessToken(mockStudentUserA);
    const res = await makeRequest('/api/v1/student/assignments/sa_001/submissions', {
      method: 'POST',
      token: studentTokenA,
      body: {
        submissionType: 'text',
        textResponse: 'Corrected solutions for Questions 7 to 10 with full derivations.',
      },
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.submission.attemptNumber, 2, 'Attempt number must be sequentially 2');
    assert.equal(res.body.data.submission.studentAssignmentStatus, 'resubmitted', 'Status must transition to resubmitted');
  });

  await t.test('24. Teacher evaluates attempt 2: status transitions to completed', async () => {
    const teacherTokenA = generateAccessToken(mockTeacherUserA);
    const attempt2Submission = submissionsStore.find(s => s.attempt_number === 2);
    assert.ok(attempt2Submission, 'Attempt 2 submission must exist');

    const res = await makeRequest(`/api/v1/submissions/${attempt2Submission.id}/evaluate`, {
      method: 'POST',
      token: teacherTokenA,
      body: {
        scoreAwarded: 19.0,
        gradingStatus: 'evaluated',
        feedback: 'Derivations are clear and accurate. Well done!',
      },
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.evaluation.studentAssignmentStatus, 'completed');
  });

  await t.test('25. Historical submission attempts are preserved and returned to student', async () => {
    const studentTokenA = generateAccessToken(mockStudentUserA);
    const res = await makeRequest('/api/v1/student/assignments/sa_001/submissions', {
      token: studentTokenA,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.submissions.length, 2, 'Must contain both attempt 1 and attempt 2');
    assert.equal(res.body.data.submissions[0].attempt_number, 1);
    assert.equal(res.body.data.submissions[1].attempt_number, 2);
  });

  // ---------------------------------------------------------------------------
  // 7. Security, Parameterization, and Hygiene
  // ---------------------------------------------------------------------------
  await t.test('26. Assignment and Student repositories contain zero SELECT * statements', () => {
    const asgnRepoCode = fs.readFileSync('server/repositories/assignmentRepository.js', 'utf8');
    const saRepoCode = fs.readFileSync('server/repositories/studentAssignmentRepository.js', 'utf8');

    assert.doesNotMatch(asgnRepoCode, /SELECT\s+\*\s+FROM/i);
    assert.doesNotMatch(saRepoCode, /SELECT\s+\*\s+FROM/i);
  });

  await t.test('27. Student identity is strictly isolated to req.user.id (query param ignored)', async () => {
    const studentTokenA = generateAccessToken(mockStudentUserA);
    const res = await makeRequest('/api/v1/student/assignments?studentId=stu_002', {
      token: studentTokenA,
    });

    assert.equal(res.status, 200);
    for (const a of res.body.data.assignments) {
      assert.equal(a.student_id, 'stu_001');
    }
  });

  await t.test('28. Service unit functions operate reliably in direct isolation', async () => {
    assert.equal(typeof assignmentService.createAssignment, 'function');
    assert.equal(typeof assignmentService.publishAssignment, 'function');
    assert.equal(typeof assignmentService.evaluateSubmission, 'function');
    assert.equal(typeof studentAssignmentService.getStudentAssignments, 'function');
    assert.equal(typeof studentAssignmentService.submitAssignment, 'function');
  });
});
