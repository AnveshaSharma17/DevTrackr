import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  GitBranch,
  Settings,
  Save,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader,
  AlertCircle,
  Bell,
  Moon,
  Sun,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { githubApi } from '../services/apiServices';

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'github', label: 'GitHub', icon: GitBranch },
];

// ─── Tab animation ────────────────────────────────────────────────────────────
const tabContentVariants = {
  hidden: { opacity: 0, x: 18 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit: { opacity: 0, x: -18, transition: { duration: 0.18 } },
};

// ─── Section card wrapper ─────────────────────────────────────────────────────
function SectionCard({ title, description, children }) {
  return (
    <div
      className="card"
      style={{ padding: '1.75rem', marginBottom: '1.25rem' }}
    >
      {(title || description) && (
        <div style={{ marginBottom: '1.4rem' }}>
          {title && (
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '0.25rem',
              }}
            >
              {title}
            </h3>
          )}
          {description && (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Avatar with initials fallback ───────────────────────────────────────────
function Avatar({ name, avatarUrl, size = 64 }) {
  const initials = name
    ? name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: '2px solid var(--border-default)',
          objectFit: 'cover',
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: 'var(--accent-blue)',
        border: '2px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.32,
        fontWeight: 700,
        color: '#fff',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, description, icon: Icon }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 0',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {Icon && (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={16} color="var(--text-secondary)" />
          </div>
        )}
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
            {label}
          </div>
          {description && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {description}
            </div>
          )}
        </div>
      </div>

      {/* Toggle knob */}
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: '44px',
          height: '24px',
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: checked ? 'var(--accent-green)' : 'var(--bg-elevated)',
          outline: '1px solid var(--border-default)',
          position: 'relative',
          transition: 'background-color 0.2s',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '3px',
            left: checked ? '23px' : '3px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            backgroundColor: '#fff',
            transition: 'left 0.2s',
          }}
        />
      </button>
    </div>
  );
}

// ─── Input field ──────────────────────────────────────────────────────────────
function InputField({ label, value, onChange, disabled, placeholder, type = 'text' }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          padding: '0.65rem 0.9rem',
          backgroundColor: disabled ? 'var(--bg-primary)' : 'var(--bg-elevated)',
          border: `1px solid ${focused ? 'var(--accent-blue)' : 'var(--border-default)'}`,
          borderRadius: '8px',
          color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
          fontSize: '0.9rem',
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'text',
          transition: 'border-color 0.2s',
        }}
      />
    </div>
  );
}

// ─── Success/Error Toast ──────────────────────────────────────────────────────
function Toast({ message, type }) {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.7rem 1rem',
        backgroundColor: isError ? 'rgba(220,38,38,0.1)' : 'rgba(35,134,54,0.1)',
        border: `1px solid ${isError ? 'rgba(220,38,38,0.35)' : 'rgba(35,134,54,0.35)'}`,
        borderRadius: '8px',
        marginBottom: '1.25rem',
        fontSize: '0.85rem',
        color: isError ? 'var(--accent-red)' : 'var(--accent-green)',
      }}
    >
      {isError ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
      {message}
    </motion.div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({ user }) {
  const auth = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Avatar upload state
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarBase64, setAvatarBase64] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useState(null);

  // Keep preview in sync when user object changes externally
  useEffect(() => {
    setAvatarPreview(user?.avatar || null);
  }, [user?.avatar]);

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  // ── Avatar file picker ────────────────────────────────────────────────────
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be smaller than 5 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target.result);
      setAvatarBase64(ev.target.result);
    };
    reader.readAsDataURL(file);
  }

  async function handleAvatarUpload() {
    if (!avatarBase64) return;
    setUploadingAvatar(true);
    try {
      await auth.uploadAvatar(avatarBase64);
      setAvatarBase64(null); // clear pending state
      showToast('Profile photo updated!', 'success');
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to upload photo.', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  }

  // ── Name save ────────────────────────────────────────────────────────────
  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setToast(null);
    try {
      await auth.updateProfile({ name: name.trim() });
      showToast('Profile updated successfully.', 'success');
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  }

  const initials = (name || user?.name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <form onSubmit={handleSave}>
      {/* ── Avatar section ─────────────────────────────────────────────────── */}
      <SectionCard title="Profile Photo" description="Click the photo to upload a new one (JPEG, PNG, WebP — max 5 MB).">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>

          {/* Clickable avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => document.getElementById('avatar-file-input').click()}
              style={{
                display: 'block', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                borderRadius: '50%', position: 'relative',
              }}
              title="Click to change photo"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile"
                  style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-default)' }}
                />
              ) : (
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  backgroundColor: 'var(--accent-blue)',
                  border: '2px solid var(--border-default)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, fontWeight: 700, color: '#fff',
                }}>
                  {initials}
                </div>
              )}
              {/* Camera overlay */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.2s',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
            </button>

            {/* Hidden file input */}
            <input
              id="avatar-file-input"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Upload actions */}
          <div style={{ paddingTop: 6 }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.6rem', lineHeight: 1.5 }}>
              {avatarBase64
                ? '✅ New photo selected. Click "Save Photo" to apply.'
                : user?.avatar
                  ? 'Custom photo active. Click the avatar to change it.'
                  : 'No photo uploaded. Click the avatar or button below to add one.'}
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => document.getElementById('avatar-file-input').click()}
              >
                Upload Photo
              </button>
              {avatarBase64 && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleAvatarUpload}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar
                    ? <><Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                    : '💾 Save Photo'
                  }
                </button>
              )}
              {user?.avatar && !avatarBase64 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--accent-red-text)' }}
                  onClick={async () => {
                    setUploadingAvatar(true);
                    try {
                      await auth.updateProfile({ avatar: null });
                      setAvatarPreview(null);
                      showToast('Profile photo removed.', 'success');
                    } catch {
                      showToast('Failed to remove photo.', 'error');
                    } finally {
                      setUploadingAvatar(false);
                    }
                  }}
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Personal info ──────────────────────────────────────────────────── */}
      <SectionCard title="Personal Information" description="Update your display name and profile details.">
        <AnimatePresence>{toast && <Toast {...toast} />}</AnimatePresence>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <InputField
            label="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
          <InputField
            label="Email address"
            value={user?.email || ''}
            disabled
            type="email"
            placeholder="Email cannot be changed"
          />
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={saving || !name.trim() || name.trim() === user?.name}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.875rem',
              opacity: saving || !name.trim() ? 0.65 : 1,
              cursor: saving || !name.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? (
              <>
                <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                Saving…
              </>
            ) : (
              <>
                <Save size={14} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </SectionCard>
    </form>
  );
}

// ─── GitBranch Tab ───────────────────────────────────────────────────────────────
function GitHubTab({ user }) {
  const isConnected = !!user?.githubUsername;
  const [disconnecting, setDisconnecting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [toast, setToast] = useState(null);
  const auth = useAuth();

  async function handleConnect() {
    setConnecting(true);
    try {
      // Use githubApi (sends JWT automatically via Axios interceptor)
      const res = await githubApi.getConnectUrl();
      const url = res.data?.data?.url;
      if (url) {
        window.location.href = url; // Redirect to GitHub OAuth
      } else {
        throw new Error('Could not get GitHub OAuth URL.');
      }
    } catch (err) {
      setToast({ message: err?.response?.data?.message || err?.message || 'Failed to connect GitHub.', type: 'error' });
      setConnecting(false);
      setTimeout(() => setToast(null), 4000);
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    setToast(null);
    try {
      await githubApi.disconnect();
      // Update local auth state
      if (typeof auth.updateUser === 'function') {
        auth.updateUser({ isGithubConnected: false, githubUsername: null });
      }
      setToast({ message: 'GitHub disconnected successfully.', type: 'success' });
    } catch (err) {
      setToast({ message: err?.response?.data?.message || err?.message || 'Failed to disconnect.', type: 'error' });
    } finally {
      setDisconnecting(false);
      setTimeout(() => setToast(null), 4000);
    }
  }

  return (
    <div>
      {/* Connection status card */}
      <SectionCard
        title="GitBranch Connection"
        description="Connect your GitBranch account to start syncing repositories and analytics."
      >
        <AnimatePresence>{toast && <Toast {...toast} />}</AnimatePresence>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: '10px',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Left: status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GitBranch size={22} color="var(--text-primary)" />
            </div>
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.2rem',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  GitHub
                </span>
                {isConnected ? (
                  <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
                    <CheckCircle size={11} style={{ marginRight: '0.25rem', display: 'inline' }} />
                    Connected
                  </span>
                ) : (
                  <span className="badge badge-red" style={{ fontSize: '0.72rem' }}>
                    <XCircle size={11} style={{ marginRight: '0.25rem', display: 'inline' }} />
                    Not connected
                  </span>
                )}
              </div>
              {isConnected ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  @{user.githubUsername}
                </span>
              ) : (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  No account linked
                </span>
              )}
            </div>
          </div>

          {/* Right: action */}
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                opacity: disconnecting ? 0.65 : 1,
                cursor: disconnecting ? 'not-allowed' : 'pointer',
                borderColor: 'var(--accent-red)',
                color: 'var(--accent-red)',
              }}
            >
              {disconnecting ? (
                <>
                  <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Disconnecting…
                </>
              ) : (
                <>
                  <LogOut size={14} />
                  Disconnect
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                opacity: connecting ? 0.65 : 1,
                cursor: connecting ? 'not-allowed' : 'pointer',
              }}
            >
              {connecting ? (
                <>
                  <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Redirecting…
                </>
              ) : (
                <>
                  <GitBranch size={14} />
                  Connect GitHub
                  <ExternalLink size={12} />
                </>
              )}
            </button>
          )}
        </div>
      </SectionCard>

      {/* Permissions info */}
      <SectionCard
        title="Required Permissions"
        description="DevTrackr requests read-only access to your GitBranch data."
      >
        {[
          { icon: Shield, label: 'Read access to repositories', detail: 'Sync commits, branches, and PRs' },
          { icon: User, label: 'Read access to profile', detail: 'Display your username and avatar' },
          { icon: GitBranch, label: 'Read access to organizations', detail: 'Analyze team and org-level repos' },
        ].map(({ icon: Icon, label, detail }) => (
          <div
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.75rem 0',
              borderBottom: '1px solid var(--border-default)',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={15} color="var(--accent-blue)" />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {label}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                {detail}
              </div>
            </div>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}


// ─── Main Component ───────────────────────────────────────────────────────────
export default function SettingsPage() {
  const auth = useAuth();
  const user = auth?.user;
  const [activeTab, setActiveTab] = useState('profile');
  const [searchParams, setSearchParams] = useSearchParams();
  const [githubNotif, setGithubNotif] = useState(null);

  // Handle GitHub OAuth redirect result
  useEffect(() => {
    const github = searchParams.get('github');
    const message = searchParams.get('message');
    if (github) {
      setActiveTab('github');
      setGithubNotif({ type: github, message: message || (github === 'success' ? 'GitHub connected successfully!' : 'GitHub connection failed') });
      // Clean URL
      setSearchParams({});
      setTimeout(() => setGithubNotif(null), 5000);
      // Re-fetch profile so isGithubConnected updates instantly
      if (github === 'success' && typeof auth.refreshUser === 'function') {
        auth.refreshUser();
      }
    }
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: '2rem 1.5rem',
      }}
    >
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{ marginBottom: '2rem' }}
        >
          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--text-primary)',
              marginBottom: '0.3rem',
            }}
          >
            Settings
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Manage your account, integrations, and preferences.
          </p>
        </motion.div>

        {/* ── Tab Nav ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-default)',
            marginBottom: '1.75rem',
            gap: '0.25rem',
          }}
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 1.1rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${active ? 'var(--accent-blue)' : 'transparent'}`,
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: active ? 600 : 400,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'color 0.2s, border-color 0.2s',
                  marginBottom: '-1px',
                  borderRadius: '0',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </motion.div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {activeTab === 'profile' && <ProfileTab user={user} />}
            {activeTab === 'github' && <GitHubTab user={user} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
