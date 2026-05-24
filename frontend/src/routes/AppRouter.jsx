import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import DashboardPage from '../pages/DashboardPage';
import RepositoryPage from '../pages/RepositoryPage';
import RepositoriesPage from '../pages/RepositoriesPage';
import ContributorsPage from '../pages/ContributorsPage';
import AIInsightsPage from '../pages/AIInsightsPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import ReportsPage from '../pages/ReportsPage';
import SettingsPage from '../pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppRouter = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route element={<AuthLayout />}>
                <Route path="/login"  element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
              </Route>

              {/* Protected Dashboard */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard"                element={<DashboardPage />} />
                  <Route path="/repositories"             element={<RepositoriesPage />} />
                  <Route path="/repository/:repoId"       element={<RepositoryPage />} />
                  <Route path="/ai-insights"              element={<AIInsightsPage />} />
                  <Route path="/ai-insights/:repoId"      element={<AIInsightsPage />} />
                  <Route path="/analytics"                element={<AnalyticsPage />} />
                  <Route path="/contributors"             element={<ContributorsPage />} />
                  <Route path="/contributors/:repoId"     element={<ContributorsPage />} />
                  <Route path="/reports"                  element={<ReportsPage />} />
                  <Route path="/settings"                 element={<SettingsPage />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>

          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#161b22',
                color: '#e6edf3',
                border: '1px solid #30363d',
                borderRadius: '8px',
                fontSize: '13px',
              },
              success: { iconTheme: { primary: '#238636', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default AppRouter;
