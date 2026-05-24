import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  GitBranch,
  Zap,
  BarChart2,
  Users,
  Activity,
  FileText,
  GitPullRequest,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
  Database,
} from 'lucide-react';

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── Animated Section Wrapper ─────────────────────────────────────────────────
function AnimatedSection({ children, className, style }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
const features = [
  {
    icon: GitBranch,
    title: 'GitHub Integration',
    description:
      'Connect your GitHub account in seconds. Sync repos, commits, PRs, and issues automatically — no manual setup required.',
    accent: 'var(--accent-blue)',
  },
  {
    icon: Zap,
    title: 'AI Insights',
    description:
      'Get intelligent recommendations on code quality, review bottlenecks, and productivity trends powered by AI analysis.',
    accent: 'var(--accent-purple)',
  },
  {
    icon: GitPullRequest,
    title: 'Sprint Tracking',
    description:
      'Visualize sprint velocity, track open PRs, and monitor completion rates with real-time progress dashboards.',
    accent: 'var(--accent-cyan)',
  },
  {
    icon: Users,
    title: 'Contributor Analytics',
    description:
      'Break down contributions per developer — commits, reviews, lines changed — and identify your top performers.',
    accent: 'var(--accent-green)',
  },
  {
    icon: Activity,
    title: 'Health Score',
    description:
      'A composite score for every repo measuring activity, review coverage, issue resolution, and test coverage trends.',
    accent: 'var(--accent-orange)',
  },
  {
    icon: FileText,
    title: 'Team Reports',
    description:
      'Generate shareable weekly and monthly reports for engineering managers and stakeholders in one click.',
    accent: 'var(--accent-blue)',
  },
];

// ─── How It Works Steps ───────────────────────────────────────────────────────
const steps = [
  {
    step: '01',
    icon: GitBranch,
    title: 'Connect GitHub',
    description:
      'Authenticate with GitHub OAuth and select the repositories or organizations you want to track.',
  },
  {
    step: '02',
    icon: Database,
    title: 'Analyze Repos',
    description:
      'DevTrackr fetches your data — commits, PRs, issues — and runs AI-powered analysis across your codebase.',
  },
  {
    step: '03',
    icon: TrendingUp,
    title: 'Get Insights',
    description:
      'Receive actionable insights, health scores, and trend reports to help your team ship faster and smarter.',
  },
];

// ─── Stats ────────────────────────────────────────────────────────────────────
const stats = [
  { value: '500+', label: 'Teams' },
  { value: '10K+', label: 'Repos' },
  { value: '2M+', label: 'Commits' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: "'Inter', system-ui, sans-serif",
        overflowX: 'hidden',
      }}
    >
      {/* ── Sticky Navbar ── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'rgba(13, 17, 23, 0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-default)',
          padding: '0 2rem',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            color: 'var(--text-primary)',
          }}
        >
          <GitBranch size={22} color="var(--accent-blue)" />
          <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
            DevTrackr
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a
            href="#features"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--text-secondary)')}
          >
            Features
          </a>
          <a
            href="#how-it-works"
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--text-secondary)')}
          >
            Pricing
          </a>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/login" className="btn btn-ghost" style={{ fontSize: '0.875rem' }}>
              Login
            </Link>
            <Link
              to="/signup"
              className="btn btn-primary"
              style={{ fontSize: '0.875rem' }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '7rem 2rem 5rem',
          textAlign: 'center',
        }}
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} style={{ marginBottom: '1.5rem' }}>
            <span
              className="badge badge-blue"
              style={{ fontSize: '0.78rem', padding: '0.35rem 1rem' }}
            >
              <Star size={12} style={{ marginRight: '0.4rem', display: 'inline' }} />
              AI-Powered GitHub Analytics
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            style={{
              fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem',
              color: 'var(--text-primary)',
            }}
          >
            AI-Powered Developer
            <br />
            <span style={{ color: 'var(--accent-blue)' }}>Productivity</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            variants={fadeUp}
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              maxWidth: '560px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.65,
            }}
          >
            Connect GitHub. Analyze. Ship faster. — DevTrackr turns raw commit data
            into actionable engineering intelligence for high-performing teams.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeUp}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link
              to="/signup"
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem', fontWeight: 600 }}
            >
              Get Started Free
              <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
            </Link>
            <a
              href="#how-it-works"
              className="btn btn-secondary"
              style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
            >
              View Demo
            </a>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            variants={fadeUp}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '3rem',
              marginTop: '3.5rem',
              flexWrap: 'wrap',
            }}
          >
            {stats.map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {value}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Divider ── */}
      <div
        style={{
          height: '1px',
          backgroundColor: 'var(--border-default)',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      />

      {/* ── Features Section ── */}
      <section id="features" style={{ padding: '6rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <AnimatedSection style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="badge badge-blue" style={{ marginBottom: '1rem', display: 'inline-block' }}>
            Features
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              marginBottom: '0.75rem',
            }}
          >
            Everything your team needs
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '520px', margin: '0 auto' }}>
            From raw GitHub data to intelligent dashboards — DevTrackr covers the full
            engineering analytics lifecycle.
          </p>
        </AnimatedSection>

        {/* 3x2 Grid */}
        <motion.div
          ref={useRef(null)}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {features.map(({ icon: Icon, title, description, accent }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="card"
              style={{ padding: '1.75rem', cursor: 'default' }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: `${accent}18`,
                  border: `1px solid ${accent}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.1rem',
                }}
              >
                <Icon size={20} color={accent} />
              </div>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)',
                }}
              >
                {title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.65 }}>
                {description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Divider ── */}
      <div
        style={{
          height: '1px',
          backgroundColor: 'var(--border-default)',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      />

      {/* ── How It Works ── */}
      <section
        id="how-it-works"
        style={{
          padding: '6rem 2rem',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <AnimatedSection style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="badge badge-green" style={{ marginBottom: '1rem', display: 'inline-block' }}>
            How it works
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              marginBottom: '0.75rem',
            }}
          >
            Up and running in minutes
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '480px', margin: '0 auto' }}>
            No complex setup. No data pipelines to manage. Just connect and start shipping smarter.
          </p>
        </AnimatedSection>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {steps.map(({ step, icon: Icon, title, description }, idx) => (
            <motion.div
              key={step}
              variants={fadeUp}
              className="card"
              style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}
            >
              {/* Step number watermark */}
              <span
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1.25rem',
                  fontSize: '3.5rem',
                  fontWeight: 800,
                  color: 'var(--border-default)',
                  lineHeight: 1,
                  userSelect: 'none',
                  letterSpacing: '-0.04em',
                }}
              >
                {step}
              </span>

              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Icon size={22} color="var(--accent-blue)" />
              </div>
              <h3
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  marginBottom: '0.6rem',
                  color: 'var(--text-primary)',
                }}
              >
                {title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.65 }}>
                {description}
              </p>

              {/* Connector arrow (not on last) */}
              {idx < steps.length - 1 && (
                <div
                  style={{
                    display: 'none', // hidden on mobile/grid; would show on horizontal layout
                  }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Bottom CTA ── */}
      <section style={{ padding: '5rem 2rem' }}>
        <AnimatedSection>
          <div
            className="card"
            style={{
              maxWidth: '700px',
              margin: '0 auto',
              padding: '3.5rem 2.5rem',
              textAlign: 'center',
              border: '1px solid var(--border-default)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <GitBranch size={26} color="var(--accent-blue)" />
            </div>

            <h2
              style={{
                fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                marginBottom: '1rem',
              }}
            >
              Start tracking your team's progress today
            </h2>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                marginBottom: '2rem',
                lineHeight: 1.65,
              }}
            >
              Join hundreds of engineering teams using DevTrackr to ship faster, reduce
              review bottlenecks, and make data-driven decisions.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/signup"
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.75rem', fontWeight: 600 }}
              >
                Get Started Free
                <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.75rem 1.75rem' }}>
                Sign In
              </Link>
            </div>

            {/* Trust signals */}
            <div
              style={{
                display: 'flex',
                gap: '1.5rem',
                justifyContent: 'center',
                marginTop: '2rem',
                flexWrap: 'wrap',
              }}
            >
              {['No credit card required', 'Free forever plan', 'Cancel anytime'].map((text) => (
                <div
                  key={text}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                  }}
                >
                  <CheckCircle size={13} color="var(--accent-green)" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: '1px solid var(--border-default)',
          padding: '2.5rem 2rem',
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GitBranch size={18} color="var(--accent-blue)" />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
            DevTrackr
          </span>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
          {['Privacy', 'Terms', 'Docs', 'Support'].map((link) => (
            <a
              key={link}
              href="#"
              style={{
                color: 'var(--text-muted)',
                textDecoration: 'none',
                fontSize: '0.82rem',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--text-secondary)')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}
            >
              {link}
            </a>
          ))}
        </div>

        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} DevTrackr. All rights reserved.
        </span>
      </footer>
    </div>
  );
}
