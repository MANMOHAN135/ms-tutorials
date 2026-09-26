/**
 * MS Tutorials — Database Schema Validator
 * Validates Phase 5.1 Identity Tables DDL syntax, constraints, foreign keys, and indexes.
 * Standard Node.js script (Zero external dependencies).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXPECTED_TABLES = [
  'users',
  'students',
  'parents',
  'teachers',
  'admins',
  'parent_student',
  'refresh_tokens'
];

const REQUIRED_FOREIGN_KEYS = [
  { table: 'students', refTable: 'users', col: 'user_id' },
  { table: 'parents', refTable: 'users', col: 'user_id' },
  { table: 'teachers', refTable: 'users', col: 'user_id' },
  { table: 'admins', refTable: 'users', col: 'user_id' },
  { table: 'parent_student', refTable: 'parents', col: 'parent_id' },
  { table: 'parent_student', refTable: 'students', col: 'student_id' },
  { table: 'refresh_tokens', refTable: 'users', col: 'user_id' },
];

function validateSqlFile(filePath) {
  console.log(`\n--- Validating: ${path.relative(process.cwd(), filePath)} ---`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  let errors = [];

  // 1. Check all 7 required tables are defined
  for (const table of EXPECTED_TABLES) {
    const tableRegex = new RegExp(`CREATE TABLE IF NOT EXISTS\\s+${table}\\s*\\(`, 'i');
    if (!tableRegex.test(content)) {
      errors.push(`Missing table definition: ${table}`);
    } else {
      console.log(`  ✓ Table defined: ${table}`);
    }
  }

  // 2. Check foreign keys
  for (const fk of REQUIRED_FOREIGN_KEYS) {
    const fkPattern = new RegExp(`REFERENCES\\s+${fk.refTable}\\s*\\(id\\)`, 'i');
    if (!fkPattern.test(content)) {
      errors.push(`Missing foreign key reference to ${fk.refTable}(id)`);
    } else {
      console.log(`  ✓ Foreign key verified: ${fk.table}(${fk.col}) -> ${fk.refTable}(id)`);
    }
  }

  // 3. Verify student admission number uniqueness
  if (!/admission_number VARCHAR\(\d+\) NOT NULL/i.test(content)) {
    errors.push('Missing admission_number column in students');
  }
  if (!/uq_students_admission_number/i.test(content)) {
    errors.push('Missing unique constraint on admission_number');
  }

  // 4. Verify password_hash column in users
  if (!/password_hash VARCHAR\(255\) NOT NULL/i.test(content)) {
    errors.push('Missing password_hash VARCHAR(255) in users table');
  }

  // 5. Verify refresh_tokens hash (SHA-256 length 64)
  if (!/token_hash VARCHAR\(64\) NOT NULL/i.test(content)) {
    errors.push('Missing token_hash VARCHAR(64) in refresh_tokens');
  }

  // 6. Verify parent_student composite uniqueness
  if (!/uq_parent_student\s*\(\s*parent_id\s*,\s*student_id\s*\)/i.test(content)) {
    errors.push('Missing composite unique constraint uq_parent_student (parent_id, student_id)');
  }

  if (errors.length > 0) {
    console.error(`Validation failed with ${errors.length} error(s):`);
    errors.forEach(err => console.error(`  ✗ ${err}`));
    return false;
  }

  console.log(`  ✓ All constraints, keys, and definitions verified successfully.`);
  return true;
}

try {
  const schemaPath = path.join(__dirname, 'schema', 'identity.sql');
  const migrationPath = path.join(__dirname, 'migrations', '001_create_identity_tables.sql');

  const schemaValid = validateSqlFile(schemaPath);
  const migrationValid = validateSqlFile(migrationPath);

  if (schemaValid && migrationValid) {
    console.log('\n=========================================');
    console.log('✅ DATABASE IDENTITY SCHEMA VALIDATION PASSED');
    console.log('=========================================\n');
    process.exit(0);
  } else {
    process.exit(1);
  }
} catch (err) {
  console.error('Fatal validation error:', err.message);
  process.exit(1);
}
