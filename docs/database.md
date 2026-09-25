# MS Tutorials — Database Design & Schema Architecture

> [!NOTE]
> This document details the **planned database schema** for MS Tutorials. The database itself is scheduled for implementation in **Phase 11 (Database + File Storage)**. No database tables or migrations should be run before Phase 11.

---

## 1. Design Principles
1. **Third Normal Form (3NF)**: Normalize entities to minimize redundancy and prevent update anomalies.
2. **Strict Foreign Key Constraints**: Enforce referential integrity on all relational boundaries with cascade or restrict rules explicitly declared.
3. **Audit Fields**: Every core table includes `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP` and `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`.
4. **Appropriate Indexing**: Unique indexes on emails and codes; composite indexes on query paths (e.g., `(student_id, test_id)`).
5. **Separation of Sensitive Data**: Plaintext passwords are never saved. Only salted bcrypt hashes exist in the `users` table.

---

## 2. Planned Entity Groups & Tables

```mermaid
erDiagram
    USERS ||--o| STUDENTS : "specializes to"
    USERS ||--o| PARENTS : "specializes to"
    USERS ||--o| TEACHERS : "specializes to"
    PARENTS ||--o{ STUDENTS : "linked_to (parent_student)"
    
    CLASSES ||--o{ BATCHES : "contains"
    CLASSES ||--o{ SUBJECTS : "teaches"
    SUBJECTS ||--o{ CHAPTERS : "divided into"
    CHAPTERS ||--o{ TOPICS : "broken down into"
    
    BATCHES ||--o{ STUDENTS : "enrolls"
    
    TOPICS ||--o{ QUESTIONS : "categorizes"
    TESTS ||--o{ TEST_QUESTIONS : "includes"
    QUESTIONS ||--o{ TEST_QUESTIONS : "referenced in"
    
    TESTS ||--o{ TEST_ATTEMPTS : "taken as"
    STUDENTS ||--o{ TEST_ATTEMPTS : "submits"
    TEST_ATTEMPTS ||--o{ TEST_ANSWERS : "records"
    QUESTIONS ||--o{ TEST_ANSWERS : "answers"

    STUDENTS ||--o{ ATTENDANCE : "marked for"
    BATCHES ||--o{ ATTENDANCE : "session of"

    STUDENTS ||--o{ FEES : "billed to"
    FEES ||--o{ PAYMENTS : "paid via"
```

---

### Group A: Identity & Users
- **`users`**: Base credentials and common profile attributes.
  - Columns: `id` (PK, UUID/INT AUTO_INCREMENT), `email` (UNIQUE), `password_hash`, `role` (`'student' | 'parent' | 'teacher' | 'admin'`), `full_name`, `phone`, `status` (`'active' | 'inactive'`), `created_at`, `updated_at`.
- **`students`**: Specialized student data.
  - Columns: `id` (PK), `user_id` (FK -> `users.id`), `admission_number` (UNIQUE), `class_id` (FK -> `classes.id`), `batch_id` (FK -> `batches.id`), `date_of_birth`, `gender`, `address`.
- **`parents`**: Specialized parent data.
  - Columns: `id` (PK), `user_id` (FK -> `users.id`), `occupation`, `alternate_phone`.
- **`parent_student`**: Relational junction table linking parents to children.
  - Columns: `id` (PK), `parent_id` (FK -> `parents.id`), `student_id` (FK -> `students.id`), `relationship` (`'father' | 'mother' | 'guardian'`).
- **`teachers`**: Specialized teacher data.
  - Columns: `id` (PK), `user_id` (FK -> `users.id`), `qualification`, `specialization`, `joining_date`.
- **`admins`**: Specialized administrator data.
  - Columns: `id` (PK), `user_id` (FK -> `users.id`), `access_level` (`'superadmin' | 'staff'`).

---

### Group B: Academic Structure
- **`classes`**: Grade levels (e.g., Class 8, Class 9, Class 10, Class 11, Class 12).
  - Columns: `id` (PK), `name`, `code` (UNIQUE), `description`.
- **`batches`**: Cohorts per class (e.g., Morning Batch 2026, Weekend Batch).
  - Columns: `id` (PK), `class_id` (FK -> `classes.id`), `name`, `academic_year`, `start_date`, `end_date`, `max_students`.
- **`subjects`**: Core study subjects (e.g., Mathematics, Physics, Chemistry, Biology).
  - Columns: `id` (PK), `class_id` (FK -> `classes.id`), `name`, `code`.
- **`chapters`**: Units within a subject (e.g., "Quadratic Equations", "Optics").
  - Columns: `id` (PK), `subject_id` (FK -> `subjects.id`), `chapter_number`, `title`, `description`.
- **`topics`**: Granular learning concepts within a chapter (e.g., "Factoring Method", "Snell's Law").
  - Columns: `id` (PK), `chapter_id` (FK -> `chapters.id`), `topic_number`, `title`, `description`.

---

### Group C: Resources & Assignments
- **`resources`**: Study materials and reference files.
  - Columns: `id` (PK), `title`, `resource_type` (`'pdf' | 'worksheet' | 'notes' | 'video_link'`), `file_path`, `file_size_bytes`, `class_id` (FK), `subject_id` (FK), `chapter_id` (FK nullable), `topic_id` (FK nullable), `uploaded_by` (FK -> `users.id`), `created_at`.
- **`assignments`**: Teacher-published homework and tasks.
  - Columns: `id` (PK), `batch_id` (FK -> `batches.id`), `subject_id` (FK -> `subjects.id`), `title`, `description`, `attachment_url`, `due_date`, `created_by` (FK -> `teachers.id`), `created_at`.

---

### Group D: Assessment & Question Bank
- **`questions`**: Individual question bank items tagged down to the topic.
  - Columns: `id` (PK), `topic_id` (FK -> `topics.id`), `question_type` (`'mcq' | 'numerical' | 'subjective'`), `difficulty` (`'easy' | 'medium' | 'hard'`), `content` (TEXT), `options_json` (JSON, nullable for MCQ), `correct_answer` (TEXT), `explanation` (TEXT), `marks` (INT), `created_by` (FK -> `teachers.id`).
- **`tests`**: Scheduled diagnostic or periodic assessments.
  - Columns: `id` (PK), `batch_id` (FK -> `batches.id`, nullable for open diagnostics), `title`, `test_type` (`'diagnostic' | 'chapter_test' | 'mock_exam'`), `duration_minutes`, `total_marks`, `passing_marks`, `start_time`, `end_time`, `is_published` (BOOLEAN).
- **`test_questions`**: Junction linking questions to tests with ordering.
  - Columns: `id` (PK), `test_id` (FK -> `tests.id`), `question_id` (FK -> `questions.id`), `question_order` (INT), `marks_allocated` (INT).
- **`test_attempts`**: A student's test session submission.
  - Columns: `id` (PK), `test_id` (FK -> `tests.id`), `student_id` (FK -> `students.id`), `started_at`, `submitted_at`, `total_score_obtained` (DECIMAL), `status` (`'in_progress' | 'submitted' | 'evaluated'`).
- **`test_answers`**: Individual student response per question.
  - Columns: `id` (PK), `attempt_id` (FK -> `test_attempts.id`), `question_id` (FK -> `questions.id`), `student_answer` (TEXT), `is_correct` (BOOLEAN), `marks_awarded` (DECIMAL), `evaluated_by` (FK -> `teachers.id`, nullable).

---

### Group E: Operations
- **`attendance`**: Daily attendance records.
  - Columns: `id` (PK), `batch_id` (FK -> `batches.id`), `student_id` (FK -> `students.id`), `session_date` (DATE), `status` (`'present' | 'absent' | 'late' | 'excused'`), `remarks`, `marked_by` (FK -> `teachers.id`).
- **`fees`**: Fee structures assigned to students.
  - Columns: `id` (PK), `student_id` (FK -> `students.id`), `batch_id` (FK -> `batches.id`), `total_amount` (DECIMAL), `due_date` (DATE), `status` (`'pending' | 'partially_paid' | 'paid' | 'overdue'`).
- **`payments`**: Payment transaction history.
  - Columns: `id` (PK), `fee_id` (FK -> `fees.id`), `amount_paid` (DECIMAL), `payment_date` (DATETIME), `payment_mode` (`'cash' | 'upi' | 'bank_transfer' | 'cheque'`), `transaction_ref`, `receipt_number` (UNIQUE), `recorded_by` (FK -> `admins.id`).
- **`announcements`**: Broadcast messages.
  - Columns: `id` (PK), `target_role` (`'all' | 'students' | 'parents' | 'teachers'`), `batch_id` (FK nullable), `title`, `body` (TEXT), `published_at`, `created_by` (FK -> `users.id`).
- **`teacher_feedback`**: Qualitative feedback provided by teachers to parents/students.
  - Columns: `id` (PK), `student_id` (FK -> `students.id`), `teacher_id` (FK -> `teachers.id`), `feedback_text` (TEXT), `category` (`'academic' | 'discipline' | 'participation'`), `created_at`.

---

## 3. Academic Performance Pipeline (The Learning Graph)

The schema's hierarchical mapping is intentionally architected to power automated analytics and personalized learning in Phases 13 through 16:

$$\begin{aligned}
\text{Subject} &\longrightarrow \text{Chapter} \longrightarrow \text{Topic} \\
&\longrightarrow \text{Question (Topic-tagged)} \\
&\longrightarrow \text{Test} \longrightarrow \text{Attempt} \longrightarrow \text{Result} \\
&\longrightarrow \text{Topic Performance (Accuracy \%)} \\
&\longrightarrow \text{Strength / Weakness Classification} \\
&\longrightarrow \text{Personalized Revision Recommendations}
\end{aligned}$$

### How It Connects:
1. Every **Question** is tied directly to a **Topic**.
2. When a student completes a **Test Attempt**, their **Test Answers** are scored per question.
3. Aggregating `is_correct` grouped by `topic_id` produces a deterministic **Topic Accuracy %**.
4. Low accuracy (<60%) on repeated attempts classifies a topic as **Weak**.
5. The recommendation engine queries `resources` specifically matching that `topic_id` to generate an automated, transparent revision plan.
