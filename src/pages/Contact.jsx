import React, { useState, useEffect } from 'react';
import SectionTitle from '../components/SectionTitle.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import Textarea from '../components/Textarea.jsx';
import {
  Mail,
  GraduationCap,
  BookOpen,
  Users,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Send,
  MessageSquare,
  ShieldCheck,
  Compass,
  FileQuestion,
  ChevronDown,
  Layers,
  HeartHandshake,
  UserCheck,
} from 'lucide-react';
import '../styles/contact.css';

/**
 * MS Tutorials Contact Page Component (Phase 4.6)
 * 
 * Public website contact and enquiry interface.
 * Strictly maintains truthfulness: uses only verified emails (admissions, info, support, admin @ mstutorials.com),
 * no fake phone numbers, no fake physical addresses, and honest frontend form submission.
 * 
 * @param {Object} props
 * @param {Function} props.onOpenInquiry - Optional handler for opening diagnostic/enrollment modal
 * @param {Function} props.onNavigate - Global client-side navigation handler
 */
export default function Contact({ onOpenInquiry, onNavigate }) {
  // Page SEO initialization
  useEffect(() => {
    document.title = 'Contact | MS Tutorials';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Contact MS Tutorials for admission enquiries, academic support, student and parent support, and information about our Maths and Science programs.'
      );
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    role: 'Parent',
    email: '',
    classLevel: 'class-10',
    enquiryType: 'Admission Enquiry',
    message: '',
    contactPreference: 'Email',
  });

  // Validation State
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const handleRoute = (route) => {
    if (onNavigate) {
      onNavigate(route);
    }
  };

  // Scroll helper
  const scrollToForm = () => {
    const el = document.getElementById('enquiry-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Select enquiry category and scroll to form
  const handleSelectCategory = (catTitle) => {
    setFormData((prev) => ({ ...prev, enquiryType: catTitle }));
    scrollToForm();
  };

  // Client-side Form Validation
  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required.';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Please enter a valid name (at least 2 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email Address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    if (!formData.enquiryType) {
      errors.enquiryType = 'Please select an enquiry category.';
    }

    if (!formData.message.trim()) {
      errors.message = 'Please provide details about your enquiry.';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters long.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmittedData({ ...formData });
      setIsSubmitted(true);
    }
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setSubmittedData(null);
    setFormErrors({});
  };

  // 1. Verified Contact Methods
  const contactMethods = [
    {
      id: 'method-admissions',
      icon: <GraduationCap size={22} />,
      department: 'Admissions & Enrollment',
      title: 'Admissions Desk',
      description: 'Questions regarding program admissions, class availability, diagnostic assessments, and batch schedules.',
      email: 'admissions@mstutorials.com',
    },
    {
      id: 'method-info',
      icon: <BookOpen size={22} />,
      department: 'General Inquiries',
      title: 'Information Team',
      description: 'General information about MS Tutorials, curriculum frameworks, teaching philosophy, and institutional overview.',
      email: 'info@mstutorials.com',
    },
    {
      id: 'method-support',
      icon: <HeartHandshake size={22} />,
      department: 'Student & Parent Support',
      title: 'Academic Support',
      description: 'Dedicated support for enrolled students and parents regarding academic guidance, study resources, and progress.',
      email: 'support@mstutorials.com',
    },
    {
      id: 'method-admin',
      icon: <ShieldCheck size={22} />,
      department: 'Administration',
      title: 'Office Administration',
      description: 'Administrative communication, official records, institutional coordination, and general correspondence.',
      email: 'admin@mstutorials.com',
    },
  ];

  // 2. "How Can We Help?" Enquiry Categories
  const helpCategories = [
    {
      id: 'cat-admission',
      title: 'Admission Enquiry',
      desc: 'Questions about programs, class levels (Classes 6–10), batch timings, and joining MS Tutorials.',
      icon: <GraduationCap size={20} />,
    },
    {
      id: 'cat-academic',
      title: 'Academic Support',
      desc: 'Questions about Mathematics & Science syllabi, concept clarity, curriculum, or academic guidance.',
      icon: <BookOpen size={20} />,
    },
    {
      id: 'cat-student',
      title: 'Student Support',
      desc: 'Help related to the student’s ongoing learning experience, practice worksheets, and topic difficulty.',
      icon: <UserCheck size={20} />,
    },
    {
      id: 'cat-parent',
      title: 'Parent Support',
      desc: 'Inquiries about student learning progress, mentor feedback, session updates, or parent involvement.',
      icon: <Users size={20} />,
    },
    {
      id: 'cat-general',
      title: 'General Enquiry',
      desc: 'Other general questions about MS Tutorials, institutional policies, or academic approach.',
      icon: <HelpCircle size={20} />,
    },
  ];

  // 3. "Before You Contact Us" Helpful Guidance Points
  const guidancePoints = [
    {
      title: 'Student’s Class & Track',
      text: 'Indicate whether the student is in Class 6–8 (Explorers Track) or Class 9–10 (Achievers Track).',
    },
    {
      title: 'School Board / Curriculum',
      text: 'Specify CBSE, ICSE, or State Board to help us tailor curriculum context precisely.',
    },
    {
      title: 'Target Subject',
      text: 'Mention Mathematics, Science (Physics/Chemistry/Biology), or both foundational subjects.',
    },
    {
      title: 'Specific Academic Needs',
      text: 'Highlight areas needing attention—foundation gaps, algebra difficulty, geometry proofs, or board prep.',
    },
    {
      title: 'Program of Interest',
      text: 'Note whether you are interested in regular tuition, foundation coaching, or remedial mathematics.',
    },
    {
      title: 'Concrete Questions',
      text: 'Share specific questions about our six-step learning cycle, regular testing, or mentor interaction.',
    },
  ];

  // 4. Support Journey Steps
  const journeySteps = [
    {
      step: 'Step 1',
      title: 'Ask',
      desc: 'Reach out with your academic query or enrollment goal.',
    },
    {
      step: 'Step 2',
      title: 'Share Your Question',
      desc: 'Tell us about the student’s current grade, school board, and challenges.',
    },
    {
      step: 'Step 3',
      title: 'Understand Your Need',
      desc: 'We review the student’s starting point and learning objectives.',
    },
    {
      step: 'Step 4',
      title: 'Get Guidance',
      desc: 'An academic mentor provides tailored advice on the right track.',
    },
    {
      step: 'Step 5',
      title: 'Take the Next Step',
      desc: 'Begin purposeful learning with structured practice and clear feedback.',
    },
  ];

  // 5. Accessible FAQ Accordion Items (7 Required Questions)
  const faqs = [
    {
      q: 'How can I enquire about admission?',
      a: 'You can submit an admission enquiry using the form above or email our admissions team directly at admissions@mstutorials.com. Our academic team reviews every inquiry to understand the student’s grade level and academic goals before scheduling an introductory conversation or diagnostic assessment.',
    },
    {
      q: 'Which classes does MS Tutorials support?',
      a: 'MS Tutorials offers structured tuition programs for students in Classes 6 through 10. Programs are organized into two distinct tracks: the Explorers Track (Classes 6–8) for conceptual foundations and the Achievers Track (Classes 9–10) for rigorous secondary and board exam preparation.',
    },
    {
      q: 'Which subjects are offered?',
      a: 'We specialize exclusively in Mathematics and Science (Physics, Chemistry, and Biology). We intentionally concentrate our expertise in these foundational subjects to ensure deep, disciplined learning rather than diluting focus across non-core subjects.',
    },
    {
      q: 'Can parents contact MS Tutorials about their child’s learning?',
      a: 'Yes, absolutely. We consider parents essential partners in a student’s educational progress. Parents can contact us regarding academic updates, session feedback, or to arrange a discussion with the student’s assigned mentor via support@mstutorials.com.',
    },
    {
      q: 'Can existing students ask for academic support?',
      a: 'Yes. Existing students are encouraged to seek guidance whenever they encounter challenging topics, difficult homework problems, or revision roadblocks. Students can contact our academic mentors via support@mstutorials.com or raise questions during designated classroom doubt-clearing sessions.',
    },
    {
      q: 'How can I learn more about the available programs?',
      a: 'You can explore our detailed program tracks on the Programs page (/programs) or review our pedagogical methodology on the Learning System page (/learning-system). If you have specific curriculum questions, write to info@mstutorials.com.',
    },
    {
      q: 'Will the online contact form be connected to the MS Tutorials support system?',
      a: 'Currently, this public website provides a structured frontend enquiry interface. Full backend enquiry persistence, automated ticket routing, and CRM management will be connected in an upcoming roadmap phase. In the interim, all official communication is actively monitored via our verified email addresses.',
    },
  ];

  return (
    <div className="contact-page">
      {/* ====================================================================
          1. HERO SECTION
          ==================================================================== */}
      <section className="contact-hero" aria-labelledby="contact-hero-heading">
        <div className="container contact-hero__grid">
          <div>
            <Badge variant="primary" icon={<Sparkles size={14} />} style={{ marginBottom: 'var(--space-4)' }}>
              MS Tutorials Help &amp; Support
            </Badge>

            <h1 id="contact-hero-heading" className="contact-hero__title">
              We’re Here to <span>Help You!</span>
            </h1>

            <p className="contact-hero__description">
              Have questions about admissions, our Maths and Science programs, academic support,
              or student progress? Our academic team is here to provide clear, prompt guidance.
            </p>

            <div className="contact-hero__actions">
              <Button
                variant="primary"
                size="lg"
                onClick={scrollToForm}
              >
                Send an Enquiry
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleRoute('/programs')}
              >
                Explore Programs
              </Button>
            </div>

            <div className="contact-hero__notice">
              <Mail size={14} color="var(--primary)" />
              <span>Official Inquiries: admissions@mstutorials.com • info@mstutorials.com</span>
            </div>
          </div>

          {/* Academic Visual Representation */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="contact-hero-card" aria-hidden="true">
              <div className="contact-hero-card__header">
                <div className="contact-hero-card__icon">
                  <HeartHandshake size={22} />
                </div>
                <div>
                  <h3 className="contact-hero-card__title">Academic Support Desk</h3>
                  <span className="contact-hero-card__sub">Concepts • Clarity • Confidence</span>
                </div>
              </div>

              <div className="contact-hero-card__list">
                <div className="contact-hero-card__item">
                  <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Admission Guidance:</strong> Finding the right class track and curriculum alignment.</span>
                </div>
                <div className="contact-hero-card__item">
                  <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Subject Guidance:</strong> Targeted support for Mathematics &amp; Science concepts.</span>
                </div>
                <div className="contact-hero-card__item">
                  <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Parent Communication:</strong> Transparent insights into learning growth and habits.</span>
                </div>
                <div className="contact-hero-card__item">
                  <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Prompt Responses:</strong> Direct communication with qualified academic coordinators.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. CONTACT METHODS SECTION (4 Verified Emails)
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="methods-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Direct Communication"
            heading="Reach Out by Department"
            description="Connect directly with the appropriate team at MS Tutorials for admissions, general information, student support, or administrative queries."
            align="center"
          />

          <div className="contact-methods-grid">
            {contactMethods.map((method) => (
              <div key={method.id} className="contact-method-card">
                <div className="contact-method-card__icon">{method.icon}</div>
                <span className="contact-method-card__dept">{method.department}</span>
                <h3 className="contact-method-card__title">{method.title}</h3>
                <p className="contact-method-card__desc">{method.description}</p>
                <a
                  href={`mailto:${method.email}`}
                  className="contact-method-card__link"
                  aria-label={`Send email to ${method.title} at ${method.email}`}
                >
                  <Mail size={16} />
                  <span>{method.email}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. "HOW CAN WE HELP?" SECTION (5 Enquiry Categories)
          ==================================================================== */}
      <section className="home-section home-section--tinted" aria-labelledby="help-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Inquiry Types"
            heading="How Can We Help You?"
            description="Select the category that best matches your requirement. We route your questions to the academic mentor or coordinator best equipped to answer."
            align="center"
          />

          <div className="contact-categories-grid">
            {helpCategories.map((cat) => (
              <div
                key={cat.id}
                role="button"
                tabIndex={0}
                className={`contact-cat-card ${formData.enquiryType === cat.title ? 'contact-cat-card--active' : ''}`}
                onClick={() => handleSelectCategory(cat.title)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectCategory(cat.title);
                  }
                }}
                aria-label={`Select category: ${cat.title}`}
              >
                <div className="contact-cat-card__icon">{cat.icon}</div>
                <h3 className="contact-cat-card__title">{cat.title}</h3>
                <p className="contact-cat-card__desc">{cat.desc}</p>
                <div className="contact-cat-card__action">
                  <span>Select &amp; Inquire</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. ENQUIRY FORM + SUPPORTIVE PANEL (2-Column Layout)
          ==================================================================== */}
      <section id="enquiry-form" className="home-section home-section--white" aria-labelledby="form-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Online Inquiry"
            heading="Send an Enquiry"
            description="Fill out the form below with your academic details or specific questions, and our academic team will review your message."
            align="center"
          />

          <div className="contact-form-layout">
            {/* Form Column */}
            <div className="contact-form-card">
              {isSubmitted ? (
                /* Honest Frontend Demo Confirmation View */
                <div className="contact-confirmation">
                  <div className="contact-confirmation__icon">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="contact-confirmation__title">Enquiry Prepared Successfully</h3>
                  <p className="contact-confirmation__text">
                    Thank you, <strong>{submittedData.fullName}</strong>. Your enquiry regarding{' '}
                    <em>{submittedData.enquiryType}</em> has been prepared.
                  </p>

                  <div className="contact-confirmation__box">
                    <div className="contact-confirmation__box-item">
                      <strong>Target Class:</strong> {submittedData.classLevel.toUpperCase().replace('-', ' ')}
                    </div>
                    <div className="contact-confirmation__box-item">
                      <strong>Contact Email:</strong> {submittedData.email}
                    </div>
                    <div className="contact-confirmation__box-item">
                      <strong>Sender Role:</strong> {submittedData.role}
                    </div>
                    <div className="contact-confirmation__box-item" style={{ marginBottom: 0 }}>
                      <strong>Message Preview:</strong> "{submittedData.message}"
                    </div>
                  </div>

                  <div className="contact-form-disclaimer" style={{ maxWidth: '500px', margin: '0 auto var(--space-6)' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>
                      Notice: This is a frontend demo interface. Full backend enquiry persistence and automated ticketing
                      will be integrated in upcoming development phases. In the interim, please email{' '}
                      <strong>admissions@mstutorials.com</strong> directly for immediate enrollment.
                    </span>
                  </div>

                  <Button variant="primary" size="md" onClick={handleResetForm}>
                    Send Another Enquiry
                  </Button>
                </div>
              ) : (
                /* Live Interactive Form */
                <form onSubmit={handleSubmit} noValidate aria-label="Enquiry Form">
                  <div className="contact-form-disclaimer">
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>
                      Frontend Enquiry Interface: Information entered is validated client-side. Backend database
                      persistence will connect in future roadmap phases.
                    </span>
                  </div>

                  {/* Name & Role Row */}
                  <div className="contact-form__row">
                    <Input
                      label="Full Name"
                      required
                      placeholder="e.g. Suman Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      error={formErrors.fullName}
                    />

                    <Select
                      label="I am a"
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      options={[
                        { value: 'Parent', label: 'Parent' },
                        { value: 'Student', label: 'Student' },
                        { value: 'Prospective Student', label: 'Prospective Student' },
                        { value: 'Other', label: 'Other / Guardian' },
                      ]}
                    />
                  </div>

                  {/* Email & Class Row */}
                  <div className="contact-form__row">
                    <Input
                      label="Email Address"
                      required
                      type="email"
                      placeholder="e.g. parent@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      error={formErrors.email}
                      helperText="We will respond to this email address."
                    />

                    <Select
                      label="Class / Academic Level"
                      required
                      value={formData.classLevel}
                      onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                      options={[
                        { value: 'class-6', label: 'Class 6 (Explorers Track)' },
                        { value: 'class-7', label: 'Class 7 (Explorers Track)' },
                        { value: 'class-8', label: 'Class 8 (Explorers Track)' },
                        { value: 'class-9', label: 'Class 9 (Achievers Track)' },
                        { value: 'class-10', label: 'Class 10 (Achievers Board Prep)' },
                        { value: 'other', label: 'Other / Not Applicable' },
                      ]}
                    />
                  </div>

                  {/* Subject / Enquiry Category */}
                  <Select
                    label="Subject / Enquiry Category"
                    required
                    value={formData.enquiryType}
                    onChange={(e) => setFormData({ ...formData, enquiryType: e.target.value })}
                    error={formErrors.enquiryType}
                    options={[
                      { value: 'Admission Enquiry', label: 'Admission Enquiry — Programs & Batches' },
                      { value: 'Academic Support', label: 'Academic Support — Subject & Concepts' },
                      { value: 'Student Support', label: 'Student Support — Ongoing Learning Help' },
                      { value: 'Parent Support', label: 'Parent Support — Progress & Guidance' },
                      { value: 'General Enquiry', label: 'General Enquiry — Other Questions' },
                    ]}
                  />

                  {/* Message Field */}
                  <Textarea
                    label="Message / Academic Query"
                    required
                    rows={4}
                    placeholder="Please describe the student's current class, school board (CBSE/ICSE/State), academic goals, or specific topics you want to strengthen..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    error={formErrors.message}
                  />

                  <div className="contact-form-actions">
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      All four verified departmental emails are active daily.
                    </span>
                    <Button variant="primary" size="lg" type="submit">
                      <Send size={16} />
                      <span>Send Enquiry</span>
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Supportive Panel Column */}
            <div className="contact-support-panel">
              <div className="contact-panel-card">
                <h4 className="contact-panel-card__title">
                  <ShieldCheck size={20} color="var(--primary)" />
                  Our Commitment to Students
                </h4>
                <p className="contact-panel-card__text">
                  We believe that reaching out for academic help should be clear, supportive, and focused
                  on the student’s learning needs—never a high-pressure sales interaction.
                </p>
                <ul className="contact-panel-card__list">
                  <li className="contact-panel-card__list-item">
                    <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>Personalized review of student grade and curriculum level</span>
                  </li>
                  <li className="contact-panel-card__list-item">
                    <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>Honest assessment of whether MS Tutorials is the right fit</span>
                  </li>
                  <li className="contact-panel-card__list-item">
                    <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>Direct academic guidance without aggressive commercial tactics</span>
                  </li>
                </ul>
              </div>

              <div className="contact-panel-card" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                <h4 className="contact-panel-card__title">
                  <Compass size={20} color="var(--navy)" />
                  What Happens Next?
                </h4>
                <p className="contact-panel-card__text">
                  1. Our academic coordinators review your student’s grade and syllabus context.<br />
                  2. We evaluate whether regular tuition, foundation prep, or remedial mathematics fits best.<br />
                  3. We suggest an initial diagnostic test to map current strengths and gaps.
                </p>
                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: 'var(--space-3)' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    Need immediate answers? Write to <strong>info@mstutorials.com</strong>.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. "BEFORE YOU CONTACT US" SECTION
          ==================================================================== */}
      <section className="home-section home-section--tinted" aria-labelledby="guidance-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Helpful Tips"
            heading="Before You Contact Us"
            description="To help us provide the most accurate and personalized academic advice, here is the information that helps our mentors evaluate your inquiry effectively."
            align="center"
          />

          <div className="contact-guidance-grid">
            {guidancePoints.map((point, i) => (
              <div key={i} className="contact-guide-card">
                <div className="contact-guide-card__icon">
                  <FileQuestion size={18} />
                </div>
                <div>
                  <h3 className="contact-guide-card__title">{point.title}</h3>
                  <p className="contact-guide-card__text">{point.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. SUPPORT JOURNEY SECTION
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="journey-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Transparent Process"
            heading="Our Support Journey"
            description="At MS Tutorials, reaching out is about understanding your unique academic goals, diagnosing learning gaps, and designing a structured pathway to mastery."
            align="center"
          />

          <div className="contact-journey-wrapper">
            <div className="contact-journey-chain">
              {journeySteps.map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className="contact-journey-node">
                    <span className="contact-journey-node__step">{step.step}</span>
                    <h3 className="contact-journey-node__title">{step.title}</h3>
                    <p className="contact-journey-node__desc">{step.desc}</p>
                  </div>
                  {idx < journeySteps.length - 1 && (
                    <div className="contact-journey-separator" aria-hidden="true">
                      <ArrowRight size={20} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="contact-journey-note">
              Every step is focused on clarity and confidence—from your initial query to continuous academic guidance.
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. FAQ ACCORDION SECTION (7 Questions)
          ==================================================================== */}
      <section className="home-section home-section--tinted" aria-labelledby="faq-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Frequently Asked Questions"
            heading="Common Contact Questions"
            description="Find direct answers to common queries regarding communication, admissions, subject scope, and online enquiry processing."
            align="center"
          />

          <div className="contact-faq-container">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              const buttonId = `contact-faq-btn-${idx}`;
              const panelId = `contact-faq-panel-${idx}`;

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
          8. FINAL CTA
          ==================================================================== */}
      <section className="home-final-cta" aria-labelledby="contact-final-heading">
        <div className="container home-final-cta__content">
          <p className="home-final-cta__sub">Let’s Connect</p>
          <h2 id="contact-final-heading" className="home-final-cta__heading">
            Have a Question? Let’s Talk.
          </h2>
          <p className="home-final-cta__text">
            Whether you are exploring enrollment for Classes 6–10 or seeking guidance on strengthening
            maths and science fundamentals, our academic team is ready to assist.
          </p>

          <div className="home-final-cta__actions">
            <Button
              variant="primary"
              size="lg"
              onClick={scrollToForm}
            >
              Send an Enquiry
            </Button>
            <Button
              variant="outline"
              size="lg"
              style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.4)' }}
              onClick={() => handleRoute('/programs')}
            >
              Explore Programs
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
