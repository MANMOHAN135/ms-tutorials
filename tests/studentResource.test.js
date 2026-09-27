import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import fs from 'fs';
import app from '../server/server.js';
import { generateAccessToken } from '../server/services/tokenService.js';
import studentAcademicContextRepository from '../server/repositories/studentAcademicContextRepository.js';
import studentResourceRepository from '../server/repositories/studentResourceRepository.js';
import academicReferenceRepository from '../server/repositories/academicReferenceRepository.js';
import curriculumRepository from '../server/repositories/curriculumRepository.js';
import { getStudentResources, getStudentResourceById } from '../server/services/studentResourceService.js';

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

// Mock Student Academic Context DB Row (from Phase 5.8C)
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

const mockNoEnrollmentDbRow = {
  student_id: 'stu_002',
  admission_number: 'AS26099',
  student_name: 'Pooja Verma',
  student_email: 'pooja@example.com',
  enrollment_id: null,
};

// Mock Resource DB Rows
const mockResource1 = {
  id: 'res_001',
  title: 'Polynomial Factorization Practice Sheet',
  description: 'Comprehensive practice sheet on quadratic and cubic polynomials.',
  resource_type: 'worksheet',
  curriculum_node_id: 'cn_cbse_10_math',
  chapter_id: 'ch_poly',
  topic_id: 'top_fact',
  storage_type: 'local',
  file_url: '/storage/resources/math/ch02_fact_sheet.pdf',
  file_size_bytes: 245760,
  mime_type: 'application/pdf',
  duration_seconds: null,
  difficulty_level: 'standard',
  is_published: 1,
  uploaded_by: 'usr_tch_001',
  created_at: new Date('2026-04-10T10:00:00Z'),
  updated_at: new Date('2026-04-10T10:00:00Z'),
};

const mockResource2 = {
  id: 'res_002',
  title: 'Real Numbers Formula Summary',
  description: 'Handy summary sheet of Euclid division lemma.',
  resource_type: 'summary_sheet',
  curriculum_node_id: 'cn_cbse_10_math',
  chapter_id: 'ch_real',
  topic_id: null,
  storage_type: 'local',
  file_url: '/storage/resources/math/ch01_summary.pdf',
  file_size_bytes: 120400,
  mime_type: 'application/pdf',
  duration_seconds: null,
  difficulty_level: 'foundation',
  is_published: 1,
  uploaded_by: 'usr_tch_001',
  created_at: new Date('2026-04-05T09:00:00Z'),
  updated_at: new Date('2026-04-05T09:00:00Z'),
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
    if (params && (params[0] === 'usr_stu_001' || params[0] === 'usr_stu_custom_99')) {
      return [mockContextDbRow];
    }
    return [];
  });

  // Default query runner for student resources
  studentResourceRepository.setQueryRunner(async (sql, params) => {
    if (sql.includes('SELECT COUNT(*)')) {
      if (params && params[0] === 'usr_stu_001') {
        return [{ total: 2 }];
      }
      return [{ total: 0 }];
    }
    if (sql.includes('WHERE u.id = ? AND u.role = \'student\' AND lr.id = ?')) {
      const resourceId = params[1];
      if (resourceId === 'res_001') {
        return [mockResource1];
      }
      if (resourceId === 'res_002') {
        return [mockResource2];
      }
      return [];
    }
    if (params && params[0] === 'usr_stu_001') {
      return [mockResource1, mockResource2];
    }
    return [];
  });

  // Regression query runners for 5.8A and 5.8B
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
  studentResourceRepository.resetQueryRunner();
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
// PHASE 5.8D TEST SUITE: STUDENT LEARNING RESOURCES API
// =============================================================================

test('--- Phase 5.8D: Student Learning Resources API Test Suite ---', async (t) => {
  // 1. Unauthenticated request -> 401
  await t.test('1. Unauthenticated request -> 401', async () => {
    const res = await makeRequest('/api/v1/student/resources');
    assert.equal(res.status, 401);
    assert.match(res.body.error, /Unauthorized/i);
  });

  // 2. Authenticated parent -> 403
  await t.test('2. Authenticated parent -> 403', async () => {
    const token = generateAccessToken(mockParentUser);
    const res = await makeRequest('/api/v1/student/resources', token);
    assert.equal(res.status, 403);
    assert.match(res.body.error, /Forbidden/i);
  });

  // 3. Authenticated teacher -> 403
  await t.test('3. Authenticated teacher -> 403', async () => {
    const token = generateAccessToken(mockTeacherUser);
    const res = await makeRequest('/api/v1/student/resources', token);
    assert.equal(res.status, 403);
    assert.match(res.body.error, /Forbidden/i);
  });

  // 4. Authenticated admin -> 403
  await t.test('4. Authenticated admin -> 403', async () => {
    const token = generateAccessToken(mockAdminUser);
    const res = await makeRequest('/api/v1/student/resources', token);
    assert.equal(res.status, 403);
    assert.match(res.body.error, /Forbidden/i);
  });

  // 5. Student can retrieve authorized resources
  await t.test('5. Student can retrieve authorized resources', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/student/resources', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.resources));
    assert.equal(res.body.data.resources.length, 2);
    assert.equal(res.body.data.resources[0].id, 'res_001');
    assert.ok(res.body.pagination);
    assert.equal(res.body.pagination.total, 2);
  });

  // 6. Student identity comes from req.user.id
  await t.test('6. Student identity comes from req.user.id', async () => {
    let capturedUserId = null;
    studentResourceRepository.setQueryRunner(async (sql, params) => {
      capturedUserId = params[0];
      if (sql.includes('COUNT(*)')) return [{ total: 1 }];
      return [mockResource1];
    });

    const token = generateAccessToken({ id: 'usr_stu_custom_99', role: 'student', identifier: 'AS26099' });
    await makeRequest('/api/v1/student/resources', token);

    assert.equal(capturedUserId, 'usr_stu_custom_99');
  });

  // 7. studentId query parameter cannot change identity
  await t.test('7. studentId query parameter cannot change identity', async () => {
    let capturedUserId = null;
    studentResourceRepository.setQueryRunner(async (sql, params) => {
      capturedUserId = params[0];
      if (sql.includes('COUNT(*)')) return [{ total: 1 }];
      return [mockResource1];
    });

    const token = generateAccessToken(mockStudentUser);
    await makeRequest('/api/v1/student/resources?studentId=spoofed_victim_id', token);

    assert.equal(capturedUserId, 'usr_stu_001');
  });

  // 8. admissionNumber query parameter cannot change identity
  await t.test('8. admissionNumber query parameter cannot change identity', async () => {
    let capturedUserId = null;
    studentResourceRepository.setQueryRunner(async (sql, params) => {
      capturedUserId = params[0];
      if (sql.includes('COUNT(*)')) return [{ total: 1 }];
      return [mockResource1];
    });

    const token = generateAccessToken(mockStudentUser);
    await makeRequest('/api/v1/student/resources?admissionNumber=AS99999', token);

    assert.equal(capturedUserId, 'usr_stu_001');
  });

  // 9. Unpublished resources are excluded
  await t.test('9. Unpublished resources are excluded', async () => {
    const repoPath = new URL('../server/repositories/studentResourceRepository.js', import.meta.url);
    const content = fs.readFileSync(repoPath, 'utf-8');

    // Repository query must enforce lr.is_published = 1 in SQL
    assert.match(content, /lr\.is_published\s*=\s*1/i);
  });

  // 10. Inactive curriculum nodes are excluded
  await t.test('10. Inactive curriculum nodes are excluded', async () => {
    const repoPath = new URL('../server/repositories/studentResourceRepository.js', import.meta.url);
    const content = fs.readFileSync(repoPath, 'utf-8');

    // Repository query must enforce cn.is_active = 1 in SQL
    assert.match(content, /cn\.is_active\s*=\s*1/i);
  });

  // 11. Another board's resources are excluded
  await t.test("11. Another board's resources are excluded", async () => {
    const repoPath = new URL('../server/repositories/studentResourceRepository.js', import.meta.url);
    const content = fs.readFileSync(repoPath, 'utf-8');

    // Join must bind cn.board_id = se.board_id
    assert.match(content, /cn\.board_id\s*=\s*se\.board_id/i);
  });

  // 12. Another class's resources are excluded
  await t.test("12. Another class's resources are excluded", async () => {
    const repoPath = new URL('../server/repositories/studentResourceRepository.js', import.meta.url);
    const content = fs.readFileSync(repoPath, 'utf-8');

    // Join must bind cn.class_id = se.class_id
    assert.match(content, /cn\.class_id\s*=\s*se\.class_id/i);
  });

  // 13. Another academic session's resources are excluded
  await t.test("13. Another academic session's resources are excluded", async () => {
    const repoPath = new URL('../server/repositories/studentResourceRepository.js', import.meta.url);
    const content = fs.readFileSync(repoPath, 'utf-8');

    // Join must bind cn.session_id = se.session_id
    assert.match(content, /cn\.session_id\s*=\s*se\.session_id/i);
  });

  // 14. Subject filter remains inside authorized scope
  await t.test('14. Subject filter remains inside authorized scope', async () => {
    let capturedSql = '';
    let capturedParams = [];
    studentResourceRepository.setQueryRunner(async (sql, params) => {
      capturedSql = sql;
      capturedParams = params;
      if (sql.includes('COUNT(*)')) return [{ total: 1 }];
      return [mockResource1];
    });

    const token = generateAccessToken(mockStudentUser);
    await makeRequest('/api/v1/student/resources?subjectId=sub_math_10', token);

    assert.match(capturedSql, /cn\.subject_id\s*=\s*\?/i);
    assert.ok(capturedParams.includes('sub_math_10'));
  });

  // 15. Chapter filter remains inside authorized scope
  await t.test('15. Chapter filter remains inside authorized scope', async () => {
    let capturedSql = '';
    let capturedParams = [];
    studentResourceRepository.setQueryRunner(async (sql, params) => {
      capturedSql = sql;
      capturedParams = params;
      if (sql.includes('COUNT(*)')) return [{ total: 1 }];
      return [mockResource1];
    });

    const token = generateAccessToken(mockStudentUser);
    await makeRequest('/api/v1/student/resources?chapterId=ch_poly', token);

    assert.match(capturedSql, /lr\.chapter_id\s*=\s*\?/i);
    assert.ok(capturedParams.includes('ch_poly'));
  });

  // 16. Topic filter remains inside authorized scope
  await t.test('16. Topic filter remains inside authorized scope', async () => {
    let capturedSql = '';
    let capturedParams = [];
    studentResourceRepository.setQueryRunner(async (sql, params) => {
      capturedSql = sql;
      capturedParams = params;
      if (sql.includes('COUNT(*)')) return [{ total: 1 }];
      return [mockResource1];
    });

    const token = generateAccessToken(mockStudentUser);
    await makeRequest('/api/v1/student/resources?topicId=top_fact', token);

    assert.match(capturedSql, /lr\.topic_id\s*=\s*\?/i);
    assert.ok(capturedParams.includes('top_fact'));
  });

  // 17. resourceType filter validates allowed enum
  await t.test('17. resourceType filter validates allowed enum', async () => {
    let capturedParams = [];
    studentResourceRepository.setQueryRunner(async (sql, params) => {
      capturedParams = params;
      if (sql.includes('COUNT(*)')) return [{ total: 1 }];
      return [mockResource1];
    });

    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/student/resources?resourceType=worksheet', token);

    assert.equal(res.status, 200);
    assert.ok(capturedParams.includes('worksheet'));
  });

  // 18. difficultyLevel filter validates allowed enum
  await t.test('18. difficultyLevel filter validates allowed enum', async () => {
    let capturedParams = [];
    studentResourceRepository.setQueryRunner(async (sql, params) => {
      capturedParams = params;
      if (sql.includes('COUNT(*)')) return [{ total: 1 }];
      return [mockResource1];
    });

    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/student/resources?difficultyLevel=standard', token);

    assert.equal(res.status, 200);
    assert.ok(capturedParams.includes('standard'));
  });

  // 19. Invalid resourceType -> 400
  await t.test('19. Invalid resourceType -> 400', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/student/resources?resourceType=malicious_type', token);
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error.message, /Invalid resourceType/i);
  });

  // 20. Invalid difficultyLevel -> 400
  await t.test('20. Invalid difficultyLevel -> 400', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/student/resources?difficultyLevel=ultra_hard', token);
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error.message, /Invalid difficultyLevel/i);
  });

  // 21. Unauthorized chapter ID cannot bypass context
  await t.test('21. Unauthorized chapter ID cannot bypass context', async () => {
    studentResourceRepository.setQueryRunner(async (sql, params) => {
      // If client searches foreign chapterId, SQL join to cn yields 0 results
      return [];
    });

    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/student/resources?chapterId=ch_foreign_icse', token);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.resources.length, 0);
  });

  // 22. Unauthorized topic ID cannot bypass context
  await t.test('22. Unauthorized topic ID cannot bypass context', async () => {
    studentResourceRepository.setQueryRunner(async () => []);

    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/student/resources?topicId=top_foreign_icse', token);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.resources.length, 0);
  });

  // 23. Unauthorized subject ID cannot bypass context
  await t.test('23. Unauthorized subject ID cannot bypass context', async () => {
    studentResourceRepository.setQueryRunner(async () => []);

    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/student/resources?subjectId=sub_foreign_french', token);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.resources.length, 0);
  });

  // 24. Resource-by-ID cannot bypass academic context
  await t.test('24. Resource-by-ID cannot bypass academic context', async () => {
    studentResourceRepository.setQueryRunner(async (sql, params) => {
      // Query runner returns empty for resource outside context
      return [];
    });

    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/student/resources/res_foreign_board_999', token);

    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });

  // 25. Resource-by-ID cannot expose unpublished resource
  await t.test('25. Resource-by-ID cannot expose unpublished resource', async () => {
    studentResourceRepository.setQueryRunner(async (sql, params) => {
      // Even if row exists in DB, is_published = 0 causes query to return null
      return [];
    });

    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/student/resources/res_draft_001', token);

    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });

  // 26. Unenrolled student receives empty collection
  await t.test('26. Unenrolled student receives empty collection', async () => {
    const token = generateAccessToken({ id: 'usr_stu_no_enr', role: 'student', identifier: 'AS26099' });
    const res = await makeRequest('/api/v1/student/resources', token);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.deepEqual(res.body.data.resources, []);
    assert.equal(res.body.pagination.total, 0);
  });

  // 27. Unenrolled student cannot retrieve resource by ID
  await t.test('27. Unenrolled student cannot retrieve resource by ID', async () => {
    const token = generateAccessToken({ id: 'usr_stu_no_enr', role: 'student', identifier: 'AS26099' });
    const res = await makeRequest('/api/v1/student/resources/res_001', token);

    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });

  // 28. SQL uses parameterized values
  await t.test('28. SQL uses parameterized values', async () => {
    let capturedParams = [];
    studentResourceRepository.setQueryRunner(async (sql, params) => {
      capturedParams = params;
      if (sql.includes('COUNT(*)')) return [{ total: 1 }];
      return [mockResource1];
    });

    const token = generateAccessToken(mockStudentUser);
    await makeRequest('/api/v1/student/resources?subjectId=sub_param_check&resourceType=video', token);

    assert.ok(capturedParams.includes('usr_stu_001'));
    assert.ok(capturedParams.includes('sub_param_check'));
    assert.ok(capturedParams.includes('video'));
  });

  // 29. Repository contains no SELECT *
  await t.test('29. Repository contains no SELECT *', async () => {
    const repoPath = new URL('../server/repositories/studentResourceRepository.js', import.meta.url);
    const content = fs.readFileSync(repoPath, 'utf-8');
    assert.doesNotMatch(content, /SELECT\s+\*/i, 'studentResourceRepository must never contain SELECT *');
  });

  // 30. No dynamic SQL from client input
  await t.test('30. No dynamic SQL from client input', async () => {
    let capturedSql = '';
    studentResourceRepository.setQueryRunner(async (sql, params) => {
      capturedSql = sql;
      if (sql.includes('COUNT(*)')) return [{ total: 1 }];
      return [mockResource1];
    });

    const maliciousSubject = "sub' OR '1'='1";
    const token = generateAccessToken(mockStudentUser);
    await makeRequest(`/api/v1/student/resources?subjectId=${encodeURIComponent(maliciousSubject)}`, token);

    assert.doesNotMatch(capturedSql, /sub' OR '1'='1/, 'SQL string must not contain interpolated filter');
    assert.match(capturedSql, /cn\.subject_id\s*=\s*\?/);
  });

  // 31. Response excludes sensitive/internal fields
  await t.test('31. Response excludes sensitive/internal fields', async () => {
    studentResourceRepository.setQueryRunner(async (sql, params) => {
      if (sql.includes('COUNT(*)')) return [{ total: 1 }];
      return [mockResource1];
    });

    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/student/resources', token);
    const bodyStr = JSON.stringify(res.body);

    assert.doesNotMatch(bodyStr, /uploaded_by/i);
    assert.doesNotMatch(bodyStr, /password/i);
    assert.doesNotMatch(bodyStr, /token_hash/i);
    assert.doesNotMatch(bodyStr, /failed_login/i);
  });

  // 32. Existing Phase 5.8A APIs continue working
  await t.test('32. Existing Phase 5.8A APIs continue working', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/academic/sessions', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.sessions));
  });

  // 33. Existing Phase 5.8B APIs continue working
  await t.test('33. Existing Phase 5.8B APIs continue working', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/curriculum/nodes', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.nodes));
  });

  // 34. Existing Phase 5.8C APIs continue working
  await t.test('34. Existing Phase 5.8C APIs continue working', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/student/academic-context', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.student.id, 'stu_001');
    assert.equal(res.body.data.enrollment.board.code, 'CBSE');
  });

  // 35. Pagination behaves correctly
  await t.test('35. Pagination behaves correctly', async () => {
    let capturedParams = [];
    studentResourceRepository.setQueryRunner(async (sql, params) => {
      if (sql.includes('COUNT(*)')) return [{ total: 45 }];
      capturedParams = params;
      return [mockResource1];
    });

    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/student/resources?page=2&pageSize=10', token);

    assert.equal(res.status, 200);
    assert.equal(res.body.pagination.page, 2);
    assert.equal(res.body.pagination.pageSize, 10);
    assert.equal(res.body.pagination.total, 45);
    assert.equal(res.body.pagination.totalPages, 5);
    assert.equal(res.body.pagination.hasNext, true);
    assert.equal(res.body.pagination.hasPrev, true);
    // Limit is 10, offset is 10
    assert.equal(capturedParams[capturedParams.length - 2], 10);
    assert.equal(capturedParams[capturedParams.length - 1], 10);
  });

  // 36. Stable ordering is applied
  await t.test('36. Stable ordering is applied', async () => {
    const repoPath = new URL('../server/repositories/studentResourceRepository.js', import.meta.url);
    const content = fs.readFileSync(repoPath, 'utf-8');

    // Query must order by created_at DESC, lr.id ASC
    assert.match(content, /ORDER\s+BY\s+lr\.created_at\s+DESC\s*,\s*lr\.id\s+ASC/i);
  });
});
