import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import fs from 'fs';
import app from '../server/server.js';
import { generateAccessToken } from '../server/services/tokenService.js';
import curriculumRepository from '../server/repositories/curriculumRepository.js';
import academicReferenceRepository from '../server/repositories/academicReferenceRepository.js';
import {
  getCurriculumNodes,
  getCurriculumNodeById,
  getChaptersByNodeId,
  getChapterById,
  getTopicsByChapterId,
  getTopicById,
} from '../server/services/curriculumService.js';

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
const mockNodesDbRows = [
  {
    id: 'cn_cbse_10_math',
    session_id: 'sess_2026_27',
    board_id: 'brd_cbse',
    class_id: 'cls_10',
    subject_id: 'sub_math',
    syllabus_version: '2026.1',
    is_active: 1,
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
  },
  {
    id: 'cn_cbse_10_sci',
    session_id: 'sess_2026_27',
    board_id: 'brd_cbse',
    class_id: 'cls_10',
    subject_id: 'sub_sci',
    syllabus_version: '2026.1',
    is_active: 1,
    created_at: new Date('2026-01-02T00:00:00Z'),
    updated_at: new Date('2026-01-02T00:00:00Z'),
  },
];

const mockChaptersDbRows = [
  {
    id: 'ch_real_num',
    curriculum_node_id: 'cn_cbse_10_math',
    chapter_number: 1,
    title: 'Real Numbers',
    description: 'Fundamental concepts of real numbers and arithmetic theorems',
    estimated_teaching_hours: 8.5,
    status: 'active',
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
  },
  {
    id: 'ch_quad_eq',
    curriculum_node_id: 'cn_cbse_10_math',
    chapter_number: 4,
    title: 'Quadratic Equations',
    description: 'Solutions of quadratic equations by factorization and quadratic formula',
    estimated_teaching_hours: 12.0,
    status: 'active',
    created_at: new Date('2026-01-02T00:00:00Z'),
    updated_at: new Date('2026-01-02T00:00:00Z'),
  },
  {
    id: 'ch_light_ref',
    curriculum_node_id: 'cn_cbse_10_sci',
    chapter_number: 9,
    title: 'Light - Reflection and Refraction',
    description: 'Spherical mirrors and lenses',
    estimated_teaching_hours: 10.0,
    status: 'active',
    created_at: new Date('2026-01-03T00:00:00Z'),
    updated_at: new Date('2026-01-03T00:00:00Z'),
  },
];

const mockTopicsDbRows = [
  {
    id: 'top_quad_01',
    chapter_id: 'ch_quad_eq',
    sequence_order: 1,
    topic_code: 'CBSE-10-MATH-CH04-TOP01',
    title: 'Standard Form of Quadratic Equation',
    description: 'Introduction to ax^2 + bx + c = 0',
    status: 'active',
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
  },
  {
    id: 'top_quad_02',
    chapter_id: 'ch_quad_eq',
    sequence_order: 2,
    topic_code: 'CBSE-10-MATH-CH04-TOP02',
    title: 'Solution by Factorisation',
    description: 'Splitting the middle term method',
    status: 'active',
    created_at: new Date('2026-01-02T00:00:00Z'),
    updated_at: new Date('2026-01-02T00:00:00Z'),
  },
  {
    id: 'top_quad_03',
    chapter_id: 'ch_quad_eq',
    sequence_order: 3,
    topic_code: 'CBSE-10-MATH-CH04-TOP03',
    title: 'Quadratic Formula & Nature of Roots',
    description: 'Discriminant and quadratic formula derivation',
    status: 'active',
    created_at: new Date('2026-01-03T00:00:00Z'),
    updated_at: new Date('2026-01-03T00:00:00Z'),
  },
  {
    id: 'top_real_01',
    chapter_id: 'ch_real_num',
    sequence_order: 1,
    topic_code: 'CBSE-10-MATH-CH01-TOP01',
    title: 'Fundamental Theorem of Arithmetic',
    description: 'Prime factorization theorem',
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

  // Mock curriculum query runner
  curriculumRepository.setQueryRunner(async (sql, params) => {
    if (sql.includes('FROM curriculum_nodes')) {
      if (sql.includes('WHERE id = ?')) {
        const node = mockNodesDbRows.find((n) => n.id === params[0]);
        return node ? [node] : [];
      }
      return mockNodesDbRows;
    }
    if (sql.includes('FROM chapters')) {
      if (sql.includes('WHERE id = ?')) {
        const ch = mockChaptersDbRows.find((c) => c.id === params[0]);
        return ch ? [ch] : [];
      }
      if (sql.includes('WHERE curriculum_node_id = ?')) {
        return mockChaptersDbRows.filter((c) => c.curriculum_node_id === params[0]);
      }
      return mockChaptersDbRows;
    }
    if (sql.includes('FROM topics')) {
      if (sql.includes('WHERE id = ?')) {
        const top = mockTopicsDbRows.find((t) => t.id === params[0]);
        return top ? [top] : [];
      }
      if (sql.includes('WHERE chapter_id = ?')) {
        return mockTopicsDbRows.filter((t) => t.chapter_id === params[0]);
      }
      return mockTopicsDbRows;
    }
    return [];
  });

  // Mock academic reference query runner for regression testing
  academicReferenceRepository.setQueryRunner(async (sql) => {
    if (sql.includes('FROM academic_sessions')) {
      return [{ id: 'sess_2026_27', session_code: '2026-27', display_name: '2026-2027', start_date: new Date('2026-04-01'), end_date: new Date('2027-03-31'), status: 'active', created_at: new Date(), updated_at: new Date() }];
    }
    return [];
  });
});

test.after(async () => {
  curriculumRepository.resetQueryRunner();
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
// PHASE 5.8B TEST SUITE: READ-ONLY CURRICULUM APIS
// =============================================================================

test('--- Phase 5.8B: Curriculum API Test Suite ---', async (t) => {
  // 1. Unauthenticated nodes request -> 401
  await t.test('1. Unauthenticated nodes request -> 401', async () => {
    const res = await makeRequest('/api/v1/curriculum/nodes');
    assert.equal(res.status, 401);
    assert.ok(res.body.error);
  });

  // 2. Unauthenticated node detail -> 401
  await t.test('2. Unauthenticated node detail -> 401', async () => {
    const res = await makeRequest('/api/v1/curriculum/nodes/cn_cbse_10_math');
    assert.equal(res.status, 401);
    assert.ok(res.body.error);
  });

  // 3. Unauthenticated chapter request -> 401
  await t.test('3. Unauthenticated chapter request -> 401', async () => {
    const res = await makeRequest('/api/v1/curriculum/chapters/ch_quad_eq');
    assert.equal(res.status, 401);
    assert.ok(res.body.error);
  });

  // 4. Unauthenticated topic request -> 401
  await t.test('4. Unauthenticated topic request -> 401', async () => {
    const res = await makeRequest('/api/v1/curriculum/topics/top_quad_01');
    assert.equal(res.status, 401);
    assert.ok(res.body.error);
  });

  // 5. Student can access curriculum APIs
  await t.test('5. Student can access curriculum APIs', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/curriculum/nodes', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.nodes));
  });

  // 6. Parent can access curriculum APIs
  await t.test('6. Parent can access curriculum APIs', async () => {
    const token = generateAccessToken(mockParentUser);
    const res = await makeRequest('/api/v1/curriculum/nodes/cn_cbse_10_math', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.node.id, 'cn_cbse_10_math');
  });

  // 7. Teacher can access curriculum APIs
  await t.test('7. Teacher can access curriculum APIs', async () => {
    const token = generateAccessToken(mockTeacherUser);
    const res = await makeRequest('/api/v1/curriculum/chapters/ch_quad_eq', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.chapter.id, 'ch_quad_eq');
  });

  // 8. Admin can access curriculum APIs
  await t.test('8. Admin can access curriculum APIs', async () => {
    const token = generateAccessToken(mockAdminUser);
    const res = await makeRequest('/api/v1/curriculum/topics/top_quad_01', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.topic.id, 'top_quad_01');
  });

  // 9. Nodes return normalized data
  await t.test('9. Nodes return normalized data', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/curriculum/nodes', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.nodes.length, 2);
    assert.equal(res.body.meta.count, 2);

    const firstNode = res.body.data.nodes[0];
    assert.equal(firstNode.id, 'cn_cbse_10_math');
    assert.equal(firstNode.sessionId, 'sess_2026_27');
    assert.equal(firstNode.boardId, 'brd_cbse');
    assert.equal(firstNode.classId, 'cls_10');
    assert.equal(firstNode.subjectId, 'sub_math');
    assert.equal(firstNode.syllabusVersion, '2026.1');
    assert.equal(firstNode.isActive, true);
    assert.ok(firstNode.createdAt);
  });

  // 10. Node detail returns the requested node
  await t.test('10. Node detail returns the requested node', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/curriculum/nodes/cn_cbse_10_sci', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.node.id, 'cn_cbse_10_sci');
    assert.equal(res.body.data.node.subjectId, 'sub_sci');
  });

  // 11. Missing node returns 404
  await t.test('11. Missing node returns 404', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/curriculum/nodes/cn_non_existent', token);
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'NOT_FOUND');
    assert.match(res.body.error.message, /Curriculum node not found/i);
  });

  // 12. Node chapters return only chapters belonging to that node
  await t.test('12. Node chapters return only chapters belonging to that node', async () => {
    const token = generateAccessToken(mockTeacherUser);
    const res = await makeRequest('/api/v1/curriculum/nodes/cn_cbse_10_math/chapters', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.chapters.length, 2);
    assert.equal(res.body.meta.count, 2);

    for (const chapter of res.body.data.chapters) {
      assert.equal(chapter.curriculumNodeId, 'cn_cbse_10_math');
    }

    // Chapters for Science node
    const resSci = await makeRequest('/api/v1/curriculum/nodes/cn_cbse_10_sci/chapters', token);
    assert.equal(resSci.status, 200);
    assert.equal(resSci.body.data.chapters.length, 1);
    assert.equal(resSci.body.data.chapters[0].id, 'ch_light_ref');
    assert.equal(resSci.body.data.chapters[0].curriculumNodeId, 'cn_cbse_10_sci');

    // Missing node chapters -> 404
    const resMissing = await makeRequest('/api/v1/curriculum/nodes/cn_non_existent/chapters', token);
    assert.equal(resMissing.status, 404);
    assert.equal(resMissing.body.error.code, 'NOT_FOUND');
  });

  // 13. Missing chapter returns 404
  await t.test('13. Missing chapter returns 404', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/curriculum/chapters/ch_missing', token);
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'NOT_FOUND');
    assert.match(res.body.error.message, /Chapter not found/i);
  });

  // 14. Chapter topics return only topics belonging to that chapter
  await t.test('14. Chapter topics return only topics belonging to that chapter', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/curriculum/chapters/ch_quad_eq/topics', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.topics.length, 3);
    assert.equal(res.body.meta.count, 3);

    for (const topic of res.body.data.topics) {
      assert.equal(topic.chapterId, 'ch_quad_eq');
    }

    // Missing chapter topics -> 404
    const resMissing = await makeRequest('/api/v1/curriculum/chapters/ch_missing/topics', token);
    assert.equal(resMissing.status, 404);
    assert.equal(resMissing.body.error.code, 'NOT_FOUND');
  });

  // 15. Missing topic returns 404
  await t.test('15. Missing topic returns 404', async () => {
    const token = generateAccessToken(mockAdminUser);
    const res = await makeRequest('/api/v1/curriculum/topics/top_missing', token);
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'NOT_FOUND');
    assert.match(res.body.error.message, /Topic not found/i);
  });

  // 16. Chapters are ordered using chapter_number
  await t.test('16. Chapters are ordered using chapter_number', async () => {
    const repoPath = new URL('../server/repositories/curriculumRepository.js', import.meta.url);
    const content = fs.readFileSync(repoPath, 'utf-8');
    assert.match(content, /ORDER BY chapter_number ASC/i, 'Chapters must be ordered by chapter_number ASC');

    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/curriculum/nodes/cn_cbse_10_math/chapters', token);
    assert.equal(res.status, 200);
    const numbers = res.body.data.chapters.map((c) => c.chapterNumber);
    assert.deepEqual(numbers, [1, 4]);
  });

  // 17. Topics are ordered using sequence_order
  await t.test('17. Topics are ordered using sequence_order', async () => {
    const repoPath = new URL('../server/repositories/curriculumRepository.js', import.meta.url);
    const content = fs.readFileSync(repoPath, 'utf-8');
    assert.match(content, /ORDER BY sequence_order ASC/i, 'Topics must be ordered by sequence_order ASC');

    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/curriculum/chapters/ch_quad_eq/topics', token);
    assert.equal(res.status, 200);
    const sequences = res.body.data.topics.map((t) => t.sequenceOrder);
    assert.deepEqual(sequences, [1, 2, 3]);
  });

  // 18. Repository uses explicit column projection
  await t.test('18. Repository uses explicit column projection', async () => {
    const repoPath = new URL('../server/repositories/curriculumRepository.js', import.meta.url);
    const content = fs.readFileSync(repoPath, 'utf-8');

    assert.match(content, /syllabus_version/i);
    assert.match(content, /curriculum_node_id/i);
    assert.match(content, /chapter_number/i);
    assert.match(content, /sequence_order/i);
    assert.match(content, /topic_code/i);
  });

  // 19. Repository contains no SELECT *
  await t.test('19. Repository contains no SELECT *', async () => {
    const repoPath = new URL('../server/repositories/curriculumRepository.js', import.meta.url);
    const content = fs.readFileSync(repoPath, 'utf-8');
    assert.doesNotMatch(content, /SELECT\s+\*/i, 'curriculumRepository must never contain SELECT *');
  });

  // 20. Route IDs are parameterized
  await t.test('20. Route IDs are parameterized', async () => {
    let capturedParams = [];
    curriculumRepository.setQueryRunner(async (sql, params) => {
      capturedParams = params;
      if (sql.includes('FROM curriculum_nodes')) return [mockNodesDbRows[0]];
      if (sql.includes('FROM chapters')) return [mockChaptersDbRows[0]];
      if (sql.includes('FROM topics')) return [mockTopicsDbRows[0]];
      return [];
    });

    const token = generateAccessToken(mockStudentUser);
    await makeRequest('/api/v1/curriculum/nodes/target_node_param', token);
    assert.deepEqual(capturedParams, ['target_node_param']);

    await makeRequest('/api/v1/curriculum/chapters/target_chapter_param', token);
    assert.deepEqual(capturedParams, ['target_chapter_param']);

    await makeRequest('/api/v1/curriculum/topics/target_topic_param', token);
    assert.deepEqual(capturedParams, ['target_topic_param']);

    // Restore query runner
    curriculumRepository.setQueryRunner(async (sql, params) => {
      if (sql.includes('FROM curriculum_nodes')) {
        if (sql.includes('WHERE id = ?')) {
          const node = mockNodesDbRows.find((n) => n.id === params[0]);
          return node ? [node] : [];
        }
        return mockNodesDbRows;
      }
      if (sql.includes('FROM chapters')) {
        if (sql.includes('WHERE id = ?')) {
          const ch = mockChaptersDbRows.find((c) => c.id === params[0]);
          return ch ? [ch] : [];
        }
        if (sql.includes('WHERE curriculum_node_id = ?')) {
          return mockChaptersDbRows.filter((c) => c.curriculum_node_id === params[0]);
        }
        return mockChaptersDbRows;
      }
      if (sql.includes('FROM topics')) {
        if (sql.includes('WHERE id = ?')) {
          const top = mockTopicsDbRows.find((t) => t.id === params[0]);
          return top ? [top] : [];
        }
        if (sql.includes('WHERE chapter_id = ?')) {
          return mockTopicsDbRows.filter((t) => t.chapter_id === params[0]);
        }
        return mockTopicsDbRows;
      }
      return [];
    });
  });

  // 21. No request ID is interpolated into SQL
  await t.test('21. No request ID is interpolated into SQL', async () => {
    let capturedSql = '';
    curriculumRepository.setQueryRunner(async (sql, params) => {
      capturedSql = sql;
      return [];
    });

    const maliciousInput = "injection' OR '1'='1";
    const token = generateAccessToken(mockStudentUser);
    await makeRequest(`/api/v1/curriculum/nodes/${encodeURIComponent(maliciousInput)}`, token);

    assert.doesNotMatch(capturedSql, /injection/, 'SQL must not contain raw input string');
    assert.match(capturedSql, /WHERE id = \?/);

    // Restore query runner
    curriculumRepository.setQueryRunner(async (sql, params) => {
      if (sql.includes('FROM curriculum_nodes')) return mockNodesDbRows;
      return [];
    });
  });

  // 22. Internal repository/service failure returns safe 500 envelope
  await t.test('22. Internal repository/service failure returns safe 500 envelope', async () => {
    curriculumRepository.setQueryRunner(async () => {
      throw new Error('Database cluster timeout / ER_CONNECTION_TIMEOUT');
    });

    const token = generateAccessToken(mockAdminUser);
    const res = await makeRequest('/api/v1/curriculum/nodes', token);
    assert.equal(res.status, 500);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'INTERNAL_SERVER_ERROR');
    assert.equal(res.body.error.message, 'An unexpected internal error occurred.');
    assert.doesNotMatch(JSON.stringify(res.body), /Database cluster timeout/);
    assert.doesNotMatch(JSON.stringify(res.body), /ER_CONNECTION_TIMEOUT/);

    // Restore query runner
    curriculumRepository.setQueryRunner(async (sql, params) => {
      if (sql.includes('FROM curriculum_nodes')) return mockNodesDbRows;
      return [];
    });
  });

  // 23. Response does not expose sensitive/security fields
  await t.test('23. Response does not expose sensitive/security fields', async () => {
    const token = generateAccessToken(mockStudentUser);
    const endpoints = [
      '/api/v1/curriculum/nodes',
      '/api/v1/curriculum/nodes/cn_cbse_10_math',
      '/api/v1/curriculum/nodes/cn_cbse_10_math/chapters',
      '/api/v1/curriculum/chapters/ch_quad_eq',
      '/api/v1/curriculum/chapters/ch_quad_eq/topics',
      '/api/v1/curriculum/topics/top_quad_01',
    ];

    for (const ep of endpoints) {
      const res = await makeRequest(ep, token);
      const str = JSON.stringify(res.body);

      assert.doesNotMatch(str, /password/i);
      assert.doesNotMatch(str, /token_hash/i);
      assert.doesNotMatch(str, /failed_login/i);
      assert.doesNotMatch(str, /locked_until/i);
    }
  });

  // 24. Existing Phase 5.8A APIs continue working
  await t.test('24. Existing Phase 5.8A APIs continue working', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await makeRequest('/api/v1/academic/sessions', token);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.sessions));
  });

  // 25. Service unit functions work in direct isolation
  await t.test('25. Service unit functions work in direct isolation', async () => {
    const customQuery = async (sql, params) => {
      if (sql.includes('FROM curriculum_nodes')) {
        return mockNodesDbRows;
      }
      return [];
    };

    const nodes = await getCurriculumNodes(customQuery);
    assert.equal(nodes.length, 2);
    assert.equal(nodes[0].id, 'cn_cbse_10_math');
    assert.equal(nodes[0].syllabusVersion, '2026.1');
  });
});
