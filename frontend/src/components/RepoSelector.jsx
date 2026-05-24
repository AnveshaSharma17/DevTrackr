import { useState, useRef, useEffect } from 'react';
import { ChevronDown, FolderGit2, Plus, Lock, X, Search, Star, GitFork, Loader, Globe, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { githubApi } from '../services/apiServices';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// ─── Add Repository Modal ───────────────────────────────────────────────────────
export function AddRepoModal({ open, onClose, trackedRepos = [], onRepoAdded }) {
  const [activeTab, setActiveTab] = useState('my-repos'); // 'my-repos' | 'public'
  const [githubRepos, setGithubRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [publicUrl, setPublicUrl] = useState('');
  const [publicError, setPublicError] = useState('');
  const queryClient = useQueryClient();

  // Fetch user's GitHub repos when modal opens on 'my-repos' tab
  useEffect(() => {
    if (!open) { setPublicUrl(''); setPublicError(''); setSearch(''); return; }
    if (activeTab !== 'my-repos') return;
    setSearch('');
    setLoading(true);
    githubApi.getUserRepos()
      .then((res) => setGithubRepos(res.data.data || []))
      .catch(() => toast.error('Failed to load GitHub repositories'))
      .finally(() => setLoading(false));
  }, [open, activeTab]);

  // My-repos: connect mutation
  const connectRepoMutation = useMutation({
    mutationFn: (repoData) => githubApi.connectRepo(repoData),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['connected-repos'] });
      toast.success(`✅ ${res.data.data.fullName} is now being tracked!`);
      if (onRepoAdded) onRepoAdded(res.data.data._id);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to connect repo'),
  });

  // Public repo: add mutation
  const addPublicMutation = useMutation({
    mutationFn: (repoUrl) => githubApi.addPublicRepo(repoUrl),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['connected-repos'] });
      toast.success(`✅ ${res.data.data.fullName} added! Analytics will generate shortly.`);
      setPublicUrl('');
      if (onRepoAdded) onRepoAdded(res.data.data._id);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to add repository';
      setPublicError(msg);
      toast.error(msg);
    },
  });

  const handleConnect = (ghRepo) => {
    connectRepoMutation.mutate({
      githubRepoId: ghRepo.githubRepoId,
      name: ghRepo.name,
      fullName: ghRepo.fullName,
      owner: ghRepo.owner,
      description: ghRepo.description,
      language: ghRepo.language,
      stars: ghRepo.stars,
      forks: ghRepo.forks,
      openIssues: ghRepo.openIssues,
      isPrivate: ghRepo.isPrivate,
      defaultBranch: ghRepo.defaultBranch,
      htmlUrl: ghRepo.htmlUrl,
    });
  };

  const handleAddPublic = () => {
    setPublicError('');
    const trimmed = publicUrl.trim();
    if (!trimmed) { setPublicError('Please enter a GitHub URL or owner/repo'); return; }
    addPublicMutation.mutate(trimmed);
  };

  // Filter out already tracked + apply search
  const available = githubRepos.filter(
    (r) => !trackedRepos.find((t) => t.fullName === r.fullName)
  );
  const filtered = search.trim()
    ? available.filter((r) => r.fullName.toLowerCase().includes(search.toLowerCase()))
    : available;

  if (!open) return null;

  const TAB_STYLE = (active) => ({
    flex: 1, padding: '7px 12px', fontSize: '0.82rem', fontWeight: active ? 600 : 400,
    border: 'none', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.15s',
    background: active ? 'var(--accent-green)' : 'transparent',
    color: active ? '#fff' : 'var(--text-muted)',
  });

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
            }}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              zIndex: 201, width: '100%', maxWidth: 560,
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 12, padding: '1.5rem',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                  Add Repository
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Track your own repos or any public GitHub repository
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: 4, borderRadius: 6,
                  display: 'flex', alignItems: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Tab switcher ── */}
            <div style={{
              display: 'flex', gap: 4, padding: 4,
              background: 'var(--bg-elevated)', borderRadius: 10,
              marginBottom: '1.25rem',
            }}>
              <button style={TAB_STYLE(activeTab === 'my-repos')} onClick={() => setActiveTab('my-repos')}>
                <FolderGit2 size={13} style={{ display: 'inline', marginRight: 5, verticalAlign: 'text-bottom' }} />
                My Repositories
              </button>
              <button style={TAB_STYLE(activeTab === 'public')} onClick={() => setActiveTab('public')}>
                <Globe size={13} style={{ display: 'inline', marginRight: 5, verticalAlign: 'text-bottom' }} />
                Public Repository
              </button>
            </div>

            {/* ── MY REPOS TAB ── */}
            {activeTab === 'my-repos' && (
              <>
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                  <Search size={14} style={{
                    position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', pointerEvents: 'none',
                  }} />
                  <input
                    type="text"
                    placeholder="Search your repositories…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                    style={{
                      width: '100%', padding: '0.55rem 0.75rem 0.55rem 2rem',
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 8, color: 'var(--text-primary)',
                      fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                      <Loader size={20} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
                      <p style={{ fontSize: '0.85rem' }}>Loading your repositories…</p>
                    </div>
                  ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                      <FolderGit2 size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                      <p style={{ fontSize: '0.85rem' }}>
                        {search ? 'No repositories match your search.' : 'All your repositories are already tracked.'}
                      </p>
                    </div>
                  ) : (
                    filtered.map((repo) => {
                      const isPending = connectRepoMutation.isPending &&
                        connectRepoMutation.variables?.fullName === repo.fullName;
                      return (
                        <div key={repo.githubRepoId} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '0.65rem 0',
                          borderBottom: '1px solid var(--border-muted)',
                        }}>
                          <div style={{ minWidth: 0, flex: 1, marginRight: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                              <FolderGit2 size={13} style={{ color: 'var(--accent-green-text)', flexShrink: 0 }} />
                              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {repo.fullName}
                              </span>
                              {repo.isPrivate && (
                                <span style={{ fontSize: '0.7rem', padding: '1px 5px', borderRadius: 4, background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-muted)', flexShrink: 0 }}>
                                  Private
                                </span>
                              )}
                            </div>
                            {repo.description && (
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {repo.description}
                              </p>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {repo.language && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{repo.language}</span>}
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><Star size={10} /> {repo.stars ?? 0}</span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><GitFork size={10} /> {repo.forks ?? 0}</span>
                            </div>
                          </div>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleConnect(repo)}
                            disabled={connectRepoMutation.isPending}
                            style={{ flexShrink: 0, opacity: isPending ? 0.7 : 1 }}
                          >
                            {isPending ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={12} />}
                            {isPending ? 'Adding…' : 'Track'}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
                <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
                  {available.length > 0 && !loading && `${available.length} repositories available`}
                </p>
              </>
            )}

            {/* ── PUBLIC REPO TAB ── */}
            {activeTab === 'public' && (
              <div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.6 }}>
                  Analyze any public GitHub repository — repos you don't own, popular open-source projects, or a teammate's work.
                </p>

                {/* Input field */}
                <div style={{ position: 'relative', marginBottom: publicError ? 6 : '1.25rem' }}>
                  <Link size={14} style={{
                    position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', pointerEvents: 'none',
                  }} />
                  <input
                    autoFocus
                    type="text"
                    placeholder="https://github.com/owner/repo  or  owner/repo"
                    value={publicUrl}
                    onChange={(e) => { setPublicUrl(e.target.value); setPublicError(''); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddPublic(); }}
                    style={{
                      width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.2rem',
                      backgroundColor: 'var(--bg-elevated)',
                      border: `1px solid ${publicError ? 'var(--accent-red)' : 'var(--border-default)'}`,
                      borderRadius: 8, color: 'var(--text-primary)',
                      fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                {/* Error message */}
                {publicError && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--accent-red-text)', marginBottom: '1rem' }}>
                    ⚠ {publicError}
                  </p>
                )}

                {/* Examples */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Examples:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {['facebook/react', 'vercel/next.js', 'expressjs/express', 'microsoft/vscode'].map((ex) => (
                      <button
                        key={ex}
                        onClick={() => { setPublicUrl(ex); setPublicError(''); }}
                        style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem',
                          background: 'var(--bg-elevated)', border: '1px solid var(--border-muted)',
                          color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'border-color 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-green)')}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-muted)')}
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info note */}
                <div style={{
                  padding: '10px 12px', borderRadius: 8,
                  background: 'rgba(35,134,54,0.08)', border: '1px solid rgba(35,134,54,0.2)',
                  marginBottom: '1.25rem',
                }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    <strong style={{ color: 'var(--accent-green-text)' }}>Only public repos</strong> can be added this way. 
                    Private repos require you to be the owner and connect via GitHub OAuth.
                    {' '}The repo will appear in your dashboard and receive full AI analytics.
                  </p>
                </div>

                {/* Add button */}
                <button
                  className="btn btn-primary"
                  onClick={handleAddPublic}
                  disabled={addPublicMutation.isPending || !publicUrl.trim()}
                  style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}
                >
                  {addPublicMutation.isPending
                    ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Fetching repository…</>
                    : <><Globe size={14} /> Add Public Repository</>
                  }
                </button>
              </div>
            )}
          </motion.div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </>
      )}
    </AnimatePresence>
  );
}


// ─── Repo Selector Dropdown ────────────────────────────────────────────────────
const RepoSelector = ({ repos = [], selectedId, onSelect, onAddRepo }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selectedRepo = repos.find((r) => r._id === selectedId) || repos[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 8, color: 'var(--text-primary)',
          cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', minWidth: 220,
        }}
      >
        <FolderGit2 size={14} style={{ color: 'var(--accent-green-text)' }} />
        <span style={{ flex: 1, textAlign: 'left' }}>
          {selectedRepo?.fullName || 'Select repository'}
        </span>
        <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="dropdown"
            style={{ minWidth: 260, maxHeight: 300, overflowY: 'auto' }}
          >
            {repos.length > 0 && (
              <>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', padding: '4px 10px 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Tracked Repositories
                </p>
                {repos.map((repo) => (
                  <button
                    key={repo._id}
                    className="dropdown-item"
                    onClick={() => { onSelect(repo._id); setOpen(false); }}
                    style={selectedId === repo._id ? { background: 'var(--bg-hover)', color: 'var(--text-primary)' } : {}}
                  >
                    <FolderGit2 size={13} style={{ color: 'var(--accent-green-text)' }} />
                    <span className="truncate">{repo.fullName}</span>
                    {repo.isPrivate && <Lock size={11} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />}
                  </button>
                ))}
                <div className="divider" style={{ margin: '4px 0' }} />
              </>
            )}

            <button
              className="dropdown-item"
              onClick={() => { setOpen(false); if (onAddRepo) onAddRepo(); }}
            >
              <Plus size={13} style={{ color: 'var(--accent-blue-text)' }} />
              Add repository
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RepoSelector;
