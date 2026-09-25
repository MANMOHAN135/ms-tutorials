import React, { useEffect } from 'react';
import SectionTitle from '../components/SectionTitle.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import {
  Compass,
  Brain,
  CheckCircle2,
  Sparkles,
  ClipboardList,
  Target,
  RefreshCw,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  BarChart3,
  Layers,
  UserCheck,
  GraduationCap,
  ShieldCheck,
  Users,
} from 'lucide-react';
import '../styles/learning-system.css';

/**
 * MS Tutorials Learning System Page Component (Phase 4.4)
 * 
 * @param {Object} props
 * @param {Function} props.onOpenInquiry - Opens the diagnostic / mentor modal
 * @param {Function} props.onNavigate - Navigation handler
 */
export default function LearningSystem({ onOpenInquiry, onNavigate }) {
  useEffect(() => {
    document.title = 'Learning System | MS Tutorials';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
    <div className="learning-system-page">
      {/* ====================================================================
          1. HERO SECTION
          ==================================================================== */}
      <section className="ls-hero" aria-labelledby="ls-hero-heading">
        <div className="container ls-hero__grid">
          <div>
            <Badge variant="primary" icon={<Sparkles size={13} />} style={{ marginBottom: 'var(--space-3)' }}>
              Pedagogical Framework
            </Badge>

            <h1 id="ls-hero-heading" className="ls-hero__title">
              Understand. Practice.<br />
              <span>Improve. Grow.</span>
            </h1>

            <p className="ls-hero__description">
              Our learning system is designed to help students understand where they are,
              strengthen what they don't know, and confidently move toward where they want to go.
            </p>

            <div className="ls-hero__actions">
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleAction('diagnostic', 'Learning System Hero')}
              >
                Take a Diagnostic Test
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleRoute('/programs')}
              >
                Explore Programs &rarr;
              </Button>
            </div>
          </div>

          {/* Educational Visual Process Card */}
          <div className="home-hero__visual" aria-hidden="true">
            <div className="hero-visual-card">
              <div className="hero-visual-header">
                <div className="hero-visual-dots">
                  <span className="hero-visual-dot hero-visual-dot--primary"></span>
                  <span className="hero-visual-dot hero-visual-dot--gold"></span>
                  <span className="hero-visual-dot hero-visual-dot--navy"></span>
                </div>
                <Badge variant="neutral">The 6-Step Cycle</Badge>
              </div>

              <div className="hero-concept-matrix">
                <div className="hero-concept-box hero-concept-box--active">
                  <span className="hero-concept-label">01 Diagnose</span>
                  <span className="hero-concept-val">Find Baseline</span>
                </div>
                <div className="hero-concept-box hero-concept-box--active">
                  <span className="hero-concept-label">02 Understand</span>
                  <span className="hero-concept-val">Concept Clarity</span>
                </div>
                <div className="hero-concept-box">
                  <span className="hero-concept-label">03 Practice</span>
                  <span className="hero-concept-val">Guided Sets</span>
                </div>
                <div className="hero-concept-box">
                  <span className="hero-concept-label">04 Assess</span>
                  <span className="hero-concept-val">Diagnostic Test</span>
                </div>
                <div className="hero-concept-box hero-concept-box--active">
                  <span className="hero-concept-label">05 Gaps</span>
                  <span className="hero-concept-val">Identify Needs</span>
                </div>
                <div className="hero-concept-box hero-concept-box--active">
                  <span className="hero-concept-label">06 Revise</span>
                  <span className="hero-concept-val">Targeted Fixes</span>
                </div>
              </div>

              <div className="hero-diagnostic-preview">
                <div>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Continuous Loop
                  </p>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                    Diagnose ➔ Master ➔ Reassess
                  </p>
                </div>
                <RotateCcw size={18} color="var(--primary)" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. THE CORE IDEA
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="core-idea-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Educational Perspective"
            heading="Learning Is a Process, Not Just a Syllabus"
            description="Completing a chapter in a textbook does not necessarily mean a student has mastered it. True academic capability develops through deliberate engagement, feedback, and targeted revision."
            align="center"
          />

          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-base)', lineHeight: '1.7' }}>
            <p style={{ marginBottom: 'var(--space-6)' }}>
              Conventional tuition often treats education like a race against the calendar—lecturing
              through chapters, assigning uniform homework, and administering tests only to generate marks.
              At MS Tutorials, we view learning as a dynamic feedback loop designed to verify comprehension
              at every step.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--space-2)' }}>
              <Badge variant="primary">Understanding</Badge>
              <Badge variant="primary">Applying</Badge>
              <Badge variant="primary">Practicing</Badge>
              <Badge variant="primary">Checking Understanding</Badge>
              <Badge variant="primary">Identifying Gaps</Badge>
              <Badge variant="primary">Revising</Badge>
              <Badge variant="primary">Improving</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. THE SIX-STEP LEARNING CYCLE (CENTERPIECE)
          ==================================================================== */}
      <section className="home-section home-section--subtle" aria-labelledby="cycle-centerpiece-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Core Methodology"
            heading="The MS Tutorials Learning Cycle"
            description="Six deliberate stages connecting diagnostic insight to lasting academic capability. The cycle repeats continuously as students encounter new chapters."
            align="center"
          />

          <div className="ls-cycle-container">
            {/* 01 — DIAGNOSE */}
            <div className="ls-cycle-card">
              <span className="ls-cycle-badge">Stage 01</span>
              <h3 className="ls-cycle-card__title">Diagnose</h3>
              <p className="ls-cycle-card__quote">&ldquo;Understand where the student currently stands.&rdquo;</p>
              <p className="ls-cycle-card__desc">
                Before introducing new theorems or scientific laws, diagnostic checks reveal existing
                foundation readiness and highlight topics needing prerequisite review.
              </p>
              <ul className="ls-cycle-card__points">
                <li className="ls-cycle-card__point">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Prerequisite skill readiness</span>
                </li>
                <li className="ls-cycle-card__point">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Misconception detection</span>
                </li>
              </ul>
            </div>

            {/* 02 — UNDERSTAND */}
            <div className="ls-cycle-card">
              <span className="ls-cycle-badge">Stage 02</span>
              <h3 className="ls-cycle-card__title">Understand</h3>
              <p className="ls-cycle-card__quote">&ldquo;Build conceptual clarity before moving ahead.&rdquo;</p>
              <p className="ls-cycle-card__desc">
                We deconstruct formulas into logical steps. Students examine real-world examples,
                ask questions, and understand why scientific mechanisms operate as they do.
              </p>
              <ul className="ls-cycle-card__points">
                <li className="ls-cycle-card__point">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>First-principles explanations</span>
                </li>
                <li className="ls-cycle-card__point">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Conceptual derivations &amp; reasoning</span>
                </li>
              </ul>
            </div>

            {/* 03 — PRACTICE */}
            <div className="ls-cycle-card">
              <span className="ls-cycle-badge">Stage 03</span>
              <h3 className="ls-cycle-card__title">Practice</h3>
              <p className="ls-cycle-card__quote">&ldquo;Turn understanding into ability.&rdquo;</p>
              <p className="ls-cycle-card__desc">
                Comprehension is cemented through action. Students progress from guided classroom
                examples to independent worksheets and multi-step application problems.
              </p>
              <ul className="ls-cycle-card__points">
                <li className="ls-cycle-card__point">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Graded worksheets</span>
                </li>
                <li className="ls-cycle-card__point">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Progressive difficulty scaling</span>
                </li>
              </ul>
            </div>

            {/* 04 — ASSESS */}
            <div className="ls-cycle-card">
              <span className="ls-cycle-badge">Stage 04</span>
              <h3 className="ls-cycle-card__title">Assess</h3>
              <p className="ls-cycle-card__quote">&ldquo;Check whether learning is actually happening.&rdquo;</p>
              <p className="ls-cycle-card__desc">
                Chapter assessments serve as diagnostic instruments rather than high-stakes hurdles.
                They evaluate whether a student can independently apply concepts under timed conditions.
              </p>
              <ul className="ls-cycle-card__points">
                <li className="ls-cycle-card__point">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Chapter-level evaluations</span>
                </li>
                <li className="ls-cycle-card__point">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Application-oriented testing</span>
                </li>
              </ul>
            </div>

            {/* 05 — IDENTIFY GAPS */}
            <div className="ls-cycle-card">
              <span className="ls-cycle-badge">Stage 05</span>
              <h3 className="ls-cycle-card__title">Identify Gaps</h3>
              <p className="ls-cycle-card__quote">&ldquo;Find the concepts that still need attention.&rdquo;</p>
              <p className="ls-cycle-card__desc">
                Assessment data is broken down by topic. Mentors and students identify precisely
                which formulas, calculation steps, or conceptual interpretations broke down.
              </p>
              <ul className="ls-cycle-card__points">
                <li className="ls-cycle-card__point">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Topic-by-topic gap detection</span>
                </li>
                <li className="ls-cycle-card__point">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Error pattern classification</span>
                </li>
              </ul>
            </div>

            {/* 06 — IMPROVE & REVISE */}
            <div className="ls-cycle-card">
              <span className="ls-cycle-badge">Stage 06</span>
              <h3 className="ls-cycle-card__title">Improve &amp; Revise</h3>
              <p className="ls-cycle-card__quote">&ldquo;Strengthen weak areas and revisit important concepts.&rdquo;</p>
              <p className="ls-cycle-card__desc">
                Armed with diagnostic insights, students complete targeted revision practice
                focused squarely on their deficit areas, converting confusion into lasting confidence.
              </p>
              <ul className="ls-cycle-card__points">
                <li className="ls-cycle-card__point">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Targeted revision worksheets</span>
                </li>
                <li className="ls-cycle-card__point">
                  <CheckCircle2 size={14} color="var(--primary)" />
                  <span>Mentor feedback &amp; re-assessment</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Continuous Loop Return Banner */}
          <div className="ls-cycle-return-banner">
            <RotateCcw size={20} color="var(--primary)" />
            <span>
              The cycle returns to <strong>Stage 01 (Diagnose)</strong> — learning continues seamlessly as students move into new chapters and academic milestones.
            </span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. CONCEPT-BASED LEARNING
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="concept-heading">
        <div className="container">
          <div className="home-philosophy__grid">
            <div>
              <SectionTitle
                eyebrow="Pedagogical Stance"
                heading="Understand Before You Memorize"
                description="Memorization has its place in education, but strong academic foundations begin with conceptual understanding."
                align="left"
              />
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-base)', lineHeight: '1.6', marginBottom: 'var(--space-6)' }}>
                When students memorize formulas without intuition, a slight twist in an exam question
                triggers panic. When they understand the underlying mechanism, problem solving becomes
                an exciting exercise in reasoning.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 3 }} />
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--navy)', fontWeight: 500 }}>
                    <strong>Why does this work?</strong> Deconstructing mathematical theorems from the ground up.
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 3 }} />
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--navy)', fontWeight: 500 }}>
                    <strong>How does this connect?</strong> Linking algebra to geometry, and physics to calculus.
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 3 }} />
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--navy)', fontWeight: 500 }}>
                    <strong>Can the student explain it?</strong> Verbalizing ideas proves true mastery.
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)' }}>
                <Badge variant="primary" style={{ marginBottom: 'var(--space-2)' }}>Mathematics Example</Badge>
                <h4 style={{ color: 'var(--navy)', fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-2)' }}>
                  Quadratic Roots &amp; Parabolic Trajectories
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                  Rather than merely memorizing the quadratic formula, students visualize the parabola crossing the x-axis, understanding how the discriminant controls the nature of the roots.
                </p>
              </div>

              <div style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)' }}>
                <Badge variant="primary" style={{ marginBottom: 'var(--space-2)' }}>Science Example</Badge>
                <h4 style={{ color: 'var(--navy)', fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-2)' }}>
                  Refraction &amp; Wave Mechanics
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                  Instead of memorizing Snell’s law as an abstract ratio, students understand that light changes speed when entering different optical densities, causing rays to bend intuitively.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. PERSONALIZED LEARNING
          ==================================================================== */}
      <section className="home-section home-section--tinted" aria-labelledby="personalized-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Individual Attention"
            heading="Every Student Starts From a Different Point"
            description="Students in the same classroom often have very different levels of prerequisite clarity. Our methodology adapts instruction to individual learning needs."
            align="center"
          />

          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-base)', lineHeight: '1.7' }}>
              MS Tutorials is designed around personalized support and progressively more individualized
              digital learning. By identifying specific stumbling blocks early, mentors ensure that no
              student is left behind or forced into a rigid, one-size-fits-all timeline.
            </p>
          </div>

          <div className="ls-pipeline">
            <div className="ls-pipeline-step">
              <span className="ls-pipeline-step__num">Step 01</span>
              <h4 className="ls-pipeline-step__title">Assess Baseline</h4>
              <p className="ls-pipeline-step__desc">Short diagnostic tasks identify prerequisite readiness.</p>
            </div>
            <div className="ls-pipeline-step">
              <span className="ls-pipeline-step__num">Step 02</span>
              <h4 className="ls-pipeline-step__title">Identify Needs</h4>
              <p className="ls-pipeline-step__desc">Pinpoint whether gaps are arithmetic, conceptual, or application-based.</p>
            </div>
            <div className="ls-pipeline-step">
              <span className="ls-pipeline-step__num">Step 03</span>
              <h4 className="ls-pipeline-step__title">Targeted Support</h4>
              <p className="ls-pipeline-step__desc">Mentors provide calibrated explanations and targeted examples.</p>
            </div>
            <div className="ls-pipeline-step">
              <span className="ls-pipeline-step__num">Step 04</span>
              <h4 className="ls-pipeline-step__title">Deliberate Practice</h4>
              <p className="ls-pipeline-step__desc">Worksheets specifically constructed to exercise deficit areas.</p>
            </div>
            <div className="ls-pipeline-step">
              <span className="ls-pipeline-step__num">Step 05</span>
              <h4 className="ls-pipeline-step__title">Reassess &amp; Grow</h4>
              <p className="ls-pipeline-step__desc">Verify topic recovery before moving into advanced chapters.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. ASSESSMENT AS FEEDBACK
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="assessment-feedback-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Diagnostic Insight"
            heading="Assessment Is More Than a Score"
            description="We distinguish between a mere test score and actionable diagnostic feedback. An assessment is valuable because of what it reveals about how a student thinks."
            align="center"
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)', marginTop: 'var(--space-8)' }}>
            <div style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)' }}>
              <Badge variant="neutral" style={{ marginBottom: 'var(--space-2)' }}>Conventional View</Badge>
              <h4 style={{ color: 'var(--navy)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)' }}>
                A Score (One Measurement)
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', lineHeight: '1.6' }}>
                A final percentage that classifies performance at a single moment in time, offering
                little insight into what went wrong or how to improve.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--white)', border: '2px solid #B4ECE5', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
              <Badge variant="primary" style={{ marginBottom: 'var(--space-2)' }}>MS Tutorials View</Badge>
              <h4 style={{ color: 'var(--primary)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)' }}>
                Diagnostic Feedback (A Learning Tool)
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', lineHeight: '1.6' }}>
                Actionable information that answers: Which concepts are secure? Where do calculation errors happen? What specific worksheets should be practiced next?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. PRACTICE SYSTEM
          ==================================================================== */}
      <section className="home-section home-section--subtle" aria-labelledby="practice-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Skill Progression"
            heading="Practice With Purpose"
            description="Practice must progress deliberately from guided examples to complex problem solving, cultivating genuine academic stamina."
            align="center"
          />

          <div className="ls-pipeline">
            <div className="ls-pipeline-step">
              <span className="ls-pipeline-step__num">Phase 01</span>
              <h4 className="ls-pipeline-step__title">Understand</h4>
              <p className="ls-pipeline-step__desc">Teacher explains core theorems, definitions, and mechanisms.</p>
            </div>
            <div className="ls-pipeline-step">
              <span className="ls-pipeline-step__num">Phase 02</span>
              <h4 className="ls-pipeline-step__title">Guided Practice</h4>
              <p className="ls-pipeline-step__desc">Classroom exercises solved step-by-step with immediate teacher feedback.</p>
            </div>
            <div className="ls-pipeline-step">
              <span className="ls-pipeline-step__num">Phase 03</span>
              <h4 className="ls-pipeline-step__title">Independent Practice</h4>
              <p className="ls-pipeline-step__desc">Graded homework worksheets completed without assistance.</p>
            </div>
            <div className="ls-pipeline-step">
              <span className="ls-pipeline-step__num">Phase 04</span>
              <h4 className="ls-pipeline-step__title">Application</h4>
              <p className="ls-pipeline-step__desc">Real-world multi-step problems requiring synthesis of multiple ideas.</p>
            </div>
            <div className="ls-pipeline-step">
              <span className="ls-pipeline-step__num">Phase 05</span>
              <h4 className="ls-pipeline-step__title">Challenge</h4>
              <p className="ls-pipeline-step__desc">Higher-order thinking questions preparing students for board &amp; competitive exams.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          8. REVISION & RETENTION
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="revision-heading">
        <div className="container">
          <div className="home-philosophy__grid">
            <div>
              <SectionTitle
                eyebrow="Memory Retention"
                heading="Learning Needs Revision"
                description="Understanding a topic once does not guarantee it will be remembered months later. Structured revision is an active component of our curriculum."
                align="left"
              />
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-base)', lineHeight: '1.6' }}>
                Without systematic review, students naturally experience the forgetting curve.
                Our academic schedule incorporates planned revisits, cumulative re-tests, and
                error reattempts so that earlier chapters remain fresh heading into final exams.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
                <h4 style={{ color: 'var(--navy)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-1)' }}>Spaced Practice</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', margin: 0 }}>Revisiting chapters at expanding intervals to build long-term retention.</p>
              </div>
              <div style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
                <h4 style={{ color: 'var(--navy)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-1)' }}>Cumulative Review</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', margin: 0 }}>Tests that synthesize previous units with newly completed topics.</p>
              </div>
              <div style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
                <h4 style={{ color: 'var(--navy)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-1)' }}>Correcting Mistakes</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', margin: 0 }}>Analyzing incorrect steps to ensure errors are never repeated.</p>
              </div>
              <div style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
                <h4 style={{ color: 'var(--navy)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-1)' }}>Reattempting Questions</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', margin: 0 }}>Retrying difficult challenge problems until independent success is achieved.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          9. STRENGTHS & LEARNING GAPS (3-PART VISUAL)
          ==================================================================== */}
      <section className="home-section home-section--tinted" aria-labelledby="triad-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Diagnostic Framework"
            heading="Know Your Strengths. Work on Your Gaps."
            description="A clear, non-judgmental framework helping students reflect objectively on their academic standing."
            align="center"
          />

          <div className="ls-triad-grid">
            <div className="ls-triad-card ls-triad-card--strength">
              <span className="ls-triad-card__tag" style={{ color: 'var(--success)' }}>Part 01: Strengths</span>
              <h3 className="ls-triad-card__question">&ldquo;What can I already do confidently?&rdquo;</h3>
              <p className="ls-triad-card__text">
                Recognizing chapters and topics where conceptual mastery is secure builds genuine confidence and pride in past hard work.
              </p>
            </div>

            <div className="ls-triad-card ls-triad-card--gap">
              <span className="ls-triad-card__tag" style={{ color: 'var(--warning)' }}>Part 02: Gaps</span>
              <h3 className="ls-triad-card__question">&ldquo;What do I understand partially or not yet?&rdquo;</h3>
              <p className="ls-triad-card__text">
                Pinpointing specific calculation habits, formula applications, or definitions that feel uncertain without feeling discouraged.
              </p>
            </div>

            <div className="ls-triad-card ls-triad-card--action">
              <span className="ls-triad-card__tag" style={{ color: 'var(--primary)' }}>Part 03: Next Action</span>
              <h3 className="ls-triad-card__question">&ldquo;What should I practice next?&rdquo;</h3>
              <p className="ls-triad-card__text">
                Selecting targeted worksheets and asking mentors targeted questions to convert that specific gap into a strength.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          10. DIGITAL LEARNING SUPPORT
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="digital-support-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Digital Resources"
            heading="Learning Continues Beyond the Classroom"
            description="Our classroom mentorship is extended through organized digital study resources accessible to students whenever they revise at home."
            align="center"
          />

          <div className="home-resources-grid">
            <div className="home-resource-tile">
              <div className="home-resource-tile__icon">
                <BookOpen size={20} />
              </div>
              <h3 className="home-resource-tile__title">Study Material</h3>
              <p className="home-resource-tile__text">Concise notes highlighting crucial derivations and formulas.</p>
            </div>
            <div className="home-resource-tile">
              <div className="home-resource-tile__icon">
                <FileText size={20} />
              </div>
              <h3 className="home-resource-tile__title">Worksheets</h3>
              <p className="home-resource-tile__text">Graded exercise sets for daily problem-solving practice.</p>
            </div>
            <div className="home-resource-tile">
              <div className="home-resource-tile__icon">
                <HelpCircle size={20} />
              </div>
              <h3 className="home-resource-tile__title">Important Questions</h3>
              <p className="home-resource-tile__text">Curated problem formats reflecting recurring examination patterns.</p>
            </div>
            <div className="home-resource-tile">
              <div className="home-resource-tile__icon">
                <Video size={20} />
              </div>
              <h3 className="home-resource-tile__title">Explanation Videos</h3>
              <p className="home-resource-tile__text">Walkthroughs demonstrating solutions to difficult derivations.</p>
            </div>
            <div className="home-resource-tile">
              <div className="home-resource-tile__icon">
                <ClipboardList size={20} />
              </div>
              <h3 className="home-resource-tile__title">Tests</h3>
              <p className="home-resource-tile__text">Periodic assessments to evaluate topic retention.</p>
            </div>
            <div className="home-resource-tile">
              <div className="home-resource-tile__icon">
                <BarChart3 size={20} />
              </div>
              <h3 className="home-resource-tile__title">Progress Tracking</h3>
              <p className="home-resource-tile__text">Transparent view of attendance, marks, and revision history.</p>
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
          11. PARTICIPANT ROLES: TEACHER, STUDENT, PARENT
          ==================================================================== */}
      <section className="home-section home-section--subtle" aria-labelledby="roles-heading">
        <div className="container">
          <SectionTitle
            eyebrow="The Learning Partnership"
            heading="Teachers, Students &amp; Parents Working Together"
            description="Education thrives when technology supports human interaction, students become active participants, and parents stay informed partners."
            align="center"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', maxWidth: '900px', margin: '0 auto' }}>
            {/* Teacher's Role */}
            <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <Users size={22} color="var(--primary)" />
                <h3 style={{ margin: 0, color: 'var(--navy)', fontSize: 'var(--font-size-lg)' }}>
                  Role of the Teacher: Technology Supports Teaching, Not Replaces It
                </h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', lineHeight: '1.6', margin: 0 }}>
                The teacher remains the irreplaceable core of MS Tutorials. Our mentors observe student
                working methods, ask clarifying questions, detect nuanced misconceptions, provide emotional
                encouragement, and calibrate problem sets to build independent learner self-reliance.
              </p>
            </div>

            {/* Student's Role Progression */}
            <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <GraduationCap size={22} color="var(--primary)" />
                <h3 style={{ margin: 0, color: 'var(--navy)', fontSize: 'var(--font-size-lg)' }}>
                  The Student's Role: Active Participants, Not Passive Spectators
                </h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', lineHeight: '1.6', marginBottom: 'var(--space-4)' }}>
                Students are guided to take active ownership of their learning journey—asking questions freely,
                reflecting on error patterns, and practicing consistently.
              </p>

              <div className="ls-progression-bar">
                <div className="ls-progression-step">
                  <span className="ls-progression-step__badge">1</span>
                  <span>Teacher Guidance</span>
                </div>
                <span className="ls-progression-divider">&rarr;</span>
                <div className="ls-progression-step">
                  <span className="ls-progression-step__badge">2</span>
                  <span>Student Practice</span>
                </div>
                <span className="ls-progression-divider">&rarr;</span>
                <div className="ls-progression-step">
                  <span className="ls-progression-step__badge">3</span>
                  <span>Student Reflection</span>
                </div>
                <span className="ls-progression-divider">&rarr;</span>
                <div className="ls-progression-step">
                  <span className="ls-progression-step__badge">4</span>
                  <span>Independent Mastery</span>
                </div>
              </div>
            </div>

            {/* Parent's Role */}
            <div style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <ShieldCheck size={22} color="var(--gold)" />
                <h3 style={{ margin: 0, color: 'var(--navy)', fontSize: 'var(--font-size-lg)' }}>
                  Parent's Role: Partners in Growth
                </h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', lineHeight: '1.6', marginBottom: 'var(--space-4)' }}>
                Parents support learning by encouraging consistent routines, understanding genuine progress
                rather than just raw marks, and communicating openly with mentors without placing undue pressure.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRoute('/parent/login')}
              >
                Parent Portal Overview &rarr;
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          12. THE COMPLETE SYSTEM (SUMMARY CARD)
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="complete-system-heading">
        <div className="container">
          <div className="ls-system-summary-card">
            <Badge variant="primary" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'var(--white)', borderColor: 'rgba(255,255,255,0.25)', marginBottom: 'var(--space-3)' }}>
              Integrated Architecture
            </Badge>
            <h2 id="complete-system-heading" style={{ color: 'var(--white)', fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-3)' }}>
              One Continuous Learning Journey
            </h2>
            <p>
              &ldquo;The goal is not simply to finish chapters. The goal is continuous improvement.&rdquo;
              Our integrated learning layers ensure every stage of the student journey is supported.
            </p>

            <div className="ls-layers-grid">
              <div className="ls-layer-item">
                <span className="ls-layer-item__title">Teaching</span>
                <p className="ls-layer-item__desc">Concept intuition</p>
              </div>
              <div className="ls-layer-item">
                <span className="ls-layer-item__title">Practice</span>
                <p className="ls-layer-item__desc">Graded worksheets</p>
              </div>
              <div className="ls-layer-item">
                <span className="ls-layer-item__title">Assessment</span>
                <p className="ls-layer-item__desc">Diagnostic feedback</p>
              </div>
              <div className="ls-layer-item">
                <span className="ls-layer-item__title">Revision</span>
                <p className="ls-layer-item__desc">Targeted recovery</p>
              </div>
              <div className="ls-layer-item">
                <span className="ls-layer-item__title">Digital Support</span>
                <p className="ls-layer-item__desc">Anytime study notes</p>
              </div>
              <div className="ls-layer-item">
                <span className="ls-layer-item__title">Mentor Guidance</span>
                <p className="ls-layer-item__desc">Personalized attention</p>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
              onClick={() => handleAction('diagnostic', 'Complete System Banner')}
            >
              Take a Diagnostic Test
            </Button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          13. FINAL CTA
          ==================================================================== */}
      <section className="home-final-cta" aria-labelledby="ls-final-heading">
        <div className="container home-final-cta__content">
          <p className="home-final-cta__sub">Start With Clarity</p>
          <h2 id="ls-final-heading" className="home-final-cta__heading">
            Start Where You Are. Build From There.
          </h2>
          <p className="home-final-cta__text">
            Strong learning begins with understanding where you are and knowing
            what to work on next.
          </p>

          <div className="home-final-cta__actions">
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleAction('diagnostic', 'Learning System Final CTA')}
            >
              Take a Diagnostic Test
            </Button>
            <Button
              variant="outline"
              size="lg"
              style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.4)' }}
              onClick={() => handleRoute('/programs')}
            >
              Explore Programs
            </Button>
            <Button
              variant="ghost"
              size="lg"
              style={{ color: 'var(--white)' }}
              onClick={() => handleAction('mentor', 'Learning System Final CTA Mentor')}
            >
              Talk to a Mentor
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
