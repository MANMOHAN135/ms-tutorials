import React from 'react';

/**
 * Reusable Footer Component for MS Tutorials Design System
 * 
 * @param {Object} props
 * @param {Function} [props.onNavigate]
 * @param {string} [props.className='']
 */
export default function Footer({ onNavigate, className = '' }) {
  const handleLinkClick = (e, href) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(href);
    }
  };

  return (
    <footer className={`mst-footer ${className}`}>
      <div className="container">
        <div className="mst-footer__grid">
          {/* Brand Info */}
          <div className="mst-footer__brand">
            <img
              src="/logo/logo.svg"
              alt="MS Tutorials Logo"
              style={{ height: '40px', filter: 'brightness(0) invert(1)' }}
            />
            <p className="mst-footer__tagline">
              Building a Foundation in Maths &amp; Science
            </p>
            <p>
              Concepts • Clarity • Confidence. Structured learning paths empowering
              students to master rigorous academics.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mst-footer__col-title">Quick Links</h4>
            <ul className="mst-footer__links">
              <li>
                <a href="/about" onClick={(e) => handleLinkClick(e, '/about')} className="mst-footer__link">
                  About Us
                </a>
              </li>
              <li>
                <a href="/programs" onClick={(e) => handleLinkClick(e, '/programs')} className="mst-footer__link">
                  Programs
                </a>
              </li>
              <li>
                <a href="/learning-system" onClick={(e) => handleLinkClick(e, '/learning-system')} className="mst-footer__link">
                  Learning System
                </a>
              </li>
              <li>
                <a href="/resources" onClick={(e) => handleLinkClick(e, '/resources')} className="mst-footer__link">
                  Resources
                </a>
              </li>
              <li>
                <a href="/contact" onClick={(e) => handleLinkClick(e, '/contact')} className="mst-footer__link">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="mst-footer__col-title">Portals</h4>
            <ul className="mst-footer__links">
              <li>
                <a href="/student/login" onClick={(e) => handleLinkClick(e, '/student/login')} className="mst-footer__link">
                  Student Portal
                </a>
              </li>
              <li>
                <a href="/parent/login" onClick={(e) => handleLinkClick(e, '/parent/login')} className="mst-footer__link">
                  Parent Portal
                </a>
              </li>
              <li>
                <a href="/teacher/login" onClick={(e) => handleLinkClick(e, '/teacher/login')} className="mst-footer__link">
                  Teacher Portal
                </a>
              </li>
              <li>
                <a href="/admin/login" onClick={(e) => handleLinkClick(e, '/admin/login')} className="mst-footer__link">
                  Admin Panel
                </a>
              </li>
            </ul>
          </div>

          {/* Contact / Inquiries */}
          <div>
            <h4 className="mst-footer__col-title">Inquiries</h4>
            <ul className="mst-footer__links">
              <li style={{ color: '#94A3B8', fontSize: 'var(--font-size-sm)' }}>
                Admissions: admissions@mstutorials.com
              </li>
              <li style={{ color: '#94A3B8', fontSize: 'var(--font-size-sm)' }}>
                General: info@mstutorials.com
              </li>
              <li style={{ color: '#94A3B8', fontSize: 'var(--font-size-sm)' }}>
                Support: support@mstutorials.com
              </li>
              <li style={{ marginTop: 'var(--space-2)' }}>
                <a href="/contact" onClick={(e) => handleLinkClick(e, '/contact')} className="mst-footer__link" style={{ color: 'var(--primary)' }}>
                  Request Callback &rarr;
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mst-footer__bottom">
          <p>&copy; {new Date().getFullYear()} MS Tutorials. All rights reserved.</p>
          <p>Domain: mstutorials.com</p>
        </div>
      </div>
    </footer>
  );
}
