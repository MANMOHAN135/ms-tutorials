import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Reusable Empty State Component for MS Tutorials Design System
 * 
 * @param {Object} props
 * @param {React.ReactNode} [props.icon]
 * @param {string} props.title
 * @param {string} props.description
 * @param {React.ReactNode} [props.action]
 * @param {string} [props.className='']
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`mst-empty-state ${className}`} role="status">
      <div className="mst-empty-state__icon" aria-hidden="true">
        {icon || <Inbox size={32} />}
      </div>
      <h3 className="mst-empty-state__title">{title}</h3>
      <p className="mst-empty-state__description">{description}</p>
      {action && <div className="mst-empty-state__action">{action}</div>}
    </div>
  );
}
