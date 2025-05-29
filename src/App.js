import React, { useState, useEffect } from 'react';

// Firebase services & config
import { auth, db } from './utils/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

// Helper Components
import AlertMessage from './components/AlertMessage';
import { LoadingSpinner } from './components/LoadingSpinner';

// Page/View Components
import Homepage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Deals from './pages/Deals';
import Contacts from './pages/Contacts';
import Activities from './pages/Activities';
import MyLogPage from './pages/MyLogPage';
import AdminPanel from './pages/AdminPanel';
import SettingsPage from './pages/SettingsPage';

// Your Firebase App ID string for nested Firestore path
const appIdString = "1:555072601372:web:af3a40f8d9232012018ed9";

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentView, setCurrentView] = useState('homepage');
  const [appError, setAppError] = useState(null);
  const [appSuccess, setAppSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setCurrentUserId(user ? user.uid : null);
      setIsAuthReady(true);

      if (!user) {
        setCurrentUserProfile(null);
        setCurrentView('login');
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to user profile if logged in (***FIXED PATH***)
  useEffect(() => {
    if (currentUserId) {
      const userDocRef = doc(db, 'artifacts', appIdString, 'users', currentUserId);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        setCurrentUserProfile(docSnap.exists() ? docSnap.data() : null);
      });
      return () => unsubscribe();
    }
  }, [currentUserId]);

  // Theme change effect
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      setCurrentView('login');
      setCurrentUserProfile(null);
      setAppSuccess('Logged out successfully.');
    } catch (error) {
      setAppError('Failed to log out.');
    } finally {
      setIsLoading(false);
    }
  };

  // View switching logic
  const renderView = () => {
    if (!isAuthReady) return <LoadingSpinner text="Loading..." />;
    if (isLoading) return <LoadingSpinner text="Loading..." />;

    if (!authUser) {
      if (currentView === 'signup') {
        return (
          <SignupPage
            setCurrentViewFunction={setCurrentView}
            setError={setAppError}
            setSuccess={setAppSuccess}
            theme={theme}
          />
        );
      }
      // Default for unauthenticated: login
      return (
        <LoginPage
          setCurrentViewFunction={setCurrentView}
          setError={setAppError}
          setSuccess={setAppSuccess}
          theme={theme}
        />
      );
    }

    // Authenticated views
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            userId={currentUserId}
            userProfile={currentUserProfile}
            setError={setAppError}
            setSuccess={setAppSuccess}
            db={db}
            currentAppId={authUser ? authUser.uid : null}
            navigateToView={setCurrentView}
          />
        );
      case 'leads':
        return (
          <Leads
            userId={currentUserId}
            userProfile={currentUserProfile}
            setError={setAppError}
            setSuccess={setAppSuccess}
            db={db}
            currentAppId={authUser ? authUser.uid : null}
            navigateToView={setCurrentView}
          />
        );
      case 'deals':
        return (
          <Deals
            userId={currentUserId}
            userProfile={currentUserProfile}
            setError={setAppError}
            setSuccess={setAppSuccess}
            db={db}
            currentAppId={authUser ? authUser.uid : null}
            navigateToView={setCurrentView}
          />
        );
      case 'contacts':
        return (
          <Contacts
            userId={currentUserId}
            userProfile={currentUserProfile}
            setError={setAppError}
            setSuccess={setAppSuccess}
            db={db}
            currentAppId={authUser ? authUser.uid : null}
            navigateToView={setCurrentView}
          />
        );
      case 'activities':
        return (
          <Activities
            userId={currentUserId}
            userProfile={currentUserProfile}
            setError={setAppError}
            setSuccess={setAppSuccess}
            db={db}
            currentAppId={authUser ? authUser.uid : null}
            navigateToView={setCurrentView}
          />
        );
      case 'mylog':
        return (
          <MyLogPage
            userId={currentUserId}
            userProfile={currentUserProfile}
            setError={setAppError}
            setSuccess={setAppSuccess}
            db={db}
            currentAppId={authUser ? authUser.uid : null}
            navigateToView={setCurrentView}
          />
        );
      case 'admin':
        return (
          <AdminPanel
            userId={currentUserId}
            userProfile={currentUserProfile}
            setError={setAppError}
            setSuccess={setAppSuccess}
            db={db}
            currentAppId={authUser ? authUser.uid : null}
            navigateToView={setCurrentView}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            userId={currentUserId}
            userProfile={currentUserProfile}
            setError={setAppError}
            setSuccess={setAppSuccess}
            db={db}
            currentAppId={authUser ? authUser.uid : null}
            navigateToView={setCurrentView}
            theme={theme}
            setTheme={setTheme}
            handleSignOut={handleSignOut}
          />
        );
      default:
        return (
          <Homepage
            userId={currentUserId}
            userProfile={currentUserProfile}
            setError={setAppError}
            setSuccess={setAppSuccess}
            db={db}
            currentAppId={authUser ? authUser.uid : null}
            navigateToView={setCurrentView}
            theme={theme}
            setTheme={setTheme}
            handleSignOut={handleSignOut}
            isAuthenticated={!!authUser}
            toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          />
        );
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen bg-gray-50 dark:bg-gray-900`}>
      {appError && (
        <AlertMessage
          type="error"
          message={appError}
          onClose={() => setAppError(null)}
        />
      )}
      {appSuccess && (
        <AlertMessage
          type="success"
          message={appSuccess}
          onClose={() => setAppSuccess(null)}
        />
      )}
      {renderView()}
    </div>
  );
}

export default App;
