import React, { useEffect } from 'react';
import useAuth from '../../hooks/useAuth.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

/**
 * Route Guard for Teacher Assignment & Evaluation Management Views (/teacher/*)
 * 
 * Enforces:
 *   1. Active authentication.
 *   2. Role verification (user.role === 'teacher' || user.role === 'admin').
 *   3. Session restoration loading state.
 *   4. Safe access rejection for non-faculty accounts (e.g., students/parents).
 * 
 * @param {Object} props
 * @param {string} props.currentPath - Active pathname
 * @param {Function} props.onNavigate - Navigation callback
 * @param {React.ReactNode} props.children - Protected child view
 */
export default function TeacherProtectedRoute({ currentPath, onNavigate, children }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Redirect unauthenticated visitors to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirectParam = currentPath && currentPath !== '/teacher' && currentPath !== '/teacher/assignments'
        ? `?redirect=${encodeURIComponent(currentPath)}`
        : '';
      onNavigate(`/student/login${redirectParam}`);
    }
  }, [isLoading, isAuthenticated, currentPath, onNavigate]);

  // 1. Initial Session Restoration Loading State
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 'var(--space-4)',
        }}
        role="status"
        aria-live="polite"
      >
        <LoadingSpinner size="lg" />
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
          Verifying faculty credentials and session...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated: waiting for redirect
  if (!isAuthenticated) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 'var(--space-4)',
          padding: 'var(--space-6)',
        }}
      >
        <LoadingSpinner size="md" />
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
          Redirecting to authentication portal...
        </p>
      </div>
    );
  }

  // 3. Authenticated but non-faculty role (e.g., student or parent)
  const isFaculty = user?.role === 'teacher' || user?.role === 'admin';

  if (!isFaculty) {
    return (
      <main
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '70vh',
          padding: 'var(--space-6)',
        }}
      >
        <Card
          style={{
            maxWidth: '540px',
            width: '100%',
            padding: 'var(--space-8)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--destructive)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <ShieldAlert size={36} aria-hidden="true" />
          </div>

          <Badge variant="destructive" size="sm" style={{ marginBottom: 'var(--space-3)' }}>
            Restricted Faculty Zone
          </Badge>

          <h2
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--text-main)',
              marginBottom: 'var(--space-2)',
            }}
          >
            Access Denied
          </h2>

          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: 'var(--space-6)',
            }}
          >
            The Teacher Assignment & Evaluation Management Portal is restricted exclusively to authorized faculty members and academic administrators. Your current account role (<strong>{user?.role || 'user'}</strong>) is not authorized to access this workspace.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'var(--space-3)',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="secondary"
              size="md"
              onClick={() => onNavigate(user?.role === 'student' ? '/student/dashboard' : '/')}
            >
              <ArrowLeft size={16} style={{ marginRight: 'var(--space-2)' }} />
              {user?.role === 'student' ? 'Return to Student Portal' : 'Return to Home'}
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={async () => {
                await logout();
                onNavigate('/student/login');
              }}
            >
              <LogOut size={16} style={{ marginRight: 'var(--space-2)' }} />
              Sign Out & Switch Account
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  // 4. Authorized faculty member
  return children;
}
