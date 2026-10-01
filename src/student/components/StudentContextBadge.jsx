import React from 'react';

/**
 * Reusable Academic Context Badge / Chip for Student Portal
 * 
 * Displays the student's active academic context (Session, Board, Class, Program).
 * In Phase 5.10A, operates as a presentational shell component.
 * 
 * @param {Object} props
 * @param {string} [props.title='Academic Session 2026-27']
 * @param {string} [props.subtitle='CBSE Class 10']
 * @param {string} [props.className='']
 */
export default function StudentContextBadge({
  title = 'Academic Session',
  subtitle = 'Academic Context',
  isEnrolled = true,
  className = '',
}) {
  return (
    <div
      className={`mst-sp-context-chip ${!isEnrolled ? 'mst-sp-context-chip--unassigned' : ''} ${className}`}
      role="status"
      aria-label={`Academic context: ${subtitle}, ${title}`}
    >
      <span
        className={`mst-sp-context-chip__indicator ${!isEnrolled ? 'mst-sp-context-chip__indicator--amber' : ''}`}
        aria-hidden="true"
      />
      <span className="mst-sp-context-chip__title">{subtitle}</span>
      {title && (
        <>
          <span className="mst-sp-context-chip__session" aria-hidden="true">•</span>
          <span className="mst-sp-context-chip__session">{title}</span>
        </>
      )}
    </div>
  );
}
