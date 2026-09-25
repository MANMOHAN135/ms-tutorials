import React from 'react';

/**
 * Reusable Section Title Component for MS Tutorials Design System
 * 
 * @param {Object} props
 * @param {string} [props.eyebrow]
 * @param {string} props.heading
 * @param {string} [props.description]
 * @param {'center' | 'left'} [props.align='center']
 * @param {string} [props.className='']
 */
export default function SectionTitle({
  eyebrow,
  heading,
  description,
  align = 'center',
  className = '',
}) {
  const alignClass = `mst-section-title--${align}`;

  return (
    <div className={`mst-section-title ${alignClass} ${className}`}>
      {eyebrow && <span className="mst-section-title__eyebrow">{eyebrow}</span>}
      <h2 className="mst-section-title__heading">{heading}</h2>
      {description && <p className="mst-section-title__description">{description}</p>}
    </div>
  );
}
