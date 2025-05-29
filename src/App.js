import React, { useState, useEffect, useCallback } from 'react';

// Firebase services & config
import { auth, db, currentAppId } from './utils/firebase'; // Corrected path
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, serverTimestamp, Timestamp, setDoc } from 'firebase/firestore';

// Import constants
import { TRIAL_DURATION_DAYS } from './config'; // Corrected path

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
    Briefcase, LayoutDashboard, Users, FileText, ListChecks, History, UserCog, Settings as SettingsIcon, LogOut, Moon, Sun, Gift
} from 'lucide-react'; // Renamed Settings to SettingsIcon to avoid conflict with component

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

    const navigateToView = useCallback((view, params = {}) => {
        setAppError(null); setAppSuccess(null); 
        setCurrentView(view);
        setActiveParams(params); 
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

    useEffect(() => {
        // Dynamically add Leaflet and MarkerCluster CSS to head
        const cssUrls = [
            'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
            'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css',
            'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css'
        ];
        const addedLinks = [];
        cssUrls.forEach(url => {
            if (!document.querySelector(`link[href="${url}"]`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet'; link.href = url;
                if (url.includes('leaflet.css')) { link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='; link.crossOrigin = '';}
                document.head.appendChild(link); addedLinks.push(link);
            }
        });
        
        if (!auth || !db) { 
            setAppError("Firebase is not initialized. Please check your configuration or refresh.");
            setIsAuthReady(true); 
            return;
        }
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            let profileListener = () => {};
            if (user) {
                setAuthUser(user); setCurrentUserId(user.uid);
                const userDocRef = doc(db, `artifacts/${currentAppId}/users/${user.uid}`);
                profileListener = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setCurrentUserProfile(docSnap.data());
                    } else {
                        console.warn("User profile not found for UID:", user.uid, "Path:", userDocRef.path, ". Attempting to create a basic profile.");
                        const jsTrialEndDate = new Date();
                        jsTrialEndDate.setDate(jsTrialEndDate.getDate() + TRIAL_DURATION_DAYS);
                        const basicProfile = { 
                            uid: user.uid, 
                            email: user.email || "N/A", 
                            role: 'user', 
                            planStatus: 'trial', 
                            createdAt: serverTimestamp(), 
                            trialStartDate: serverTimestamp(), 
                            trialEndDate: Timestamp.fromDate(jsTrialEndDate)
                        };
                        setDoc(userDocRef, basicProfile)
                            .then(() => {
                                setCurrentUserProfile(basicProfile);
                                console.log("Basic profile created for new/unprofiled user:", user.uid);
                            })
                            .catch(err => {
                                console.error("Error creating fallback profile:", err);
                                setCurrentUserProfile({ email: user.email || "N/A", uid: user.uid, role: 'user', planStatus: 'unknown' }); 
                            });
                    }
                    if (['login', 'signup'].includes(currentView) && user) { // Ensure user is truthy before redirecting
                         navigateToView('dashboard');
                    }
                    if (!isAuthReady) setIsAuthReady(true);
                }, (error) => {
                    console.error("Error fetching user profile:", error); setAppError("Could not load user profile. Please try again.");
                    setCurrentUserProfile(null); setAuthUser(null); setCurrentUserId(null);
                    if (!isAuthReady) setIsAuthReady(true);
                    if (!['homepage', 'login', 'signup'].includes(currentView)) navigateToView('login');
                });
            } else { 
                setAuthUser(null); setCurrentUserId(null); setCurrentUserProfile(null);
                if (!['homepage', 'login', 'signup'].includes(currentView)) {
                    navigateToView('login');
                }
                if (!isAuthReady) setIsAuthReady(true);
            }
            return () => profileListener(); 
        });
        return () => {
            unsubAuth();
            addedLinks.forEach(link => { if (link.parentNode === document.head) document.head.removeChild(link); });
        };
    }, [navigateToView, isAuthReady, currentView]); 

    const handleSignOut = async () => { 
        try { 
            if (auth) {
                await signOut(auth); 
                setAppSuccess("Successfully signed out."); 
                navigateToView('homepage'); 
            } else {
                setAppError("Authentication service not available.");
            }
        } catch (err) { 
            console.error("Error signing out:", err);
            setAppError(`Sign-out failed: ${err.message}`); 
        } 
    };
    const clearMessages = useCallback(() => { setAppError(null); setAppSuccess(null); }, []);
    useEffect(() => { 
        if (appError || appSuccess) { 
            const timer = setTimeout(clearMessages, 7000); 
            return () => clearTimeout(timer); 
        } 
    }, [appError, appSuccess, clearMessages]);

    // Sub-components for App layout
    const GlobalAlerts = () => ( 
        (appError || appSuccess) ? 
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md p-0 z-[1000] pointer-events-auto">
            {appError && <AlertMessage message={appError} type="error" onDismiss={clearMessages} />}
            {appSuccess && <AlertMessage message={appSuccess} type="success" onDismiss={clearMessages} />}
        </div> 
        : null 
    );

    const NavItem = ({ icon: NavIcon, label, viewName }) => ( 
        <li className="mb-1.5">
            <button onClick={() => navigateToView(viewName)} className={`w-full flex items-center py-3 px-4 rounded-lg transition-all duration-200 ease-in-out group ${currentView === viewName ? 'bg-blue-600 text-white shadow-lg transform scale-105' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100'}`} aria-current={currentView === viewName ? "page" : undefined}>
                <NavIcon size={20} className={`mr-3 transition-transform duration-200 group-hover:scale-110 ${currentView === viewName ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400'}`} />
                <span className="font-medium text-sm">{label}</span>
            </button>
        </li> 
    );
    
    const TrialBanner = () => { 
        if (currentUserProfile?.planStatus === 'trial' && currentUserProfile.trialEndDate) {
            const endDate = currentUserProfile.trialEndDate.toDate(); 
            const now = new Date();
            const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            if (daysLeft <= 0) return (<div className="bg-red-500 text-white text-xs sm:text-sm text-center py-1.5 sm:py-2 px-4">Your trial has expired. Please upgrade.</div>);
            return (<div className="bg-yellow-400 dark:bg-yellow-600 text-gray-800 dark:text-white text-xs sm:text-sm text-center py-1.5 sm:py-2 px-4 flex items-center justify-center"><Gift size={16} className="mr-1.5 sm:mr-2"/>Trial: {daysLeft > 0 ? `${daysLeft} day${daysLeft > 1 ? 's' : ''} left.` : 'Ends today.'}<button onClick={() => navigateToView('settings')} className="ml-2 sm:ml-3 font-semibold underline hover:opacity-80">Upgrade</button></div>);
        } return null; 
    };

    if (!isAuthReady) {
        return <div className={`flex h-screen items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}><LoadingSpinner text="Initializing SalesOps Pro..." /></div>;
    }
    
    if (currentView === 'homepage') return <> <GlobalAlerts /><Homepage setCurrentViewFunction={navigateToView} theme={theme} toggleTheme={toggleTheme} isAuthenticated={!!authUser} /></>;
    if (currentView === 'login') return <> <GlobalAlerts /><LoginPage setCurrentViewFunction={navigateToView} setError={setAppError} setSuccess={setAppSuccess} theme={theme} /></>;
    if (currentView === 'signup') return <> <GlobalAlerts /><SignupPage setCurrentViewFunction={navigateToView} setError={setAppError} setSuccess={setAppSuccess} theme={theme} /></>;

    if (!authUser || !currentUserProfile) { 
        if(isAuthReady && !['homepage', 'login', 'signup'].includes(currentView)) navigateToView('login'); 
        return <div className={`flex h-screen items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}><LoadingSpinner text="Authenticating..." /></div>;
    }
    if (!db && !['homepage', 'login', 'signup', 'settings'].includes(currentView)) return <div className={`flex h-screen items-center justify-center p-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}><GlobalAlerts /><AlertMessage message="Database issue." type="error" /></div>;

    const renderAppView = () => {
        const commonProps = { userId: currentUserId, userProfile: currentUserProfile, db, setError: setAppError, setSuccess: setAppSuccess, currentAppId, navigateToView, activeParams };
        switch (currentView) {
            case 'dashboard': return <Dashboard {...commonProps} theme={theme} />;
            case 'leads': return <Leads {...commonProps} />;
            case 'deals': return <Deals {...commonProps} />;
            case 'contacts': return <Contacts {...commonProps} />;
            case 'activities': return <Activities {...commonProps} />; 
            case 'myLog': return <MyLogPage {...commonProps} />; 
            case 'settings': return <SettingsPage {...commonProps} theme={theme} toggleTheme={toggleTheme} handleSignOut={handleSignOut} />;
            case 'admin': 
                if (currentUserProfile?.role === 'admin') return <AdminPanel {...commonProps} />;
                setAppError("Access Denied."); navigateToView('dashboard'); return <Dashboard {...commonProps} theme={theme}/>; 
            default: navigateToView('dashboard'); return <Dashboard {...commonProps} theme={theme}/>;
        }
    };

    return (
        <> 
            <div className="flex h-screen flex-col bg-gray-100 dark:bg-gray-900 font-inter text-gray-900 dark:text-gray-100 relative">
                <GlobalAlerts />
                <TrialBanner />
                <div className="flex flex-1 overflow-hidden"> 
                    <aside className="w-64 bg-white dark:bg-gray-800 p-5 shadow-xl flex flex-col justify-between transition-colors duration-300 border-r dark:border-gray-700 flex-shrink-0">
                        <div>
                            <div className="flex items-center mb-10 px-2 cursor-pointer" onClick={() => navigateToView('homepage')}>
                                <Briefcase size={28} className="text-blue-600 dark:text-blue-400" />
                                <h1 className="text-2xl font-bold ml-2.5 text-gray-800 dark:text-white">SalesOps Pro</h1>
                            </div>
                            <nav><ul className="space-y-1">
                                <NavItem icon={LayoutDashboard} label="Dashboard" viewName="dashboard" />
                                <NavItem icon={Users} label="Leads" viewName="leads" />
                                <NavItem icon={Briefcase} label="Deals" viewName="deals" />
                                <NavItem icon={FileText} label="Contacts" viewName="contacts" />
                                <NavItem icon={ListChecks} label="Activities" viewName="activities" /> 
                                <NavItem icon={History} label="My Activity Log" viewName="myLog" />
                                {currentUserProfile?.role === 'admin' && (
                                    <NavItem icon={UserCog} label="Admin Panel" viewName="admin" />
                                )}
                            </ul></nav>
                        </div>
                        <div className="space-y-2">
                            {currentUserProfile && <Tooltip text={`Logged in as: ${currentUserProfile.email}`}><p className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded truncate">{currentUserProfile.email}</p></Tooltip>}
                            <NavItem icon={SettingsIcon} label="Settings" viewName="settings" />
                            <button onClick={handleSignOut} className="w-full flex items-center py-3 px-4 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-700 dark:hover:text-red-100 transition-colors duration-200 ease-in-out group"><LogOut size={20} className="mr-3 transition-transform duration-200 group-hover:scale-110 text-red-500" /><span>Sign Out</span></button>
                        </div>
                    </aside>
                    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                        <div className="max-w-full mx-auto">
                            {renderAppView()}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

export default App;
