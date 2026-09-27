import React, { useState, useEffect } from 'react';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import Badge from '../../components/Badge.jsx';
import useAuth from '../../hooks/useAuth.js';
import { ArrowLeft, AlertCircle, LogIn } from 'lucide-react';

/**
 * Student Login View (Phase 5.10B Auth Integration)
 * 
 * Interacts with locked POST /api/auth/login via AuthContext.
 * 
 * @param {Object} props
 * @param {Function} props.onNavigate - Navigation callback
 */
export default function StudentLogin({ onNavigate }) {
  const { user, isAuthenticated, isSubmitting, error, login, clearError } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  // If already authenticated as student, navigate straight to dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === 'student') {
      onNavigate('/student/dashboard');
    }
  }, [isAuthenticated, user, onNavigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!identifier.trim()) {
      setLocalError('Please enter your student email or admission number.');
      return;
    }

    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    try {
      await login({ identifier, password });

      // Resolve redirect destination safely
      let target = '/student/dashboard';
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const redirectParam = params.get('redirect');
        if (redirectParam && redirectParam.startsWith('/student') && redirectParam !== '/student/login') {
          target = redirectParam;
        }
      }
      onNavigate(target);
    } catch (err) {
      // Error is set in AuthContext state
    }
  };

  const activeError = localError || error;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6) var(--space-4)',
        backgroundColor: 'var(--bg-subtle)',
      }}
    >
      <div style={{ maxWidth: '440px', width: '100%' }}>
        {/* Back Link */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            style={{
              background: 'transparent',
              color: 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: 'var(--font-size-sm)',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <ArrowLeft size={16} />
            <span>Return to Public Website</span>
          </button>
        </div>

        <Card>
          <div style={{ padding: 'var(--space-6)' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
              <img
                src="/logo/logo.svg"
                alt="MS Tutorials Logo"
                style={{ height: '44px', width: 'auto', margin: '0 auto var(--space-3)' }}
              />
              <div style={{ marginBottom: 'var(--space-2)' }}>
                <Badge variant="primary">Student Portal</Badge>
              </div>
              <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--navy)', margin: 0 }}>
                Student Sign In
              </h2>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
                Enter your credentials to access your academic workspace.
              </p>
            </div>

            {/* Error Alert */}
            {activeError && (
              <div
                style={{
                  backgroundColor: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-3)',
                  marginBottom: 'var(--space-5)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--danger)',
                  lineHeight: '1.4',
                }}
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{activeError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
              <Input
                label="Student Email / Admission No."
                placeholder="e.g. AS26090 or student@mstutorials.com"
                value={identifier}
                disabled={isSubmitting}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (activeError) {
                    setLocalError('');
                    clearError();
                  }
                }}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                disabled={isSubmitting}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (activeError) {
                    setLocalError('');
                    clearError();
                  }
                }}
              />

              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                leftIcon={!isSubmitting && <LogIn size={16} />}
                style={{ width: '100%', marginTop: 'var(--space-2)' }}
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In'}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
