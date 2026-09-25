import React, { useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Accessible Modal Component for MS Tutorials Design System
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {string} props.title
 * @param {React.ReactNode} [props.footer]
 * @param {React.ReactNode} props.children
 * @param {string} [props.className='']
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  footer,
  children,
  className = '',
}) {
  const titleId = useId();
  const modalRef = useRef(null);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevent background scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="mst-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`mst-modal-container ${className}`}
      >
        <div className="mst-modal-header">
          <h2 id={titleId} className="mst-modal-title">
            {title}
          </h2>
          <button
            type="button"
            className="mst-modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="mst-modal-body">{children}</div>

        {footer && <div className="mst-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
