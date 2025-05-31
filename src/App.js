import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, CssBaseline, Typography } from '@mui/material';
import ErrorBoundary from './components/common/ErrorBoundary';
import SidebarLayout from './components/SidebarLayout';
import ActivityFeed from './components/ActivityFeed';
import AISmartSearch from './components/AISmartSearch';
import AIInsightsPanel from './components/AIInsightsPanel';
import AISummaryWidget from './components/AISummaryWidget';
import AITagsSuggest from './components/AITagsSuggest';
import AIDraftEmail from './components/AIDraftEmail';
import GeminiActivitySummaryPanel from './components/GeminiActivitySummaryPanel';
import GeminiInsightsPanel from './components/GeminiInsightsPanel';
import GeminiSmartSearchPanel from './components/GeminiSmartSearchPanel';
import { LoadingSpinner } from './components/LoadingSpinner';
import NavigationBar from './components/NavigationBar';

// Theme configuration
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
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
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
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
});

// Loading state for the app
function AppLoading() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}
    >
      <LoadingSpinner text="Loading application..." />
    </Box>
  );
}

// Dashboard component
function Dashboard() {
  return (
    <Box sx={{ p: 3 }}>
      <AISummaryWidget />
      <AIInsightsPanel />
      <ActivityFeed />
    </Box>
  );
}

// 404 Component
function NotFound() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh'
      }}
    >
      <Typography variant="h2" component="h1" gutterBottom>
        404: Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary">
        The page you're looking for doesn't exist or has been moved.
      </Typography>
    </Box>
  );
}

// Main App Component
function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const initializeApp = async () => {
      try {
        // Add any initialization logic here
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
            bgcolor: 'background.default'
          }}
        >
          <Typography variant="h4" gutterBottom color="error">
            Unable to load application
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {error.message || 'An unexpected error occurred. Please try again.'}
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppLoading />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Router>
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <SidebarLayout>
              <NavigationBar />
              <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/ai-search" element={
                    <Box sx={{ p: 3 }}>
                      <AISmartSearch />
                      <GeminiSmartSearchPanel />
                    </Box>
                  } />
                  <Route path="/ai-insights" element={
                    <Box sx={{ p: 3 }}>
                      <GeminiInsightsPanel />
                      <AITagsSuggest />
                    </Box>
                  } />
                  <Route path="/email-drafts" element={
                    <Box sx={{ p: 3 }}>
                      <AIDraftEmail />
                      <GeminiActivitySummaryPanel />
                    </Box>
                  } />
                  <Route path="/customers/*" element={
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h4">Customers</Typography>
                      <Typography variant="body1">Coming soon...</Typography>
                    </Box>
                  } />
                  <Route path="/reports/*" element={
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h4">Reports</Typography>
                      <Typography variant="body1">Coming soon...</Typography>
                    </Box>
                  } />
                  <Route path="/settings/*" element={
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h4">Settings</Typography>
                      <Typography variant="body1">Coming soon...</Typography>
                    </Box>
                  } />
                  <Route path="/integrations/*" element={
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h4">Integrations</Typography>
                      <Typography variant="body1">Coming soon...</Typography>
                    </Box>
                  } />
                  <Route path="/organization/*" element={
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h4">Organization</Typography>
                      <Typography variant="body1">Coming soon...</Typography>
                    </Box>
                  } />
                  <Route path="/subscription/*" element={
                    <Box sx={{ p: 3 }}>
                      <Typography variant="h4">Subscription</Typography>
                      <Typography variant="body1">Coming soon...</Typography>
                    </Box>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Box>
            </SidebarLayout>
          </Box>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
