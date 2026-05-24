import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch,
  LayoutDashboard,
  FolderGit2,
  Sparkles,
  BarChart3,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const EXPANDED  = 240;
const COLLAPSED = 60;

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',    to: '/dashboard'      },
  { icon: FolderGit2,      label: 'Repositories', to: '/repositories'   },
  { icon: Sparkles,        label: 'AI Insights',  to: '/ai-insights'    },
  { icon: BarChart3,       label: 'Analytics',    to: '/analytics'      },
  { icon: Users,           label: 'Contributors', to: '/contributors'   },
  { icon: FileText,        label: 'Reports',      to: '/reports'        },
  { icon: Settings,        label: 'Settings',     to: '/settings'       },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();

  const isActive = (to) => {
    if (to === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(to);
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? COLLAPSED : EXPANDED }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 110,
        flexShrink: 0,
      }}
    >
      {/* ── Brand / Logo ── */}
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          padding: `0 ${collapsed ? 0 : 16}px`,
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 10,
          borderBottom: '1px solid var(--border-default)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            backgroundColor: 'var(--accent-green)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <GitBranch size={18} color="#fff" />
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                letterSpacing: '-0.2px',
              }}
            >
              DevTrackr
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation ── */}
      <nav
        style={{
          flex: 1,
          padding: '12px 0',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {NAV_ITEMS.map(({ icon: Icon, label, to }) => {
          const active = isActive(to);

          return (
            <NavLink
              key={label}
              to={to}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <motion.div
                whileHover={{ backgroundColor: 'var(--bg-elevated)' }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  height: 44,
                  padding: `0 ${collapsed ? 0 : 16}px`,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  position: 'relative',
                  cursor: 'pointer',
                  backgroundColor: active ? 'var(--bg-elevated)' : 'transparent',
                  margin: '1px 8px',
                  borderRadius: 8,
                  transition: 'background-color 0.15s',
                }}
              >
                {/* Active left indicator */}
                {active && (
                  <motion.div
                    layoutId="active-indicator"
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '20%',
                      width: 3,
                      height: '60%',
                      backgroundColor: 'var(--accent-green)',
                      borderRadius: '0 3px 3px 0',
                    }}
                  />
                )}

                <Icon
                  size={18}
                  color={active ? 'var(--accent-green)' : 'var(--text-secondary)'}
                  style={{ flexShrink: 0 }}
                />

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        fontSize: 14,
                        fontWeight: active ? 600 : 400,
                        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* ── Collapse / Expand toggle ── */}
      <div
        style={{
          borderTop: '1px solid var(--border-default)',
          padding: '12px 8px',
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-end',
          flexShrink: 0,
        }}
      >
        <button
          onClick={onToggle}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-elevated)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-elevated)')}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <ChevronRight size={14} color="var(--text-secondary)" />
            : <ChevronLeft  size={14} color="var(--text-secondary)" />}
        </button>
      </div>
    </motion.aside>
  );
}
