import { motion } from 'framer-motion';

/* ── Shimmer keyframe injected once ── */
const shimmerStyle = `
@keyframes skeleton-shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
}
`;

if (typeof document !== 'undefined' && !document.getElementById('skeleton-shimmer-style')) {
  const tag = document.createElement('style');
  tag.id = 'skeleton-shimmer-style';
  tag.textContent = shimmerStyle;
  document.head.appendChild(tag);
}

/* ────────────────────────────────────────────
   Base Skeleton
   Props: width, height, borderRadius, className, style
──────────────────────────────────────────── */
export default function SkeletonLoader({
  width        = '100%',
  height       = 20,
  borderRadius = 8,
  className    = '',
  style        = {},
}) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--bg-elevated)',
        backgroundImage:
          'linear-gradient(90deg, var(--bg-elevated) 0px, var(--bg-surface) 200px, var(--bg-elevated) 400px)',
        backgroundSize: '600px 100%',
        animation: 'skeleton-shimmer 1.6s infinite linear',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

/* ────────────────────────────────────────────
   SkeletonCard — card with title + 3 text lines
──────────────────────────────────────────── */
export function SkeletonCard({ className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`card ${className}`}
      style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <SkeletonLoader width={32} height={32} borderRadius={8} />
        <SkeletonLoader width="55%" height={18} borderRadius={6} />
      </div>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: 'var(--border-default)', margin: '2px 0' }} />

      {/* Text lines */}
      <SkeletonLoader width="92%" height={14} borderRadius={5} />
      <SkeletonLoader width="76%" height={14} borderRadius={5} />
      <SkeletonLoader width="60%" height={14} borderRadius={5} />
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   SkeletonChart — tall rectangle placeholder
──────────────────────────────────────────── */
export function SkeletonChart({ height = 280, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`card ${className}`}
      style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      {/* Chart header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonLoader width="38%" height={18} borderRadius={6} />
        <SkeletonLoader width={80} height={28} borderRadius={8} />
      </div>

      {/* Chart body */}
      <SkeletonLoader width="100%" height={height} borderRadius={10} />

      {/* Legend row */}
      <div style={{ display: 'flex', gap: 16 }}>
        {[80, 100, 70].map((w, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <SkeletonLoader width={10} height={10} borderRadius={3} />
            <SkeletonLoader width={w} height={12} borderRadius={4} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   SkeletonStats — row of 4 stat card skeletons
──────────────────────────────────────────── */
export function SkeletonStats({ count = 4, className = '' }) {
  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${count}, 1fr)`,
        gap: 16,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.25 }}
          className="card"
          style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          {/* Icon + label */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <SkeletonLoader width="50%" height={13} borderRadius={4} />
            <SkeletonLoader width={32} height={32} borderRadius={8} />
          </div>

          {/* Big number */}
          <SkeletonLoader width="65%" height={32} borderRadius={6} />

          {/* Trend line */}
          <SkeletonLoader width="80%" height={12} borderRadius={4} />
        </motion.div>
      ))}
    </div>
  );
}
