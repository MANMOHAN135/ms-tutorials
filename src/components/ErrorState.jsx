import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './Button.jsx';

/**
 * Reusable Error State Component for MS Tutorials Design System
 * 
 * @param {Object} props
 * @param {string} [props.title='Something went wrong']
 * @param {string} props.message
 * @param {Function} [props.onRetry]
 * @param {string} [props.retryLabel='Try Again']
 * @param {string} [props.className='']
 */
export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  className = '',
}) {
  return (
    <div className={`mst-error-state ${className}`} role="alert">
      <div className="mst-error-state__icon" aria-hidden="true">
        <AlertCircle size={32} />
      </div>
      <h3 className="mst-error-state__title">{title}</h3>
      <p className="mst-error-state__message">{message}</p>
      {onRetry && (
        <div className="mst-error-state__retry">
          <Button variant="outline" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
