import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, TrendingUp, AlertTriangle, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { analyticsApi } from '../services/apiServices';
import { useSelectedRepo } from '../context/SelectedRepoContext';
import ContributorBarChart from '../charts/ContributorBarChart';

const ContributorsPage = () => {
  const { repoId: urlRepoId } = useParams();
  const { selectedRepoId } = useSelectedRepo();
  const repoId = urlRepoId || selectedRepoId;
  const navigate = useNavigate();

  if (!repoId) {
    return (
      <div className="page-container fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <motion.div style={{ textAlign: 'center' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Users size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ marginBottom: 8 }}>No Repository Selected</h3>
          <p className="text-secondary text-sm" style={{ marginBottom: '1.5rem' }}>
            Select a repository from the Dashboard to view contributor data
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            <ArrowRight size={14} /> Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', repoId],
    queryFn: () => analyticsApi.getAnalytics(repoId).then((r) => r.data.data),
    enabled: !!repoId,
    staleTime: 5 * 60 * 1000,
  });

  const contributors = analytics?.contributorStats?.contributors || [];
  const stats = analytics?.contributorStats;

  return (
    <div className="page-container fade-in">
      <div className="mb-6">
        <h1 style={{ fontSize: '1.286rem', fontWeight: 600, marginBottom: 4 }}>Contributors</h1>
        <p className="text-secondary text-sm">Team activity and participation analysis</p>
      </div>

      {/* Top Stats */}
      <div className="stats-grid mb-6">
        {[
          { icon: Users, label: 'Total Contributors', value: stats?.total ?? 0, color: 'blue' },
          { icon: CheckCircle, label: 'Active (14d)', value: stats?.active ?? 0, color: 'green' },
          { icon: Clock, label: 'Inactive', value: stats?.inactive ?? 0, color: 'orange' },
          { icon: AlertTriangle, label: 'Dominance Risk', value: stats?.dominanceRisk ? 'Yes' : 'No', color: stats?.dominanceRisk ? 'red' : 'green' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className={`card card-${s.color}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted" style={{ textTransform: 'uppercase' }}>{s.label}</span>
              <s.icon size={16} style={{ color: `var(--accent-${s.color}-text)` }} />
            </div>
            <p style={{ fontSize: '1.857rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div className="card mb-6">
        <h3 style={{ fontSize: '0.929rem', fontWeight: 600, marginBottom: '1rem' }}>Commit Distribution</h3>
        {isLoading ? (
          <div className="skeleton" style={{ height: 220 }} />
        ) : (
          <ContributorBarChart contributors={contributors.slice(0, 10)} />
        )}
      </div>

      {/* Contributor Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {isLoading
          ? [...Array(6)].map((_, i) => (
              <div key={i} className="card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 13, width: '60%', marginBottom: 6 }} />
                    <div className="skeleton" style={{ height: 11, width: '40%' }} />
                  </div>
                </div>
                <div className="skeleton" style={{ height: 6, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 11, width: '80%' }} />
              </div>
            ))
          : contributors.map((c, i) => (
              <motion.div
                key={c.username}
                className="card"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    overflow: 'hidden', flexShrink: 0,
                    border: `2px solid ${c.isActive ? 'var(--accent-green)' : 'var(--border-default)'}`,
                  }}>
                    {c.avatarUrl ? (
                      <img src={c.avatarUrl} alt={c.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        background: 'var(--bg-elevated)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, fontWeight: 700, color: 'var(--text-primary)',
                      }}>
                        {c.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p className="text-sm font-semibold truncate">{c.username}</p>
                    <span className={`badge ${c.isActive ? 'badge-green' : 'badge-muted'}`} style={{ fontSize: 10 }}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '1.143rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {c.totalCommits}
                    </p>
                    <p className="text-xs text-muted">commits</p>
                  </div>
                </div>

                {/* Dominance bar */}
                <div className="progress-bar mb-2">
                  <div className="progress-fill" style={{
                    width: `${c.dominancePercent}%`,
                    background: i === 0 ? 'var(--accent-green)' : i === 1 ? 'var(--accent-blue)' : 'var(--accent-purple)',
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-xs text-muted">
                    This week: <strong style={{ color: 'var(--text-primary)' }}>{c.last7Days}</strong>
                  </span>
                  <span className="text-xs text-muted">{c.dominancePercent}% of total</span>
                </div>
              </motion.div>
            ))}
      </div>

      {!isLoading && contributors.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <Users size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', display: 'block' }} />
          <h3 style={{ marginBottom: 8 }}>No Contributors Found</h3>
          <p className="text-secondary text-sm">Generate analytics to see contributor data</p>
        </div>
      )}
    </div>
  );
};

export default ContributorsPage;
