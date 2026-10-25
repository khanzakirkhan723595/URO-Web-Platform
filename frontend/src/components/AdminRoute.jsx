// src/components/AdminRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import PageLoader from './PageLoader';
import { useAuth } from '../context/AuthContext';

// Admin-only page wrapper (UX only; the API also checks the role).
const AdminRoute = ({ children }) => {
  const { user, loadingAuth } = useAuth();
  const location = useLocation();

  if (loadingAuth) return <PageLoader label="Checking your session..." />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export default AdminRoute;
