import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import Select from '../../components/Select.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import useStudent from '../hooks/useStudent.js';
import studentService from '../../services/studentService.js';
import {
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  FileSpreadsheet,
  FileCheck2,
  Filter,
  ArrowRight,
  Layers,
  ChevronLeft,
  ChevronRight,
  Clock,
  HardDrive,
  RefreshCw,
} from 'lucide-react';

const RESOURCE_TYPE_OPTIONS = [
  { value: '', label: 'All Resource Types' },
  { value: 'notes', label: 'Study Notes' },
  { value: 'worksheet', label: 'Practice Worksheets' },
  { value: 'important_questions', label: 'Important Questions' },
  { value: 'video', label: 'Video Walkthroughs' },
  { value: 'question_bank', label: 'Question Bank' },
  { value: 'summary_sheet', label: 'Summary Sheets' },
];

const DIFFICULTY_OPTIONS = [
  { value: '', label: 'All Difficulty Levels' },
  { value: 'foundation', label: 'Foundation' },
  { value: 'standard', label: 'Standard' },
  { value: 'advanced', label: 'Advanced' },
];

/**
 * Returns a human-friendly label for a resource type.
 */
function getResourceTypeLabel(type) {
  switch (type) {
    case 'notes': return 'Notes';
    case 'worksheet': return 'Worksheet';
    case 'important_questions': return 'Imp. Questions';
    case 'video': return 'Video';
    case 'question_bank': return 'Question Bank';
    case 'summary_sheet': return 'Summary Sheet';
    default: return type || 'Resource';
  }
}

/**
 * Returns an appropriate icon for a resource type.
 */
function getResourceTypeIcon(type) {
  switch (type) {
    case 'video': return <Video size={16} />;
    case 'worksheet': return <FileSpreadsheet size={16} />;
    case 'important_questions': return <FileCheck2 size={16} />;
    case 'question_bank': return <HelpCircle size={16} />;
    case 'notes':
    case 'summary_sheet':
    default: return <FileText size={16} />;
  }
}

/**
 * Returns badge variant for difficulty levels.
 */
function getDifficultyVariant(level) {
  switch (level) {
    case 'foundation': return 'neutral';
    case 'standard': return 'primary';
    case 'advanced': return 'accent';
    default: return 'neutral';
  }
}

/**
 * Formats file size in bytes to KB or MB.
 */
function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return null;
  if (bytes >= 1048576) {
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

/**
 * Formats duration in seconds to mm:ss or hh:mm:ss.
 */
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
  }
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

/**
 * Student Learning Resource Library Page (Phase 5.10D)
 * 
 * Displays curriculum-scoped learning resources authorized for the student's active enrollment.
 * Supports filtering by resource type, difficulty level, and subject.
 * 
 * @param {Object} props
 * @param {Function} props.onNavigate - Navigation callback
 */
export default function StudentResourceLibrary({ onNavigate }) {
  const { enrollment, isLoading: isContextLoading } = useStudent();

  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [subjects, setSubjects] = useState([]);
  const [resourceType, setResourceType] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load subject reference options once on mount
  useEffect(() => {
    let isMounted = true;
    studentService.getSubjects().then((subList) => {
      if (isMounted) setSubjects(subList);
    }).catch(() => {
      // Graceful fallback: subjects filter will simply be empty
    });
    return () => { isMounted = false; };
  }, []);

  // Fetch learning resources based on active filters and pagination
  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters = {};
      if (resourceType) filters.resourceType = resourceType;
      if (difficultyLevel) filters.difficultyLevel = difficultyLevel;
      if (subjectId) filters.subjectId = subjectId;

      const result = await studentService.getResources(filters, {
        page: currentPage,
        pageSize: 20,
      });

      setResources(result.resources || []);
      setPagination(result.pagination || {
        page: currentPage,
        pageSize: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
    } catch (err) {
      console.error('Failed to load learning resources:', err.message);
      setError(err.message || 'Unable to load learning resources at this time.');
    } finally {
      setIsLoading(false);
    }
  }, [resourceType, difficultyLevel, subjectId, currentPage]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1); // Reset to page 1 on filter modification
  };

  const handleResetFilters = () => {
    setResourceType('');
    setDifficultyLevel('');
    setSubjectId('');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(resourceType || difficultyLevel || subjectId);

  // Format active academic context line
  const contextString = enrollment
    ? `${enrollment.class?.displayName || 'Class'} • ${enrollment.board?.code || 'Board'} • Session ${enrollment.session?.displayName || 'Active'}`
    : 'No Active Academic Enrollment';

  const subjectOptions = [
    { value: '', label: 'All Subjects' },
    ...subjects.map((sub) => ({
      value: sub.id,
      label: sub.name,
    })),
  ];

  return (
    <div className="mst-sp-resource-library">
      {/* 1. Page Header */}
      <div className="mst-sp-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)', flexWrap: 'wrap' }}>
          <Badge variant={enrollment ? 'primary' : 'neutral'}>Curriculum Library</Badge>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            {contextString}
          </span>
        </div>
        <h1 className="mst-sp-page-title">Learning Resources</h1>
        <p className="mst-sp-page-subtitle">
          Curated study material, notes, practice worksheets, and question banks mapped to your curriculum.
        </p>
      </div>

      {/* 2. Unassigned Enrollment Notice */}
      {!isContextLoading && !enrollment && (
        <div className="mst-sp-banner-warning" role="region" aria-label="Academic notice">
          <Layers size={22} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--warning-dark, #b45309)' }} />
          <div>
            <strong style={{ display: 'block', marginBottom: 'var(--space-1)', color: 'var(--warning-dark, #b45309)' }}>
              Enrollment Pending
            </strong>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-main)', lineHeight: '1.5' }}>
              Resource visibility is mapped to your active academic enrollment. Please contact tuition administration to activate your enrollment ledger.
            </span>
          </div>
        </div>
      )}

      {/* 3. Filters Toolbar */}
      <div className="mst-sp-resource-filters">
        <div className="mst-sp-resource-filters__controls">
          <Select
            label="Resource Type"
            options={RESOURCE_TYPE_OPTIONS}
            value={resourceType}
            onChange={handleFilterChange(setResourceType)}
          />

          <Select
            label="Difficulty Level"
            options={DIFFICULTY_OPTIONS}
            value={difficultyLevel}
            onChange={handleFilterChange(setDifficultyLevel)}
          />

          {subjects.length > 0 && (
            <Select
              label="Subject"
              options={subjectOptions}
              value={subjectId}
              onChange={handleFilterChange(setSubjectId)}
            />
          )}
        </div>

        {hasActiveFilters && (
          <div className="mst-sp-resource-filters__actions">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* 4. Main Content Area */}
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
            Retrieving authorized learning resources...
          </p>
        </div>
      ) : error ? (
        <div style={{ maxWidth: '640px', margin: 'var(--space-8) auto' }}>
          <ErrorState
            title="Unable to Load Learning Resources"
            message={error}
            onRetry={fetchResources}
            retryLabel="Retry"
          />
        </div>
      ) : resources.length === 0 ? (
        <div style={{ margin: 'var(--space-8) 0' }}>
          <EmptyState
            icon={<BookOpen size={40} color="var(--primary)" />}
            title="No Learning Resources Found"
            description={
              hasActiveFilters
                ? 'No learning resources match the selected filters for your academic curriculum.'
                : 'No learning resources are currently published for your active academic context.'
            }
            action={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              ) : null
            }
          />
        </div>
      ) : (
        <>
          {/* Results Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            <span>
              Showing {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)} – {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} resource{pagination.total === 1 ? '' : 's'}
            </span>
          </div>

          {/* Resource Cards Grid */}
          <div className="mst-sp-resource-grid">
            {resources.map((resource) => {
              const fileSizeStr = formatFileSize(resource.fileSizeBytes);
              const durationStr = formatDuration(resource.durationSeconds);

              return (
                <div key={resource.id} className="mst-sp-resource-card">
                  <div className="mst-sp-resource-card__header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span className="mst-sp-resource-card__icon" aria-hidden="true">
                        {getResourceTypeIcon(resource.resourceType)}
                      </span>
                      <Badge variant="primary">
                        {getResourceTypeLabel(resource.resourceType)}
                      </Badge>
                    </div>
                    {resource.difficultyLevel && (
                      <Badge variant={getDifficultyVariant(resource.difficultyLevel)}>
                        {resource.difficultyLevel.toUpperCase()}
                      </Badge>
                    )}
                  </div>

                  <div className="mst-sp-resource-card__body">
                    <h3 className="mst-sp-resource-card__title">
                      {resource.title}
                    </h3>
                    {resource.description && (
                      <p className="mst-sp-resource-card__description">
                        {resource.description}
                      </p>
                    )}
                  </div>

                  <div className="mst-sp-resource-card__footer">
                    <div className="mst-sp-resource-card__meta">
                      {fileSizeStr && (
                        <span className="mst-sp-resource-tag">
                          <HardDrive size={12} aria-hidden="true" />
                          <span>{fileSizeStr}</span>
                        </span>
                      )}
                      {durationStr && (
                        <span className="mst-sp-resource-tag">
                          <Clock size={12} aria-hidden="true" />
                          <span>{durationStr}</span>
                        </span>
                      )}
                      {resource.mimeType && (
                        <span className="mst-sp-resource-tag">
                          <span>{resource.mimeType.split('/')[1]?.toUpperCase() || resource.mimeType}</span>
                        </span>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      rightIcon={<ArrowRight size={14} />}
                      onClick={() => onNavigate(`/student/resources/${resource.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 5. Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="mst-sp-pagination" role="navigation" aria-label="Resource Pagination">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ChevronLeft size={16} />}
                disabled={!pagination.hasPrev}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>

              <span className="mst-sp-pagination__info">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                rightIcon={<ChevronRight size={16} />}
                disabled={!pagination.hasNext}
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
