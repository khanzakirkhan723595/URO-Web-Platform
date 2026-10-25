// src/App.jsx
import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import ComingSoon from './components/ComingSoon';
import ErrorBoundary from './components/ErrorBoundary';
import PageLoader from './components/PageLoader';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import { recordPageVisit, getVisitorStats as apiGetVisitorStats } from './services/api';

// Code splitting: each page is downloaded only when visited (keeps the first load small;
// the heavy chart library is only loaded on the model page).
const About = lazy(() => import('./pages/About'));
const FloodModel = lazy(() => import('./pages/FloodModel'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AssistantPage = lazy(() => import('./pages/AssistantPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const Contact = lazy(() => import('./pages/Contact'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Records one visit per page change (only the path matters, not the user object).
const PageVisitTracker = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    recordPageVisit(pathname).catch(() => {});
  }, [pathname]);
  return null;
};

function AppContent() {
  const [siteStats, setSiteStats] = useState({ totalVisits: 0, uniqueVisitors: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    apiGetVisitorStats()
      .then((response) => {
        if (!ignore && response?.status === 'success') {
          setSiteStats({
            totalVisits: response.data.totalPageHits || 0,
            uniqueVisitors: response.data.totalUniqueVisitors || 0,
          });
        }
      })
      .catch(() => {})
      .finally(() => !ignore && setStatsLoading(false));
    return () => { ignore = true; };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg">
        Skip to content
      </a>
      <Navbar />
      <ScrollToTop />
      <PageVisitTracker />
      <main id="main" className="flex-grow">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/models/flood-model" element={<FloodModel />} />
              <Route path="/models/storm-surge" element={<ComingSoon title="Storm Surge Model" />} />
              <Route path="/models/coupled-model" element={<ComingSoon title="Tightly Coupled Model" />} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/assistant" element={<ProtectedRoute><AssistantPage /></ProtectedRoute>} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer siteStats={siteStats} statsLoading={statsLoading} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
