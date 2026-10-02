import React, { useState, useEffect } from 'react';
import teacherService from '../../services/teacherService.js';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import Select from '../../components/Select.jsx';
import Textarea from '../../components/Textarea.jsx';
import Badge from '../../components/Badge.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import {
  ArrowLeft,
  Save,
  Send,
  Calendar,
  Layers,
  Award,
  Users,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2
} from 'lucide-react';

export default function TeacherAssignmentCreate({ onNavigate }) {
  // References
  const [curriculumNodes, setCurriculumNodes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);

  const [isLoadingRefs, setIsLoadingRefs] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignmentType, setAssignmentType] = useState('homework');
  const [maxScore, setMaxScore] = useState(50);

  // Academic Anchor State
  const [curriculumNodeId, setCurriculumNodeId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [topicId, setTopicId] = useState('');

  // Deadlines & Policies
  const toLocalIso = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const defaultAvailable = toLocalIso(new Date());
  const defaultDue = toLocalIso(new Date(Date.now() + 7 * 24 * 3600 * 1000));

  const [availableFrom, setAvailableFrom] = useState(defaultAvailable);
  const [dueAt, setDueAt] = useState(defaultDue);
  const [closeAt, setCloseAt] = useState('');
  const [latePolicy, setLatePolicy] = useState('reject_late');
  const [resubmissionPolicy, setResubmissionPolicy] = useState('none');
  const [maxResubmissions, setMaxResubmissions] = useState(1);

  // Targeting State
  const [targets, setTargets] = useState([
    { targetType: 'class', targetId: '' },
  ]);

  // Load initial references (curriculum nodes and classes)
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      teacherService.getCurriculumNodes(),
      teacherService.getClasses(),
    ])
      .then(([nodes, cls]) => {
        if (isMounted) {
          setCurriculumNodes(nodes || []);
          setClasses(cls || []);
          setIsLoadingRefs(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setFormError('Failed to load academic curriculum reference data.');
          setIsLoadingRefs(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  // Cascading chapters when curriculum node changes
  useEffect(() => {
    if (!curriculumNodeId) {
      setChapters([]);
      setChapterId('');
      setTopics([]);
      setTopicId('');
      return;
    }

    teacherService.getNodeChapters(curriculumNodeId)
      .then((chaps) => {
        setChapters(chaps || []);
        setChapterId('');
        setTopics([]);
        setTopicId('');
      })
      .catch(() => {
        setChapters([]);
      });
  }, [curriculumNodeId]);

  // Cascading topics when chapter changes
  useEffect(() => {
    if (!chapterId) {
      setTopics([]);
      setTopicId('');
      return;
    }

    teacherService.getChapterTopics(chapterId)
      .then((topList) => {
        setTopics(topList || []);
        setTopicId('');
      })
      .catch(() => {
        setTopics([]);
      });
  }, [chapterId]);

  // Target handlers
  const handleAddTarget = () => {
    setTargets((prev) => [...prev, { targetType: 'class', targetId: '' }]);
  };

  const handleRemoveTarget = (index) => {
    setTargets((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleTargetChange = (index, field, value) => {
    setTargets((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const validateForm = () => {
    if (!title.trim()) return 'Assignment title is required.';
    if (!description.trim()) return 'Assignment description and instructions are required.';
    if (!curriculumNodeId) return 'Curriculum Node selection is required.';
    if (Number(maxScore) <= 0 || isNaN(Number(maxScore))) return 'Max Score must be a positive number.';

    const availDate = new Date(availableFrom);
    const dueDate = new Date(dueAt);

    if (isNaN(availDate.getTime())) return 'Available From date is invalid.';
    if (isNaN(dueDate.getTime())) return 'Due Date is invalid.';
    if (dueDate <= availDate) return 'Due Date must be strictly after Available From date.';

    if (closeAt) {
      const closeDate = new Date(closeAt);
      if (isNaN(closeDate.getTime())) return 'Close Date is invalid.';
      if (closeDate < dueDate) return 'Close Date must be on or after Due Date.';
    }

    if (targets.length === 0) return 'At least one target (class, batch, or student) is required.';
    for (let i = 0; i < targets.length; i++) {
      if (!targets[i].targetId.trim()) {
        return `Target #${i + 1} requires a valid target ID or selection.`;
      }
    }

    return null;
  };

  const handleSubmit = async (shouldPublish = false) => {
    setFormError(null);
    const error = validateForm();
    if (error) {
      setFormError(error);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        assignmentType,
        maxScore: Number(maxScore),
        availableFrom: new Date(availableFrom).toISOString(),
        dueAt: new Date(dueAt).toISOString(),
        closeAt: closeAt ? new Date(closeAt).toISOString() : null,
        latePolicy,
        resubmissionPolicy,
        maxResubmissions: resubmissionPolicy !== 'none' ? Number(maxResubmissions) : 0,
        curriculumNodeId,
        chapterId: chapterId || null,
        topicId: topicId || null,
        targets: targets.map((t) => ({
          targetType: t.targetType,
          targetId: t.targetId.trim(),
        })),
      };

      const created = await teacherService.createAssignment(payload);

      if (shouldPublish && created?.id) {
        await teacherService.publishAssignment(created.id);
      }

      if (onNavigate) {
        onNavigate(`/teacher/assignments/${created.id}`);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create assignment. Please inspect form inputs.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingRefs) {
    return (
      <div className="mst-tp-container">
        <div className="mst-tp-loading-state" role="status" aria-live="polite">
          <LoadingSpinner size="lg" />
          <p>Loading academic curriculum and reference data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mst-tp-container">
      {/* Header with back navigation */}
      <div className="mst-tp-page-header">
        <div>
          <button
            type="button"
            className="mst-tp-back-link"
            onClick={() => onNavigate && onNavigate('/teacher/assignments')}
          >
            <ArrowLeft size={16} />
            <span>Back to Assignments</span>
          </button>
          <h1 className="mst-tp-page-title">Author New Assignment</h1>
          <p className="mst-tp-page-subtitle">
            Configure curriculum alignment, submission parameters, and student targets.
          </p>
        </div>
      </div>

      {formError && (
        <div className="mst-tp-error-banner" role="alert">
          <AlertCircle size={20} />
          <span>{formError}</span>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="mst-tp-form-layout"
      >
        {/* Section 1: Basic Information */}
        <Card className="mst-tp-form-card">
          <h2 className="mst-tp-section-heading">1. Basic Assignment Details</h2>

          <div className="mst-tp-form-group">
            <label htmlFor="assignment-title" className="mst-tp-label">
              Assignment Title <span className="mst-tp-required">*</span>
            </label>
            <Input
              id="assignment-title"
              type="text"
              placeholder="e.g. Quadratic Equations Practice Set 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mst-tp-form-group">
            <label htmlFor="assignment-desc" className="mst-tp-label">
              Instructions & Problem Description <span className="mst-tp-required">*</span>
            </label>
            <Textarea
              id="assignment-desc"
              rows={4}
              placeholder="Specify the problems, expectations, reference chapters, or submission requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="mst-tp-form-row">
            <div className="mst-tp-form-col">
              <label htmlFor="assignment-type" className="mst-tp-label">
                Assignment Type
              </label>
              <Select
                id="assignment-type"
                value={assignmentType}
                onChange={(e) => setAssignmentType(e.target.value)}
              >
                <option value="homework">Homework</option>
                <option value="practice">Practice Set</option>
                <option value="worksheet">Worksheet</option>
              </Select>
            </div>

            <div className="mst-tp-form-col">
              <label htmlFor="assignment-max-score" className="mst-tp-label">
                Maximum Score <span className="mst-tp-required">*</span>
              </label>
              <Input
                id="assignment-max-score"
                type="number"
                min="1"
                max="1000"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                required
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Academic Curriculum Anchoring */}
        <Card className="mst-tp-form-card">
          <h2 className="mst-tp-section-heading">2. Curriculum Anchoring</h2>

          <div className="mst-tp-form-group">
            <label htmlFor="curriculum-node" className="mst-tp-label">
              Curriculum Node (Academic Session, Board, Class, Subject) <span className="mst-tp-required">*</span>
            </label>
            <Select
              id="curriculum-node"
              value={curriculumNodeId}
              onChange={(e) => setCurriculumNodeId(e.target.value)}
              required
            >
              <option value="">Select Curriculum Node...</option>
              {curriculumNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.session_code || 'Session'} • {n.board_code || 'Board'} • {n.class_name || n.class_code} — {n.subject_name || n.subject_code}
                </option>
              ))}
            </Select>
          </div>

          <div className="mst-tp-form-row">
            <div className="mst-tp-form-col">
              <label htmlFor="chapter-select" className="mst-tp-label">
                Chapter (Optional)
              </label>
              <Select
                id="chapter-select"
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
                disabled={!curriculumNodeId || chapters.length === 0}
              >
                <option value="">Select Chapter (Optional)...</option>
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    Ch {c.chapter_number}: {c.title}
                  </option>
                ))}
              </Select>
            </div>

            <div className="mst-tp-form-col">
              <label htmlFor="topic-select" className="mst-tp-label">
                Topic (Optional)
              </label>
              <Select
                id="topic-select"
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                disabled={!chapterId || topics.length === 0}
              >
                <option value="">Select Topic (Optional)...</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        {/* Section 3: Deadlines & Submission Rules */}
        <Card className="mst-tp-form-card">
          <h2 className="mst-tp-section-heading">3. Deadlines & Evaluation Policies</h2>

          <div className="mst-tp-form-row">
            <div className="mst-tp-form-col">
              <label htmlFor="available-from" className="mst-tp-label">
                Available From <span className="mst-tp-required">*</span>
              </label>
              <Input
                id="available-from"
                type="datetime-local"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
                required
              />
            </div>

            <div className="mst-tp-form-col">
              <label htmlFor="due-at" className="mst-tp-label">
                Due Date & Time <span className="mst-tp-required">*</span>
              </label>
              <Input
                id="due-at"
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                required
              />
            </div>

            <div className="mst-tp-form-col">
              <label htmlFor="close-at" className="mst-tp-label">
                Hard Close Date (Optional)
              </label>
              <Input
                id="close-at"
                type="datetime-local"
                value={closeAt}
                onChange={(e) => setCloseAt(e.target.value)}
              />
            </div>
          </div>

          <div className="mst-tp-form-row" style={{ marginTop: 'var(--space-4)' }}>
            <div className="mst-tp-form-col">
              <label htmlFor="late-policy" className="mst-tp-label">
                Late Submission Policy
              </label>
              <Select
                id="late-policy"
                value={latePolicy}
                onChange={(e) => setLatePolicy(e.target.value)}
              >
                <option value="reject_late">Reject Late Submissions</option>
                <option value="grace_period">Allow with Grace Period</option>
                <option value="allow_late">Allow Late (Flagged)</option>
              </Select>
            </div>

            <div className="mst-tp-form-col">
              <label htmlFor="resub-policy" className="mst-tp-label">
                Resubmission Policy
              </label>
              <Select
                id="resub-policy"
                value={resubmissionPolicy}
                onChange={(e) => setResubmissionPolicy(e.target.value)}
              >
                <option value="none">No Resubmissions (Single Attempt)</option>
                <option value="single">Single Resubmission Permitted</option>
                <option value="multiple">Multiple Resubmissions Permitted</option>
              </Select>
            </div>

            {resubmissionPolicy === 'multiple' && (
              <div className="mst-tp-form-col">
                <label htmlFor="max-resubs" className="mst-tp-label">
                  Max Resubmission Attempts
                </label>
                <Input
                  id="max-resubs"
                  type="number"
                  min="1"
                  max="10"
                  value={maxResubmissions}
                  onChange={(e) => setMaxResubmissions(e.target.value)}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Section 4: Cohort Targeting */}
        <Card className="mst-tp-form-card">
          <div className="mst-tp-section-header-row">
            <div>
              <h2 className="mst-tp-section-heading">4. Target Distribution Scope</h2>
              <p className="mst-tp-section-sub">
                Target this assignment across classes, batches, or specific individual students.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={handleAddTarget}
            >
              <Plus size={16} style={{ marginRight: 'var(--space-1)' }} />
              Add Target
            </Button>
          </div>

          <div className="mst-tp-targets-list">
            {targets.map((target, idx) => (
              <div key={idx} className="mst-tp-target-row">
                <div className="mst-tp-target-type-col">
                  <Select
                    value={target.targetType}
                    onChange={(e) => handleTargetChange(idx, 'targetType', e.target.value)}
                    aria-label={`Target ${idx + 1} type`}
                  >
                    <option value="class">Entire Class</option>
                    <option value="batch">Specific Batch</option>
                    <option value="student">Individual Student</option>
                  </Select>
                </div>

                <div className="mst-tp-target-id-col">
                  {target.targetType === 'class' && classes.length > 0 ? (
                    <Select
                      value={target.targetId}
                      onChange={(e) => handleTargetChange(idx, 'targetId', e.target.value)}
                      aria-label={`Select Class for Target ${idx + 1}`}
                    >
                      <option value="">Select Academic Class...</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.displayName || cls.name || cls.code}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      type="text"
                      placeholder={
                        target.targetType === 'batch'
                          ? 'Enter Batch UUID (e.g. from academic batch list)'
                          : 'Enter Student UUID'
                      }
                      value={target.targetId}
                      onChange={(e) => handleTargetChange(idx, 'targetId', e.target.value)}
                      aria-label={`Target ${idx + 1} ID`}
                    />
                  )}
                </div>

                {targets.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => handleRemoveTarget(idx)}
                    className="mst-tp-target-remove-btn"
                    aria-label={`Remove Target ${idx + 1}`}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Section 5: Submission Actions */}
        <div className="mst-tp-form-action-bar">
          <Button
            variant="outline"
            size="md"
            type="button"
            disabled={isSubmitting}
            onClick={() => onNavigate && onNavigate('/teacher/assignments')}
          >
            Cancel
          </Button>

          <div className="mst-tp-submit-group">
            <Button
              variant="secondary"
              size="md"
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
            >
              <Save size={18} style={{ marginRight: 'var(--space-2)' }} />
              {isSubmitting ? 'Saving Draft...' : 'Save as Draft'}
            </Button>

            <Button
              variant="primary"
              size="md"
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
            >
              <Send size={18} style={{ marginRight: 'var(--space-2)' }} />
              {isSubmitting ? 'Publishing...' : 'Save & Publish Immediately'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
