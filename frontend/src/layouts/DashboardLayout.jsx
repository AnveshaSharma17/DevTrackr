import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import GlobalRepoBar from '../components/GlobalRepoBar';
import { SelectedRepoProvider } from '../context/SelectedRepoContext';

const SIDEBAR_EXPANDED  = 240;
const SIDEBAR_COLLAPSED = 60;

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = useCallback(() => setCollapsed((prev) => !prev), []);

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <SelectedRepoProvider>
      <div
        style={{
          display: 'flex',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}
      >
        {/* ── SIDEBAR ── */}
        <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />

        {/* ── RIGHT COLUMN (Topbar + Content) ── */}
        <motion.div
          animate={{ marginLeft: sidebarWidth }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {/* Topbar */}
          <Topbar collapsed={collapsed} onToggle={toggleSidebar} />

          {/* Global Repo Switcher — visible on every page */}
          <GlobalRepoBar />

          {/* Page content */}
          <main
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '24px',
              backgroundColor: 'var(--bg-primary)',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key="page-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ minHeight: '100%' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </motion.div>
      </div>
    </SelectedRepoProvider>
  );
}
