import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../server/server.js';
import { generateAccessToken } from '../server/services/tokenService.js';
import studentRepository from '../server/repositories/studentRepository.js';
import parentRepository from '../server/repositories/parentRepository.js';
import teacherRepository from '../server/repositories/teacherRepository.js';
import adminRepository from '../server/repositories/adminRepository.js';
import { getStudentProfile } from '../server/services/studentService.js';
import { getParentProfile, getParentChildren } from '../server/services/parentService.js';
import { getTeacherProfile } from '../server/services/teacherService.js';
import { getAdminProfile } from '../server/services/adminService.js';

let server;
let baseUrl;

// Mock test fixtures
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

const mockStaffAdminUser = {
  id: 'usr_adm_002',
  role: 'admin',
  identifier: 'staff@mstutorials.com',
  full_name: 'Staff Coordinator',
};

// Database mock row fixtures
const studentDbRow = {
  user_id: 'usr_stu_001',
  identifier: 'AS26090',
  email: 'aditi@example.com',
  phone: '9876543210',
  full_name: 'Aditi Rao',
  role: 'student',
  status: 'active',
  student_id: 'stu_001',
  admission_number: 'AS26090',
  date_of_birth: new Date('2008-05-14'),
  gender: 'female',
  school_name: 'Delhi Public School',
  board: 'CBSE',
  academic_track: 'Achievers',
  address_text: '123 Park Street, Mumbai',
  created_at: new Date('2026-01-01T00:00:00Z'),
  updated_at: new Date('2026-01-01T00:00:00Z'),
};

const parentDbRow = {
  user_id: 'usr_par_001',
  identifier: 'parent@example.com',
  email: 'parent@example.com',
  phone: '9876543211',
  full_name: 'Suresh Rao',
  role: 'parent',
  status: 'active',
  parent_id: 'par_001',
  parent_code: 'PR26090',
  occupation: 'Software Engineer',
  alternate_phone: '9876543212',
  emergency_contact_phone: '9876543213',
  created_at: new Date('2026-01-01T00:00:00Z'),
  updated_at: new Date('2026-01-01T00:00:00Z'),
};

const linkedChildrenDbRows = [
  {
    student_id: 'stu_001',
    admission_number: 'AS26090',
    name: 'Aditi Rao',
    email: 'aditi@example.com',
    phone: '9876543210',
    relationship_type: 'father',
    is_primary_contact: 1,
    date_of_birth: new Date('2008-05-14'),
    gender: 'female',
    school_name: 'Delhi Public School',
    board: 'CBSE',
    academic_track: 'Achievers',
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
  },
  {
    student_id: 'stu_002',
    admission_number: 'AS26145',
    name: 'Rohan Rao',
    email: 'rohan@example.com',
    phone: '9876543219',
    relationship_type: 'father',
    is_primary_contact: 1,
    date_of_birth: new Date('2010-09-20'),
    gender: 'male',
    school_name: 'Delhi Public School',
    board: 'CBSE',
    academic_track: 'Foundation',
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
  },
];

const teacherDbRow = {
  user_id: 'usr_tch_001',
  identifier: 'faculty@mstutorials.com',
  email: 'faculty@mstutorials.com',
  phone: '9876543220',
  full_name: 'Dr. Vikram Seth',
  role: 'teacher',
  status: 'active',
  teacher_id: 'tch_001',
  faculty_code: 'TR2604',
  qualification: 'Ph.D. Mathematics',
  specialization: 'Pure Mathematics & Mechanics',
  joining_date: new Date('2024-06-01'),
  created_at: new Date('2026-01-01T00:00:00Z'),
  updated_at: new Date('2026-01-01T00:00:00Z'),
};

const adminDbRow = {
  user_id: 'usr_adm_001',
  identifier: 'admin@mstutorials.com',
  email: 'admin@mstutorials.com',
  phone: '9876543230',
  full_name: 'Principal Sharma',
  role: 'admin',
  status: 'active',
  admin_id: 'adm_001',
  admin_code: 'AD01',
  access_level: 'superadmin',
  department: 'Academic Governance',
  created_at: new Date('2026-01-01T00:00:00Z'),
  updated_at: new Date('2026-01-01T00:00:00Z'),
};

const staffAdminDbRow = {
  user_id: 'usr_adm_002',
  identifier: 'staff@mstutorials.com',
  email: 'staff@mstutorials.com',
  phone: '9876543231',
  full_name: 'Staff Coordinator',
  role: 'admin',
  status: 'active',
  admin_id: 'adm_002',
  admin_code: 'AD02',
  access_level: 'staff',
  department: 'Student Admissions',
  created_at: new Date('2026-01-01T00:00:00Z'),
  updated_at: new Date('2026-01-01T00:00:00Z'),
};

test.before(async () => {
  // Start server on ephemeral port
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });

  // Configure repositories with mock query handlers
  studentRepository.setQueryRunner(async (sql, params) => {
    if (params[0] === 'usr_stu_001') {
      return [studentDbRow];
    }
    return [];
  });

  parentRepository.setQueryRunner(async (sql, params) => {
    if (sql.includes('FROM parents') && params[0] === 'usr_par_001') {
      return [parentDbRow];
    }
    if (sql.includes('FROM parent_student') && params[0] === 'usr_par_001') {
      return linkedChildrenDbRows;
    }
    return [];
  });

  teacherRepository.setQueryRunner(async (sql, params) => {
    if (params[0] === 'usr_tch_001') {
      return [teacherDbRow];
    }
    return [];
  });

  adminRepository.setQueryRunner(async (sql, params) => {
    if (params[0] === 'usr_adm_001') {
      return [adminDbRow];
    }
    if (params[0] === 'usr_adm_002') {
      return [staffAdminDbRow];
    }
    return [];
  });
});

test.after(async () => {
  studentRepository.resetQueryRunner();
  parentRepository.resetQueryRunner();
  teacherRepository.resetQueryRunner();
  adminRepository.resetQueryRunner();

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('--- Phase 5.5: Protected Identity / Profile API Test Suite ---', async (t) => {

  // =========================================================================
  // Student Profile: Items 1 to 4
  // =========================================================================
  await t.test('1. Authenticated student can access own profile', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await fetch(`${baseUrl}/api/v1/student/profile`, {
      headers: { authorization: `Bearer ${token}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data?.profile);
    assert.equal(body.data.profile.userId, 'usr_stu_001');
    assert.equal(body.data.profile.admissionNumber, 'AS26090');
    assert.equal(body.data.profile.name, 'Aditi Rao');
    assert.equal(body.data.profile.schoolName, 'Delhi Public School');
    assert.equal(body.data.profile.board, 'CBSE');
    assert.equal(body.data.profile.academicTrack, 'Achievers');
    assert.equal(body.data.profile.dateOfBirth, '2008-05-14');
    assert.ok(body.meta?.timestamp);
  });

  await t.test('2. Student profile: unauthenticated request returns 401', async () => {
    const res = await fetch(`${baseUrl}/api/v1/student/profile`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.match(body.error, /access token is required/i);
  });

  await t.test('3. Student profile: non-student role receives 403', async () => {
    const parentToken = generateAccessToken(mockParentUser);
    const res = await fetch(`${baseUrl}/api/v1/student/profile`, {
      headers: { authorization: `Bearer ${parentToken}` },
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.match(body.error, /insufficient role permissions/i);
  });

  await t.test('4. Student profile: sensitive fields are not exposed', async () => {
    const token = generateAccessToken(mockStudentUser);
    const res = await fetch(`${baseUrl}/api/v1/student/profile`, {
      headers: { authorization: `Bearer ${token}` },
    });

    const body = await res.json();
    const profile = body.data.profile;

    assert.equal(profile.password_hash, undefined);
    assert.equal(profile.password, undefined);
    assert.equal(profile.failed_login_attempts, undefined);
    assert.equal(profile.locked_until, undefined);
    assert.equal(profile.refresh_tokens, undefined);
    assert.equal(profile.token_hash, undefined);
  });

  // =========================================================================
  // Parent Profile & Children: Items 5 to 10
  // =========================================================================
  await t.test('5. Authenticated parent can access own profile', async () => {
    const token = generateAccessToken(mockParentUser);
    const res = await fetch(`${baseUrl}/api/v1/parent/profile`, {
      headers: { authorization: `Bearer ${token}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data?.profile);
    assert.equal(body.data.profile.userId, 'usr_par_001');
    assert.equal(body.data.profile.name, 'Suresh Rao');
    assert.equal(body.data.profile.parentCode, 'PR26090');
    assert.equal(body.data.profile.occupation, 'Software Engineer');
    assert.equal(body.data.profile.emergencyContactPhone, '9876543213');
  });

  await t.test('6. Parent profile: unauthenticated request returns 401', async () => {
    const res = await fetch(`${baseUrl}/api/v1/parent/profile`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.match(body.error, /access token is required/i);
  });

  await t.test('7. Parent profile: non-parent role receives 403', async () => {
    const studentToken = generateAccessToken(mockStudentUser);
    const res = await fetch(`${baseUrl}/api/v1/parent/profile`, {
      headers: { authorization: `Bearer ${studentToken}` },
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.match(body.error, /insufficient role permissions/i);
  });

  await t.test('8. Parent receives only linked children', async () => {
    const token = generateAccessToken(mockParentUser);
    const res = await fetch(`${baseUrl}/api/v1/parent/children`, {
      headers: { authorization: `Bearer ${token}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data?.children));
    assert.equal(body.data.children[0].admissionNumber, 'AS26090');
    assert.equal(body.data.children[0].name, 'Aditi Rao');
    assert.equal(body.data.children[0].relationshipType, 'father');
    assert.equal(body.data.children[0].isPrimaryContact, true);
  });

  await t.test('9. Multiple linked children are returned', async () => {
    const token = generateAccessToken(mockParentUser);
    const res = await fetch(`${baseUrl}/api/v1/parent/children`, {
      headers: { authorization: `Bearer ${token}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.children.length, 2);
    assert.equal(body.data.children[0].admissionNumber, 'AS26090');
    assert.equal(body.data.children[1].admissionNumber, 'AS26145');
    assert.equal(body.meta.count, 2);
  });

  await t.test('10. Parent profile & children: sensitive fields are not exposed', async () => {
    const token = generateAccessToken(mockParentUser);
    const profileRes = await fetch(`${baseUrl}/api/v1/parent/profile`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const profileBody = await profileRes.json();
    assert.equal(profileBody.data.profile.password_hash, undefined);
    assert.equal(profileBody.data.profile.locked_until, undefined);

    const childrenRes = await fetch(`${baseUrl}/api/v1/parent/children`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const childrenBody = await childrenRes.json();
    for (const child of childrenBody.data.children) {
      assert.equal(child.password_hash, undefined);
      assert.equal(child.marks, undefined);
      assert.equal(child.attendance, undefined);
      assert.equal(child.fees, undefined);
      assert.equal(child.feedback, undefined);
    }
  });

  // =========================================================================
  // Teacher Profile: Items 11 to 13
  // =========================================================================
  await t.test('11. Authenticated teacher can access own profile', async () => {
    const token = generateAccessToken(mockTeacherUser);
    const res = await fetch(`${baseUrl}/api/v1/teacher/profile`, {
      headers: { authorization: `Bearer ${token}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data?.profile);
    assert.equal(body.data.profile.userId, 'usr_tch_001');
    assert.equal(body.data.profile.facultyCode, 'TR2604');
    assert.equal(body.data.profile.qualification, 'Ph.D. Mathematics');
    assert.equal(body.data.profile.specialization, 'Pure Mathematics & Mechanics');
    assert.equal(body.data.profile.joiningDate, '2024-06-01');
  });

  await t.test('12. Teacher profile: unauthenticated request returns 401', async () => {
    const res = await fetch(`${baseUrl}/api/v1/teacher/profile`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.match(body.error, /access token is required/i);
  });

  await t.test('13. Teacher profile: non-teacher role receives 403', async () => {
    const studentToken = generateAccessToken(mockStudentUser);
    const res = await fetch(`${baseUrl}/api/v1/teacher/profile`, {
      headers: { authorization: `Bearer ${studentToken}` },
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.match(body.error, /insufficient role permissions/i);
  });

  // =========================================================================
  // Admin Profile: Items 14 to 17
  // =========================================================================
  await t.test('14. Authenticated admin can access own profile', async () => {
    const token = generateAccessToken(mockAdminUser);
    const res = await fetch(`${baseUrl}/api/v1/admin/profile`, {
      headers: { authorization: `Bearer ${token}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data?.profile);
    assert.equal(body.data.profile.userId, 'usr_adm_001');
    assert.equal(body.data.profile.adminCode, 'AD01');
    assert.equal(body.data.profile.accessLevel, 'superadmin');
    assert.equal(body.data.profile.department, 'Academic Governance');
  });

  await t.test('15. Admin profile: unauthenticated request returns 401', async () => {
    const res = await fetch(`${baseUrl}/api/v1/admin/profile`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.match(body.error, /access token is required/i);
  });

  await t.test('16. Admin profile: non-admin role receives 403', async () => {
    const teacherToken = generateAccessToken(mockTeacherUser);
    const res = await fetch(`${baseUrl}/api/v1/admin/profile`, {
      headers: { authorization: `Bearer ${teacherToken}` },
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.match(body.error, /insufficient role permissions/i);
  });

  await t.test('17. Admin access_level is handled without inventing new permissions', async () => {
    const staffToken = generateAccessToken(mockStaffAdminUser);
    const res = await fetch(`${baseUrl}/api/v1/admin/profile`, {
      headers: { authorization: `Bearer ${staffToken}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.profile.accessLevel, 'staff');
    assert.equal(body.data.profile.department, 'Student Admissions');
  });

  // =========================================================================
  // Additional Scenarios: 404 Behavior & Service Unit Tests
  // =========================================================================
  await t.test('18. Missing profile record returns 404 NOT_FOUND safely', async () => {
    const ghostUser = {
      id: 'usr_ghost_001',
      role: 'student',
      identifier: 'AS99999',
      full_name: 'Ghost Student',
    };
    const token = generateAccessToken(ghostUser);
    const res = await fetch(`${baseUrl}/api/v1/student/profile`, {
      headers: { authorization: `Bearer ${token}` },
    });

    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'PROFILE_NOT_FOUND');
    assert.match(body.error.message, /student profile not found/i);
  });

  await t.test('19. Service Unit: getStudentProfile requires valid userId', async () => {
    await assert.rejects(async () => {
      await getStudentProfile(null);
    }, /user id is required/i);
  });

  await t.test('20. Service Unit: getParentChildren returns null if parent does not exist', async () => {
    const mockQuery = async () => [];
    const children = await getParentChildren('non_existent_user', mockQuery);
    assert.equal(children, null);
  });
});
