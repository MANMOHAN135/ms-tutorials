-- =============================================================================
-- MS Tutorials — Assignment Database Schema (Phase 5.10E-B)
-- Engine: MySQL 8.0 (InnoDB)
-- Character Set: utf8mb4 / Collation: utf8mb4_unicode_ci
-- Governing Blueprint: docs/assignment-architecture.md
-- Boundary: Extends Academic & Identity domains without modifying locked tables
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. assignments: Master Assignment Definitions
-- Anchored to curriculum hierarchy; authored by teachers or admins
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assignments (
    id VARCHAR(36) NOT NULL,
    curriculum_node_id VARCHAR(36) NOT NULL COMMENT 'FK -> curriculum_nodes.id (Authoritative academic scope)',
    chapter_id VARCHAR(36) NULL COMMENT 'FK -> chapters.id (Optional chapter scope)',
    topic_id VARCHAR(36) NULL COMMENT 'FK -> topics.id (Optional topic scope)',
    title VARCHAR(200) NOT NULL COMMENT 'Assignment title',
    description TEXT NOT NULL COMMENT 'Pedagogical instructions, task prompt, or problem statement',
    assignment_type ENUM('homework', 'worksheet', 'practice_set', 'project', 'revision') NOT NULL DEFAULT 'homework',
    max_score DECIMAL(5,2) NULL COMMENT 'Maximum obtainable marks; NULL for non-graded formative tasks',
    available_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Instant assignment becomes actionable',
    due_at TIMESTAMP NOT NULL COMMENT 'Target completion deadline',
    close_at TIMESTAMP NULL COMMENT 'Hard cut-off timestamp; defaults to due_at if NULL',
    late_policy ENUM('reject', 'allow_flagged') NOT NULL DEFAULT 'reject',
    resubmission_policy ENUM('none', 'single', 'multiple') NOT NULL DEFAULT 'none',
    max_resubmissions TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Max resubmission cycles allowed',
    status ENUM('draft', 'published', 'cancelled', 'archived') NOT NULL DEFAULT 'draft',
    created_by VARCHAR(36) NOT NULL COMMENT 'FK -> users.id (Teacher/Admin who authored the assignment)',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_asgn_curriculum (curriculum_node_id),
    INDEX idx_asgn_chapter (chapter_id),
    INDEX idx_asgn_topic (topic_id),
    INDEX idx_asgn_status (status),
    INDEX idx_asgn_due (due_at),
    INDEX idx_asgn_created_by (created_by),
    CONSTRAINT chk_assignments_hierarchy CHECK (topic_id IS NULL OR chapter_id IS NOT NULL),
    CONSTRAINT fk_asgn_curriculum_node FOREIGN KEY (curriculum_node_id)
        REFERENCES curriculum_nodes (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_asgn_chapter FOREIGN KEY (chapter_id, curriculum_node_id)
        REFERENCES chapters (id, curriculum_node_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_asgn_topic FOREIGN KEY (topic_id, chapter_id)
        REFERENCES topics (id, chapter_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_asgn_author FOREIGN KEY (created_by)
        REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. assignment_targets: Recipient Targeting Policy
-- Decouples master definition from distribution cohorts (batch, class, student)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assignment_targets (
    id VARCHAR(36) NOT NULL,
    assignment_id VARCHAR(36) NOT NULL COMMENT 'FK -> assignments.id',
    target_type ENUM('batch', 'class', 'student') NOT NULL,
    target_id VARCHAR(36) NOT NULL COMMENT 'UUID of corresponding batches.id, classes.id, or students.id',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_asgn_target (assignment_id, target_type, target_id),
    INDEX idx_target_lookup (target_type, target_id),
    CONSTRAINT fk_asgn_target_asgn FOREIGN KEY (assignment_id)
        REFERENCES assignments (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. student_assignments: Student Personal Assignment Instances
-- Materialized per recipient upon assignment publication
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_assignments (
    id VARCHAR(36) NOT NULL,
    assignment_id VARCHAR(36) NOT NULL COMMENT 'FK -> assignments.id',
    student_id VARCHAR(36) NOT NULL COMMENT 'FK -> students.id (locked identity table)',
    status ENUM('assigned', 'in_progress', 'submitted', 'evaluated', 'resubmission_required') NOT NULL DEFAULT 'assigned',
    first_opened_at TIMESTAMP NULL COMMENT 'Audit when student first viewed instructions',
    current_attempt TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Active submission attempt number',
    final_score DECIMAL(5,2) NULL COMMENT 'Latest evaluated score',
    is_completed BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Completion flag for dashboard rollups',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_student_assignment (assignment_id, student_id),
    INDEX idx_sa_student_status (student_id, status),
    INDEX idx_sa_assignment (assignment_id),
    CONSTRAINT fk_sa_assignment FOREIGN KEY (assignment_id)
        REFERENCES assignments (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sa_student FOREIGN KEY (student_id)
        REFERENCES students (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. submissions: Immutable Student Submission Deliverables
-- Tracks distinct attempts per student assignment
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR(36) NOT NULL,
    student_assignment_id VARCHAR(36) NOT NULL COMMENT 'FK -> student_assignments.id',
    attempt_number TINYINT UNSIGNED NOT NULL DEFAULT 1,
    submission_type ENUM('text', 'file_upload', 'external_link', 'hybrid') NOT NULL DEFAULT 'text',
    text_response TEXT NULL COMMENT 'Typed response or markdown notes',
    external_link VARCHAR(500) NULL COMMENT 'External URL (e.g. project / shared document)',
    is_late BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Marked true if submitted_at > assignments.due_at',
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_submission_attempt (student_assignment_id, attempt_number),
    INDEX idx_sub_assignment (student_assignment_id),
    CONSTRAINT fk_sub_sa FOREIGN KEY (student_assignment_id)
        REFERENCES student_assignments (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. submission_attachments: Secure File Attachment Metadata
-- Stored metadata only (no cloud provider lock-in)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS submission_attachments (
    id VARCHAR(36) NOT NULL,
    submission_id VARCHAR(36) NOT NULL COMMENT 'FK -> submissions.id',
    storage_path VARCHAR(500) NOT NULL COMMENT 'Relative sanitized filesystem/bucket key',
    original_filename VARCHAR(255) NOT NULL COMMENT 'Original client filename',
    mime_type VARCHAR(100) NOT NULL COMMENT 'e.g. application/pdf, image/jpeg, image/png',
    file_size_bytes BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_sub_att_sub (submission_id),
    CONSTRAINT fk_sub_att_sub FOREIGN KEY (submission_id)
        REFERENCES submissions (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. evaluations: Teacher Assessment, Marks, and Feedback
-- Distinct from submission attempt
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evaluations (
    id VARCHAR(36) NOT NULL,
    submission_id VARCHAR(36) NOT NULL COMMENT 'FK -> submissions.id',
    evaluated_by VARCHAR(36) NOT NULL COMMENT 'FK -> teachers.id (Evaluating faculty)',
    score_awarded DECIMAL(5,2) NULL COMMENT 'Marks awarded; NULL for non-graded review',
    grading_status ENUM('evaluated', 'resubmission_required', 'needs_improvement') NOT NULL DEFAULT 'evaluated',
    feedback TEXT NOT NULL COMMENT 'Pedagogical feedback, corrections, and revision instructions',
    evaluated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_evaluation_submission (submission_id),
    INDEX idx_eval_evaluator (evaluated_by),
    CONSTRAINT fk_eval_sub FOREIGN KEY (submission_id)
        REFERENCES submissions (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_eval_teacher FOREIGN KEY (evaluated_by)
        REFERENCES teachers (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
