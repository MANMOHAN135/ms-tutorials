import React, { useId } from 'react';

/**
 * Reusable Select Dropdown Component for MS Tutorials Design System
 * 
 * @param {Object} props
 * @param {string} [props.id]
 * @param {string} props.label
 * @param {Array<{value: string|number, label: string}>} [props.options=[]]
 * @param {string} [props.helperText]
 * @param {string} [props.error]
 * @param {boolean} [props.required=false]
 * @param {string} [props.placeholder]
 * @param {string} [props.className='']
 * @param {React.ReactNode} [props.children]
 */
export default function Select({
  id: explicitId,
  label,
  options = [],
  helperText,
  error,
  required = false,
  placeholder,
  className = '',
  children,
  ...rest
}) {
  const generatedId = useId();
  const selectId = explicitId || generatedId;
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;

  const ariaDescribedBy = [
    helperText ? helperId : null,
    error ? errorId : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`mst-form-group ${className}`}>
      {label && (
        <label htmlFor={selectId} className="mst-label">
          {label}
          {required && <span className="mst-label__required" aria-hidden="true">*</span>}
        </label>
      )}

      <select
        id={selectId}
        required={required}
        aria-invalid={!!error}
        aria-describedby={ariaDescribedBy}
        className={`mst-select ${error ? 'has-error' : ''}`}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children
          ? children
          : options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
      </select>

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
