import React, { useState, useEffect, useCallback } from 'react';
import teacherService from '../../services/teacherService.js';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import Textarea from '../../components/Textarea.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import {
  ArrowLeft,
  Award,
  CheckCircle,
  Clock,
  AlertCircle,
  FileCheck,
  Send,
  User,
  ExternalLink,
  RotateCcw,
  MessageSquare
} from 'lucide-react';

export default function TeacherSubmissionDetail({ assignmentId, submissionId, onNavigate }) {
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Evaluation Form State
  const [scoreAwarded, setScoreAwarded] = useState('');
  const [feedback, setFeedback] = useState('');
  const [gradingStatus, setGradingStatus] = useState('evaluated');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evalError, setEvalError] = useState(null);
  const [evalSuccess, setEvalSuccess] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [asgn, subsData] = await Promise.all([
        teacherService.getAssignmentById(assignmentId),
        teacherService.getAssignmentSubmissions(assignmentId, {}, { page: 1, pageSize: 100 }),
      ]);

      setAssignment(asgn);

      const foundSub = subsData.submissions?.find(
        (s) => String(s.submission_id) === String(submissionId)
      );

      if (!foundSub) {
        setError('Submission not found in this assignment queue.');
      } else {
        setSubmission(foundSub);
        if (foundSub.score_awarded !== null && foundSub.score_awarded !== undefined) {
          setScoreAwarded(String(foundSub.score_awarded));
        } else if (foundSub.final_score !== null && foundSub.final_score !== undefined) {
          setScoreAwarded(String(foundSub.final_score));
        }
        if (foundSub.feedback) {
          setFeedback(foundSub.feedback);
        }
        if (foundSub.grading_status) {
          setGradingStatus(foundSub.grading_status);
        }
      }
    } catch (err) {
      if (err.status === 403) {
        setError('You do not have permission to view or evaluate this submission.');
      } else {
        setError(err.message || 'Unable to retrieve submission details.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [assignmentId, submissionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEvaluate = async (e) => {
    e.preventDefault();
    setEvalError(null);
    setEvalSuccess(false);

    const maxScore = assignment?.max_score !== undefined ? Number(assignment.max_score) : 100;
    const parsedScore = scoreAwarded === '' ? null : Number(scoreAwarded);

    if (parsedScore !== null) {
      if (isNaN(parsedScore) || parsedScore < 0) {
        setEvalError('Score awarded must be a non-negative number.');
        return;
      }
      if (parsedScore > maxScore) {
        setEvalError(`Score awarded (${parsedScore}) cannot exceed the assignment maximum score (${maxScore}).`);
        return;
      }
    }

    if (!feedback.trim()) {
      setEvalError('Pedagogical feedback is required before finalizing this evaluation.');
      return;
    }

    setIsSubmitting(true);
    try {
      await teacherService.evaluateSubmission(submissionId, {
        scoreAwarded: parsedScore,
        feedback: feedback.trim(),
        gradingStatus,
      });

      setEvalSuccess(true);
      setTimeout(() => {
        if (onNavigate) {
          onNavigate(`/teacher/assignments/${assignmentId}/submissions`);
        }
      }, 1200);
    } catch (err) {
      setEvalError(err.message || 'Failed to submit evaluation. Please review entries.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mst-tp-container">
        <div className="mst-tp-loading-state" role="status" aria-live="polite">
          <LoadingSpinner size="lg" />
          <p>Loading submission attempt and evaluation record...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="mst-tp-container">
        <ErrorState
          title="Submission Notice"
          description={error || 'The requested student submission could not be found.'}
          action={
            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigate && onNavigate(`/teacher/assignments/${assignmentId}/submissions`)}
            >
              <ArrowLeft size={16} style={{ marginRight: 'var(--space-2)' }} />
              Return to Submissions Queue
            </Button>
          }
        />
      </div>
    );
  }

  const isLate = submission.is_late === 1;
  const submittedDate = submission.submitted_at
    ? new Date(submission.submitted_at).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <div className="mst-tp-container">
      {/* Back Link */}
      <button
        type="button"
        className="mst-tp-back-link"
        onClick={() => onNavigate && onNavigate(`/teacher/assignments/${assignmentId}/submissions`)}
      >
        <ArrowLeft size={16} />
        <span>Back to Submissions Queue</span>
      </button>

      {/* Header */}
      <div className="mst-tp-page-header">
        <div>
          <div className="mst-tp-card-meta-tags" style={{ marginBottom: 'var(--space-2)' }}>
            <span className="mst-tp-tag-pill">
              Attempt #{submission.attempt_number || 1}
            </span>
            <Badge variant="outline" size="sm">
              Mode: {submission.submission_type || 'text'}
            </Badge>
            {isLate && (
              <Badge variant="destructive" size="sm">
                Late Submission
              </Badge>
            )}
          </div>
          <h1 className="mst-tp-page-title">
            Evaluate: {submission.student_name || 'Student Submission'}
          </h1>
          <p className="mst-tp-page-subtitle">
            Adm: {submission.admission_number || '—'} • Assignment: {assignment?.title}
          </p>
        </div>
      </div>

      <div className="mst-tp-detail-grid">
        {/* Left Column: Student Submission Review */}
        <div className="mst-tp-detail-main">
          {/* Submission Metadata Card */}
          <Card className="mst-tp-form-card">
            <h2 className="mst-tp-section-heading">Student Submission Record</h2>
            <div className="mst-tp-kv-list">
              <div className="mst-tp-kv-item">
                <span className="mst-tp-kv-key">Student Name</span>
                <span className="mst-tp-kv-val">{submission.student_name}</span>
              </div>
              <div className="mst-tp-kv-item">
                <span className="mst-tp-kv-key">Admission Number</span>
                <span className="mst-tp-kv-val">{submission.admission_number || '—'}</span>
              </div>
              <div className="mst-tp-kv-item">
                <span className="mst-tp-kv-key">Submission Date</span>
                <span className="mst-tp-kv-val">{submittedDate}</span>
              </div>
              <div className="mst-tp-kv-item">
                <span className="mst-tp-kv-key">Attempt Number</span>
                <span className="mst-tp-kv-val">Attempt #{submission.attempt_number}</span>
              </div>
              <div className="mst-tp-kv-item">
                <span className="mst-tp-kv-key">Submission Type</span>
                <span className="mst-tp-kv-val" style={{ textTransform: 'capitalize' }}>
                  {submission.submission_type}
                </span>
              </div>
            </div>
          </Card>

          {/* Historical / Existing Evaluation Remarks (if already graded) */}
          {submission.feedback && (
            <Card className="mst-tp-form-card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div className="mst-tp-section-header-row">
                <h2 className="mst-tp-section-heading">Previous Faculty Evaluation</h2>
                <Badge variant="accent" size="sm">
                  {submission.grading_status || 'evaluated'}
                </Badge>
              </div>

              <div className="mst-tp-kv-list" style={{ marginTop: 'var(--space-2)' }}>
                <div className="mst-tp-kv-item">
                  <span className="mst-tp-kv-key">Score Awarded</span>
                  <span className="mst-tp-kv-val">
                    {submission.score_awarded} / {assignment?.max_score} pts
                  </span>
                </div>
                {submission.evaluated_at && (
                  <div className="mst-tp-kv-item">
                    <span className="mst-tp-kv-key">Evaluated At</span>
                    <span className="mst-tp-kv-val">
                      {new Date(submission.evaluated_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 'var(--space-3)' }}>
                <span className="mst-tp-kv-key" style={{ display: 'block', marginBottom: 'var(--space-1)' }}>
                  Feedback Remarks:
                </span>
                <div className="mst-tp-feedback-bubble">
                  {submission.feedback}
                </div>
              </div>
            </Card>
          )}

          {/* Assignment Description Reference */}
          <Card className="mst-tp-form-card">
            <h2 className="mst-tp-section-heading">Assignment Instructions Reference</h2>
            <div className="mst-tp-instruction-content">
              {assignment?.description || 'No instructions provided.'}
            </div>
          </Card>
        </div>

        {/* Right Column: Evaluation Workbench Form */}
        <div className="mst-tp-detail-sidebar">
          <Card className="mst-tp-form-card">
            <div className="mst-tp-section-header-row">
              <h2 className="mst-tp-section-heading">Evaluation Workbench</h2>
              <span className="mst-tp-tag-pill">Max: {assignment?.max_score || 50} pts</span>
            </div>

            {evalSuccess && (
              <div className="mst-tp-success-banner" role="status" style={{ marginBottom: 'var(--space-4)' }}>
                <CheckCircle size={18} />
                <span>Evaluation submitted successfully! Updating queue...</span>
              </div>
            )}

            {evalError && (
              <div className="mst-tp-error-banner" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
                <AlertCircle size={18} />
                <span>{evalError}</span>
              </div>
            )}

            <form onSubmit={handleEvaluate} className="mst-tp-eval-form">
              <div className="mst-tp-form-group">
                <label htmlFor="eval-score" className="mst-tp-label">
                  Score Awarded (out of {assignment?.max_score || 50})
                </label>
                <Input
                  id="eval-score"
                  type="number"
                  step="0.5"
                  min="0"
                  max={assignment?.max_score || 50}
                  placeholder={`0 - ${assignment?.max_score || 50}`}
                  value={scoreAwarded}
                  onChange={(e) => setScoreAwarded(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="mst-tp-form-group">
                <label htmlFor="eval-status" className="mst-tp-label">
                  Grading Decision / Action <span className="mst-tp-required">*</span>
                </label>
                <Select
                  id="eval-status"
                  value={gradingStatus}
                  onChange={(e) => setGradingStatus(e.target.value)}
                  disabled={isSubmitting}
                  required
                >
                  <option value="evaluated">Satisfactory (Completed)</option>
                  <option value="resubmission_requested">Request Resubmission (Rework Needed)</option>
                  <option value="needs_improvement">Needs Improvement</option>
                </Select>
              </div>

              <div className="mst-tp-form-group">
                <label htmlFor="eval-feedback" className="mst-tp-label">
                  Pedagogical Feedback <span className="mst-tp-required">*</span>
                </label>
                <Textarea
                  id="eval-feedback"
                  rows={5}
                  placeholder="Provide constructive feedback, identify conceptual gaps, or outline instructions for rework..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="mst-tp-eval-actions" style={{ marginTop: 'var(--space-6)' }}>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={isSubmitting}
                  style={{ width: '100%' }}
                >
                  <Send size={16} style={{ marginRight: 'var(--space-2)' }} />
                  {isSubmitting ? 'Recording Evaluation...' : 'Submit Evaluation'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => onNavigate && onNavigate(`/teacher/assignments/${assignmentId}/submissions`)}
                  style={{ width: '100%', marginTop: 'var(--space-2)' }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
