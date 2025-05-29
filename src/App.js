import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
// import { getAnalytics } from "firebase/analytics"; // Uncomment if you set up Analytics and its import
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
    MapPin, Clock, History, Check, Eye as ViewIcon, PieChart as LucidePieChart, Map, Sparkles, Link2, Wand2, AlertOctagon, Home,
    TrendingUp, Award
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
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || "YOUR_GEMINI_API_KEY_HERE"; // IMPORTANT: Set via Render Environment Variable
const AVAILABLE_ROLES = ['user', 'admin']; 
const TASK_PRIORITIES = ["Low", "Medium", "High"];
const PLAN_STATUSES = ['trial', 'paid', 'cancelled', 'free']; 
const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82Ca9D', '#FFC0CB', '#A0522D', '#D2691E'];


// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "YOUR_FALLBACK_API_KEY",
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "YOUR_FALLBACK_AUTH_DOMAIN",
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "YOUR_FALLBACK_PROJECT_ID",
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "YOUR_FALLBACK_STORAGE_BUCKET", // Double-check this value
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "YOUR_FALLBACK_MESSAGING_SENDER_ID",
    appId: process.env.REACT_APP_FIREBASE_APP_ID || "YOUR_FALLBACK_APP_ID",
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID // Optional, for Analytics
};
const currentAppId = firebaseConfig.appId || 'default-salesops-app';

// --- Initialize Firebase ---
let app; 
let auth; 
let db;
// let analytics; 

try { 
    app = initializeApp(firebaseConfig); 
    auth = getAuth(app); 
    db = getFirestore(app);
    // if (firebaseConfig.measurementId && typeof getAnalytics === 'function') { 
    //   analytics = getAnalytics(app);
    // }
} catch (e) { 
    console.error("Error initializing Firebase:", e); 
}

// --- Helper Functions ---
const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp instanceof Date) return timestamp.toLocaleDateString();
    if (timestamp.toDate && typeof timestamp.toDate === 'function') return timestamp.toDate().toLocaleDateString();
    try {
        const date = new Date(timestamp);
        if (!isNaN(date.valueOf())) return date.toLocaleDateString();
    } catch (e) { /* ignore */ }
    return 'Invalid Date';
};

const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
     if (timestamp instanceof Date) return timestamp.toLocaleString();
    if (timestamp.toDate && typeof timestamp.toDate === 'function') return timestamp.toDate().toLocaleString();
    try {
        const date = new Date(timestamp);
        if (!isNaN(date.valueOf())) return date.toLocaleString();
    } catch (e) { /* ignore */ }
    return 'Invalid Date';
};

const formatDateForInput = (timestamp) => {
    let dateToFormat;
    if (timestamp && timestamp.toDate && typeof timestamp.toDate === 'function') {
        dateToFormat = timestamp.toDate();
    } else if (timestamp instanceof Date) {
        dateToFormat = timestamp;
    } else if (timestamp && typeof timestamp === 'string') { 
        dateToFormat = new Date(timestamp);
    } else if (timestamp && typeof timestamp === 'number') { // Handle raw ms timestamps
        dateToFormat = new Date(timestamp);
    }

    if (dateToFormat && !isNaN(dateToFormat.valueOf())) {
        // Ensure it's a valid date object before calling toISOString
        if (dateToFormat.toISOString && typeof dateToFormat.toISOString === 'function') {
             return dateToFormat.toISOString().split('T')[0];
        }
    }
    return '';
};


const fetchAddressFromCoordinates = async (latitude, longitude) => {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        console.warn("Invalid coordinates for geocoding:", latitude, longitude);
        return "Invalid coordinates";
    }
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`, {
            headers: { 'User-Agent': `SalesOpsProApp/${currentAppId || 'UnknownApp'}` }
        });
        if (!response.ok) {
            console.warn(`Nominatim API error: ${response.status} ${response.statusText}`);
            return `Address lookup failed (Status: ${response.status})`;
        }
        const data = await response.json();
        return data.display_name || "Address not found";
    } catch (error) {
        console.error("Error fetching address:", error);
        return "Address lookup failed (Network error)";
    }
};

// --- Helper Components ---
const Modal = ({ isOpen, onClose, title, children, size = "lg" }) => { 
    if (!isOpen) return null;
    const sizeClasses = { 
        sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', 
        xl: 'max-w-xl', '2xl': 'max-w-2xl', '3xl': 'max-w-3xl', '4xl': 'max-w-4xl' 
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-md flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out">
            <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full ${sizeClasses[size]} transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalShow max-h-[90vh] flex flex-col`}>
                <div className="flex justify-between items-center mb-4 pb-3 border-b dark:border-gray-700 flex-shrink-0">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Close modal">
                        <XCircle size={24} />
                    </button>
                </div>
                <div className="overflow-y-auto flex-grow pr-1">{children}</div> {/* Added pr-1 for scrollbar aesthetics */}
            </div>
            <style>{`@keyframes modalShow { to { opacity: 1; transform: scale(1); } } .animate-modalShow { animation: modalShow 0.3s forwards; opacity:0; transform: scale(0.95);}`}</style>
        </div>
    );
};

const Tooltip = ({ text, children }) => { 
    const [visible, setVisible] = useState(false);
    return (
        <div className="relative inline-block">
            <div onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)} className="cursor-pointer">
                {children}
            </div>
            {visible && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 dark:bg-gray-900 text-white text-xs font-medium rounded-md shadow-lg z-20 whitespace-nowrap transition-opacity duration-200 opacity-0 animate-tooltipShow">
                    {text}
                </div>
            )}
             <style>{`@keyframes tooltipShow { to { opacity: 1; } } .animate-tooltipShow { animation: tooltipShow 0.2s forwards; opacity:0;}`}</style>
        </div>
    ); 
};

const AlertMessage = ({ message, type, onDismiss }) => { 
    if (!message) return null;
    const SvgIcon = type === 'error' ? AlertTriangle : type === 'success' ? CheckCircle : AlertTriangle;
    const baseClasses = "p-3 my-2 rounded-md shadow-sm text-sm flex items-center justify-between pointer-events-auto";
    const typeClasses = {
        error: 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200 border-l-4 border-red-500',
        success: 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 border-l-4 border-green-500',
        info: 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 border-l-4 border-blue-500',
    };
    return (<div className={`${baseClasses} ${typeClasses[type] || typeClasses.info}`}><div className="flex items-center"><SvgIcon size={18} className="mr-2 flex-shrink-0" /><span>{message}</span></div>{onDismiss && <button onClick={onDismiss} className="ml-3 text-current hover:opacity-75"><XCircle size={16}/></button>}</div>);
};

const LoadingSpinner = ({ text = "Loading...", size="md" }) => { 
    const sizeClasses = {sm: "h-5 w-5", md: "h-8 w-8", lg: "h-12 w-12"};
    return (<div className="flex flex-col items-center justify-center h-full py-2 text-center"><svg className={`animate-spin ${sizeClasses[size]} text-blue-600 dark:text-blue-400 mb-1`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>{text && <p className="text-xs font-medium text-gray-600 dark:text-gray-300">{text}</p>}</div>);
};

const InputField = React.forwardRef(({ icon: Icon, label, id, type = "text", value, onChange, name, placeholder, required = false, children, step, min }, ref) => { 
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    return (
    <div className="mb-4">
        {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>}
        <div className="relative">
            {Icon && <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500"><Icon size={18}/></span>}
            <input 
                id={id} 
                ref={ref} 
                type={isPassword ? (showPassword ? 'text' : 'password') : type} 
                value={value} 
                onChange={onChange} 
                name={name} 
                placeholder={placeholder} 
                required={required} 
                step={step} 
                min={min} 
                className={`w-full p-2.5 ${Icon ? 'pl-10' : 'pl-3'} ${isPassword ? 'pr-10' : ''} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors`} 
            />
            {isPassword && (
                <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" 
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            )}
            {children}
        </div>
    </div>
    );
});

const ActivityFeed = ({ activities, isLoading, entityType, navigateToView }) => {
    if (isLoading) return <LoadingSpinner text={`Loading ${entityType} activities...`} size="sm"/>;
    if (!activities || activities.length === 0) {
        return (
            <div className="mt-6 pt-4 border-t dark:border-gray-700">
                 <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-3">Related Activities:</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">No activities linked to this {entityType.toLowerCase()}.</p>
            </div>
        );
    }

    return (
        <div className="mt-6 pt-4 border-t dark:border-gray-700">
            <h4 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-3">Related Activities ({activities.length}):</h4>
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {activities.map(activity => (
                    <li key={activity.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <span 
                                className="font-semibold text-gray-800 dark:text-gray-100 cursor-pointer hover:underline" 
                                onClick={() => navigateToView('activities', { openActivityId: activity.id })} // Future: open specific activity
                                title={activity.subject}
                            >
                                {activity.subject && activity.subject.length > 40 ? activity.subject.substring(0, 37) + "..." : activity.subject}
                            </span>
                            <span className={`flex-shrink-0 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${ activity.status === 'Completed' || activity.status === 'Logged' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : activity.status === 'Open' || activity.status === 'Scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100' : activity.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100' }`}>{activity.status}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Type: {activity.type} {activity.dueDate && `| Due: ${formatDateTime(activity.dueDate)}`}
                        </p>
                        {activity.notes && <p className="mt-1 text-gray-600 dark:text-gray-300 text-xs whitespace-pre-wrap">{activity.notes.substring(0,100)}{activity.notes.length > 100 ? '...' : ''}</p>}
                    </li>
                ))}
            </ul>
             <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
            `}</style>
        </div>
    );
};


// --- Main View Components ---
const Homepage = ({ setCurrentViewFunction, theme, toggleTheme, isAuthenticated }) => { 
    const features = [
        { name: "Intelligent Lead Management", description: "Capture, track, score, and distribute leads efficiently to close more deals faster.", icon: Target, color: "text-blue-500" },
        { name: "Streamlined Deal Tracking", description: "Visualize your sales pipeline, manage stages, and forecast revenue with precision.", icon: Briefcase, color: "text-green-500" },
        { name: "Comprehensive Contact Hub", description: "Maintain a 360-degree view of your contacts, interactions, and history.", icon: UsersRound, color: "text-indigo-500" },
        { name: "Actionable Sales Analytics", description: "Gain deep insights into performance with customizable reports and dashboards.", icon: LucideLineChart, color: "text-purple-500" },
        { name: "Workflow Automation", description: "Automate repetitive sales tasks, follow-ups, and notifications to boost productivity.", icon: Zap, color: "text-yellow-500" },
        { name: "Customizable & Secure", description: "Tailor the platform to your needs with robust security and permission controls.", icon: ShieldCheck, color: "text-red-500" },
    ];
    return ( <div className={`min-h-screen flex flex-col font-inter ${theme === 'dark' ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}> <header className="py-4 px-6 md:px-10 shadow-sm sticky top-0 z-40 bg-white dark:bg-gray-800/80 backdrop-blur-md"> <div className="container mx-auto flex justify-between items-center"> <div className="flex items-center cursor-pointer" onClick={() => setCurrentViewFunction('homepage')}> <Briefcase size={28} className="text-blue-600 dark:text-blue-400" /> <h1 className="text-2xl font-bold ml-2.5 text-gray-800 dark:text-white">SalesOps Pro</h1> </div> <div className="flex items-center space-x-4"> <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Toggle theme"> {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />} </button> {isAuthenticated ? ( <button onClick={() => setCurrentViewFunction('dashboard')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm"> Dashboard </button> ) : ( <> <button onClick={() => setCurrentViewFunction('login')} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium py-2 px-4 rounded-lg transition-colors text-sm"> Login </button> <button onClick={() => setCurrentViewFunction('signup')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm"> Sign Up Free </button> </> )} </div> </div> </header> <main className="flex-grow"> <section className="py-20 md:py-32 text-center bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-700 dark:via-blue-600 dark:to-indigo-700 text-white"> <div className="container mx-auto px-6"> <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fadeInUp"> Elevate Your Sales Operations </h2> <p className="text-lg md:text-xl lg:text-2xl mb-10 max-w-3xl mx-auto opacity-90 animate-fadeInUp animation-delay-300"> SalesOps Pro provides the tools you need to streamline processes, boost productivity, and drive revenue growth. All in one powerful, intuitive platform. </p> <button onClick={() => setCurrentViewFunction(isAuthenticated ? 'dashboard' : 'signup')} className="bg-white hover:bg-gray-100 text-blue-600 dark:text-blue-500 dark:hover:bg-gray-200 font-bold py-3 px-8 rounded-lg shadow-xl hover:shadow-2xl text-lg transition-all duration-300 transform hover:scale-105 animate-fadeInUp animation-delay-600 flex items-center mx-auto"> {isAuthenticated ? 'Go to Dashboard' : `Start Your ${TRIAL_DURATION_DAYS}-Day Free Trial`} <ArrowRight size={20} className="ml-2" /> </button> </div> </section> <section className="py-16 md:py-24 bg-white dark:bg-gray-800"> <div className="container mx-auto px-6"> <div className="text-center mb-12 md:mb-16"> <h3 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">Powerful Features, Seamless Experience</h3> <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"> Everything you need to supercharge your sales team and achieve your targets. </p> </div> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"> {features.map((feature, index) => ( <div key={feature.name} className="bg-gray-50 dark:bg-gray-850 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 animate-fadeInUp" style={{animationDelay: `${index * 150 + 300}ms`}}> <div className={`p-3 inline-block rounded-full bg-opacity-10 mb-4 ${feature.color.replace('text-', 'bg-')}`}> <feature.icon size={28} className={feature.color} /> </div> <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{feature.name}</h4> <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p> </div> ))} </div> </div> </section> </main> <footer className="py-8 text-center bg-gray-100 dark:bg-gray-850 border-t dark:border-gray-700"> <div className="container mx-auto px-6"> <p className="text-gray-600 dark:text-gray-400 text-sm"> &copy; {new Date().getFullYear()} SalesOps Pro. All rights reserved. </p> </div> </footer> <style>{`.animation-delay-300 { animation-delay: 0.3s; } .animation-delay-600 { animation-delay: 0.6s; } @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeInUp { animation-name: fadeInUp; animation-duration: 0.7s; animation-fill-mode: both; } .dark .bg-gray-850 { background-color: #161d2a; }`}</style> </div> ); };
const AuthPageLayout = ({ children, title, theme }) => { return ( <div className={`min-h-screen flex flex-col items-center justify-center font-inter p-4 ${theme === 'dark' ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}> <div className="flex items-center mb-8"> <Briefcase size={32} className="text-blue-600 dark:text-blue-400" /> <h1 className="text-3xl font-bold ml-3 text-gray-800 dark:text-white">SalesOps Pro</h1> </div> <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl"> <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-6">{title}</h2> {children} </div> <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400"> &copy; {new Date().getFullYear()} SalesOps Pro. </p> </div> ); };
const SignupPage = ({ setCurrentViewFunction, setError, setSuccess, theme }) => { 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null); setSuccess(null);
        if (password !== confirmPassword) { setError("Passwords do not match."); return; }
        if (password.length < 6) { setError("Password should be at least 6 characters long."); return; }
        setIsLoading(true);
        try {
            const usersCollectionRef = collection(db, `artifacts/${currentAppId}/users`);
            const q = query(usersCollectionRef, limit(1));
            const existingUsersSnapshot = await getDocs(q);
            const isFirstUser = existingUsersSnapshot.empty;
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const trialStartDate = serverTimestamp();
            const jsTrialEndDate = new Date(); jsTrialEndDate.setDate(jsTrialEndDate.getDate() + TRIAL_DURATION_DAYS);
            const trialEndDate = Timestamp.fromDate(jsTrialEndDate);
            const userDocRef = doc(db, `artifacts/${currentAppId}/users/${user.uid}`);
            await setDoc(userDocRef, {
                uid: user.uid, email: user.email, role: isFirstUser ? 'admin' : 'user', 
                createdAt: serverTimestamp(), planStatus: 'trial',
                trialStartDate: trialStartDate, trialEndDate: trialEndDate,
            });
            setSuccess(`Signup successful! ${isFirstUser ? 'You have been assigned as an Admin. ' : ''}Your ${TRIAL_DURATION_DAYS}-day trial has started. You can now log in.`); 
            setCurrentViewFunction('login');
        } catch (error) {
            console.error("Error signing up:", error);
            if (error.code === 'auth/email-already-in-use') setError('This email is already in use.');
            else if (error.code === 'auth/weak-password') setError('Password is too weak.');
            else setError(error.message);
        } finally { setIsLoading(false); }
    };
    return ( <AuthPageLayout title="Create Your Account" theme={theme}> <form onSubmit={handleSignup} className="space-y-4"> <InputField icon={AtSign} label="Email Address" id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /> <InputField icon={KeyRound} label="Password" id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required /> <InputField icon={KeyRound} label="Confirm Password" id="confirmPassword" name="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required /> <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 flex items-center justify-center"> {isLoading ? <LoadingSpinner text="" size="sm"/> : `Start ${TRIAL_DURATION_DAYS}-Day Free Trial`} </button> </form> <p className="mt-6 text-center text-sm"> Already have an account?{' '} <button onClick={() => setCurrentViewFunction('login')} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"> Log in </button> </p> </AuthPageLayout> );
};
const LoginPage = ({ setCurrentViewFunction, setError, setSuccess, theme }) => { 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleLogin = async (e) => {
        e.preventDefault(); setError(null); setSuccess(null); setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setCurrentViewFunction('dashboard');
        } catch (error) {
            console.error("Error logging in:", error);
             if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') setError('Invalid email or password.');
            else setError(error.message);
        } finally { setIsLoading(false); }
    };
    return ( <AuthPageLayout title="Log In to Your Account" theme={theme}> <form onSubmit={handleLogin} className="space-y-4"> <InputField icon={AtSign} label="Email Address" id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /> <InputField icon={KeyRound} label="Password" id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required /> <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 flex items-center justify-center"> {isLoading ? <LoadingSpinner text="" size="sm"/> : 'Log In'} </button> </form> <p className="mt-6 text-center text-sm"> Don't have an account?{' '} <button onClick={() => setCurrentViewFunction('signup')} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"> Sign up </button> </p> </AuthPageLayout> );
};
const Dashboard = ({ userId, userProfile, db, setError, setSuccess, currentAppId, navigateToView, theme }) => {
    const [dashboardData, setDashboardData] = useState({
        totalLeads: 0, openDealsCount: 0, openDealsValue: 0, totalContacts: 0,
        activeTasks: 0, upcomingMeetings: 0,
        leadStatusData: [], dealStageData: [], activityTypeData: [], activityStatusData: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [punchStatus, setPunchStatus] = useState({ status: 'out', lastPunchTime: null, isLoading: true });
    
    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser."));
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
                    console.warn("Error getting location:", error.message);
                    resolve(null); 
                }
            );
        });
    };

    useEffect(() => {
        if (!userId || !db) {
            setPunchStatus(prev => ({ ...prev, isLoading: false }));
            return;
        }
        const attendanceLogRef = collection(db, `artifacts/${currentAppId}/users/${userId}/attendanceLog`);
        const q = query(attendanceLogRef, orderBy("timestamp", "desc"), limit(1));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const lastPunch = snapshot.docs[0].data();
                setPunchStatus({
                    status: lastPunch.type === 'punch-in' ? 'in' : 'out',
                    lastPunchTime: lastPunch.timestamp.toDate(),
                    isLoading: false
                });
            } else {
                setPunchStatus({ status: 'out', lastPunchTime: null, isLoading: false });
            }
        }, (err) => { console.error("Error fetching punch status:", err); setError("Could not fetch punch status."); setPunchStatus(prev => ({ ...prev, isLoading: false })); });
        return () => unsubscribe();
    }, [userId, db, currentAppId, setError]);

    useEffect(() => {
        if (!userId || !db) { setIsLoading(false); return; }
        setIsLoading(true);
        const leadsPath = `artifacts/${currentAppId}/users/${userId}/leads`;
        const dealsPath = `artifacts/${currentAppId}/users/${userId}/deals`;
        const contactsPath = `artifacts/${currentAppId}/users/${userId}/contacts`;
        const activitiesPath = `artifacts/${currentAppId}/users/${userId}/activities`;

        const unsubLeadsCount = onSnapshot(collection(db, leadsPath), (snapshot) => setDashboardData(prev => ({ ...prev, totalLeads: snapshot.size })), err => { console.error("Leads count error:", err); setError("Failed lead count."); });
        const unsubContactsCount = onSnapshot(collection(db, contactsPath), (snapshot) => setDashboardData(prev => ({ ...prev, totalContacts: snapshot.size })), err => { console.error("Contacts count error:", err); setError("Failed contact count."); });
        
        const fetchAggregates = async () => {
            try {
                const [dealsSnapshot, activitiesSnapshot, leadsFullSnapshot] = await Promise.all([
                    getDocs(collection(db, dealsPath)), getDocs(collection(db, activitiesPath)), getDocs(collection(db, leadsPath)),
                ]);
                const deals = dealsSnapshot.docs.map(d => d.data());
                const activities = activitiesSnapshot.docs.map(d => d.data());
                const leads = leadsFullSnapshot.docs.map(d => d.data());

                const leadStatusCounts = leads.reduce((acc, lead) => { acc[lead.status] = (acc[lead.status] || 0) + 1; return acc; }, {});
                const leadStatusData = Object.entries(leadStatusCounts).map(([name, value]) => ({ name, value }));
                
                let openDealsValue = 0;
                const dealStageCounts = deals.reduce((acc, deal) => { acc[deal.stage] = (acc[deal.stage] || 0) + 1; if (!["Closed Won", "Closed Lost"].includes(deal.stage)) openDealsValue += deal.value || 0; return acc; }, {});
                const dealStageData = Object.entries(dealStageCounts).map(([name, value]) => ({ name, value }));
                const openDealsCount = deals.filter(d => !["Closed Won", "Closed Lost"].includes(d.stage)).length;
                
                const activityTypeCounts = activities.reduce((acc, act) => { acc[act.type] = (acc[act.type] || 0) + 1; return acc; }, {});
                const activityTypeData = Object.entries(activityTypeCounts).map(([name, value]) => ({ name, value }));
                
                const activityStatusCounts = activities.reduce((acc, act) => { acc[act.status] = (acc[act.status] || 0) + 1; return acc; }, {});
                const activityStatusData = Object.entries(activityStatusCounts).map(([name, value]) => ({ name, value }));

                const activeTasks = activities.filter(a => a.type === "Task" && ["Open", "In Progress"].includes(a.status)).length;
                const today = new Date(); const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
                const upcomingMeetings = activities.filter(a => a.type === "Meeting" && a.status === "Scheduled" && a.dueDate?.toDate() >= today && a.dueDate?.toDate() <= nextWeek).length;

                setDashboardData(prev => ({ ...prev, openDealsCount, openDealsValue, activeTasks, upcomingMeetings, leadStatusData, dealStageData, activityTypeData, activityStatusData }));
            } catch (err) { console.error("Error fetching dashboard aggregates:", err); setError("Failed to load dashboard data."); }
            finally { setIsLoading(false); }
        };
        fetchAggregates();
        return () => { unsubLeadsCount(); unsubContactsCount(); };
    }, [userId, db, currentAppId, setError]);

    const handlePunch = async (type) => {
        if (!userId || !db) { setError("User not authenticated or database unavailable."); return; }
        setPunchStatus(prev => ({ ...prev, isLoading: true })); setError(null); setSuccess(null);
        try {
            const location = await getCurrentLocation();
            const attendanceLogRef = collection(db, `artifacts/${currentAppId}/users/${userId}/attendanceLog`);
            const newPunch = { type: type, timestamp: serverTimestamp(), timezoneOffset: new Date().getTimezoneOffset(), location: location };
            await addDoc(attendanceLogRef, newPunch);
            setSuccess(`Successfully Punched ${type === 'punch-in' ? 'In' : 'Out'}! ${location ? 'Location captured.' : 'Location not captured.'}`);
        } catch (error) { console.error(`Error during punch-${type}:`, error); setError(`Failed to Punch ${type === 'punch-in' ? 'In' : 'Out'}: ${error.message}`); setPunchStatus(prev => ({ ...prev, isLoading: false }));}
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

    return ( <div className="animate-fadeIn"> <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"> <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center"> <Clock size={22} className="mr-2 text-blue-500 dark:text-blue-400" /> Daily Attendance </h3> {punchStatus.isLoading ? ( <LoadingSpinner text="Fetching punch status..." /> ) : ( <div className="flex flex-col sm:flex-row items-center gap-4"> {punchStatus.status === 'out' ? ( <button onClick={() => handlePunch('punch-in')} className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md flex items-center justify-center transition-colors"> <LogIn size={20} className="mr-2" /> Punch In </button> ) : ( <button onClick={() => handlePunch('punch-out')} className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md flex items-center justify-center transition-colors"> <LogOut size={20} className="mr-2" /> Punch Out </button> )} <div className="text-sm text-gray-600 dark:text-gray-400"> {punchStatus.status === 'in' ? ( <> Currently <span className="font-semibold text-green-600 dark:text-green-400">Punched In</span> {punchStatus.lastPunchTime && ` since ${punchStatus.lastPunchTime.toLocaleTimeString()}`} </> ) : ( <> Currently <span className="font-semibold text-red-500 dark:text-red-400">Punched Out</span> {punchStatus.lastPunchTime && ` since ${punchStatus.lastPunchTime.toLocaleTimeString()}`} </> )} </div> </div> )} <button onClick={() => navigateToView('myLog')} className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"> View My Activity Log <ArrowRight size={16} className="ml-1"/> </button> </div> <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-2"> Welcome, <span className="capitalize">{userProfile.email ? userProfile.email.split('@')[0] : 'User'}</span>! {userProfile.role === 'admin' && <span className="text-sm font-normal text-orange-500 dark:text-orange-400 ml-2">(Admin)</span>} </h2> <p className="text-md text-gray-600 dark:text-gray-400 mb-8">Here's your sales performance at a glance.</p> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8"> {displayStats.map(stat => <StatCard key={stat.title} {...stat} isLoadingCard={isLoading} />)} </div> <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"> <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"> <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center"><LucidePieChart size={22} className="mr-2 text-blue-500"/> Lead Status</h3> {isLoading ? <LoadingSpinner text="Loading chart..."/> : dashboardData.leadStatusData.length > 0 ? ( <ResponsiveContainer width="100%" height={250}> <PieChart><Pie data={dashboardData.leadStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{dashboardData.leadStatusData.map((e, i) => (<Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}</Pie><RechartsTooltip content={<CustomTooltip />} /><Legend iconSize={10}/></PieChart> </ResponsiveContainer> ) : <p className="text-gray-500 dark:text-gray-400 text-center py-10">No lead data for chart.</p>} </div> <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"> <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center"><BarChart3 size={22} className="mr-2 text-green-500"/> Deal Pipeline</h3> {isLoading ? <LoadingSpinner text="Loading chart..."/> : dashboardData.dealStageData.length > 0 ? ( <ResponsiveContainer width="100%" height={250}> <BarChart data={dashboardData.dealStageData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} /><XAxis dataKey="name" angle={-25} textAnchor="end" height={60} interval={0} tick={{fontSize: 9}} stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} /><YAxis allowDecimals={false} stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} /><RechartsTooltip content={<CustomTooltip />} /><Legend iconSize={10}/><Bar dataKey="value" name="Deal Count" fill="#22c55e" radius={[4, 4, 0, 0]} /></BarChart> </ResponsiveContainer> ) : <p className="text-gray-500 dark:text-gray-400 text-center py-10">No deal data for chart.</p>} </div> </div> <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"> <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"> <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center"><ActivityIcon size={22} className="mr-2 text-purple-500"/> Activity Types</h3> {isLoading ? <LoadingSpinner text="Loading chart..."/> : dashboardData.activityTypeData.length > 0 ? ( <ResponsiveContainer width="100%" height={250}> <PieChart><Pie data={dashboardData.activityTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{dashboardData.activityTypeData.map((e, i) => (<Cell key={`cell-act-${i}`} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} />))}</Pie><RechartsTooltip content={<CustomTooltip />} /><Legend iconSize={10}/></PieChart> </ResponsiveContainer> ) : <p className="text-gray-500 dark:text-gray-400 text-center py-10">No activity data for chart.</p>} </div> <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"> <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center"><ListChecks size={22} className="mr-2 text-orange-500"/> Activity Statuses</h3> {isLoading ? <LoadingSpinner text="Loading chart..."/> : dashboardData.activityStatusData.length > 0 ? ( <ResponsiveContainer width="100%" height={250}> <BarChart data={dashboardData.activityStatusData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}> <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} /> <XAxis type="number" allowDecimals={false} stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} /> <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10}} stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} /> <RechartsTooltip content={<CustomTooltip />} /> <Legend iconSize={10}/> <Bar dataKey="value" name="Activity Count" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20}/> </BarChart> </ResponsiveContainer> ) : <p className="text-gray-500 dark:text-gray-400 text-center py-10">No activity status data.</p>} </div> </div> <style>{` @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; } .recharts-legend-item-text { color: ${theme === 'dark' ? '#D1D5DB' : '#1F2937'} !important; } .recharts-tooltip-label { color: #1F2937 !important; } `}</style> </div>);
};
// ... (Full code for Leads, Deals, Contacts, Activities, MyLogPage, AdminPanel, SettingsPage would follow here) ...

// --- App Component (Main structure, navigation, routing) ---
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
        
        if (!auth || !db) { setAppError("Firebase is not initialized. Please check your configuration or refresh."); setIsAuthReady(true); return; }
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            let profileListener = () => {};
            if (user) {
                setAuthUser(user); setCurrentUserId(user.uid);
                const userDocRef = doc(db, `artifacts/${currentAppId}/users/${user.uid}`);
                profileListener = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setCurrentUserProfile(docSnap.data());
                        if (['login', 'signup'].includes(currentView)) navigateToView('dashboard');
                    } else {
                        console.warn("User profile not found for UID:", user.uid, "Path:", userDocRef.path);
                         const basicProfile = { uid: user.uid, email: user.email, role: 'user', planStatus: 'trial', createdAt: serverTimestamp(), trialStartDate: serverTimestamp(), trialEndDate: Timestamp.fromDate(new Date(Date.now() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000))};
                        setDoc(userDocRef, basicProfile)
                            .then(() => {
                                setCurrentUserProfile(basicProfile);
                                console.log("Basic profile created for new user:", user.uid);
                                if (['login', 'signup'].includes(currentView)) navigateToView('dashboard');
                            })
                            .catch(err => {
                                console.error("Error creating fallback profile:", err);
                                setCurrentUserProfile({ email: user.email, uid: user.uid, role: 'user', planStatus: 'unknown' }); 
                                if (['login', 'signup'].includes(currentView)) navigateToView('dashboard'); 
                            });
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
            await signOut(auth); 
            setAppSuccess("Successfully signed out."); 
            navigateToView('homepage'); 
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

    if (!isAuthReady) {
        return <div className={`flex h-screen items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}><LoadingSpinner text="Initializing SalesOps Pro..." /></div>;
    }
    
    const GlobalAlerts = () => ( 
        (appError || appSuccess) ? 
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md p-0 z-[1000] pointer-events-auto">
            {appError && <AlertMessage message={appError} type="error" onDismiss={clearMessages} />}
            {appSuccess && <AlertMessage message={appSuccess} type="success" onDismiss={clearMessages} />}
        </div> 
        : null 
    );

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
            case 'dashboard': return <Dashboard {...commonProps} theme={theme} />; // Pass theme to dashboard for charts
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
            return (<div className="bg-yellow-400 dark:bg-yellow-600 text-gray-800 dark:text-white text-xs sm:text-sm text-center py-1.5 sm:py-2 px-4 flex items-center justify-center"><Gift size={16} className="mr-1.5 sm:mr-2"/>Trial: {daysLeft > 0 ? `${daysLeft} day${daysLeft > 1 ? 's' : ''} left.` : 'Ends today.'}<button onClick={() => navigateToView('settings')} className="ml-2 sm:ml-3 font-semibold underline hover:opacity-80">Upgrade</button></div>);
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
