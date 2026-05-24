import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, GitCommit, Users, AlertCircle, ArrowRight, Activity } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSelectedRepo } from '../context/SelectedRepoContext';
import { analyticsApi } from '../services/apiServices';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, color = '#238636' }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={18} style={{ color }} />
    </div>
    <div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value ?? '—'}</p>
    </div>
  </div>
);

const chartTooltipStyle = {
  contentStyle: { background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: 'var(--text-secondary)' },
};

export default function AnalyticsPage() {
  const { selectedRepoId } = useSelectedRepo();
  const navigate = useNavigate();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', selectedRepoId],
    queryFn: () => analyticsApi.getAnalytics(selectedRepoId).then((r) => r.data.data),
    enabled: !!selectedRepoId,
  });

  if (!selectedRepoId) {
    return (
      <div className="page-container fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <motion.div style={{ textAlign: 'center' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <BarChart3 size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ marginBottom: 8 }}>No Repository Selected</h3>
          <p className="text-secondary text-sm" style={{ marginBottom: '1.5rem' }}>
            Select a repository from the Dashboard to view its analytics
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            <ArrowRight size={14} /> Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const commitStats    = analytics?.commitStats;
  const contributorStats = analytics?.contributorStats;
  const prStats        = analytics?.prStats;
  const healthScore    = analytics?.healthScore?.overall;
  const daily          = commitStats?.dailyActivity || [];
  const weekly         = commitStats?.weeklyActivity || [];

  return (
    <div className="page-container fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: '1.286rem', fontWeight: 600, marginBottom: 4 }}>Analytics</h1>
          <p className="text-secondary text-sm">
            {analytics?.repoFullName || 'Repository analytics overview'}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      {isLoading ? (
        <div className="stats-grid mb-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="card" style={{ height: 80 }}>
              <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 28, width: '35%' }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="stats-grid mb-6">
          <StatCard icon={GitCommit}  label="Total Commits"       value={commitStats?.total?.toLocaleString()} color="#238636" />
          <StatCard icon={Users}      label="Contributors"         value={contributorStats?.active}             color="#58a6ff" />
          <StatCard icon={TrendingUp} label="Open PRs"             value={prStats?.open}                        color="#a78bfa" />
          <StatCard icon={Activity}   label="Health Score"         value={healthScore ? `${healthScore}/100` : '—'} color={healthScore >= 65 ? '#238636' : healthScore >= 40 ? '#f97316' : '#dc2626'} />
        </div>
      )}

      {/* Charts */}
      <div className="charts-grid mb-6">
        <div className="card">
          <h3 style={{ fontSize: '0.929rem', fontWeight: 600, marginBottom: '1rem' }}>Commit Activity (30 Days)</h3>
          {isLoading ? (
            <div className="skeleton" style={{ height: 200 }} />
          ) : daily.length === 0 || daily.every(d => d.count === 0) ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
              <GitCommit size={28} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No commit activity in the last 30 days</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={(d) => d?.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} allowDecimals={false} />
                <Tooltip {...chartTooltipStyle} />
                <Area type="monotone" dataKey="count" name="Commits" stroke="#238636" fill="rgba(35,134,54,0.15)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.929rem', fontWeight: 600, marginBottom: '1rem' }}>Weekly Velocity</h3>
          {isLoading ? (
            <div className="skeleton" style={{ height: 200 }} />
          ) : weekly.length === 0 || weekly.every(w => w.count === 0) ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
              <TrendingUp size={28} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No weekly activity data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-muted)" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} allowDecimals={false} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="count" name="Commits" fill="#238636" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Issue breakdown */}
      {analytics?.issueStats && (
        <div className="card">
          <h3 style={{ fontSize: '0.929rem', fontWeight: 600, marginBottom: '1rem' }}>Issue Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { label: 'Open Issues', value: analytics.issueStats.open, color: '#f97316' },
              { label: 'Closed Issues', value: analytics.issueStats.closed, color: '#238636' },
              { label: 'Completion Rate', value: `${analytics.issueStats.completionRate ?? 0}%`, color: '#58a6ff' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color, marginBottom: 4 }}>{value ?? '—'}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
