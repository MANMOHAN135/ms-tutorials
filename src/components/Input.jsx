import React, { useId } from 'react';

/**
 * Reusable Form Input Component for MS Tutorials Design System
 * 
 * @param {Object} props
 * @param {string} [props.id]
 * @param {string} props.label
 * @param {string} [props.helperText]
 * @param {string} [props.error]
 * @param {boolean} [props.required=false]
 * @param {string} [props.className='']
 * @param {string} [props.type='text']
 */
export default function Input({
  id: explicitId,
  label,
  helperText,
  error,
  required = false,
  className = '',
  type = 'text',
  ...rest
}) {
  const generatedId = useId();
  const inputId = explicitId || generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  const ariaDescribedBy = [
    helperText ? helperId : null,
    error ? errorId : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`mst-form-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="mst-label">
          {label}
          {required && <span className="mst-label__required" aria-hidden="true">*</span>}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        required={required}
        aria-invalid={!!error}
        aria-describedby={ariaDescribedBy}
        className={`mst-input ${error ? 'has-error' : ''}`}
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
