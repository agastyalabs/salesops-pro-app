import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, CssBaseline } from '@mui/material';
import ErrorBoundary from './components/common/ErrorBoundary';
import SidebarLayout from './components/SidebarLayout';
import Dashboard from './components/dashboard/Dashboard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/landing/LandingPage';
import SignIn from './components/auth/SignIn';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function AppContent() {
  const [isLoading, setIsLoading] = React.useState(true);
  const { user } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/signin" element={!user ? <SignIn /> : <Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard/*"
        element={
          user ? (
            <Box sx={{ display: 'flex' }}>
              <SidebarLayout user={user}>
                <Dashboard />
              </SidebarLayout>
            </Box>
          ) : (
            <Navigate to="/signin" state={{ from: location }} replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
