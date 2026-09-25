import React from 'react';

/**
 * Reusable Loading Spinner for MS Tutorials Design System
 * 
 * @param {Object} props
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 * @param {string} [props.className='']
 * @param {string} [props.label='Loading...']
 */
export default function LoadingSpinner({
  size = 'md',
  className = '',
  label = 'Loading...',
  ...rest
}) {
  return (
    <span
      className={`mst-spinner mst-spinner--${size} ${className}`}
      role="status"
      aria-label={label}
      {...rest}
    />
  );
}
