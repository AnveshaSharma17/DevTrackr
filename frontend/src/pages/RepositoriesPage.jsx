import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FolderGit2, Star, GitFork, Lock, Plus, ExternalLink, Loader, RefreshCw } from 'lucide-react';
import { githubApi } from '../services/apiServices';
import { useSelectedRepo } from '../context/SelectedRepoContext';
import { useNavigate } from 'react-router-dom';
import { AddRepoModal } from '../components/RepoSelector';
import toast from 'react-hot-toast';

export default function RepositoriesPage() {
  const navigate = useNavigate();
  const { setSelectedRepoId } = useSelectedRepo();
  const queryClient = useQueryClient();
  const [addRepoOpen, setAddRepoOpen] = useState(false);

  const { data: repos = [], isLoading, refetch } = useQuery({
    queryKey: ['connected-repos'],
    queryFn: () => githubApi.getConnectedRepos().then((r) => r.data.data),
  });

  function handleAnalyze(repoId) {
    setSelectedRepoId(repoId);
    navigate('/dashboard');
  }

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: '1.286rem', fontWeight: 600, marginBottom: 4 }}>Repositories</h1>
          <p className="text-secondary text-sm">
            {repos.length > 0 ? `${repos.length} repositor${repos.length === 1 ? 'y' : 'ies'} tracked` : 'No repositories connected yet'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => refetch()}
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          <button className="btn btn-primary" onClick={() => setAddRepoOpen(true)}>
            <Plus size={14} /> Add Repository
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card" style={{ height: 160 }}>
              <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 12, width: '80%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 24 }} />
              <div className="skeleton" style={{ height: 32, width: '100%' }} />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && repos.length === 0 && (
        <motion.div
          className="card"
          style={{ textAlign: 'center', padding: '4rem 2rem' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FolderGit2 size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ marginBottom: 8 }}>No Repositories Tracked</h3>
          <p className="text-secondary text-sm" style={{ marginBottom: '1.5rem' }}>
            Connect your GitHub repositories to start analyzing with AI
          </p>
          <button className="btn btn-primary" onClick={() => setAddRepoOpen(true)}>
            <Plus size={14} /> Connect First Repository
          </button>
        </motion.div>
      )}

      {/* Repo grid */}
      {!isLoading && repos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {repos.map((repo, i) => (
            <motion.div
              key={repo._id}
              className="card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              {/* Repo name + private badge */}
              <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                <FolderGit2 size={16} style={{ color: 'var(--accent-green-text)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {repo.fullName}
                </span>
                {repo.isPrivate && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.7rem', padding: '2px 6px', borderRadius: 4, background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-muted)', flexShrink: 0 }}>
                    <Lock size={9} /> Private
                  </span>
                )}
              </div>

              {/* Description */}
              {repo.description && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {repo.description}
                </p>
              )}

              {/* Meta */}
              <div className="flex items-center gap-3">
                {repo.language && (
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 10, background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-muted)' }}>
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Star size={11} /> {repo.stars ?? 0}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted">
                  <GitFork size={11} /> {repo.forks ?? 0}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2" style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-muted)' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleAnalyze(repo._id)}
                  style={{ flex: 1 }}
                >
                  Analyze
                </button>
                {repo.htmlUrl && (
                  <a
                    href={repo.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ flexShrink: 0 }}
                    title="View on GitHub"
                  >
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add repo modal */}
      <AddRepoModal
        open={addRepoOpen}
        onClose={() => setAddRepoOpen(false)}
        trackedRepos={repos}
        onRepoAdded={(id) => {
          setAddRepoOpen(false);
          queryClient.invalidateQueries({ queryKey: ['connected-repos'] });
          toast.success('Repository added! Click Analyze to view its data.');
        }}
      />
    </div>
  );
}
