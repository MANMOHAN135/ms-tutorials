import React from 'react';

/**
 * Reusable Badge Component for MS Tutorials Design System
 * 
 * @param {Object} props
 * @param {'primary' | 'success' | 'warning' | 'danger' | 'neutral'} [props.variant='primary']
 * @param {React.ReactNode} [props.icon]
 * @param {React.ReactNode} props.children
 * @param {string} [props.className='']
 */
export default function Badge({
  variant = 'primary',
  icon,
  children,
  className = '',
  ...rest
}) {
  const variantClass = `mst-badge--${variant}`;

  return (
    <span className={`mst-badge ${variantClass} ${className}`} {...rest}>
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
