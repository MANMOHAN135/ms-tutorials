import React, { useEffect } from 'react';
import SectionTitle from '../components/SectionTitle.jsx';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import {
  Brain,
  Compass,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Award,
  Users,
  Target,
  FileText,
  Video,
  ClipboardList,
  BarChart3,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  Layers,
  HelpCircle,
} from 'lucide-react';
import '../styles/about.css';

/**
 * MS Tutorials About Page Component (Phase 4.2)
 * 
 * @param {Object} props
 * @param {Function} props.onOpenInquiry - Opens the inquiry / mentor modal
 * @param {Function} props.onNavigate - Navigation handler for route placeholders
 */
export default function About({ onOpenInquiry, onNavigate }) {
  useEffect(() => {
    document.title = 'About MS Tutorials | Our Learning Philosophy';
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
    <div className="about-page">
      {/* ====================================================================
          1. HERO SECTION
          ==================================================================== */}
      <section className="about-hero" aria-labelledby="about-hero-heading">
        <div className="container about-hero__grid">
          <div>
            <Badge variant="primary" icon={<Sparkles size={13} />} style={{ marginBottom: 'var(--space-3)' }}>
              Our Educational Mission
            </Badge>

            <h1 id="about-hero-heading" className="about-hero__title">
              More Than Tuition.<br />
              <span>A Stronger Foundation</span><br />
              for a Brighter Future.
            </h1>

            <p className="about-hero__description">
              MS Tutorials is built around a simple idea: students learn better when
              they understand what they are learning, know where they need improvement,
              and receive the right support to move forward.
            </p>

            <div className="about-hero__actions">
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleRoute('/programs')}
              >
                Explore Programs &rarr;
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleAction('mentor', 'About Hero Secondary')}
              >
                Talk to a Mentor
              </Button>
            </div>
          </div>

          {/* Academic Visual Treatment */}
          <div className="home-hero__visual" aria-hidden="true">
            <div className="hero-visual-card">
              <div className="hero-visual-header">
                <div className="hero-visual-dots">
                  <span className="hero-visual-dot hero-visual-dot--primary"></span>
                  <span className="hero-visual-dot hero-visual-dot--gold"></span>
                  <span className="hero-visual-dot hero-visual-dot--navy"></span>
                </div>
                <Badge variant="neutral">Pedagogical Core</Badge>
              </div>

              <div className="hero-concept-matrix">
                <div className="hero-concept-box hero-concept-box--active">
                  <span className="hero-concept-label">Focus</span>
                  <span className="hero-concept-val">Deep Understanding</span>
                </div>
                <div className="hero-concept-box">
                  <span className="hero-concept-label">Diagnosis</span>
                  <span className="hero-concept-val">Find Learning Gaps</span>
                </div>
                <div className="hero-concept-box">
                  <span className="hero-concept-label">Application</span>
                  <span className="hero-concept-val">Targeted Practice</span>
                </div>
                <div className="hero-concept-box hero-concept-box--active">
                  <span className="hero-concept-label">Confidence</span>
                  <span className="hero-concept-val">Independent Mastery</span>
                </div>
              </div>

              <div className="hero-diagnostic-preview">
                <div>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Educational Philosophy
                  </p>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                    Concepts • Clarity • Confidence
                  </p>
                </div>
                <Badge variant="success">Standard</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. OUR PURPOSE
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="purpose-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Our Purpose"
            heading="Why MS Tutorials Exists"
            description="We exist to solve a fundamental challenge in school education: the pressure to finish textbooks without building genuine mathematical and scientific understanding."
            align="center"
          />

          <div className="about-purpose-grid">
            <div className="about-purpose-card">
              <div className="about-purpose-card__icon">
                <Brain size={20} />
              </div>
              <div>
                <h3 className="about-purpose-card__title">Build Strong Foundations</h3>
                <p className="about-purpose-card__desc">
                  Establish solid grounding in Mathematics and Science so students can comfortably tackle higher classes.
                </p>
              </div>
            </div>

            <div className="about-purpose-card">
              <div className="about-purpose-card__icon">
                <Lightbulb size={20} />
              </div>
              <div>
                <h3 className="about-purpose-card__title">Concept Over Memorization</h3>
                <p className="about-purpose-card__desc">
                  Guide students to understand principles logically rather than memorizing steps without clarity.
                </p>
              </div>
            </div>

            <div className="about-purpose-card">
              <div className="about-purpose-card__icon">
                <Target size={20} />
              </div>
              <div>
                <h3 className="about-purpose-card__title">Identify Learning Gaps</h3>
                <p className="about-purpose-card__desc">
                  Detect specific weak spots early so misunderstandings do not compound into chronic confusion.
                </p>
              </div>
            </div>

            <div className="about-purpose-card">
              <div className="about-purpose-card__icon">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="about-purpose-card__title">Targeted Practice &amp; Revision</h3>
                <p className="about-purpose-card__desc">
                  Provide curated exercises designed specifically to reinforce topics where a student struggles.
                </p>
              </div>
            </div>

            <div className="about-purpose-card">
              <div className="about-purpose-card__icon">
                <ClipboardList size={20} />
              </div>
              <div>
                <h3 className="about-purpose-card__title">Assessment for Progress</h3>
                <p className="about-purpose-card__desc">
                  Use regular chapter evaluations as diagnostic feedback, not instruments of academic judgment.
                </p>
              </div>
            </div>

            <div className="about-purpose-card">
              <div className="about-purpose-card__icon">
                <GraduationCap size={20} />
              </div>
              <div>
                <h3 className="about-purpose-card__title">Independent Learners</h3>
                <p className="about-purpose-card__desc">
                  Nurture disciplined study routines and problem-solving confidence that last throughout life.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. OUR VISION
          ==================================================================== */}
      <section className="home-section home-section--tinted" aria-labelledby="vision-heading">
        <div className="container">
          <div className="about-vision-card">
            <Badge variant="primary" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'var(--white)', borderColor: 'rgba(255,255,255,0.25)' }}>
              Institutional Vision
            </Badge>
            <h2 id="vision-heading" style={{ color: 'var(--gold)', fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 'var(--space-3)' }}>
              Our Vision
            </h2>
            <blockquote className="about-vision-quote">
              &ldquo;To help students develop strong academic foundations, clear thinking
              and the confidence to learn, solve problems and grow independently.&rdquo;
            </blockquote>
            <p style={{ color: '#CBD5E1', fontSize: 'var(--font-size-sm)', maxWidth: '640px', margin: '0 auto', lineHeight: '1.6' }}>
              We envision an educational environment where learning feels structured, purposeful,
              and empowering—empowering every student to achieve their full academic potential.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. OUR VALUES (What We Believe)
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="values-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Core Principles"
            heading="What We Believe"
            description="Our educational culture is grounded in six convictions that guide classroom interaction, material design, and student evaluation."
            align="center"
          />

          <div className="about-values-grid">
            <Card
              title="1. Conceptual Understanding"
              icon={<Brain size={20} />}
              subtitle="Understand First"
            >
              <div className="about-value-item">
                <p>
                  Memorize only where necessary. When students grasp why formulas work,
                  retention improves naturally and anxiety disappears.
                </p>
              </div>
            </Card>

            <Card
              title="2. Clarity"
              icon={<Sparkles size={20} />}
              subtitle="Purposeful Learning"
            >
              <div className="about-value-item">
                <p>
                  Students should always understand what they are learning, why it matters,
                  and how it connects to previous concepts.
                </p>
              </div>
            </Card>

            <Card
              title="3. Consistent Practice"
              icon={<CheckCircle2 size={20} />}
              subtitle="Deliberate Application"
            >
              <div className="about-value-item">
                <p>
                  Strong foundations require regular problem-solving practice that moves
                  from simple direct questions to multi-step challenges.
                </p>
              </div>
            </Card>

            <Card
              title="4. Assessment"
              icon={<ClipboardList size={20} />}
              subtitle="Diagnostic Feedback"
            >
              <div className="about-value-item">
                <p>
                  Assessment should reveal learning gaps, not simply produce marks. Every test
                  is an opportunity to calibrate instruction.
                </p>
              </div>
            </Card>

            <Card
              title="5. Personalized Support"
              icon={<Users size={20} />}
              subtitle="Individual Pace"
            >
              <div className="about-value-item">
                <p>
                  Different students need different kinds of guidance. Small batches allow
                  teachers to address unique stumbling blocks promptly.
                </p>
              </div>
            </Card>

            <Card
              title="6. Confidence"
              icon={<Award size={20} />}
              subtitle="Empowered Learners"
            >
              <div className="about-value-item">
                <p>
                  Genuine confidence is born from competence. Continuous improvement
                  transforms hesitant learners into confident problem solvers.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. OUR LEARNING PHILOSOPHY
          ==================================================================== */}
      <section className="home-section home-section--subtle" aria-labelledby="philosophy-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Pedagogical Architecture"
            heading="How We Think About Learning"
            description="Continuous improvement rather than one-time preparation. Our structured six-step loop ensures students build durable mathematical and scientific comprehension."
            align="center"
          />

          <div className="about-cycle-timeline">
            <div className="about-cycle-step">
              <span className="about-cycle-step__num">Step 01</span>
              <h3 className="about-cycle-step__title">Diagnose</h3>
              <p className="about-cycle-step__text">Identify prerequisite knowledge and baseline topic readiness.</p>
            </div>

            <div className="about-cycle-step">
              <span className="about-cycle-step__num">Step 02</span>
              <h3 className="about-cycle-step__title">Understand</h3>
              <p className="about-cycle-step__text">Break down concepts into intuitive, first-principles logic.</p>
            </div>

            <div className="about-cycle-step">
              <span className="about-cycle-step__num">Step 03</span>
              <h3 className="about-cycle-step__title">Practice</h3>
              <p className="about-cycle-step__text">Reinforce understanding through graded, structured worksheets.</p>
            </div>

            <div className="about-cycle-step">
              <span className="about-cycle-step__num">Step 04</span>
              <h3 className="about-cycle-step__title">Assess</h3>
              <p className="about-cycle-step__text">Evaluate topic retention with periodic chapter assessments.</p>
            </div>

            <div className="about-cycle-step">
              <span className="about-cycle-step__num">Step 05</span>
              <h3 className="about-cycle-step__title">Identify Gaps</h3>
              <p className="about-cycle-step__text">Pinpoint specific misconceptions or steps causing errors.</p>
            </div>

            <div className="about-cycle-step">
              <span className="about-cycle-step__num">Step 06</span>
              <h3 className="about-cycle-step__title">Improve &amp; Revise</h3>
              <p className="about-cycle-step__text">Strengthen deficits with targeted revision assignments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. WHAT MAKES MS TUTORIALS DIFFERENT?
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="diff-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Key Differentiators"
            heading="What Makes MS Tutorials Different?"
            description="We prioritize academic depth and student well-being over crowded lecture halls and superficial shortcuts."
            align="center"
          />

          <div className="about-diff-grid">
            <div className="about-diff-card">
              <h4>Small Batches</h4>
              <p>Limited student numbers per batch ensure teachers know every student by name and observe their individual working methods.</p>
            </div>

            <div className="about-diff-card">
              <h4>Concept-Based Learning</h4>
              <p>Lessons emphasize conceptual derivation and mathematical intuition rather than formula memorization.</p>
            </div>

            <div className="about-diff-card">
              <h4>Personalized Attention</h4>
              <p>Mentors provide timely feedback during problem-solving sessions, preventing errors from turning into habits.</p>
            </div>

            <div className="about-diff-card">
              <h4>Regular Assessment</h4>
              <p>Systematic evaluations measure understanding at the conclusion of every chapter, tracking genuine mastery.</p>
            </div>

            <div className="about-diff-card">
              <h4>Structured Revision</h4>
              <p>Regular review sessions prevent previously mastered topics from fading as the academic year progresses.</p>
            </div>

            <div className="about-diff-card">
              <h4>Digital Learning Support</h4>
              <p>Classroom teaching is supported by organized notes, assignment files, and progress records accessible from home.</p>
            </div>

            <div className="about-diff-card">
              <h4>Mathematics &amp; Science Focus</h4>
              <p>Complete curriculum specialization dedicated entirely to Maths and Science guarantees experienced, focused instruction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. TECHNOLOGY + LEARNING
          ==================================================================== */}
      <section className="home-section home-section--subtle" aria-labelledby="tech-heading">
        <div className="container">
          <div className="home-philosophy__grid">
            <div>
              <SectionTitle
                eyebrow="Digital Enablement"
                heading="Technology That Supports Learning"
                description="Technology should empower human teaching, not replace it. We use digital tools to eliminate administrative friction and provide students with organized access to study materials."
                align="left"
              />
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-base)', lineHeight: '1.6' }}>
                At MS Tutorials, the classroom teacher remains the core academic guide.
                Our digital platform reinforces that relationship by organizing handouts,
                recording assessment outcomes, and enabling seamless review at home.
              </p>
            </div>

            <div className="about-tech-grid">
              <div className="about-tech-item">
                <BookOpen size={20} className="about-tech-item__icon" />
                <span className="about-tech-item__text">Digital Study Material</span>
              </div>
              <div className="about-tech-item">
                <FileText size={20} className="about-tech-item__icon" />
                <span className="about-tech-item__text">Graded Worksheets</span>
              </div>
              <div className="about-tech-item">
                <Video size={20} className="about-tech-item__icon" />
                <span className="about-tech-item__text">Explanation Videos</span>
              </div>
              <div className="about-tech-item">
                <HelpCircle size={20} className="about-tech-item__icon" />
                <span className="about-tech-item__text">Important Question Banks</span>
              </div>
              <div className="about-tech-item">
                <ClipboardList size={20} className="about-tech-item__icon" />
                <span className="about-tech-item__text">Chapter Test Evaluations</span>
              </div>
              <div className="about-tech-item">
                <BarChart3 size={20} className="about-tech-item__icon" />
                <span className="about-tech-item__text">Progress Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          8. STUDENT & PARENT DIGITAL ACCESS
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="portals-about-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Dedicated Portals"
            heading="Built Around Students &amp; Parents"
            description="Clear channels ensuring students can focus on mastery while parents stay informed with complete transparency."
            align="center"
          />

          <div className="home-portals-grid">
            {/* For Students */}
            <div className="portal-entry-card portal-entry-card--student">
              <Badge variant="primary" icon={<GraduationCap size={14} />}>For Students</Badge>
              <h3 className="portal-entry-card__title">Built Around the Student</h3>
              <p className="portal-entry-card__desc">
                Students should always know where they stand: what concepts they understand,
                where they need improvement, what to practice next, and how their performance is changing.
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

            {/* For Parents */}
            <div className="portal-entry-card portal-entry-card--parent">
              <Badge variant="warning" icon={<ShieldCheck size={14} />}>For Parents</Badge>
              <h3 className="portal-entry-card__title">Parents Stay Connected</h3>
              <p className="portal-entry-card__desc">
                Parents receive clear, factual visibility into their child's academic progress,
                test evaluations, attendance, assigned homework, and teacher feedback.
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
          9. OUR COMMITMENT
          ==================================================================== */}
      <section className="home-section home-section--tinted" aria-labelledby="commitment-heading">
        <div className="container">
          <div className="about-commitment-card">
            <Badge variant="primary" style={{ marginBottom: 'var(--space-3)' }}>
              Our Promise
            </Badge>
            <h2 id="commitment-heading" style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--navy)', marginBottom: 'var(--space-3)' }}>
              Our Commitment
            </h2>
            <p className="about-commitment-quote">
              &ldquo;We don't just want students to complete chapters. We want them to understand,
              practice, improve and become confident learners.&rdquo;
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
              Academic growth takes patience, clear guidance, and honest diagnostic feedback.
              We are dedicated to walking alongside every student throughout their learning journey.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          10. FINAL CTA
          ==================================================================== */}
      <section className="home-final-cta" aria-labelledby="about-final-heading">
        <div className="container home-final-cta__content">
          <p className="home-final-cta__sub">Concepts • Clarity • Confidence</p>
          <h2 id="about-final-heading" className="home-final-cta__heading">
            Build Strong Foundations With MS Tutorials
          </h2>
          <p className="home-final-cta__text">
            Concepts create clarity. Clarity builds confidence. Start your child's journey
            toward academic mastery in Maths and Science today.
          </p>

          <div className="home-final-cta__actions">
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleRoute('/programs')}
            >
              Explore Programs
            </Button>
            <Button
              variant="outline"
              size="lg"
              style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.4)' }}
              onClick={() => handleAction('contact', 'About Final CTA')}
            >
              Contact MS Tutorials
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
