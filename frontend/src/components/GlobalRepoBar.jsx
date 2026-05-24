import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { FolderGit2, ChevronDown, Plus, Lock, Search, Star, GitFork, Loader, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelectedRepo } from '../context/SelectedRepoContext';
import { githubApi } from '../services/apiServices';
import { AddRepoModal } from './RepoSelector';
import toast from 'react-hot-toast';

// ─── Compact dropdown repo switcher ─────────────────────────────────────────────
function RepoDropdown({ repos, selectedId, onSelect, onAddRepo }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selected = repos.find((r) => r._id === selectedId) || repos[0];

  const filtered = search.trim()
    ? repos.filter((r) => r.fullName.toLowerCase().includes(search.toLowerCase()))
    : repos;

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        onClick={() => { setOpen((v) => !v); setSearch(''); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 12px',
          background: open ? 'var(--bg-elevated)' : 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 8,
          color: 'var(--text-primary)',
          cursor: 'pointer', fontSize: 13,
          fontFamily: 'inherit', minWidth: 220,
          transition: 'background 0.15s',
        }}
      >
        <FolderGit2 size={14} style={{ color: 'var(--accent-green-text)', flexShrink: 0 }} />
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected?.fullName || 'Select repository'}
        </span>
        <ChevronDown
          size={14}
          style={{ color: 'var(--text-muted)', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
        />
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Click-away backdrop */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 198 }} onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0,
                minWidth: 280, maxWidth: 340,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 10, zIndex: 199,
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                overflow: 'hidden',
                fontFamily: 'inherit',
              }}
            >
              {/* Search */}
              {repos.length > 4 && (
                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-muted)' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Find a repository…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{
                        width: '100%', padding: '5px 8px 5px 26px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-muted)',
                        borderRadius: 6, color: 'var(--text-primary)',
                        fontSize: 12, outline: 'none', boxSizing: 'border-box',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Repo list */}
              <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                {filtered.length === 0 ? (
                  <p style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                    No repositories match
                  </p>
                ) : (
                  filtered.map((repo) => {
                    const isActive = repo._id === (selected?._id);
                    return (
                      <button
                        key={repo._id}
                        onClick={() => { onSelect(repo._id); setOpen(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          width: '100%', padding: '8px 12px', textAlign: 'left',
                          background: isActive ? 'var(--bg-elevated)' : 'transparent',
                          border: 'none', cursor: 'pointer', color: 'var(--text-primary)',
                          fontFamily: 'inherit', transition: 'background 0.1s',
                        }}
                        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <FolderGit2 size={13} style={{ color: isActive ? 'var(--accent-green-text)' : 'var(--text-muted)', flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {repo.fullName}
                        </span>
                        {repo.isPrivate && <Lock size={10} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                        {isActive && (
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', flexShrink: 0 }} />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Add repo */}
              <div style={{ borderTop: '1px solid var(--border-muted)' }}>
                <button
                  onClick={() => { setOpen(false); onAddRepo(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '9px 12px', textAlign: 'left',
                    background: 'transparent', border: 'none',
                    cursor: 'pointer', color: 'var(--accent-blue-text)',
                    fontFamily: 'inherit', fontSize: 13,
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Plus size={13} style={{ flexShrink: 0 }} />
                  Add repository
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Global bar rendered inside DashboardLayout ──────────────────────────────────
export default function GlobalRepoBar() {
  const { selectedRepoId, setSelectedRepoId } = useSelectedRepo();
  const [addRepoOpen, setAddRepoOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: repos = [] } = useQuery({
    queryKey: ['connected-repos'],
    queryFn: () => githubApi.getConnectedRepos().then((r) => r.data.data),
  });

  // Don't render the bar if user has no connected repos yet
  if (repos.length === 0) return null;

  const selectedRepo = repos.find((r) => r._id === selectedRepoId) || repos[0];

  return (
    <>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '8px 24px',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-default)',
          flexShrink: 0,
        }}
      >
        {/* Repo switcher dropdown */}
        <RepoDropdown
          repos={repos}
          selectedId={selectedRepo?._id}
          onSelect={(id) => setSelectedRepoId(id)}
          onAddRepo={() => setAddRepoOpen(true)}
        />

        {/* Active repo meta pill */}
        {selectedRepo && (
          <span style={{
            fontSize: 12, color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {selectedRepo.language && (
              <span style={{ padding: '2px 7px', borderRadius: 10, background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-muted)', fontSize: 11 }}>
                {selectedRepo.language}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Star size={11} /> {selectedRepo.stars ?? 0}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <GitFork size={11} /> {selectedRepo.forks ?? 0}
            </span>
            {selectedRepo.isPrivate && (
              <span style={{ padding: '2px 6px', borderRadius: 10, background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-muted)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Lock size={10} /> Private
              </span>
            )}
          </span>
        )}
      </div>

      {/* Add Repository Modal — shared globally */}
      <AddRepoModal
        open={addRepoOpen}
        onClose={() => setAddRepoOpen(false)}
        trackedRepos={repos}
        onRepoAdded={(id) => {
          setSelectedRepoId(id);
          setAddRepoOpen(false);
          queryClient.invalidateQueries({ queryKey: ['connected-repos'] });
          toast.success('Repository added! Analytics will load shortly.');
        }}
      />
    </>
  );
}
