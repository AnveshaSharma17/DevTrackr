import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  GitCommit, GitPullRequest, AlertCircle, Users, 
  Zap, RefreshCw, Plus, ExternalLink, TrendingUp,
  TrendingDown, Minus, Activity, Shield, Loader
} from 'lucide-react';
import { githubApi, analyticsApi } from '../services/apiServices';
import { useAuth } from '../context/AuthContext';
import { useSelectedRepo } from '../context/SelectedRepoContext';
import toast from 'react-hot-toast';
import CommitActivityChart from '../charts/CommitActivityChart';
import PRAnalyticsChart from '../charts/PRAnalyticsChart';
import ContributorBarChart from '../charts/ContributorBarChart';
import SprintVelocityChart from '../charts/SprintVelocityChart';
import AIInsightCard from '../components/AIInsightCard';
import { AddRepoModal } from '../components/RepoSelector';
import SkeletonStats from '../components/ui/SkeletonLoader';

const StatCard = ({ icon: Icon, label, value, sub, color = 'blue', trend }) => {
  const colorMap = {
    green: 'var(--accent-green-text)',
    blue: 'var(--accent-blue-text)',
    purple: 'var(--accent-purple-text)',
    cyan: 'var(--accent-cyan-text)',
    orange: 'var(--accent-orange-text)',
    red: 'var(--accent-red-text)',
  };

  return (
    <motion.div
      className={`card card-${color}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted font-medium" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: `${colorMap[color]}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={16} style={{ color: colorMap[color] }} />
        </div>
      </div>
      <div style={{ fontSize: '1.857rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
        {value ?? '—'}
      </div>
      {sub && (
        <div className="flex items-center gap-1 mt-1">
          {trend === 'up' && <TrendingUp size={12} style={{ color: 'var(--accent-green-text)' }} />}
          {trend === 'down' && <TrendingDown size={12} style={{ color: 'var(--accent-red-text)' }} />}
          {trend === 'stable' && <Minus size={12} style={{ color: 'var(--text-muted)' }} />}
          <span className="text-xs text-muted">{sub}</span>
        </div>
      )}
    </motion.div>
  );
};

const HealthBadge = ({ score }) => {
  if (score === undefined) return null;
  let color = 'green', label = 'Healthy';
  if (score < 40) { color = 'red'; label = 'Critical'; }
  else if (score < 65) { color = 'orange'; label = 'At Risk'; }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className={`badge badge-${color}`}>
        <Shield size={10} />
        {label}
      </div>
      <span style={{ fontSize: '1.286rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        {score}<span style={{ fontSize: '0.857rem', color: 'var(--text-muted)', fontWeight: 400 }}>/100</span>
      </span>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { selectedRepoId: ctxRepoId, setSelectedRepoId: setCtxRepoId } = useSelectedRepo();
  const [localRepoId, setLocalRepoId] = useState(ctxRepoId);
  const [connectingGitHub, setConnectingGitHub] = useState(false);
  const [addRepoOpen, setAddRepoOpen] = useState(false);

  // Keep context in sync with local selection
  const handleSelectRepo = (id) => {
    setLocalRepoId(id);
    setCtxRepoId(id);
  };

  // Launch GitHub OAuth
  async function handleConnectGitHub() {
    setConnectingGitHub(true);
    try {
      const res = await githubApi.getConnectUrl();
      const url = res.data?.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        toast.error('Could not get GitHub OAuth URL. Please try again.');
        setConnectingGitHub(false);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to connect GitHub.');
      setConnectingGitHub(false);
    }
  }

  // Fetch connected repos
  const { data: reposData } = useQuery({
    queryKey: ['connected-repos'],
    queryFn: () => githubApi.getConnectedRepos().then((r) => r.data.data),
  });

  const repos = reposData || [];

  // Auto-select first repo (prefer context value, then first repo)
  const activeRepo = repos.find((r) => r._id === localRepoId) || repos[0];
  const activeRepoId = activeRepo?._id;

  // Sync activeRepoId to context whenever it settles
  useEffect(() => {
    if (activeRepoId && activeRepoId !== ctxRepoId) {
      setCtxRepoId(activeRepoId);
    }
  }, [activeRepoId]);

  // Fetch analytics for active repo
  const {
    data: analytics,
    isLoading: analyticsLoading,
    isError,
  } = useQuery({
    queryKey: ['analytics', activeRepoId],
    queryFn: () => analyticsApi.getAnalytics(activeRepoId).then((r) => r.data.data),
    enabled: !!activeRepoId,
  });

  // Refresh mutation
  const refreshMutation = useMutation({
    mutationFn: () => analyticsApi.generateAnalytics(activeRepoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', activeRepoId] });
      toast.success('Analytics refreshed!');
    },
    onError: () => toast.error('Failed to refresh analytics'),
  });

  const commitStats = analytics?.commitStats;
  const prStats = analytics?.prStats;
  const issueStats = analytics?.issueStats;
  const contributorStats = analytics?.contributorStats;
  const sprintHealth = analytics?.sprintHealth;
  const aiSummary = analytics?.aiSummary;

  return (
    <div className="page-container fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: '1.286rem', fontWeight: 600, marginBottom: 4 }}>
            Dashboard
          </h1>
          <p className="text-secondary text-sm">
            {activeRepo
              ? `Analyzing ${activeRepo.fullName}`
              : 'Connect a repository to get started'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeRepoId && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
            >
              <RefreshCw size={14} style={{ 
                animation: refreshMutation.isPending ? 'spin 1s linear infinite' : 'none' 
              }} />
              Refresh
            </button>
          )}
          <HealthBadge score={analytics?.healthScore?.overall} />
        </div>
      </div>

      {/* Add Repository Modal — triggered from empty-state button below */}
      <AddRepoModal
        open={addRepoOpen}
        onClose={() => setAddRepoOpen(false)}
        trackedRepos={repos}
        onRepoAdded={(id) => { handleSelectRepo(id); setAddRepoOpen(false); }}
      />

      {/* No GitHub connection */}
      {!user?.isGithubConnected && (
        <motion.div
          className="card"
          style={{ textAlign: 'center', padding: '3rem 2rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <GitCommit size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ marginBottom: 8 }}>Connect Your GitHub Account</h3>
          <p className="text-secondary text-sm" style={{ marginBottom: '1.5rem' }}>
            Connect GitHub to start analyzing your repositories with AI
          </p>
          <button
            onClick={handleConnectGitHub}
            disabled={connectingGitHub}
            className="btn btn-primary"
            style={{ opacity: connectingGitHub ? 0.7 : 1, cursor: connectingGitHub ? 'not-allowed' : 'pointer' }}
          >
            {connectingGitHub
              ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Connecting…</>
              : <><Plus size={14} /> Connect GitHub</>}
          </button>
        </motion.div>
      )}

      {/* No repos connected */}
      {user?.isGithubConnected && repos.length === 0 && (
        <motion.div
          className="card"
          style={{ textAlign: 'center', padding: '3rem 2rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Activity size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ marginBottom: 8 }}>No Repositories Tracked</h3>
          <p className="text-secondary text-sm" style={{ marginBottom: '1.5rem' }}>
            Click below to choose which GitHub repositories to analyze with AI
          </p>
          <button
            onClick={() => setAddRepoOpen(true)}
            className="btn btn-primary"
          >
            <Plus size={14} /> Add Repository
          </button>
        </motion.div>
      )}

      {/* Main Dashboard Content */}
      {activeRepoId && (
        <>
          {/* Stats Cards */}
          {analyticsLoading ? (
            <div className="stats-grid mb-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="card" style={{ height: 100 }}>
                  <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 32, width: '40%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 10, width: '50%' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="stats-grid mb-6">
              <StatCard
                icon={GitCommit}
                label="Total Commits"
                value={commitStats?.total?.toLocaleString()}
                sub={`${commitStats?.last7Days || 0} this week`}
                color="green"
                trend={commitStats?.last7Days > 5 ? 'up' : commitStats?.last7Days < 2 ? 'down' : 'stable'}
              />
              <StatCard
                icon={GitPullRequest}
                label="Open PRs"
                value={prStats?.open}
                sub={`${prStats?.merged || 0} merged this month`}
                color="blue"
              />
              <StatCard
                icon={AlertCircle}
                label="Open Issues"
                value={issueStats?.open}
                sub={`${issueStats?.completionRate || 0}% completion rate`}
                color="orange"
              />
              <StatCard
                icon={Users}
                label="Active Contributors"
                value={contributorStats?.active}
                sub={`${contributorStats?.total || 0} total contributors`}
                color="purple"
              />
              <StatCard
                icon={Zap}
                label="Sprint Velocity"
                value={sprintHealth?.velocity}
                sub={`commits/week — ${sprintHealth?.velocityTrend || 'stable'}`}
                color="cyan"
                trend={sprintHealth?.velocityTrend === 'increasing' ? 'up' : 
                       sprintHealth?.velocityTrend === 'decreasing' ? 'down' : 'stable'}
              />
            </div>
          )}

          {/* Charts Row 1 */}
          <div className="charts-grid mb-6">
            <div className="card">
              <h3 style={{ fontSize: '0.929rem', fontWeight: 600, marginBottom: '1rem' }}>
                Commit Activity
              </h3>
              {analyticsLoading ? (
                <div className="skeleton" style={{ height: 200 }} />
              ) : (
                <CommitActivityChart data={commitStats?.dailyActivity || []} />
              )}
            </div>
            <div className="card">
              <h3 style={{ fontSize: '0.929rem', fontWeight: 600, marginBottom: '1rem' }}>
                Pull Request Overview
              </h3>
              {analyticsLoading ? (
                <div className="skeleton" style={{ height: 200 }} />
              ) : (
                <PRAnalyticsChart prStats={prStats} />
              )}
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="charts-grid mb-6">
            <div className="card">
              <h3 style={{ fontSize: '0.929rem', fontWeight: 600, marginBottom: '1rem' }}>
                Sprint Velocity (12 Weeks)
              </h3>
              {analyticsLoading ? (
                <div className="skeleton" style={{ height: 200 }} />
              ) : (
                <SprintVelocityChart data={commitStats?.weeklyActivity || []} />
              )}
            </div>
            <div className="card">
              <h3 style={{ fontSize: '0.929rem', fontWeight: 600, marginBottom: '1rem' }}>
                Top Contributors
              </h3>
              {analyticsLoading ? (
                <div className="skeleton" style={{ height: 200 }} />
              ) : (
                <ContributorBarChart contributors={contributorStats?.contributors?.slice(0, 6) || []} />
              )}
            </div>
          </div>

          {/* AI Insights + Bottlenecks */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.143rem' }}>
            <AIInsightCard aiSummary={aiSummary} repoId={activeRepoId} loading={analyticsLoading} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Sprint Health */}
              <div className="card">
                <h3 style={{ fontSize: '0.929rem', fontWeight: 600, marginBottom: '1rem' }}>
                  Sprint Health
                </h3>
                {sprintHealth && (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-secondary">Health Score</span>
                      <HealthBadge score={sprintHealth.score} />
                    </div>
                    <div className="progress-bar mb-3">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${sprintHealth.score}%`,
                          background: sprintHealth.score >= 65
                            ? 'var(--accent-green)'
                            : sprintHealth.score >= 40
                            ? 'var(--accent-orange)'
                            : 'var(--accent-red)',
                        }}
                      />
                    </div>
                    {sprintHealth.bottlenecks?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted font-medium mb-2" style={{ textTransform: 'uppercase' }}>
                          Bottlenecks
                        </p>
                        {sprintHealth.bottlenecks.map((b, i) => (
                          <div key={i} className="flex items-center gap-2 mb-1">
                            <AlertCircle size={12} style={{ color: 'var(--accent-orange-text)', flexShrink: 0 }} />
                            <span className="text-xs text-secondary">{b}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {sprintHealth.risks?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-muted font-medium mb-2" style={{ textTransform: 'uppercase' }}>
                          Risks
                        </p>
                        {sprintHealth.risks.map((r, i) => (
                          <div key={i} className="flex items-center gap-2 mb-1">
                            <AlertCircle size={12} style={{ color: 'var(--accent-red-text)', flexShrink: 0 }} />
                            <span className="text-xs text-secondary">{r}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {!sprintHealth.bottlenecks?.length && !sprintHealth.risks?.length && (
                      <p className="text-xs text-green" style={{ color: 'var(--accent-green-text)' }}>
                        ✓ No critical issues detected
                      </p>
                    )}
                  </>
                )}
                {!sprintHealth && !analyticsLoading && (
                  <p className="text-sm text-muted">Generate analytics to see sprint health</p>
                )}
              </div>

              {/* Contributor Risk */}
              {contributorStats?.dominanceRisk && (
                <div className="card card-orange">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={16} style={{ color: 'var(--accent-orange-text)' }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--accent-orange-text)' }}>
                      Bus Factor Risk
                    </span>
                  </div>
                  <p className="text-xs text-secondary">
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {contributorStats.dominantContributor}
                    </strong>{' '}
                    handles the majority of commits. Consider distributing work across the team.
                  </p>
                </div>
              )}

              {/* Quick repo link */}
              {activeRepo?.htmlUrl && (
                <a
                  href={activeRepo.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card flex items-center justify-between"
                  style={{ textDecoration: 'none' }}
                >
                  <div>
                    <p className="text-sm font-medium">{activeRepo.name}</p>
                    <p className="text-xs text-muted">{activeRepo.language || 'Unknown language'}</p>
                  </div>
                  <ExternalLink size={14} style={{ color: 'var(--text-muted)' }} />
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
