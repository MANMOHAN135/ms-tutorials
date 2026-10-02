import React, { useState, useEffect, useCallback } from 'react';
import teacherService from '../../services/teacherService.js';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';
import Select from '../../components/Select.jsx';
import Input from '../../components/Input.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import Modal from '../../components/Modal.jsx';
import {
  BookOpen,
  PlusCircle,
  Search,
  Filter,
  Calendar,
  Layers,
  Award,
  Users,
  CheckCircle,
  FileText,
  Clock,
  ExternalLink,
  Send,
  AlertCircle
} from 'lucide-react';

export default function TeacherAssignments({ onNavigate }) {
  const [assignments, setAssignments] = useState([]);
  const [curriculumNodes, setCurriculumNodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [curriculumFilter, setCurriculumFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Publish Modal State
  const [publishModal, setPublishModal] = useState({
    isOpen: false,
    assignment: null,
    isPublishing: false,
    error: null,
  });

  // Fetch initial curriculum reference for filter
  useEffect(() => {
    let isMounted = true;
    teacherService.getCurriculumNodes()
      .then((nodes) => {
        if (isMounted) setCurriculumNodes(nodes || []);
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Fetch assignments with active filters
  const loadAssignments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters = {};
      if (statusFilter && statusFilter !== 'all') filters.status = statusFilter;
      if (curriculumFilter) filters.curriculumNodeId = curriculumFilter;

      const res = await teacherService.getAssignments(filters, { page, pageSize: 20 });
      setAssignments(res.assignments || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalCount(res.pagination?.total || 0);
    } catch (err) {
      setError(err.message || 'Unable to retrieve assignments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, curriculumFilter, page]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const handleOpenPublish = (assignment) => {
    setPublishModal({
      isOpen: true,
      assignment,
      isPublishing: false,
      error: null,
    });
  };

  const handleClosePublish = () => {
    setPublishModal({
      isOpen: false,
      assignment: null,
      isPublishing: false,
      error: null,
    });
  };

  const handleConfirmPublish = async () => {
    if (!publishModal.assignment) return;
    setPublishModal((prev) => ({ ...prev, isPublishing: true, error: null }));
    try {
      await teacherService.publishAssignment(publishModal.assignment.id);
      handleClosePublish();
      loadAssignments();
    } catch (err) {
      setPublishModal((prev) => ({
        ...prev,
        isPublishing: false,
        error: err.message || 'Failed to publish assignment.',
      }));
    }
  };

  // Filter client-side search query
  const filteredAssignments = assignments.filter((asgn) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = asgn.title?.toLowerCase().includes(query);
    const subjectMatch = asgn.subject_name?.toLowerCase().includes(query);
    const classMatch = asgn.class_name?.toLowerCase().includes(query);
    return titleMatch || subjectMatch || classMatch;
  });

  // Calculate high-level summary counts from current assignments list
  const publishedCount = assignments.filter((a) => a.status === 'published').length;
  const draftCount = assignments.filter((a) => a.status === 'draft').length;

  return (
    <div className="mst-tp-container">
      {/* 1. Header Banner */}
      <div className="mst-tp-page-header">
        <div>
          <h1 className="mst-tp-page-title">Assignments & Practice Management</h1>
          <p className="mst-tp-page-subtitle">
            Create, schedule, target, and evaluate coursework for your students.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => onNavigate && onNavigate('/teacher/assignments/new')}
          className="mst-tp-header-action"
        >
          <PlusCircle size={18} style={{ marginRight: 'var(--space-2)' }} />
          Create Assignment
        </Button>
      </div>

      {/* 2. Overview Metrics Cards */}
      <div className="mst-tp-metrics-grid">
        <Card className="mst-tp-metric-card">
          <div className="mst-tp-metric-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
            <BookOpen size={24} />
          </div>
          <div className="mst-tp-metric-content">
            <span className="mst-tp-metric-value">{totalCount}</span>
            <span className="mst-tp-metric-label">Total Assignments</span>
          </div>
        </Card>

        <Card className="mst-tp-metric-card">
          <div className="mst-tp-metric-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="mst-tp-metric-content">
            <span className="mst-tp-metric-value">{publishedCount}</span>
            <span className="mst-tp-metric-label">Published / Active</span>
          </div>
        </Card>

        <Card className="mst-tp-metric-card">
          <div className="mst-tp-metric-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent)' }}>
            <FileText size={24} />
          </div>
          <div className="mst-tp-metric-content">
            <span className="mst-tp-metric-value">{draftCount}</span>
            <span className="mst-tp-metric-label">Drafts Pending</span>
          </div>
        </Card>
      </div>

      {/* 3. Filter Controls */}
      <Card className="mst-tp-filter-card">
        <div className="mst-tp-filter-row">
          <div className="mst-tp-search-col">
            <Input
              type="text"
              placeholder="Search by title, subject, or class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefixIcon={<Search size={18} />}
              aria-label="Search assignments"
            />
          </div>

          <div className="mst-tp-filter-col">
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Drafts Only</option>
              <option value="published">Published Only</option>
              <option value="closed">Closed Only</option>
              <option value="archived">Archived Only</option>
            </Select>
          </div>

          {curriculumNodes.length > 0 && (
            <div className="mst-tp-filter-col">
              <Select
                value={curriculumFilter}
                onChange={(e) => {
                  setCurriculumFilter(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by curriculum"
              >
                <option value="">All Curricula</option>
                {curriculumNodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.class_name || n.class_code} — {n.subject_name || n.subject_code}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>
      </Card>

      {/* 4. Assignment List View */}
      {isLoading ? (
        <div className="mst-tp-loading-state" role="status" aria-live="polite">
          <LoadingSpinner size="lg" />
          <p>Loading your authored assignments...</p>
        </div>
      ) : error ? (
        <ErrorState
          title="Unable to Load Assignments"
          description={error}
          action={
            <Button variant="primary" size="md" onClick={loadAssignments}>
              Retry
            </Button>
          }
        />
      ) : filteredAssignments.length === 0 ? (
        <EmptyState
          title="No Assignments Found"
          description={
            statusFilter !== 'all' || curriculumFilter || searchQuery
              ? 'No assignments match your selected filter criteria. Try clearing filters.'
              : 'You have not authored any assignments yet. Get started by creating your first assignment.'
          }
          action={
            statusFilter !== 'all' || curriculumFilter || searchQuery ? (
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setStatusFilter('all');
                  setCurriculumFilter('');
                  setSearchQuery('');
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={() => onNavigate && onNavigate('/teacher/assignments/new')}
              >
                <PlusCircle size={18} style={{ marginRight: 'var(--space-2)' }} />
                Create First Assignment
              </Button>
            )
          }
        />
      ) : (
        <div className="mst-tp-assignment-list" role="feed" aria-busy={isLoading}>
          {filteredAssignments.map((assignment) => {
            const isDraft = assignment.status === 'draft';
            const isPublished = assignment.status === 'published';
            const formattedDue = assignment.due_at
              ? new Date(assignment.due_at).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'No deadline set';

            return (
              <Card key={assignment.id} className="mst-tp-assignment-card">
                <div className="mst-tp-card-header">
                  <div className="mst-tp-card-title-group">
                    <div className="mst-tp-card-meta-tags">
                      <Badge
                        variant={isDraft ? 'neutral' : isPublished ? 'primary' : 'accent'}
                        size="sm"
                      >
                        {assignment.status ? assignment.status.toUpperCase() : 'UNKNOWN'}
                      </Badge>
                      <Badge variant="outline" size="sm">
                        {assignment.assignment_type || 'assignment'}
                      </Badge>
                      {assignment.subject_name && (
                        <span className="mst-tp-tag-pill">
                          {assignment.subject_name} • {assignment.class_name || 'Class'}
                        </span>
                      )}
                    </div>
                    <h2 className="mst-tp-card-title">{assignment.title}</h2>
                  </div>

                  <div className="mst-tp-card-score-pill">
                    <Award size={16} />
                    <span>Max: {assignment.max_score} pts</span>
                  </div>
                </div>

                <div className="mst-tp-card-details">
                  {assignment.chapter_title && (
                    <div className="mst-tp-detail-item">
                      <Layers size={15} />
                      <span>
                        Ch {assignment.chapter_number || '•'}: {assignment.chapter_title}
                        {assignment.topic_title ? ` (${assignment.topic_title})` : ''}
                      </span>
                    </div>
                  )}

                  <div className="mst-tp-detail-item">
                    <Calendar size={15} />
                    <span>Due: {formattedDue}</span>
                  </div>

                  <div className="mst-tp-detail-item">
                    <Clock size={15} />
                    <span>Late: {assignment.late_policy?.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="mst-tp-card-actions">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate && onNavigate(`/teacher/assignments/${assignment.id}`)}
                  >
                    View Details
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onNavigate && onNavigate(`/teacher/assignments/${assignment.id}/submissions`)}
                  >
                    <Users size={16} style={{ marginRight: 'var(--space-2)' }} />
                    Submissions Queue
                  </Button>

                  {isDraft && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenPublish(assignment)}
                    >
                      <Send size={15} style={{ marginRight: 'var(--space-2)' }} />
                      Publish
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 5. Pagination Controls */}
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

      {/* 6. Publish Confirmation Modal */}
      <Modal
        isOpen={publishModal.isOpen}
        onClose={handleClosePublish}
        title="Publish Assignment"
      >
        <div className="mst-tp-modal-body">
          <p>
            Are you sure you want to publish <strong>{publishModal.assignment?.title}</strong>?
          </p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
            Publishing will immediately fan out personalized assignment instances to all targeted students. This action cannot be reverted back to draft status.
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
              {publishModal.isPublishing ? 'Publishing...' : 'Confirm & Publish'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
