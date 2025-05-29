import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification
} from 'firebase/auth';
import { 
    getFirestore, collection, addDoc, query, onSnapshot, doc, 
    setDoc, getDoc, getDocs, where, Timestamp, serverTimestamp, deleteDoc, updateDoc, limit,
    getCountFromServer, orderBy 
} from 'firebase/firestore';
import { 
    Users, Briefcase, DollarSign, LayoutDashboard, PlusCircle, 
    Trash2, Edit3, LogIn, LogOut, UserPlus, AlertTriangle, CheckCircle, 
    XCircle, Search, Filter, Settings, HelpCircle, Moon, Sun, FileText, Phone, Mail, Building, UserCircle,
    Target, Zap, LineChart as LucideLineChart, UsersRound, ShieldCheck, ArrowRight, KeyRound, AtSign, Eye, EyeOff, Gift, UserCog,
    CalendarDays, Tag, Landmark, ListChecks, CheckSquare, MessageSquare, PhoneCall, ActivityIcon, BarChart3,
    MapPin, Clock, History, Check, Eye as ViewIcon, PieChart as LucidePieChart, Map, Sparkles, Link2, Edit, Wand2, AlertOctagon, Home,
    TrendingUp, Award, Activity // Added Activity icon
} from 'lucide-react';

// Import Recharts components
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Import React-Leaflet components
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster'; 

// Import Google Generative AI SDK
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";


// --- App Configuration ---
const TRIAL_DURATION_DAYS = 14; 
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || (typeof import.meta !== 'undefined' ? import.meta.env.VITE_GEMINI_API_KEY : "YOUR_GEMINI_API_KEY_HERE"); 
const AVAILABLE_ROLES = ['user', 'admin']; 
const TASK_PRIORITIES = ["Low", "Medium", "High"];
const PLAN_STATUSES = ['trial', 'paid', 'cancelled', 'free']; 

// --- Firebase Configuration ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    apiKey: "YOUR_FALLBACK_API_KEY", 
    authDomain: "YOUR_FALLBACK_AUTH_DOMAIN",
    projectId: "YOUR_FALLBACK_PROJECT_ID",
    storageBucket: "YOUR_FALLBACK_STORAGE_BUCKET",
    messagingSenderId: "YOUR_FALLBACK_MESSAGING_SENDER_ID",
    appId: "YOUR_FALLBACK_APP_ID"
};
const currentAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-salesops-app';

// --- Initialize Firebase ---
let app; let auth; let db;
try { app = initializeApp(firebaseConfig); auth = getAuth(app); db = getFirestore(app); } catch (e) { console.error("Error initializing Firebase:", e); }


// --- Helper Components (Modal, Tooltip, AlertMessage, LoadingSpinner, InputField) ---
const Modal = ({ isOpen, onClose, title, children, size = "lg" }) => { /* ... Same as previous phase ... */ return isOpen ? <div className="fixed inset-0 z-50 p-4 bg-black/60 flex justify-center items-center"><div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-${size} animate-modalShow max-h-[90vh] flex flex-col`}><div className="flex justify-between items-center mb-4 pb-3 border-b dark:border-gray-700 flex-shrink-0"><h3 className="text-xl font-semibold">{title}</h3><button onClick={onClose}><XCircle/></button></div><div className="overflow-y-auto flex-grow">{children}</div></div><style>{`@keyframes modalShow { to { opacity: 1; transform: scale(1); } } .animate-modalShow { animation: modalShow 0.3s forwards; opacity:0; transform: scale(0.95);}`}</style></div> : null; };
const Tooltip = ({ text, children }) => { /* ... Same as previous phase ... */ return <div className="relative inline-block">{children}{/* tooltip visible logic */}</div>; };
const AlertMessage = ({ message, type, onDismiss }) => { /* ... Same as previous phase ... */ return message ? <div className={`p-3 my-2 rounded-md shadow-sm text-sm flex items-center justify-between ${type === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200 border-l-4 border-red-500' : type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 border-l-4 border-green-500' : 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 border-l-4 border-blue-500'}`}>{message}{onDismiss && <button onClick={onDismiss} className="ml-2 font-bold text-current hover:opacity-75"><XCircle size={16}/></button>}</div> : null; };
const LoadingSpinner = ({ text = "Loading...", size="md" }) => { /* ... Same as previous phase ... */ const sizeClasses = {sm: "h-6 w-6", md: "h-12 w-12", lg: "h-16 w-16"}; return (<div className="flex flex-col items-center justify-center h-full py-2 text-center"><svg className={`animate-spin ${sizeClasses[size]} text-blue-600 dark:text-blue-400 mb-2`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>{text && <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{text}</p>}</div>); };
const InputField = React.forwardRef(({ icon: Icon, label, id, type = "text", value, onChange, name, placeholder, required, children, step, min }, ref) => { /* ... Same as previous phase ... */ return <div className="mb-2"><label htmlFor={id}>{label}</label><input type={type} id={id} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} step={step} min={min} className="border p-1 w-full"/></div>; });

// --- Homepage, AuthPageLayout, SignupPage, LoginPage Components ---
const Homepage = ({ setCurrentViewFunction, theme, toggleTheme, isAuthenticated }) => { /* ... Same as previous phase ... */ return <div className="p-4">Homepage Placeholder</div>; };
const AuthPageLayout = ({ children, title, theme }) => { /* ... Same as previous phase ... */ return <div>{title}{children}</div>; };
const SignupPage = ({ setCurrentViewFunction, setError, setSuccess, theme }) => { /* ... Same as previous phase ... */ return <div className="p-4">Signup Placeholder</div>; };
const LoginPage = ({ setCurrentViewFunction, setError, setSuccess, theme }) => { /* ... Same as previous phase ... */ return <div className="p-4">Login Placeholder</div>; };

// --- SettingsPage, MyLogPage Components ---
const SettingsPage = ({ userId, userProfile, db, setError, setSuccess, theme, toggleTheme, handleSignOut, navigateToView }) => { /* ... Same as previous phase ... */ return <div className="p-4">Settings Placeholder</div>; };
const MyLogPage = ({ userId, userProfile, db, setError, setSuccess, currentAppId }) => { /* ... Same as Phase 12 (Reverse Geocoding & AI Summary) ... */ return <div className="p-4">My Activity Log Placeholder</div>; };
const ActivityFeed = ({ activities, isLoading, entityType, navigateToView }) => { /* ... Same as Phase 10 ... */ return <div className="p-2">Activity Feed for {entityType}</div>; };

// --- Reverse Geocoding Helper ---
const fetchAddressFromCoordinates = async (latitude, longitude) => { /* ... Same as Phase 12 ... */ return "Address Placeholder"; };


// --- Dashboard Component (Updated for Real-time Stats & New Chart) ---
const Dashboard = ({ userId, userProfile, db, setError, setSuccess, currentAppId, navigateToView }) => {
    const [dashboardStats, setDashboardStats] = useState({
        totalLeads: 0, openDealsCount: 0, openDealsValue: 0, totalContacts: 0,
        activeTasks: 0, upcomingMeetings: 0,
        leadStatusData: [], dealStageData: [], activityTypeData: [], activityStatusData: [] // Added activityStatusData
    });
    const [isLoading, setIsLoading] = useState(true); // Single loading state for all initial data
    const [punchStatus, setPunchStatus] = useState({ status: 'out', lastPunchTime: null, isLoading: true });
    const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82Ca9D', '#FFC0CB', '#A0522D', '#D2691E'];


    // Fetch last punch status (from Phase 6.A)
    useEffect(() => { /* ... Same as Phase 6.A ... */ }, [userId, db, currentAppId, setError]);

    // Fetch all data for dashboard analytics & charts
    useEffect(() => {
        if (!userId || !db) { setIsLoading(false); return; }
        setIsLoading(true);

        const leadsPath = `artifacts/${currentAppId}/users/${userId}/leads`;
        const dealsPath = `artifacts/${currentAppId}/users/${userId}/deals`;
        const contactsPath = `artifacts/${currentAppId}/users/${userId}/contacts`;
        const activitiesPath = `artifacts/${currentAppId}/users/${userId}/activities`;

        // Real-time counts for Leads and Contacts
        const unsubLeadsCount = onSnapshot(collection(db, leadsPath), (snapshot) => {
            setDashboardStats(prev => ({ ...prev, totalLeads: snapshot.size }));
        }, err => { console.error("Error fetching leads count:", err); setError("Failed to load lead count."); });

        const unsubContactsCount = onSnapshot(collection(db, contactsPath), (snapshot) => {
            setDashboardStats(prev => ({ ...prev, totalContacts: snapshot.size }));
        }, err => { console.error("Error fetching contacts count:", err); setError("Failed to load contact count."); });
        
        // One-time fetch for other aggregates (can be converted to onSnapshot for full real-time if needed)
        const fetchAggregates = async () => {
            try {
                const [dealsSnapshot, activitiesSnapshot, leadsFullSnapshot] = await Promise.all([
                    getDocs(collection(db, dealsPath)),
                    getDocs(collection(db, activitiesPath)),
                    getDocs(collection(db, leadsPath)), // For lead status chart
                ]);

                const deals = dealsSnapshot.docs.map(d => d.data());
                const activities = activitiesSnapshot.docs.map(d => d.data());
                const leads = leadsFullSnapshot.docs.map(d => d.data());

                // Lead Status Chart Data
                const leadStatusCounts = leads.reduce((acc, lead) => { acc[lead.status] = (acc[lead.status] || 0) + 1; return acc; }, {});
                const leadStatusData = Object.entries(leadStatusCounts).map(([name, value]) => ({ name, value }));
                
                // Deal Aggregates & Chart Data
                let openDealsValue = 0;
                const dealStageCounts = deals.reduce((acc, deal) => {
                    acc[deal.stage] = (acc[deal.stage] || 0) + 1;
                    if (!["Closed Won", "Closed Lost"].includes(deal.stage)) openDealsValue += deal.value || 0;
                    return acc;
                }, {});
                const dealStageData = Object.entries(dealStageCounts).map(([name, value]) => ({ name, value }));
                const openDealsCount = deals.filter(d => !["Closed Won", "Closed Lost"].includes(d.stage)).length;
                
                // Activity Aggregates & Chart Data
                const activityTypeCounts = activities.reduce((acc, act) => { acc[act.type] = (acc[act.type] || 0) + 1; return acc; }, {});
                const activityTypeData = Object.entries(activityTypeCounts).map(([name, value]) => ({ name, value }));
                
                const activityStatusCounts = activities.reduce((acc, act) => { acc[act.status] = (acc[act.status] || 0) + 1; return acc; }, {});
                const activityStatusData = Object.entries(activityStatusCounts).map(([name, value]) => ({ name, value }));

                const activeTasks = activities.filter(a => a.type === "Task" && ["Open", "In Progress"].includes(a.status)).length;
                const today = new Date(); const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
                const upcomingMeetings = activities.filter(a => a.type === "Meeting" && a.status === "Scheduled" && a.dueDate?.toDate() >= today && a.dueDate?.toDate() <= nextWeek).length;

                setDashboardStats(prev => ({
                    ...prev, openDealsCount, openDealsValue, activeTasks, upcomingMeetings,
                    leadStatusData, dealStageData, activityTypeData, activityStatusData
                }));
            } catch (err) { console.error("Error fetching dashboard aggregates:", err); setError("Failed to load dashboard data."); }
            finally { setIsLoading(false); } // Set loading false after all fetches
        };
        
        fetchAggregates();

        return () => {
            unsubLeadsCount();
            unsubContactsCount();
        };
    }, [userId, db, currentAppId, setError]);


    const handlePunch = async (type) => { /* ... Same as Phase 6.A ... */ };
    const StatCard = ({ title, value, icon: Icon, color, description, isLoadingCard }) => { /* ... Same as Phase 5 ... */ 
        const colors = { blue: "bg-blue-500 dark:bg-blue-600", green: "bg-green-500 dark:bg-green-600", yellow: "bg-yellow-500 dark:bg-yellow-600", purple: "bg-purple-500 dark:bg-purple-600", teal: "bg-teal-500 dark:bg-teal-600", pink: "bg-pink-500 dark:bg-pink-600", indigo: "bg-indigo-500 dark:bg-indigo-600", orange: "bg-orange-500 dark:bg-orange-600" };
        return ( <div className={`p-6 rounded-xl shadow-lg text-white ${colors[color]} transition-all duration-300 hover:shadow-xl hover:scale-105`}> <div className="flex items-center justify-between mb-2"> <h3 className="text-lg font-semibold opacity-90">{title}</h3> <Icon size={28} className="opacity-75" /> </div> {isLoadingCard ? ( <div className="h-10 flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div></div> ) : ( <p className="text-4xl font-bold">{value}</p> )} {description && <p className="text-xs opacity-80 mt-1">{description}</p>} </div> );
    };

    if (!userProfile) return <LoadingSpinner text="Loading dashboard..." />;
    
    const displayStats = [
        { title: "Total Leads", value: dashboardStats.totalLeads, icon: Users, color: "blue", description: "All leads in your pipeline." },
        { title: "Open Deals", value: dashboardStats.openDealsCount, icon: Briefcase, color: "green", description: `Value: $${dashboardStats.openDealsValue.toLocaleString()}` },
        { title: "Total Contacts", value: dashboardStats.totalContacts, icon: UsersRound, color: "indigo", description: "All contacts managed." },
        { title: "Active Tasks", value: dashboardStats.activeTasks, icon: CheckSquare, color: "teal", description: "Tasks needing attention." },
        { title: "Upcoming Meetings", value: dashboardStats.upcomingMeetings, icon: CalendarDays, color: "pink", description: "Meetings in next 7 days." },
    ];

    const CustomTooltip = ({ active, payload, label }) => { /* ... Same as Phase 5 ... */ if (active && payload && payload.length) { return ( <div className="bg-white dark:bg-gray-700 p-2 shadow-lg rounded border dark:border-gray-600 text-sm"> <p className="label text-gray-800 dark:text-gray-100">{`${label} : ${payload[0].value}`}</p> </div> ); } return null; };


    return (
        <div className="animate-fadeIn">
            {/* Punch In/Out Section */}
            <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"> {/* ... Punch UI ... */} </div>

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
                    {isLoading ? <LoadingSpinner text="Loading chart..."/> : dashboardStats.leadStatusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart><Pie data={dashboardStats.leadStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{dashboardData.leadStatusData.map((e, i) => (<Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}</Pie><RechartsTooltip content={<CustomTooltip />} /><Legend iconSize={10}/></PieChart>
                        </ResponsiveContainer>
                    ) : <p className="text-gray-500 dark:text-gray-400 text-center py-10">No lead data for chart.</p>}
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                     <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center"><BarChart3 size={22} className="mr-2 text-green-500"/> Deal Pipeline</h3>
                    {isLoading ? <LoadingSpinner text="Loading chart..."/> : dashboardStats.dealStageData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={dashboardStats.dealStageData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} /><XAxis dataKey="name" angle={-25} textAnchor="end" height={60} interval={0} tick={{fontSize: 9}} stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} /><YAxis allowDecimals={false} stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} /><RechartsTooltip content={<CustomTooltip />} /><Legend iconSize={10}/><Bar dataKey="value" name="Deal Count" fill="#22c55e" radius={[4, 4, 0, 0]} /></BarChart>
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
            <style>{` /* ... fadeIn animation ... */ .recharts-legend-item-text { color: ${theme === 'dark' ? '#D1D5DB' : '#1F2937'} !important; } .recharts-tooltip-label { color: #1F2937 !important; } `}</style>
        </div>
    );
};

// --- Leads Component (Updated for Rule-Based AI Score) ---
const Leads = ({ userId, userProfile, db, setError, setSuccess, currentAppId, navigateToView }) => {
    // ... (State and useEffects for leads and linked activities from Phase 10)
    const [leads, setLeads] = useState([]); /* ... */ const [editingLead, setEditingLead] = useState(null); /* ... */
    const initialFormValues = { name: '', company: '', email: '', phone: '', status: 'New', notes: '', value: 0, aiScore: null, lastActivityDate: null }; // Added lastActivityDate
    const [formValues, setFormValues] = useState(initialFormValues);
    const [linkedActivities, setLinkedActivities] = useState([]); /* ... */
    const [isGeneratingScore, setIsGeneratingScore] = useState(false);

    const calculateRuleBasedScore = (leadData, activitiesCount) => {
        let score = 50; // Base score
        if (leadData.value && leadData.value > 10000) score += 15;
        else if (leadData.value && leadData.value > 1000) score += 5;
        if (leadData.notes && leadData.notes.length > 50) score += 10;
        if (leadData.company) score += 5;
        if (leadData.phone) score += 5;
        if (activitiesCount > 2) score += 10;
        else if (activitiesCount > 0) score += 5;
        
        // Consider recency - if lastActivityDate is recent, higher score
        if (leadData.lastActivityDate) {
            const lastActivity = leadData.lastActivityDate.toDate();
            const today = new Date();
            const diffDays = Math.ceil((today - lastActivity) / (1000 * 60 * 60 * 24));
            if (diffDays <= 7) score += 10; // Active in last week
            else if (diffDays <= 30) score += 5; // Active in last month
        } else {
            score -= 5; // Penalize if no recent activity tracked
        }
        
        return Math.min(Math.max(score, 0), 100); // Ensure score is between 0-100
    };

    const handleGetAIScore = async () => {
        setIsGeneratingScore(true); setError(null);
        const leadDataForScoring = editingLead ? { ...editingLead, ...formValues } : formValues;
        
        // Fetch linked activities count for scoring
        let activitiesCount = linkedActivities.length;
        if (editingLead && editingLead.id && activitiesCount === 0) { // If editing and no activities loaded yet for feed
            try {
                const activitiesPath = `artifacts/${currentAppId}/users/${userId}/activities`;
                const q = query(collection(db, activitiesPath), where("relatedEntityType", "==", "Lead"), where("relatedEntityId", "==", editingLead.id));
                const activitiesSnapshot = await getCountFromServer(q);
                activitiesCount = activitiesSnapshot.data().count;
            } catch (countError) {
                console.error("Error getting activities count for scoring:", countError);
            }
        }
        
        // Get last activity date for this lead
        let lastActivityDate = null;
        if(editingLead && editingLead.id) {
            const activitiesPath = `artifacts/${currentAppId}/users/${userId}/activities`;
            const qLastActivity = query(collection(db, activitiesPath), 
                                        where("relatedEntityType", "==", "Lead"), 
                                        where("relatedEntityId", "==", editingLead.id),
                                        orderBy("updatedAt", "desc"), 
                                        limit(1));
            try {
                const lastActivitySnapshot = await getDocs(qLastActivity);
                if(!lastActivitySnapshot.empty) {
                    lastActivityDate = lastActivitySnapshot.docs[0].data().updatedAt;
                }
            } catch(err) { console.error("Error fetching last activity date for lead:", err); }
        }


        const score = calculateRuleBasedScore({...leadDataForScoring, lastActivityDate}, activitiesCount);
        setFormValues(prev => ({ ...prev, aiScore: score }));
        setSuccess(`Rule-Based Score Calculated: ${score}`);
        setIsGeneratingScore(false);
    };
    // ... (Rest of Leads component logic: openModalForEdit, handleSubmit etc. from Phase 10)
    // Ensure handleSubmit saves the `aiScore` and potentially `lastActivityDate` if you decide to store it on the lead directly.
    return ( /* ... UI with AI Score button and ActivityFeed ... */ <div className="p-4">Leads UI Placeholder</div> );
};

// --- Deals Component (Updated for Rule-Based AI Score) ---
const Deals = ({ userId, userProfile, db, setError, setSuccess, currentAppId, navigateToView }) => {
    // ... (Similar structure and AI scoring logic as Leads component)
    const [deals, setDeals] = useState([]); /* ... */ const [editingDeal, setEditingDeal] = useState(null); /* ... */
    const initialFormValues = { dealName: '', companyName: '', stage: 'Prospecting', value: 0, expectedCloseDate: '', notes: '', aiScore: null, lastActivityDate: null };
    const [formValues, setFormValues] = useState(initialFormValues);
    const [linkedActivities, setLinkedActivities] = useState([]); /* ... */
    const [isGeneratingScore, setIsGeneratingScore] = useState(false);

    const calculateRuleBasedScore = (dealData, activitiesCount) => { /* ... Similar to Leads ... */ return 75; };
    const handleGetAIScore = async () => { /* ... Similar to Leads, adapt for dealData ... */ };
    // ... (Rest of Deals component logic)
    return ( /* ... UI with AI Score button and ActivityFeed ... */ <div className="p-4">Deals UI Placeholder</div> );
};


// --- Activities Component (Updated for AI Task Suggestions - Due Date Parsing) ---
const Activities = ({ userId, userProfile, db, setError, setSuccess, currentAppId }) => {
    // ... (State and most logic from Phase 11)
    const [formValues, setFormValues] = useState({ /* ... priority ... */ });
    const debounceTimeoutRef = useRef(null);
    const [suggestedDueDateText, setSuggestedDueDateText] = useState('');
    const [suggestedPriority, setSuggestedPriority] = useState('');

    const parseRelativeDateSuggestion = (suggestionText) => {
        const today = new Date();
        let targetDate = new Date(today);
        const lowerText = suggestionText.toLowerCase();

        if (lowerText.includes("tomorrow")) {
            targetDate.setDate(today.getDate() + 1);
        } else if (lowerText.includes("next week")) {
            targetDate.setDate(today.getDate() + 7);
        } else if (lowerText.includes("in 2 days")) {
            targetDate.setDate(today.getDate() + 2);
        } else if (lowerText.includes("in 3 days")) {
            targetDate.setDate(today.getDate() + 3);
        } else if (lowerText.match(/next monday|tuesday|wednesday|thursday|friday|saturday|sunday/)) {
            const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            const targetDay = days.findIndex(day => lowerText.includes(day));
            if (targetDay !== -1) {
                let diff = targetDay - today.getDay();
                if (diff <= 0) diff += 7; // Ensure it's next week's day
                targetDate.setDate(today.getDate() + diff);
            } else { return null; } // Unrecognized day
        } else {
            return null; // Could not parse
        }
        return targetDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
    };

    const applySuggestion = (field, value) => {
        if (field === 'priority') {
            setFormValues(prev => ({ ...prev, priority: value }));
            setSuggestedPriority(''); 
        }
        if (field === 'dueDateText') {
            const parsedDate = parseRelativeDateSuggestion(value);
            if (parsedDate) {
                setFormValues(prev => ({ ...prev, dueDate: parsedDate }));
            } else {
                setError("Could not automatically parse date suggestion. Please set manually.");
            }
            setSuggestedDueDateText('');
        }
    };

    // useEffect for AI Task Suggestions (from Phase 11, now uses parseRelativeDateSuggestion)
    useEffect(() => {
        if (formValues.type === 'Task' && !editingActivity && (formValues.subject.length > 3 || formValues.notes.length > 10)) {
            // ... (debounce logic) ...
            // Inside the debounced function:
            // const [dueDateSuggestion, prioritySuggestion] = responseText.split('|').map(s => s.trim());
            // if (dueDateSuggestion) setSuggestedDueDateText(dueDateSuggestion); // Keep as text
            // if (prioritySuggestion && TASK_PRIORITIES.includes(prioritySuggestion)) setSuggestedPriority(prioritySuggestion);
        }
        // ...
    }, [formValues.subject, formValues.notes, formValues.type, editingActivity]);

    // ... (Rest of Activities component logic from Phase 11)
    return ( /* ... UI with AI features ... */ <div className="p-4">Activities UI Placeholder</div> );
};


// --- AdminPanel Component (Updated for "Last Active" Timestamp) ---
const AdminPanel = ({ userId, userProfile, db, setError: setAppErrorGlobal, setSuccess: setAppSuccessGlobal, currentAppId }) => {
    // ... (State from Phase 9 and 6.C)
    const [usersList, setUsersList] = useState([]);
    const [usersLastActivity, setUsersLastActivity] = useState({}); // { [userId]: timestamp }

    // Fetch users and their last activity
    useEffect(() => {
        if (userProfile?.role !== 'admin') { /* ... */ return; }
        // ... (fetch usersList as before) ...
        // After fetching usersList, or when usersList updates, fetch last activity for each user
        if (usersList.length > 0) {
            usersList.forEach(async (userItem) => {
                const attendancePath = `artifacts/${currentAppId}/users/${userItem.id}/attendanceLog`;
                const checkInsPath = `artifacts/${currentAppId}/users/${userItem.id}/locationCheckIns`;
                
                const qAtt = query(collection(db, attendancePath), orderBy("timestamp", "desc"), limit(1));
                const qCheck = query(collection(db, checkInsPath), orderBy("timestamp", "desc"), limit(1));

                try {
                    const [attSnap, checkSnap] = await Promise.all([getDocs(qAtt), getDocs(qCheck)]);
                    let lastAttTime = null;
                    let lastCheckTime = null;
                    if (!attSnap.empty) lastAttTime = attSnap.docs[0].data().timestamp;
                    if (!checkSnap.empty) lastCheckTime = checkSnap.docs[0].data().timestamp;

                    let lastActivityTs = null;
                    if (lastAttTime && lastCheckTime) {
                        lastActivityTs = lastAttTime.toDate() > lastCheckTime.toDate() ? lastAttTime : lastCheckTime;
                    } else {
                        lastActivityTs = lastAttTime || lastCheckTime;
                    }
                    if (lastActivityTs) {
                        setUsersLastActivity(prev => ({ ...prev, [userItem.id]: lastActivityTs }));
                    }
                } catch (err) {
                    console.error(`Error fetching last activity for ${userItem.email}:`, err);
                }
            });
        }
    }, [usersList, userProfile, db, currentAppId]); // Re-run if usersList changes

    const handleRoleChange = async (targetUserId, newRole) => { /* ... Same as Phase 9 ... */ };
    const handlePlanStatusChange = async (targetUserId, newPlanStatus) => { /* ... Same as "Mega Phase" ... */ };
    const renderFieldActivityLog = () => ( /* ... Same as Phase 6.C ... */ <div className="p-2">Field Activity Log with Map Placeholder</div> );

    const renderUserManagement = () => (
        <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-750">
                    <tr>
                        {['Email', 'Role', 'Plan Status', 'Trial Ends', 'Joined', 'Last Active', 'Actions'].map(header => (
                            <th key={header} /* ... */ >{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {usersList.map((userItem) => (
                        <tr key={userItem.id} /* ... */ >
                            {/* ... Email, Role, Plan Status, Trial Ends, Joined On ... */}
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {usersLastActivity[userItem.id] ? formatDateTime(usersLastActivity[userItem.id]) : 'N/A'}
                            </td>
                            {/* ... Actions ... */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    // ... (Rest of AdminPanel UI with tabs)
    return ( <div className="p-4">Admin Panel UI with Tabs (User Management & Field Activity)</div> );
};


// --- App Component (Main structure, navigation, routing) ---
function App() {
    // ... (State and useEffects largely same as Phase 12)
    // Ensure `navigateToView` can handle params for future linking (e.g., to a specific activity)
    const navigateToView = useCallback((view, params = {}) => {
        setAppError(null); setAppSuccess(null); 
        // Store params if needed, or handle specific views that use them
        // For now, just setting the view. If params.activityId, could set an additional state.
        setCurrentView(view);
    }, []);
    
    // ... (Rest of App.js from Phase 12)
    return ( <div className="p-4">Main App Structure (with Leaflet & MarkerCluster CSS loaded)</div> );
}

export default App;
