import React from 'react';
import SectionTitle from '../components/SectionTitle.jsx';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import {
  BookOpen,
  Award,
  Sparkles,
  Users,
  Compass,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  FileText,
  Video,
  ClipboardList,
  TrendingUp,
  Brain,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Layers,
  Lightbulb,
} from 'lucide-react';
import '../styles/home.css';

/**
 * MS Tutorials Home Page Component (Phase 4.1)
 * 
 * @param {Object} props
 * @param {Function} props.onOpenInquiry - Opens the diagnostic / enrollment modal
 * @param {Function} props.onNavigate - Navigation handler for route placeholders
 */
export default function Home({ onOpenInquiry, onNavigate }) {
  const handleAction = (type, metadata = '') => {
    if (onOpenInquiry) {
      onOpenInquiry({ type, metadata });
    }
  };

  const handleRoute = (route) => {
    if (onNavigate) {
      onNavigate(route);
    }
  };

  return (
    <div className="home-page">
      {/* ====================================================================
          1. HERO SECTION
          ==================================================================== */}
      <section className="home-hero" aria-labelledby="hero-heading">
        <div className="container home-hero__grid">
          <div className="home-hero__content">
            <div className="home-hero__eyebrow">
              <Badge variant="primary" icon={<Sparkles size={13} />}>
                Concepts • Clarity • Confidence
              </Badge>
            </div>

            <h1 id="hero-heading" className="home-hero__title">
              Build Strong Foundations.<br />
              <span>Learn With Clarity.</span><br />
              Grow With Confidence.
            </h1>

            <p className="home-hero__description">
              MS Tutorials helps students build strong foundations in Mathematics and
              Science through concept-based learning, regular practice, continuous
              assessment and personalized support.
            </p>

            <div className="home-hero__actions">
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleAction('enroll', 'Hero Primary')}
              >
                Join MS Tutorials
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleAction('diagnostic', 'Hero Secondary')}
              >
                Take a Diagnostic Test
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => {
                  const elem = document.getElementById('programs-section');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Programs &darr;
              </Button>
            </div>

            <div className="home-hero__highlights">
              <div className="home-hero__highlight-item">
                <CheckCircle2 size={16} color="var(--primary)" />
                <span>Maths &amp; Science Focus</span>
              </div>
              <div className="home-hero__highlight-item">
                <CheckCircle2 size={16} color="var(--primary)" />
                <span>Continuous Assessment</span>
              </div>
              <div className="home-hero__highlight-item">
                <CheckCircle2 size={16} color="var(--primary)" />
                <span>Small Dedicated Batches</span>
              </div>
            </div>
          </div>

          {/* Educational Visual / Illustration Card */}
          <div className="home-hero__visual" aria-hidden="true">
            <div className="hero-visual-card">
              <div className="hero-visual-header">
                <div className="hero-visual-dots">
                  <span className="hero-visual-dot hero-visual-dot--primary"></span>
                  <span className="hero-visual-dot hero-visual-dot--gold"></span>
                  <span className="hero-visual-dot hero-visual-dot--navy"></span>
                </div>
                <Badge variant="neutral">Foundation Blueprint</Badge>
              </div>

              <div className="hero-concept-matrix">
                <div className="hero-concept-box hero-concept-box--active">
                  <span className="hero-concept-label">Focus Area</span>
                  <span className="hero-concept-val">Maths &amp; Science</span>
                </div>
                <div className="hero-concept-box">
                  <span className="hero-concept-label">Pedagogy</span>
                  <span className="hero-concept-val">Concept Clarity</span>
                </div>
                <div className="hero-concept-box">
                  <span className="hero-concept-label">Learning Loop</span>
                  <span className="hero-concept-val">Practice &amp; Assess</span>
                </div>
                <div className="hero-concept-box hero-concept-box--active">
                  <span className="hero-concept-label">Outcome</span>
                  <span className="hero-concept-val">Academic Confidence</span>
                </div>
              </div>

              <div className="hero-diagnostic-preview">
                <div>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Student Learning Diagnostic
                  </p>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                    Topic Mastery &amp; Gap Analysis
                  </p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. TRUST / VALUE STRIP
          ==================================================================== */}
      <section className="home-trust-strip" aria-label="Core Educational Strengths">
        <div className="container">
          <div className="home-trust-strip__grid">
            <div className="home-trust-item">
              <div className="home-trust-item__icon">
                <Brain size={22} />
              </div>
              <div>
                <h3 className="home-trust-item__title">Concept-Based Learning</h3>
                <p className="home-trust-item__desc">Deep understanding over rote memorization</p>
              </div>
            </div>

            <div className="home-trust-item">
              <div className="home-trust-item__icon">
                <UserCheck size={22} />
              </div>
              <div>
                <h3 className="home-trust-item__title">Personalized Support</h3>
                <p className="home-trust-item__desc">Attention tailored to each student's pace</p>
              </div>
            </div>

            <div className="home-trust-item">
              <div className="home-trust-item__icon">
                <ClipboardList size={22} />
              </div>
              <div>
                <h3 className="home-trust-item__title">Regular Assessment</h3>
                <p className="home-trust-item__desc">Continuous tracking of learning progress</p>
              </div>
            </div>

            <div className="home-trust-item">
              <div className="home-trust-item__icon">
                <Users size={22} />
              </div>
              <div>
                <h3 className="home-trust-item__title">Small Batches</h3>
                <p className="home-trust-item__desc">Interactive sessions with mentor focus</p>
              </div>
            </div>

            <div className="home-trust-item">
              <div className="home-trust-item__icon">
                <Layers size={22} />
              </div>
              <div>
                <h3 className="home-trust-item__title">Digital Learning</h3>
                <p className="home-trust-item__desc">Structured material, worksheets and notes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. "MORE THAN TUITION"
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="philosophy-heading">
        <div className="container">
          <div className="home-philosophy__grid">
            <div>
              <SectionTitle
                eyebrow="Our Teaching Philosophy"
                heading="More Than Tuition"
                description="At MS Tutorials, we focus on how students learn—not just what they study. Education succeeds when curiosity is nurtured and conceptual clarity replaces fear."
                align="left"
              />
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-base)', lineHeight: varLineHeight() }}>
                Traditional coaching often rushes through syllabus coverage without verifying whether
                students truly grasp core principles. We deliberately build habits of critical
                thinking, structured self-revision, and resilience in problem solving.
              </p>
            </div>

            <div className="home-philosophy__points">
              <div className="home-philosophy-point">
                <div className="home-philosophy-point__icon">
                  <Lightbulb size={20} />
                </div>
                <h4 className="home-philosophy-point__title">Understanding Concepts</h4>
                <p className="home-philosophy-point__text">
                  Grasping why formulas work and how physical laws apply to real systems.
                </p>
              </div>

              <div className="home-philosophy-point">
                <div className="home-philosophy-point__icon">
                  <Compass size={20} />
                </div>
                <h4 className="home-philosophy-point__title">Identifying Learning Gaps</h4>
                <p className="home-philosophy-point__text">
                  Pinpointing the exact steps where misunderstandings begin.
                </p>
              </div>

              <div className="home-philosophy-point">
                <div className="home-philosophy-point__icon">
                  <CheckCircle2 size={20} />
                </div>
                <h4 className="home-philosophy-point__title">Targeted Practice</h4>
                <p className="home-philosophy-point__text">
                  Exercising problems calibrated to reinforce developing competencies.
                </p>
              </div>

              <div className="home-philosophy-point">
                <div className="home-philosophy-point__icon">
                  <TrendingUp size={20} />
                </div>
                <h4 className="home-philosophy-point__title">Building Confidence</h4>
                <p className="home-philosophy-point__text">
                  Transforming hesitation into self-reliance through incremental mastery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. PROGRAMS SECTION
          ==================================================================== */}
      <section
        id="programs-section"
        className="home-section home-section--subtle"
        aria-labelledby="programs-heading"
      >
        <div className="container">
          <SectionTitle
            eyebrow="Academic Offerings"
            heading="Programs Designed for Every Stage"
            description="Focused curriculum pathways structured to guide learners from middle-school fundamentals to board excellence and competitive readiness."
            align="center"
          />

          <div className="home-programs-grid">
            {/* Program 1 */}
            <Card
              title="EXPLORERS"
              subtitle="Classes 6 – 8"
              icon={<Compass size={22} />}
              interactive
              footer={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction('program', 'Explorers (Classes 6-8)')}
                >
                  Explore Program &rarr;
                </Button>
              }
            >
              <div className="program-card-content">
                <p className="program-card-desc">
                  Cultivating mathematical curiosity and scientific investigation early. Focuses on
                  concept visualization and disciplined study habits.
                </p>
                <ul className="program-features-list">
                  <li className="program-features-item">
                    <CheckCircle2 size={14} color="var(--primary)" />
                    <span>Strong Academic Foundation</span>
                  </li>
                  <li className="program-features-item">
                    <CheckCircle2 size={14} color="var(--primary)" />
                    <span>Concept Clarity in Maths &amp; Science</span>
                  </li>
                  <li className="program-features-item">
                    <CheckCircle2 size={14} color="var(--primary)" />
                    <span>Problem Solving &amp; Logical Reasoning</span>
                  </li>
                  <li className="program-features-item">
                    <CheckCircle2 size={14} color="var(--primary)" />
                    <span>Independent Learning Habits</span>
                  </li>
                </ul>
              </div>
            </Card>

            {/* Program 2 */}
            <Card
              title="ACHIEVERS"
              subtitle="Classes 9 – 10"
              icon={<Award size={22} />}
              interactive
              footer={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAction('program', 'Achievers (Classes 9-10)')}
                >
                  Explore Program &rarr;
                </Button>
              }
            >
              <div className="program-card-content">
                <p className="program-card-desc">
                  Thorough syllabus coverage with rigorous board-exam alignment. Regular chapter
                  assessments ensure students excel with poise.
                </p>
                <ul className="program-features-list">
                  <li className="program-features-item">
                    <CheckCircle2 size={14} color="var(--primary)" />
                    <span>Strong Conceptual Understanding</span>
                  </li>
                  <li className="program-features-item">
                    <CheckCircle2 size={14} color="var(--primary)" />
                    <span>Board-Oriented Preparation</span>
                  </li>
                  <li className="program-features-item">
                    <CheckCircle2 size={14} color="var(--primary)" />
                    <span>Mathematics &amp; Science Mastery</span>
                  </li>
                  <li className="program-features-item">
                    <CheckCircle2 size={14} color="var(--primary)" />
                    <span>Regular Testing &amp; Exam Readiness</span>
                  </li>
                </ul>
              </div>
            </Card>

            {/* Program 3 */}
            <Card
              title="FOUNDATION"
              subtitle="Early JEE / NEET Prep"
              icon={<GraduationCap size={22} />}
              interactive
              footer={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction('program', 'Foundation (JEE/NEET)')}
                >
                  Explore Program &rarr;
                </Button>
              }
            >
              <div className="program-card-content">
                <p className="program-card-desc">
                  Advanced problem-solving techniques for ambitious students aspiring for engineering
                  and medical entrance milestones.
                </p>
                <ul className="program-features-list">
                  <li className="program-features-item">
                    <CheckCircle2 size={14} color="var(--primary)" />
                    <span>Strong Fundamentals in Physics &amp; Chemistry</span>
                  </li>
                  <li className="program-features-item">
                    <CheckCircle2 size={14} color="var(--primary)" />
                    <span>Advanced Mathematics &amp; Biology</span>
                  </li>
                  <li className="program-features-item">
                    <CheckCircle2 size={14} color="var(--primary)" />
                    <span>Higher-Order Thinking Skills (HOTS)</span>
                  </li>
                  <li className="program-features-item">
                    <CheckCircle2 size={14} color="var(--primary)" />
                    <span>Structured Foundation Pathways</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. HOW LEARNING WORKS (6-Step Cycle)
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="cycle-heading">
        <div className="container">
          <SectionTitle
            eyebrow="The MS Tutorials Method"
            heading="How Learning Works"
            description="Understand. Practice. Improve. Grow. A transparent, evidence-based pedagogical cycle designed to turn confusion into mastery."
            align="center"
          />

          <div className="home-cycle-grid">
            <div className="home-cycle-card">
              <span className="home-cycle-number">Step 01</span>
              <h3 className="home-cycle-title">Diagnose</h3>
              <p className="home-cycle-desc">
                Understand where the student currently stands before introducing new topics.
              </p>
            </div>

            <div className="home-cycle-card">
              <span className="home-cycle-number">Step 02</span>
              <h3 className="home-cycle-title">Understand</h3>
              <p className="home-cycle-desc">
                Build rock-solid conceptual clarity before advancing to problem-solving.
              </p>
            </div>

            <div className="home-cycle-card">
              <span className="home-cycle-number">Step 03</span>
              <h3 className="home-cycle-title">Practice</h3>
              <p className="home-cycle-desc">
                Apply concepts through guided classroom exercises and independent worksheets.
              </p>
            </div>

            <div className="home-cycle-card">
              <span className="home-cycle-number">Step 04</span>
              <h3 className="home-cycle-title">Assess</h3>
              <p className="home-cycle-desc">
                Use regular, low-stakes assessments to measure genuine topic comprehension.
              </p>
            </div>

            <div className="home-cycle-card">
              <span className="home-cycle-number">Step 05</span>
              <h3 className="home-cycle-title">Identify Gaps</h3>
              <p className="home-cycle-desc">
                Pinpoint exact topics, formulas, or problem types requiring closer attention.
              </p>
            </div>

            <div className="home-cycle-card">
              <span className="home-cycle-number">Step 06</span>
              <h3 className="home-cycle-title">Improve &amp; Revise</h3>
              <p className="home-cycle-desc">
                Strengthen weak areas through targeted revision worksheets and mentor feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. PERSONALIZED LEARNING
          ==================================================================== */}
      <section className="home-section home-section--tinted" aria-labelledby="personalized-heading">
        <div className="container">
          <div className="home-philosophy__grid">
            <div>
              <SectionTitle
                eyebrow="Targeted Academic Growth"
                heading="Learning That Adapts to the Student"
                description="Every student does not learn at the same pace or in the same way. We believe instruction should adapt to student needs rather than forcing students into rigid molds."
                align="left"
              />
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-base)', lineHeight: varLineHeight(), marginBottom: 'var(--space-6)' }}>
                Our teaching approach continuously tracks topic-by-topic comprehension. When a student
                encounters friction in quadratic equations or ray optics, our mentors immediately
                introduce targeted revision sets without waiting for term exams.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleAction('diagnostic', 'Personalized Section')}
              >
                Experience Diagnostic Learning
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ backgroundColor: 'var(--white)', border: '1px solid #D1EBE7', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--light-teal)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Compass size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--navy)' }}>Diagnostic Assessment</h4>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Identifies concept gaps before they compound into exam anxiety.</p>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--white)', border: '1px solid #D1EBE7', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--light-teal)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--navy)' }}>Strength &amp; Weakness Detection</h4>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Clear classification of mastered topics versus areas needing practice.</p>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--white)', border: '1px solid #D1EBE7', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--light-teal)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--navy)' }}>Targeted Practice &amp; Revision</h4>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Curated exercises dedicated specifically to strengthening weak concepts.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. DIGITAL LEARNING ECOSYSTEM
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="digital-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Ecosystem &amp; Resources"
            heading="Learning Continues Beyond the Classroom"
            description="Our classroom instruction is reinforced with organized study materials and digital practice resources to support students whenever they study."
            align="center"
          />

          <div className="home-resources-grid">
            <div className="home-resource-tile">
              <div className="home-resource-tile__icon">
                <BookOpen size={20} />
              </div>
              <h3 className="home-resource-tile__title">Study Material</h3>
              <p className="home-resource-tile__text">
                Concise, high-clarity notes written to emphasize core mathematical principles and scientific mechanisms.
              </p>
            </div>

            <div className="home-resource-tile">
              <div className="home-resource-tile__icon">
                <FileText size={20} />
              </div>
              <h3 className="home-resource-tile__title">Worksheets</h3>
              <p className="home-resource-tile__text">
                Graded practice sheets progressing from direct formulas to complex multi-step application questions.
              </p>
            </div>

            <div className="home-resource-tile">
              <div className="home-resource-tile__icon">
                <Sparkles size={20} />
              </div>
              <h3 className="home-resource-tile__title">Important Questions</h3>
              <p className="home-resource-tile__text">
                Curated question banks reflecting recurring exam patterns and conceptual question varieties.
              </p>
            </div>

            <div className="home-resource-tile">
              <div className="home-resource-tile__icon">
                <Video size={20} />
              </div>
              <h3 className="home-resource-tile__title">Explanation Videos</h3>
              <p className="home-resource-tile__text">
                Walkthroughs breaking down difficult derivations and problem-solving steps.
              </p>
            </div>

            <div className="home-resource-tile">
              <div className="home-resource-tile__icon">
                <ClipboardList size={20} />
              </div>
              <h3 className="home-resource-tile__title">Tests</h3>
              <p className="home-resource-tile__text">
                Weekly chapter assessments ensuring continuous retention and timely error correction.
              </p>
            </div>

            <div className="home-resource-tile">
              <div className="home-resource-tile__icon">
                <BarChart3 size={20} />
              </div>
              <h3 className="home-resource-tile__title">Progress Tracking</h3>
              <p className="home-resource-tile__text">
                Transparent view of marks, chapter completion, and test attendance history.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
            <Button
              variant="outline"
              size="md"
              onClick={() => handleRoute('/resources')}
            >
              Explore Resources &rarr;
            </Button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          8. ASSESSMENT / PROGRESS SECTION
          ==================================================================== */}
      <section className="home-section home-section--white" style={{ paddingTop: 0 }} aria-labelledby="assessment-heading">
        <div className="container">
          <div className="home-assessment-banner">
            <div>
              <Badge variant="primary" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'var(--white)', borderColor: 'rgba(255,255,255,0.25)', marginBottom: 'var(--space-3)' }}>
                Assessment Engine
              </Badge>
              <h2 id="assessment-heading" style={{ color: 'var(--white)', fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-3)' }}>
                Know Where You Stand
              </h2>
              <p>
                Regular tests are not meant to create stress—they are diagnostic mirrors.
                By evaluating chapter-by-chapter understanding, we eliminate surprises before
                final examinations.
              </p>
              <Button
                variant="primary"
                size="lg"
                style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
                onClick={() => handleAction('diagnostic', 'Assessment Banner')}
              >
                Take a Diagnostic Test
              </Button>
            </div>

            <div className="home-assessment-features">
              <div className="home-assessment-feature-item">
                <CheckCircle2 size={16} color="var(--gold)" />
                <span>Chapter-Level Practice</span>
              </div>
              <div className="home-assessment-feature-item">
                <CheckCircle2 size={16} color="var(--gold)" />
                <span>Immediate Feedback</span>
              </div>
              <div className="home-assessment-feature-item">
                <CheckCircle2 size={16} color="var(--gold)" />
                <span>Identify Strengths &amp; Gaps</span>
              </div>
              <div className="home-assessment-feature-item">
                <CheckCircle2 size={16} color="var(--gold)" />
                <span>Structured Revision Loop</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          9. WHY MS TUTORIALS
          ==================================================================== */}
      <section className="home-section home-section--subtle" aria-labelledby="why-heading">
        <div className="container">
          <SectionTitle
            eyebrow="The Institutional Difference"
            heading="Why MS Tutorials?"
            description="Our academic philosophy is built on high expectations, patient mentorship, and transparent pedagogical metrics."
            align="center"
          />

          <div className="home-why-grid">
            <div className="home-why-card">
              <h4>Concept-Based Learning</h4>
              <p>We deconstruct formulas to reveal foundational reasoning, making science and mathematics intuitive.</p>
            </div>

            <div className="home-why-card">
              <h4>Small Batches</h4>
              <p>Focused groups ensure every student can ask questions comfortably without being lost in a crowd.</p>
            </div>

            <div className="home-why-card">
              <h4>Personalized Attention</h4>
              <p>Mentors monitor student problem-solving steps in real time to correct method errors early.</p>
            </div>

            <div className="home-why-card">
              <h4>Continuous Assessment</h4>
              <p>Periodic chapter tests provide consistent measurement of understanding and retention.</p>
            </div>

            <div className="home-why-card">
              <h4>Structured Revision</h4>
              <p>Scheduled re-tests and revisit sessions ensure learned concepts remain fresh throughout the year.</p>
            </div>

            <div className="home-why-card">
              <h4>Maths &amp; Science Focus</h4>
              <p>Dedicated specialization in science and mathematical streams ensures deep curriculum expertise.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          10. STUDENT / PARENT DIGITAL ACCESS
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="portals-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Digital Portal Gateways"
            heading="Dedicated Portals for Students &amp; Parents"
            description="Clear separation of roles ensuring students have focused study resources while parents stay informed about academic milestones."
            align="center"
          />

          <div className="home-portals-grid">
            <div className="portal-entry-card portal-entry-card--student">
              <Badge variant="primary" icon={<GraduationCap size={14} />}>Student Gateway</Badge>
              <h3 className="portal-entry-card__title">For Students</h3>
              <p className="portal-entry-card__desc">
                Access your learning resources, assignments, tests, and progress in one place.
                Submit exercises and review chapter performance feedback.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)' }}>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleRoute('/student/login')}
                >
                  Student Login &rarr;
                </Button>
              </div>
            </div>

            <div className="portal-entry-card portal-entry-card--parent">
              <Badge variant="warning" icon={<ShieldCheck size={14} />}>Parent Gateway</Badge>
              <h3 className="portal-entry-card__title">For Parents</h3>
              <p className="portal-entry-card__desc">
                Stay connected with your child's academic progress, attendance, performance,
                and learning journey with total transparency.
              </p>
              <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)' }}>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => handleRoute('/parent/login')}
                >
                  Parent Login &rarr;
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          11. FINAL CTA
          ==================================================================== */}
      <section className="home-final-cta" aria-labelledby="final-cta-heading">
        <div className="container home-final-cta__content">
          <p className="home-final-cta__sub">Building Strong Foundations in Maths &amp; Science</p>
          <h2 id="final-cta-heading" className="home-final-cta__heading">
            Build the Foundation Today.
          </h2>
          <p className="home-final-cta__text">
            Strong concepts create confident learners. Give your child the clarity and guidance
            needed to excel academically.
          </p>

          <div className="home-final-cta__actions">
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleAction('enroll', 'Final CTA Primary')}
            >
              Join MS Tutorials
            </Button>
            <Button
              variant="outline"
              size="lg"
              style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.4)' }}
              onClick={() => handleAction('mentor', 'Final CTA Secondary')}
            >
              Talk to a Mentor
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function varLineHeight() {
  return 'var(--line-height-relaxed)';
}
