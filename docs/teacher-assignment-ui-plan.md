# MS Tutorials — Teacher Assignment & Evaluation Management UI Implementation Plan (Phase 5.10E-D)

> **Governing Specifications**:
> - `docs/assignment-architecture.md` (Phase 5.10E-A — Assignment Architecture)
> - `docs/database.md` (Phase 5.1 — Identity Schema)
> - `docs/authorization.md` (Phase 5.3 — RBAC Gateway)
> - `docs/academic-architecture.md` (Phase 5.6 — Academic Domain Architecture)
> - `docs/student-learning-experience-architecture.md` (Phase 5.7 — Six-Step Learning Cycle)
> - `docs/student-assignment-ui-plan.md` (Phase 5.10E-C — Student Assignment UI Plan)
>
> **Status**: APPROVED IMPLEMENTATION PLAN (Phase 5.10E-D)  
> **Target Scope**: Frontend UI Only (Teacher Portal & Assignment Management)  
> **Backend Status**: LOCKED (Phase 5.10E-B — `5e63647`, Phase 5.10E-C — `a630bfb`)  

---

## 1. Executive Summary & Purpose

The objective of **Phase 5.10E-D** is to build the first comprehensive faculty-facing Assignment & Evaluation Management user experience for the MS Tutorials platform. Authorized teachers and administrators will be empowered to:
1. Oversee authored assignments via an interactive dashboard (`/teacher/assignments`).
2. Design and configure new assignments anchored to the academic curriculum hierarchy (`/teacher/assignments/new`).
3. Set deterministic submission rules, temporal windows (`available_from`, `due_at`, `close_at`), late submission policies, and resubmission quotas.
4. Target assignments across batches, classes, or individual students.
5. Save assignments as draft specifications or publish them with atomic student instance materialization.
6. Review assignment parameters and targeting metrics in a dedicated detail view (`/teacher/assignments/:id`).
7. Triage incoming student submissions in a dedicated assignment submission queue (`/teacher/assignments/:id/submissions`).
8. Inspect individual student attempts, review multi-modal response parameters, and conduct evaluations using a pedagogical workbench (`/teacher/assignments/:id/submissions/:submissionId`).
9. Award numeric scores within `max_score` bounds, provide required constructive qualitative feedback, and designate actionable grading statuses (`evaluated`, `resubmission_requested`, `needs_improvement`).
10. Review historical evaluations and track iterative student attempts.

All capabilities are implemented purely on the client side, interfacing directly with the locked Phase 5.10E-B REST endpoints without modifying database schemas, rewriting backend logic, or destabilizing the locked Student Portal or Public Website V1.

---

## 2. Alignment with Locked Baselines & Architectural Boundaries

### 2.1 Locked Baselines
- **Phase 5.10E-A (Architecture — `e0a931a`)**: Strictly adheres to the Six-Step Learning Cycle (**Step 3: Practice** $\rightarrow$ **Step 5: Identify Gaps**), formative assessment paradigm, multi-modal submission types (`text`, `file_upload`, `external_link`, `hybrid`), and resubmission semantics.
- **Phase 5.10E-B (Backend Implementation — `5e63647`)**: Consumes existing physical tables (`assignments`, `assignment_targets`, `student_assignments`, `submissions`, `submission_attachments`, `evaluations`) and REST controllers without modification.
- **Phase 5.10E-C (Student Portal UI — `a630bfb`)**: Preserves complete interoperability with student submission workflows and status transitions.
- **Public Website V1**: Completely untouched (`/`, `/about`, `/programs`, `/learning-system`, `/resources`, `/contact`).

### 2.2 System Invariants & Guardrails
- **No `teacher_batches` Table**: The database does NOT have a `teacher_batches` relational table. Faculty authorization is strictly **author-scoped** (`assignments.created_by = req.user.id`). Teachers manage and evaluate only assignments they authored.
- **Admin Privilege Hierarchy**: System administrators have access governed by `admins.access_level`. Superadmins (`access_level = 'superadmin'`) can inspect and evaluate all institution assignments, while staff admins are restricted to their authored assignments.
- **Zero Terminology Drift**: Only the locked grading and lifecycle statuses are used:
  - Master Assignment: `draft`, `published`, `closed`, `archived`.
  - Student Assignment: `assigned`, `in_progress`, `submitted`, `evaluated`, `resubmission_requested`, `resubmitted`, `completed`.
  - Grading Status: `evaluated`, `resubmission_requested`, `needs_improvement`.
  - **Forbidden**: `resubmission_required`, `cancelled` (as replacement for `closed`), `mastered`.
- **Single Curriculum Node per Assignment**: In accordance with the relational schema, each assignment references exactly one `curriculumNodeId`, with optional single `chapterId` and `topicId`. Multi-topic composite associations are deferred to future schema extensions.
- **File Attachment Handling**: Attachments are represented as secure metadata records (`storagePath`, `originalFilename`, `mimeType`, `fileSizeBytes`). No fake S3/R2 binary uploaders or non-existent CDN endpoints are introduced.
- **Authoritative Backend Security**: The frontend enforces role checks for view routing, but all access control is definitively verified and rejected by backend middleware (`requireAuth`, `requireRole('teacher', 'admin')`).

---

## 3. Teacher Routing Structure

The teacher assignment management interface introduces a clean, dedicated routing subtree isolated under `/teacher/*`:

| Route Path | View Component | Description | Access Control |
|:---|:---|:---|:---|
| `/teacher` or `/teacher/dashboard` | `TeacherAssignments.jsx` | Redirects to assignments dashboard or renders summary view | Authenticated `teacher` or `admin` |
| `/teacher/assignments` | `TeacherAssignments.jsx` | Main assignment dashboard: list authored assignments, filter by status and curriculum, search, metrics overview | Authenticated `teacher` or `admin` |
| `/teacher/assignments/new` | `TeacherAssignmentCreate.jsx` | Multi-step assignment authoring form (metadata, curriculum, rules, targets, save draft / publish) | Authenticated `teacher` or `admin` |
| `/teacher/assignments/:id` | `TeacherAssignmentDetail.jsx` | Master assignment detail view: configuration, schedule, targets, publish action (if draft), submission stats | Author-scoped `teacher` or `superadmin` |
| `/teacher/assignments/:id/submissions` | `TeacherAssignmentSubmissions.jsx` | Submissions queue / triage table for the assignment: student list, attempt numbers, submission times, evaluation status | Author-scoped `teacher` or `superadmin` |
| `/teacher/assignments/:id/submissions/:submissionId` | `TeacherSubmissionDetail.jsx` | Submission review & grading workbench: student attempt details, multi-modal response viewer, evaluation form | Author-scoped `teacher` or `superadmin` |

---

## 4. Existing Backend API Consumption Matrix

The Teacher Assignment UI consumes strictly the existing, locked backend APIs:

| Operation | HTTP Method | Backend Endpoint | Request Parameters / Body | Response Data |
|:---|:---|:---|:---|:---|
| **List Authored Assignments** | `GET` | `/api/v1/assignments` | Query: `status`, `curriculumNodeId`, `page`, `pageSize` | `{ assignments: [...], pagination: { page, pageSize, total, totalPages } }` |
| **Get Assignment Details** | `GET` | `/api/v1/assignments/:id` | Path: `:id` (UUID) | `{ assignment: { ..., targets: [...] } }` |
| **Create Master Assignment** | `POST` | `/api/v1/assignments` | Body: `{ title, description, assignmentType, maxScore, availableFrom, dueAt, closeAt, latePolicy, resubmissionPolicy, maxResubmissions, curriculumNodeId, chapterId, topicId, targets: [{ targetType, targetId }] }` | `{ assignment: { id, status: 'draft', ... } }` |
| **Publish Master Assignment** | `POST` | `/api/v1/assignments/:id/publish` | Path: `:id` (UUID) | `{ assignment: { id, status: 'published', materializedStudentCount } }` |
| **List Submissions for Assignment** | `GET` | `/api/v1/assignments/:id/submissions` | Path: `:id`, Query: `status`, `page`, `pageSize` | `{ submissions: [...], pagination: { page, pageSize, total, totalPages } }` |
| **Evaluate Submission** | `POST` | `/api/v1/assignments/submissions/:submissionId/evaluate` | Path: `:submissionId`, Body: `{ scoreAwarded, feedback, gradingStatus }` | `{ id, scoreAwarded, gradingStatus, feedback, evaluatedAt, studentAssignmentId, studentAssignmentStatus }` |
| **Fetch Academic Classes** | `GET` | `/api/v1/academic/classes` | None | `{ classes: [...] }` |
| **Fetch Academic Subjects** | `GET` | `/api/v1/academic/subjects` | None | `{ subjects: [...] }` |
| **Fetch Curriculum Nodes** | `GET` | `/api/v1/curriculum/nodes` | None | `{ nodes: [...] }` |
| **Fetch Node Chapters** | `GET` | `/api/v1/curriculum/nodes/:id/chapters`| Path: `:id` (node ID) | `{ chapters: [...] }` |
| **Fetch Chapter Topics** | `GET` | `/api/v1/curriculum/chapters/:id/topics` | Path: `:id` (chapter ID) | `{ topics: [...] }` |
| **Fetch Teacher Profile** | `GET` | `/api/v1/teacher/profile` | None | `{ profile: { teacher: {...}, user: {...} } }` |

### Backend Contract Clarification:
The submission queue endpoint `GET /api/v1/assignments/:id/submissions` returns records containing:
- `submission_id`, `attempt_number`, `submission_type`, `is_late`, `submitted_at`
- `student_assignment_id`, `student_assignment_status`, `final_score`
- `student_name`, `admission_number`
- `evaluation_id`, `score_awarded`, `grading_status`, `feedback`, `evaluated_at`

In accordance with the locked backend schema, the submission queue record provides complete student identity, attempt indexing, and current evaluation status. In the submission review view (`TeacherSubmissionDetail.jsx`), the UI presents these attributes alongside the assignment context (`max_score`, title, instructions) and connects to the evaluation endpoint `POST /api/v1/assignments/submissions/:submissionId/evaluate`.

---

## 5. Authorization & Security Model

### 5.1 Teacher Authorization (Author-Scoped)
- The application enforces author-level ownership for faculty.
- When listing assignments (`GET /api/v1/assignments`), the backend automatically filters by `createdBy = req.user.id`.
- When fetching details, publishing, viewing submissions, or evaluating, the backend validates `assignment.created_by === req.user.id`.
- If an unauthorized teacher attempts to view or modify another teacher's assignment, the backend responds with `403 Forbidden` (`FORBIDDEN`).
- The frontend handles this by displaying a generic, secure permission error message that prevents discovery of other faculty's resource identifiers.

### 5.2 Admin Authorization
- Administrators authenticate with `role === 'admin'`.
- The backend checks `admins.access_level`:
  - `superadmin`: Granted institution-wide access to view, publish, and evaluate any assignment across all faculty.
  - `staff`: Restricted to assignments authored by their own user ID (`assignment.created_by === req.user.id`).
- The UI gracefully renders management controls based on permitted actions.

### 5.3 Authentication Enforcement
- Handled through `useAuth()` and `authService.authFetch`.
- Bearer tokens are maintained securely in memory with transparent 401 refresh flows.
- Absolutely NO sensitive auth tokens or student/teacher credentials are stored in `localStorage` or `sessionStorage`.

---

## 6. Detailed Feature Workflows

### 6.1 Assignment Dashboard (`TeacherAssignments.jsx`)
- **Metric Cards**:
  - Total Authored Assignments
  - Active / Published Assignments
  - Draft Assignments
  - Total Submissions Received
- **Filter Bar**:
  - Filter by Lifecycle Status (`all`, `draft`, `published`, `closed`, `archived`)
  - Filter by Curriculum Node (Subject & Class mapping)
  - Keyword search (by assignment title)
- **Table / Card List**:
  - Columns: Title & Type, Curriculum Scope (Class/Subject/Chapter), Target Scope, Due Date, Status Badge, Submissions Count, Actions.
  - Actions: "View Details", "Submissions Queue", "Publish" (for drafts), "New Assignment" primary CTA.
- **Empty States**: Clear visual guidance when no assignments have been created yet or when filter queries yield zero matches.

### 6.2 Assignment Creation Flow (`TeacherAssignmentCreate.jsx`)
Structured multi-section authoring interface:
1. **Basic Information**:
   - Title (required, 3-255 characters)
   - Description / Instructions (required, comprehensive guidance)
   - Assignment Type (`homework`, `practice`, `worksheet`)
   - Maximum Score (numeric, $\ge 1$, default: 50)
2. **Curriculum Anchoring**:
   - Curriculum Node Selector (populates Class and Subject from `/api/v1/curriculum/nodes`)
   - Chapter Selector (dynamically loaded from `/api/v1/curriculum/nodes/:id/chapters`)
   - Topic Selector (optional, dynamically loaded from `/api/v1/curriculum/chapters/:id/topics`)
3. **Temporal Deadlines & Policies**:
   - Available From (ISO datetime, defaults to current time)
   - Due At (ISO datetime, strictly $>$ Available From)
   - Close At (optional ISO datetime, $\ge$ Due At)
   - Late Submission Policy (`reject_late`, `grace_period`, `allow_late`)
   - Resubmission Policy (`none`, `single`, `multiple`)
   - Max Resubmissions (numeric, when policy is `multiple`, default: 3)
4. **Targeting Configuration**:
   - Target Scope Selector: `class`, `batch`, `student`
   - Target Value Input / Select (e.g., select class from academic reference data, or input specific batch ID / student ID)
   - Real-time client validation ensuring at least one valid target is specified.
5. **Action Controls**:
   - "Save as Draft": Posts to `POST /api/v1/assignments`, creates assignment in `draft` status, redirects to details.
   - "Save & Publish Immediately": Posts to `POST /api/v1/assignments`, then issues `POST /api/v1/assignments/:id/publish` to immediately fan out student assignments.

### 6.3 Assignment Detail View (`TeacherAssignmentDetail.jsx`)
- Overview of assignment metadata: title, description, max score, assignment type.
- Curriculum context breakdown: Session, Board, Class, Subject, Chapter, Topic.
- Policy summary: Late policy badge, resubmission rules, deadline timeline.
- Targeting details: Target type and IDs.
- Publishing action bar:
  - If `status === 'draft'`: Displays prominent "Publish Assignment" button with confirmation modal explaining student instance fanout.
  - If `status === 'published'`: Displays "View Submissions" button linking directly to the submission queue.

### 6.4 Submission Queue & Triage (`TeacherAssignmentSubmissions.jsx`)
- Shows all students assigned or submitted for the chosen assignment.
- Filter tabs: `all`, `submitted`, `evaluated`, `resubmission_requested`, `assigned`.
- Summary metrics: Total Enrolled/Targeted Students, Submitted Count, Pending Evaluation Count, Evaluated Count.
- Submission table:
  - Student Name & Admission Number
  - Attempt Index (`Attempt #1`, `Attempt #2`)
  - Submission Type (`Text`, `File Upload`, `External Link`, `Hybrid`)
  - Submitted At timestamp with "Late" indicator badge if `is_late === 1`
  - Current Status Badge (`submitted`, `evaluated`, `resubmission_requested`)
  - Score Awarded / Max Score
  - Action: "Evaluate" or "Review" button linking to `/teacher/assignments/:id/submissions/:submissionId`.

### 6.5 Evaluation Workbench (`TeacherSubmissionDetail.jsx`)
- **Header**: Breadcrumbs linking back to Assignments and Submission Queue. Student name, admission number, assignment title, attempt number.
- **Submission Content Viewer**:
  - Displays submission metadata, attempt number, submission date, late status.
  - Shows submission type indicator (`text`, `external_link`, `file_upload`, `hybrid`).
  - Read-only review card for current attempt.
- **Evaluation Form**:
  - Score Awarded: Numeric input ($0 \le \text{score} \le \text{max\_score}$). Real-time validation against assignment max score.
  - Pedagogical Feedback: Textarea (required, min 5 characters) for constructive comments, error diagnosis, and next steps.
  - Grading Status Selector:
    - `evaluated`: Satisfactory completion, finalizes score.
    - `resubmission_requested`: Rework required; prompts the student to revise and submit a new attempt.
    - `needs_improvement`: Flagged for review with actionable remarks.
  - Action Buttons: "Submit Evaluation" with busy/loading state, "Cancel" returning to queue.
- **Evaluation History / Prior Feedback**:
  - Displays previously awarded scores and teacher remarks if this submission was already evaluated or is a resubmission.

---

## 7. State Management & Teacher Service Layer

A dedicated service module `src/services/teacherService.js` will encapsulate all API interactions, utilizing `authService.authFetch`:

```javascript
// src/services/teacherService.js
import authService from './authService.js';

export const teacherService = {
  // Assignments
  getAssignments(filters = {}, pagination = {}),
  getAssignmentById(id),
  createAssignment(payload),
  publishAssignment(id),

  // Submissions & Evaluation
  getAssignmentSubmissions(assignmentId, filters = {}, pagination = {}),
  evaluateSubmission(submissionId, { scoreAwarded, feedback, gradingStatus }),

  // Academic Reference & Curriculum Helpers
  getClasses(),
  getSubjects(),
  getCurriculumNodes(),
  getNodeChapters(nodeId),
  getChapterTopics(chapterId),
  getTeacherProfile(),
};
```

---

## 8. Error Handling & Security

- **401 Unauthorized**: Redirect to `/student/login` (or global login) preserving return path.
- **403 Forbidden**: Clean, user-friendly `ErrorState` stating: *"You do not have permission to view or manage this assignment. Access is restricted to the authoring faculty member."* No sensitive internal identifiers or schema details exposed.
- **404 Not Found**: Clean `ErrorState` stating: *"The requested assignment or submission could not be found."*
- **400 / 409 Validation & Conflict**: In-form validation banners highlighting invalid fields (e.g., `dueAt <= availableFrom`, `scoreAwarded > maxScore`, `already published`).
- **500 Server / Network Error**: Safe fallbacks with retry mechanisms.

---

## 9. Responsive Design & Accessibility

### 9.1 Responsive Breakpoints
- **Mobile (320px – 640px)**: Single-column stacked layouts, touch targets $\ge 44\text{px}$, responsive submission cards replacing wide tables, horizontally scrollable filter chips.
- **Tablet (641px – 1024px)**: Adaptive grid layouts, collapsible side drawer for navigation.
- **Desktop (1025px – 1440px+)**: Multi-column dashboard with side-by-side submission review and evaluation workbench.

### 9.2 Accessibility (WCAG 2.1 AA)
- Semantic HTML tags (`<header>`, `<main>`, `<nav>`, `<section>`, `<article>`).
- Explicit form `<label>` associations for all inputs and select fields.
- `aria-live="polite"` status announcements for async save, publish, and evaluate actions.
- `aria-describedby` error descriptions on validation failure.
- Color contrast compliant badges with textual status cues (no color-only status).
- Full keyboard operability (Tab, Enter, Escape for modals).
- `@media (prefers-reduced-motion: reduce)` support.

---

## 10. Teacher Shell & Portal Layout

A lightweight `TeacherPortalLayout.jsx` and `TeacherProtectedRoute.jsx` will be introduced:
- **Header**: MS Tutorials branding, Teacher Portal badge, teacher profile display (name/email), logout action.
- **Navigation Bar**: Clean minimal navigation for assignment workflows:
  - "Dashboard" (`/teacher/assignments`)
  - "Create Assignment" (`/teacher/assignments/new`)
- **Route Guard**: `TeacherProtectedRoute.jsx` verifies `user?.role === 'teacher' || user?.role === 'admin'`. Non-teachers are redirected or shown an unauthorized error card.

---

## 11. Explicitly Deferred Features (Strictly Out of Scope)

The following capabilities are deliberately deferred to future roadmap phases:
- `teacher_batches` database table or batch management backend.
- Notification dispatch (email, SMS, push notifications).
- Binary cloud file upload to AWS S3, Cloudflare R2, or CDN.
- AI grading, automated rubric evaluation, or AI assignment generation.
- Real-time websockets or push subscriptions.
- Formal summative examination module (Phase 6).
- Parent assignment supervision UI (Phase 5.10E-E).

---

## 12. Quality Verification & Testing Strategy

A dedicated test suite `tests/teacherAssignmentPortal.test.js` will verify all required scenarios using `node:test` and `node:assert/strict`:

1. Teacher assignment route access (`/api/v1/assignments`)
2. Unauthenticated access rejection (401)
3. Non-teacher role access rejection (403 for student/parent)
4. Teacher assignment list retrieval with pagination
5. Empty assignment list behavior
6. Assignment filtering by status and curriculum node
7. Create assignment validation (title, curriculum, targets required)
8. Temporal validation (`dueAt > availableFrom`, `closeAt >= dueAt`)
9. Save assignment draft (`status: 'draft'`)
10. Publish confirmation & state validation
11. Publish success with target materialization
12. Assignment detail retrieval with targets
13. Assignment submission queue listing
14. Empty submission queue handling
15. Submission detail review
16. Evaluation score validation ($0 \le \text{score} \le \text{max\_score}$)
17. Evaluation score exceeding max score rejected (400)
18. Evaluation feedback required validation
19. Evaluation status: `resubmission_requested` updates student assignment status
20. Evaluation status: `evaluated` marks assignment completed
21. Evaluation history & review
22. Unauthorized teacher attempting to evaluate another teacher's assignment (403)
23. Public routes and student portal regression verification

---

## 13. Quality Gates & Commit Strategy

Prior to committing, the following quality gates must pass:
1. `npm test` — all existing and new tests pass (0 failures, 0 skipped).
2. `npm run build` — Vite production build completes cleanly with 0 errors and 0 warnings.
3. `node database/validate-schema.js` — 24/24 physical database tables verified.
4. `git status` — clean working tree.
5. Commit: `feat: add teacher assignment management UI` (local only, no push, no deploy).
