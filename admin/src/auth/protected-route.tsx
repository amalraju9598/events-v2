import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

import { useAuth } from './auth-context';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LinearProgress sx={{ width: 1, maxWidth: 320 }} />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (user.user_type !== 'super_admin') {
    if (location.pathname === '/events') {
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get('user_id') !== user.id) {
        searchParams.set('user_id', user.id);
        return <Navigate to={`/events?${searchParams.toString()}`} replace />;
      }
    } else if (!location.pathname.startsWith('/events')) {
      return <Navigate to={`/events?user_id=${user.id}`} replace />;
    }
  }

  return <>{children}</>;
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LinearProgress sx={{ width: 1, maxWidth: 320 }} />
      </Box>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
