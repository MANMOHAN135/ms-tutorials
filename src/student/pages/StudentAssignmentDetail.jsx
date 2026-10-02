import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import Textarea from '../../components/Textarea.jsx';
import Modal from '../../components/Modal.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import studentService from '../../services/studentService.js';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Award,
  Layers,
  FileCheck2,
  ExternalLink,
  Upload,
  AlertCircle,
  CheckCircle2,
  User,
  Info,
  Send,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

/**
 * Formats ISO date to human-readable format.
 */
function formatDateTime(isoString) {
  if (!isoString) return 'Not specified';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
}

/**
 * Returns accessible badge variant and text for assignment status.
 */
function getStatusBadge(status, displayStatus) {
  if (displayStatus === 'overdue') {
    return { variant: 'destructive', label: 'Overdue' };
  }

  switch (status) {
    case 'assigned':
      return { variant: 'neutral', label: 'Assigned' };
    case 'in_progress':
      return { variant: 'neutral', label: 'In Progress' };
    case 'submitted':
      return { variant: 'primary', label: 'Submitted' };
    case 'resubmitted':
      return { variant: 'primary', label: 'Resubmitted' };
    case 'resubmission_requested':
      return { variant: 'accent', label: 'Rework Requested' };
    case 'evaluated':
      return { variant: 'accent', label: 'Evaluated' };
    case 'completed':
      return { variant: 'accent', label: 'Completed' };
    default:
      return { variant: 'neutral', label: status || 'Assigned' };
  }
}

/**
 * Formats file size in bytes to KB or MB.
 */
function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '0 KB';
  if (bytes >= 1048576) {
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

/**
 * Student Assignment Detail & Submission Workbench (Phase 5.10E-C)
 * 
 * @param {Object} props
 * @param {string} props.assignmentId - Student assignment UUID
 * @param {Function} props.onNavigate - Navigation callback
 */
export default function StudentAssignmentDetail({ assignmentId, onNavigate }) {
  const [assignment, setAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNotFound, setIsNotFound] = useState(false);

  // Submission Form State
  const [submissionType, setSubmissionType] = useState('text');
  const [textResponse, setTextResponse] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [attachmentMetadata, setAttachmentMetadata] = useState(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState('');

  const fetchDetail = useCallback(async () => {
    if (!assignmentId) {
      setIsNotFound(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsNotFound(false);

    try {
      const data = await studentService.getAssignmentById(assignmentId);
      if (!data) {
        setIsNotFound(true);
      } else {
        setAssignment(data);
        // Default submission type if assignment suggests one
        if (data.assignment_type === 'worksheet' || data.assignment_type === 'homework') {
          setSubmissionType('text');
        }
      }
    } catch (err) {
      console.error('Failed to load assignment detail:', err);
      if (err.status === 404 || err.code === 'NOT_FOUND') {
        setIsNotFound(true);
      } else {
        setError(err.message || 'Failed to load assignment details.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Handle file metadata extraction
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setAttachmentMetadata(null);
      return;
    }

    setAttachmentMetadata({
      storagePath: `attachments/${file.name}`,
      originalFilename: file.name,
      mimeType: file.type || 'application/octet-stream',
      fileSizeBytes: file.size,
    });
  };

  // Validate form before opening confirm modal
  const handleInitiateSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitSuccessMsg('');

    if (submissionType === 'text' && !textResponse.trim()) {
      setFormError('Please enter your written solution response.');
      return;
    }

    if (submissionType === 'external_link') {
      if (!externalLink.trim()) {
        setFormError('Please provide a valid external URL (e.g. Google Drive, Google Docs, or GitHub).');
        return;
      }
      try {
        const parsed = new URL(externalLink.trim());
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          setFormError('URL must start with http:// or https://');
          return;
        }
      } catch {
        setFormError('Please enter a valid URL.');
        return;
      }
    }

    if (submissionType === 'file_upload' && !attachmentMetadata) {
      setFormError('Please select a file to attach.');
      return;
    }

    if (submissionType === 'hybrid' && !textResponse.trim() && !externalLink.trim() && !attachmentMetadata) {
      setFormError('Please provide at least a text response, link, or file attachment.');
      return;
    }

    setShowConfirmModal(true);
  };

  // Execute submission
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setFormError('');

    try {
      const payload = {
        submissionType,
        textResponse: textResponse.trim() || null,
        externalLink: externalLink.trim() || null,
        attachments: attachmentMetadata ? [attachmentMetadata] : [],
      };

      await studentService.submitAssignment(assignmentId, payload);
      setShowConfirmModal(false);
      setTextResponse('');
      setExternalLink('');
      setAttachmentMetadata(null);
      setSubmitSuccessMsg('Assignment submitted successfully! Your attempt has been recorded.');

      // Refresh assignment details to show new attempt and updated status
      await fetchDetail();
    } catch (err) {
      console.error('Submission failed:', err);
      setFormError(err.message || 'Failed to submit assignment. Please try again.');
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Loading assignment details...
        </p>
      </div>
    );
  }

  // 2. 404 Not Found State
  if (isNotFound) {
    return (
      <div style={{ maxWidth: '640px', margin: 'var(--space-8) auto' }}>
        <EmptyState
          title="Assignment Not Found"
          description="Assignment not found or you do not have access to it. Please check with your tuition teacher or return to your assignments queue."
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('/student/assignments')}
              leftIcon={<ArrowLeft size={16} />}
            >
              Return to Assignments
            </Button>
          }
        />
      </div>
    );
  }

  // 3. Error State
  if (error) {
    return (
      <div style={{ maxWidth: '640px', margin: 'var(--space-8) auto' }}>
        <ErrorState
          title="Unable to Load Assignment"
          message={error}
          onRetry={fetchDetail}
          retryLabel="Try Again"
        />
      </div>
    );
  }

  if (!assignment) return null;

  const statusBadge = getStatusBadge(assignment.status, assignment.display_status);
  const isOverdue = assignment.display_status === 'overdue';
  const now = new Date();
  const dueAt = new Date(assignment.due_at);
  const closeAt = assignment.close_at ? new Date(assignment.close_at) : null;
  const isPastDue = now > dueAt;
  const isPastClose = closeAt && now > closeAt;

  // Determine if student can submit
  const isSubmissionOpen =
    assignment.assignment_master_status === 'published' &&
    (!isPastClose || !closeAt) &&
    (!isPastDue || assignment.late_policy !== 'reject_late');

  const canSubmit =
    isSubmissionOpen &&
    (assignment.current_attempt === 0 ||
      ['assigned', 'in_progress', 'resubmission_requested'].includes(assignment.status));

  const submissions = Array.isArray(assignment.submissions) ? assignment.submissions : [];
  const nextAttemptNumber = (assignment.current_attempt || 0) + 1;

  return (
    <div className="mst-sp-assignment-detail-page">
      {/* 1. Back Navigation Button */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('/student/assignments')}
          leftIcon={<ArrowLeft size={16} />}
        >
          Back to Assignments
        </Button>
      </div>

      {/* 2. Page Header & Academic Context */}
      <div className="mst-sp-page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
          {assignment.subject_name && (
            <Badge variant="primary">
              {assignment.subject_name} {assignment.subject_code ? `(${assignment.subject_code})` : ''}
            </Badge>
          )}
          {assignment.class_name && (
            <Badge variant="neutral">
              {assignment.class_name}
            </Badge>
          )}
          {assignment.chapter_title && (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              {assignment.chapter_number ? `Ch ${assignment.chapter_number}: ` : ''}{assignment.chapter_title}
            </span>
          )}
          {assignment.topic_title && (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              &bull; {assignment.topic_title}
            </span>
          )}
          <Badge variant={statusBadge.variant}>
            {statusBadge.label}
          </Badge>
        </div>

        <h1 className="mst-sp-page-title" style={{ marginBottom: 'var(--space-2)' }}>
          {assignment.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          {assignment.author_name && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <User size={14} />
              <span>Faculty: <strong>{assignment.author_name}</strong></span>
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: isOverdue ? 'var(--danger, #dc2626)' : 'inherit' }}>
            <Clock size={14} />
            <span>Due: <strong>{formatDateTime(assignment.due_at)}</strong></span>
          </span>
          {assignment.max_score !== null && assignment.max_score !== undefined && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <Award size={14} />
              <span>Max Score: <strong>{assignment.max_score} Marks</strong></span>
            </span>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {submitSuccessMsg && (
        <div
          className="mst-sp-banner-success"
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            backgroundColor: 'var(--light-teal, #e6fffa)',
            border: '1px solid var(--primary)',
            color: 'var(--primary-dark, #0f766e)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-4)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
          <span>{submitSuccessMsg}</span>
        </div>
      )}

      {/* Resubmission Callout Notice */}
      {assignment.status === 'resubmission_requested' && (
        <div
          className="mst-sp-banner-warning"
          role="region"
          aria-label="Resubmission notice"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-3)',
            backgroundColor: '#fffbeb',
            border: '1px solid #f59e0b',
            color: '#92400e',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <AlertTriangle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ display: 'block', marginBottom: 'var(--space-1)' }}>
              Revision / Rework Requested by Faculty
            </strong>
            <span style={{ fontSize: 'var(--font-size-sm)', lineHeight: '1.5' }}>
              Your teacher has evaluated your previous attempt and requested corrections. Please inspect the feedback below and submit your revised solution for <strong>Attempt {nextAttemptNumber}</strong>.
            </span>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout on Desktop */}
      <div
        className="mst-sp-assignment-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-6)',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: Instructions, Rules & Specifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Card: Instructions */}
          <Card
            title="Assignment Instructions"
            subtitle="Guidance & Deliverables"
            icon={<FileCheck2 size={20} />}
          >
            {assignment.description ? (
              <div
                style={{
                  fontSize: 'var(--font-size-sm)',
                  lineHeight: '1.7',
                  color: 'var(--text-main)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {assignment.description}
              </div>
            ) : (
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', margin: 0 }}>
                No additional description provided. Please follow instructions given during tuition class.
              </p>
            )}
          </Card>

          {/* Card: Policy & Deadline Parameters */}
          <Card
            title="Parameters & Policies"
            subtitle="Submission Rules"
            icon={<Info size={20} />}
          >
            <div className="mst-sp-kv-list">
              <div className="mst-sp-kv-item">
                <span className="mst-sp-kv-label">Available From</span>
                <span className="mst-sp-kv-value">{formatDateTime(assignment.available_from)}</span>
              </div>
              <div className="mst-sp-kv-item">
                <span className="mst-sp-kv-label">Due Date</span>
                <span className="mst-sp-kv-value" style={{ color: isOverdue ? 'var(--danger, #dc2626)' : 'inherit', fontWeight: 'var(--font-weight-semibold)' }}>
                  {formatDateTime(assignment.due_at)}
                </span>
              </div>
              {assignment.close_at && (
                <div className="mst-sp-kv-item">
                  <span className="mst-sp-kv-label">Final Cut-Off Date</span>
                  <span className="mst-sp-kv-value">{formatDateTime(assignment.close_at)}</span>
                </div>
              )}
              <div className="mst-sp-kv-item">
                <span className="mst-sp-kv-label">Late Submission Policy</span>
                <span className="mst-sp-kv-value" style={{ textTransform: 'capitalize' }}>
                  {assignment.late_policy === 'reject_late'
                    ? 'Strict (Rejects Late Submissions)'
                    : assignment.late_policy === 'grace_period'
                    ? 'Grace Period Allowed (Flagged)'
                    : 'Late Submissions Allowed (Flagged)'}
                </span>
              </div>
              <div className="mst-sp-kv-item">
                <span className="mst-sp-kv-label">Resubmission Policy</span>
                <span className="mst-sp-kv-value" style={{ textTransform: 'capitalize' }}>
                  {assignment.resubmission_policy === 'none'
                    ? 'Single Attempt Only'
                    : assignment.resubmission_policy === 'single'
                    ? '1 Revision Permitted'
                    : `${assignment.max_resubmissions || 'Multiple'} Revisions Permitted`}
                </span>
              </div>
              <div className="mst-sp-kv-item">
                <span className="mst-sp-kv-label">Attempts Recorded</span>
                <span className="mst-sp-kv-value">{assignment.current_attempt || 0}</span>
              </div>
              {assignment.final_score !== null && assignment.final_score !== undefined && (
                <div className="mst-sp-kv-item">
                  <span className="mst-sp-kv-label">Current Final Score</span>
                  <span className="mst-sp-kv-value" style={{ color: 'var(--primary)', fontWeight: 'var(--font-weight-bold)' }}>
                    {assignment.final_score} / {assignment.max_score} Marks
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Submission Workbench & Attempt History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Submission Workbench */}
          {canSubmit ? (
            <Card
              title={assignment.current_attempt > 0 ? `Submit Revision (Attempt ${nextAttemptNumber})` : 'Submit Your Solution'}
              subtitle="Submit homework deliverables for evaluation"
              icon={<Send size={20} />}
            >
              <form onSubmit={handleInitiateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {formError && (
                  <div
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      backgroundColor: '#fee2e2',
                      border: '1px solid #ef4444',
                      borderRadius: 'var(--radius-sm)',
                      color: '#991b1b',
                      fontSize: 'var(--font-size-xs)',
                    }}
                    role="alert"
                  >
                    {formError}
                  </div>
                )}

                {/* Submission Mode Selector */}
                <div>
                  <label className="mst-label" style={{ marginBottom: 'var(--space-2)' }}>
                    Submission Format
                  </label>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    {[
                      { id: 'text', label: 'Written Text' },
                      { id: 'external_link', label: 'External Link' },
                      { id: 'file_upload', label: 'File Metadata' },
                      { id: 'hybrid', label: 'Hybrid' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          setSubmissionType(mode.id);
                          setFormError('');
                        }}
                        style={{
                          padding: '0.4rem 0.8rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: submissionType === mode.id ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)',
                          border: `1px solid ${submissionType === mode.id ? 'var(--primary)' : 'var(--border-color)'}`,
                          backgroundColor: submissionType === mode.id ? 'var(--light-teal)' : 'var(--white)',
                          color: submissionType === mode.id ? 'var(--primary)' : 'var(--text-main)',
                          cursor: 'pointer',
                        }}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Response Field */}
                {['text', 'hybrid'].includes(submissionType) && (
                  <Textarea
                    label="Written Solution / Working Steps"
                    required={submissionType === 'text'}
                    placeholder="Type or paste your step-by-step mathematical working, scientific derivation, or written answers..."
                    rows={6}
                    value={textResponse}
                    onChange={(e) => setTextResponse(e.target.value)}
                    helperText={`${textResponse.length} characters written.`}
                  />
                )}

                {/* External Link Field */}
                {['external_link', 'hybrid'].includes(submissionType) && (
                  <Input
                    label="External Document / Cloud Link"
                    type="url"
                    required={submissionType === 'external_link'}
                    placeholder="https://drive.google.com/file/d/... or link to PDF"
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    helperText="Ensure public view permissions are enabled on your Google Drive or cloud link."
                  />
                )}

                {/* File Metadata Selector */}
                {['file_upload', 'hybrid'].includes(submissionType) && (
                  <div className="mst-form-group">
                    <label className="mst-label">
                      Attach Solution File (Metadata Record)
                    </label>
                    <input
                      type="file"
                      className="mst-input"
                      onChange={handleFileChange}
                      style={{ padding: 'var(--space-2)' }}
                    />
                    {attachmentMetadata ? (
                      <p className="mst-helper-text" style={{ color: 'var(--primary)' }}>
                        Selected: <strong>{attachmentMetadata.originalFilename}</strong> ({formatFileSize(attachmentMetadata.fileSizeBytes)})
                      </p>
                    ) : (
                      <p className="mst-helper-text">
                        File metadata record mode: Attaches file name, size, and type. Full cloud binary CDN is scheduled in Phase 6+.
                      </p>
                    )}
                  </div>
                )}

                <div style={{ marginTop: 'var(--space-2)', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isSubmitting}
                    rightIcon={<Send size={16} />}
                  >
                    Submit Assignment (Attempt {nextAttemptNumber})
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card
              title="Submission Status"
              subtitle="Evaluation & Review Status"
              icon={<Info size={20} />}
            >
              {isPastClose || (isPastDue && assignment.late_policy === 'reject_late') ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--danger, #dc2626)' }}>
                  <AlertCircle size={22} style={{ flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', lineHeight: '1.5' }}>
                    Submission window has closed. The deadline was <strong>{formatDateTime(assignment.due_at)}</strong> and late submissions are not accepted.
                  </p>
                </div>
              ) : assignment.status === 'completed' || assignment.status === 'evaluated' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--primary)' }}>
                  <CheckCircle2 size={22} style={{ flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', lineHeight: '1.5' }}>
                    Your assignment has been evaluated. Review faculty marks and feedback in your attempt history below.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--text-muted)' }}>
                  <Clock size={22} style={{ flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', lineHeight: '1.5' }}>
                    Your submission for Attempt {assignment.current_attempt} has been received and is currently awaiting faculty evaluation.
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Attempt History & Evaluation Cards */}
          <Card
            title="Attempt History & Evaluations"
            subtitle={`${submissions.length} submission attempt${submissions.length === 1 ? '' : 's'} recorded`}
            icon={<Layers size={20} />}
          >
            {submissions.length === 0 ? (
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', margin: 0 }}>
                No submission attempts yet. Complete the assignment form above to submit your solution.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-4)',
                      backgroundColor: 'var(--bg-subtle, #f8fafc)',
                    }}
                  >
                    {/* Attempt Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <strong style={{ color: 'var(--navy)', fontSize: 'var(--font-size-sm)' }}>
                          Attempt {sub.attempt_number}
                        </strong>
                        <Badge variant="neutral" style={{ textTransform: 'capitalize', fontSize: '10px' }}>
                          {sub.submission_type || 'Text'}
                        </Badge>
                        {sub.is_late ? (
                          <Badge variant="destructive" style={{ fontSize: '10px' }}>
                            Late Submission
                          </Badge>
                        ) : null}
                      </div>

                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                        Submitted: {formatDateTime(sub.submitted_at)}
                      </span>
                    </div>

                    {/* Submitted Deliverable */}
                    {sub.text_response && (
                      <div
                        style={{
                          backgroundColor: 'var(--white)',
                          padding: 'var(--space-3)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          fontSize: 'var(--font-size-xs)',
                          lineHeight: '1.6',
                          whiteSpace: 'pre-wrap',
                          marginBottom: 'var(--space-3)',
                          maxHeight: '200px',
                          overflowY: 'auto',
                        }}
                      >
                        {sub.text_response}
                      </div>
                    )}

                    {sub.external_link && (
                      <div style={{ marginBottom: 'var(--space-3)' }}>
                        <a
                          href={sub.external_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 'var(--space-1)',
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--primary)',
                            textDecoration: 'none',
                            fontWeight: 'var(--font-weight-semibold)',
                          }}
                        >
                          <ExternalLink size={14} />
                          <span>View Submitted Link: {sub.external_link}</span>
                        </a>
                      </div>
                    )}

                    {/* Evaluation Block (if evaluated) */}
                    {sub.evaluation_id || sub.grading_status || sub.score_awarded !== null ? (
                      <div
                        style={{
                          backgroundColor: '#ecfdf5',
                          border: '1px solid #10b981',
                          borderRadius: 'var(--radius-sm)',
                          padding: 'var(--space-3)',
                          marginTop: 'var(--space-2)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                          <span style={{ fontWeight: 'var(--font-weight-bold)', color: '#065f46', fontSize: 'var(--font-size-sm)' }}>
                            Faculty Evaluation
                          </span>
                          {sub.grading_status && (
                            <Badge variant={sub.grading_status === 'evaluated' ? 'accent' : 'primary'} style={{ textTransform: 'capitalize' }}>
                              {sub.grading_status.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: '#047857', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
                          {sub.score_awarded !== null && (
                            <span>
                              Score: <strong>{sub.score_awarded} / {assignment.max_score} Marks</strong>
                            </span>
                          )}
                          {sub.evaluator_name && (
                            <span>Evaluated by: <strong>{sub.evaluator_name}</strong></span>
                          )}
                          {sub.evaluated_at && (
                            <span>Date: {formatDateTime(sub.evaluated_at)}</span>
                          )}
                        </div>

                        {sub.feedback && (
                          <div style={{ marginTop: 'var(--space-2)', borderTop: '1px solid #d1fae5', paddingTop: 'var(--space-2)' }}>
                            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: '#065f46', display: 'block', marginBottom: 'var(--space-1)' }}>
                              Teacher Feedback:
                            </span>
                            <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: '#064e3b', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                              {sub.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 'var(--space-2)' }}>
                        Pending evaluation by faculty mentor.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => !isSubmitting && setShowConfirmModal(false)}
        title="Submit Assignment Solution?"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              onClick={handleConfirmSubmit}
              rightIcon={isSubmitting ? <LoadingSpinner size="sm" /> : <Send size={14} />}
            >
              {isSubmitting ? 'Submitting Solution...' : 'Confirm & Submit'}
            </Button>
          </>
        }
      >
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-main)', lineHeight: '1.6', margin: 0 }}>
          You are about to record <strong>Attempt {nextAttemptNumber}</strong> for <em>{assignment.title}</em>.
        </p>
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', lineHeight: '1.5', marginTop: 'var(--space-2)' }}>
          Please ensure all your working steps and deliverables are attached. Once submitted, your solution will be forwarded to your faculty mentor for review.
        </p>
      </Modal>
    </div>
  );
}
