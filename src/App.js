import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
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
import { LoadingSpinner } from './components/LoadingSpinner'; // Changed this line
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
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <LoadingSpinner />
    </div>
  );
}

// Main App Component
function App() {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <AppLoading />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Router>
          <SidebarLayout>
            <NavigationBar />
            <Routes>
              {/* Dashboard Route */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route 
                path="/dashboard" 
                element={
                  <div>
                    <AISummaryWidget />
                    <AIInsightsPanel />
                    <ActivityFeed />
                  </div>
                } 
              />

              {/* AI Features Routes */}
              <Route 
                path="/ai-search" 
                element={
                  <div>
                    <AISmartSearch />
                    <GeminiSmartSearchPanel />
                  </div>
                } 
              />
              <Route 
                path="/ai-insights" 
                element={
                  <div>
                    <GeminiInsightsPanel />
                    <AITagsSuggest />
                  </div>
                } 
              />
              <Route 
                path="/email-drafts" 
                element={
                  <div>
                    <AIDraftEmail />
                    <GeminiActivitySummaryPanel />
                  </div>
                } 
              />

              {/* Add more routes for your other components */}
              <Route path="/customers/*" element={<div>Customers Component</div>} />
              <Route path="/reports/*" element={<div>Reports Component</div>} />
              <Route path="/settings/*" element={<div>Settings Component</div>} />
              <Route path="/integrations/*" element={<div>Integrations Component</div>} />
              <Route path="/organization/*" element={<div>Organization Component</div>} />
              <Route path="/subscription/*" element={<div>Subscription Component</div>} />

              {/* 404 Route */}
              <Route 
                path="*" 
                element={
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '80vh' 
                  }}>
                    <h1>404: Page Not Found</h1>
                  </div>
                } 
              />
            </Routes>
          </SidebarLayout>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
