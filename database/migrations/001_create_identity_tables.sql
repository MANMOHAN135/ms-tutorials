-- =============================================================================
-- Migration: 001_create_identity_tables.sql
-- Description: Create core identity and authentication tables (Phase 5.1)
-- Tables: users, students, parents, teachers, admins, parent_student, refresh_tokens
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) NOT NULL,
    identifier VARCHAR(100) NOT NULL COMMENT 'Admission number (AS26090) or verified email',
    email VARCHAR(255) NULL COMMENT 'Recovery & notification email; unique when present',
    phone VARCHAR(20) NULL COMMENT 'Primary contact number',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Salted bcrypt one-way password hash',
    role ENUM('student', 'parent', 'teacher', 'admin') NOT NULL COMMENT 'Core authorization persona',
    full_name VARCHAR(150) NOT NULL COMMENT 'Legal display name',
    status ENUM('pending_activation', 'active', 'inactive', 'suspended') NOT NULL DEFAULT 'active' COMMENT 'Account lifecycle state',
    failed_login_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Brute-force protection counter',
    locked_until DATETIME NULL COMMENT 'Lockout expiry timestamp if rate limit breached',
    last_login_at DATETIME NULL COMMENT 'Timestamp of most recent successful authentication',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_identifier (identifier),
    UNIQUE KEY uq_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. students
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    admission_number VARCHAR(20) NOT NULL COMMENT 'Canonical identifier: AS26090 (AS | 26 | 09 | 0)',
    date_of_birth DATE NULL,
    gender ENUM('male', 'female', 'other') NULL,
    school_name VARCHAR(200) NULL,
    board ENUM('CBSE', 'ICSE', 'State_Board', 'Other') NULL,
    academic_track ENUM('Explorers', 'Achievers', 'Foundation', 'Remedial') NULL,
    address_text TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_students_user_id (user_id),
    UNIQUE KEY uq_students_admission_number (admission_number),
    INDEX idx_students_admission_number (admission_number),
    INDEX idx_students_board (board),
    INDEX idx_students_academic_track (academic_track),
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) 
        REFERENCES users (id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. parents
CREATE TABLE IF NOT EXISTS parents (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    parent_code VARCHAR(20) NOT NULL COMMENT 'Canonical parent identifier: PR26090',
    occupation VARCHAR(100) NULL,
    alternate_phone VARCHAR(20) NULL,
    emergency_contact_phone VARCHAR(20) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_parents_user_id (user_id),
    UNIQUE KEY uq_parents_code (parent_code),
    INDEX idx_parents_parent_code (parent_code),
    CONSTRAINT fk_parents_user FOREIGN KEY (user_id) 
        REFERENCES users (id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. teachers
CREATE TABLE IF NOT EXISTS teachers (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    faculty_code VARCHAR(20) NOT NULL COMMENT 'Canonical faculty identifier: TR2604',
    qualification VARCHAR(150) NULL,
    specialization VARCHAR(150) NULL COMMENT 'E.g. Pure Mathematics & Mechanics',
    joining_date DATE NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_teachers_user_id (user_id),
    UNIQUE KEY uq_teachers_code (faculty_code),
    INDEX idx_teachers_faculty_code (faculty_code),
    CONSTRAINT fk_teachers_user FOREIGN KEY (user_id) 
        REFERENCES users (id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. admins
CREATE TABLE IF NOT EXISTS admins (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    admin_code VARCHAR(20) NOT NULL COMMENT 'Canonical admin identifier: AD01',
    access_level ENUM('superadmin', 'staff') NOT NULL DEFAULT 'staff',
    department VARCHAR(100) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_admins_user_id (user_id),
    UNIQUE KEY uq_admins_code (admin_code),
    INDEX idx_admins_access_level (access_level),
    CONSTRAINT fk_admins_user FOREIGN KEY (user_id) 
        REFERENCES users (id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. parent_student
CREATE TABLE IF NOT EXISTS parent_student (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    parent_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    relationship_type ENUM('father', 'mother', 'guardian') NOT NULL,
    is_primary_contact BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_parent_student (parent_id, student_id),
    INDEX idx_parent_student_parent (parent_id),
    INDEX idx_parent_student_student (student_id),
    CONSTRAINT fk_ps_parent FOREIGN KEY (parent_id) 
        REFERENCES parents (id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_ps_student FOREIGN KEY (student_id) 
        REFERENCES students (id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. refresh_tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    token_hash VARCHAR(64) NOT NULL COMMENT 'SHA-256 cryptographic hash of refresh token',
    device_fingerprint VARCHAR(255) NULL COMMENT 'Client User-Agent / client identifier',
    ip_address VARCHAR(45) NULL COMMENT 'IPv4 (15 chars) or IPv6 (45 chars)',
    expires_at DATETIME NOT NULL COMMENT 'Configurable expiry threshold (proposed default: 7 days)',
    revoked_at DATETIME NULL COMMENT 'Revocation timestamp; NULL if active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_refresh_tokens_hash (token_hash),
    INDEX idx_refresh_tokens_user_id (user_id),
    INDEX idx_refresh_tokens_expires_at (expires_at),
    INDEX idx_refresh_tokens_revoked_at (revoked_at),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) 
        REFERENCES users (id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
