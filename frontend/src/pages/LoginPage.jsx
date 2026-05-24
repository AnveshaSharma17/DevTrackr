import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitBranch, Eye, EyeOff, LogIn, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// ─── Animation Variants ───────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

// ─── Input Field Component ─────────────────────────────────────────────────────
function FormField({ label, id, children, error }) {
  return (
    <motion.div variants={fieldVariants} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label
        htmlFor={id}
        style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)' }}
      >
        {label}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: '0.76rem', color: 'var(--accent-red)' }}>{error}</span>
      )}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate() {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    return errs;
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    try {
      setLoading(true);
      await auth.login({ email: email.trim(), password });
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please check your credentials and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // ── Input style ─────────────────────────────────────────────────────────────
  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '0.65rem 0.9rem',
    backgroundColor: 'var(--bg-elevated)',
    border: `1px solid ${hasError ? 'var(--accent-red)' : 'var(--border-default)'}`,
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* ── Logo ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: '2rem', textAlign: 'center' }}
      >
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            color: 'var(--text-primary)',
          }}
        >
          <GitBranch size={24} color="var(--accent-blue)" />
          <span style={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
            DevTrackr
          </span>
        </Link>
      </motion.div>

      {/* ── Form Card ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="card"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2.25rem',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: '0.3rem',
            }}
          >
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Sign in to your DevTrackr account
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              borderRadius: '8px',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} color="var(--accent-red)" style={{ marginTop: '1px', flexShrink: 0 }} />
            <span style={{ color: 'var(--accent-red)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              {error}
            </span>
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          variants={stagger}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}
          noValidate
        >
          {/* Email */}
          <FormField label="Email address" id="email" error={fieldErrors.email}>
            <input
              id="email"
              type="email"
              value={email}
              autoComplete="email"
              placeholder="you@example.com"
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: '' }));
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent-blue)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = fieldErrors.email
                  ? 'var(--accent-red)'
                  : 'var(--border-default)';
              }}
              style={inputStyle(!!fieldErrors.email)}
            />
          </FormField>

          {/* Password */}
          <FormField label="Password" id="password" error={fieldErrors.password}>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                autoComplete="current-password"
                placeholder="Enter your password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: '' }));
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent-blue)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = fieldErrors.password
                    ? 'var(--accent-red)'
                    : 'var(--border-default)';
                }}
                style={{ ...inputStyle(!!fieldErrors.password), paddingRight: '2.8rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormField>

          {/* Forgot password link */}
          <motion.div variants={fieldVariants} style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
            <a
              href="#"
              style={{
                color: 'var(--accent-blue)',
                fontSize: '0.8rem',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
            >
              Forgot password?
            </a>
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={fieldVariants} style={{ marginTop: '0.25rem' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.7rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </motion.div>
        </motion.form>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            margin: '1.5rem 0',
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-default)' }} />
          OR
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-default)' }} />
        </div>

        {/* Sign-up link */}
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Don't have an account?{' '}
          <Link
            to="/signup"
            style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 500 }}
            onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
          >
            Create one free
          </Link>
        </p>
      </motion.div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
