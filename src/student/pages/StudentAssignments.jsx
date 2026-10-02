import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Select from '../../components/Select.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import studentService from '../../services/studentService.js';
import {
  FileCheck2,
  Calendar,
  Clock,
  Layers,
  ArrowRight,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Award,
  RotateCcw,
} from 'lucide-react';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'To Do (Assigned / In Progress / Rework)' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'resubmitted', label: 'Resubmitted' },
  { value: 'resubmission_requested', label: 'Rework Requested' },
  { value: 'evaluated', label: 'Evaluated' },
  { value: 'completed', label: 'Completed' },
];

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
 * Formats ISO date to human-readable format.
 */
function formatDateTime(isoString) {
  if (!isoString) return 'No deadline specified';
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
 * Student Assignment List View (Phase 5.10E-C)
 * 
 * Displays authenticated student's assignment queue with status filters and pagination.
 * 
 * @param {Object} props
 * @param {Function} props.onNavigate - Navigation callback
 */
export default function StudentAssignments({ onNavigate }) {
  const [assignments, setAssignments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    status: '',
    subjectId: '',
  });
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load subject filter options once on mount
  useEffect(() => {
    let isMounted = true;
    async function loadSubjects() {
      try {
        const subjectList = await studentService.getSubjects();
        if (isMounted && Array.isArray(subjectList)) {
          setSubjects(subjectList);
        }
      } catch (err) {
        console.error('Failed to load academic subjects for filter:', err);
      }
    }
    loadSubjects();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch student assignments
  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const activeFilters = {};
      if (filters.status) activeFilters.status = filters.status;
      if (filters.subjectId) activeFilters.subjectId = filters.subjectId;

      const result = await studentService.getAssignments(activeFilters, {
        page: pagination.page,
        pageSize: pagination.pageSize,
      });

      setAssignments(result.assignments || []);
      setPagination(result.pagination || {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      });
    } catch (err) {
      console.error('Student assignments fetch error:', err);
      setError(err.message || 'Failed to load assignments.');
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({ status: '', subjectId: '' });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const subjectOptions = [
    { value: '', label: 'All Subjects' },
    ...subjects.map((s) => ({
      value: s.id,
      label: s.code ? `${s.name} (${s.code})` : s.name,
    })),
  ];

  return (
    <div className="mst-sp-assignments-page">
      {/* 1. Header Banner */}
      <div className="mst-sp-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
          <Badge variant="primary" icon={<FileCheck2 size={14} />}>
            Coursework &amp; Practice
          </Badge>
        </div>
        <h1 className="mst-sp-page-title">Assignments</h1>
        <p className="mst-sp-page-subtitle">
          Practice, submit and improve through your learning journey with qualitative faculty feedback.
        </p>
      </div>

      {/* 2. Filter Bar */}
      <Card className="mst-sp-resource-filters-card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="mst-sp-resource-filters">
          <div className="mst-sp-resource-filters__controls">
            <Select
              label="Status"
              options={STATUS_FILTER_OPTIONS}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            />

            <Select
              label="Subject"
              options={subjectOptions}
              value={filters.subjectId}
              onChange={(e) => handleFilterChange('subjectId', e.target.value)}
            />
          </div>

          <div className="mst-sp-resource-filters__actions">
            {(filters.status || filters.subjectId) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                leftIcon={<RotateCcw size={14} />}
              >
                Clear Filters
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={fetchAssignments}
              leftIcon={<RefreshCw size={14} />}
              title="Refresh assignments"
            >
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* 3. Content Area */}
      {isLoading ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '40vh',
            gap: 'var(--space-4)',
          }}
          role="status"
          aria-live="polite"
        >
          <LoadingSpinner size="lg" />
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            Loading your assignments...
          </p>
        </div>
      ) : error ? (
        <div style={{ maxWidth: '640px', margin: 'var(--space-8) auto' }}>
          <ErrorState
            title="Unable to Load Assignments"
            message={error}
            onRetry={fetchAssignments}
            retryLabel="Try Again"
          />
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState
          title={filters.status || filters.subjectId ? 'No assignments match your filters' : "You don't have any assignments yet"}
          description={
            filters.status || filters.subjectId
              ? 'Try selecting a different status or subject filter to find your coursework.'
              : 'Coursework and worksheets assigned by your tutors will appear here for practice and submission.'
          }
          action={
            filters.status || filters.subjectId ? (
              <Button variant="primary" size="sm" onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            ) : null
          }
        />
      ) : (
        <>
          {/* Assignment Cards List */}
          <div className="mst-sp-assignment-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {assignments.map((assignment) => {
              const statusBadge = getStatusBadge(assignment.status, assignment.display_status);
              const isOverdue = assignment.display_status === 'overdue';

              return (
                <article
                  key={assignment.id}
                  className="mst-sp-assignment-card"
                  style={{
                    backgroundColor: 'var(--white)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-5)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'box-shadow var(--transition-fast), border-color var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      {/* Context breadcrumb & badges */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {assignment.subject_name && (
                          <Badge variant="neutral">
                            {assignment.subject_name}
                          </Badge>
                        )}
                        {assignment.chapter_title && (
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                            {assignment.chapter_number ? `Ch ${assignment.chapter_number}: ` : ''}{assignment.chapter_title}
                          </span>
                        )}
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                        {assignment.assignment_type && (
                          <Badge variant="neutral" style={{ textTransform: 'capitalize' }}>
                            {assignment.assignment_type}
                          </Badge>
                        )}
                      </div>

                      {/* Assignment Title */}
                      <h3
                        style={{
                          fontSize: 'var(--font-size-lg)',
                          fontWeight: 'var(--font-weight-bold)',
                          color: 'var(--navy)',
                          margin: '0 0 var(--space-2) 0',
                          lineHeight: '1.4',
                        }}
                      >
                        {assignment.title}
                      </h3>

                      {/* Meta attributes */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-4)',
                          fontSize: 'var(--font-size-xs)',
                          color: isOverdue ? 'var(--danger, #dc2626)' : 'var(--text-muted)',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                          <Clock size={14} />
                          <span>Due: {formatDateTime(assignment.due_at)}</span>
                        </span>

                        {assignment.max_score !== null && assignment.max_score !== undefined && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                            <Award size={14} />
                            <span>Max Marks: {assignment.max_score}</span>
                          </span>
                        )}

                        {assignment.final_score !== null && assignment.final_score !== undefined && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--primary)' }}>
                            <Award size={14} />
                            <span>Score: {assignment.final_score} / {assignment.max_score}</span>
                          </span>
                        )}

                        {assignment.current_attempt > 0 && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                            <Layers size={14} />
                            <span>Attempts: {assignment.current_attempt}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div style={{ display: 'flex', alignItems: 'center', alignSelf: 'center' }}>
                      <Button
                        variant={['assigned', 'in_progress', 'resubmission_requested'].includes(assignment.status) ? 'primary' : 'outline'}
                        size="sm"
                        rightIcon={<ArrowRight size={14} />}
                        onClick={() => onNavigate(`/student/assignments/${assignment.id}`)}
                      >
                        {['assigned', 'in_progress'].includes(assignment.status)
                          ? 'Start / Submit'
                          : assignment.status === 'resubmission_requested'
                          ? 'Revise Work'
                          : 'View Submission'}
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div
              className="mst-sp-pagination"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 'var(--space-8)',
                paddingTop: 'var(--space-4)',
                borderTop: '1px solid var(--border-color)',
                flexWrap: 'wrap',
                gap: 'var(--space-3)',
              }}
            >
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} assignments)
              </span>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  leftIcon={<ChevronLeft size={16} />}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  rightIcon={<ChevronRight size={16} />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
