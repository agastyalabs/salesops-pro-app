// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, getDocs, where, Timestamp, serverTimestamp, addDoc, orderBy, limit, getCountFromServer } from 'firebase/firestore';
import { Users, Briefcase, DollarSign, CheckSquare, CalendarDays, UsersRound, Clock, LogIn, LogOut, ArrowRight, Gift, BarChart3, ActivityIcon, PieChart as LucidePieChart, ListChecks } from 'lucide-react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CHART_COLORS } from '../config'; // Import from your config.js

const Dashboard = ({ userId, userProfile, db, setError, setSuccess, currentAppId, navigateToView, theme }) => {
    const [dashboardData, setDashboardData] = useState({
        totalLeads: 0,
        openDealsCount: 0,
        openDealsValue: 0,
        totalContacts: 0,
        activeTasks: 0,
        upcomingMeetings: 0,
        leadStatusData: [],
        dealStageData: [],
        activityTypeData: [],
        activityStatusData: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [punchStatus, setPunchStatus] = useState({ status: 'out', lastPunchTime: null, isLoading: true });

    const getCurrentLocation = useCallback(() => {
        return new Promise((resolve) => { // No reject, just resolve with null on error/denial
            if (!navigator.geolocation) {
                console.warn("Geolocation is not supported by your browser.");
                resolve(null);
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    console.warn("Error getting location for punch:", error.message);
                    resolve(null); 
                }
            );
        });
    }, []);

    useEffect(() => {
        if (!userId || !db) {
            setPunchStatus(prev => ({ ...prev, isLoading: false }));
            return;
        }
        const attendanceLogRef = collection(db, `artifacts/<span class="math-inline">\{currentAppId\}/users/</span>{userId}/attendanceLog`);
        const q = query(attendanceLogRef, orderBy("timestamp", "desc"), limit(1));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const lastPunch = snapshot.docs[0].data();
                setPunchStatus({
                    status: lastPunch.type === 'punch-in' ? 'in' : 'out',
                    lastPunchTime: lastPunch.timestamp ? lastPunch.timestamp.toDate() : null,
                    isLoading: false
                });
            } else {
                setPunchStatus({ status: 'out', lastPunchTime: null, isLoading: false });
            }
        }, (err) => { 
            console.error("Error fetching punch status:", err); 
            setError("Could not fetch punch status.");
            setPunchStatus(prev => ({ ...prev, isLoading: false }));
        });
        return () => unsubscribe();
    }, [userId, db, currentAppId, setError]);

    useEffect(() => {
        if (!userId || !db) { setIsLoading(false); return; }
        setIsLoading(true);

        const leadsPath = `artifacts/<span class="math-inline">\{currentAppId\}/users/</span>{userId}/leads`;
        const dealsPath = `artifacts/<span class="math-inline">\{currentAppId\}/users/</span>{userId}/deals`;
        const contactsPath = `artifacts/<span class="math-inline">\{currentAppId\}/users/</span>{userId}/contacts`;
        const activitiesPath = `artifacts/<span class="math-inline">\{currentAppId\}/users/</span>{userId}/activities`;

        const unsubLeadsCount = onSnapshot(collection(db, leadsPath), (snapshot) => {
            setDashboardData(prev => ({ ...prev, totalLeads: snapshot.size }));
        }, err => { console.error("Leads count error:", err); /* setError("Failed lead count."); */ });

        const unsubContactsCount = onSnapshot(collection(db, contactsPath), (snapshot) => {
            setDashboardData(prev => ({ ...prev, totalContacts: snapshot.size }));
        }, err => { console.error("Contacts count error:", err); /* setError("Failed contact count."); */ });

        const fetchAggregates = async () => {
            try {
                const [dealsSnapshot, activitiesSnapshot, leadsFullSnapshot] = await Promise.all([
                    getDocs(collection(db, dealsPath)),
                    getDocs(collection(db, activitiesPath)),
                    getDocs(collection(db, leadsPath)),
                ]);

                const deals = dealsSnapshot.docs.map(d => d.data());
                const activities = activitiesSnapshot.docs.map(d => d.data());
                const leads = leadsFullSnapshot.docs.map(d => d.data());

                const leadStatusCounts = leads.reduce((acc, lead) => { acc[lead.status || 'Unknown'] = (acc[lead.status || 'Unknown'] || 0) + 1; return acc; }, {});
                const leadStatusData = Object.entries(leadStatusCounts).map(([name, value]) => ({ name, value }));

                let openDealsValue = 0;
                const dealStageCounts = deals.reduce((acc, deal) => { acc[deal.stage || 'Unknown'] = (acc[deal.stage || 'Unknown'] || 0) + 1; if (!["Closed Won", "Closed Lost"].includes(deal.stage)) openDealsValue += deal.value || 0; return acc; }, {});
                const dealStageData = Object.entries(dealStageCounts).map(([name, value]) => ({ name, value }));
                const openDealsCount = deals.filter(d => !["Closed Won", "Closed Lost"].includes(d.stage)).length;

                const activityTypeCounts = activities.reduce((acc, act) => { acc[act.type || 'Unknown'] = (acc[act.type || 'Unknown'] || 0) + 1; return acc; }, {});
                const activityTypeData = Object.entries(activityTypeCounts).map(([name, value]) => ({ name, value }));

                const activityStatusCounts = activities.reduce((acc, act) => { acc[act.status || 'Unknown'] = (acc[act.status || 'Unknown'] || 0) + 1; return acc; }, {});
                const activityStatusData = Object.entries(activityStatusCounts).map(([name, value]) => ({ name, value }));

                const activeTasks = activities.filter(a => a.type === "Task" && ["Open", "In Progress"].includes(a.status)).length;
                const today = new Date(); 
                const todayStart = new Date(today.setHours(0,0,0,0));
                const nextWeekEnd = new Date(todayStart); 
                nextWeekEnd.setDate(todayStart.getDate() + 7);

                const upcomingMeetings = activities.filter(a => 
                    a.type === "Meeting" && 
                    a.status === "Scheduled" && 
                    a.dueDate?.toDate() >= todayStart && 
                    a.dueDate?.toDate() < nextWeekEnd 
                ).length;

                setDashboardData(prev => ({ 
                    ...prev, openDealsCount, openDealsValue, activeTasks, upcomingMeetings,
                    leadStatusData, dealStageData, activityTypeData, activityStatusData 
                }));
            } catch (err) { console.error("Error fetching dashboard aggregates:", err); setError("Failed to load dashboard data."); }
            finally { setIsLoading(false); }
        };

        fetchAggregates();

        return () => {
            unsubLeadsCount();
            unsubContactsCount();
        };
    }, [userId, db, currentAppId, setError]);

    const handlePunch = async (type) => {
        if (!userId || !db) { setError("User not authenticated or database unavailable."); return; }
        setPunchStatus(prev => ({ ...prev, isLoading: true })); 
        setError(null); setSuccess(null);
        try {
            const location = await getCurrentLocation();
            const attendanceLogRef = collection(db, `artifacts/<span class="math-inline">\{currentAppId\}/users/</span>{userId}/attendanceLog`);
            const newPunch = { 
                type: type, 
                timestamp: serverTimestamp(), 
                timezoneOffset: new Date().getTimezoneOffset(), 
                location: location 
            };
            await addDoc(attendanceLogRef, newPunch);
            setSuccess(`Successfully Punched ${type === 'punch-in' ? 'In' : 'Out'}! ${location ? 'Location captured.' : 'Location not captured.'}`);
            // Punch status will update via onSnapshot listener, no need to manually set it here
        } catch (error) { 
            console.error(`Error during punch-${type}:`, error); 
            setError(`Failed to Punch ${type === 'punch-in' ? 'In' : 'Out'}: ${error.message}`); 
        } finally {
            // isLoading will be set to false by the onSnapshot listener for punchStatus
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, description, isLoadingCard }) => { 
        const colors = { blue: "bg-blue-500 dark:bg-blue-600", green: "bg-green-500 dark:bg-green-600", yellow: "bg-yellow-500 dark:bg-yellow-600", purple: "bg-purple-500 dark:bg-purple-600", teal: "bg-teal-500 dark:bg-teal-600", pink: "bg-pink-500 dark:bg-pink-600", indigo: "bg-indigo-500 dark:bg-indigo-600", orange: "bg-orange-500 dark:bg-orange-600" };
        return ( <div className={`p-6 rounded-xl shadow-lg text-white ${colors[color]} transition-all duration-300 hover:shadow-xl hover:scale-105`}> <div className="flex items-center justify-between mb-2"> <h3 className="text-lg font-semibold opacity-90">{title}</h3> <Icon size={28} className="opacity-75" /> </div> {isLoadingCard ? ( <div className="h-10 flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div></div> ) : ( <p className="text-4xl font-bold">{value}</p> )} {description && <p className="text-xs opacity-80 mt-1">{description}</p>} </div> );
    };

    if (!userProfile) return <LoadingSpinner text="Loading dashboard..." />;

    const displayStats = [
        { title: "Total Leads", value: dashboardData.totalLeads, icon: Users, color: "blue", description: "All leads in your pipeline." },
        { title: "Open Deals", value: dashboardData.openDealsCount, icon: Briefcase, color: "green", description: `Value: $${dashboardData.openDealsValue.toLocaleString()}` },
        { title: "Total Contacts", value: dashboardData.totalContacts, icon: UsersRound, color: "indigo", description: "All contacts managed." },
        { title: "Active Tasks", value: dashboardData.activeTasks, icon: CheckSquare, color: "teal", description: "Tasks needing attention." },
        { title: "Upcoming Meetings", value: dashboardData.upcomingMeetings, icon: CalendarDays, color: "pink", description: "Meetings in next 7 days." },
    ];

    const CustomTooltip = ({ active, payload, label }) => { if (active && payload && payload.length) { return ( <div className="bg-white dark:bg-gray-700 p-2 shadow-lg rounded border dark:border-gray-600 text-sm"> <p className="label text-gray-800 dark:text-gray-100">{`${label} : ${payload[0].value}`}</p> </div> ); } return null; };

    return (
        <div className="animate-fadeIn">
            {/* Punch In/Out Section */}
            <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
                    <Clock size={22} className="mr-2 text-blue-500 dark:text-blue-400" /> Daily Attendance
                </h3>
                {punchStatus.isLoading ? (
                    <LoadingSpinner text="Fetching punch status..." />
                ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {punchStatus.status === 'out' ? (
                            <button onClick={() => handlePunch('punch-in')} className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md flex items-center justify-center transition-colors">
                                <LogIn size={20} className="mr-2" /> Punch In
                            </button>
                        ) : (
                            <button onClick={() => handlePunch('punch-out')} className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md flex items-center justify-center transition-colors">
                                <LogOut size={20} className="mr-2" /> Punch Out
                            </button>
                        )}
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {punchStatus.status === 'in' ? (
                                <> Currently <span className="font-semibold text-green-600 dark:text-green-400">Punched In</span> {punchStatus.lastPunchTime && ` since ${punchStatus.lastPunchTime.toLocaleTimeString()}`} </>
                            ) : (
                                <> Currently <span className="font-semibold text-red-500 dark:text-red-400">Punched Out</span> {punchStatus.lastPunchTime && ` since ${punchStatus.lastPunchTime.toLocaleTimeString()}`} </>
                            )}
                        </div>
                    </div>
                )}
                <button onClick={() => navigateToView('myLog')} className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                    View My Activity Log <ArrowRight size={16} className="ml-1"/>
                </button>
            </div>

            <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-2">
                Welcome, <span className="capitalize">{userProfile.email ? userProfile.email.split('@')[0] : 'User'}</span>!
                {userProfile.role === 'admin' && <span className="text-sm font-normal text-orange-500 dark:text-orange-400 ml-2">(Admin)</span>}
            </h2>
            <p className="text-md text-gray-600 dark:text-gray-400 mb-8">Here's your sales performance at a glance.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                 {displayStats.map(stat => <StatCard key={stat.title} {...stat} isLoadingCard={isLoading} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center"><LucidePieChart size={22} className="mr-2 text-blue-500"/> Lead Status</h3>
                    {isLoading ? <LoadingSpinner text="Loading chart..."/> : dashboardData.leadStatusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart><Pie data={dashboardData.leadStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{dashboardData.leadStatusData.map((e, i) => (<Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}</Pie><RechartsTooltip content={<CustomTooltip />} /><Legend iconSize={10}/></PieChart>
                        </ResponsiveContainer>
                    ) : <p className="text-gray-500 dark:text-gray-400 text-center py-10">No lead data for chart.</p>}
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                     <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center"><BarChart3 size={22} className="mr-2 text-green-500"/> Deal Pipeline</h3>
                    {isLoading ? <LoadingSpinner text="Loading chart..."/> : dashboardData.dealStageData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={dashboardData.dealStageData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} /><XAxis dataKey="name" angle={-25} textAnchor="end" height={60} interval={0} tick={{fontSize: 9}} stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} /><YAxis allowDecimals={false} stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} /><RechartsTooltip content={<CustomTooltip />} /><Legend iconSize={10}/><Bar dataKey="value" name="Deal Count" fill="#22c55e" radius={[4, 4, 0, 0]} /></BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-gray-500 dark:text-gray-400 text-center py-10">No deal data for chart.</p>}
                </div>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center"><ActivityIcon size={22} className="mr-2 text-purple-500"/> Activity Types</h3>
                    {isLoading ? <LoadingSpinner text="Loading chart..."/> : dashboardData.activityTypeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart><Pie data={dashboardData.activityTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{dashboardData.activityTypeData.map((e, i) => (<Cell key={`cell-act-${i}`} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} />))}</Pie><RechartsTooltip content={<CustomTooltip />} /><Legend iconSize={10}/></PieChart>
                        </ResponsiveContainer>
                    ) : <p className="text-gray-500 dark:text-gray-400 text-center py-10">No activity data for chart.</p>}
                </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center"><ListChecks size={22} className="mr-2 text-orange-500"/> Activity Statuses</h3>
                    {isLoading ? <LoadingSpinner text="Loading chart..."/> : dashboardData.activityStatusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={dashboardData.activityStatusData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                <XAxis type="number" allowDecimals={false} stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} />
                                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10}} stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Legend iconSize={10}/>
                                <Bar dataKey="value" name="Activity Count" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20}/>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-gray-500 dark:text-gray-400 text-center py-10">No activity status data.</p>}
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
                .recharts-legend-item-text { fill: ${theme === 'dark' ? '#D1D5DB' : '#1F2937'} !important; }
                .recharts-tooltip-label { color: ${theme === 'dark' ? '#D1D5DB' : '#1F2937'} !important; }
                .recharts-cartesian-axis-tick-value tspan { fill: ${theme === 'dark' ? '#9ca3af' : '#4b5563'} !important; }
            `}</style>
        </div>
    );
};

// ... (The rest of the components: Leads, Deals, Contacts, Activities, MyLogPage, AdminPanel, SettingsPage would be here, fully defined)


// --- App Component (Main structure, navigation, routing) ---
// THIS IS THE MAIN APP SHELL - THE COMPONENT DEFINITIONS ABOVE NEED TO BE COMPLETE
function App() {
    // ... (Full App component logic from Phase 12/Mega Enhancement Phase)
    // Make sure all state and functions are correctly defined here or passed down
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
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

    useEffect(() => {
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

        if (!auth || !db) { setAppError("Firebase is not initialized."); setIsAuthReady(true); return; }
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            let profileListener = () => {};
            if (user) {
                setAuthUser(user); setCurrentUserId(user.uid);
                const userDocRef = doc(db, `artifacts/<span class="math-inline">\{currentAppId\}/users/</span>{user.uid}`);
                profileListener = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setCurrentUserProfile(docSnap.data());
                        if (['login', 'signup'].includes(currentView)) navigateToView('dashboard');
                    } else {
                        console.warn("User profile not found for UID:", user.uid);
                         const basicProfile = { uid: user.uid, email: user.email, role: 'user', planStatus: 'trial', createdAt: serverTimestamp(), trialStartDate: serverTimestamp(), trialEndDate: Timestamp.fromDate(new Date(Date.now() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000))};
                        setDoc(userDocRef, basicProfile).then(() => setCurrentUserProfile(basicProfile)).catch(err => console.error("Error creating fallback profile:", err));
                        if (['login', 'signup'].includes(currentView)) navigateToView('dashboard'); 
                    }
                    if (!isAuthReady) setIsAuthReady(true);
                }, (error) => {
                    console.error("Error fetching user profile:", error); setAppError("Could not load user profile.");
                    setCurrentUserProfile(null); setAuthUser(null); setCurrentUserId(null);
                    if (!isAuthReady) setIsAuthReady(true);
                    if (!['homepage', 'login', 'signup'].includes(currentView)) navigateToView('login');
                });
            } else { 
                setAuthUser(null); setCurrentUserId(null); setCurrentUserProfile(null);
                if (!['homepage', 'login', 'signup'].includes(currentView)) navigateToView('login');
                if (!isAuthReady) setIsAuthReady(true);
            }
            return () => profileListener(); 
        });
        return () => {
            unsubAuth();
            addedLinks.forEach(link => { if (link.parentNode === document.head) document.head.removeChild(link); });
        };
    }, [navigateToView, isAuthReady, currentView]); 

    const handleSignOut = async () => { try { await signOut(auth); setAppSuccess("Successfully signed out."); navigateToView('homepage'); } catch (err) { console.error("Error signing out:", err); setAppError(`Sign-out failed: ${err.message}`); } };
    const clearMessages = useCallback(() => { setAppError(null); setAppSuccess(null); }, []);
    useEffect(() => { if (appError || appSuccess) { const timer = setTimeout(clearMessages, 7000); return () => clearTimeout(timer); } }, [appError, appSuccess, clearMessages]);

    if (!isAuthReady) return <div className={`flex h-screen items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}><LoadingSpinner text="Initializing SalesOps Pro..." /></div>;

    const GlobalAlerts = () => ( (appError || appSuccess) ? <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md p-0 z-[1000] pointer-events-auto">{appError && <AlertMessage message={appError} type="error" onDismiss={clearMessages} />}{appSuccess && <AlertMessage message={appSuccess} type="success" onDismiss={clearMessages} />}</div> : null );

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

    const NavItem = ({ icon: Icon, label, viewName }) => ( <li className="mb-1.5"><button onClick={() => navigateToView(viewName)} className={`w-full flex items-center py-3 px-4 rounded-lg transition-all duration-200 ease-in-out group ${currentView === viewName ? 'bg-blue-600 text-white shadow-lg transform scale-105' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100'}`} aria-current={currentView === viewName ? "page" : undefined}><Icon size={20} className={`mr-3 transition-transform duration-200 group-hover:scale-110 ${currentView === viewName ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400'}`} /><span>{label}</span></button></li> );
    const TrialBanner = () => { 
        if (currentUserProfile?.planStatus === 'trial' && currentUserProfile.trialEndDate) {
            const endDate = currentUserProfile.trialEndDate.toDate(); const now = new Date();
            const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 0) return (<div className="bg-red-500 text-white text-xs sm:text-sm text-center py-1.5 sm:py-2 px-4">Your trial has expired. Please upgrade.</div>);
            return (<div className="bg-yellow-400 dark:bg-yellow-600 text-gray-800 dark:text-white text-xs sm:text-sm text-center py-1.5 sm:py-2 px-4 flex items-center justify-center"><Gift size={16} className="mr-1.5 sm:mr-2"/>Trial: {daysLeft > 0 ? `<span class="math-inline">\{daysLeft\} day</span>{daysLeft > 1 ? 's' : ''} left.` : 'Ends today.'}<button onClick={() => navigateToView('settings')} className="ml-2 sm:ml-3 font-semibold underline hover:opacity-80">Upgrade</button></div>);
        } return null; 
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
                            <NavItem icon={Settings} label="Settings" viewName="settings" />
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
