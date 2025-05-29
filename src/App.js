import React, { useState, useEffect, useCallback } from 'react';

// Firebase services & config
import { auth, db, currentAppId } from './utils/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, serverTimestamp, Timestamp, setDoc } from 'firebase/firestore';

// Import constants
import { TRIAL_DURATION_DAYS } from './config';

// Helper Components
import { AlertMessage } from './components/AlertMessage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Tooltip } from './components/Tooltip';

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

// Icons for App shell
import {
  Briefcase, LayoutDashboard, Users, FileText as ContactsIcon, ListChecks, History, UserCog, Settings as SettingsIcon, LogOut, Moon, Sun, Gift
} from 'lucide-react'; // Renamed FileText to ContactsIcon for clarity

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentView, setCurrentView] = useState('homepage');
  const [activeParams, setActiveParams] = useState({});
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [appError, setAppError] = useState(null);
  const [appSuccess, setAppSuccess] = useState(null);

  // ...rest of your App component logic
}

export default App;
