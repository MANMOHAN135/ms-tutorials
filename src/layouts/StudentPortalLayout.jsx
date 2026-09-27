import React, { useState, useEffect } from 'react';
import StudentHeader from '../student/components/StudentHeader.jsx';
import StudentSidebar from '../student/components/StudentSidebar.jsx';
import StudentMobileNavigation from '../student/components/StudentMobileNavigation.jsx';
import StudentDashboard from '../student/pages/StudentDashboard.jsx';
import StudentPagePlaceholder from '../student/components/StudentPagePlaceholder.jsx';

/**
 * Master Shell Layout for MS Tutorials Student Portal
 * 
 * Provides responsive workspace shell isolating /student/* from the marketing website.
 * 
 * @param {Object} props
 * @param {string} props.currentPath - Active route pathname
 * @param {Function} props.onNavigate - Navigation callback
 */
export default function StudentPortalLayout({ currentPath, onNavigate }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Close mobile navigation drawer whenever route path changes
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [currentPath]);

  // Set document title and noindex robots meta for student portal views
  useEffect(() => {
    const originalTitle = document.title;
    let pageTitle = 'Student Portal | MS Tutorials';

    if (currentPath === '/student/dashboard' || currentPath === '/student') {
      pageTitle = 'Dashboard | MS Tutorials Student Portal';
    } else if (currentPath === '/student/resources') {
      pageTitle = 'Learning Resources | MS Tutorials Student Portal';
    } else if (currentPath.startsWith('/student/resources/')) {
      pageTitle = 'Resource Detail | MS Tutorials Student Portal';
    } else if (currentPath === '/student/assignments') {
      pageTitle = 'Assignments | MS Tutorials Student Portal';
    } else if (currentPath === '/student/tests') {
      pageTitle = 'Tests & Assessments | MS Tutorials Student Portal';
    } else if (currentPath === '/student/results') {
      pageTitle = 'Results | MS Tutorials Student Portal';
    } else if (currentPath === '/student/progress') {
      pageTitle = 'Progress & Mastery | MS Tutorials Student Portal';
    } else if (currentPath === '/student/attendance') {
      pageTitle = 'Attendance | MS Tutorials Student Portal';
    } else if (currentPath === '/student/announcements') {
      pageTitle = 'Announcements | MS Tutorials Student Portal';
    } else if (currentPath === '/student/messages') {
      pageTitle = 'Messages | MS Tutorials Student Portal';
    } else if (currentPath === '/student/profile') {
      pageTitle = 'Profile & Context | MS Tutorials Student Portal';
    } else if (currentPath === '/student/settings') {
      pageTitle = 'Settings | MS Tutorials Student Portal';
    }

    document.title = pageTitle;

    return () => {
      document.title = originalTitle;
    };
  }, [currentPath]);

  const renderStudentView = () => {
    if (currentPath === '/student' || currentPath === '/student/dashboard') {
      return <StudentDashboard onNavigate={onNavigate} />;
    }

    if (currentPath === '/student/resources') {
      return (
        <StudentPagePlaceholder
          title="Learning Resources Library"
          description="Curriculum-scoped notes, practice worksheets, question banks, and video walkthroughs mapped to CBSE and ICSE chapters and topics."
          phaseBadge="Phase 5.10B / 5.10C Resource Integration"
          onNavigate={onNavigate}
        />
      );
    }

    if (currentPath.startsWith('/student/resources/')) {
      return (
        <StudentPagePlaceholder
          title="Resource Asset Detail & Viewer"
          description="Dedicated asset viewer and study document reader connected to verified resource IDs."
          phaseBadge="Phase 5.10C Resource Viewer"
          onNavigate={onNavigate}
        />
      );
    }

    if (currentPath === '/student/assignments') {
      return (
        <StudentPagePlaceholder
          title="Assignments & Practice"
          description="Periodic homework, worksheet submission, and teacher evaluation feedback."
          phaseBadge="Phase 6+ Roadmap Subsystem"
          onNavigate={onNavigate}
        />
      );
    }

    if (currentPath === '/student/tests') {
      return (
        <StudentPagePlaceholder
          title="Tests & Periodic Assessments"
          description="Weekly chapter tests, periodic assessments, and official board mock examinations."
          phaseBadge="Phase 6+ Roadmap Subsystem"
          onNavigate={onNavigate}
        />
      );
    }

    if (currentPath === '/student/results') {
      return (
        <StudentPagePlaceholder
          title="Performance & Results"
          description="Exam scorecards, chapter-wise marks breakdown, and relative cohort analytics."
          phaseBadge="Phase 6+ Roadmap Subsystem"
          onNavigate={onNavigate}
        />
      );
    }

    if (currentPath === '/student/progress') {
      return (
        <StudentPagePlaceholder
          title="Curriculum Mastery & Progress"
          description="Real-time syllabus completion tracker and diagnostic mistake log."
          phaseBadge="Phase 6+ Roadmap Subsystem"
          onNavigate={onNavigate}
        />
      );
    }

    if (currentPath === '/student/attendance') {
      return (
        <StudentPagePlaceholder
          title="Session Attendance Ledger"
          description="Tuition batch session attendance record and monthly participation ledger."
          phaseBadge="Phase 6+ Roadmap Subsystem"
          onNavigate={onNavigate}
        />
      );
    }

    if (currentPath === '/student/announcements') {
      return (
        <StudentPagePlaceholder
          title="Announcements & Notices"
          description="Official institute circulars, holiday notices, and revised timetable bulletins."
          phaseBadge="Phase 6+ Roadmap Subsystem"
          onNavigate={onNavigate}
        />
      );
    }

    if (currentPath === '/student/messages') {
      return (
        <StudentPagePlaceholder
          title="Faculty Direct Messages"
          description="Direct academic messaging between student and subject mentor."
          phaseBadge="Phase 6+ Roadmap Subsystem"
          onNavigate={onNavigate}
        />
      );
    }

    if (currentPath === '/student/profile') {
      return (
        <StudentPagePlaceholder
          title="Profile & Academic Context"
          description="Verified student identity records, session details, board affiliation, and cohort batch assignments."
          phaseBadge="Phase 5.11 Profile Integration"
          onNavigate={onNavigate}
        />
      );
    }

    if (currentPath === '/student/settings') {
      return (
        <StudentPagePlaceholder
          title="Account Settings"
          description="Notification preferences, display options, and security credentials management."
          phaseBadge="Planned Roadmap Module"
          onNavigate={onNavigate}
        />
      );
    }

    // Default fallback for any other /student/* route
    return (
      <StudentPagePlaceholder
        title="Student Workspace Route"
        description={`The requested section (${currentPath}) is scheduled in upcoming portal roadmap phases.`}
        onNavigate={onNavigate}
      />
    );
  };

  return (
    <div className="mst-sp-layout">
      {/* 1. Accessible Skip Navigation Link */}
      <a href="#student-main-content" className="mst-sp-skip-link">
        Skip to main content
      </a>

      {/* 2. Top Application Header */}
      <StudentHeader
        onNavigate={onNavigate}
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        isMobileNavOpen={isMobileNavOpen}
      />

      {/* 3. Main Workspace Shell (Sidebar + Canvas) */}
      <div className="mst-sp-body-container">
        {/* Desktop Persistent Left Rail Sidebar */}
        <StudentSidebar
          currentPath={currentPath}
          onNavigate={onNavigate}
        />

        {/* Mobile / Tablet Slide-out Drawer */}
        <StudentMobileNavigation
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          currentPath={currentPath}
          onNavigate={onNavigate}
        />

        {/* Content Canvas */}
        <div className="mst-sp-canvas">
          <main
            id="student-main-content"
            className="mst-sp-main-content"
            tabIndex="-1"
          >
            {renderStudentView()}
          </main>
        </div>
      </div>
    </div>
  );
}
