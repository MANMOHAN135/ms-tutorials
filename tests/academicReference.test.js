import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../server/server.js';
import { generateAccessToken } from '../server/services/tokenService.js';
import academicReferenceRepository from '../server/repositories/academicReferenceRepository.js';
import {
  getAcademicSessions,
  getAcademicBoards,
  getAcademicClasses,
  getAcademicPrograms,
  getAcademicSubjects,
} from '../server/services/academicReferenceService.js';

let server;
let baseUrl;

// Mock Users for Auth Testing
const mockStudentUser = {
  id: 'usr_stu_001',
  role: 'student',
  identifier: 'AS26090',
  full_name: 'Aditi Rao',
};

const mockParentUser = {
  id: 'usr_par_001',
  role: 'parent',
  identifier: 'parent@example.com',
  full_name: 'Suresh Rao',
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

// Mock Database Rows
const mockSessionsDbRows = [
  {
    id: 'sess_2026_27',
    session_code: '2026-27',
    display_name: 'Academic Year 2026-2027',
    start_date: new Date('2026-04-01'),
    end_date: new Date('2027-03-31'),
    status: 'active',
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
  },
  {
    id: 'sess_2027_28',
    session_code: '2027-28',
    display_name: 'Academic Year 2027-2028',
    start_date: new Date('2027-04-01'),
    end_date: new Date('2028-03-31'),
    status: 'upcoming',
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
  },
];

const mockBoardsDbRows = [
  {
    id: 'brd_cbse',
    code: 'CBSE',
    name: 'Central Board of Secondary Education',
    description: 'National curriculum standard',
    status: 'active',
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
  },
  {
    id: 'brd_icse',
    code: 'ICSE',
    name: 'Indian Certificate of Secondary Education',
    description: 'CISCE curriculum standard',
    status: 'active',
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
  },
];

const mockClassesDbRows = [
  {
    id: 'cls_09',
    grade_number: 9,
    code: 'CLASS_09',
    display_name: 'Class 9',
    stage: 'secondary',
    status: 'active',
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
  },
  {
    id: 'cls_10',
    grade_number: 10,
    code: 'CLASS_10',
    display_name: 'Class 10',
    stage: 'secondary',
    status: 'active',
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
  },
];

const mockProgramsDbRows = [
  {
    id: 'prog_ach',
    code: 'achievers',
    name: 'Achievers Board Excellence',
    description: 'Comprehensive board preparation',
    target_stage: 'secondary',
    status: 'active',
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
  },
  {
    id: 'prog_fnd',
    code: 'foundation',
    name: 'Foundation Olympiad & Concepts',
    description: 'Advanced problem solving',
    target_stage: 'secondary',
    status: 'active',
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
  },
];

const mockSubjectsDbRows = [
  {
    id: 'sub_math',
    code: 'MATH',
    name: 'Mathematics',
    parent_subject_id: null,
    color_code: '#0066CC',
    status: 'active',
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
  },
  {
    id: 'sub_sci',
    code: 'SCIENCE',
    name: 'Science',
    parent_subject_id: null,
    color_code: '#009933',
    status: 'active',
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
  },
  {
    id: 'sub_phy',
    code: 'PHYSICS',
    name: 'Physics',
    parent_subject_id: 'sub_sci',
    color_code: '#3366FF',
    status: 'active',
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
  },
];

test.before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });

  // Mock repository query runner dispatching based on SQL table
  academicReferenceRepository.setQueryRunner(async (sql, params) => {
    if (sql.includes('FROM academic_sessions')) {
      return mockSessionsDbRows;
    }
    if (sql.includes('FROM boards')) {
      return mockBoardsDbRows;
    }
    if (sql.includes('FROM classes')) {
      return mockClassesDbRows;
    }
    if (sql.includes('FROM programs')) {
      return mockProgramsDbRows;
    }
    if (sql.includes('FROM subjects')) {
      return mockSubjectsDbRows;
    }
    return [];
  });
});

test.after(async () => {
  academicReferenceRepository.resetQueryRunner();
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
// PHASE 5.8A TEST SUITE: ACADEMIC REFERENCE APIS
// =============================================================================

test('--- Phase 5.8A: Academic Reference API Test Suite ---', async (t) => {
  // 1. Unauthenticated request -> 401
  await t.test('1. Unauthenticated request to /api/v1/academic/sessions returns 401', async () => {
    const res = await makeRequest('/api/v1/academic/sessions');
    assert.equal(res.status, 401);
    assert.ok(res.body.error);
    assert.match(res.body.error, /Unauthorized/i);
  });

  await t.test('1b. Unauthenticated request to other academic endpoints returns 401', async () => {
    for (const endpoint of ['boards', 'classes', 'programs', 'subjects']) {
      const res = await makeRequest(`/api/v1/academic/${endpoint}`);
      assert.equal(res.status, 401, `Expected 401 for /api/v1/academic/${endpoint}`);
    }
  });

  // 2. Student -> allowed
  await t.test('2. Authenticated student can access academic reference APIs', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/academic/sessions', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.sessions));
  });

  // 3. Parent -> allowed
  await t.test('3. Authenticated parent can access academic reference APIs', async () => {
    const token = generateAccessToken(mockParentUser);
    const res = await makeRequest('/api/v1/academic/boards', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.boards));
  });

  // 4. Teacher -> allowed
  await t.test('4. Authenticated teacher can access academic reference APIs', async () => {
    const token = generateAccessToken(mockTeacherUser);
    const res = await makeRequest('/api/v1/academic/classes', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.classes));
  });

  // 5. Admin -> allowed
  await t.test('5. Authenticated admin can access academic reference APIs', async () => {
    const token = generateAccessToken(mockAdminUser);
    const res = await makeRequest('/api/v1/academic/programs', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.programs));
  });

  // 6. Successful sessions retrieval
  await t.test('6. GET /api/v1/academic/sessions returns normalized session list', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/academic/sessions', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.sessions.length, 2);
    assert.equal(res.body.meta.count, 2);

    const first = res.body.data.sessions[0];
    assert.equal(first.id, 'sess_2026_27');
    assert.equal(first.sessionCode, '2026-27');
    assert.equal(first.displayName, 'Academic Year 2026-2027');
    assert.equal(first.startDate, '2026-04-01');
    assert.equal(first.endDate, '2027-03-31');
    assert.equal(first.status, 'active');
  });

  // 7. Successful boards retrieval
  await t.test('7. GET /api/v1/academic/boards returns normalized board list', async () => {
    const token = generateAccessToken(mockTeacherUser);
    const res = await makeRequest('/api/v1/academic/boards', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.boards.length, 2);

    const cbse = res.body.data.boards.find((b) => b.code === 'CBSE');
    assert.ok(cbse);
    assert.equal(cbse.name, 'Central Board of Secondary Education');
    assert.equal(cbse.status, 'active');
  });

  // 8. Successful classes retrieval
  await t.test('8. GET /api/v1/academic/classes returns normalized class list ordered by grade', async () => {
    const token = generateAccessToken(mockParentUser);
    const res = await makeRequest('/api/v1/academic/classes', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.classes.length, 2);

    const cls9 = res.body.data.classes[0];
    assert.equal(cls9.gradeNumber, 9);
    assert.equal(cls9.code, 'CLASS_09');
    assert.equal(cls9.displayName, 'Class 9');
    assert.equal(cls9.stage, 'secondary');
  });

  // 9. Successful programs retrieval
  await t.test('9. GET /api/v1/academic/programs returns reusable program tracks', async () => {
    const token = generateAccessToken(mockAdminUser);
    const res = await makeRequest('/api/v1/academic/programs', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.programs.length, 2);

    const ach = res.body.data.programs.find((p) => p.code === 'achievers');
    assert.ok(ach);
    assert.equal(ach.name, 'Achievers Board Excellence');
  });

  // 10. Successful subjects retrieval & Science component modeling
  await t.test('10. GET /api/v1/academic/subjects preserves parentSubjectId relationship', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/academic/subjects', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.subjects.length, 3);

    // Independent subject
    const math = res.body.data.subjects.find((s) => s.code === 'MATH');
    assert.ok(math);
    assert.equal(math.parentSubjectId, null);

    // Parent master subject
    const sci = res.body.data.subjects.find((s) => s.code === 'SCIENCE');
    assert.ok(sci);
    assert.equal(sci.parentSubjectId, null);

    // Sub-discipline component
    const phy = res.body.data.subjects.find((s) => s.code === 'PHYSICS');
    assert.ok(phy);
    assert.equal(phy.parentSubjectId, 'sub_sci');
  });

  // 11. Safe response fields (no sensitive leaks)
  await t.test('11. Safe response fields: no passwords, tokens, or private security fields leaked', async () => {
    const token = generateAccessToken(mockStudentUser);
    const endpoints = ['sessions', 'boards', 'classes', 'programs', 'subjects'];

    for (const ep of endpoints) {
      const res = await makeRequest(`/api/v1/academic/${ep}`, token);
      const jsonStr = JSON.stringify(res.body);

      assert.doesNotMatch(jsonStr, /password/i);
      assert.doesNotMatch(jsonStr, /token_hash/i);
      assert.doesNotMatch(jsonStr, /failed_login_attempts/i);
      assert.doesNotMatch(jsonStr, /locked_until/i);
    }
  });

  // 12. Parameterized SQL / repository safety
  await t.test('12. Repository functions use explicit column lists and never SELECT *', async () => {
    const fs = await import('fs');
    const repoPath = new URL('../server/repositories/academicReferenceRepository.js', import.meta.url);
    const repoContent = fs.readFileSync(repoPath, 'utf-8');

    assert.doesNotMatch(repoContent, /SELECT\s+\*/i, 'Repositories must never use SELECT *');
    assert.match(repoContent, /session_code/i);
    assert.match(repoContent, /grade_number/i);
    assert.match(repoContent, /parent_subject_id/i);
  });

  // 13. Proper error envelope
  await t.test('13. Service failure triggers standardized 500 error envelope', async () => {
    const token = generateAccessToken(mockAdminUser);

    // Temporarily inject error into repository
    academicReferenceRepository.setQueryRunner(async () => {
      throw new Error('Database connection lost');
    });

    const res = await makeRequest('/api/v1/academic/sessions', token);
    assert.equal(res.status, 500);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'INTERNAL_SERVER_ERROR');
    assert.equal(res.body.error.message, 'An unexpected internal error occurred.');
    // Must NOT leak raw database error message
    assert.doesNotMatch(JSON.stringify(res.body), /Database connection lost/);

    // Restore query runner
    academicReferenceRepository.setQueryRunner(async (sql) => {
      if (sql.includes('FROM academic_sessions')) return mockSessionsDbRows;
      return [];
    });
  });

  // 14. Service unit functions work in isolation
  await t.test('14. Service unit tests verify isolated transformation', async () => {
    const customQuery = async (sql) => {
      if (sql.includes('FROM boards')) return mockBoardsDbRows;
      return [];
    };

    const boards = await getAcademicBoards(customQuery);
    assert.equal(boards.length, 2);
    assert.equal(boards[0].code, 'CBSE');
  });
});
