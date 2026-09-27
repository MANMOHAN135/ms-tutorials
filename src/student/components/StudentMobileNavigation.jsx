import React, { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import Badge from '../../components/Badge.jsx';
import { STUDENT_NAV_GROUPS } from './StudentSidebar.jsx';

/**
 * Mobile and Tablet Slide-out Drawer Navigation for Student Portal
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether drawer is visible
 * @param {Function} props.onClose - Dismissal callback
 * @param {string} props.currentPath - Active route pathname
 * @param {Function} props.onNavigate - Navigation callback
 */
export default function StudentMobileNavigation({
  isOpen,
  onClose,
  currentPath,
  onNavigate,
}) {
  // Dismiss drawer on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const isItemActive = (path) => {
    if (path === '/student/dashboard') {
      return currentPath === '/student/dashboard' || currentPath === '/student';
    }
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const handleItemClick = (path) => {
    onNavigate(path);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`mst-sp-drawer-backdrop ${isOpen ? 'mst-sp-drawer-backdrop--open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={`mst-sp-drawer ${isOpen ? 'mst-sp-drawer--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Student Portal Navigation Drawer"
      >
        <div className="mst-sp-drawer__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <img
              src="/logo/logo.svg"
              alt="MS Tutorials Logo"
              style={{ height: '32px', width: 'auto' }}
            />
            <span className="mst-sp-header__portal-tag">Student</span>
          </div>

          <button
            type="button"
            className="mst-sp-drawer__close-btn"
            onClick={onClose}
            aria-label="Close navigation drawer"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav className="mst-sp-drawer__body" aria-label="Mobile Navigation">
          {STUDENT_NAV_GROUPS.map((group) => (
            <div key={group.title} className="mst-sp-sidebar__group">
              <span className="mst-sp-sidebar__group-title">{group.title}</span>
              {group.items.map((item) => {
                const active = isItemActive(item.path);
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item.path)}
                    className={`mst-sp-nav-item ${active ? 'mst-sp-nav-item--active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span className="mst-sp-nav-item__content">
                      <span className="mst-sp-nav-item__icon" aria-hidden="true">
                        <Icon size={18} />
                      </span>
                      <span className="mst-sp-nav-item__label">{item.label}</span>
                    </span>

                    {item.badge && (
                      <Badge variant="neutral" style={{ fontSize: '10px', padding: '0.1rem 0.4rem' }}>
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              onClick={() => handleItemClick('/')}
              className="mst-sp-nav-item"
              style={{ justifyContent: 'flex-start', color: 'var(--text-muted)' }}
            >
              <span className="mst-sp-nav-item__content">
                <span className="mst-sp-nav-item__icon" aria-hidden="true">
                  <ExternalLink size={16} />
                </span>
                <span className="mst-sp-nav-item__label" style={{ fontSize: 'var(--font-size-xs)' }}>
                  Public Website
                </span>
              </span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
