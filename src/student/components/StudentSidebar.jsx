import React from 'react';
import Badge from '../../components/Badge.jsx';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  Award,
  TrendingUp,
  CalendarCheck,
  Bell,
  MessageSquare,
  User,
  Settings,
  ExternalLink,
} from 'lucide-react';

export const STUDENT_NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'My Learning',
    items: [
      { id: 'resources', label: 'Resources', path: '/student/resources', icon: BookOpen },
      { id: 'assignments', label: 'Assignments', path: '/student/assignments', icon: FileCheck2, badge: 'Soon' },
      { id: 'tests', label: 'Tests & Results', path: '/student/tests', icon: Award, badge: 'Soon' },
      { id: 'progress', label: 'Progress', path: '/student/progress', icon: TrendingUp, badge: 'Soon' },
    ],
  },
  {
    title: 'Academic Life',
    items: [
      { id: 'attendance', label: 'Attendance', path: '/student/attendance', icon: CalendarCheck, badge: 'Soon' },
      { id: 'announcements', label: 'Announcements', path: '/student/announcements', icon: Bell, badge: 'Soon' },
      { id: 'messages', label: 'Messages', path: '/student/messages', icon: MessageSquare, badge: 'Soon' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'profile', label: 'Profile & Context', path: '/student/profile', icon: User },
      { id: 'settings', label: 'Settings', path: '/student/settings', icon: Settings },
    ],
  },
];

/**
 * Desktop Persistent Rail Sidebar for Student Portal
 * 
 * @param {Object} props
 * @param {string} props.currentPath - Active route pathname
 * @param {Function} props.onNavigate - Navigation handler callback
 */
export default function StudentSidebar({ currentPath, onNavigate }) {
  const isItemActive = (path) => {
    if (path === '/student/dashboard') {
      return currentPath === '/student/dashboard' || currentPath === '/student';
    }
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  return (
    <aside
      className="mst-sp-sidebar"
      role="navigation"
      aria-label="Student Portal Navigation"
    >
      <div className="mst-sp-sidebar__nav">
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
                  onClick={() => onNavigate(item.path)}
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
      </div>

      <div className="mst-sp-sidebar__footer">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="mst-sp-nav-item"
          style={{ justifyContent: 'flex-start', color: 'var(--text-muted)' }}
          title="Return to MS Tutorials Public Website"
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
    </aside>
  );
}
