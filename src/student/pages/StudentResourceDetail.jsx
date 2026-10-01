import React, { useState, useEffect } from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import studentService from '../../services/studentService.js';
import {
  ArrowLeft,
  FileText,
  Video,
  FileSpreadsheet,
  FileCheck2,
  HelpCircle,
  ExternalLink,
  HardDrive,
  Clock,
  Layers,
  Calendar,
  Shield,
  Info,
} from 'lucide-react';

/**
 * Returns a human-friendly label for a resource type.
 */
function getResourceTypeLabel(type) {
  switch (type) {
    case 'notes': return 'Study Notes';
    case 'worksheet': return 'Practice Worksheet';
    case 'important_questions': return 'Important Questions';
    case 'video': return 'Video Walkthrough';
    case 'question_bank': return 'Question Bank';
    case 'summary_sheet': return 'Summary Sheet';
    default: return type || 'Learning Resource';
  }
}

/**
 * Returns an appropriate icon for a resource type.
 */
function getResourceTypeIcon(type) {
  switch (type) {
    case 'video': return <Video size={20} />;
    case 'worksheet': return <FileSpreadsheet size={20} />;
    case 'important_questions': return <FileCheck2 size={20} />;
    case 'question_bank': return <HelpCircle size={20} />;
    case 'notes':
    case 'summary_sheet':
    default: return <FileText size={20} />;
  }
}

/**
 * Formats file size in bytes to KB or MB.
 */
function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return 'Not specified';
  if (bytes >= 1048576) {
    return `${(bytes / 1048576).toFixed(2)} MB (${bytes.toLocaleString()} bytes)`;
  }
  return `${Math.round(bytes / 1024)} KB (${bytes.toLocaleString()} bytes)`;
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
    return `${hrs}h ${remMins}m ${secs.toString().padStart(2, '0')}s`;
  }
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

/**
 * Student Learning Resource Detail Page (Phase 5.10D)
 * 
 * Retrieves and renders verified resource metadata via GET /api/v1/student/resources/:id.
 * 
 * @param {Object} props
 * @param {string} props.resourceId - Resource UUID
 * @param {Function} props.onNavigate - Navigation callback
 */
export default function StudentResourceDetail({ resourceId, onNavigate }) {
  const [resource, setResource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setIsNotFound(false);

    studentService.getResourceById(resourceId)
      .then((data) => {
        if (!isMounted) return;
        if (!data) {
          setIsNotFound(true);
        } else {
          setResource(data);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err.status === 404 || err.code === 'NOT_FOUND') {
          setIsNotFound(true);
        } else {
          setError(err.message || 'Unable to load resource metadata.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [resourceId]);

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
          Retrieving resource metadata from authorized curriculum...
        </p>
      </div>
    );
  }

  // 2. 404 Not Found State
  if (isNotFound) {
    return (
      <div style={{ maxWidth: '640px', margin: 'var(--space-12) auto' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: 'var(--space-6) var(--space-4)' }} role="alert">
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <Badge variant="danger">404 Not Found</Badge>
            </div>
            <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--navy)', marginBottom: 'var(--space-2)' }}>
              Learning Resource Not Found
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: 'var(--space-6)' }}>
              The requested learning resource does not exist, has been unpublished, or is not in your authorized academic curriculum scope.
            </p>
            <Button
              variant="primary"
              size="md"
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => onNavigate('/student/resources')}
            >
              Return to Resource Library
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 3. Error State
  if (error) {
    return (
      <div style={{ maxWidth: '640px', margin: 'var(--space-8) auto' }}>
        <ErrorState
          title="Error Loading Resource"
          message={error}
          onRetry={() => {
            setIsLoading(true);
            setError(null);
            studentService.getResourceById(resourceId)
              .then(setResource)
              .catch(err => setError(err.message))
              .finally(() => setIsLoading(false));
          }}
          retryLabel="Retry"
        />
      </div>
    );
  }

  if (!resource) return null;

  const durationStr = formatDuration(resource.durationSeconds);
  const fileSizeStr = formatFileSize(resource.fileSizeBytes);

  return (
    <div className="mst-sp-resource-detail">
      {/* 1. Header & Back Navigation */}
      <div className="mst-sp-page-header">
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => onNavigate('/student/resources')}
          >
            Back to Resource Library
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
          <span className="mst-sp-resource-card__icon" aria-hidden="true">
            {getResourceTypeIcon(resource.resourceType)}
          </span>
          <Badge variant="primary">{getResourceTypeLabel(resource.resourceType)}</Badge>
          {resource.difficultyLevel && (
            <Badge variant={resource.difficultyLevel === 'advanced' ? 'accent' : 'neutral'}>
              {resource.difficultyLevel.toUpperCase()}
            </Badge>
          )}
        </div>

        <h1 className="mst-sp-page-title">{resource.title}</h1>
        <p className="mst-sp-page-subtitle">
          Published on {new Date(resource.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* 2. Content & Specification Cards */}
      <div className="mst-sp-profile-grid">
        {/* Card 1: Overview & Description */}
        <Card
          title="Resource Description"
          subtitle="Study guidance and curriculum context"
          icon={<FileText size={20} />}
        >
          <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: '1.6', color: 'var(--text-main)' }}>
            {resource.description ? (
              <p style={{ margin: 0 }}>{resource.description}</p>
            ) : (
              <p style={{ color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
                No additional description provided for this resource.
              </p>
            )}
          </div>
        </Card>

        {/* Card 2: File Specifications */}
        <Card
          title="Technical Specifications"
          subtitle="File format and metadata"
          icon={<HardDrive size={20} />}
        >
          <div className="mst-sp-kv-list">
            <div className="mst-sp-kv-item">
              <span className="mst-sp-kv-label">Resource Type</span>
              <span className="mst-sp-kv-value">{getResourceTypeLabel(resource.resourceType)}</span>
            </div>
            <div className="mst-sp-kv-item">
              <span className="mst-sp-kv-label">Difficulty Level</span>
              <span className="mst-sp-kv-value" style={{ textTransform: 'capitalize' }}>
                {resource.difficultyLevel || 'Standard'}
              </span>
            </div>
            <div className="mst-sp-kv-item">
              <span className="mst-sp-kv-label">MIME Type</span>
              <span className="mst-sp-kv-value">{resource.mimeType || 'Not specified'}</span>
            </div>
            <div className="mst-sp-kv-item">
              <span className="mst-sp-kv-label">File Size</span>
              <span className="mst-sp-kv-value">{fileSizeStr}</span>
            </div>
            {durationStr && (
              <div className="mst-sp-kv-item">
                <span className="mst-sp-kv-label">Video Duration</span>
                <span className="mst-sp-kv-value">{durationStr}</span>
              </div>
            )}
            <div className="mst-sp-kv-item">
              <span className="mst-sp-kv-label">Storage Mechanism</span>
              <span className="mst-sp-kv-value" style={{ textTransform: 'uppercase' }}>
                {resource.storageType || 'Standard Storage'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Resource Action & Delivery Boundary Note */}
      <div style={{ marginTop: 'var(--space-6)' }}>
        <Card
          title="Resource Access & Delivery"
          subtitle="Institutional asset distribution"
          icon={<Shield size={20} />}
          footer={
            resource.fileUrl ? (
              <a
                href={resource.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ExternalLink size={16} />}
                >
                  Open Resource File
                </Button>
              </a>
            ) : (
              <Badge variant="neutral">Direct File URL Not Configured</Badge>
            )
          }
        >
          <div className="mst-sp-banner-info" style={{ margin: 0 }}>
            <Info size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Asset Delivery Boundary Note:</strong> This learning material is linked according to verified curriculum authorization rules. In accordance with Phase 5.8D architecture, assets are delivered via authorized file endpoints. Dedicated pre-signed CDN delivery and secure stream players are scheduled for Phase 6+.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
