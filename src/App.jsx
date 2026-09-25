import React, { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Modal from './components/Modal.jsx';
import Button from './components/Button.jsx';
import Input from './components/Input.jsx';
import Select from './components/Select.jsx';
import Textarea from './components/Textarea.jsx';
import Badge from './components/Badge.jsx';
import EmptyState from './components/EmptyState.jsx';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentPath, setCurrentPath] = useState('/');
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: 'Join MS Tutorials',
    type: 'enroll',
    metadata: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    classLevel: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleOpenInquiry = ({ type = 'enroll', metadata = '' }) => {
    let title = 'Join MS Tutorials';
    if (type === 'diagnostic') title = 'Book Diagnostic Test';
    if (type === 'mentor') title = 'Talk to an Academic Mentor';
    if (type === 'program') title = `Enrollment Inquiry — ${metadata}`;

    setModalConfig({
      isOpen: true,
      title,
      type,
      metadata,
    });
    setSubmitted(false);
  };

  const handleCloseModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
    setSubmitted(false);
  };

  const handleSubmitInquiry = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const renderContent = () => {
    if (currentPath === '/' || currentPath === '') {
      document.title = 'MS Tutorials | Building a Foundation in Maths & Science';
      return (
        <Home
          onOpenInquiry={handleOpenInquiry}
          onNavigate={(path) => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setCurrentPath(path);
          }}
        />
      );
    }

    if (currentPath === '/about') {
      document.title = 'About MS Tutorials | Our Learning Philosophy';
      return (
        <About
          onOpenInquiry={handleOpenInquiry}
          onNavigate={(path) => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setCurrentPath(path);
          }}
        />
      );
    }

    // Clean placeholder view for future routes before their scheduled phase
    return (
      <main className="container" style={{ padding: 'var(--space-16) var(--space-6)', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          title={`Route: ${currentPath}`}
          description="This section is scheduled for implementation in upcoming roadmap phases (Phases 4.2 – 4.6 for Public Pages; Phases 6 – 10 for Portals). The Home page is the active Phase 4.1 deliverable."
          action={
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setCurrentPath('/');
              }}
            >
              &larr; Return to Home Page
            </Button>
          }
        />
      </main>
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Global Navigation */}
      <Navbar
        currentPath={currentPath}
        onNavigate={(path) => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setCurrentPath(path);
        }}
        ctaLabel="Join MS Tutorials"
        onCtaClick={() => handleOpenInquiry({ type: 'enroll', metadata: 'Navbar CTA' })}
      />

      {/* 2. Main Page Content */}
      <div style={{ flex: 1 }}>{renderContent()}</div>

      {/* 3. Inquiry / Diagnostic Modal */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={handleCloseModal}
        title={modalConfig.title}
        footer={
          submitted ? (
            <Button variant="primary" size="sm" onClick={handleCloseModal}>
              Close
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitInquiry}
                disabled={!formData.name || !formData.phone}
              >
                Submit Request
              </Button>
            </>
          )
        }
      >
        {submitted ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
            <CheckCircle2 size={44} color="var(--primary)" style={{ margin: '0 auto var(--space-3)' }} />
            <h4 style={{ color: 'var(--navy)', marginBottom: 'var(--space-2)' }}>Request Received</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', lineHeight: '1.5' }}>
              Thank you, <strong>{formData.name}</strong>. Our academic counselor will reach out via{' '}
              <strong>{formData.phone}</strong> regarding <em>{modalConfig.title}</em>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitInquiry} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <Badge variant="primary" icon={<Sparkles size={12} />}>
                Maths &amp; Science Tuition
              </Badge>
            </div>
            <Input
              label="Student / Parent Name"
              required
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Contact Phone Number"
              required
              type="tel"
              placeholder="e.g. 9876543210"
              helperText="We will contact you via WhatsApp or phone call."
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Select
              label="Target Class / Grade"
              placeholder="Select student class..."
              options={[
                { value: 'class-6', label: 'Class 6 — Explorers' },
                { value: 'class-7', label: 'Class 7 — Explorers' },
                { value: 'class-8', label: 'Class 8 — Explorers' },
                { value: 'class-9', label: 'Class 9 — Achievers' },
                { value: 'class-10', label: 'Class 10 — Achievers (Board Prep)' },
                { value: 'class-11', label: 'Class 11 — Science Foundation' },
                { value: 'class-12', label: 'Class 12 — Science Foundation' },
              ]}
              value={formData.classLevel}
              onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
            />
            <Textarea
              label="Academic Goals / Query (Optional)"
              rows={3}
              placeholder="Specific topics or chapters student wants to strengthen..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </form>
        )}
      </Modal>

      {/* 4. Global Footer */}
      <Footer
        onNavigate={(path) => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setCurrentPath(path);
        }}
      />
    </div>
  );
}
