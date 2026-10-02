import React, { useState, useEffect, useCallback } from 'react';
import teacherService from '../../services/teacherService.js';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import Modal from '../../components/Modal.jsx';
import {
  ArrowLeft,
  Calendar,
  Layers,
  Award,
  Users,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  ShieldAlert
} from 'lucide-react';

export default function TeacherAssignmentDetail({ assignmentId, onNavigate }) {
  const [assignment, setAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Publish Modal State
  const [publishModal, setPublishModal] = useState({
    isOpen: false,
    isPublishing: false,
    error: null,
  });

  const loadAssignment = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await teacherService.getAssignmentById(assignmentId);
      setAssignment(data);
    } catch (err) {
      if (err.status === 403) {
        setError('You do not have permission to view or manage this assignment. Access is restricted to the authoring faculty member.');
      } else if (err.status === 404) {
        setError('The requested assignment could not be found.');
      } else {
        setError(err.message || 'Unable to retrieve assignment details. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    loadAssignment();
  }, [loadAssignment]);

  const handleOpenPublish = () => {
    setPublishModal({
      isOpen: true,
      isPublishing: false,
      error: null,
    });
  };

  const handleClosePublish = () => {
    setPublishModal({
      isOpen: false,
      isPublishing: false,
      error: null,
    });
  };

  const handleConfirmPublish = async () => {
    setPublishModal((prev) => ({ ...prev, isPublishing: true, error: null }));
    try {
      await teacherService.publishAssignment(assignmentId);
      handleClosePublish();
      loadAssignment();
    } catch (err) {
      setPublishModal((prev) => ({
        ...prev,
        isPublishing: false,
        error: err.message || 'Failed to publish assignment.',
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="mst-tp-container">
        <div className="mst-tp-loading-state" role="status" aria-live="polite">
          <LoadingSpinner size="lg" />
          <p>Loading assignment specifications...</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="mst-tp-container">
        <ErrorState
          title="Assignment Notice"
          description={error || 'Assignment details could not be loaded.'}
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

  const isDraft = assignment.status === 'draft';
  const isPublished = assignment.status === 'published';

  const formattedAvailable = assignment.available_from
    ? new Date(assignment.available_from).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Immediate';

  const formattedDue = assignment.due_at
    ? new Date(assignment.due_at).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'No deadline set';

  const formattedClose = assignment.close_at
    ? new Date(assignment.close_at).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'No hard close date';

  return (
    <div className="mst-tp-container">
      {/* Back Link */}
      <button
        type="button"
        className="mst-tp-back-link"
        onClick={() => onNavigate && onNavigate('/teacher/assignments')}
      >
        <ArrowLeft size={16} />
        <span>Back to Assignments Dashboard</span>
      </button>

      {/* Header Bar */}
      <div className="mst-tp-page-header">
        <div>
          <div className="mst-tp-card-meta-tags" style={{ marginBottom: 'var(--space-2)' }}>
            <Badge
              variant={isDraft ? 'neutral' : isPublished ? 'primary' : 'accent'}
              size="sm"
            >
              {assignment.status ? assignment.status.toUpperCase() : 'UNKNOWN'}
            </Badge>
            <Badge variant="outline" size="sm">
              {assignment.assignment_type || 'homework'}
            </Badge>
          </div>
          <h1 className="mst-tp-page-title">{assignment.title}</h1>
        </div>

        <div className="mst-tp-detail-actions">
          {isDraft && (
            <Button
              variant="primary"
              size="md"
              onClick={handleOpenPublish}
            >
              <Send size={16} style={{ marginRight: 'var(--space-2)' }} />
              Publish Assignment
            </Button>
          )}

          <Button
            variant="secondary"
            size="md"
            onClick={() => onNavigate && onNavigate(`/teacher/assignments/${assignment.id}/submissions`)}
          >
            <Users size={16} style={{ marginRight: 'var(--space-2)' }} />
            Submissions Queue
          </Button>
        </div>
      </div>

      <div className="mst-tp-detail-grid">
        {/* Left Column: Specifications & Content */}
        <div className="mst-tp-detail-main">
          {/* Instructions */}
          <Card className="mst-tp-form-card">
            <h2 className="mst-tp-section-heading">Description & Instructions</h2>
            <div className="mst-tp-instruction-content">
              {assignment.description || 'No description provided.'}
            </div>
          </Card>

          {/* Curriculum Anchoring */}
          <Card className="mst-tp-form-card">
            <h2 className="mst-tp-section-heading">Curriculum Hierarchy</h2>
            <div className="mst-tp-kv-list">
              <div className="mst-tp-kv-item">
                <span className="mst-tp-kv-key">Curriculum Node</span>
                <span className="mst-tp-kv-val">{assignment.curriculum_node_id || assignment.curriculumNodeId}</span>
              </div>
              {assignment.chapter_id && (
                <div className="mst-tp-kv-item">
                  <span className="mst-tp-kv-key">Chapter</span>
                  <span className="mst-tp-kv-val">{assignment.chapter_id}</span>
                </div>
              )}
              {assignment.topic_id && (
                <div className="mst-tp-kv-item">
                  <span className="mst-tp-kv-key">Topic</span>
                  <span className="mst-tp-kv-val">{assignment.topic_id}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Targets */}
          <Card className="mst-tp-form-card">
            <h2 className="mst-tp-section-heading">Target Distribution ({assignment.targets?.length || 0})</h2>
            {assignment.targets && assignment.targets.length > 0 ? (
              <div className="mst-tp-targets-table-wrap">
                <table className="mst-tp-table">
                  <thead>
                    <tr>
                      <th>Target Scope</th>
                      <th>Target ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignment.targets.map((tgt, i) => (
                      <tr key={tgt.id || i}>
                        <td>
                          <Badge variant="outline" size="sm">
                            {tgt.target_type || tgt.targetType}
                          </Badge>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 'var(--font-size-xs)' }}>
                          {tgt.target_id || tgt.targetId}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                No explicit cohort targets attached to this assignment.
              </p>
            )}
          </Card>
        </div>

        {/* Right Column: Policies & Parameters */}
        <div className="mst-tp-detail-sidebar">
          <Card className="mst-tp-form-card">
            <h2 className="mst-tp-section-heading">Evaluation Parameters</h2>
            <div className="mst-tp-kv-list">
              <div className="mst-tp-kv-item">
                <span className="mst-tp-kv-key">Max Score</span>
                <span className="mst-tp-kv-val" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  {assignment.max_score} pts
                </span>
              </div>
              <div className="mst-tp-kv-item">
                <span className="mst-tp-kv-key">Late Policy</span>
                <span className="mst-tp-kv-val">{assignment.late_policy?.replace('_', ' ')}</span>
              </div>
              <div className="mst-tp-kv-item">
                <span className="mst-tp-kv-key">Resubmission</span>
                <span className="mst-tp-kv-val">{assignment.resubmission_policy}</span>
              </div>
              {assignment.resubmission_policy !== 'none' && (
                <div className="mst-tp-kv-item">
                  <span className="mst-tp-kv-key">Max Resubmissions</span>
                  <span className="mst-tp-kv-val">{assignment.max_resubmissions}</span>
                </div>
              )}
            </div>
          </Card>

          <Card className="mst-tp-form-card">
            <h2 className="mst-tp-section-heading">Schedule & Deadlines</h2>
            <div className="mst-tp-kv-list">
              <div className="mst-tp-kv-item">
                <span className="mst-tp-kv-key">Available From</span>
                <span className="mst-tp-kv-val">{formattedAvailable}</span>
              </div>
              <div className="mst-tp-kv-item">
                <span className="mst-tp-kv-key">Due Date</span>
                <span className="mst-tp-kv-val" style={{ color: 'var(--primary)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {formattedDue}
                </span>
              </div>
              <div className="mst-tp-kv-item">
                <span className="mst-tp-kv-key">Close Date</span>
                <span className="mst-tp-kv-val">{formattedClose}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Publish Modal */}
      <Modal
        isOpen={publishModal.isOpen}
        onClose={handleClosePublish}
        title="Confirm Assignment Publication"
      >
        <div className="mst-tp-modal-body">
          <p>
            Publishing <strong>{assignment.title}</strong> will materialize student assignment records for all eligible students within the targeted cohorts.
          </p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
            Once published, students can immediately access instructions and submit responses once the available date arrives.
          </p>

          {publishModal.error && (
            <div className="mst-tp-error-banner" role="alert" style={{ marginTop: 'var(--space-4)' }}>
              <AlertCircle size={18} />
              <span>{publishModal.error}</span>
            </div>
          )}

          <div className="mst-tp-modal-actions" style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
            <Button
              variant="outline"
              size="md"
              disabled={publishModal.isPublishing}
              onClick={handleClosePublish}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={publishModal.isPublishing}
              onClick={handleConfirmPublish}
            >
              {publishModal.isPublishing ? 'Publishing...' : 'Publish Now'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
