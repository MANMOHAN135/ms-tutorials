/**
 * MS Tutorials — Database Schema Validator
 * Validates Phase 5.1 Identity Tables (7 tables) and Phase 5.7A Academic Tables (11 tables).
 * Total: 18 tables across master schema and versioned migration files.
 * Standard Node.js script (Zero external dependencies).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================================================================
// IDENTITY DOMAIN (Phase 5.1 - 7 Tables)
// =============================================================================
const IDENTITY_TABLES = [
  'users',
  'students',
  'parents',
  'teachers',
  'admins',
  'parent_student',
  'refresh_tokens'
];

const IDENTITY_FOREIGN_KEYS = [
  { table: 'students', refTable: 'users', col: 'user_id' },
  { table: 'parents', refTable: 'users', col: 'user_id' },
  { table: 'teachers', refTable: 'users', col: 'user_id' },
  { table: 'admins', refTable: 'users', col: 'user_id' },
  { table: 'parent_student', refTable: 'parents', col: 'parent_id' },
  { table: 'parent_student', refTable: 'students', col: 'student_id' },
  { table: 'refresh_tokens', refTable: 'users', col: 'user_id' },
];

// =============================================================================
// ACADEMIC DOMAIN (Phase 5.7A - 11 Tables)
// =============================================================================
const ACADEMIC_TABLES = [
  'academic_sessions',
  'boards',
  'classes',
  'programs',
  'subjects',
  'curriculum_nodes',
  'chapters',
  'topics',
  'batches',
  'student_enrollments',
  'learning_resources'
];

const ACADEMIC_FOREIGN_KEYS = [
  { table: 'subjects', refTable: 'subjects', col: 'parent_subject_id' },
  { table: 'curriculum_nodes', refTable: 'academic_sessions', col: 'session_id' },
  { table: 'curriculum_nodes', refTable: 'boards', col: 'board_id' },
  { table: 'curriculum_nodes', refTable: 'classes', col: 'class_id' },
  { table: 'curriculum_nodes', refTable: 'subjects', col: 'subject_id' },
  { table: 'chapters', refTable: 'curriculum_nodes', col: 'curriculum_node_id' },
  { table: 'topics', refTable: 'chapters', col: 'chapter_id' },
  { table: 'batches', refTable: 'academic_sessions', col: 'session_id' },
  { table: 'batches', refTable: 'classes', col: 'class_id' },
  { table: 'batches', refTable: 'programs', col: 'program_id' },
  { table: 'batches', refTable: 'boards', col: 'board_id' },
  { table: 'student_enrollments', refTable: 'students', col: 'student_id' },
  { table: 'student_enrollments', refTable: 'academic_sessions', col: 'session_id' },
  { table: 'student_enrollments', refTable: 'boards', col: 'board_id' },
  { table: 'student_enrollments', refTable: 'classes', col: 'class_id' },
  { table: 'student_enrollments', refTable: 'programs', col: 'program_id' },
  { table: 'student_enrollments', refTable: 'batches', col: 'batch_id' },
  { table: 'student_enrollments', refTable: 'batches', col: 'batch_id, session_id, class_id, program_id' },
  { table: 'learning_resources', refTable: 'curriculum_nodes', col: 'curriculum_node_id' },
  { table: 'learning_resources', refTable: 'chapters', col: 'chapter_id, curriculum_node_id' },
  { table: 'learning_resources', refTable: 'topics', col: 'topic_id, chapter_id' },
  { table: 'learning_resources', refTable: 'users', col: 'uploaded_by' },
];

const ACADEMIC_UNIQUE_CONSTRAINTS = [
  { name: 'uq_academic_sessions_code', pattern: /uq_academic_sessions_code\s*\(\s*session_code\s*\)/i },
  { name: 'uq_boards_code', pattern: /uq_boards_code\s*\(\s*code\s*\)/i },
  { name: 'uq_classes_grade_number', pattern: /uq_classes_grade_number\s*\(\s*grade_number\s*\)/i },
  { name: 'uq_classes_code', pattern: /uq_classes_code\s*\(\s*code\s*\)/i },
  { name: 'uq_programs_code', pattern: /uq_programs_code\s*\(\s*code\s*\)/i },
  { name: 'uq_subjects_code', pattern: /uq_subjects_code\s*\(\s*code\s*\)/i },
  { name: 'uq_curriculum_node_context', pattern: /uq_curriculum_node_context\s*\(\s*session_id\s*,\s*board_id\s*,\s*class_id\s*,\s*subject_id\s*,\s*syllabus_version\s*\)/i },
  { name: 'uq_chapters_sequence', pattern: /uq_chapters_sequence\s*\(\s*curriculum_node_id\s*,\s*chapter_number\s*\)/i },
  { name: 'uq_chapters_id_node', pattern: /uq_chapters_id_node\s*\(\s*id\s*,\s*curriculum_node_id\s*\)/i },
  { name: 'uq_topics_chapter_sequence', pattern: /uq_topics_chapter_sequence\s*\(\s*chapter_id\s*,\s*sequence_order\s*\)/i },
  { name: 'uq_topics_chapter_code', pattern: /uq_topics_chapter_code\s*\(\s*chapter_id\s*,\s*topic_code\s*\)/i },
  { name: 'uq_topics_id_chapter', pattern: /uq_topics_id_chapter\s*\(\s*id\s*,\s*chapter_id\s*\)/i },
  { name: 'uq_batches_session_code', pattern: /uq_batches_session_code\s*\(\s*session_id\s*,\s*code\s*\)/i },
  { name: 'uq_batches_context', pattern: /uq_batches_context\s*\(\s*id\s*,\s*session_id\s*,\s*class_id\s*,\s*program_id\s*\)/i },
  { name: 'uq_student_session_class', pattern: /uq_student_session_class\s*\(\s*student_id\s*,\s*session_id\s*,\s*class_id\s*\)/i }
];

// =============================================================================
// ASSIGNMENT DOMAIN (Phase 5.10E-B - 6 Tables)
// =============================================================================
const ASSIGNMENT_TABLES = [
  'assignments',
  'assignment_targets',
  'student_assignments',
  'submissions',
  'submission_attachments',
  'evaluations'
];

const ASSIGNMENT_FOREIGN_KEYS = [
  { table: 'assignments', refTable: 'curriculum_nodes', col: 'curriculum_node_id' },
  { table: 'assignments', refTable: 'chapters', col: 'chapter_id, curriculum_node_id' },
  { table: 'assignments', refTable: 'topics', col: 'topic_id, chapter_id' },
  { table: 'assignments', refTable: 'users', col: 'created_by' },
  { table: 'assignment_targets', refTable: 'assignments', col: 'assignment_id' },
  { table: 'student_assignments', refTable: 'assignments', col: 'assignment_id' },
  { table: 'student_assignments', refTable: 'students', col: 'student_id' },
  { table: 'submissions', refTable: 'student_assignments', col: 'student_assignment_id' },
  { table: 'submission_attachments', refTable: 'submissions', col: 'submission_id' },
  { table: 'evaluations', refTable: 'submissions', col: 'submission_id' },
  { table: 'evaluations', refTable: 'teachers', col: 'evaluated_by' }
];

const ASSIGNMENT_UNIQUE_CONSTRAINTS = [
  { name: 'uq_asgn_target', pattern: /uq_asgn_target\s*\(\s*assignment_id\s*,\s*target_type\s*,\s*target_id\s*\)/i },
  { name: 'uq_student_assignment', pattern: /uq_student_assignment\s*\(\s*assignment_id\s*,\s*student_id\s*\)/i },
  { name: 'uq_submission_attempt', pattern: /uq_submission_attempt\s*\(\s*student_assignment_id\s*,\s*attempt_number\s*\)/i },
  { name: 'uq_evaluation_submission', pattern: /uq_evaluation_submission\s*\(\s*submission_id\s*\)/i }
];

function validateIdentitySqlFile(filePath) {
  console.log(`\n--- Validating Identity Schema: ${path.relative(process.cwd(), filePath)} ---`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  let errors = [];

  // 1. Check all 7 identity tables defined
  for (const table of IDENTITY_TABLES) {
    const tableRegex = new RegExp(`CREATE TABLE IF NOT EXISTS\\s+${table}\\s*\\(`, 'i');
    if (!tableRegex.test(content)) {
      errors.push(`Missing table definition: ${table}`);
    } else {
      console.log(`  ✓ Table defined: ${table}`);
    }
  }

  // 2. Check foreign keys
  for (const fk of IDENTITY_FOREIGN_KEYS) {
    const fkPattern = new RegExp(`REFERENCES\\s+${fk.refTable}\\s*\\(id\\)`, 'i');
    if (!fkPattern.test(content)) {
      errors.push(`Missing foreign key reference to ${fk.refTable}(id) in ${fk.table}`);
    } else {
      console.log(`  ✓ Foreign key verified: ${fk.table}(${fk.col}) -> ${fk.refTable}(id)`);
    }
  }

  // 3. Verify specific identity constraints
  if (!/admission_number VARCHAR\(\d+\) NOT NULL/i.test(content)) {
    errors.push('Missing admission_number column in students');
  }
  if (!/uq_students_admission_number/i.test(content)) {
    errors.push('Missing unique constraint on admission_number');
  }
  if (!/password_hash VARCHAR\(255\) NOT NULL/i.test(content)) {
    errors.push('Missing password_hash VARCHAR(255) in users table');
  }
  if (!/token_hash VARCHAR\(64\) NOT NULL/i.test(content)) {
    errors.push('Missing token_hash VARCHAR(64) in refresh_tokens');
  }
  if (!/uq_parent_student\s*\(\s*parent_id\s*,\s*student_id\s*\)/i.test(content)) {
    errors.push('Missing composite unique constraint uq_parent_student (parent_id, student_id)');
  }

  if (errors.length > 0) {
    console.error(`Identity validation failed with ${errors.length} error(s):`);
    errors.forEach(err => console.error(`  ✗ ${err}`));
    return false;
  }

  console.log(`  ✓ Identity constraints, keys, and definitions verified successfully.`);
  return true;
}

function validateAcademicSqlFile(filePath) {
  console.log(`\n--- Validating Academic Schema: ${path.relative(process.cwd(), filePath)} ---`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  let errors = [];

  // 1. Check all 11 academic tables defined
  for (const table of ACADEMIC_TABLES) {
    const tableRegex = new RegExp(`CREATE TABLE IF NOT EXISTS\\s+${table}\\s*\\(`, 'i');
    if (!tableRegex.test(content)) {
      errors.push(`Missing academic table definition: ${table}`);
    } else {
      console.log(`  ✓ Table defined: ${table}`);
    }
  }

  // 2. Check primary keys (UUID VARCHAR(36) for major domain entities)
  for (const table of ACADEMIC_TABLES) {
    const pkPattern = new RegExp(`CREATE TABLE IF NOT EXISTS\\s+${table}[\\s\\S]*?id\\s+VARCHAR\\(36\\)\\s+NOT\\s+NULL[\\s\\S]*?PRIMARY\\s+KEY\\s*\\(\\s*id\\s*\\)`, 'i');
    if (!pkPattern.test(content)) {
      errors.push(`Missing or invalid UUID primary key for table: ${table}`);
    } else {
      console.log(`  ✓ Primary key verified (UUID): ${table}(id)`);
    }
  }

  // 3. Check foreign keys
  for (const fk of ACADEMIC_FOREIGN_KEYS) {
    const isComposite = fk.col.includes(',');
    let fkPattern;
    if (isComposite) {
      const escapedCol = fk.col.replace(/,\s*/g, '\\s*,\\s*');
      fkPattern = new RegExp(`FOREIGN\\s+KEY\\s*\\(\\s*${escapedCol}\\s*\\)\\s*REFERENCES\\s+${fk.refTable}\\s*\\(\\s*id(?:\\s*,\\s*\\w+)+\\s*\\)`, 'i');
    } else {
      fkPattern = new RegExp(`FOREIGN\\s+KEY\\s*\\(\\s*${fk.col}\\s*\\)\\s*REFERENCES\\s+${fk.refTable}\\s*\\(id\\)`, 'i');
    }

    if (!fkPattern.test(content)) {
      errors.push(`Missing foreign key constraint: ${fk.table}(${fk.col}) -> ${fk.refTable}`);
    } else {
      console.log(`  ✓ Foreign key verified: ${fk.table}(${fk.col}) -> ${fk.refTable}`);
    }
  }

  // 4. Check unique constraints
  for (const uq of ACADEMIC_UNIQUE_CONSTRAINTS) {
    if (!uq.pattern.test(content)) {
      errors.push(`Missing unique constraint: ${uq.name}`);
    } else {
      console.log(`  ✓ Unique constraint verified: ${uq.name}`);
    }
  }

  // 5. Check hierarchical referential integrity check constraint on learning_resources
  if (!/chk_learning_resources_hierarchy\s+CHECK\s*\(\s*topic_id\s+IS\s+NULL\s+OR\s+chapter_id\s+IS\s+NOT\s+NULL\s*\)/i.test(content)) {
    errors.push('Missing check constraint chk_learning_resources_hierarchy on learning_resources');
  } else {
    console.log('  ✓ Check constraint verified: chk_learning_resources_hierarchy');
  }

  // 6. Check science subject self-reference
  if (!/parent_subject_id\s+VARCHAR\(36\)\s+NULL/i.test(content)) {
    errors.push('Missing parent_subject_id VARCHAR(36) in subjects table');
  } else {
    console.log('  ✓ Science self-referencing modeling verified: subjects(parent_subject_id)');
  }

  // 7. Check nullable board_id on batches
  if (!/board_id\s+VARCHAR\(36\)\s+NULL/i.test(content)) {
    errors.push('board_id in batches must be NULLable for combined cohorts');
  } else {
    console.log('  ✓ Nullable batch board scope verified: batches(board_id)');
  }

  // 8. Check curriculum_nodes context uniqueness
  if (!/uq_curriculum_node_context/i.test(content)) {
    errors.push('Missing unique constraint uq_curriculum_node_context');
  } else {
    console.log('  ✓ CurriculumNode uniqueness verified: uq_curriculum_node_context');
  }

  // 9. Check batch enrollment context composite integrity
  if (!/fk_enr_batch_context/i.test(content)) {
    errors.push('Missing composite foreign key fk_enr_batch_context on student_enrollments');
  } else {
    console.log('  ✓ Batch-enrollment context integrity verified: fk_enr_batch_context');
  }

  // 10. Check topic code scoped uniqueness within chapter
  if (!/uq_topics_chapter_code/i.test(content)) {
    errors.push('Missing chapter-scoped unique constraint uq_topics_chapter_code');
  } else {
    console.log('  ✓ Chapter-scoped topic_code uniqueness verified: uq_topics_chapter_code');
  }

  if (errors.length > 0) {
    console.error(`Academic validation failed with ${errors.length} error(s):`);
    errors.forEach(err => console.error(`  ✗ ${err}`));
    return false;
  }

  console.log(`  ✓ Academic constraints, keys, and definitions verified successfully.`);
  return true;
}

function validateAssignmentSqlFile(filePath) {
  console.log(`\n--- Validating Assignment Schema: ${path.relative(process.cwd(), filePath)} ---`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  let errors = [];

  // 1. Check all 6 assignment tables defined
  for (const table of ASSIGNMENT_TABLES) {
    const tableRegex = new RegExp(`CREATE TABLE IF NOT EXISTS\\s+${table}\\s*\\(`, 'i');
    if (!tableRegex.test(content)) {
      errors.push(`Missing assignment table definition: ${table}`);
    } else {
      console.log(`  ✓ Table defined: ${table}`);
    }
  }

  // 2. Check primary keys (UUID VARCHAR(36))
  for (const table of ASSIGNMENT_TABLES) {
    const pkPattern = new RegExp(`CREATE TABLE IF NOT EXISTS\\s+${table}[\\s\\S]*?id\\s+VARCHAR\\(36\\)\\s+NOT\\s+NULL[\\s\\S]*?PRIMARY\\s+KEY\\s*\\(\\s*id\\s*\\)`, 'i');
    if (!pkPattern.test(content)) {
      errors.push(`Missing or invalid UUID primary key for table: ${table}`);
    } else {
      console.log(`  ✓ Primary key verified (UUID): ${table}(id)`);
    }
  }

  // 3. Check foreign keys
  for (const fk of ASSIGNMENT_FOREIGN_KEYS) {
    const isComposite = fk.col.includes(',');
    let fkPattern;
    if (isComposite) {
      const escapedCol = fk.col.replace(/,\s*/g, '\\s*,\\s*');
      fkPattern = new RegExp(`FOREIGN\\s+KEY\\s*\\(\\s*${escapedCol}\\s*\\)\\s*REFERENCES\\s+${fk.refTable}\\s*\\(\\s*id(?:\\s*,\\s*\\w+)+\\s*\\)`, 'i');
    } else {
      fkPattern = new RegExp(`FOREIGN\\s+KEY\\s*\\(\\s*${fk.col}\\s*\\)\\s*REFERENCES\\s+${fk.refTable}\\s*\\(id\\)`, 'i');
    }

    if (!fkPattern.test(content)) {
      errors.push(`Missing foreign key constraint: ${fk.table}(${fk.col}) -> ${fk.refTable}`);
    } else {
      console.log(`  ✓ Foreign key verified: ${fk.table}(${fk.col}) -> ${fk.refTable}`);
    }
  }

  // 4. Check unique constraints
  for (const uq of ASSIGNMENT_UNIQUE_CONSTRAINTS) {
    if (!uq.pattern.test(content)) {
      errors.push(`Missing unique constraint: ${uq.name}`);
    } else {
      console.log(`  ✓ Unique constraint verified: ${uq.name}`);
    }
  }

  // 5. Check hierarchical check constraint on assignments
  if (!/chk_assignments_hierarchy\s+CHECK\s*\(\s*topic_id\s+IS\s+NULL\s+OR\s+chapter_id\s+IS\s+NOT\s+NULL\s*\)/i.test(content)) {
    errors.push('Missing check constraint chk_assignments_hierarchy on assignments');
  } else {
    console.log('  ✓ Check constraint verified: chk_assignments_hierarchy');
  }

  if (errors.length > 0) {
    console.error(`Assignment validation failed with ${errors.length} error(s):`);
    errors.forEach(err => console.error(`  ✗ ${err}`));
    return false;
  }

  console.log(`  ✓ Assignment constraints, keys, and definitions verified successfully.`);
  return true;
}

try {
  // Validate Identity Domain (Phase 5.1)
  const identitySchemaPath = path.join(__dirname, 'schema', 'identity.sql');
  const identityMigrationPath = path.join(__dirname, 'migrations', '001_create_identity_tables.sql');
  const identitySchemaValid = validateIdentitySqlFile(identitySchemaPath);
  const identityMigrationValid = validateIdentitySqlFile(identityMigrationPath);

  // Validate Academic Domain (Phase 5.7A)
  const academicSchemaPath = path.join(__dirname, 'schema', 'academic.sql');
  const academicMigrationPath = path.join(__dirname, 'migrations', '002_create_academic_tables.sql');
  const academicSchemaValid = validateAcademicSqlFile(academicSchemaPath);
  const academicMigrationValid = validateAcademicSqlFile(academicMigrationPath);

  // Validate Assignment Domain (Phase 5.10E-B)
  const assignmentSchemaPath = path.join(__dirname, 'schema', 'assignment.sql');
  const assignmentMigrationPath = path.join(__dirname, 'migrations', '003_create_assignment_tables.sql');
  const assignmentSchemaValid = validateAssignmentSqlFile(assignmentSchemaPath);
  const assignmentMigrationValid = validateAssignmentSqlFile(assignmentMigrationPath);

  if (identitySchemaValid && identityMigrationValid && academicSchemaValid && academicMigrationValid && assignmentSchemaValid && assignmentMigrationValid) {
    const totalTables = IDENTITY_TABLES.length + ACADEMIC_TABLES.length + ASSIGNMENT_TABLES.length;
    console.log('\n=============================================================================');
    console.log(`✅ DATABASE SCHEMA VALIDATION PASSED (Total: ${totalTables} Tables Verified)`);
    console.log(`   - Identity Domain (Phase 5.1): ${IDENTITY_TABLES.length} tables`);
    console.log(`   - Academic Domain (Phase 5.7A): ${ACADEMIC_TABLES.length} tables`);
    console.log(`   - Assignment Domain (Phase 5.10E-B): ${ASSIGNMENT_TABLES.length} tables`);
    console.log('=============================================================================\n');
    process.exit(0);
  } else {
    process.exit(1);
  }
} catch (err) {
  console.error('Fatal validation error:', err.message);
  process.exit(1);
}
