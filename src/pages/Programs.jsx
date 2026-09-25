import React, { useState, useEffect } from 'react';
import SectionTitle from '../components/SectionTitle.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import {
  Compass,
  Award,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  ClipboardList,
  BarChart3,
  TrendingUp,
  Brain,
  Layers,
  ArrowRight,
} from 'lucide-react';
import '../styles/programs.css';

/**
 * MS Tutorials Programs Page Component (Phase 4.3)
 * 
 * @param {Object} props
 * @param {Function} props.onOpenInquiry - Opens the enrollment / diagnostic modal
 * @param {Function} props.onNavigate - Navigation handler
 */
export default function Programs({ onOpenInquiry, onNavigate }) {
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    document.title = 'Programs | MS Tutorials';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAction = (type, metadata = '') => {
    if (onOpenInquiry) {
      onOpenInquiry({ type, metadata });
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'Which classes does MS Tutorials support?',
      a: 'MS Tutorials primarily supports students from Class 6 through Class 10 with dedicated programs (Explorers for Classes 6–8, and Achievers for Classes 9–10), alongside early foundation pathways for senior secondary entrance preparation.',
    },
    {
      q: 'Which subjects are taught?',
      a: 'We specialize strictly in Mathematics and Science (including Physics, Chemistry, and Biology fundamentals). This deep domain focus ensures experienced instruction and comprehensive curriculum coverage.',
    },
    {
      q: 'What is the difference between Explorers and Achievers?',
      a: 'Explorers (Classes 6–8) focuses on building curiosity, arithmetic confidence, and core conceptual foundations before syllabus difficulty increases. Achievers (Classes 9–10) is structured around deeper conceptual derivation, board-aligned preparation, and frequent chapter testing.',
    },
    {
      q: 'Is Foundation suitable for early JEE/NEET preparation?',
      a: 'Yes. The Foundation pathway is designed as an early preparation program that introduces higher-order thinking skills (HOTS), advanced problem solving, and analytical reasoning in Physics, Chemistry, and Mathematics.',
    },
    {
      q: 'What if a student has gaps in basic Mathematics?',
      a: 'We offer a specialized Remedial Mathematics module designed to identify and rebuild essential skills (such as arithmetic operations, fractions, decimals, LCM/HCF, and linear equations) without judgment, restoring the student’s academic confidence.',
    },
    {
      q: 'How are students assessed?',
      a: 'Students undergo regular chapter-level diagnostic tests designed to reveal specific learning gaps rather than simply assign marks. Test results guide targeted practice worksheets and structured revision loops.',
    },
  ];

  return (
    <div className="programs-page">
      {/* ====================================================================
          1. HERO SECTION
          ==================================================================== */}
      <section className="programs-hero" aria-labelledby="programs-hero-heading">
        <div className="container programs-hero__grid">
          <div>
            <Badge variant="primary" icon={<Sparkles size={13} />} style={{ marginBottom: 'var(--space-3)' }}>
              Structured Learning Pathways
            </Badge>

            <h1 id="programs-hero-heading" className="programs-hero__title">
              Programs Built Around<br />
              <span>Strong Foundations.</span>
            </h1>

            <p className="programs-hero__description">
              From building core concepts in middle school to strengthening academic
              preparation in Classes 9–10 and beyond, MS Tutorials provides structured
              Mathematics and Science learning pathways.
            </p>

            <div className="programs-hero__actions">
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleAction('enroll', 'Programs Hero')}
              >
                Join MS Tutorials
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleAction('diagnostic', 'Programs Hero Diagnostic')}
              >
                Take a Diagnostic Test
              </Button>
            </div>
          </div>

          {/* Academic Illustration Blueprint */}
          <div className="home-hero__visual" aria-hidden="true">
            <div className="hero-visual-card">
              <div className="hero-visual-header">
                <div className="hero-visual-dots">
                  <span className="hero-visual-dot hero-visual-dot--primary"></span>
                  <span className="hero-visual-dot hero-visual-dot--gold"></span>
                  <span className="hero-visual-dot hero-visual-dot--navy"></span>
                </div>
                <Badge variant="neutral">Curriculum Roadmap</Badge>
              </div>

              <div className="hero-concept-matrix">
                <div className="hero-concept-box hero-concept-box--active">
                  <span className="hero-concept-label">Classes 6–8</span>
                  <span className="hero-concept-val">Explorers</span>
                </div>
                <div className="hero-concept-box hero-concept-box--active">
                  <span className="hero-concept-label">Classes 9–10</span>
                  <span className="hero-concept-val">Achievers</span>
                </div>
                <div className="hero-concept-box">
                  <span className="hero-concept-label">Early JEE/NEET</span>
                  <span className="hero-concept-val">Foundation</span>
                </div>
                <div className="hero-concept-box">
                  <span className="hero-concept-label">Gap Recovery</span>
                  <span className="hero-concept-val">Remedial Maths</span>
                </div>
              </div>

              <div className="hero-diagnostic-preview">
                <div>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Pathways Overview
                  </p>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                    Tailored to Student Grade &amp; Readiness
                  </p>
                </div>
                <Badge variant="success">Enrolling</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. PROGRAM OVERVIEW (3 Primary Cards)
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="overview-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Academic Offerings"
            heading="Programs Designed for Every Stage"
            description="Clear pathways structured around student developmental stages, emphasizing conceptual mastery over rote cramming."
            align="center"
          />

          <div className="programs-cards-grid">
            {/* Card 1: EXPLORERS */}
            <div className="program-detail-card program-detail-card--explorers">
              <div className="program-detail-card__header">
                <span className="program-detail-card__tag">Classes 6 – 8</span>
                <h3 className="program-detail-card__title">EXPLORERS</h3>
                <p className="program-detail-card__positioning">
                  &ldquo;Build the foundation before the difficulty increases.&rdquo;
                </p>
                <p className="program-detail-card__desc">
                  The objective is to make students comfortable with fundamental concepts,
                  eliminate arithmetic hesitation, and develop disciplined academic habits.
                </p>
              </div>

              <p className="program-detail-card__focus-title">Key Focus Areas</p>
              <ul className="program-detail-card__focus-list">
                <li className="program-detail-card__focus-item">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Mathematics</span>
                </li>
                <li className="program-detail-card__focus-item">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Science</span>
                </li>
                <li className="program-detail-card__focus-item">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Concept Clarity</span>
                </li>
                <li className="program-detail-card__focus-item">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Fundamental Skills</span>
                </li>
                <li className="program-detail-card__focus-item">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Logical Reasoning</span>
                </li>
                <li className="program-detail-card__focus-item">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Learning Habits</span>
                </li>
              </ul>

              <div className="program-detail-card__action">
                <Button
                  variant="outline"
                  size="md"
                  style={{ width: '100%' }}
                  onClick={() => handleAction('program', 'Explorers (Classes 6-8)')}
                >
                  Explore Explorers &rarr;
                </Button>
              </div>
            </div>

            {/* Card 2: ACHIEVERS */}
            <div className="program-detail-card program-detail-card--achievers">
              <div className="program-detail-card__header">
                <span className="program-detail-card__tag" style={{ color: 'var(--navy)' }}>Classes 9 – 10</span>
                <h3 className="program-detail-card__title">ACHIEVERS</h3>
                <p className="program-detail-card__positioning">
                  &ldquo;Strengthen concepts. Practice systematically. Prepare with confidence.&rdquo;
                </p>
                <p className="program-detail-card__desc">
                  Rigorous board-aligned preparation. Focuses on in-depth derivations,
                  application questions, and regular chapter assessments to build complete exam poise.
                </p>
              </div>

              <p className="program-detail-card__focus-title">Key Focus Areas</p>
              <ul className="program-detail-card__focus-list">
                <li className="program-detail-card__focus-item">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Mathematics</span>
                </li>
                <li className="program-detail-card__focus-item">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Science</span>
                </li>
                <li className="program-detail-card__focus-item">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Conceptual Depth</span>
                </li>
                <li className="program-detail-card__focus-item">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Application Questions</span>
                </li>
                <li className="program-detail-card__focus-item">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Regular Assessments</span>
                </li>
                <li className="program-detail-card__focus-item">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Structured Revision</span>
                </li>
              </ul>

              <div className="program-detail-card__action">
                <Button
                  variant="primary"
                  size="md"
                  style={{ width: '100%' }}
                  onClick={() => handleAction('program', 'Achievers (Classes 9-10)')}
                >
                  Explore Achievers &rarr;
                </Button>
              </div>
            </div>

            {/* Card 3: FOUNDATION */}
            <div className="program-detail-card program-detail-card--foundation">
              <div className="program-detail-card__header">
                <span className="program-detail-card__tag" style={{ color: 'var(--gold)' }}>Early JEE / NEET Prep</span>
                <h3 className="program-detail-card__title">FOUNDATION</h3>
                <p className="program-detail-card__positioning">
                  &ldquo;Build higher-level thinking on strong academic foundations.&rdquo;
                </p>
                <p className="program-detail-card__desc">
                  An early competitive orientation program designed to nurture analytical
                  aptitude and higher-order thinking skills (HOTS) across the core sciences.
                </p>
              </div>

              <p className="program-detail-card__focus-title">Key Focus Areas</p>
              <ul className="program-detail-card__focus-list">
                <li className="program-detail-card__focus-item">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Physics &amp; Chemistry</span>
                </li>
                <li className="program-detail-card__focus-item">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Advanced Maths</span>
                </li>
                <li className="program-detail-card__focus-item">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Biology Fundamentals</span>
                </li>
                <li className="program-detail-card__focus-item">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Higher-Order Thinking</span>
                </li>
                <li className="program-detail-card__focus-item">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Problem Solving</span>
                </li>
                <li className="program-detail-card__focus-item">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Competitive Readiness</span>
                </li>
              </ul>

              <div className="program-detail-card__action">
                <Button
                  variant="outline"
                  size="md"
                  style={{ width: '100%' }}
                  onClick={() => handleAction('program', 'Foundation (JEE/NEET Prep)')}
                >
                  Explore Foundation &rarr;
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. REMEDIAL MATHEMATICS
          ==================================================================== */}
      <section className="home-section home-section--subtle" aria-labelledby="remedial-heading">
        <div className="container">
          <div className="remedial-card">
            <div>
              <Badge variant="warning" style={{ marginBottom: 'var(--space-3)' }}>
                Gap Recovery Pathway
              </Badge>
              <h2 id="remedial-heading" className="remedial-card__title">
                Need to Strengthen the Basics?
              </h2>
              <p className="remedial-card__desc">
                Many students struggle with grade-level mathematics simply because of missing
                foundational steps from earlier years. Our Remedial Mathematics pathway offers
                a patient, non-judgmental environment to rebuild essential numerical skills.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleAction('mentor', 'Remedial Mathematics Section')}
              >
                Discuss Learning Needs &rarr;
              </Button>
            </div>

            <div className="remedial-topics-matrix">
              <h4>Essential Skills We Rebuild</h4>
              <div className="remedial-tags-list">
                <span className="remedial-tag">Addition &amp; Subtraction Fluency</span>
                <span className="remedial-tag">Multiplication &amp; Tables</span>
                <span className="remedial-tag">Fractions &amp; Operations</span>
                <span className="remedial-tag">Decimals &amp; Percentages</span>
                <span className="remedial-tag">LCM &amp; HCF Concepts</span>
                <span className="remedial-tag">Square Roots &amp; Powers</span>
                <span className="remedial-tag">Basic Linear Equations</span>
              </div>
              <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                Rebuilding arithmetic fluency prepares students to confidently handle syllabus topics without fear.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. WHO IS EACH PROGRAM FOR? (Comparison Section)
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="comparison-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Program Comparison"
            heading="Who Is Each Program For?"
            description="Find the pathway that aligns with your child's current grade level and educational goals."
            align="center"
          />

          {/* Desktop Comparison Table */}
          <div className="programs-table-wrapper">
            <table className="programs-table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Classes</th>
                  <th>Primary Focus</th>
                  <th>Learning Goal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Explorers</strong>
                  </td>
                  <td>Classes 6 – 8</td>
                  <td>Foundation + Concept Clarity</td>
                  <td>Build a strong academic base &amp; study habits</td>
                </tr>
                <tr>
                  <td>
                    <strong>Achievers</strong>
                  </td>
                  <td>Classes 9 – 10</td>
                  <td>Concepts + Practice + Assessment</td>
                  <td>Comprehensive board &amp; academic exam preparation</td>
                </tr>
                <tr>
                  <td>
                    <strong>Foundation</strong>
                  </td>
                  <td>Early JEE / NEET</td>
                  <td>Higher-level fundamentals</td>
                  <td>Analytical aptitude &amp; competitive foundation</td>
                </tr>
                <tr>
                  <td>
                    <strong>Remedial Maths</strong>
                  </td>
                  <td>As needed</td>
                  <td>Foundational gap recovery</td>
                  <td>Rebuild essential arithmetic &amp; problem-solving skills</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card Fallback */}
          <div className="programs-table-mobile">
            <div className="programs-mobile-card">
              <h4 style={{ color: 'var(--navy)', marginBottom: 'var(--space-2)' }}>Explorers</h4>
              <div className="programs-mobile-row">
                <span style={{ color: 'var(--text-muted)' }}>Classes:</span>
                <strong>Classes 6 – 8</strong>
              </div>
              <div className="programs-mobile-row">
                <span style={{ color: 'var(--text-muted)' }}>Primary Focus:</span>
                <span>Foundation + Concept Clarity</span>
              </div>
              <div className="programs-mobile-row">
                <span style={{ color: 'var(--text-muted)' }}>Learning Goal:</span>
                <span>Strong academic base</span>
              </div>
            </div>

            <div className="programs-mobile-card">
              <h4 style={{ color: 'var(--navy)', marginBottom: 'var(--space-2)' }}>Achievers</h4>
              <div className="programs-mobile-row">
                <span style={{ color: 'var(--text-muted)' }}>Classes:</span>
                <strong>Classes 9 – 10</strong>
              </div>
              <div className="programs-mobile-row">
                <span style={{ color: 'var(--text-muted)' }}>Primary Focus:</span>
                <span>Concepts + Practice + Assessment</span>
              </div>
              <div className="programs-mobile-row">
                <span style={{ color: 'var(--text-muted)' }}>Learning Goal:</span>
                <span>Academic &amp; exam preparation</span>
              </div>
            </div>

            <div className="programs-mobile-card">
              <h4 style={{ color: 'var(--navy)', marginBottom: 'var(--space-2)' }}>Foundation</h4>
              <div className="programs-mobile-row">
                <span style={{ color: 'var(--text-muted)' }}>Classes:</span>
                <strong>Early JEE / NEET</strong>
              </div>
              <div className="programs-mobile-row">
                <span style={{ color: 'var(--text-muted)' }}>Primary Focus:</span>
                <span>Higher-level fundamentals</span>
              </div>
              <div className="programs-mobile-row">
                <span style={{ color: 'var(--text-muted)' }}>Learning Goal:</span>
                <span>Competitive exam foundation</span>
              </div>
            </div>

            <div className="programs-mobile-card">
              <h4 style={{ color: 'var(--navy)', marginBottom: 'var(--space-2)' }}>Remedial Mathematics</h4>
              <div className="programs-mobile-row">
                <span style={{ color: 'var(--text-muted)' }}>Classes:</span>
                <strong>As needed</strong>
              </div>
              <div className="programs-mobile-row">
                <span style={{ color: 'var(--text-muted)' }}>Primary Focus:</span>
                <span>Foundational gap recovery</span>
              </div>
              <div className="programs-mobile-row">
                <span style={{ color: 'var(--text-muted)' }}>Learning Goal:</span>
                <span>Rebuild essential skills</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. WHAT STUDENTS EXPERIENCE
          ==================================================================== */}
      <section className="home-section home-section--subtle" aria-labelledby="experience-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Pedagogical Cycle"
            heading="More Than a Syllabus"
            description="Students experience an active learning process rather than just passive chapter coverage."
            align="center"
          />

          <div className="about-cycle-timeline">
            <div className="about-cycle-step">
              <span className="about-cycle-step__num">01</span>
              <h3 className="about-cycle-step__title">Diagnose</h3>
              <p className="about-cycle-step__text">Identify baseline concept readiness before new topics.</p>
            </div>

            <div className="about-cycle-step">
              <span className="about-cycle-step__num">02</span>
              <h3 className="about-cycle-step__title">Understand</h3>
              <p className="about-cycle-step__text">Deconstruct formulas into intuitive, first-principles logic.</p>
            </div>

            <div className="about-cycle-step">
              <span className="about-cycle-step__num">03</span>
              <h3 className="about-cycle-step__title">Practice</h3>
              <p className="about-cycle-step__text">Guided problem solving through structured worksheets.</p>
            </div>

            <div className="about-cycle-step">
              <span className="about-cycle-step__num">04</span>
              <h3 className="about-cycle-step__title">Assess</h3>
              <p className="about-cycle-step__text">Chapter evaluations to verify genuine understanding.</p>
            </div>

            <div className="about-cycle-step">
              <span className="about-cycle-step__num">05</span>
              <h3 className="about-cycle-step__title">Identify Gaps</h3>
              <p className="about-cycle-step__text">Detect specific misconceptions before they turn into habits.</p>
            </div>

            <div className="about-cycle-step">
              <span className="about-cycle-step__num">06</span>
              <h3 className="about-cycle-step__title">Improve &amp; Revise</h3>
              <p className="about-cycle-step__text">Close gaps with targeted revision and mentor support.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. WHAT STUDENTS GET
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="resources-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Learning Ecosystem"
            heading="What Students Receive"
            description="Comprehensive support materials and structured learning resources designed to reinforce classroom instruction."
            align="center"
          />

          <div className="home-resources-grid">
            <div className="home-resource-tile">
              <div className="home-resource-tile__icon">
                <Brain size={20} />
              </div>
              <h3 className="home-resource-tile__title">Concept-Focused Teaching</h3>
              <p className="home-resource-tile__text">Interactive classroom sessions prioritizing conceptual intuition.</p>
            </div>

            <div className="home-resource-tile">
              <div className="home-resource-tile__icon">
                <FileText size={20} />
              </div>
              <h3 className="home-resource-tile__title">Graded Worksheets</h3>
              <p className="home-resource-tile__text">Carefully calibrated problems advancing from foundational to complex.</p>
            </div>

            <div className="home-resource-tile">
              <div className="home-resource-tile__icon">
                <HelpCircle size={20} />
              </div>
              <h3 className="home-resource-tile__title">Important Questions</h3>
              <p className="home-resource-tile__text">Curated problem sets reflecting crucial academic exam formats.</p>
            </div>

            <div className="home-resource-tile">
              <div className="home-resource-tile__icon">
                <Video size={20} />
              </div>
              <h3 className="home-resource-tile__title">Explanation Videos</h3>
              <p className="home-resource-tile__text">Step-by-step video explanations of challenging problems.</p>
            </div>

            <div className="home-resource-tile">
              <div className="home-resource-tile__icon">
                <ClipboardList size={20} />
              </div>
              <h3 className="home-resource-tile__title">Regular Tests</h3>
              <p className="home-resource-tile__text">Weekly chapter assessments providing diagnostic feedback.</p>
            </div>

            <div className="home-resource-tile">
              <div className="home-resource-tile__icon">
                <Layers size={20} />
              </div>
              <h3 className="home-resource-tile__title">Structured Revision</h3>
              <p className="home-resource-tile__text">Planned revisits ensuring mastered concepts remain sharp.</p>
            </div>

            <div className="home-resource-tile">
              <div className="home-resource-tile__icon">
                <BarChart3 size={20} />
              </div>
              <h3 className="home-resource-tile__title">Progress Tracking</h3>
              <p className="home-resource-tile__text">Clear records of test marks, attendance, and learning milestones.</p>
            </div>

            <div className="home-resource-tile">
              <div className="home-resource-tile__icon">
                <TrendingUp size={20} />
              </div>
              <h3 className="home-resource-tile__title">Personalized Support</h3>
              <p className="home-resource-tile__text">Individual attention from mentors calibrated to student pace.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. CHOOSING THE RIGHT PATH
          ==================================================================== */}
      <section className="home-section home-section--tinted" aria-labelledby="choice-heading">
        <div className="container">
          <div className="programs-choice-banner">
            <Badge variant="primary" style={{ marginBottom: 'var(--space-3)' }}>
              Guidance &amp; Advice
            </Badge>
            <h3 id="choice-heading">Not Sure Which Program Fits?</h3>
            <p>
              Every student starts from a different point. A short diagnostic conversation
              or assessment can help identify the appropriate starting point.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                size="md"
                onClick={() => handleAction('diagnostic', 'Programs Choice Banner')}
              >
                Take a Diagnostic Test
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => handleAction('mentor', 'Programs Choice Banner')}
              >
                Talk to a Mentor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          8. FAQ SECTION (Accessible Accordion)
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="faq-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Questions &amp; Answers"
            heading="Frequently Asked Questions"
            description="Find answers to common questions about our programs, teaching approach, and admissions."
            align="center"
          />

          <div className="programs-faq-container">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              const buttonId = `faq-btn-${idx}`;
              const panelId = `faq-panel-${idx}`;

              return (
                <div key={idx} className={`faq-item ${isOpen ? 'is-open' : ''}`}>
                  <button
                    id={buttonId}
                    type="button"
                    className="faq-button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleFaq(idx)}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={20} className="faq-icon" aria-hidden="true" />
                  </button>

                  {isOpen && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className="faq-content"
                    >
                      <p style={{ margin: 0 }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          9. FINAL CTA
          ==================================================================== */}
      <section className="home-final-cta" aria-labelledby="programs-final-heading">
        <div className="container home-final-cta__content">
          <p className="home-final-cta__sub">Find Your Pathway</p>
          <h2 id="programs-final-heading" className="home-final-cta__heading">
            Find the Right Starting Point
          </h2>
          <p className="home-final-cta__text">
            Strong foundations begin with understanding where you are and knowing
            what to work on next.
          </p>

          <div className="home-final-cta__actions">
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleAction('enroll', 'Programs Final CTA')}
            >
              Join MS Tutorials
            </Button>
            <Button
              variant="outline"
              size="lg"
              style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.4)' }}
              onClick={() => handleAction('mentor', 'Programs Final CTA Secondary')}
            >
              Talk to a Mentor
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
