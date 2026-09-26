import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import fs from 'fs';
import app from '../server/server.js';
import { generateAccessToken } from '../server/services/tokenService.js';
import studentAcademicContextRepository from '../server/repositories/studentAcademicContextRepository.js';
import academicReferenceRepository from '../server/repositories/academicReferenceRepository.js';
import curriculumRepository from '../server/repositories/curriculumRepository.js';
import { getStudentAcademicContext } from '../server/services/studentAcademicContextService.js';

let server;
let baseUrl;

// Mock Users for Auth Testing
const mockStudentUser = {
  id: 'usr_stu_001',
  role: 'student',
  identifier: 'AS26090',
  full_name: 'Rahul Sharma',
};

const mockParentUser = {
  id: 'usr_par_001',
  role: 'parent',
  identifier: 'parent@example.com',
  full_name: 'Suresh Sharma',
};

const mockTeacherUser = {
  id: 'usr_tch_001',
  role: 'teacher',
  identifier: 'faculty@mstutorials.com',
  full_name: 'Dr. Vikram Seth',
};

const mockAdminUser = {
  id: 'usr_adm_001',
  role: 'admin',
  identifier: 'admin@mstutorials.com',
  full_name: 'Principal Sharma',
};

// Mock Database Row with complete active enrollment
const mockContextDbRow = {
  student_id: 'stu_001',
  admission_number: 'AS26090',
  student_name: 'Rahul Sharma',
  student_email: 'rahul@example.com',
  enrollment_id: 'enr_001',
  enrollment_date: new Date('2026-04-01'),
  enrollment_status: 'active',
  roll_number: '10A-14',
  enrollment_created_at: new Date('2026-04-01T00:00:00Z'),
  session_id: 'sess_2026_27',
  session_code: '2026-27',
  session_display_name: 'Academic Year 2026-2027',
  session_start_date: new Date('2026-04-01'),
  session_end_date: new Date('2027-03-31'),
  session_status: 'active',
  board_id: 'brd_cbse',
  board_code: 'CBSE',
  board_name: 'Central Board of Secondary Education',
  board_status: 'active',
  class_id: 'cls_10',
  class_grade_number: 10,
  class_code: 'CLASS_10',
  class_display_name: 'Class 10',
  class_stage: 'secondary',
  class_status: 'active',
  program_id: 'prog_ach',
  program_code: 'achievers',
  program_name: 'Achievers Board Excellence',
  program_target_stage: 'secondary',
  program_status: 'active',
  batch_id: 'bat_cbse_10_ev1',
  batch_code: 'BAT_2026_10_ACH_EV1',
  batch_name: 'Class 10 Achievers - Evening',
  batch_schedule: 'Mon, Wed, Fri 5:30 PM - 7:00 PM',
  batch_status: 'active',
};

// Mock DB row when student has NO enrollment
const mockNoEnrollmentDbRow = {
  student_id: 'stu_002',
  admission_number: 'AS26099',
  student_name: 'Pooja Verma',
  student_email: 'pooja@example.com',
  enrollment_id: null,
};

test.before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });

  // Default query runner for academic context
  studentAcademicContextRepository.setQueryRunner(async (sql, params) => {
    if (params && params[0] === 'usr_stu_no_enr') {
      return [mockNoEnrollmentDbRow];
    }
    if (params && params[0] === 'usr_stu_001') {
      return [mockContextDbRow];
    }
    return [];
  });

  // Regression mocks for Phase 5.8A and 5.8B
  academicReferenceRepository.setQueryRunner(async (sql) => {
    if (sql.includes('FROM academic_sessions')) {
      return [{ id: 'sess_2026_27', session_code: '2026-27', display_name: '2026-2027', start_date: new Date('2026-04-01'), end_date: new Date('2027-03-31'), status: 'active', created_at: new Date(), updated_at: new Date() }];
    }
    return [];
  });

  curriculumRepository.setQueryRunner(async (sql) => {
    if (sql.includes('FROM curriculum_nodes')) {
      return [{ id: 'cn_001', session_id: 'sess_2026_27', board_id: 'brd_cbse', class_id: 'cls_10', subject_id: 'sub_math', syllabus_version: 'v1.0', is_active: 1, created_at: new Date(), updated_at: new Date() }];
    }
    return [];
  });
});

test.after(async () => {
  studentAcademicContextRepository.resetQueryRunner();
  academicReferenceRepository.resetQueryRunner();
  curriculumRepository.resetQueryRunner();
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

function makeRequest(path, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      url,
      {
        method: 'GET',
        headers,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            resolve({ status: res.statusCode, body: json });
          } catch {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );

    req.on('error', reject);
    req.end();
  });
}

// =============================================================================
// PHASE 5.8C TEST SUITE: STUDENT ACADEMIC CONTEXT API
// =============================================================================

test('--- Phase 5.8C: Student Academic Context API Test Suite ---', async (t) => {
  // 1. Unauthenticated request -> 401
  await t.test('1. Unauthenticated request -> 401', async () => {
    const res = await makeRequest('/api/v1/student/academic-context');
    assert.equal(res.status, 401);
    assert.ok(res.body.error);
    assert.match(res.body.error, /Unauthorized/i);
  });

  // 2. Authenticated parent -> 403
  await t.test('2. Authenticated parent -> 403', async () => {
    const token = generateAccessToken(mockParentUser);
    const res = await makeRequest('/api/v1/student/academic-context', token);
    assert.equal(res.status, 403);
    assert.ok(res.body.error);
    assert.match(res.body.error, /Forbidden/i);
  });

  // 3. Authenticated teacher -> 403
  await t.test('3. Authenticated teacher -> 403', async () => {
    const token = generateAccessToken(mockTeacherUser);
    const res = await makeRequest('/api/v1/student/academic-context', token);
    assert.equal(res.status, 403);
    assert.ok(res.body.error);
    assert.match(res.body.error, /Forbidden/i);
  });

  // 4. Authenticated admin -> 403
  await t.test('4. Authenticated admin -> 403', async () => {
    const token = generateAccessToken(mockAdminUser);
    const res = await makeRequest('/api/v1/student/academic-context', token);
    assert.equal(res.status, 403);
    assert.ok(res.body.error);
    assert.match(res.body.error, /Forbidden/i);
  });

  // 5. Authenticated student can access own context
  await t.test('5. Authenticated student can access own context', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/student/academic-context', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.student);
    assert.ok(res.body.data.enrollment);
  });

  // 6. Student identity is derived from req.user.id
  await t.test('6. Student identity is derived from req.user.id', async () => {
    let capturedUserId = null;
    studentAcademicContextRepository.setQueryRunner(async (sql, params) => {
      capturedUserId = params[0];
      return [mockContextDbRow];
    });

    const token = generateAccessToken({ id: 'usr_stu_custom_99', role: 'student', identifier: 'AS26099' });
    await makeRequest('/api/v1/student/academic-context', token);

    assert.equal(capturedUserId, 'usr_stu_custom_99', 'Query runner must receive authenticated req.user.id');
  });

  // 7. No student ID is accepted from route parameters
  await t.test('7. No student ID is accepted from route parameters', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/student/academic-context/stu_attacker_id', token);
    // Unmatched path should 404
    assert.equal(res.status, 404);
  });

  // 8. No student ID is accepted from query parameters
  await t.test('8. No student ID is accepted from query parameters', async () => {
    let capturedUserId = null;
    studentAcademicContextRepository.setQueryRunner(async (sql, params) => {
      capturedUserId = params[0];
      return [mockContextDbRow];
    });

    const token = generateAccessToken(mockStudentUser);
    // Pass spoofed query parameters
    await makeRequest('/api/v1/student/academic-context?studentId=spoofed_id&admissionNumber=AS99999', token);

    assert.equal(capturedUserId, 'usr_stu_001', 'Query runner must ignore query parameters and use req.user.id');
  });

  // 9. Correct session returned
  await t.test('9. Correct session returned', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/student/academic-context', token);
    assert.equal(res.status, 200);
    const session = res.body.data.enrollment.session;
    assert.equal(session.id, 'sess_2026_27');
    assert.equal(session.sessionCode, '2026-27');
    assert.equal(session.displayName, 'Academic Year 2026-2027');
    assert.equal(session.startDate, '2026-04-01');
    assert.equal(session.endDate, '2027-03-31');
    assert.equal(session.status, 'active');
  });

  // 10. Correct board returned
  await t.test('10. Correct board returned', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/student/academic-context', token);
    assert.equal(res.status, 200);
    const board = res.body.data.enrollment.board;
    assert.equal(board.id, 'brd_cbse');
    assert.equal(board.code, 'CBSE');
    assert.equal(board.name, 'Central Board of Secondary Education');
  });

  // 11. Correct class returned
  await t.test('11. Correct class returned', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/student/academic-context', token);
    assert.equal(res.status, 200);
    const cls = res.body.data.enrollment.class;
    assert.equal(cls.id, 'cls_10');
    assert.equal(cls.gradeNumber, 10);
    assert.equal(cls.code, 'CLASS_10');
    assert.equal(cls.displayName, 'Class 10');
    assert.equal(cls.stage, 'secondary');
  });

  // 12. Correct program returned
  await t.test('12. Correct program returned', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/student/academic-context', token);
    assert.equal(res.status, 200);
    const program = res.body.data.enrollment.program;
    assert.equal(program.id, 'prog_ach');
    assert.equal(program.code, 'achievers');
    assert.equal(program.name, 'Achievers Board Excellence');
    assert.equal(program.targetStage, 'secondary');
  });

  // 13. Correct batch returned
  await t.test('13. Correct batch returned', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/student/academic-context', token);
    assert.equal(res.status, 200);
    const batch = res.body.data.enrollment.batch;
    assert.equal(batch.id, 'bat_cbse_10_ev1');
    assert.equal(batch.code, 'BAT_2026_10_ACH_EV1');
    assert.equal(batch.name, 'Class 10 Achievers - Evening');
    assert.equal(batch.scheduleDescription, 'Mon, Wed, Fri 5:30 PM - 7:00 PM');
  });

  // 14. student_enrollments.board_id remains authoritative
  await t.test('14. student_enrollments.board_id remains authoritative', async () => {
    const repoPath = new URL('../server/repositories/studentAcademicContextRepository.js', import.meta.url);
    const sqlContent = fs.readFileSync(repoPath, 'utf-8');

    // Confirm join is on se.board_id = b.id
    assert.match(sqlContent, /LEFT\s+JOIN\s+boards\s+b\s+ON\s+se\.board_id\s*=\s*b\.id/i);
  });

  // 15. batch.board_id does not override enrollment board
  await t.test('15. batch.board_id does not override enrollment board', async () => {
    const repoPath = new URL('../server/repositories/studentAcademicContextRepository.js', import.meta.url);
    const sqlContent = fs.readFileSync(repoPath, 'utf-8');

    // Confirm that batch.board_id is never selected as board_id
    assert.doesNotMatch(sqlContent, /bat\.board_id\s+AS\s+board_id/i);
    assert.match(sqlContent, /b\.id\s+AS\s+board_id/i);
  });

  // 16. Missing enrollment is handled safely
  await t.test('16. Missing enrollment is handled safely', async () => {
    studentAcademicContextRepository.setQueryRunner(async (sql, params) => {
      return [mockNoEnrollmentDbRow];
    });

    const token = generateAccessToken({ id: 'usr_stu_no_enr', role: 'student', identifier: 'AS26099' });
    const res = await makeRequest('/api/v1/student/academic-context', token);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.student);
    assert.equal(res.body.data.student.id, 'stu_002');
    assert.equal(res.body.data.enrollment, null, 'Missing enrollment must safely return null without throwing');

    // Non-existent student record returns 404
    studentAcademicContextRepository.setQueryRunner(async () => []);
    const resMissingStudent = await makeRequest('/api/v1/student/academic-context', token);
    assert.equal(resMissingStudent.status, 404);
    assert.equal(resMissingStudent.body.error.code, 'NOT_FOUND');
  });

  // 17. Repository uses explicit column lists
  await t.test('17. Repository uses explicit column lists', async () => {
    const repoPath = new URL('../server/repositories/studentAcademicContextRepository.js', import.meta.url);
    const content = fs.readFileSync(repoPath, 'utf-8');

    assert.match(content, /s\.id\s+AS\s+student_id/i);
    assert.match(content, /se\.id\s+AS\s+enrollment_id/i);
    assert.match(content, /ses\.session_code/i);
    assert.match(content, /b\.code\s+AS\s+board_code/i);
    assert.match(content, /c\.grade_number\s+AS\s+class_grade_number/i);
    assert.match(content, /p\.code\s+AS\s+program_code/i);
    assert.match(content, /bat\.code\s+AS\s+batch_code/i);
  });

  // 18. Repository contains no SELECT *
  await t.test('18. Repository contains no SELECT *', async () => {
    const repoPath = new URL('../server/repositories/studentAcademicContextRepository.js', import.meta.url);
    const content = fs.readFileSync(repoPath, 'utf-8');
    assert.doesNotMatch(content, /SELECT\s+\*/i, 'studentAcademicContextRepository must never contain SELECT *');
  });

  // 19. req.user.id is parameterized
  await t.test('19. req.user.id is parameterized', async () => {
    let capturedParams = [];
    studentAcademicContextRepository.setQueryRunner(async (sql, params) => {
      capturedParams = params;
      return [mockContextDbRow];
    });

    const token = generateAccessToken(mockStudentUser);
    await makeRequest('/api/v1/student/academic-context', token);

    assert.deepEqual(capturedParams, ['usr_stu_001']);
  });

  // 20. No request-supplied identity is interpolated into SQL
  await t.test('20. No request-supplied identity is interpolated into SQL', async () => {
    let capturedSql = '';
    studentAcademicContextRepository.setQueryRunner(async (sql, params) => {
      capturedSql = sql;
      return [mockContextDbRow];
    });

    const maliciousUser = { id: "usr' OR '1'='1", role: 'student', identifier: 'AS000' };
    const token = generateAccessToken(maliciousUser);
    await makeRequest('/api/v1/student/academic-context', token);

    assert.doesNotMatch(capturedSql, /usr' OR '1'='1/, 'SQL string must not contain interpolated user identity');
    assert.match(capturedSql, /WHERE u\.id = \? AND u\.role = 'student'/);
  });

  // 21. Internal repository/service failure returns safe 500 envelope
  await t.test('21. Internal repository/service failure returns safe 500 envelope', async () => {
    studentAcademicContextRepository.setQueryRunner(async () => {
      throw new Error('Deadlock found when trying to get lock; try restarting transaction');
    });

    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/student/academic-context', token);

    assert.equal(res.status, 500);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'INTERNAL_SERVER_ERROR');
    assert.equal(res.body.error.message, 'An unexpected internal error occurred.');
    assert.doesNotMatch(JSON.stringify(res.body), /Deadlock/);
  });

  // 22. Response contains no sensitive security fields
  await t.test('22. Response contains no sensitive security fields', async () => {
    studentAcademicContextRepository.setQueryRunner(async () => [mockContextDbRow]);

    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/student/academic-context', token);
    const bodyStr = JSON.stringify(res.body);

    assert.doesNotMatch(bodyStr, /password/i);
    assert.doesNotMatch(bodyStr, /token_hash/i);
    assert.doesNotMatch(bodyStr, /failed_login/i);
    assert.doesNotMatch(bodyStr, /locked_until/i);
  });

  // 23. Existing Phase 5.8A APIs continue working
  await t.test('23. Existing Phase 5.8A APIs continue working', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/academic/sessions', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.sessions));
  });

  // 24. Existing Phase 5.8B APIs continue working
  await t.test('24. Existing Phase 5.8B APIs continue working', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/curriculum/nodes', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.nodes));
  });

  // 25. Service unit functions work in direct isolation
  await t.test('25. Service unit functions work in direct isolation', async () => {
    const customQuery = async (sql, params) => {
      return [mockContextDbRow];
    };

    const context = await getStudentAcademicContext('usr_stu_001', customQuery);
    assert.ok(context);
    assert.equal(context.student.admissionNumber, 'AS26090');
    assert.equal(context.enrollment.board.code, 'CBSE');
    assert.equal(context.enrollment.class.gradeNumber, 10);
  });
});
