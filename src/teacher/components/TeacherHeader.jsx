import React from 'react';
import { BookOpen, PlusCircle, LogOut, GraduationCap, Shield } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';

/**
 * Top Application Header & Navigation for Teacher Portal
 * 
 * @param {Object} props
 * @param {string} props.currentPath - Active pathname
 * @param {Function} props.onNavigate - Client navigation handler
 */
export default function TeacherHeader({ currentPath, onNavigate }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    if (onNavigate) {
      onNavigate('/student/login');
    }
  };

  const displayName = user?.name || user?.identifier || 'Faculty Member';
  const roleLabel = user?.role === 'admin' ? 'Admin' : 'Faculty';
  const isAssignmentActive = currentPath === '/teacher' || currentPath === '/teacher/assignments';
  const isCreateActive = currentPath === '/teacher/assignments/new';

  return (
    <header className="mst-tp-header" role="banner">
      <div className="mst-tp-header__inner">
        {/* Left Section: Brand & Workspace Title */}
        <div className="mst-tp-header__left">
          <a
            href="/teacher/assignments"
            className="mst-tp-header__brand"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) onNavigate('/teacher/assignments');
            }}
          >
            <div className="mst-tp-header__logo-icon" aria-hidden="true">
              <GraduationCap size={22} />
            </div>
            <div className="mst-tp-header__brand-text">
              <span className="mst-tp-header__brand-title">MS TUTORIALS</span>
              <span className="mst-tp-header__brand-sub">FACULTY WORKSPACE</span>
            </div>
          </a>

          <Badge variant="primary" size="sm" className="mst-tp-header__badge">
            Teacher Portal
          </Badge>
        </div>

        {/* Center: Primary Navigation */}
        <nav className="mst-tp-header__nav" aria-label="Teacher Portal Navigation">
          <button
            type="button"
            className={`mst-tp-header__nav-link ${isAssignmentActive ? 'active' : ''}`}
            onClick={() => onNavigate && onNavigate('/teacher/assignments')}
          >
            <BookOpen size={16} aria-hidden="true" />
            <span>Assignments</span>
          </button>

          <button
            type="button"
            className={`mst-tp-header__nav-link ${isCreateActive ? 'active' : ''}`}
            onClick={() => onNavigate && onNavigate('/teacher/assignments/new')}
          >
            <PlusCircle size={16} aria-hidden="true" />
            <span>Create Assignment</span>
          </button>
        </nav>

        {/* Right Section: Identity & Sign Out */}
        <div className="mst-tp-header__right">
          <div className="mst-tp-header__user-pill">
            <div className="mst-tp-header__avatar" aria-hidden="true">
              {user?.role === 'admin' ? <Shield size={16} /> : displayName.charAt(0).toUpperCase()}
            </div>
            <div className="mst-tp-header__user-meta">
              <span className="mst-tp-header__user-name">{displayName}</span>
              <span className="mst-tp-header__user-role">{roleLabel}</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="mst-tp-header__logout-btn"
            aria-label="Sign Out"
          >
            <LogOut size={16} aria-hidden="true" />
            <span className="mst-tp-header__logout-label">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
