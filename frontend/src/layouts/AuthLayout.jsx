import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GitBranch,
  Zap,
  BarChart3,
  Shield,
  Users,
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Real-time Analytics',
    description: 'Live GitHub activity tracking across all your repos',
  },
  {
    icon: BarChart3,
    title: 'AI-Powered Insights',
    description: 'Smart recommendations to boost team productivity',
  },
  {
    icon: Users,
    title: 'Contributor Intelligence',
    description: 'Deep-dive into contributor patterns and impact',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'OAuth-based auth, your data stays yours',
  },
];

/* Floating geometric shapes — pure CSS, no gradients */
const shapes = [
  { size: 180, top: '8%',  left: '5%',  opacity: 0.04, borderRadius: '50%',  rotate: 0   },
  { size: 100, top: '18%', left: '62%', opacity: 0.05, borderRadius: '12px', rotate: 24  },
  { size: 60,  top: '55%', left: '75%', opacity: 0.06, borderRadius: '50%',  rotate: 0   },
  { size: 140, top: '70%', left: '2%',  opacity: 0.04, borderRadius: '16px', rotate: -15 },
  { size: 80,  top: '40%', left: '50%', opacity: 0.03, borderRadius: '50%',  rotate: 0   },
  { size: 50,  top: '85%', left: '55%', opacity: 0.07, borderRadius: '8px',  rotate: 30  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const leftItemVariants = {
  hidden:  { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const rightVariants = {
  hidden:  { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function AuthLayout() {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {/* ── LEFT PANEL ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          position: 'relative',
          flex: '0 0 48%',
          backgroundColor: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '56px 52px',
          overflow: 'hidden',
        }}
      >
        {/* Geometric floating shapes */}
        {shapes.map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              borderRadius: s.borderRadius,
              border: `2px solid var(--accent-green)`,
              opacity: s.opacity,
              transform: `rotate(${s.rotate}deg)`,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Logo */}
        <motion.div
          variants={leftItemVariants}
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              backgroundColor: 'var(--accent-green)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GitBranch size={24} color="#fff" />
          </div>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.3px',
            }}
          >
            DevTrackr
          </span>
        </motion.div>

        {/* Tagline */}
        <motion.h1
          variants={leftItemVariants}
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1.25,
            marginBottom: 16,
            letterSpacing: '-0.5px',
          }}
        >
          AI-Powered
          <br />
          Developer Analytics
        </motion.h1>

        <motion.p
          variants={leftItemVariants}
          style={{
            fontSize: 15,
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            marginBottom: 44,
            maxWidth: 380,
          }}
        >
          Understand your GitHub activity like never before. Track commits,
          pull requests, and contributor impact with intelligent analytics.
        </motion.p>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {features.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              variants={leftItemVariants}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={18} color="var(--accent-green)" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 3,
                  }}
                >
                  {title}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom badge */}
        <motion.div
          variants={leftItemVariants}
          style={{
            marginTop: 48,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 9999,
            padding: '6px 14px',
            width: 'fit-content',
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: 'var(--accent-green)',
            }}
          />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
            Trusted by 2,400+ developers
          </span>
        </motion.div>
      </motion.div>

      {/* ── RIGHT PANEL ── */}
      <motion.div
        variants={rightVariants}
        initial="hidden"
        animate="visible"
        style={{
          flex: 1,
          backgroundColor: 'var(--bg-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 32px',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
}
