import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Button from './Button.jsx';

/**
 * Reusable Public Navbar Component for MS Tutorials Design System
 * 
 * @param {Object} props
 * @param {string} [props.currentPath='/']
 * @param {Function} [props.onNavigate]
 * @param {string} [props.ctaLabel='Join MS Tutorials']
 * @param {Function} [props.onCtaClick]
 * @param {string} [props.className='']
 */
export default function Navbar({
  currentPath = '/',
  onNavigate,
  ctaLabel = 'Join MS Tutorials',
  onCtaClick,
  className = '',
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Programs', href: '/programs' },
    { label: 'Learning System', href: '/learning-system' },
    { label: 'Resources', href: '/resources' },
    { label: 'Contact', href: '/contact' },
  ];

  const handleLinkClick = (e, href) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(href);
      setIsMobileMenuOpen(false);
    }
  };

  const handleCta = (e) => {
    if (onCtaClick) {
      e.preventDefault();
      onCtaClick();
      setIsMobileMenuOpen(false);
    } else if (onNavigate) {
      e.preventDefault();
      onNavigate('/contact');
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className={`mst-navbar ${className}`}>
      <div className="container mst-navbar__inner">
        {/* Brand Logo */}
        <a
          href="/"
          className="mst-navbar__brand"
          onClick={(e) => handleLinkClick(e, '/')}
          aria-label="MS Tutorials Home"
        >
          <img
            src="/logo/logo.svg"
            alt="MS Tutorials Logo"
            className="mst-navbar__logo"
          />
        </a>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation">
          <ul className="mst-navbar__nav">
            {navLinks.map((link) => {
              const isActive = currentPath === link.href;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className={`mst-navbar__link ${isActive ? 'mst-navbar__link--active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Desktop Primary Action */}
        <div className="mst-navbar__actions">
          <Button
            variant="primary"
            size="sm"
            onClick={handleCta}
          >
            {ctaLabel}
          </Button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="mst-navbar__toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
        >
          {isMobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="container mst-navbar__drawer">
          <nav aria-label="Mobile Navigation">
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {navLinks.map((link) => {
                const isActive = currentPath === link.href;
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className={`mst-navbar__link ${isActive ? 'mst-navbar__link--active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                      style={{ display: 'block' }}
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mst-navbar__drawer-actions">
            <Button
              variant="primary"
              size="md"
              style={{ width: '100%' }}
              onClick={handleCta}
            >
              {ctaLabel}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
