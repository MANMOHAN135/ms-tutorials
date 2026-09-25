import React, { useState, useEffect } from 'react';

function App() {
  const [apiStatus, setApiStatus] = useState('Checking API connection...');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setApiStatus(`Backend Status: ${data.status} (Phase 1 Baseline)`))
      .catch(() => setApiStatus('Backend not running locally yet (start via `npm run server`)'));
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          borderBottom: '1px solid var(--border-color)',
          padding: '1rem 0',
          backgroundColor: '#ffffff',
        }}
      >
        <div
          className="container"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/logo/logo.svg" alt="MS Tutorials Logo" style={{ height: '44px' }} />
          </div>
          <span
            style={{
              fontSize: '0.875rem',
              backgroundColor: 'var(--light-teal)',
              color: 'var(--dark-teal)',
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              fontWeight: 600,
            }}
          >
            Phase 1 Foundation
          </span>
        </div>
      </header>

      <main className="container" style={{ padding: '4rem 1.5rem', flex: 1 }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
              color: 'var(--navy)',
              letterSpacing: '-0.02em',
            }}
          >
            MS Tutorials
          </h1>
          <p
            style={{
              fontSize: '1.25rem',
              color: 'var(--primary)',
              fontWeight: 600,
              marginBottom: '1.5rem',
            }}
          >
            Build Strong Foundations. Learn With Clarity. Grow With Confidence.
          </p>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>
            Project foundation initialized. Ready for Phase 2: Project Constitution and Phase 3:
            Design System.
          </p>

          <div
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              color: 'var(--navy)',
              fontWeight: 500,
            }}
          >
            {apiStatus}
          </div>
        </div>
      </main>

      <footer
        style={{
          borderTop: '1px solid var(--border-color)',
          padding: '1.5rem 0',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          backgroundColor: '#ffffff',
        }}
      >
        <p>&copy; {new Date().getFullYear()} MS Tutorials. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
