# MS Tutorials — Student Portal Assignment UI Implementation Plan (Phase 5.10E-C)

> **Governing Specifications**:
> - `docs/assignment-architecture.md` (Phase 5.10E-A — Assignment Architecture)
> - `docs/database.md` (Phase 5.1 — Identity Schema)
> - `docs/authorization.md` (Phase 5.3 — RBAC Gateway)
> - `docs/academic-architecture.md` (Phase 5.6 — Academic Domain Architecture)
> - `docs/student-portal-foundation-plan.md` (Phase 5.10A — Shell & Layout)
> - `docs/student-portal-authentication-plan.md` (Phase 5.10B — Authentication Integration)
>
> **Status**: APPROVED IMPLEMENTATION PLAN (Phase 5.10E-C)  
> **Target Scope**: Frontend UI Only (Student Portal)  
> **Backend Status**: LOCKED (Phase 5.10E-B — `5e63647`)  

---

## 1. Purpose

The objective of Phase 5.10E-C is to construct the first student-facing Assignment experience within the MS Tutorials Student Portal. Students must be able to view their assigned coursework, filter assignments by status and subject, review comprehensive instructions and deadline parameters, submit attempts (text, link, or file metadata), track attempt history, and inspect faculty evaluations and qualitative feedback.

---

## 2. Scope

1. **Student Assignment Routing**:
   - `/student/assignments` — Paginated, filterable assignment queue.
   - `/student/assignments/:id` — Deep-dive assignment detail, submission workbench, attempt history, and faculty evaluation view.
2. **Student Portal Shell Integration**:
   - Update `StudentPortalLayout.jsx` to render the assignment views.
   - Activate the "Assignments" item in `StudentSidebar.jsx` (remove "Soon" badge).
   - Ensure mobile navigation drawer (`StudentMobileNavigation.jsx`) seamlessly navigates to `/student/assignments`.
   - Add a lightweight quick-access assignment card to `StudentDashboard.jsx`.
3. **API Integration via `studentService.js`**:
   - Extend `src/services/studentService.js` with `getAssignments`, `getAssignmentById`, `submitAssignment`, and `getSubmissions`.
   - Consume existing locked Phase 5.10E-B endpoints without backend modifications.
4. **State, Error, and Loading Management**:
   - Integrate design system components: `Card`, `Button`, `Badge`, `Input`, `Select`, `Textarea`, `Modal`, `LoadingSpinner`, `EmptyState`, `ErrorState`.
   - Handle loading spinners, empty list/submissions states, 401/403/404/400 errors, and duplicate submission prevention.
5. **Submission UX**:
   - Support `text`, `external_link`, `file_upload` (metadata record), and `hybrid` submission modes.
   - Confirmation dialog before submission.
   - Disable submission button during in-flight network requests.
   - Instant optimistic-safe re-fetch upon confirmed submission.

---

## 3. Existing API Contracts (Authoritative Locked Backend)

The UI interacts exclusively with the locked Phase 5.10E-B endpoints mounted in `server/server.js`:

### 3.1 List Student Assignments
- **Endpoint**: `GET /api/v1/student/assignments`
- **Auth**: Bearer token (`req.user.id`, role: `'student'`)
- **Query Parameters**:
  - `status`: `'assigned'`, `'in_progress'`, `'submitted'`, `'resubmission_requested'`, `'resubmitted'`, `'completed'`, or filter alias `'pending'`
  - `subjectId`: UUID
  - `chapterId`: UUID
  - `page`: Integer $\ge 1$ (default: `1`)
  - `pageSize`: Integer $1..100$ (default: `20`)
- **Response Shape**:
  ```json
  {
    "success": true,
    "data": {
      "assignments": [
        {
          "id": "uuid (student_assignment_id)",
          "assignment_id": "uuid (master_assignment_id)",
          "student_id": "uuid",
          "status": "assigned | in_progress | submitted | evaluated | resubmission_requested | resubmitted | completed",
          "display_status": "assigned | ... | overdue",
          "first_opened_at": "ISO timestamp | null",
          "current_attempt": 0,
          "final_score": null,
          "is_completed": 0,
          "created_at": "ISO timestamp",
          "updated_at": "ISO timestamp",
          "title": "Quadratic Equations Practice Set",
          "assignment_type": "homework | practice | worksheet",
          "max_score": 50,
          "available_from": "ISO timestamp",
          "due_at": "ISO timestamp",
          "close_at": "ISO timestamp | null",
          "late_policy": "reject_late | grace_period | allow_late",
          "resubmission_policy": "none | single | multiple",
          "subject_name": "Mathematics",
          "subject_code": "MATH-10",
          "class_name": "Class 10",
          "chapter_title": "Quadratic Equations",
          "chapter_number": 4,
          "topic_title": "Nature of Roots"
        }
      ]
    },
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 12,
      "totalPages": 1
    },
    "message": "Student assignments retrieved successfully.",
    "meta": { "timestamp": "..." }
  }
  ```

### 3.2 Get Assignment Detail
- **Endpoint**: `GET /api/v1/student/assignments/:id`
- **Auth**: Bearer token (`req.user.id`, role: `'student'`)
- **Route Param**: `:id` = `student_assignment_id`
- **Response Shape**:
  ```json
  {
    "success": true,
    "data": {
      "assignment": {
        "id": "uuid (student_assignment_id)",
        "assignment_id": "uuid",
        "student_id": "uuid",
        "status": "assigned | in_progress | submitted | evaluated | resubmission_requested | resubmitted | completed",
        "display_status": "assigned | ... | overdue",
        "first_opened_at": "ISO timestamp",
        "current_attempt": 1,
        "final_score": 42.5,
        "is_completed": 1,
        "title": "Quadratic Equations Practice Set",
        "description": "Complete Questions 1 through 10...",
        "assignment_type": "homework",
        "max_score": 50,
        "available_from": "ISO timestamp",
        "due_at": "ISO timestamp",
        "close_at": "ISO timestamp | null",
        "late_policy": "reject_late | grace_period | allow_late",
        "resubmission_policy": "none | single | multiple",
        "max_resubmissions": 1,
        "assignment_master_status": "published",
        "author_name": "Dr. Vikram Seth",
        "subject_name": "Mathematics",
        "subject_code": "MATH-10",
        "class_name": "Class 10",
        "chapter_title": "Quadratic Equations",
        "chapter_number": 4,
        "topic_title": "Nature of Roots",
        "submissions": [
          {
            "id": "uuid (submission_id)",
            "student_assignment_id": "uuid",
            "attempt_number": 1,
            "submission_type": "text | external_link | file_upload | hybrid",
            "text_response": "...",
            "external_link": "https://...",
            "is_late": 0,
            "submitted_at": "ISO timestamp",
            "evaluation_id": "uuid | null",
            "score_awarded": 42.5,
            "grading_status": "evaluated | resubmission_requested | needs_improvement | null",
            "feedback": "Well-structured solution...",
            "evaluated_at": "ISO timestamp | null",
            "evaluator_name": "Dr. Vikram Seth | null"
          }
        ]
      }
    }
  }
  ```

### 3.3 Create Submission Attempt
- **Endpoint**: `POST /api/v1/student/assignments/:id/submissions`
- **Auth**: Bearer token (`req.user.id`, role: `'student'`)
- **Route Param**: `:id` = `student_assignment_id`
- **Request Body**:
  ```json
  {
    "submissionType": "text | external_link | file_upload | hybrid",
    "textResponse": "Solution notes...",
    "externalLink": "https://drive.google.com/...",
    "attachments": [
      {
        "storagePath": "attachments/file.pdf",
        "originalFilename": "homework.pdf",
        "mimeType": "application/pdf",
        "fileSizeBytes": 1048576
      }
    ]
  }
  ```
- **Response Shape**:
  ```json
  {
    "success": true,
    "data": {
      "submission": {
        "id": "uuid",
        "studentAssignmentId": "uuid",
        "attemptNumber": 1,
        "submissionType": "text",
        "textResponse": "...",
        "externalLink": null,
        "isLate": false,
        "submittedAt": "ISO timestamp",
        "studentAssignmentStatus": "submitted"
      }
    }
  }
  ```

---

## 4. Student Assignment Data Model & Status Mapping

### 4.1 Backend Status Model
- `assigned`: Initial state when assigned to student.
- `in_progress`: Student has opened/viewed the assignment (`first_opened_at` recorded).
- `submitted`: Student has submitted Attempt 1.
- `resubmitted`: Student has submitted Attempt $> 1$.
- `resubmission_requested`: Teacher reviewed attempt and requested corrections.
- `evaluated`: Teacher graded attempt.
- `completed`: Teacher completed final grading.
- `overdue`: Derived temporal status when current date $>$ `due_at` and status $\in \{$`assigned`, `in_progress`$\}$.

### 4.2 Badge Presentation
| Status | Badge Variant | Label | Meaning |
|:---|:---|:---|:---|
| `assigned` | `neutral` | Assigned | New task assigned |
| `in_progress` | `neutral` | In Progress | Viewed, not yet submitted |
| `submitted` | `primary` | Submitted | Attempt 1 awaiting grading |
| `resubmitted` | `primary` | Resubmitted | Revised attempt awaiting grading |
| `resubmission_requested` | `accent` | Rework Requested | Revision required by teacher |
| `evaluated` | `accent` | Evaluated | Graded by teacher |
| `completed` | `accent` | Completed | Fully finalized |
| `overdue` | `destructive` | Overdue | Deadline elapsed without submission |

---

## 5. Page Architecture

### 5.1 `StudentAssignments.jsx`
- **Header**: Title "Assignments & Practice", subtitle "Practice, submit and improve through your learning journey."
- **Summary Status Metrics**:
  - All
  - To Do (Assigned / In Progress)
  - Submitted / Resubmitted
  - Rework Requested
  - Completed
- **Filter Controls**:
  - Status Select (All, Pending/To Do, Submitted, Rework Requested, Completed)
  - Subject Select (Dynamically loaded via `studentService.getSubjects()`)
  - Clear Filters Button
- **Assignment Cards Queue**:
  - Subject + Class + Chapter Context
  - Title & Assignment Type Badge
  - Status & Due Date with relative time/overdue indicator
  - Score Badge if evaluated (`45 / 50 Marks`)
  - "View Assignment &rarr;" button routing to `/student/assignments/:id`
- **Pagination**:
  - Pagination controls (`Previous`, `Page X of Y`, `Next`) powered by server pagination metadata.

### 5.2 `StudentAssignmentDetail.jsx`
- **Navigation**: Breadcrumb "Back to Assignments" (`/student/assignments`).
- **Assignment Header**:
  - Title, Subject code & name, Class name, Chapter & Topic breadcrumb.
  - Status Badge + Due Date Banner.
- **Assignment Specifications Card**:
  - Description / Detailed Problem Instructions.
  - Maximum Score.
  - Available From & Due At.
  - Cut-off / Close Date and Late Policy explanation (`Reject late`, `Grace period`, `Allow late`).
  - Resubmission Policy (`No resubmissions`, `Single revision allowed`, `Multiple revisions allowed`).
  - Author / Teacher name (from `author_name`).
- **Submission Workbench**:
  - Only active when status permits submission (`assigned`, `in_progress`, or `resubmission_requested`).
  - If deadline passed and late policy is `reject_late` (or grace period expired): Render clear notice: "Submission closed: The deadline for this assignment has elapsed."
  - If already submitted and awaiting evaluation: Render notice: "Your submission is currently under review by your teacher."
  - Form Fields:
    - Text response (`Textarea`)
    - External Link (`Input` type="url")
    - File Metadata Record (`Input` type="file" with file metadata parsing)
  - "Submit Assignment" button triggering Confirmation Modal.
- **Attempt History & Evaluation Panel**:
  - Chronological rendering of all attempts (`Attempt 1`, `Attempt 2`...).
  - Submitted date, late status indicator, student's text/link/file deliverable.
  - Evaluation breakdown: Marks awarded vs Max marks, Evaluator name, Evaluation timestamp, Qualitative teacher feedback block.

---

## 6. Component Architecture

```
StudentPortalLayout
  ├── StudentSidebar (includes active Assignments nav)
  ├── StudentHeader
  ├── StudentMobileNavigation
  └── Canvas
        ├── StudentAssignments (Route: /student/assignments)
        │     ├── Summary Metrics
        │     ├── Filter Bar (Status, Subject, Clear)
        │     ├── Assignment Cards List
        │     └── Pagination Bar
        │
        └── StudentAssignmentDetail (Route: /student/assignments/:id)
              ├── Breadcrumb Navigation
              ├── Header & Academic Context
              ├── Instructions & Rules Card
              ├── Submission Form (Text, Link, File Metadata)
              ├── Confirmation Modal
              └── Attempt History & Faculty Evaluation Card
```

---

## 7. Routing

- Path matching in `StudentPortalLayout.jsx`:
  - `currentPath === '/student/assignments'` $\rightarrow$ `<StudentAssignments onNavigate={onNavigate} />`
  - `currentPath.startsWith('/student/assignments/')` $\rightarrow$ parse `id = currentPath.replace('/student/assignments/', '').trim()` $\rightarrow$ `<StudentAssignmentDetail assignmentId={id} onNavigate={onNavigate} />`
- Native pushState navigation handled by existing `onNavigate(path)` prop. No external routing libraries introduced.

---

## 8. State Management

- Native React hooks (`useState`, `useEffect`, `useCallback`).
- Re-fetch on filter changes or pagination triggers.
- In-memory refresh when submission completes.
- Zero local/sessionStorage caching of student data.

---

## 9. Loading States

- List view: Centered `LoadingSpinner` with "Loading your assignments...".
- Detail view: Centered `LoadingSpinner` with "Loading assignment details...".
- Submission form: Submit button in loading state ("Submitting your work...") with disabled buttons and backdrop to prevent duplicate clicks.

---

## 10. Empty States

- No assignments at all: "You don't have any assignments yet. Coursework assigned by your tutors will appear here."
- Filtered results empty: "No assignments match your current filters. Try changing or clearing filters."
- Submissions empty: "No submission attempts yet. Complete the assignment below to submit your work."
- Evaluation pending: "Your submission has not been evaluated yet. Faculty feedback will appear here once reviewed."

---

## 11. Error States

- Standard `ErrorState` component integration with retry callbacks.
- 401 Unauthorized: Session refresh or redirect to login.
- 403 Forbidden: "You do not have permission to access this assignment."
- 404 Not Found: "Assignment not found or you do not have access to it." (Does not reveal existence of other students' coursework).
- 400 Bad Request / Validation: Inline form error messages.

---

## 12. Submission UX & Safety

- Single-click protection: Button is immediately disabled upon click.
- Confirmation Modal:
  - Title: "Submit Assignment?"
  - Body: "You are about to submit your response for attempt {attemptNumber}. Please ensure your answers are complete."
  - Action: "Confirm & Submit" vs "Cancel".
- Clear file upload disclosure:
  - "File record metadata mode: Saves file attachment metadata (filename, size, type). Cloud binary storage and CDN integration are scheduled in Phase 6+."

---

## 13. Evaluation UX

- Display:
  - Marks awarded / Maximum marks (e.g. `45 / 50`).
  - Grading status badge (`Evaluated`, `Resubmission Requested`, `Needs Improvement`).
  - Evaluator name (`Evaluated by Dr. Vikram Seth` only if returned by API).
  - Evaluated timestamp.
  - Qualitative feedback box with distinct styling (`mst-sp-feedback-box`).

---

## 14. Responsive Behavior

- **320px – 480px (Mobile)**:
  - Single column stacked layout.
  - Filters stack vertically.
  - Buttons and interactive touch targets $\ge 44$px.
  - Tables / attempt cards adjust without horizontal scrolling.
- **768px (Tablet)**:
  - Two-column grid for metrics and filters.
- **1024px – 1440px (Desktop)**:
  - Two-column detail workbench (Instructions on left, Submission / Evaluation on right).

---

## 15. Accessibility

- Semantic HTML (`<main>`, `<header>`, `<nav>`, `<section>`, `<article>`, `<button>`).
- Heading hierarchy (`<h1>` $\rightarrow$ `<h2>` $\rightarrow$ `<h3>`).
- ARIA live regions for loading status (`role="status"`, `aria-live="polite"`).
- Keyboard-accessible modal dialog with ESC key listener and focus containment.
- Focus visible indicators with standard design tokens (`--focus-ring`).

---

## 16. Security & Invariants

- Frontend security is not authorization; server remains strictly authoritative.
- Student identity is derived exclusively from session token (`req.user.id`).
- No sensitive keys or tokens in localStorage or sessionStorage.

---

## 17. Files to Create

1. `docs/student-assignment-ui-plan.md` (This document)
2. `src/student/pages/StudentAssignments.jsx`
3. `src/student/pages/StudentAssignmentDetail.jsx`
4. `tests/studentAssignmentPortal.test.js`

---

## 18. Files to Modify

1. `src/services/studentService.js` (Add assignment methods)
2. `src/layouts/StudentPortalLayout.jsx` (Wire assignment routes)
3. `src/student/components/StudentSidebar.jsx` (Remove "Soon" badge from Assignments)
4. `src/student/pages/StudentDashboard.jsx` (Add quick-access card to assignments)
5. `src/styles/student-portal.css` (Add assignment portal styling classes)

---

## 19. Explicit Exclusions

- ❌ No parent assignment portal.
- ❌ No teacher assignment management UI.
- ❌ No AWS S3 / Cloudflare R2 binary uploads.
- ❌ No notifications, push alerts, or emails.
- ❌ No automated AI grading or rubrics engine.

---

## 20. Acceptance Criteria

1. Navigating to `/student/assignments` renders the assignment queue.
2. Clicking an assignment opens `/student/assignments/:id`.
3. Filter by status and subject operates properly.
4. Detail page displays instructions, deadlines, attempt history, and evaluations.
5. Submission workbench enables text, link, and file metadata submission with confirmation modal.
6. Attempt number increments monotonically upon submission.
7. Quality gates pass: `npm test`, `npm run build`, `node database/validate-schema.js`.
