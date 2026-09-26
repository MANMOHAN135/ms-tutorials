-- =============================================================================
-- Migration: 002_create_academic_tables.sql
-- Description: Create Phase 5.7A Academic Core Domain Tables
-- Engine: MySQL 8.0 (InnoDB)
-- Character Set: utf8mb4 / Collation: utf8mb4_unicode_ci
-- Depends on: 001_create_identity_tables.sql (students, users)
-- =============================================================================

-- Disable foreign key checks during migration
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. academic_sessions: Institutional School Calendar & Enrollment Sessions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS academic_sessions (
    id VARCHAR(36) NOT NULL,
    session_code VARCHAR(20) NOT NULL COMMENT 'e.g. 2026-27',
    display_name VARCHAR(100) NOT NULL COMMENT 'e.g. Academic Year 2026-2027',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('upcoming', 'active', 'completed') NOT NULL DEFAULT 'upcoming',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_academic_sessions_code (session_code),
    INDEX idx_academic_sessions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. boards: Educational Boards Prescribing Curricula & Examinations
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS boards (
    id VARCHAR(36) NOT NULL,
    code VARCHAR(20) NOT NULL COMMENT 'e.g. CBSE, ICSE',
    name VARCHAR(150) NOT NULL COMMENT 'Full educational board name',
    description TEXT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_boards_code (code),
    INDEX idx_boards_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. classes: Academic Grade Standards (Classes 6 through 10)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(36) NOT NULL,
    grade_number TINYINT UNSIGNED NOT NULL COMMENT 'Integer grade standard: 6, 7, 8, 9, 10',
    code VARCHAR(20) NOT NULL COMMENT 'e.g. CLASS_09',
    display_name VARCHAR(50) NOT NULL COMMENT 'e.g. Class 9',
    stage ENUM('middle_school', 'secondary') NOT NULL DEFAULT 'secondary',
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_classes_grade_number (grade_number),
    UNIQUE KEY uq_classes_code (code),
    INDEX idx_classes_stage (stage),
    INDEX idx_classes_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. programs: Reusable Pedagogical Tracks & Academic Rigor Standards
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS programs (
    id VARCHAR(36) NOT NULL,
    code VARCHAR(30) NOT NULL COMMENT 'e.g. achievers, explorers, foundation, remedial',
    name VARCHAR(100) NOT NULL COMMENT 'e.g. Achievers Board Excellence',
    description TEXT NULL,
    target_stage ENUM('middle_school', 'secondary', 'all') NOT NULL DEFAULT 'secondary',
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_programs_code (code),
    INDEX idx_programs_target_stage (target_stage),
    INDEX idx_programs_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. subjects: Master Catalog of Academic Disciplines
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(36) NOT NULL,
    code VARCHAR(30) NOT NULL COMMENT 'e.g. MATH, SCIENCE, PHYSICS, CHEMISTRY, BIOLOGY',
    name VARCHAR(100) NOT NULL COMMENT 'e.g. Mathematics, Science',
    parent_subject_id VARCHAR(36) NULL COMMENT 'Self-referencing FK for sub-disciplines (e.g. Science -> Physics)',
    color_code VARCHAR(10) NULL COMMENT 'Hex color for UI theme, e.g. #0066CC',
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_subjects_code (code),
    INDEX idx_subjects_parent (parent_subject_id),
    INDEX idx_subjects_status (status),
    CONSTRAINT fk_subjects_parent FOREIGN KEY (parent_subject_id) 
        REFERENCES subjects (id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. curriculum_nodes: Physical Relational Bridge
-- Context: Academic Session + Board + Class + Subject + Version
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS curriculum_nodes (
    id VARCHAR(36) NOT NULL,
    session_id VARCHAR(36) NOT NULL COMMENT 'FK -> academic_sessions.id',
    board_id VARCHAR(36) NOT NULL COMMENT 'FK -> boards.id',
    class_id VARCHAR(36) NOT NULL COMMENT 'FK -> classes.id',
    subject_id VARCHAR(36) NOT NULL COMMENT 'FK -> subjects.id',
    syllabus_version VARCHAR(20) NOT NULL DEFAULT 'v1.0' COMMENT 'e.g. 2026.1',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_curriculum_node_context (session_id, board_id, class_id, subject_id, syllabus_version),
    INDEX idx_cn_lookup (board_id, class_id, subject_id),
    INDEX idx_cn_session (session_id),
    INDEX idx_cn_is_active (is_active),
    CONSTRAINT fk_cn_session FOREIGN KEY (session_id) 
        REFERENCES academic_sessions (id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_cn_board FOREIGN KEY (board_id) 
        REFERENCES boards (id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_cn_class FOREIGN KEY (class_id) 
        REFERENCES classes (id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_cn_subject FOREIGN KEY (subject_id) 
        REFERENCES subjects (id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. chapters: Pedagogical Unit of Study Under Specific CurriculumNode
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chapters (
    id VARCHAR(36) NOT NULL,
    curriculum_node_id VARCHAR(36) NOT NULL COMMENT 'FK -> curriculum_nodes.id',
    chapter_number SMALLINT UNSIGNED NOT NULL COMMENT 'Pedagogical order in curriculum',
    title VARCHAR(200) NOT NULL COMMENT 'e.g. Quadratic Equations',
    description TEXT NULL,
    estimated_teaching_hours DECIMAL(4,1) NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_chapters_sequence (curriculum_node_id, chapter_number),
    UNIQUE KEY uq_chapters_id_node (id, curriculum_node_id),
    INDEX idx_chapters_node (curriculum_node_id),
    INDEX idx_chapters_status (status),
    CONSTRAINT fk_chapters_cn FOREIGN KEY (curriculum_node_id) 
        REFERENCES curriculum_nodes (id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. topics: Atomic Concept Unit Within a Chapter
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS topics (
    id VARCHAR(36) NOT NULL,
    chapter_id VARCHAR(36) NOT NULL COMMENT 'FK -> chapters.id',
    sequence_order SMALLINT UNSIGNED NOT NULL COMMENT 'Atomic concept order in chapter',
    topic_code VARCHAR(50) NOT NULL COMMENT 'e.g. CBSE-09-MATH-CH02-TOP03 (unique within chapter)',
    title VARCHAR(200) NOT NULL COMMENT 'e.g. Factor Theorem & Algebraic Identities',
    description TEXT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_topics_chapter_sequence (chapter_id, sequence_order),
    UNIQUE KEY uq_topics_chapter_code (chapter_id, topic_code),
    UNIQUE KEY uq_topics_id_chapter (id, chapter_id),
    INDEX idx_topics_chapter (chapter_id),
    INDEX idx_topics_code (topic_code),
    INDEX idx_topics_status (status),
    CONSTRAINT fk_topics_chapter FOREIGN KEY (chapter_id) 
        REFERENCES chapters (id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. batches: Operational Cohorts (Nullable Board Scope)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS batches (
    id VARCHAR(36) NOT NULL,
    session_id VARCHAR(36) NOT NULL COMMENT 'FK -> academic_sessions.id',
    class_id VARCHAR(36) NOT NULL COMMENT 'FK -> classes.id',
    program_id VARCHAR(36) NOT NULL COMMENT 'FK -> programs.id',
    board_id VARCHAR(36) NULL COMMENT 'FK -> boards.id; NULL for combined/foundation cohorts',
    code VARCHAR(30) NOT NULL COMMENT 'e.g. BAT_2026_09_ACH_EV1',
    name VARCHAR(150) NOT NULL COMMENT 'e.g. Class 9 Achievers - Evening Mon/Wed/Fri',
    schedule_description VARCHAR(255) NULL COMMENT 'e.g. Mon, Wed, Fri 5:30 PM - 7:00 PM',
    max_students SMALLINT UNSIGNED NOT NULL DEFAULT 30,
    status ENUM('upcoming', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_batches_session_code (session_id, code),
    UNIQUE KEY uq_batches_context (id, session_id, class_id, program_id),
    INDEX idx_batches_session_class (session_id, class_id),
    INDEX idx_batches_board (board_id),
    INDEX idx_batches_program (program_id),
    INDEX idx_batches_status (status),
    CONSTRAINT fk_batches_session FOREIGN KEY (session_id) 
        REFERENCES academic_sessions (id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_batches_class FOREIGN KEY (class_id) 
        REFERENCES classes (id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_batches_program FOREIGN KEY (program_id) 
        REFERENCES programs (id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_batches_board FOREIGN KEY (board_id) 
        REFERENCES boards (id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. student_enrollments: Authoritative Student Academic Progression
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_enrollments (
    id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL COMMENT 'FK -> students.id (locked identity table)',
    session_id VARCHAR(36) NOT NULL COMMENT 'FK -> academic_sessions.id',
    board_id VARCHAR(36) NOT NULL COMMENT 'FK -> boards.id (Authoritative student board)',
    class_id VARCHAR(36) NOT NULL COMMENT 'FK -> classes.id (Authoritative student grade)',
    program_id VARCHAR(36) NOT NULL COMMENT 'FK -> programs.id (Authoritative track)',
    batch_id VARCHAR(36) NULL COMMENT 'FK -> batches.id (Assigned cohort; nullable prior to batch assignment)',
    enrollment_date DATE NOT NULL,
    status ENUM('active', 'completed', 'withdrawn', 'suspended') NOT NULL DEFAULT 'active',
    roll_number VARCHAR(20) NULL COMMENT 'Optional batch roll number',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_student_session_class (student_id, session_id, class_id),
    INDEX idx_enr_student (student_id),
    INDEX idx_enr_batch (batch_id),
    INDEX idx_enr_session_status (session_id, status),
    INDEX idx_enr_board_class (board_id, class_id),
    CONSTRAINT fk_enr_student FOREIGN KEY (student_id) 
        REFERENCES students (id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_enr_session FOREIGN KEY (session_id) 
        REFERENCES academic_sessions (id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_enr_board FOREIGN KEY (board_id) 
        REFERENCES boards (id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_enr_class FOREIGN KEY (class_id) 
        REFERENCES classes (id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_enr_program FOREIGN KEY (program_id) 
        REFERENCES programs (id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_enr_batch FOREIGN KEY (batch_id) 
        REFERENCES batches (id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    CONSTRAINT fk_enr_batch_context FOREIGN KEY (batch_id, session_id, class_id, program_id) 
        REFERENCES batches (id, session_id, class_id, program_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. learning_resources: Curated Instructional Assets
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS learning_resources (
    id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL COMMENT 'e.g. Polynomial Factorization Practice Sheet',
    description TEXT NULL,
    resource_type ENUM('notes', 'worksheet', 'important_questions', 'video', 'question_bank', 'summary_sheet') NOT NULL,
    curriculum_node_id VARCHAR(36) NOT NULL COMMENT 'FK -> curriculum_nodes.id (REQUIRED)',
    chapter_id VARCHAR(36) NULL COMMENT 'FK -> chapters.id (OPTIONAL)',
    topic_id VARCHAR(36) NULL COMMENT 'FK -> topics.id (OPTIONAL)',
    storage_type ENUM('local', 'cloud_s3', 'cdn', 'external_link') NOT NULL DEFAULT 'local',
    file_url VARCHAR(500) NOT NULL COMMENT 'Relative storage path or secure CDN URL',
    file_size_bytes BIGINT UNSIGNED NULL,
    mime_type VARCHAR(100) NULL COMMENT 'e.g. application/pdf, video/mp4',
    duration_seconds INT UNSIGNED NULL COMMENT 'For video assets',
    difficulty_level ENUM('foundation', 'standard', 'advanced') NOT NULL DEFAULT 'standard',
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_by VARCHAR(36) NOT NULL COMMENT 'FK -> users.id (locked identity table)',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_res_topic (topic_id),
    INDEX idx_res_chapter (chapter_id),
    INDEX idx_res_node (curriculum_node_id),
    INDEX idx_res_type (resource_type),
    INDEX idx_res_published (is_published),
    INDEX idx_res_uploaded_by (uploaded_by),
    CONSTRAINT chk_learning_resources_hierarchy CHECK (topic_id IS NULL OR chapter_id IS NOT NULL),
    CONSTRAINT fk_res_cn FOREIGN KEY (curriculum_node_id) 
        REFERENCES curriculum_nodes (id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_res_chapter_node FOREIGN KEY (chapter_id, curriculum_node_id) 
        REFERENCES chapters (id, curriculum_node_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_res_topic_chapter FOREIGN KEY (topic_id, chapter_id) 
        REFERENCES topics (id, chapter_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_res_user FOREIGN KEY (uploaded_by) 
        REFERENCES users (id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
