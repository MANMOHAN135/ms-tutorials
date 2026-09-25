import React from 'react';

/**
 * Reusable Card Component for MS Tutorials Design System
 * 
 * @param {Object} props
 * @param {React.ReactNode} [props.title]
 * @param {React.ReactNode} [props.subtitle]
 * @param {React.ReactNode} [props.icon]
 * @param {React.ReactNode} [props.footer]
 * @param {boolean} [props.interactive=false]
 * @param {React.ReactNode} props.children
 * @param {string} [props.className='']
 */
export default function Card({
  title,
  subtitle,
  icon,
  footer,
  interactive = false,
  children,
  className = '',
  ...rest
}) {
  const hasHeader = title || icon;

  return (
    <div
      className={`mst-card ${interactive ? 'mst-card--interactive' : ''} ${className}`}
      {...rest}
    >
      {hasHeader && (
        <div className="mst-card__header">
          {icon && <div className="mst-card__icon">{icon}</div>}
          <div>
            {title && <h3 className="mst-card__title">{title}</h3>}
            {subtitle && (
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', margin: 0 }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mst-card__body">{children}</div>

      {footer && <div className="mst-card__footer">{footer}</div>}
    </div>
  );
}
