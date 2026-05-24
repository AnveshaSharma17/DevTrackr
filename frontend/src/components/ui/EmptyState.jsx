import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

/**
 * EmptyState
 *
 * Props:
 *   icon        – Lucide component (defaults to Inbox)
 *   title       – string
 *   description – string
 *   action      – { label: string, onClick: fn } | null
 *   compact     – bool  (reduces vertical padding)
 */
export default function EmptyState({
  icon: Icon    = Inbox,
  title         = 'Nothing here yet',
  description   = '',
  action        = null,
  compact       = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: compact ? '32px 24px' : '64px 32px',
        width: '100%',
      }}
    >
      {/* Icon container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.08, duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <Icon size={32} color="var(--text-muted)" strokeWidth={1.5} />
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.25 }}
        style={{
          fontSize: compact ? 15 : 17,
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: '0 0 8px 0',
        }}
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.25 }}
          style={{
            fontSize: compact ? 13 : 14,
            color: 'var(--text-muted)',
            lineHeight: 1.65,
            maxWidth: 360,
            margin: '0 0 24px 0',
          }}
        >
          {description}
        </motion.p>
      )}

      {/* CTA button */}
      {action && (
        <motion.button
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.27, duration: 0.25 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={action.onClick}
          className="btn btn-primary"
          style={{
            fontSize: 13,
            padding: '9px 20px',
          }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
