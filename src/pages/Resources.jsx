import React, { useState, useEffect } from 'react';
import SectionTitle from '../components/SectionTitle.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import {
  BookOpen,
  FileText,
  HelpCircle,
  Video,
  ClipboardList,
  RefreshCw,
  FileCheck,
  BarChart3,
  Search,
  Filter,
  ChevronDown,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Layers,
  GraduationCap,
  Users,
  Compass,
  Lightbulb,
  ShieldCheck,
  AlertCircle,
  FolderTree,
} from 'lucide-react';
import '../styles/resources.css';

/**
 * MS Tutorials Resources Page Component (Phase 4.5)
 * 
 * Digital learning resource ecosystem landing page.
 * Demonstrates planned taxonomy, learning-cycle integration, and future portal architecture.
 * Strictly maintains truthfulness: no fake downloads or live database queries.
 * 
 * @param {Object} props
 * @param {Function} props.onOpenInquiry - Opens the enrollment/mentor inquiry modal
 * @param {Function} props.onNavigate - Global client-side navigation handler
 */
export default function Resources({ onOpenInquiry, onNavigate }) {
  // Page SEO initialization
  useEffect(() => {
    document.title = 'Resources | MS Tutorials';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Explore the MS Tutorials learning resource ecosystem including study material, worksheets, important questions, explanation videos, tests and revision resources.'
      );
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // UI States
  const [selectedClass, setSelectedClass] = useState('10');
  const [openFaq, setOpenFaq] = useState(null);
  const [portalModal, setPortalModal] = useState({ isOpen: false, role: 'Student' });

  // Interactive Discovery Demo Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const toggleFaq = (index) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

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

  const openPortalNotice = (role) => {
    setPortalModal({ isOpen: true, role });
  };

  const closePortalNotice = () => {
    setPortalModal({ isOpen: false, role: 'Student' });
  };

  // Scroll helper
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --------------------------------------------------------------------------
  // Static Demo & Curated Content (Clearly Disclaimed)
  // --------------------------------------------------------------------------

  // 1. Eight Core Resource Categories
  const resourceCategories = [
    {
      id: 'cat-study-material',
      icon: <BookOpen size={22} />,
      title: 'Study Material',
      description: 'Structured concept notes and comprehensive theory breaking down core ideas into clear, digestible segments.',
      focus: 'Concept Understanding',
    },
    {
      id: 'cat-worksheets',
      icon: <FileText size={22} />,
      title: 'Worksheets',
      description: 'Carefully graded practice material for guided classroom drills and independent homework reinforcement.',
      focus: 'Skill Application',
    },
    {
      id: 'cat-important-questions',
      icon: <HelpCircle size={22} />,
      title: 'Important Questions',
      description: 'Selected problem sets focusing on high-yield exam patterns and recurring conceptual question formats.',
      focus: 'Exam Readiness',
    },
    {
      id: 'cat-explanation-videos',
      icon: <Video size={22} />,
      title: 'Explanation Videos',
      description: 'Visual step-by-step video walkthroughs illustrating complex derivations, geometric proofs, and scientific mechanisms.',
      focus: 'Visual Intuition',
    },
    {
      id: 'cat-tests',
      icon: <ClipboardList size={22} />,
      title: 'Tests',
      description: 'Practice assessments, chapter tests, and planned diagnostic evaluations designed to gauge retention.',
      focus: 'Diagnostic Assessment',
    },
    {
      id: 'cat-revision-material',
      icon: <RefreshCw size={22} />,
      title: 'Revision Material',
      description: 'High-density summaries, formula sheets, and mind maps designed to revisit essential principles before exams.',
      focus: 'Rapid Recall',
    },
    {
      id: 'cat-practice-papers',
      icon: <FileCheck size={22} />,
      title: 'Previous / Practice Papers',
      description: 'Curriculum-aligned practice question sets and benchmark assessments designed for structured revision.',
      focus: 'Timed Simulation',
    },
    {
      id: 'cat-progress-feedback',
      icon: <BarChart3 size={22} />,
      title: 'Progress & Feedback',
      description: 'Planned error logs, chapter mastery checklists, and teacher evaluation rubrics to guide targeted improvement in the digital portal.',
      focus: 'Performance Insight',
    },
  ];

  // 2. Class-by-Class Structured Syllabus Overview (Classes 6–10)
  const classData = {
    '6': {
      title: 'Class 6 — Explorers Track',
      stage: 'Foundational Discovery',
      mathsTopics: [
        'Knowing Our Numbers & Whole Numbers',
        'Basic Geometrical Ideas & Elementary Shapes',
        'Integers & Introduction to Fractions',
        'Mensuration (Perimeter & Area)',
        'Data Handling & Elementary Algebra',
      ],
      scienceTopics: [
        'Components of Food & Dietary Health',
        'Sorting Materials into Groups',
        'Separation of Substances',
        'Living Organisms & Their Habitats',
        'Motion & Measurement of Distances',
      ],
      resourceMix: 'Illustrated concept notes, foundational practice sheets, and guided lab/activity guides.',
    },
    '7': {
      title: 'Class 7 — Explorers Track',
      stage: 'Conceptual Deepening',
      mathsTopics: [
        'Integers & Rational Numbers',
        'Fractions & Decimals Operations',
        'Simple Linear Equations',
        'Lines, Angles & Triangle Properties',
        'Perimeter, Area & Algebraic Expressions',
      ],
      scienceTopics: [
        'Nutrition in Plants & Animals',
        'Heat, Temperature & Measurement',
        'Acids, Bases & Salts Identification',
        'Physical & Chemical Changes',
        'Motion, Time & Light Fundamentals',
      ],
      resourceMix: 'Graded step-by-step worksheets, error review logs, and visual phenomenon guides.',
    },
    '8': {
      title: 'Class 8 — Explorers Track',
      stage: 'Bridge to Rigorous Academics',
      mathsTopics: [
        'Rational Numbers & Linear Equations in One Variable',
        'Understanding Quadrilaterals & Practical Geometry',
        'Squares, Cubes & Roots',
        'Algebraic Expressions, Identities & Factorization',
        'Mensuration (3D Solids, Surface Area & Volume)',
      ],
      scienceTopics: [
        'Crop Production & Management',
        'Microorganisms: Friend and Foe',
        'Coal, Petroleum & Combustion',
        'Cell Structure & Functions',
        'Force, Pressure, Friction & Sound',
      ],
      resourceMix: 'Curated question banks, derivation summaries, and chapter diagnostic assessments.',
    },
    '9': {
      title: 'Class 9 — Achievers Track',
      stage: 'Advanced Secondary Foundation',
      mathsTopics: [
        'Number Systems (Real Numbers & Surds)',
        'Polynomials & Factor Theorem',
        'Coordinate Geometry & Linear Equations in 2 Variables',
        'Lines, Angles, Triangles & Quadrilateral Theorems',
        'Surface Areas, Volumes & Statistics',
      ],
      scienceTopics: [
        'Matter in Our Surroundings & Pure Substances',
        'Atoms, Molecules & Chemical Formulae',
        'Fundamental Unit of Life & Plant/Animal Tissues',
        'Motion, Kinematics & Newton’s Laws of Motion',
        'Gravitation, Work, Energy & Sound Waves',
      ],
      resourceMix: 'Comprehensive theory booklets, board-pattern tiered worksheets, and numerical problem drills.',
    },
    '10': {
      title: 'Class 10 — Achievers Track',
      stage: 'Board Examination Mastery',
      mathsTopics: [
        'Real Numbers & Fundamental Theorem of Arithmetic',
        'Polynomials, Quadratic Equations & Arithmetic Progressions',
        'Coordinate Geometry & Triangles Similarity Proofs',
        'Introduction to Trigonometry & Heights/Distances',
        'Circles, Surface Areas, Volumes & Statistics',
      ],
      scienceTopics: [
        'Chemical Reactions, Equations & Redox Processes',
        'Acids, Bases, Salts & Metals/Non-Metals',
        'Carbon and Its Compounds',
        'Life Processes, Control & Coordination, Heredity',
        'Light (Reflection/Refraction) & Electricity Circuits',
      ],
      resourceMix: 'High-yield question banks, step-by-step theorem proofs, ray diagram sheets, and full-length test papers.',
    },
  };

  // 3. Featured Demo Items (Clearly marked sample resources)
  const featuredResources = [
    {
      id: 'demo-1',
      type: 'Study Material',
      title: 'Real Numbers & Fundamental Theorem of Arithmetic',
      classLevel: '10',
      className: 'Class 10',
      subject: 'Mathematics',
      description: 'Structured conceptual notes breaking down prime factorizations, irrationality proofs, and step-by-step solved examples.',
      status: 'Example Resource',
      statusVariant: 'warning',
    },
    {
      id: 'demo-2',
      type: 'Worksheets',
      title: 'Light — Reflection & Refraction (Graded Problem Set)',
      classLevel: '10',
      className: 'Class 10',
      subject: 'Science',
      description: 'Tiered practice problems progressing from ray diagram fundamentals to numerical mirror and lens formula calculations.',
      status: 'Example Resource',
      statusVariant: 'warning',
    },
    {
      id: 'demo-3',
      type: 'Important Questions',
      title: 'Algebraic Expressions & Identities — Core Question Bank',
      classLevel: '8',
      className: 'Class 8',
      subject: 'Mathematics',
      description: 'Curated standard problem sets covering factorization methods and standard algebraic identities with scoring insights.',
      status: 'Coming Soon',
      statusVariant: 'neutral',
    },
    {
      id: 'demo-4',
      type: 'Revision Material',
      title: 'Forces & Laws of Motion — Quick Revision Blueprint',
      classLevel: '9',
      className: 'Class 9',
      subject: 'Science',
      description: 'One-page visual summary of Newton’s laws, inertia concepts, momentum equations, and frequent exam pitfalls.',
      status: 'Coming Soon',
      statusVariant: 'neutral',
    },
  ];

  // Filtered Demo Results
  const filteredResources = featuredResources.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = filterClass === 'all' || item.classLevel === filterClass;
    const matchesSubject = filterSubject === 'all' || item.subject.toLowerCase() === filterSubject.toLowerCase();
    const matchesType = filterType === 'all' || item.type.toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesClass && matchesSubject && matchesType;
  });

  // 4. Accessible FAQ Accordion Items (7 Required Questions)
  const faqs = [
    {
      q: 'What types of resources will be available?',
      a: 'MS Tutorials is developing a structured academic resource ecosystem: concept-focused study material, tiered practice worksheets (foundational, standard, and advanced), curated important questions, step-by-step video explanations of complex proofs, regular chapter tests, quick-revision formula sheets, and planned digital error-analysis logs in the upcoming portal.',
    },
    {
      q: 'Which classes will have resources?',
      a: 'Resources are organized specifically for students in Classes 6 through 10. They align with our two signature tracks: the Explorers Track (Classes 6–8 for foundational thinking) and the Achievers Track (Classes 9–10 for secondary and board exam excellence).',
    },
    {
      q: 'Which subjects are supported?',
      a: 'Our resources strictly focus on our core domain: Mathematics and Science (Physics, Chemistry, and Biology). We believe in deep, disciplined mastery in these foundational disciplines rather than spreading focus across unrelated subjects.',
    },
    {
      q: 'Will students need a login to access resources?',
      a: 'Yes. In Phase 6 of our roadmap, enrolled students will receive secure login credentials to access the digital library, submit worksheets, view test evaluations, and track their topic mastery. Currently, this page serves as an open architectural overview.',
    },
    {
      q: 'Can parents see their child’s learning progress?',
      a: 'Yes. In our upcoming Parent Portal (Phase 7), parents will receive transparent access to attendance, test scores, homework completion logs, and teacher feedback. In the interim, parent updates are provided directly through mentor calls and periodic review sessions.',
    },
    {
      q: 'Will resources be organized by chapter and topic?',
      a: 'Yes, absolutely. All resources are structured strictly by Class → Subject → Chapter → Topic → Resource Type. This five-level hierarchy ensures students find exactly what they need for a specific homework question or revision topic without getting lost in disorganized folders.',
    },
    {
      q: 'Are digital resources a replacement for classroom teaching?',
      a: 'No. Digital resources are designed to reinforce and extend classroom teaching, not replace it. True mathematical and scientific understanding comes from live teacher interaction, guided problem-solving, and immediate doubt clearance. Resources serve as the practice and revision engine outside class hours.',
    },
  ];

  return (
    <div className="resources-page">
      {/* ====================================================================
          PAGE HERO
          ==================================================================== */}
      <section className="res-hero" aria-labelledby="resources-hero-heading">
        <div className="container res-hero__grid">
          <div>
            <Badge variant="primary" icon={<Sparkles size={14} />} style={{ marginBottom: 'var(--space-4)' }}>
              MS Tutorials Resource Ecosystem
            </Badge>

            <h1 id="resources-hero-heading" className="res-hero__title">
              All Your Study Resources in <span>One Place.</span>
            </h1>

            <p className="res-hero__description">
              Study material, worksheets, important questions, explanation videos and tests
              designed to support learning beyond the classroom.
            </p>

            <div className="res-hero__actions">
              <Button
                variant="primary"
                size="lg"
                onClick={() => scrollToSection('resource-ecosystem')}
              >
                Explore Resources
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => openPortalNotice('Student')}
              >
                Student Login
              </Button>
            </div>

            <div className="res-hero__notice">
              <Lock size={14} color="var(--text-muted)" />
              <span>Public Overview &amp; Ecosystem Blueprint • Student Portal launching in Roadmap Phase 6</span>
            </div>
          </div>

          {/* Academic Visual Representation (No Stock Photos) */}
          <div className="res-hero__visual">
            <div className="res-hero-card-stack" aria-hidden="true">
              <div className="res-hero-card-stack__header">
                <span className="res-hero-card-stack__title">
                  <FolderTree size={16} color="var(--primary)" />
                  Digital Library Architecture
                </span>
                <Badge variant="neutral">Curriculum Aligned</Badge>
              </div>

              <div className="res-hero-card-stack__list">
                <div className="res-hero-card-stack__item">
                  <div className="res-hero-card-stack__icon-wrap" style={{ backgroundColor: 'var(--light-teal)', color: 'var(--dark-teal)' }}>
                    <BookOpen size={18} />
                  </div>
                  <div className="res-hero-card-stack__info">
                    <div className="res-hero-card-stack__name">Concept Study Material</div>
                    <div className="res-hero-card-stack__sub">Theory notes &amp; solved derivations</div>
                  </div>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--primary)', fontWeight: 600 }}>Understand</span>
                </div>

                <div className="res-hero-card-stack__item">
                  <div className="res-hero-card-stack__icon-wrap" style={{ backgroundColor: '#EBF3FD', color: '#1E40AF' }}>
                    <FileText size={18} />
                  </div>
                  <div className="res-hero-card-stack__info">
                    <div className="res-hero-card-stack__name">Graded Worksheets</div>
                    <div className="res-hero-card-stack__sub">Basic, standard &amp; advanced tiers</div>
                  </div>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: '#1E40AF', fontWeight: 600 }}>Practice</span>
                </div>

                <div className="res-hero-card-stack__item">
                  <div className="res-hero-card-stack__icon-wrap" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
                    <ClipboardList size={18} />
                  </div>
                  <div className="res-hero-card-stack__info">
                    <div className="res-hero-card-stack__name">Chapter Diagnostic Tests</div>
                    <div className="res-hero-card-stack__sub">Objective retention &amp; speed checks</div>
                  </div>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: '#B45309', fontWeight: 600 }}>Assess</span>
                </div>

                <div className="res-hero-card-stack__item">
                  <div className="res-hero-card-stack__icon-wrap" style={{ backgroundColor: '#F3E8FF', color: '#6B21A8' }}>
                    <RefreshCw size={18} />
                  </div>
                  <div className="res-hero-card-stack__info">
                    <div className="res-hero-card-stack__name">Revision &amp; Error Logs</div>
                    <div className="res-hero-card-stack__sub">Summary sheets &amp; gap closure</div>
                  </div>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: '#6B21A8', fontWeight: 600 }}>Revise</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          1. RESOURCE ECOSYSTEM (Supporting the 4-Stage Learning Cycle)
          ==================================================================== */}
      <section id="resource-ecosystem" className="home-section home-section--white" aria-labelledby="ecosystem-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Pedagogical Integration"
            heading="Learning Resources That Support the Learning Cycle"
            description="Our resources are not random files. Every piece of material is specifically designed to support one of the four essential stages of genuine academic mastery."
            align="center"
          />

          <div className="res-ecosystem-grid">
            {/* UNDERSTAND */}
            <div className="res-ecosystem-card res-ecosystem-card--understand">
              <div className="res-ecosystem-card__stage">
                <Badge variant="primary">Stage 1</Badge>
                <span className="res-ecosystem-card__step-num">01</span>
              </div>
              <h3 className="res-ecosystem-card__title">Understand</h3>
              <p className="res-ecosystem-card__desc">
                Building intuitive conceptual clarity before jumping to mechanical formulas or rote procedures.
              </p>
              <div className="res-ecosystem-card__resources">
                <div className="res-ecosystem-card__list-label">Resource Focus:</div>
                <div className="res-ecosystem-card__tags">
                  <div className="res-ecosystem-card__tag-item">
                    <BookOpen size={14} color="var(--primary)" />
                    <span>Study Material &amp; Concept Notes</span>
                  </div>
                  <div className="res-ecosystem-card__tag-item">
                    <Video size={14} color="var(--primary)" />
                    <span>Explanation Videos &amp; Proofs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PRACTICE */}
            <div className="res-ecosystem-card res-ecosystem-card--practice">
              <div className="res-ecosystem-card__stage">
                <Badge variant="neutral">Stage 2</Badge>
                <span className="res-ecosystem-card__step-num">02</span>
              </div>
              <h3 className="res-ecosystem-card__title">Practice</h3>
              <p className="res-ecosystem-card__desc">
                Progressive problem-solving that moves students from assisted drills to independent problem handling.
              </p>
              <div className="res-ecosystem-card__resources">
                <div className="res-ecosystem-card__list-label">Resource Focus:</div>
                <div className="res-ecosystem-card__tags">
                  <div className="res-ecosystem-card__tag-item">
                    <FileText size={14} color="var(--navy)" />
                    <span>Graded Worksheets (Tier 1 to 3)</span>
                  </div>
                  <div className="res-ecosystem-card__tag-item">
                    <HelpCircle size={14} color="var(--navy)" />
                    <span>Curated Important Questions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ASSESS */}
            <div className="res-ecosystem-card res-ecosystem-card--assess">
              <div className="res-ecosystem-card__stage">
                <Badge variant="warning">Stage 3</Badge>
                <span className="res-ecosystem-card__step-num">03</span>
              </div>
              <h3 className="res-ecosystem-card__title">Assess</h3>
              <p className="res-ecosystem-card__desc">
                Measuring real retention and diagnosing learning gaps through objective, structured evaluations.
              </p>
              <div className="res-ecosystem-card__resources">
                <div className="res-ecosystem-card__list-label">Resource Focus:</div>
                <div className="res-ecosystem-card__tags">
                  <div className="res-ecosystem-card__tag-item">
                    <ClipboardList size={14} color="var(--gold)" />
                    <span>Chapter Mastery Tests</span>
                  </div>
                  <div className="res-ecosystem-card__tag-item">
                    <FileCheck size={14} color="var(--gold)" />
                    <span>Practice Assessments &amp; Papers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* REVISE */}
            <div className="res-ecosystem-card res-ecosystem-card--revise">
              <div className="res-ecosystem-card__stage">
                <Badge variant="neutral">Stage 4</Badge>
                <span className="res-ecosystem-card__step-num">04</span>
              </div>
              <h3 className="res-ecosystem-card__title">Revise</h3>
              <p className="res-ecosystem-card__desc">
                Reviewing specific misconceptions, fixing errors, and locking in knowledge before terminal exams.
              </p>
              <div className="res-ecosystem-card__resources">
                <div className="res-ecosystem-card__list-label">Resource Focus:</div>
                <div className="res-ecosystem-card__tags">
                  <div className="res-ecosystem-card__tag-item">
                    <RefreshCw size={14} color="var(--purple)" />
                    <span>Revision Material &amp; Blueprints</span>
                  </div>
                  <div className="res-ecosystem-card__tag-item">
                    <BarChart3 size={14} color="var(--purple)" />
                    <span>Mistake Review &amp; Progress Tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', margin: 0 }}>
              <em>Note:</em> Resources are introduced systematically alongside classroom teaching.
              We do not claim every digital asset is instantly downloadable today.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. RESOURCE CATEGORIES
          ==================================================================== */}
      <section id="categories" className="home-section home-section--tinted" aria-labelledby="categories-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Library Organization"
            heading="Explore Resource Categories"
            description="Our learning materials are organized into eight structured categories, each serving a distinct purpose in your academic journey."
            align="center"
          />

          <div className="res-categories-grid">
            {resourceCategories.map((cat) => (
              <div key={cat.id} className="res-cat-card">
                <div className="res-cat-card__header">
                  <div className="res-cat-card__icon">{cat.icon}</div>
                  <h3 className="res-cat-card__title">{cat.title}</h3>
                </div>
                <p className="res-cat-card__text">{cat.description}</p>
                <div className="res-cat-card__footer">
                  <Badge variant="neutral">{cat.focus}</Badge>
                  <span className="res-cat-card__focus">Structured Format</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. BROWSE BY CLASS
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="class-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Targeted Curriculum"
            heading="Find Resources by Class"
            description="Explore how resources are calibrated for each grade level, from exploratory foundations in middle school to board mastery in secondary classes."
            align="center"
          />

          {/* Class Selector Tabs */}
          <div className="res-class-tabs" role="tablist" aria-label="Browse by Class Tabs">
            {['6', '7', '8', '9', '10'].map((cls) => (
              <button
                key={cls}
                type="button"
                role="tab"
                aria-selected={selectedClass === cls}
                aria-controls={`class-panel-${cls}`}
                id={`class-tab-${cls}`}
                className={`res-class-tab ${selectedClass === cls ? 'res-class-tab--active' : ''}`}
                onClick={() => setSelectedClass(cls)}
              >
                Class {cls}
              </button>
            ))}
          </div>

          {/* Active Class Preview Details */}
          {classData[selectedClass] && (
            <div
              id={`class-panel-${selectedClass}`}
              role="tabpanel"
              aria-labelledby={`class-tab-${selectedClass}`}
              className="res-class-preview-card"
            >
              <div className="res-class-preview__header">
                <div>
                  <h3 className="res-class-preview__title">{classData[selectedClass].title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                    Academic Focus: <strong>{classData[selectedClass].stage}</strong>
                  </p>
                </div>
                <Badge variant="primary">Static Architectural Preview</Badge>
              </div>

              <div className="res-class-preview__grid">
                <div>
                  <h4 className="res-class-preview__col-title">
                    <BookOpen size={16} color="var(--primary)" />
                    Mathematics Key Chapters
                  </h4>
                  <ul className="res-class-preview__topics-list">
                    {classData[selectedClass].mathsTopics.map((topic, i) => (
                      <li key={i}>
                        <CheckCircle2 size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="res-class-preview__col-title">
                    <Sparkles size={16} color="#1E40AF" />
                    Science Key Chapters
                  </h4>
                  <ul className="res-class-preview__topics-list">
                    {classData[selectedClass].scienceTopics.map((topic, i) => (
                      <li key={i}>
                        <CheckCircle2 size={14} color="#1E40AF" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--navy)' }}>
                  Recommended Resource Mix:
                </span>{' '}
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  {classData[selectedClass].resourceMix}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ====================================================================
          4. BROWSE BY SUBJECT
          ==================================================================== */}
      <section className="home-section home-section--tinted" aria-labelledby="subject-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Core Domains"
            heading="Choose a Subject"
            description="We intentionally concentrate our resources on Mathematics and Science to deliver uncompromising quality, deep conceptual understanding, and rigorous problem-solving skills."
            align="center"
          />

          <div className="res-subject-grid">
            {/* Mathematics */}
            <div className="res-subject-card">
              <div className="res-subject-card__header">
                <div className="res-subject-card__icon-box res-subject-card__icon-box--maths">
                  <Compass size={28} />
                </div>
                <div>
                  <h3 className="res-subject-card__title">Mathematics</h3>
                  <span className="res-subject-card__tagline">Arithmetic • Algebra • Geometry • Trigonometry</span>
                </div>
              </div>

              <p className="res-subject-card__desc">
                Mathematical resources emphasize problem-solving intuition, systematic algebraic steps,
                and geometric proof rigor rather than mechanical formula memorization.
              </p>

              <div className="res-subject-card__block">
                <div className="res-subject-card__block-label">Key Pillars:</div>
                <div className="res-subject-card__pills">
                  <span className="res-subject-card__pill">Number Systems</span>
                  <span className="res-subject-card__pill">Polynomials &amp; Quadratics</span>
                  <span className="res-subject-card__pill">Geometry Proofs</span>
                  <span className="res-subject-card__pill">Trigonometry &amp; Heights</span>
                  <span className="res-subject-card__pill">Mensuration &amp; 3D Solids</span>
                  <span className="res-subject-card__pill">Statistics &amp; Probability</span>
                </div>
              </div>

              <div className="res-subject-card__block">
                <div className="res-subject-card__block-label">Specialized Formats:</div>
                <div className="res-subject-card__pills">
                  <span className="res-subject-card__pill">Tiered Problem Worksheets</span>
                  <span className="res-subject-card__pill">Formula Memory Blueprints</span>
                  <span className="res-subject-card__pill">Step-by-Step Proof Solutions</span>
                </div>
              </div>
            </div>

            {/* Science */}
            <div className="res-subject-card">
              <div className="res-subject-card__header">
                <div className="res-subject-card__icon-box res-subject-card__icon-box--science">
                  <Lightbulb size={28} />
                </div>
                <div>
                  <h3 className="res-subject-card__title">Science</h3>
                  <span className="res-subject-card__tagline">Physics • Chemistry • Biology</span>
                </div>
              </div>

              <p className="res-subject-card__desc">
                Science resources connect empirical observations with physical laws, chemical equations,
                and biological processes, reinforced with labeled diagrams and experiment summaries.
              </p>

              <div className="res-subject-card__block">
                <div className="res-subject-card__block-label">Key Pillars:</div>
                <div className="res-subject-card__pills">
                  <span className="res-subject-card__pill">Motion &amp; Newton's Laws</span>
                  <span className="res-subject-card__pill">Light &amp; Ray Diagrams</span>
                  <span className="res-subject-card__pill">Electricity &amp; Circuits</span>
                  <span className="res-subject-card__pill">Chemical Equations &amp; Reactions</span>
                  <span className="res-subject-card__pill">Cellular Biology &amp; Heredity</span>
                  <span className="res-subject-card__pill">Life Processes</span>
                </div>
              </div>

              <div className="res-subject-card__block">
                <div className="res-subject-card__block-label">Specialized Formats:</div>
                <div className="res-subject-card__pills">
                  <span className="res-subject-card__pill">Ray &amp; Circuit Diagrams</span>
                  <span className="res-subject-card__pill">Reaction Balancing Drills</span>
                  <span className="res-subject-card__pill">Experiment Principle Guides</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. RESOURCE DISCOVERY (Interactive Demo Preview)
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="discovery-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Future Search Engine"
            heading="Search &amp; Discover Resources"
            description="Preview the forthcoming search and taxonomy interface that will allow students to locate relevant practice material instantly by class, subject, chapter, or resource format."
            align="center"
          />

          <div className="res-discovery-box">
            <div className="res-discovery-disclaimer">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>
                Interactive Discovery Preview: Demonstrating future library organization. Full search backend,
                live database indexing, and student file downloads will activate upon LMS launch in Phase 6.
              </span>
            </div>

            <form
              className="res-discovery-form"
              onSubmit={(e) => e.preventDefault()}
              aria-label="Resource Discovery Filters"
            >
              {/* Search Input */}
              <div className="res-discovery-search">
                <Search size={18} className="res-discovery-search__icon" />
                <input
                  type="text"
                  className="res-discovery-search__input"
                  placeholder="Search resources by topic or keyword (e.g., Real Numbers, Light, Motion)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search resources"
                />
              </div>

              {/* Filters Bar */}
              <div className="res-discovery-filters">
                <select
                  className="res-discovery-select"
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  aria-label="Filter by class"
                >
                  <option value="all">All Classes (6–10)</option>
                  <option value="6">Class 6</option>
                  <option value="7">Class 7</option>
                  <option value="8">Class 8</option>
                  <option value="9">Class 9</option>
                  <option value="10">Class 10</option>
                </select>

                <select
                  className="res-discovery-select"
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  aria-label="Filter by subject"
                >
                  <option value="all">All Subjects</option>
                  <option value="mathematics">Mathematics</option>
                  <option value="science">Science</option>
                </select>

                <select
                  className="res-discovery-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  aria-label="Filter by resource type"
                >
                  <option value="all">All Resource Types</option>
                  <option value="study material">Study Material</option>
                  <option value="worksheets">Worksheets</option>
                  <option value="important questions">Important Questions</option>
                  <option value="revision material">Revision Material</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterClass('all');
                    setFilterSubject('all');
                    setFilterType('all');
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </form>

            {/* Discovery Demo Results */}
            <div className="res-discovery-results">
              <div className="res-discovery-results__header">
                <span className="res-discovery-results__count">
                  Demo Preview Items ({filteredResources.length})
                </span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  Filtered from sample showcase
                </span>
              </div>

              {filteredResources.length > 0 ? (
                <div className="res-featured-grid" style={{ marginTop: 'var(--space-4)' }}>
                  {filteredResources.map((item) => (
                    <div key={item.id} className="res-item-card">
                      <div className="res-item-card__top">
                        <span className="res-item-card__type">{item.type}</span>
                        <Badge variant={item.statusVariant}>{item.status}</Badge>
                      </div>

                      <h4 className="res-item-card__title">{item.title}</h4>

                      <div className="res-item-card__meta">
                        <span>{item.className}</span> • <span>{item.subject}</span>
                      </div>

                      <p className="res-item-card__desc">{item.description}</p>

                      <div className="res-item-card__bottom">
                        <span className="res-item-card__notice">
                          <Lock size={12} />
                          <span>Student Portal Access</span>
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPortalNotice('Student')}
                        >
                          Preview Info
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Demo Items Match Current Filter"
                  description="Adjust your search keywords or reset filter parameters to view other sample architecture items."
                  action={
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('');
                        setFilterClass('all');
                        setFilterSubject('all');
                        setFilterType('all');
                      }}
                    >
                      Reset Filter Criteria
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. FEATURED RESOURCE AREA
          ==================================================================== */}
      <section className="home-section home-section--tinted" aria-labelledby="featured-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Sample Library Items"
            heading="Featured Learning Resources"
            description="Representative samples illustrating the formatting, pedagogical rigor, and structured guidance our academic team embeds into every resource."
            align="center"
          />

          <div className="res-featured-grid">
            {featuredResources.map((res) => (
              <div key={res.id} className="res-item-card">
                <div className="res-item-card__top">
                  <span className="res-item-card__type">{res.type}</span>
                  <Badge variant={res.statusVariant}>{res.status}</Badge>
                </div>

                <h3 className="res-item-card__title">{res.title}</h3>

                <div className="res-item-card__meta">
                  <span>{res.className}</span> • <span>{res.subject}</span>
                </div>

                <p className="res-item-card__desc">{res.description}</p>

                <div className="res-item-card__bottom">
                  <span className="res-item-card__notice">
                    <FolderTree size={12} />
                    <span>LMS Phase 6 Integration</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openPortalNotice('Student')}
                  >
                    Details &rarr;
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', margin: 0 }}>
              * Cards displayed above illustrate resource taxonomy. Actual digital files and student downloads will be accessible upon LMS portal rollout.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. HOW STUDENTS USE RESOURCES (Purposeful 6-Step Sequence)
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="usage-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Study Methodology"
            heading="Use Resources With Purpose"
            description="Possessing study resources is only half the battle. Our mentors guide students through a disciplined six-step routine that turns materials into lasting mastery."
            align="center"
          />

          <div className="res-sequence-grid">
            <div className="res-seq-step">
              <span className="res-seq-step__num">1</span>
              <h3 className="res-seq-step__title">Learn</h3>
              <p className="res-seq-step__text">
                Read concept study notes and watch step-by-step video explanations to establish firm conceptual clarity.
              </p>
            </div>

            <div className="res-seq-step">
              <span className="res-seq-step__num">2</span>
              <h3 className="res-seq-step__title">Practice</h3>
              <p className="res-seq-step__text">
                Work through tiered worksheets and important questions, progressing from basic to complex problems.
              </p>
            </div>

            <div className="res-seq-step">
              <span className="res-seq-step__num">3</span>
              <h3 className="res-seq-step__title">Test</h3>
              <p className="res-seq-step__text">
                Attempt chapter tests under timed conditions to check true retention and exam speed.
              </p>
            </div>

            <div className="res-seq-step">
              <span className="res-seq-step__num">4</span>
              <h3 className="res-seq-step__title">Review</h3>
              <p className="res-seq-step__text">
                Examine errors objectively in personal mistake logs to isolate exact misunderstandings.
              </p>
            </div>

            <div className="res-seq-step">
              <span className="res-seq-step__num">5</span>
              <h3 className="res-seq-step__title">Revise</h3>
              <p className="res-seq-step__text">
                Revisit difficult concepts and tricky proofs using high-density revision blueprints.
              </p>
            </div>

            <div className="res-seq-step">
              <span className="res-seq-step__num">6</span>
              <h3 className="res-seq-step__title">Improve</h3>
              <p className="res-seq-step__text">
                Retest with targeted problem sets to confirm gap closure and track upward mastery progress.
              </p>
            </div>
          </div>

          <div className="res-sequence-cta">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleRoute('/learning-system')}
            >
              See How Learning Works &rarr;
            </Button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          8. RESOURCE QUALITY / ORGANIZATION HIERARCHY
          ==================================================================== */}
      <section className="home-section home-section--tinted" aria-labelledby="organization-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Systematic Taxonomy"
            heading="Organized for Learning"
            description="To avoid overwhelming students with disorganized files, all MS Tutorials materials are structured under a strict five-tier academic hierarchy."
            align="center"
          />

          <div className="res-hierarchy-wrapper">
            <div className="res-hierarchy-chain">
              <div className="res-hierarchy-node">
                <span className="res-hierarchy-node__level">Tier 1</span>
                <span className="res-hierarchy-node__title">Class</span>
                <span className="res-hierarchy-node__example">e.g., Class 10</span>
              </div>

              <div className="res-hierarchy-separator">
                <ArrowRight size={20} />
              </div>

              <div className="res-hierarchy-node">
                <span className="res-hierarchy-node__level">Tier 2</span>
                <span className="res-hierarchy-node__title">Subject</span>
                <span className="res-hierarchy-node__example">e.g., Mathematics</span>
              </div>

              <div className="res-hierarchy-separator">
                <ArrowRight size={20} />
              </div>

              <div className="res-hierarchy-node">
                <span className="res-hierarchy-node__level">Tier 3</span>
                <span className="res-hierarchy-node__title">Chapter</span>
                <span className="res-hierarchy-node__example">e.g., Quadratic Equations</span>
              </div>

              <div className="res-hierarchy-separator">
                <ArrowRight size={20} />
              </div>

              <div className="res-hierarchy-node">
                <span className="res-hierarchy-node__level">Tier 4</span>
                <span className="res-hierarchy-node__title">Topic</span>
                <span className="res-hierarchy-node__example">e.g., Quadratic Formula</span>
              </div>

              <div className="res-hierarchy-separator">
                <ArrowRight size={20} />
              </div>

              <div className="res-hierarchy-node">
                <span className="res-hierarchy-node__level">Tier 5</span>
                <span className="res-hierarchy-node__title">Resource Type</span>
                <span className="res-hierarchy-node__example">e.g., Graded Worksheet</span>
              </div>
            </div>

            <div className="res-hierarchy-summary">
              This taxonomy guarantees that when a student encounters difficulty in a specific topic,
              mentors and parents can immediately retrieve the exact concept note, worksheet, or video
              required to address the weakness without unnecessary searching.
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          9 & 10. FOR STUDENTS & FOR PARENTS (PORTAL ROADMAP PREVIEW)
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="portals-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Digital Workspaces"
            heading="Portals Designed for Students and Parents"
            description="Dedicated interfaces designed to keep students actively engaged in their practice and parents fully informed of genuine learning growth."
            align="center"
          />

          <div className="res-portals-grid">
            {/* Student Portal */}
            <div className="res-portal-card">
              <div className="res-portal-card__icon-box res-portal-card__icon-box--student">
                <GraduationCap size={26} />
              </div>
              <h3 className="res-portal-card__title">Your Learning Space</h3>
              <p className="res-portal-card__desc">
                The student workspace is being constructed to give students a distraction-free,
                structured environment to master concepts and complete purposeful practice.
              </p>

              <ul className="res-portal-card__list">
                <li className="res-portal-card__list-item">
                  <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Access curated chapter notes and theory summaries anytime</span>
                </li>
                <li className="res-portal-card__list-item">
                  <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Complete graded worksheets and submit homework assignments</span>
                </li>
                <li className="res-portal-card__list-item">
                  <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Practice high-yield question sets before school and board exams</span>
                </li>
                <li className="res-portal-card__list-item">
                  <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Attempt chapter tests and review diagnostic evaluations</span>
                </li>
                <li className="res-portal-card__list-item">
                  <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Track topic-level mastery through planned error logs and progress reports</span>
                </li>
              </ul>

              <Button
                variant="primary"
                size="md"
                onClick={() => openPortalNotice('Student')}
              >
                Student Login
              </Button>
            </div>

            {/* Parent Portal */}
            <div className="res-portal-card">
              <div className="res-portal-card__icon-box res-portal-card__icon-box--parent">
                <Users size={26} />
              </div>
              <h3 className="res-portal-card__title">Stay Connected With Learning</h3>
              <p className="res-portal-card__desc">
                The parent dashboard provides transparent, timely visibility into your child’s
                academic habits, test scores, and mentor recommendations without friction.
              </p>

              <ul className="res-portal-card__list">
                <li className="res-portal-card__list-item">
                  <CheckCircle2 size={16} color="#1E40AF" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Continuous overview of learning progression and concept mastery</span>
                </li>
                <li className="res-portal-card__list-item">
                  <CheckCircle2 size={16} color="#1E40AF" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Objective test performance scores and planned diagnostic gap reports</span>
                </li>
                <li className="res-portal-card__list-item">
                  <CheckCircle2 size={16} color="#1E40AF" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Attendance records and classroom session participation logs</span>
                </li>
                <li className="res-portal-card__list-item">
                  <CheckCircle2 size={16} color="#1E40AF" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Assignment submission tracking and homework status</span>
                </li>
                <li className="res-portal-card__list-item">
                  <CheckCircle2 size={16} color="#1E40AF" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Direct feedback from academic teachers and assigned mentors</span>
                </li>
              </ul>

              <Button
                variant="outline"
                size="md"
                onClick={() => openPortalNotice('Parent')}
              >
                Parent Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          11. DIGITAL LEARNING PHILOSOPHY
          ==================================================================== */}
      <section className="home-section home-section--tinted" aria-labelledby="philosophy-heading">
        <div className="container">
          <div className="res-philosophy-card">
            <Badge variant="primary" style={{ marginBottom: 'var(--space-3)', backgroundColor: 'rgba(255,255,255,0.15)', color: 'var(--white)', border: 'none' }}>
              Our Philosophy
            </Badge>

            <h2 id="philosophy-heading" className="res-philosophy-card__quote">
              "Technology should reduce friction around learning—<span>not create more complexity.</span>"
            </h2>

            <p className="res-philosophy-card__sub">
              We reject digital clutter, endless feeds, and gimmicks. Technology at MS Tutorials exists to
              eliminate friction: giving students immediate access to the exact resource they need, when they need it,
              while helping educators provide meaningful, actionable feedback.
            </p>

            <div className="res-philosophy-grid">
              <div className="res-philosophy-item">
                <div className="res-philosophy-item__title">Easy Access</div>
                <div className="res-philosophy-item__text">
                  Direct availability of study notes and assignments without lost papers.
                </div>
              </div>

              <div className="res-philosophy-item">
                <div className="res-philosophy-item__title">Clear Organization</div>
                <div className="res-philosophy-item__text">
                  Strict five-level taxonomy preventing confusion and time wastage.
                </div>
              </div>

              <div className="res-philosophy-item">
                <div className="res-philosophy-item__title">Useful Practice</div>
                <div className="res-philosophy-item__text">
                  Graded, purposeful problems aligned strictly with school and board syllabi.
                </div>
              </div>

              <div className="res-philosophy-item">
                <div className="res-philosophy-item__title">Meaningful Feedback</div>
                <div className="res-philosophy-item__text">
                  Detailed error diagnostics rather than uninformative aggregate percentages.
                </div>
              </div>

              <div className="res-philosophy-item">
                <div className="res-philosophy-item__title">Structured Revision</div>
                <div className="res-philosophy-item__text">
                  Focused review tools addressing verified personal weak spots.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          12. RESOURCE LIBRARY STATUS
          ==================================================================== */}
      <section className="home-section home-section--white" aria-labelledby="status-heading">
        <div className="container">
          <div className="res-status-banner">
            <div className="res-status-banner__info">
              <Badge variant="primary" style={{ marginBottom: 'var(--space-2)' }}>
                System Status
              </Badge>
              <h3 id="status-heading" className="res-status-banner__title">
                Digital Resource Library Coming Soon
              </h3>
              <p className="res-status-banner__text">
                We are building a structured digital learning environment where students will be able to access
                study material, practice resources, tests and progress information in one place.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => handleAction('enroll', 'Resource Library Status Banner')}
            >
              Join MS Tutorials
            </Button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          13. FAQ ACCORDION (7 Questions)
          ==================================================================== */}
      <section className="home-section home-section--tinted" aria-labelledby="faq-heading">
        <div className="container">
          <SectionTitle
            eyebrow="Frequently Asked Questions"
            heading="Questions About Our Resources"
            description="Clear and honest information on what resources are planned, how they operate, and how they support classroom teaching."
            align="center"
          />

          <div className="res-faq-container">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              const buttonId = `res-faq-btn-${idx}`;
              const panelId = `res-faq-panel-${idx}`;

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
          14. FINAL CTA
          ==================================================================== */}
      <section className="home-final-cta" aria-labelledby="resources-final-heading">
        <div className="container home-final-cta__content">
          <p className="home-final-cta__sub">Extend Your Learning</p>
          <h2 id="resources-final-heading" className="home-final-cta__heading">
            Keep Learning Beyond the Classroom
          </h2>
          <p className="home-final-cta__text">
            Build strong concepts in class. Strengthen them through purposeful practice, assessment and revision.
          </p>

          <div className="home-final-cta__actions">
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleAction('enroll', 'Resources Final CTA')}
            >
              Join MS Tutorials
            </Button>
            <Button
              variant="outline"
              size="lg"
              style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.4)' }}
              onClick={() => handleAction('mentor', 'Resources Final CTA Secondary')}
            >
              Talk to a Mentor
            </Button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          PORTAL INFORMATION MODAL (Roadmap Transparency)
          ==================================================================== */}
      <Modal
        isOpen={portalModal.isOpen}
        onClose={closePortalNotice}
        title={`${portalModal.role} Portal Status`}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={closePortalNotice}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                closePortalNotice();
                handleAction('enroll', `${portalModal.role} Portal Notice Inquiry`);
              }}
            >
              Inquire About Enrollment
            </Button>
          </>
        }
      >
        <div style={{ padding: 'var(--space-2) 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--light-teal)',
                color: 'var(--dark-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Lock size={20} />
            </div>
            <div>
              <h4 style={{ color: 'var(--navy)', margin: 0, fontSize: 'var(--font-size-base)' }}>
                {portalModal.role} Portal Coming in Upcoming Phases
              </h4>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                Scheduled under Roadmap Phases 6 &amp; 7
              </span>
            </div>
          </div>

          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: 'var(--space-4)' }}>
            Dedicated authentication, verified student workspaces, interactive assignment submissions,
            and parent progress dashboards are in active development.
          </p>

          <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--navy)', marginBottom: 'var(--space-1)' }}>
              Current Classroom Operations:
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
              Enrolled students receive structured physical and digital study packets directly from their mentors.
              To enroll or book an academic diagnostic session, submit an inquiry below.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
