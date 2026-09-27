import React, { useState } from 'react';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import Badge from '../../components/Badge.jsx';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

/**
 * Student Login Shell View (Phase 5.10A Foundation)
 * 
 * Provides structural login card without implementing active JWT/auth handling.
 * 
 * @param {Object} props
 * @param {Function} props.onNavigate - Navigation callback
 */
export default function StudentLogin({ onNavigate }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('/student/dashboard');
    }
  };

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

            {/* Architecture Notice */}
            <div
              style={{
                backgroundColor: 'var(--warning-bg)',
                border: '1px solid var(--warning-border)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-3)',
                marginBottom: 'var(--space-5)',
                display: 'flex',
                gap: 'var(--space-2)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--warning)',
                lineHeight: '1.4',
              }}
            >
              <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Foundation Shell:</strong> Active authentication and JWT session handling are scheduled for Phase 6. Submitting will open the student workspace shell.
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
              <Input
                label="Student Email / Admission No."
                placeholder="e.g. rahul@student.mstutorials.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button
                variant="primary"
                size="md"
                type="submit"
                style={{ width: '100%', marginTop: 'var(--space-2)' }}
              >
                Access Student Workspace
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
