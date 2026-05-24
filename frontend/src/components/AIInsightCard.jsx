import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, RefreshCw, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../services/apiServices';
import toast from 'react-hot-toast';

// ─── Shared bullet-point renderer ────────────────────────────────────────────
function parseBullets(text) {
  if (!text) return [];
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && /^[•\-\*\d]/.test(l))
    .map((l) => l.replace(/^[•\-\*]\s*/, '').trim());
}

function BulletList({ text }) {
  const bullets = parseBullets(text);

  if (bullets.length === 0) {
    // Fallback: plain paragraph
    return (
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        {text || 'No data available.'}
      </p>
    );
  }

  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {bullets.map((bullet, i) => {
        const em = bullet.match(/^(\S+\s+)\*\*(.+?)\*\*:\s*(.*)$/);
        const bm = bullet.match(/^\*\*(.+?)\*\*:\s*(.*)$/);
        return (
          <li
            key={i}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              padding: '7px 10px',
              background: 'var(--bg-elevated)',
              borderRadius: 7,
              border: '1px solid var(--border-muted)',
            }}
          >
            <div style={{ width: 3, minHeight: 16, borderRadius: 2, background: 'var(--accent-green)', flexShrink: 0, marginTop: 3 }} />
            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              {em ? (
                <><span style={{ marginRight: 3 }}>{em[1].trim()}</span><strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{em[2]}:</strong><span> {em[3]}</span></>
              ) : bm ? (
                <><strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{bm[1]}:</strong><span> {bm[2]}</span></>
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

const priorityConfig = {
  high: { color: 'var(--accent-red-text)', bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.3)', icon: AlertTriangle },
  medium: { color: 'var(--accent-orange-text)', bg: 'rgba(234,88,12,0.1)', border: 'rgba(234,88,12,0.3)', icon: Info },
  low: { color: 'var(--accent-blue-text)', bg: 'rgba(37,99,235,0.1)', border: 'rgba(37,99,235,0.3)', icon: CheckCircle },
};

const RecommendationItem = ({ rec, index }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = priorityConfig[rec.priority] || priorityConfig.low;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      style={{
        border: `1px solid ${cfg.border}`,
        borderRadius: 10,
        marginBottom: 8,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          background: cfg.bg,
          border: 'none',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <Icon size={14} style={{ color: cfg.color, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
            {rec.title}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{
              fontSize: 11,
              padding: '1px 6px',
              borderRadius: 20,
              background: cfg.bg,
              color: cfg.color,
              border: `1px solid ${cfg.border}`,
              textTransform: 'capitalize',
            }}>
              {rec.priority}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {rec.category?.replace('-', ' ')}
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        ) : (
          <ChevronDown size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '10px 14px', borderTop: `1px solid ${cfg.border}`, background: 'var(--bg-surface)' }}>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
                {rec.description}
              </p>
              {rec.actionItems?.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Action Items
                  </p>
                  {rec.actionItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                      <span style={{ color: cfg.color, marginTop: 2, flexShrink: 0 }}>•</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const AIInsightCard = ({ aiSummary, repoId, loading }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const queryClient = useQueryClient();

  const regenerateMutation = useMutation({
    mutationFn: () => aiApi.generateSummary(repoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', repoId] });
      toast.success('AI insights regenerated!');
    },
    onError: () => toast.error('Failed to regenerate AI insights'),
  });

  const tabs = [
    { key: 'summary', label: 'Sprint Summary' },
    { key: 'team', label: 'Team Health' },
    { key: 'recommendations', label: `Recommendations ${aiSummary?.recommendations?.length ? `(${aiSummary.recommendations.length})` : ''}` },
  ];

  return (
    <div className="card" style={{ background: 'var(--bg-surface)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'rgba(124,58,237,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={14} style={{ color: 'var(--accent-purple-text)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.929rem', fontWeight: 600 }}>AI Insights</h3>
            {aiSummary?.generatedAt && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {new Date(aiSummary.generatedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => regenerateMutation.mutate()}
          disabled={regenerateMutation.isPending || loading}
          title="Regenerate AI insights"
        >
          <RefreshCw size={13} style={{
            animation: regenerateMutation.isPending ? 'spin 1s linear infinite' : 'none',
          }} />
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div>
          <div className="skeleton" style={{ height: 12, marginBottom: 8, width: '90%' }} />
          <div className="skeleton" style={{ height: 12, marginBottom: 8, width: '75%' }} />
          <div className="skeleton" style={{ height: 12, marginBottom: 8, width: '85%' }} />
          <div className="skeleton" style={{ height: 12, width: '60%' }} />
        </div>
      ) : !aiSummary?.sprintSummary ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <Sparkles size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', display: 'block' }} />
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            No AI insights yet. Generate analytics to get AI-powered recommendations.
          </p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => regenerateMutation.mutate()}
            disabled={regenerateMutation.isPending}
          >
            <Sparkles size={13} />
            Generate Insights
          </button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'summary' && (
              <BulletList text={aiSummary.sprintSummary} />
            )}
            {activeTab === 'team' && (
              <BulletList text={aiSummary.teamHealthAnalysis} />
            )}
            {activeTab === 'recommendations' && (
              <div>
                {aiSummary.recommendations?.length > 0 ? (
                  aiSummary.recommendations.map((rec, i) => (
                    <RecommendationItem key={i} rec={rec} index={i} />
                  ))
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                    No recommendations generated yet.
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default AIInsightCard;
