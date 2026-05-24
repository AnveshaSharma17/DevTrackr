import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  GitCommit, GitPullRequest, AlertCircle, Users, Star, GitFork,
  RefreshCw, ExternalLink, Calendar, Activity, Shield
} from 'lucide-react';
import { analyticsApi, githubApi } from '../services/apiServices';
import CommitActivityChart from '../charts/CommitActivityChart';
import PRAnalyticsChart from '../charts/PRAnalyticsChart';
import ContributorBarChart from '../charts/ContributorBarChart';
import SprintVelocityChart from '../charts/SprintVelocityChart';
import toast from 'react-hot-toast';

const MetricRow = ({ label, value, color }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '1px solid var(--border-muted)',
  }}>
    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 600, color: color || 'var(--text-primary)' }}>{value}</span>
  </div>
);

const RepositoryPage = () => {
  const { repoId } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', repoId],
    queryFn: () => analyticsApi.getAnalytics(repoId).then((r) => r.data.data),
    enabled: !!repoId,
  });

  const refreshMutation = useMutation({
    mutationFn: () => analyticsApi.generateAnalytics(repoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', repoId] });
      toast.success('Repository analytics refreshed!');
    },
    onError: () => toast.error('Failed to refresh'),
  });

  const commitStats = analytics?.commitStats;
  const prStats = analytics?.prStats;
  const issueStats = analytics?.issueStats;
  const contributorStats = analytics?.contributorStats;
  const health = analytics?.healthScore;
  const sprint = analytics?.sprintHealth;

  const tabs = ['overview', 'commits', 'pull-requests', 'issues', 'contributors'];

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: '1.286rem', fontWeight: 600, marginBottom: 4 }}>
            Repository Analytics
          </h1>
          <p className="text-secondary text-sm">
            Deep-dive metrics for this repository
          </p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending || isLoading}
        >
          <RefreshCw size={14} style={{ animation: refreshMutation.isPending ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={{ textTransform: 'capitalize' }}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {isLoading && (
        <div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card mb-4">
              <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 200 }} />
            </div>
          ))}
        </div>
      )}

      {!isLoading && analytics && (
        <>
          {activeTab === 'overview' && (
            <div>
              {/* Health Score Overview */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="card card-green">
                  <p className="text-xs text-muted mb-1" style={{ textTransform: 'uppercase' }}>Health Score</p>
                  <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {health?.overall ?? 0}<span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/100</span>
                  </p>
                  <p className={`text-xs ${health?.overall >= 65 ? 'text-green' : health?.overall >= 40 ? 'text-orange' : 'text-red'}`}>
                    {sprint?.status === 'healthy' ? 'Healthy Sprint' : sprint?.status === 'at-risk' ? 'At Risk' : 'Critical'}
                  </p>
                </div>
                <div className="card card-blue">
                  <p className="text-xs text-muted mb-1" style={{ textTransform: 'uppercase' }}>Commit Streak</p>
                  <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {commitStats?.streak ?? 0}<span style={{ fontSize: 14, color: 'var(--text-muted)' }}> days</span>
                  </p>
                  <p className="text-xs text-muted">{commitStats?.avgPerDay} avg/day</p>
                </div>
                <div className="card card-purple">
                  <p className="text-xs text-muted mb-1" style={{ textTransform: 'uppercase' }}>Velocity</p>
                  <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {sprint?.velocity ?? 0}<span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/wk</span>
                  </p>
                  <p className="text-xs text-muted" style={{ textTransform: 'capitalize' }}>{sprint?.velocityTrend}</p>
                </div>
              </div>

              {/* Health Breakdown */}
              <div className="card mb-6">
                <h3 style={{ fontSize: '0.929rem', fontWeight: 600, marginBottom: '1rem' }}>Health Breakdown</h3>
                {health?.breakdown && Object.entries(health.breakdown).map(([key, value]) => (
                  value !== undefined && (
                    <div key={key} style={{ marginBottom: 12 }}>
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{value}/25</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{
                          width: `${(value / 25) * 100}%`,
                          background: value >= 20 ? 'var(--accent-green)' : value >= 12 ? 'var(--accent-orange)' : 'var(--accent-red)',
                        }} />
                      </div>
                    </div>
                  )
                ))}
              </div>

              {/* Charts */}
              <div className="charts-grid">
                <div className="card">
                  <h3 style={{ fontSize: '0.929rem', fontWeight: 600, marginBottom: '1rem' }}>Commit Activity (30 Days)</h3>
                  <CommitActivityChart data={commitStats?.dailyActivity || []} />
                </div>
                <div className="card">
                  <h3 style={{ fontSize: '0.929rem', fontWeight: 600, marginBottom: '1rem' }}>Pull Requests</h3>
                  <PRAnalyticsChart prStats={prStats} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'commits' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="card"><MetricRow label="Total Commits" value={commitStats?.total?.toLocaleString()} /></div>
                <div className="card"><MetricRow label="Last 7 Days" value={commitStats?.last7Days} color="var(--accent-green-text)" /></div>
                <div className="card"><MetricRow label="Last 30 Days" value={commitStats?.last30Days} color="var(--accent-blue-text)" /></div>
                <div className="card"><MetricRow label="Peak Day" value={`${commitStats?.peakDay?.count || 0} commits`} /></div>
              </div>
              <div className="card mb-4">
                <h3 style={{ fontSize: '0.929rem', fontWeight: 600, marginBottom: '1rem' }}>Daily Commit Activity (90 Days)</h3>
                <CommitActivityChart data={commitStats?.dailyActivity || []} />
              </div>
              <div className="card">
                <h3 style={{ fontSize: '0.929rem', fontWeight: 600, marginBottom: '1rem' }}>Weekly Velocity (12 Weeks)</h3>
                <SprintVelocityChart data={commitStats?.weeklyActivity || []} />
              </div>
            </div>
          )}

          {activeTab === 'pull-requests' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Open', value: prStats?.open, color: 'var(--accent-blue-text)' },
                  { label: 'Merged', value: prStats?.merged, color: 'var(--accent-green-text)' },
                  { label: 'Closed', value: prStats?.closed, color: 'var(--text-muted)' },
                  { label: 'Stale (>7d)', value: prStats?.stalePRs, color: 'var(--accent-orange-text)' },
                ].map((m) => (
                  <div key={m.label} className="card">
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>{m.label}</p>
                    <p style={{ fontSize: '1.857rem', fontWeight: 700, color: m.color }}>{m.value ?? 0}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="card">
                  <PRAnalyticsChart prStats={prStats} />
                </div>
                <div className="card">
                  <h3 style={{ fontSize: '0.929rem', fontWeight: 600, marginBottom: '1rem' }}>PR Metrics</h3>
                  <MetricRow label="Merge Rate" value={`${prStats?.mergeRate}%`} color="var(--accent-green-text)" />
                  <MetricRow label="Avg Merge Time" value={`${prStats?.avgMergeTime}h`} />
                  <MetricRow label="Pending Review" value={prStats?.pendingReview} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'issues' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Total', value: issueStats?.total },
                  { label: 'Open', value: issueStats?.open, color: 'var(--accent-orange-text)' },
                  { label: 'Closed', value: issueStats?.closed, color: 'var(--accent-green-text)' },
                  { label: 'Completion', value: `${issueStats?.completionRate}%`, color: 'var(--accent-blue-text)' },
                ].map((m) => (
                  <div key={m.label} className="card">
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>{m.label}</p>
                    <p style={{ fontSize: '1.857rem', fontWeight: 700, color: m.color || 'var(--text-primary)' }}>{m.value ?? 0}</p>
                  </div>
                ))}
              </div>
              <div className="card">
                <h3 style={{ fontSize: '0.929rem', fontWeight: 600, marginBottom: '1rem' }}>Issue Details</h3>
                <MetricRow label="Avg Resolution Time" value={`${issueStats?.avgResolutionTime}h`} />
                {issueStats?.byLabel?.map((l) => (
                  <MetricRow key={l.label} label={`Label: ${l.label}`} value={l.count} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contributors' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem' }}>
                <div className="card">
                  <h3 style={{ fontSize: '0.929rem', fontWeight: 600, marginBottom: '1rem' }}>Contributors</h3>
                  <ContributorBarChart contributors={contributorStats?.contributors || []} />

                  <div style={{ marginTop: '1.5rem' }}>
                    {contributorStats?.contributors?.map((c) => (
                      <div key={c.username} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 0',
                        borderBottom: '1px solid var(--border-muted)',
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: c.isActive ? 'var(--accent-green)' : 'var(--bg-elevated)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0,
                          overflow: 'hidden',
                        }}>
                          {c.avatarUrl ? (
                            <img src={c.avatarUrl} alt={c.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            c.username[0].toUpperCase()
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className="text-sm font-medium truncate">{c.username}</p>
                          <p className="text-xs text-muted">{c.totalCommits} commits · {c.dominancePercent}%</p>
                        </div>
                        <span className={`badge ${c.isActive ? 'badge-green' : 'badge-muted'}`}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h3 style={{ fontSize: '0.929rem', fontWeight: 600, marginBottom: '1rem' }}>Team Stats</h3>
                  <MetricRow label="Total Contributors" value={contributorStats?.total} />
                  <MetricRow label="Active (14d)" value={contributorStats?.active} color="var(--accent-green-text)" />
                  <MetricRow label="Inactive" value={contributorStats?.inactive} color="var(--accent-red-text)" />
                  {contributorStats?.dominanceRisk && (
                    <div style={{
                      marginTop: 12,
                      padding: '10px 12px',
                      background: 'rgba(234,88,12,0.1)',
                      border: '1px solid rgba(234,88,12,0.3)',
                      borderRadius: 8,
                    }}>
                      <p style={{ fontSize: 12, color: 'var(--accent-orange-text)', fontWeight: 600 }}>⚠ Dominance Risk</p>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                        {contributorStats.dominantContributor} handles too many commits
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!isLoading && !analytics && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <Activity size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', display: 'block' }} />
          <h3 style={{ marginBottom: 8 }}>No Analytics Yet</h3>
          <p className="text-secondary text-sm" style={{ marginBottom: '1.5rem' }}>
            Generate analytics to see detailed repository insights
          </p>
          <button className="btn btn-primary" onClick={() => refreshMutation.mutate()} disabled={refreshMutation.isPending}>
            <RefreshCw size={14} />
            Generate Analytics
          </button>
        </div>
      )}
    </div>
  );
};

export default RepositoryPage;
