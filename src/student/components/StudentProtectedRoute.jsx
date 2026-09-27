import React, { useEffect } from 'react';
import useAuth from '../../hooks/useAuth.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

/**
 * Route Guard for Student Portal Views (/student/*)
 * 
 * Enforces:
 *   1. Active authentication.
 *   2. Role verification (user.role === 'student').
 *   3. Session restoration loading state.
 *   4. Redirect preservation (?redirect=...).
 * 
 * @param {Object} props
 * @param {string} props.currentPath - Active pathname
 * @param {Function} props.onNavigate - Navigation callback
 * @param {React.ReactNode} props.children - Protected child view
 */
export default function StudentProtectedRoute({ currentPath, onNavigate, children }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Redirect unauthenticated visitors to login with return target
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirectParam = currentPath && currentPath !== '/student' && currentPath !== '/student/dashboard'
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
          Verifying student session...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated: waiting for redirect
  if (!isAuthenticated) {
    return null;
  }

  // 3. Role Mismatch (Authenticated, but not a student)
  if (user && user.role !== 'student') {
    return (
      <div style={{ maxWidth: '640px', margin: 'var(--space-12) auto 0', padding: '0 var(--space-4)' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)' }} role="alert">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger)',
                margin: '0 auto var(--space-4)',
              }}
              aria-hidden="true"
            >
              <ShieldAlert size={32} />
            </div>

            <div style={{ marginBottom: 'var(--space-2)' }}>
              <Badge variant="danger">403 Forbidden</Badge>
            </div>

            <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--navy)', marginBottom: 'var(--space-2)' }}>
              Student Portal Access Restricted
            </h2>

            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', lineHeight: '1.5', maxWidth: '480px', margin: '0 auto var(--space-6)' }}>
              You are currently authenticated as an <strong>{user.role}</strong> ({user.identifier || user.name}). The Student Portal is strictly restricted to enrolled students.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <Button
                variant="outline"
                size="md"
                leftIcon={<ArrowLeft size={16} />}
                onClick={() => onNavigate('/')}
              >
                Public Website
              </Button>

              <Button
                variant="danger"
                size="md"
                leftIcon={<LogOut size={16} />}
                onClick={async () => {
                  await logout();
                  onNavigate('/student/login');
                }}
              >
                Sign In as Student
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // 4. Authenticated Student
  return <>{children}</>;
}
