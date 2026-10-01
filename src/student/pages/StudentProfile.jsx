import React from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import useAuth from '../../hooks/useAuth.js';
import useStudent from '../hooks/useStudent.js';
import {
  User,
  GraduationCap,
  School,
  Calendar,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  ShieldCheck,
  IdCard,
  Clock,
  Layers,
  FileText,
} from 'lucide-react';

/**
 * Student Profile Page (Phase 5.10C)
 * 
 * Displays complete profile details and authoritative academic enrollment context
 * from GET /api/v1/student/profile and GET /api/v1/student/academic-context.
 * 
 * @param {Object} props
 * @param {Function} props.onNavigate - Client navigation callback
 */
export default function StudentProfile({ onNavigate }) {
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
          Loading student profile and academic context...
        </p>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div style={{ maxWidth: '640px', margin: 'var(--space-8) auto' }}>
        <ErrorState
          title={isAuthError ? 'Authentication Required' : 'Unable to Load Student Profile'}
          message={error}
          onRetry={refreshStudentData}
          retryLabel="Try Again"
        />
      </div>
    );
  }

  const studentName = profile?.name || user?.name || 'Student';
  const admissionNumber = profile?.admissionNumber || user?.identifier || '—';

  return (
    <div className="mst-sp-profile-page">
      {/* 1. Page Header & Back Navigation */}
      <div className="mst-sp-page-header">
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => onNavigate('/student/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
          <h1 className="mst-sp-page-title" style={{ margin: 0 }}>
            {studentName}
          </h1>
          <Badge variant="primary">Admission No: {admissionNumber}</Badge>
          {profile?.status && (
            <Badge variant={profile.status === 'active' ? 'accent' : 'neutral'}>
              {profile.status.toUpperCase()}
            </Badge>
          )}
        </div>
        <p className="mst-sp-page-subtitle">
          Official institutional profile and authoritative curriculum enrollment record.
        </p>
      </div>

      {/* 2. Profile Details Grid */}
      <div className="mst-sp-profile-grid">
        {/* Card 1: Identity & Credentials */}
        <Card
          title="Student Identity"
          subtitle="Verified Registration Record"
          icon={<User size={20} />}
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
              <span className="mst-sp-kv-label">Date of Birth</span>
              <span className="mst-sp-kv-value">{profile?.dateOfBirth || 'Not Specified'}</span>
            </div>
            <div className="mst-sp-kv-item">
              <span className="mst-sp-kv-label">Gender</span>
              <span className="mst-sp-kv-value">
                {profile?.gender
                  ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)
                  : 'Not Specified'}
              </span>
            </div>
            <div className="mst-sp-kv-item">
              <span className="mst-sp-kv-label">Account Role</span>
              <span className="mst-sp-kv-value">Student</span>
            </div>
            <div className="mst-sp-kv-item">
              <span className="mst-sp-kv-label">Registration Date</span>
              <span className="mst-sp-kv-value">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        </Card>

        {/* Card 2: Contact & School Affiliation */}
        <Card
          title="School & Contact Information"
          subtitle="Communication and Institution"
          icon={<School size={20} />}
        >
          <div className="mst-sp-kv-list">
            <div className="mst-sp-kv-item">
              <span className="mst-sp-kv-label">School Name</span>
              <span className="mst-sp-kv-value">{profile?.schoolName || 'Not Specified'}</span>
            </div>
            <div className="mst-sp-kv-item">
              <span className="mst-sp-kv-label">Registered Board</span>
              <span className="mst-sp-kv-value">{profile?.board || '—'}</span>
            </div>
            <div className="mst-sp-kv-item">
              <span className="mst-sp-kv-label">Academic Track</span>
              <span className="mst-sp-kv-value">{profile?.academicTrack || 'Standard'}</span>
            </div>
            <div className="mst-sp-kv-item">
              <span className="mst-sp-kv-label">Email Address</span>
              <span className="mst-sp-kv-value">{profile?.email || 'Not Provided'}</span>
            </div>
            <div className="mst-sp-kv-item">
              <span className="mst-sp-kv-label">Phone Number</span>
              <span className="mst-sp-kv-value">{profile?.phone || 'Not Provided'}</span>
            </div>
            <div className="mst-sp-kv-item">
              <span className="mst-sp-kv-label">Address</span>
              <span className="mst-sp-kv-value">{profile?.address || 'Not Provided'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Academic Enrollment Context Section */}
      <div style={{ marginTop: 'var(--space-6)' }}>
        <Card
          title="Academic Enrollment Context"
          subtitle="Curriculum mapping and batch allocation"
          icon={<GraduationCap size={20} />}
        >
          {enrollment ? (
            <div className="mst-sp-enrollment-grid">
              <div className="mst-sp-enrollment-cell">
                <span className="mst-sp-kv-label">Academic Session</span>
                <span className="mst-sp-kv-value">
                  {enrollment.session?.displayName || enrollment.session?.sessionCode || '—'}
                </span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  Code: {enrollment.session?.sessionCode || '—'}
                </span>
              </div>

              <div className="mst-sp-enrollment-cell">
                <span className="mst-sp-kv-label">Board Affiliation</span>
                <span className="mst-sp-kv-value">
                  {enrollment.board?.name || enrollment.board?.code || '—'}
                </span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  Code: {enrollment.board?.code || '—'}
                </span>
              </div>

              <div className="mst-sp-enrollment-cell">
                <span className="mst-sp-kv-label">Class &amp; Stage</span>
                <span className="mst-sp-kv-value">
                  {enrollment.class?.displayName || `Grade ${enrollment.class?.gradeNumber || ''}`}
                </span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  Stage: {enrollment.class?.stage || 'SECONDARY'}
                </span>
              </div>

              <div className="mst-sp-enrollment-cell">
                <span className="mst-sp-kv-label">Curriculum Program</span>
                <span className="mst-sp-kv-value">{enrollment.program?.name || '—'}</span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  Program Code: {enrollment.program?.code || '—'}
                </span>
              </div>

              <div className="mst-sp-enrollment-cell">
                <span className="mst-sp-kv-label">Batch &amp; Timings</span>
                <span className="mst-sp-kv-value">
                  {enrollment.batch?.name || 'Pending Batch Assignment'}
                </span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  Schedule: {enrollment.batch?.scheduleDescription || 'Standard Tuition Schedule'}
                </span>
              </div>

              <div className="mst-sp-enrollment-cell">
                <span className="mst-sp-kv-label">Enrollment Status</span>
                <div style={{ marginTop: 'var(--space-1)' }}>
                  <Badge variant="accent">
                    {(enrollment.status || 'ACTIVE').toUpperCase()}
                  </Badge>
                </div>
                {enrollment.rollNumber && (
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block', marginTop: 'var(--space-1)' }}>
                    Roll No: {enrollment.rollNumber}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: 'var(--space-4) 0' }}>
              <EmptyState
                icon={<Layers size={36} color="var(--primary)" />}
                title="No Active Academic Enrollment Found"
                description="Your student profile is active, but you are not currently enrolled in any academic session, board, or tuition batch. Please contact MS Tutorials administration to complete your enrollment."
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
