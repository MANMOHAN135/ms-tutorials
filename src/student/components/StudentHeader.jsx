import React from 'react';
import { Menu, User, LogOut } from 'lucide-react';
import StudentContextBadge from './StudentContextBadge.jsx';

/**
 * Top Application Header for Student Portal
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
            title="Academic Session 2026-27"
            subtitle="CBSE Class 10 Achievers"
          />
        </div>

        {/* Right Section: Student Profile Shell & Exit */}
        <div className="mst-sp-header__actions">
          <a
            href="/student/profile"
            className="mst-sp-header__user"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) onNavigate('/student/profile');
            }}
            aria-label="View Student Profile"
          >
            <div className="mst-sp-header__user-avatar" aria-hidden="true">
              <User size={18} />
            </div>
            <div className="mst-sp-header__user-info">
              <span className="mst-sp-header__user-name">Student Portal</span>
              <span className="mst-sp-header__user-role">Enrolled Student</span>
            </div>
          </a>

          <button
            type="button"
            className="mst-sp-header__menu-btn"
            style={{ display: 'flex' }}
            title="Return to Public Website"
            aria-label="Return to Public Website"
            onClick={() => {
              if (onNavigate) onNavigate('/');
            }}
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
