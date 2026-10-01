import React from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import useAuth from '../../hooks/useAuth.js';
import useStudent from '../hooks/useStudent.js';
import {
  BookOpen,
  User,
  GraduationCap,
  Layers,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Calendar,
  School,
  IdCard,
} from 'lucide-react';

/**
 * Student Dashboard (Phase 5.10C)
 * 
 * Displays authenticated student identity and active academic enrollment context
 * retrieved from locked Phase 5.5 and Phase 5.8C backend APIs.
 * 
 * @param {Object} props
 * @param {Function} props.onNavigate - Navigation callback
 */
export default function StudentDashboard({ onNavigate }) {
  const { user } = useAuth();
  const {
    profile,
    enrollment,
    isLoading,
    error,
    isAuthError,
    refreshStudentData,
  } = useStudent();

  // 1. Loading State
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: 'var(--space-4)',
        }}
        role="status"
        aria-live="polite"
      >
        <LoadingSpinner size="lg" />
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
          Loading your academic context and profile...
        </p>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div style={{ maxWidth: '640px', margin: 'var(--space-8) auto' }}>
        <ErrorState
          title={isAuthError ? 'Authentication Required' : 'Unable to Load Student Workspace'}
          message={error}
          onRetry={refreshStudentData}
          retryLabel="Try Again"
        />
      </div>
    );
  }

  const studentName = profile?.name || user?.name || 'Student';
  const admissionNumber = profile?.admissionNumber || user?.identifier || 'N/A';

  return (
    <div>
      {/* 1. Header Banner */}
      <div className="mst-sp-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)', flexWrap: 'wrap' }}>
          <Badge variant="primary">Enrolled Student</Badge>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Admission No: <strong>{admissionNumber}</strong>
          </span>
          {profile?.status && (
            <Badge variant={profile.status === 'active' ? 'accent' : 'neutral'}>
              {profile.status.toUpperCase()}
            </Badge>
          )}
        </div>
        <h1 className="mst-sp-page-title">Welcome back, {studentName}</h1>
        <p className="mst-sp-page-subtitle">
          Dedicated academic environment for CBSE &amp; ICSE Maths and Science tuition.
        </p>
      </div>

      {/* 2. Unassigned Enrollment Warning Banner if enrollment is null */}
      {!enrollment && (
        <div className="mst-sp-banner-warning" role="region" aria-label="Enrollment notice">
          <AlertCircle size={22} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--warning-dark, #b45309)' }} />
          <div>
            <strong style={{ display: 'block', marginBottom: 'var(--space-1)', color: 'var(--warning-dark, #b45309)' }}>
              No Active Academic Enrollment Found
            </strong>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-main)', lineHeight: '1.5' }}>
              Your student account is verified, but an active academic enrollment (Session, Board, Class, and Batch) has not yet been assigned for the current term. Please contact your tuition administrator to finalize your batch enrollment.
            </span>
          </div>
        </div>
      )}

      {/* 3. Primary Dashboard Cards Grid */}
      <div className="mst-sp-dashboard-grid">
        {/* Card 1: Student Profile & Identity */}
        <Card
          title="Student Profile"
          subtitle="Identity & Registration"
          icon={<User size={20} />}
          footer={
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ArrowRight size={14} />}
              onClick={() => onNavigate('/student/profile')}
            >
              Full Profile Details
            </Button>
          }
        >
          <div className="mst-sp-kv-list">
            <div className="mst-sp-kv-item">
              <span className="mst-sp-kv-label">Full Name</span>
              <span className="mst-sp-kv-value">{profile?.name || user?.name || '—'}</span>
            </div>
            <div className="mst-sp-kv-item">
              <span className="mst-sp-kv-label">Admission Number</span>
              <span className="mst-sp-kv-value">{profile?.admissionNumber || '—'}</span>
            </div>
            <div className="mst-sp-kv-item">
              <span className="mst-sp-kv-label">School Affiliation</span>
              <span className="mst-sp-kv-value">{profile?.schoolName || 'Not Specified'}</span>
            </div>
            <div className="mst-sp-kv-item">
              <span className="mst-sp-kv-label">Contact Email</span>
              <span className="mst-sp-kv-value">{profile?.email || '—'}</span>
            </div>
            <div className="mst-sp-kv-item">
              <span className="mst-sp-kv-label">Phone</span>
              <span className="mst-sp-kv-value">{profile?.phone || '—'}</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Academic Context Card */}
        <Card
          title="Academic Context"
          subtitle="Curriculum & Cohort"
          icon={<GraduationCap size={20} />}
          footer={
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ArrowRight size={14} />}
              onClick={() => onNavigate('/student/profile')}
            >
              View Academic Details
            </Button>
          }
        >
          {enrollment ? (
            <div className="mst-sp-kv-list">
              <div className="mst-sp-kv-item">
                <span className="mst-sp-kv-label">Academic Session</span>
                <span className="mst-sp-kv-value">
                  {enrollment.session?.displayName || enrollment.session?.sessionCode || '—'}
                </span>
              </div>
              <div className="mst-sp-kv-item">
                <span className="mst-sp-kv-label">Board</span>
                <span className="mst-sp-kv-value">
                  {enrollment.board?.name ? `${enrollment.board.name} (${enrollment.board.code})` : (enrollment.board?.code || '—')}
                </span>
              </div>
              <div className="mst-sp-kv-item">
                <span className="mst-sp-kv-label">Class &amp; Stage</span>
                <span className="mst-sp-kv-value">
                  {enrollment.class?.displayName || `Class ${enrollment.class?.gradeNumber || ''}`}
                  {enrollment.class?.stage ? ` (${enrollment.class.stage})` : ''}
                </span>
              </div>
              <div className="mst-sp-kv-item">
                <span className="mst-sp-kv-label">Program</span>
                <span className="mst-sp-kv-value">{enrollment.program?.name || '—'}</span>
              </div>
              <div className="mst-sp-kv-item">
                <span className="mst-sp-kv-label">Batch &amp; Schedule</span>
                <span className="mst-sp-kv-value">
                  {enrollment.batch
                    ? `${enrollment.batch.name}${enrollment.batch.scheduleDescription ? ` • ${enrollment.batch.scheduleDescription}` : ''}`
                    : 'Batch Assignment Pending'}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ padding: 'var(--space-2) 0', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              <p style={{ margin: 0, lineHeight: '1.5' }}>
                No active enrollment is currently registered in your academic ledger.
              </p>
            </div>
          )}
        </Card>

        {/* Card 3: Learning Resources Library */}
        <Card
          title="Learning Resources"
          subtitle="Curriculum-scoped study materials"
          icon={<BookOpen size={20} />}
          footer={
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ArrowRight size={14} />}
              onClick={() => onNavigate('/student/resources')}
            >
              Open Resources
            </Button>
          }
        >
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
            Curated notes, practice worksheets, question banks, and video walkthroughs mapped to CBSE and ICSE chapters and topics.
          </p>
        </Card>

        {/* Card 4: Upcoming Subsystems */}
        <Card
          title="Upcoming Subsystems"
          subtitle="Roadmap Phase 6+"
          icon={<Layers size={20} />}
          footer={
            <Badge variant="neutral">Scheduled In Phase 6+</Badge>
          }
        >
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <CheckCircle2 size={14} color="var(--primary)" />
              <span>Assignments &amp; Practice Submission</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <CheckCircle2 size={14} color="var(--primary)" />
              <span>Periodic Tests &amp; Performance Ledger</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <CheckCircle2 size={14} color="var(--primary)" />
              <span>Topic Mastery &amp; Diagnostic Progress</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <CheckCircle2 size={14} color="var(--primary)" />
              <span>Session Attendance &amp; Faculty Notices</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
