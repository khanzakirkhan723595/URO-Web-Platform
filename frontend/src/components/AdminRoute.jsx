// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Admin-specific protected route
const AdminRoute = ({ children }) => {
  const { user, loadingAuth } = useAuth();
  const location = useLocation();

  if (loadingAuth) {
    return <div className="flex justify-center items-center h-screen"><p>Loading authentication status...</p></div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    // Redirect to home or a "not authorized" page if not an admin
    // You could also show a message like "You are not authorized to view this page."
    return <Navigate to="/" replace />; 
  }

  return children;
};

export default AdminRoute;
