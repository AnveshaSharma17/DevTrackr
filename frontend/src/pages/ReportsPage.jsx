import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FileText, ArrowRight, Shield, Zap, AlertCircle,
  CheckCircle, TrendingDown, TrendingUp, AlertTriangle,
  Info, Activity, Download,
} from 'lucide-react';
import { useSelectedRepo } from '../context/SelectedRepoContext';
import { analyticsApi } from '../services/apiServices';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse Gemini bullet text → array of plain line strings */
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
    return <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.75 }}>{text}</p>;
  }
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {bullets.map((bullet, i) => {
        const em = bullet.match(/^(\S+\s+)\*\*(.+?)\*\*:\s*(.*)$/);
        const bm = bullet.match(/^\*\*(.+?)\*\*:\s*(.*)$/);
        return (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-muted)' }}>
            <div style={{ width: 3, minHeight: 18, borderRadius: 2, background: 'var(--accent-green)', flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {em ? (<><span style={{ marginRight: 4 }}>{em[1].trim()}</span><strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{em[2]}:</strong><span> {em[3]}</span></>) :
               bm ? (<><strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{bm[1]}:</strong><span> {bm[2]}</span></>) :
               bullet}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

const PRIORITY_COLORS = {
  high:   { bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.25)',  text: 'var(--accent-red-text)',    icon: AlertTriangle },
  medium: { bg: 'rgba(234,88,12,0.08)',  border: 'rgba(234,88,12,0.25)',  text: 'var(--accent-orange-text)', icon: Info },
  low:    { bg: 'rgba(37,99,235,0.08)',  border: 'rgba(37,99,235,0.25)',  text: 'var(--accent-blue-text)',   icon: CheckCircle },
};

// ─── PDF/Print export ──────────────────────────────────────────────────────────

function buildReportHTML(analytics, repoName) {
  const sprintHealth    = analytics?.sprintHealth;
  const aiSummary       = analytics?.aiSummary;
  const healthScore     = sprintHealth?.score ?? analytics?.healthScore?.overall ?? 'N/A';
  const commitStats     = analytics?.commitStats;
  const recommendations = Array.isArray(aiSummary?.recommendations) ? aiSummary.recommendations : [];
  const generatedAt     = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });

  const scoreColor = typeof healthScore === 'number'
    ? (healthScore >= 65 ? '#238636' : healthScore >= 40 ? '#ea580c' : '#dc2626')
    : '#6b7280';

  const bulletRows = (text) =>
    parseBullets(text || '')
      .map((b) => `<li style="margin-bottom:6px;padding:6px 10px;background:#f6f8fa;border-radius:6px;border-left:3px solid #238636;font-size:13px;color:#24292f;">${b.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</li>`)
      .join('') || '<li style="color:#6b7280;font-size:13px;">No data available.</li>';

  const recRows = recommendations.map((rec) => {
    const color = rec.priority === 'high' ? '#dc2626' : rec.priority === 'medium' ? '#ea580c' : '#2563eb';
    const items = Array.isArray(rec.actionItems) && rec.actionItems.length > 0
      ? `<ul style="margin:6px 0 0 16px;padding:0;">${rec.actionItems.map((a) => `<li style="font-size:12px;color:#57606a;margin-bottom:3px;">${a}</li>`).join('')}</ul>`
      : '';
    return `
      <div style="margin-bottom:12px;padding:12px 14px;border-radius:8px;border:1px solid ${color}44;background:${color}0d;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <span style="font-size:13px;font-weight:600;color:#24292f;flex:1;">${rec.title || 'Recommendation'}</span>
          <span style="font-size:10px;padding:2px 8px;border-radius:20px;background:${color}22;color:${color};border:1px solid ${color}44;text-transform:capitalize;">${rec.priority || 'low'}</span>
          ${rec.category ? `<span style="font-size:10px;padding:2px 8px;border-radius:20px;background:#f0f2f5;color:#57606a;text-transform:capitalize;">${String(rec.category).replace(/-/g, ' ')}</span>` : ''}
        </div>
        ${rec.description ? `<p style="font-size:12px;color:#57606a;margin:0 0 4px;line-height:1.6;">${rec.description}</p>` : ''}
        ${items}
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>DevTrackr Report — ${repoName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #24292f; padding: 40px; max-width: 900px; margin: 0 auto; }
    h1  { font-size: 22px; font-weight: 700; color: #1a1f2e; }
    h2  { font-size: 15px; font-weight: 600; color: #1a1f2e; margin-bottom: 12px; border-bottom: 2px solid #238636; padding-bottom: 6px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #e4e8ec; }
    .section { margin-bottom: 28px; padding: 18px 20px; border: 1px solid #e4e8ec; border-radius: 10px; background: #fff; }
    .score { font-size: 40px; font-weight: 800; color: ${scoreColor}; line-height: 1; }
    .score-label { font-size: 12px; color: #6b7280; margin-top: 2px; }
    .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
    .stat { padding: 12px 14px; background: #f6f8fa; border-radius: 8px; border: 1px solid #e4e8ec; }
    .stat-val { font-size: 20px; font-weight: 700; color: #1a1f2e; }
    .stat-lbl { font-size: 11px; color: #6b7280; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }
    ul.bullets { list-style: none; padding: 0; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 500; }
    .badge-green  { background: #e8f5e9; color: #238636; }
    .badge-orange { background: #fff3e0; color: #ea580c; }
    .badge-red    { background: #ffebee; color: #dc2626; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e4e8ec; font-size: 11px; color: #8c959f; display: flex; justify-content: space-between; }
    @media print { body { padding: 20px; } .section { break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>📊 DevTrackr Report</h1>
      <p style="font-size:14px;color:#57606a;margin-top:4px;">${repoName}</p>
      <p style="font-size:12px;color:#8c959f;margin-top:2px;">Generated: ${generatedAt}</p>
    </div>
    <div style="text-align:right;">
      <div class="score">${healthScore}</div>
      <div class="score-label">Health Score / 100</div>
      ${sprintHealth?.status ? `<span class="badge badge-${sprintHealth.status === 'healthy' ? 'green' : sprintHealth.status === 'at-risk' ? 'orange' : 'red'}" style="margin-top:6px;">${sprintHealth.status}</span>` : ''}
    </div>
  </div>

  <div class="section">
    <h2>📈 Key Metrics</h2>
    <div class="stat-grid">
      <div class="stat"><div class="stat-val">${commitStats?.total ?? 'N/A'}</div><div class="stat-lbl">Total Commits</div></div>
      <div class="stat"><div class="stat-val">${commitStats?.last7Days ?? 'N/A'}</div><div class="stat-lbl">Last 7 Days</div></div>
      <div class="stat"><div class="stat-val">${sprintHealth?.velocity ?? 'N/A'}</div><div class="stat-lbl">Commits / Week</div></div>
      <div class="stat"><div class="stat-val">${analytics?.contributorStats?.active ?? 'N/A'}</div><div class="stat-lbl">Active Contributors</div></div>
      <div class="stat"><div class="stat-val">${analytics?.prStats?.open ?? 'N/A'}</div><div class="stat-lbl">Open Pull Requests</div></div>
      <div class="stat"><div class="stat-val" style="text-transform:capitalize;">${sprintHealth?.velocityTrend ?? 'stable'}</div><div class="stat-lbl">Velocity Trend</div></div>
    </div>
    ${sprintHealth?.bottlenecks?.length > 0 ? `<p style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;font-weight:600;">Bottlenecks</p>${sprintHealth.bottlenecks.map((b) => `<div style="font-size:12px;color:#57606a;padding:4px 0;border-bottom:1px solid #f0f2f5;">⚠️ ${b}</div>`).join('')}` : ''}
    ${sprintHealth?.risks?.length > 0 ? `<p style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;margin:12px 0 6px;font-weight:600;">Risks</p>${sprintHealth.risks.map((r) => `<div style="font-size:12px;color:#57606a;padding:4px 0;border-bottom:1px solid #f0f2f5;">🔴 ${r}</div>`).join('')}` : ''}
  </div>

  ${aiSummary?.sprintSummary ? `<div class="section"><h2>⚡ AI Sprint Summary</h2><ul class="bullets">${bulletRows(aiSummary.sprintSummary)}</ul></div>` : ''}
  ${aiSummary?.teamHealthAnalysis ? `<div class="section"><h2>🛡️ Team Health Analysis</h2><ul class="bullets">${bulletRows(aiSummary.teamHealthAnalysis)}</ul></div>` : ''}
  ${aiSummary?.bottleneckAnalysis ? `<div class="section"><h2>⚠️ Bottleneck Analysis</h2><p style="font-size:13px;color:#57606a;line-height:1.75;">${aiSummary.bottleneckAnalysis}</p></div>` : ''}
  ${recommendations.length > 0 ? `<div class="section"><h2>✅ AI Recommendations (${recommendations.length})</h2>${recRows}</div>` : ''}

  <div class="footer">
    <span>DevTrackr — AI-Powered Developer Analytics</span>
    <span>${repoName} · ${generatedAt}</span>
  </div>
</body>
</html>`;
}

function exportReport(analytics, repoName) {
  const html = buildReportHTML(analytics, repoName);
  const win = window.open('', '_blank');
  if (!win) {
    toast.error('Pop-up blocked — please allow pop-ups for this site and try again.');
    return;
  }
  win.document.write(html);
  win.document.close();
  // Give the browser a moment to render before triggering print
  setTimeout(() => { try { win.print(); } catch (_) {} }, 600);
}

// ─── Page Component ────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { selectedRepoId } = useSelectedRepo();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', selectedRepoId],
    queryFn: () => analyticsApi.getAnalytics(selectedRepoId).then((r) => r.data.data),
    enabled: !!selectedRepoId,
  });

  /* ── No repo selected ── */
  if (!selectedRepoId) {
    return (
      <div className="page-container fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <motion.div style={{ textAlign: 'center' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <FileText size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ marginBottom: 8 }}>No Repository Selected</h3>
          <p className="text-secondary text-sm" style={{ marginBottom: '1.5rem' }}>
            Select a repository from the Dashboard to generate a report
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            <ArrowRight size={14} /> Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  /* ── Derived values ── */
  const sprintHealth    = analytics?.sprintHealth;
  const aiSummary       = analytics?.aiSummary;
  const healthScore     = sprintHealth?.score ?? analytics?.healthScore?.overall;
  const repoName        = analytics?.repoFullName || selectedRepoId || 'Repository';
  const recommendations = Array.isArray(aiSummary?.recommendations) ? aiSummary.recommendations : [];

  function handleExport() {
    if (!analytics) {
      toast.error('No data to export yet — wait for analytics to load.');
      return;
    }
    setExporting(true);
    toast.success('Opening report — use Print › Save as PDF to download.', { duration: 4500 });
    try {
      exportReport(analytics, repoName);
    } finally {
      setTimeout(() => setExporting(false), 1400);
    }
  }

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: '1.286rem', fontWeight: 600, marginBottom: 4 }}>Reports</h1>
          <p className="text-secondary text-sm">
            {analytics?.repoFullName || 'Sprint summary and AI insights'}
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={handleExport}
          disabled={isLoading || exporting}
          style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: (isLoading || exporting) ? 0.65 : 1 }}
        >
          <Download size={14} />
          {exporting ? 'Opening…' : 'Export Report'}
        </button>
      </div>

      {/* Loading skeletons */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ height: 160 }}>
              <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 16 }} />
              <div className="skeleton" style={{ height: 12, width: '90%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 12, width: '70%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 12, width: '80%' }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* ── Sprint Health Card ── */}
          <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} style={{ color: 'var(--accent-green-text)' }} />
              <h3 style={{ fontSize: '0.929rem', fontWeight: 600 }}>Sprint Health Summary</h3>
              {sprintHealth?.status && (
                <span className={`badge badge-${sprintHealth.status === 'healthy' ? 'green' : sprintHealth.status === 'at-risk' ? 'orange' : 'red'}`} style={{ marginLeft: 'auto', fontSize: 11 }}>
                  {sprintHealth.status}
                </span>
              )}
            </div>

            {healthScore !== undefined ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-secondary">Overall Health Score</span>
                  <span style={{
                    fontWeight: 700, fontSize: '1.1rem',
                    color: healthScore >= 65 ? 'var(--accent-green-text)' : healthScore >= 40 ? 'var(--accent-orange-text)' : 'var(--accent-red-text)',
                  }}>
                    {healthScore}<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>/100</span>
                  </span>
                </div>
                <div className="progress-bar mb-4">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${healthScore}%`,
                      background: healthScore >= 65 ? 'var(--accent-green)' : healthScore >= 40 ? 'var(--accent-orange)' : 'var(--accent-red)',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <p className="text-xs text-muted font-medium mb-2" style={{ textTransform: 'uppercase' }}>Velocity</p>
                    <p className="text-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Zap size={13} style={{ color: 'var(--accent-blue-text)' }} />
                      {sprintHealth?.velocity ?? 0} commits/week
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted font-medium mb-2" style={{ textTransform: 'uppercase' }}>Trend</p>
                    <p className="text-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, textTransform: 'capitalize' }}>
                      {sprintHealth?.velocityTrend === 'increasing'
                        ? <TrendingUp size={13} style={{ color: 'var(--accent-green-text)' }} />
                        : <TrendingDown size={13} style={{ color: 'var(--text-muted)' }} />}
                      {sprintHealth?.velocityTrend || 'stable'}
                    </p>
                  </div>
                </div>

                {sprintHealth?.bottlenecks?.length > 0 && (
                  <div>
                    <p className="text-xs text-muted font-medium mb-2" style={{ textTransform: 'uppercase' }}>Bottlenecks</p>
                    {sprintHealth.bottlenecks.map((b, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1">
                        <AlertCircle size={12} style={{ color: 'var(--accent-orange-text)', flexShrink: 0 }} />
                        <span className="text-xs text-secondary">{String(b)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {sprintHealth?.risks?.length > 0 && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <p className="text-xs text-muted font-medium mb-2" style={{ textTransform: 'uppercase' }}>Risks</p>
                    {sprintHealth.risks.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1">
                        <Activity size={12} style={{ color: 'var(--accent-red-text)', flexShrink: 0 }} />
                        <span className="text-xs text-secondary">{String(r)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted">No sprint health data yet. Refresh analytics from the Dashboard.</p>
            )}
          </motion.div>

          {/* ── AI Sprint Summary ── */}
          <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} style={{ color: 'var(--accent-blue-text)' }} />
              <h3 style={{ fontSize: '0.929rem', fontWeight: 600 }}>AI Sprint Summary</h3>
            </div>
            <BulletList text={aiSummary?.sprintSummary} />
          </motion.div>

          {/* ── Team Health Analysis ── */}
          {aiSummary?.teamHealthAnalysis && (
            <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
              <div className="flex items-center gap-2 mb-4">
                <Shield size={16} style={{ color: 'var(--accent-purple-text)' }} />
                <h3 style={{ fontSize: '0.929rem', fontWeight: 600 }}>Team Health Analysis</h3>
              </div>
              <BulletList text={aiSummary.teamHealthAnalysis} />
            </motion.div>
          )}

          {/* ── Bottleneck Analysis ── */}
          {aiSummary?.bottleneckAnalysis && (
            <motion.div className="card" style={{ border: '1px solid rgba(234,88,12,0.25)', background: 'rgba(234,88,12,0.04)' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={16} style={{ color: 'var(--accent-orange-text)' }} />
                <h3 style={{ fontSize: '0.929rem', fontWeight: 600 }}>Bottleneck Analysis</h3>
              </div>
              <p className="text-sm text-secondary" style={{ lineHeight: 1.75 }}>
                {aiSummary.bottleneckAnalysis}
              </p>
            </motion.div>
          )}

          {/* ── AI Recommendations ── */}
          {recommendations.length > 0 && (
            <motion.div className="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={16} style={{ color: 'var(--accent-green-text)' }} />
                <h3 style={{ fontSize: '0.929rem', fontWeight: 600 }}>AI Recommendations</h3>
                <span className="badge badge-green" style={{ marginLeft: 'auto', fontSize: 11 }}>
                  {recommendations.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recommendations.map((rec, i) => {
                  const cfg  = PRIORITY_COLORS[rec.priority] || PRIORITY_COLORS.low;
                  const Icon = cfg.icon;
                  return (
                    <div key={rec._id || i} style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10, padding: '12px 14px' }}>
                      <div className="flex items-center gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
                        <Icon size={13} style={{ color: cfg.text, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
                          {rec.title || 'Recommendation'}
                        </span>
                        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                          {rec.priority && (
                            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`, textTransform: 'capitalize' }}>
                              {rec.priority}
                            </span>
                          )}
                          {rec.category && (
                            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'var(--bg-elevated)', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                              {String(rec.category).replace(/-/g, ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                      {rec.description && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: rec.actionItems?.length > 0 ? 8 : 0 }}>
                          {rec.description}
                        </p>
                      )}
                      {rec.actionItems?.length > 0 && (
                        <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                          {rec.actionItems.map((item, j) => (
                            <li key={j} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>
                              {String(item)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Fallback */}
          {!aiSummary?.sprintSummary && !aiSummary?.teamHealthAnalysis && recommendations.length === 0 && (
            <motion.div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Zap size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
              <h3 style={{ marginBottom: 8 }}>No AI Data Yet</h3>
              <p className="text-secondary text-sm" style={{ marginBottom: '1.5rem' }}>
                Go to the Dashboard and click <strong>Refresh</strong> to generate AI-powered insights for this repository.
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                <ArrowRight size={14} /> Go to Dashboard
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
