import React from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';

/**
 * Reusable Button Component for MS Tutorials Design System
 * 
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'} [props.variant='primary']
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 * @param {boolean} [props.isLoading=false]
 * @param {boolean} [props.disabled=false]
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]
 * @param {React.ReactNode} props.children
 * @param {string} [props.className='']
 * @param {'button' | 'submit' | 'reset'} [props.type='button']
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  type = 'button',
  ...rest
}) {
  const variantClass = `mst-btn--${variant}`;
  const sizeClass = `mst-btn--${size}`;
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      className={`mst-btn ${variantClass} ${sizeClass} ${isDisabled ? 'mst-btn--disabled' : ''} ${className}`}
      disabled={isDisabled}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
