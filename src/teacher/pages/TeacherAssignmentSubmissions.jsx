import React, { useState, useEffect, useCallback } from 'react';
import teacherService from '../../services/teacherService.js';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import Select from '../../components/Select.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import {
  ArrowLeft,
  Users,
  Award,
  CheckCircle,
  Clock,
  AlertCircle,
  FileCheck,
  Edit3,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function TeacherAssignmentSubmissions({ assignmentId, onNavigate }) {
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Pagination
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [asgn, subs] = await Promise.all([
        teacherService.getAssignmentById(assignmentId),
        teacherService.getAssignmentSubmissions(
          assignmentId,
          { status: statusFilter },
          { page, pageSize: 20 }
        ),
      ]);
      setAssignment(asgn);
      setSubmissions(subs.submissions || []);
      setTotalPages(subs.pagination?.totalPages || 1);
      setTotalCount(subs.pagination?.total || 0);
    } catch (err) {
      if (err.status === 403) {
        setError('You do not have permission to view submissions for this assignment. Access is restricted to the authoring faculty member.');
      } else if (err.status === 404) {
        setError('The requested assignment could not be found.');
      } else {
        setError(err.message || 'Unable to retrieve submissions queue. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [assignmentId, statusFilter, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="mst-tp-container">
        <div className="mst-tp-loading-state" role="status" aria-live="polite">
          <LoadingSpinner size="lg" />
          <p>Loading submission queue and student records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mst-tp-container">
        <ErrorState
          title="Submission Queue Notice"
          description={error}
          action={
            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigate && onNavigate('/teacher/assignments')}
            >
              <ArrowLeft size={16} style={{ marginRight: 'var(--space-2)' }} />
              Return to Assignments
            </Button>
          }
        />
      </div>
    );
  }

  const submittedCount = submissions.filter(
    (s) => s.student_assignment_status === 'submitted' || s.student_assignment_status === 'resubmitted'
  ).length;
  const evaluatedCount = submissions.filter(
    (s) => s.student_assignment_status === 'evaluated' || s.student_assignment_status === 'completed'
  ).length;

  return (
    <div className="mst-tp-container">
      {/* Back Link */}
      <button
        type="button"
        className="mst-tp-back-link"
        onClick={() => onNavigate && onNavigate(`/teacher/assignments/${assignmentId}`)}
      >
        <ArrowLeft size={16} />
        <span>Back to Assignment Details</span>
      </button>

      {/* Header */}
      <div className="mst-tp-page-header">
        <div>
          <div className="mst-tp-card-meta-tags" style={{ marginBottom: 'var(--space-2)' }}>
            <span className="mst-tp-tag-pill">
              Max Score: {assignment?.max_score || 50} pts
            </span>
            <Badge variant="outline" size="sm">
              {assignment?.assignment_type || 'homework'}
            </Badge>
          </div>
          <h1 className="mst-tp-page-title">{assignment?.title || 'Assignment'} — Submissions</h1>
          <p className="mst-tp-page-subtitle">
            Review student attempts, evaluate solutions, award scores, and request revisions.
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={() => onNavigate && onNavigate(`/teacher/assignments/${assignmentId}`)}
        >
          View Specs
        </Button>
      </div>

      {/* Metrics */}
      <div className="mst-tp-metrics-grid">
        <Card className="mst-tp-metric-card">
          <div className="mst-tp-metric-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div className="mst-tp-metric-content">
            <span className="mst-tp-metric-value">{totalCount}</span>
            <span className="mst-tp-metric-label">Targeted Students</span>
          </div>
        </Card>

        <Card className="mst-tp-metric-card">
          <div className="mst-tp-metric-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent)' }}>
            <Clock size={24} />
          </div>
          <div className="mst-tp-metric-content">
            <span className="mst-tp-metric-value">{submittedCount}</span>
            <span className="mst-tp-metric-label">Awaiting Evaluation</span>
          </div>
        </Card>

        <Card className="mst-tp-metric-card">
          <div className="mst-tp-metric-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="mst-tp-metric-content">
            <span className="mst-tp-metric-value">{evaluatedCount}</span>
            <span className="mst-tp-metric-label">Evaluated</span>
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="mst-tp-filter-card">
        <div className="mst-tp-filter-row">
          <div className="mst-tp-filter-col">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter submissions by status"
            >
              <option value="all">All Enrolled Students</option>
              <option value="submitted">Submitted (Needs Grading)</option>
              <option value="evaluated">Evaluated</option>
              <option value="resubmission_requested">Resubmission Requested</option>
              <option value="assigned">Assigned / In Progress (Not Submitted)</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <EmptyState
          title="No Submissions Found"
          description={
            statusFilter !== 'all'
              ? 'No student submissions match the active status filter.'
              : 'No students have submitted attempts for this assignment yet.'
          }
          action={
            statusFilter !== 'all' ? (
              <Button variant="outline" size="md" onClick={() => setStatusFilter('all')}>
                Show All Students
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="mst-tp-submissions-list">
          <table className="mst-tp-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Attempt</th>
                <th>Mode</th>
                <th>Submitted Date</th>
                <th>Status</th>
                <th>Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => {
                const hasSubmission = !!sub.submission_id;
                const isLate = sub.is_late === 1;
                const submittedDate = sub.submitted_at
                  ? new Date(sub.submitted_at).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—';

                const status = sub.student_assignment_status;
                const badgeVariant =
                  status === 'submitted' || status === 'resubmitted'
                    ? 'primary'
                    : status === 'evaluated' || status === 'completed'
                    ? 'accent'
                    : status === 'resubmission_requested'
                    ? 'destructive'
                    : 'neutral';

                return (
                  <tr key={sub.student_assignment_id || sub.submission_id}>
                    <td>
                      <div className="mst-tp-student-col">
                        <span className="mst-tp-student-name">{sub.student_name || 'Enrolled Student'}</span>
                        <span className="mst-tp-student-adm">Adm: {sub.admission_number || '—'}</span>
                      </div>
                    </td>
                    <td>
                      {hasSubmission ? (
                        <span className="mst-tp-attempt-pill">#{sub.attempt_number}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      {hasSubmission ? (
                        <span className="mst-tp-mode-label">{sub.submission_type || 'text'}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div className="mst-tp-date-col">
                        <span>{submittedDate}</span>
                        {isLate && (
                          <Badge variant="destructive" size="xs">
                            Late
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge variant={badgeVariant} size="sm">
                        {status ? status.replace('_', ' ').toUpperCase() : 'ASSIGNED'}
                      </Badge>
                    </td>
                    <td>
                      <span className="mst-tp-score-text">
                        {sub.score_awarded !== null && sub.score_awarded !== undefined
                          ? `${sub.score_awarded} / ${assignment?.max_score || 50}`
                          : sub.final_score !== null && sub.final_score !== undefined
                          ? `${sub.final_score} / ${assignment?.max_score || 50}`
                          : '—'}
                      </span>
                    </td>
                    <td>
                      {hasSubmission ? (
                        <Button
                          variant={status === 'submitted' || status === 'resubmitted' ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() =>
                            onNavigate &&
                            onNavigate(
                              `/teacher/assignments/${assignmentId}/submissions/${sub.submission_id}`
                            )
                          }
                        >
                          <Edit3 size={14} style={{ marginRight: 'var(--space-1)' }} />
                          {status === 'submitted' || status === 'resubmitted' ? 'Evaluate' : 'Review'}
                        </Button>
                      ) : (
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mst-tp-pagination">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="mst-tp-page-indicator">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
