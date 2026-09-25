import React, { useId } from 'react';

/**
 * Reusable Form Textarea Component for MS Tutorials Design System
 * 
 * @param {Object} props
 * @param {string} [props.id]
 * @param {string} props.label
 * @param {string} [props.helperText]
 * @param {string} [props.error]
 * @param {boolean} [props.required=false]
 * @param {number} [props.rows=4]
 * @param {string} [props.className='']
 */
export default function Textarea({
  id: explicitId,
  label,
  helperText,
  error,
  required = false,
  rows = 4,
  className = '',
  ...rest
}) {
  const generatedId = useId();
  const textareaId = explicitId || generatedId;
  const helperId = `${textareaId}-helper`;
  const errorId = `${textareaId}-error`;

  const ariaDescribedBy = [
    helperText ? helperId : null,
    error ? errorId : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`mst-form-group ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="mst-label">
          {label}
          {required && <span className="mst-label__required" aria-hidden="true">*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={!!error}
        aria-describedby={ariaDescribedBy}
        className={`mst-textarea ${error ? 'has-error' : ''}`}
        {...rest}
      />

      {error ? (
        <p id={errorId} className="mst-error-text" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="mst-helper-text">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
