import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from './AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading, isAuthenticated } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    // Save current path for redirect after login
    const returnUrl = location.pathname + location.search;
    return (
      <Navigate
        to={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
        replace
      />
    );
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = allowedRoles.includes(user.roleName.toLowerCase());
    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};
