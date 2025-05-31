import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';

// Auth Components
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import ForgotPassword from './components/auth/ForgotPassword';
import PrivateRoute from './components/auth/PrivateRoute';

// Main Components
import LandingPage from './components/landing/LandingPage';
import Dashboard from './components/dashboard/Dashboard';
import SubscriptionPlans from './components/subscription/SubscriptionPlans';

const theme = createTheme({
  // ... existing theme configuration
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <UserProvider>
            <SubscriptionProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                {/* Protected Routes */}
                <Route
                  path="/dashboard/*"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/subscription"
                  element={
                    <PrivateRoute>
                      <SubscriptionPlans />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </SubscriptionProvider>
          </UserProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
