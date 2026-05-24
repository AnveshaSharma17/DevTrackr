import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle, Info, TrendingUp, ArrowRight } from 'lucide-react';
import { analyticsApi, aiApi } from '../services/apiServices';
import { useSelectedRepo } from '../context/SelectedRepoContext';
import toast from 'react-hot-toast';

/**
 * Parses Gemini bullet-point text into an array of line strings.
 * Handles lines starting with •, -, *, or numbered lists.
 */
function parseBullets(text) {
  if (!text) return [];
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && /^[•\-\*\d]/.test(l))
    .map((l) => l.replace(/^[•\-\*]\s*/, '').trim());
}

/**
 * Renders AI text as bullet points if it contains bullet markers,
 * otherwise falls back to a plain paragraph.
 */
function BulletList({ text, color = 'var(--text-secondary)' }) {
  const bullets = parseBullets(text);

  if (bullets.length === 0) {
    // Plain paragraph fallback
    return (
      <p style={{ fontSize: 13, color, lineHeight: 1.75 }}>{text}</p>
    );
  }

  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {bullets.map((bullet, i) => {
        // Parse optional **bold label**: rest
        const boldMatch = bullet.match(/^\*\*(.+?)\*\*:\s*(.*)$/);
        const emojiMatch = bullet.match(/^(\S+\s+)\*\*(.+?)\*\*:\s*(.*)$/);

        return (
          <li
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '8px 12px',
              background: 'var(--bg-elevated)',
              borderRadius: 8,
              border: '1px solid var(--border-muted)',
            }}
          >
            {/* Left accent bar */}
            <div style={{ width: 3, minHeight: 18, borderRadius: 2, background: 'var(--accent-green)', flexShrink: 0, marginTop: 2 }} />

            <p style={{ margin: 0, fontSize: 13, color, lineHeight: 1.6 }}>
              {emojiMatch ? (
                <>
                  <span style={{ marginRight: 4 }}>{emojiMatch[1].trim()}</span>
                  <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{emojiMatch[2]}:</strong>
                  <span> {emojiMatch[3]}</span>
                </>
              ) : boldMatch ? (
                <>
                  <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{boldMatch[1]}:</strong>
                  <span> {boldMatch[2]}</span>
                </>
              ) : (
                bullet
              )}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

const priorityIcon = {
  high: AlertTriangle,
  medium: Info,
  low: CheckCircle,
};

const priorityColors = {
  high: { bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.25)', text: 'var(--accent-red-text)' },
  medium: { bg: 'rgba(234,88,12,0.08)', border: 'rgba(234,88,12,0.25)', text: 'var(--accent-orange-text)' },
  low: { bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.25)', text: 'var(--accent-blue-text)' },
};

const AIInsightsPage = () => {
  const { repoId: urlRepoId } = useParams();
  const { selectedRepoId } = useSelectedRepo();
  const repoId = urlRepoId || selectedRepoId; // URL param takes priority
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  if (!repoId) {
    return (
      <div className="page-container fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <motion.div style={{ textAlign: 'center' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Sparkles size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ marginBottom: 8 }}>No Repository Selected</h3>
          <p className="text-secondary text-sm" style={{ marginBottom: '1.5rem' }}>
            Select a repository from the Dashboard to view AI insights
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
  });

  const regenerateMutation = useMutation({
    mutationFn: () => aiApi.generateSummary(repoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', repoId] });
      toast.success('AI insights regenerated!');
    },
    onError: () => toast.error('Failed to regenerate insights'),
  });

  const ai = analytics?.aiSummary;

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(124,58,237,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={20} style={{ color: 'var(--accent-purple-text)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.286rem', fontWeight: 600, marginBottom: 2 }}>AI Insights</h1>
            <p className="text-secondary text-sm">
              {ai?.generatedAt
                ? `Last generated: ${new Date(ai.generatedAt).toLocaleString()}`
                : 'AI-powered productivity analysis'}
            </p>
          </div>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => regenerateMutation.mutate()}
          disabled={regenerateMutation.isPending || isLoading}
        >
          <RefreshCw size={14} style={{ animation: regenerateMutation.isPending ? 'spin 1s linear infinite' : 'none' }} />
          Regenerate Insights
        </button>
      </div>

      {isLoading ? (
        <div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card mb-4">
              <div className="skeleton" style={{ height: 14, width: '30%', marginBottom: 16 }} />
              {[...Array(4)].map((_, j) => (
                <div key={j} className="skeleton" style={{ height: 12, marginBottom: 8, width: `${85 - j * 10}%` }} />
              ))}
            </div>
          ))}
        </div>
      ) : !ai?.sprintSummary ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Sparkles size={56} style={{ color: 'var(--text-muted)', margin: '0 auto 1.5rem', display: 'block' }} />
          <h3 style={{ marginBottom: 8 }}>No AI Insights Yet</h3>
          <p className="text-secondary text-sm" style={{ marginBottom: '1.5rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
            Connect a repository and generate analytics to receive AI-powered productivity insights, sprint summaries, and team health analysis.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => regenerateMutation.mutate()}
            disabled={regenerateMutation.isPending}
          >
            <Sparkles size={14} /> Generate AI Insights
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem' }}>
          {/* Main Content */}
          <div>
            {/* Sprint Summary */}
            <motion.div
              className="card mb-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} style={{ color: 'var(--accent-green-text)' }} />
                <h3 style={{ fontSize: '0.929rem', fontWeight: 600 }}>Sprint Summary</h3>
              </div>
              <BulletList text={ai.sprintSummary} />
            </motion.div>

            {/* Team Health */}
            <motion.div
              className="card mb-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} style={{ color: 'var(--accent-purple-text)' }} />
                <h3 style={{ fontSize: '0.929rem', fontWeight: 600 }}>Team Health Analysis</h3>
              </div>
              <BulletList text={ai.teamHealthAnalysis} />
            </motion.div>

            {/* Bottleneck Analysis */}
            {ai.bottleneckAnalysis && (
              <motion.div
                className="card card-orange mb-4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} style={{ color: 'var(--accent-orange-text)' }} />
                  <h3 style={{ fontSize: '0.929rem', fontWeight: 600 }}>Bottleneck Analysis</h3>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                  {ai.bottleneckAnalysis}
                </p>
              </motion.div>
            )}
          </div>

          {/* Recommendations Sidebar */}
          <div>
            <div className="card" style={{ position: 'sticky', top: 80 }}>
              <div className="flex items-center gap-2 mb-4">
                <h3 style={{ fontSize: '0.929rem', fontWeight: 600 }}>Recommendations</h3>
                {ai.recommendations?.length > 0 && (
                  <span className="badge badge-purple">{ai.recommendations.length}</span>
                )}
              </div>

              {ai.recommendations?.length > 0 ? (
                ai.recommendations.map((rec, i) => {
                  const cfg = priorityColors[rec.priority] || priorityColors.low;
                  const Icon = priorityIcon[rec.priority] || Info;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      style={{
                        background: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                        borderRadius: 10,
                        padding: '12px 14px',
                        marginBottom: 10,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={13} style={{ color: cfg.text, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {rec.title}
                        </span>
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
                        {rec.description}
                      </p>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span style={{
                          fontSize: 10, padding: '2px 7px', borderRadius: 20,
                          background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
                          textTransform: 'capitalize',
                        }}>
                          {rec.priority}
                        </span>
                        <span style={{
                          fontSize: 10, padding: '2px 7px', borderRadius: 20,
                          background: 'var(--bg-elevated)', color: 'var(--text-muted)',
                          textTransform: 'capitalize',
                        }}>
                          {rec.category?.replace('-', ' ')}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <p className="text-sm text-muted" style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  No recommendations yet
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsightsPage;
