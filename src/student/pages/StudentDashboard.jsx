import React from 'react';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import { BookOpen, User, Layers, ArrowRight, Info, CheckCircle2 } from 'lucide-react';

/**
 * Student Dashboard Shell (Phase 5.10A Foundation)
 * 
 * Provides structural dashboard canvas without synthetic/fake student data.
 * 
 * @param {Object} props
 * @param {Function} props.onNavigate - Navigation callback
 */
export default function StudentDashboard({ onNavigate }) {
  return (
    <div>
      {/* 1. Header Banner */}
      <div className="mst-sp-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
          <Badge variant="primary">Frontend Foundation Shell</Badge>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Phase 5.10A</span>
        </div>
        <h1 className="mst-sp-page-title">Student Learning Workspace</h1>
        <p className="mst-sp-page-subtitle">
          Dedicated academic environment for CBSE &amp; ICSE Maths and Science tuition.
        </p>
      </div>

      {/* 2. Architecture Notice */}
      <div className="mst-sp-banner-info" role="region" aria-label="Phase notice">
        <Info size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Phase 5.10A Foundation Active:</strong> This workspace layout, navigation rails, and responsive shells are fully operational. Authentic data integrations with locked Phase 5.8 APIs (`/api/v1/student/academic-context`, `/api/v1/student/resources`, `/api/v1/student/profile`) will connect in subsequent phases according to the Student Learning Experience Architecture.
        </div>
      </div>

      {/* 3. Operational Shell Cards */}
      <div className="mst-sp-dashboard-grid">
        {/* Module 1: Learning Resources */}
        <Card
          title="Learning Resources"
          subtitle="Curriculum-scoped study materials"
          icon={<BookOpen size={20} />}
          footer={
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ArrowRight size={14} />}
              onClick={() => onNavigate('/student/resources')}
            >
              Open Resources
            </Button>
          }
        >
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
            Curated notes, practice worksheets, question banks, and video walkthroughs mapped to CBSE and ICSE chapters and topics.
          </p>
        </Card>

        {/* Module 2: Profile & Academic Context */}
        <Card
          title="Profile & Context"
          subtitle="Institutional enrollment details"
          icon={<User size={20} />}
          footer={
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ArrowRight size={14} />}
              onClick={() => onNavigate('/student/profile')}
            >
              View Profile
            </Button>
          }
        >
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
            Authoritative student enrollment record, session validity, board affiliation, and cohort batch details.
          </p>
        </Card>

        {/* Module 3: Upcoming Modules */}
        <Card
          title="Upcoming Subsystems"
          subtitle="Roadmap Phase 6+"
          icon={<Layers size={20} />}
          footer={
            <Badge variant="neutral">Scheduled In Phase 6+</Badge>
          }
        >
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <CheckCircle2 size={14} color="var(--primary)" />
              <span>Assignments &amp; Practice Submission</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <CheckCircle2 size={14} color="var(--primary)" />
              <span>Periodic Tests &amp; Performance Ledger</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <CheckCircle2 size={14} color="var(--primary)" />
              <span>Topic Mastery &amp; Diagnostic Progress</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <CheckCircle2 size={14} color="var(--primary)" />
              <span>Session Attendance &amp; Faculty Notices</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
