import React, { useState, useEffect, useCallback } from 'react';
import { signOut } from 'firebase/auth';
import {
  collection, query, onSnapshot, getDocs, orderBy, limit, addDoc, serverTimestamp
} from 'firebase/firestore';
import {
  Users, Briefcase, UsersRound, CheckSquare, CalendarDays, LogIn, LogOut, ArrowRight,
  BarChart3, ActivityIcon as ActivityLucideIcon, PieChart as LucidePieChart, ListChecks
} from 'lucide-react';
import {
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CHART_COLORS } from '../config';
import { formatDateTime } from '../utils/helpers';
import { auth } from '../utils/firebase';

// Gemini AI widgets/components (adapt to your codebase location)
import GeminiInsightsPanel from '../components/GeminiInsightsPanel';
import GeminiSmartSearchPanel from '../components/GeminiSmartSearchPanel';
import GeminiActivitySummaryPanel from '../components/GeminiActivitySummaryPanel';

const Dashboard = ({
  userId, userProfile, db, setError, setSuccess,
  currentAppId, navigateToView, theme
}) => {
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
    activityStatusData: [],
    recentActivities: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [punchStatus, setPunchStatus] = useState({ status: 'out', lastPunchTime: null, isLoading: true });

  // Get browser location for punch
  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn("Geolocation is not supported.");
        resolve(null); return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => { console.warn("Location fail:", err.message); resolve(null); }
      );
    });
  }, []);

  // Fetch last punch-in/out status
  useEffect(() => {
    if (!userId || !db) { setPunchStatus(prev => ({ ...prev, isLoading: false })); return; }
    const attendanceLogRef = collection(db, `artifacts/${currentAppId}/users/${userId}/attendanceLog`);
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
    }, (err) => { setError("Could not fetch punch status."); setPunchStatus(prev => ({ ...prev, isLoading: false })); });
    return () => unsubscribe();
  }, [userId, db, currentAppId, setError]);

  // Fetch dashboard stats and charts
  useEffect(() => {
    if (!userId || !db) { setIsLoading(false); return; }
    setIsLoading(true);

    const leadsPath = `artifacts/${currentAppId}/users/${userId}/leads`;
    const dealsPath = `artifacts/${currentAppId}/users/${userId}/deals`;
    const contactsPath = `artifacts/${currentAppId}/users/${userId}/contacts`;
    const activitiesPath = `artifacts/${currentAppId}/users/${userId}/activities`;

    const unsubLeadsCount = onSnapshot(query(collection(db, leadsPath)), (snapshot) => {
      setDashboardData(prev => ({ ...prev, totalLeads: snapshot.size }));
    }, err => setError("Failed to load lead count."));

    const unsubContactsCount = onSnapshot(query(collection(db, contactsPath)), (snapshot) => {
      setDashboardData(prev => ({ ...prev, totalContacts: snapshot.size }));
    }, err => setError("Failed to load contact count."));

    async function fetchAggregatesAndCharts() {
      try {
        const [dealsSnapshot, activitiesSnapshot, leadsFullSnapshot] = await Promise.all([
          getDocs(collection(db, dealsPath)),
          getDocs(query(collection(db, activitiesPath), orderBy("createdAt", "desc"), limit(50))),
          getDocs(collection(db, leadsPath)),
        ]);

        const deals = dealsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const activities = activitiesSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const leads = leadsFullSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        // Lead Status
        const leadStatusCounts = leads.reduce((acc, lead) => {
          acc[lead.status || 'Unknown'] = (acc[lead.status || 'Unknown'] || 0) + 1;
          return acc;
        }, {});
        const leadStatusData = Object.entries(leadStatusCounts).map(([name, value]) => ({ name, value }));

        // Deals
        let openDealsValue = 0;
        const dealStageCounts = deals.reduce((acc, deal) => {
          acc[deal.stage || 'Unknown'] = (acc[deal.stage || 'Unknown'] || 0) + 1;
          if (!["Closed Won", "Closed Lost"].includes(deal.stage)) openDealsValue += deal.value || 0;
          return acc;
        }, {});
        const dealStageData = Object.entries(dealStageCounts).map(([name, value]) => ({ name, value }));
        const openDealsCount = deals.filter(d => !["Closed Won", "Closed Lost"].includes(d.stage)).length;

        // Activities
        const activityTypeCounts = activities.reduce((acc, act) => {
          acc[act.type || 'Unknown'] = (acc[act.type || 'Unknown'] || 0) + 1; return acc;
        }, {});
        const activityTypeData = Object.entries(activityTypeCounts).map(([name, value]) => ({ name, value }));

        const activityStatusCounts = activities.reduce((acc, act) => {
          acc[act.status || 'Unknown'] = (acc[act.status || 'Unknown'] || 0) + 1; return acc;
        }, {});
        const activityStatusData = Object.entries(activityStatusCounts).map(([name, value]) => ({ name, value }));

        const activeTasks = activities.filter(a => a.type === "Task" && ["Open", "In Progress"].includes(a.status)).length;
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const nextWeekEnd = new Date(todayStart);
        nextWeekEnd.setDate(todayStart.getDate() + 7);

        const upcomingMeetings = activities.filter(a =>
          a.type === "Meeting" &&
          a.status === "Scheduled" &&
          a.dueDate?.toDate() >= todayStart &&
          a.dueDate?.toDate() < nextWeekEnd
        ).length;

        const recentActivities = activities.slice(0, 5);

        setDashboardData(prev => ({
          ...prev, openDealsCount, openDealsValue, activeTasks, upcomingMeetings,
          leadStatusData, dealStageData, activityTypeData, activityStatusData, recentActivities
        }));
      } catch (err) {
        setError("Failed to load dashboard data.");
      }
      finally { setIsLoading(false); }
    }

    fetchAggregatesAndCharts();
    return () => {
      unsubLeadsCount();
      unsubContactsCount();
    };
  }, [userId, db, currentAppId, setError]);

  // Handle punch in/out
  const handlePunch = async (type) => {
    if (!userId || !db) { setError("User not authenticated or database unavailable."); return; }
    setPunchStatus(prev => ({ ...prev, isLoading: true }));
    setError(null); setSuccess(null);
    try {
      const location = await getCurrentLocation();
      const attendanceLogRef = collection(db, `artifacts/${currentAppId}/users/${userId}/attendanceLog`);
      const newPunch = { type: type, timestamp: serverTimestamp(), timezoneOffset: new Date().getTimezoneOffset(), location: location };
      await addDoc(attendanceLogRef, newPunch);
      setSuccess(`Successfully Punched ${type === 'punch-in' ? 'In' : 'Out'}! ${location ? 'Location captured.' : 'Location not captured.'}`);
    } catch (error) {
      setError(`Failed to Punch ${type === 'punch-in' ? 'In' : 'Out'}: ${error.message}`);
    }
    // loading state will be reset by onSnapshot
  };

  const handleLogout = () => {
    signOut(auth);
    window.location.reload();
  };

  // Stats for cards
  const displayStats = [
    { title: "Total Leads", value: dashboardData.totalLeads, icon: Users, color: "blue", description: "All leads in pipeline." },
    { title: "Open Deals", value: dashboardData.openDealsCount, icon: Briefcase, color: "green", description: `Value: $${dashboardData.openDealsValue.toLocaleString()}` },
    { title: "Total Contacts", value: dashboardData.totalContacts, icon: UsersRound, color: "indigo", description: "All contacts managed." },
    { title: "Active Tasks", value: dashboardData.activeTasks, icon: CheckSquare, color: "teal", description: "Tasks needing attention." },
    { title: "Upcoming Meetings", value: dashboardData.upcomingMeetings, icon: CalendarDays, color: "pink", description: "Meetings in next 7 days." },
  ];

  const colors = {
    blue: "bg-blue-500 dark:bg-blue-600",
    green: "bg-green-500 dark:bg-green-600",
    yellow: "bg-yellow-500 dark:bg-yellow-600",
    purple: "bg-purple-500 dark:bg-purple-600",
    teal: "bg-teal-500 dark:bg-teal-600",
    pink: "bg-pink-500 dark:bg-pink-600",
    indigo: "bg-indigo-500 dark:bg-indigo-600",
    orange: "bg-orange-500 dark:bg-orange-600"
  };

  const StatCard = ({ title, value, icon: Icon, color, description, isLoadingCard }) => (
    <div className={`p-5 rounded-xl shadow-lg text-white ${colors[color]} transition-all duration-300 hover:shadow-xl hover:scale-105 flex flex-col justify-between min-h-[140px]`}>
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-md font-semibold opacity-90">{title}</h3>
          <Icon size={24} className="opacity-75" />
        </div>
        {isLoadingCard ? (
          <div className="h-10 flex items-center"><LoadingSpinner text="" size="sm" /></div>
        ) : (
          <p className="text-3xl font-bold">{value}</p>
        )}
      </div>
      {description && <p className="text-xs opacity-80 mt-1">{description}</p>}
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-700 p-2 shadow-lg rounded border dark:border-gray-600 text-sm">
          <p className="label text-gray-800 dark:text-gray-100">{`${label} : ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent * 100 < 5) return null; // Don't render label for tiny slices
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px">
        {`${name} (${value})`}
      </text>
    );
  };

  if (!userProfile) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="animate-fadeIn space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-white mb-1">
            Welcome, <span className="capitalize">{userProfile.email ? userProfile.email.split('@')[0] : 'User'}</span>!
            {userProfile.role === 'admin' && <span className="text-xs font-normal text-orange-500 dark:text-orange-400 ml-2 py-0.5 px-1.5 bg-orange-100 dark:bg-orange-700/50 rounded-md">(Admin)</span>}
          </h2>
          <p className="text-sm sm:text-md text-gray-600 dark:text-gray-400">Here's your sales performance at a glance.</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-gray-200 dark:bg-gray-700 hover:bg-red-500 dark:hover:bg-red-600 text-gray-800 dark:text-white hover:text-white font-semibold py-2 px-4 rounded shadow transition"
        >
          <LogOut className="inline-block mr-2" size={18} /> Logout
        </button>
      </div>

      {/* AI Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <GeminiInsightsPanel userId={userId} userProfile={userProfile} db={db} theme={theme} />
        </div>
        <div className="col-span-1">
          <GeminiSmartSearchPanel userId={userId} userProfile={userProfile} db={db} theme={theme} />
        </div>
        <div className="col-span-1">
          <GeminiActivitySummaryPanel userId={userId} userProfile={userProfile} db={db} theme={theme} />
        </div>
      </div>

      {/* Attendance Punch In/Out */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
          <Clock size={20} className="mr-2 text-blue-500 dark:text-blue-400" /> Daily Attendance
        </h3>
        {punchStatus.isLoading ? (
          <LoadingSpinner text="Fetching punch status..." size="sm" />
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {punchStatus.status === 'out' ? (
              <button onClick={() => handlePunch('punch-in')}
                className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md flex items-center justify-center transition-colors text-sm">
                <LogIn size={18} className="mr-2" /> Punch In
              </button>
            ) : (
              <button onClick={() => handlePunch('punch-out')}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md flex items-center justify-center transition-colors text-sm">
                <LogOut size={18} className="mr-2" /> Punch Out
              </button>
            )}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {punchStatus.status === 'in' ? (
                <>Currently <span className="font-semibold text-green-600 dark:text-green-400">Punched In</span>
                  {punchStatus.lastPunchTime && ` since ${punchStatus.lastPunchTime.toLocaleTimeString()}`}</>
              ) : (
                <>Currently <span className="font-semibold text-red-500 dark:text-red-400">Punched Out</span>
                  {punchStatus.lastPunchTime && ` since ${punchStatus.lastPunchTime.toLocaleTimeString()}`}</>
              )}
            </div>
          </div>
        )}
        <button onClick={() => navigateToView('myLog')}
          className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center">
          View Full Activity Log <ArrowRight size={14} className="ml-1" />
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        {displayStats.map(stat => <StatCard key={stat.title} {...stat} isLoadingCard={isLoading} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center"><LucidePieChart size={20} className="mr-2 text-blue-500 dark:text-blue-400" /> Lead Status</h3>
          {isLoading ? <LoadingSpinner text="Loading chart..." size="sm" /> : dashboardData.leadStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={dashboardData.leadStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={renderCustomizedLabel}>
                  {dashboardData.leadStatusData.map((e, i) => (<Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 dark:text-gray-400 text-center py-10 text-sm">No lead data for chart.</p>}
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center"><BarChart3 size={20} className="mr-2 text-green-500 dark:text-green-400" /> Deal Pipeline (by Count)</h3>
          {isLoading ? <LoadingSpinner text="Loading chart..." size="sm" /> : dashboardData.dealStageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboardData.dealStageData} margin={{ top: 5, right: 5, left: -25, bottom: 45 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" angle={-35} textAnchor="end" height={60} interval={0} tick={{ fontSize: 9 }} stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} />
                <YAxis allowDecimals={false} stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="value" name="Deal Count" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 dark:text-gray-400 text-center py-10 text-sm">No deal data for chart.</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center"><ActivityLucideIcon size={20} className="mr-2 text-purple-500 dark:text-purple-400" /> Activity Types</h3>
          {isLoading ? <LoadingSpinner text="Loading chart..." size="sm" /> : dashboardData.activityTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={dashboardData.activityTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={renderCustomizedLabel}>
                  {dashboardData.activityTypeData.map((e, i) => (<Cell key={`cell-act-${i}`} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} />))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 dark:text-gray-400 text-center py-10 text-sm">No activity data for chart.</p>}
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center"><ListChecks size={20} className="mr-2 text-orange-500 dark:text-orange-400" /> Activity Statuses</h3>
          {isLoading ? <LoadingSpinner text="Loading chart..." size="sm" /> : dashboardData.activityStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboardData.activityStatusData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis type="number" allowDecimals={false} stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'} interval={0} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="value" name="Activity Count" fill="#f97316" radius={[0, 4, 4, 0]} barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 dark:text-gray-400 text-center py-10 text-sm">No activity status data.</p>}
        </div>
      </div>
      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Recent Activities</h3>
        {isLoading ? <LoadingSpinner text="Loading recent activities..." size="sm" /> : dashboardData.recentActivities.length > 0 ? (
          <ul className="space-y-3">
            {dashboardData.recentActivities.map(act => (
              <li key={act.id} className="text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                <span className="font-semibold">{act.subject}</span> ({act.type}) - <span className="text-gray-600 dark:text-gray-400">{act.status}</span>
                {act.relatedEntityName && <span className="text-xs text-blue-500 dark:text-blue-400 ml-2">(Related to: {act.relatedEntityName})</span>}
              </li>
            ))}
          </ul>
        ) : <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activities to display.</p>}
      </div>
      {/* Navigation (optional, enhance as needed) */}
      <nav className="flex justify-center gap-4 mt-8">
        <button className="text-blue-700 font-bold underline" onClick={() => navigateToView('leads')}>Leads</button>
        <button className="text-green-700 font-bold underline" onClick={() => navigateToView('deals')}>Deals</button>
        <button className="text-indigo-700 font-bold underline" onClick={() => navigateToView('contacts')}>Contacts</button>
        <button className="text-orange-700 font-bold underline" onClick={() => navigateToView('activities')}>Activities</button>
      </nav>
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

export default Dashboard;
