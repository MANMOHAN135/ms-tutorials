import React from 'react';
import { Menu, User, LogOut } from 'lucide-react';
import StudentContextBadge from './StudentContextBadge.jsx';
import useAuth from '../../hooks/useAuth.js';
import useStudent from '../hooks/useStudent.js';

/**
 * Top Application Header for Student Portal
 * 
 * Displays authenticated student details and provides logout trigger.
 * 
 * @param {Object} props
 * @param {Function} props.onNavigate - Client navigation handler
 * @param {Function} props.onToggleMobileNav - Mobile drawer toggle handler
 * @param {boolean} [props.isMobileNavOpen=false] - Mobile drawer status
 */
export default function StudentHeader({
  onNavigate,
  onToggleMobileNav,
  isMobileNavOpen = false,
}) {
  const { user, logout } = useAuth();
  const { profile, enrollment, isLoading: isStudentLoading } = useStudent();

  const handleLogout = async () => {
    await logout();
    if (onNavigate) {
      onNavigate('/student/login');
    }
  };

  const displayName = profile?.name || user?.name || 'Student Portal';
  const displaySub = profile?.admissionNumber
    ? `Adm: ${profile.admissionNumber}`
    : (user?.identifier ? `ID: ${user.identifier}` : 'Enrolled Student');
  const userInitial = (profile?.name || user?.name)
    ? (profile?.name || user?.name).charAt(0).toUpperCase()
    : null;

  // Derive dynamic context badge copy
  let contextTitle = 'Academic Session';
  let contextSubtitle = 'Academic Context';
  let isEnrolled = true;

  if (isStudentLoading) {
    contextTitle = 'Loading...';
    contextSubtitle = 'Academic Context';
  } else if (enrollment) {
    contextTitle = enrollment.session?.displayName || enrollment.session?.sessionCode || 'Active Session';
    const boardCode = enrollment.board?.code || '';
    const classCode = enrollment.class?.displayName || '';
    const batchName = enrollment.batch?.name ? ` • ${enrollment.batch.name}` : '';
    contextSubtitle = `${boardCode} ${classCode}${batchName}`.trim() || 'Enrolled Student';
  } else {
    contextTitle = 'No Active Session';
    contextSubtitle = 'Enrollment Pending';
    isEnrolled = false;
  }

  return (
    <header className="mst-sp-header" role="banner">
      <div className="mst-sp-header__inner">
        {/* Left Section: Menu Toggle (Mobile/Tablet) & Brand */}
        <div className="mst-sp-header__left">
          <button
            type="button"
            className="mst-sp-header__menu-btn"
            onClick={onToggleMobileNav}
            aria-label={isMobileNavOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={isMobileNavOpen}
          >
            <Menu size={22} aria-hidden="true" />
          </button>

          <a
            href="/student/dashboard"
            className="mst-sp-header__brand"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) onNavigate('/student/dashboard');
            }}
            aria-label="MS Tutorials Student Portal Home"
          >
            <img
              src="/logo/logo.svg"
              alt="MS Tutorials Logo"
              className="mst-sp-header__logo"
            />
            <span className="mst-sp-header__portal-tag">Student</span>
          </a>
        </div>

        {/* Center Section: Academic Context Chip */}
        <div className="mst-sp-header__context">
          <StudentContextBadge
            title={contextTitle}
            subtitle={contextSubtitle}
            isEnrolled={isEnrolled}
          />
        </div>

        {/* Right Section: Authenticated Student Profile & Logout */}
        <div className="mst-sp-header__actions">
          <a
            href="/student/profile"
            className="mst-sp-header__user"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) onNavigate('/student/profile');
            }}
            aria-label={`View Student Profile for ${displayName}`}
          >
            <div className="mst-sp-header__user-avatar" aria-hidden="true">
              {userInitial ? userInitial : <User size={18} />}
            </div>
            <div className="mst-sp-header__user-info">
              <span className="mst-sp-header__user-name">{displayName}</span>
              <span className="mst-sp-header__user-role">{displaySub}</span>
            </div>
          </a>

          <button
            type="button"
            className="mst-sp-header__menu-btn"
            style={{ display: 'flex' }}
            title="Sign Out of Student Portal"
            aria-label="Sign Out of Student Portal"
            onClick={handleLogout}
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
