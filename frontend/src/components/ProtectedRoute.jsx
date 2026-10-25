// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import PageLoader from './PageLoader';
import { useAuth } from '../context/AuthContext';

// Requires any logged-in user. UX only: the backend enforces the real permission on every API call.
const ProtectedRoute = ({ children }) => {
  const { user, loadingAuth } = useAuth();
  const location = useLocation();

  if (loadingAuth) return <PageLoader label="Checking your session..." />;
  // Remember where the user wanted to go so LoginPage can send them back after login
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

export default ProtectedRoute;
