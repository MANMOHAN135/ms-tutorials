import React, { useEffect } from 'react';
import TeacherHeader from '../teacher/components/TeacherHeader.jsx';
import TeacherProtectedRoute from '../teacher/components/TeacherProtectedRoute.jsx';
import TeacherAssignments from '../teacher/pages/TeacherAssignments.jsx';
import TeacherAssignmentCreate from '../teacher/pages/TeacherAssignmentCreate.jsx';
import TeacherAssignmentDetail from '../teacher/pages/TeacherAssignmentDetail.jsx';
import TeacherAssignmentSubmissions from '../teacher/pages/TeacherAssignmentSubmissions.jsx';
import TeacherSubmissionDetail from '../teacher/pages/TeacherSubmissionDetail.jsx';

/**
 * Master Shell Layout for MS Tutorials Teacher Portal
 * 
 * Provides responsive workspace shell isolating /teacher/* from the marketing website.
 * Enforces authenticated faculty access and maps internal teacher routes.
 * 
 * @param {Object} props
 * @param {string} props.currentPath - Active route pathname
 * @param {Function} props.onNavigate - Navigation callback
 */
export default function TeacherPortalLayout({ currentPath, onNavigate }) {
  // Update document title dynamically
  useEffect(() => {
    const originalTitle = document.title;
    let pageTitle = 'Teacher Portal | MS Tutorials';

    if (currentPath === '/teacher' || currentPath === '/teacher/assignments') {
      pageTitle = 'Assignments Dashboard | MS Tutorials Faculty';
    } else if (currentPath === '/teacher/assignments/new') {
      pageTitle = 'Author New Assignment | MS Tutorials Faculty';
    } else if (currentPath.includes('/submissions/')) {
      pageTitle = 'Evaluate Submission | MS Tutorials Faculty';
    } else if (currentPath.endsWith('/submissions')) {
      pageTitle = 'Submissions Queue | MS Tutorials Faculty';
    } else if (currentPath.startsWith('/teacher/assignments/')) {
      pageTitle = 'Assignment Details | MS Tutorials Faculty';
    }

    document.title = pageTitle;

    return () => {
      document.title = originalTitle;
    };
  }, [currentPath]);

  // Route Dispatcher
  const renderTeacherView = () => {
    if (currentPath === '/teacher' || currentPath === '/teacher/assignments') {
      return <TeacherAssignments onNavigate={onNavigate} />;
    }

    if (currentPath === '/teacher/assignments/new') {
      return <TeacherAssignmentCreate onNavigate={onNavigate} />;
    }

    // Pattern: /teacher/assignments/:id/submissions/:submissionId
    const submissionDetailMatch = currentPath.match(/^\/teacher\/assignments\/([^/]+)\/submissions\/([^/]+)$/);
    if (submissionDetailMatch) {
      const assignmentId = submissionDetailMatch[1];
      const submissionId = submissionDetailMatch[2];
      return (
        <TeacherSubmissionDetail
          assignmentId={assignmentId}
          submissionId={submissionId}
          onNavigate={onNavigate}
        />
      );
    }

    // Pattern: /teacher/assignments/:id/submissions
    const submissionsQueueMatch = currentPath.match(/^\/teacher\/assignments\/([^/]+)\/submissions$/);
    if (submissionsQueueMatch) {
      const assignmentId = submissionsQueueMatch[1];
      return (
        <TeacherAssignmentSubmissions
          assignmentId={assignmentId}
          onNavigate={onNavigate}
        />
      );
    }

    // Pattern: /teacher/assignments/:id
    const assignmentDetailMatch = currentPath.match(/^\/teacher\/assignments\/([^/]+)$/);
    if (assignmentDetailMatch) {
      const assignmentId = assignmentDetailMatch[1];
      return (
        <TeacherAssignmentDetail
          assignmentId={assignmentId}
          onNavigate={onNavigate}
        />
      );
    }

    // Default fallback
    return <TeacherAssignments onNavigate={onNavigate} />;
  };

  return (
    <TeacherProtectedRoute currentPath={currentPath} onNavigate={onNavigate}>
      <div className="mst-tp-layout">
        {/* Skip Navigation Link */}
        <a href="#main-teacher-content" className="mst-tp-skip-link">
          Skip to main content
        </a>

        {/* Global Teacher Header */}
        <TeacherHeader currentPath={currentPath} onNavigate={onNavigate} />

        {/* Main Content Area */}
        <main id="main-teacher-content" className="mst-tp-main-content" tabIndex={-1}>
          {renderTeacherView()}
        </main>
      </div>
    </TeacherProtectedRoute>
  );
}
