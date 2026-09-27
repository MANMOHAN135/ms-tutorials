import React from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import { Calendar, ArrowLeft, Layers } from 'lucide-react';

/**
 * Reusable Placeholder Shell for Student Portal Views
 * 
 * Communicates honest roadmap status for upcoming modules without displaying fake data.
 * 
 * @param {Object} props
 * @param {string} props.title - Title of the section (e.g. 'Learning Resources', 'Assignments')
 * @param {string} props.description - Scope and scheduled roadmap phase description
 * @param {string} [props.phaseBadge='Scheduled Roadmap Phase'] - Text for status badge
 * @param {Function} [props.onNavigate] - Navigation handler callback
 */
export default function StudentPagePlaceholder({
  title,
  description,
  phaseBadge = 'Scheduled Roadmap Phase',
  onNavigate,
}) {
  return (
    <div style={{ maxWidth: '720px', margin: 'var(--space-6) auto 0' }}>
      <Card>
        <div style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--light-teal)',
              color: 'var(--primary)',
              margin: '0 auto var(--space-4)',
            }}
            aria-hidden="true"
          >
            <Layers size={32} />
          </div>

          <div style={{ marginBottom: 'var(--space-3)' }}>
            <Badge variant="neutral" icon={<Calendar size={12} />}>
              {phaseBadge}
            </Badge>
          </div>

          <h2
            style={{
              fontSize: 'var(--font-size-2xl)',
              color: 'var(--navy)',
              marginBottom: 'var(--space-2)',
            }}
          >
            {title}
          </h2>

          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-muted)',
              lineHeight: 'var(--line-height-relaxed)',
              maxWidth: '540px',
              margin: '0 auto var(--space-6)',
            }}
          >
            {description}
          </p>

          <div
            style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              textAlign: 'left',
              marginBottom: 'var(--space-6)',
            }}
          >
            <h4
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-bold)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--navy)',
                marginBottom: 'var(--space-2)',
              }}
            >
              Phase 5.10A Foundation Note
            </h4>
            <p
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-muted)',
                lineHeight: '1.5',
                margin: 0,
              }}
            >
              This route shell is part of the clean frontend foundation. Zero synthetic records or simulated student progress are shown. Active backend services and data integrations will connect in subsequent phases according to the Student Learning Experience Architecture.
            </p>
          </div>

          {onNavigate && (
            <Button
              variant="outline"
              size="md"
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => onNavigate('/student/dashboard')}
            >
              Return to Student Dashboard
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
