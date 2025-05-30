import React, { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  getDocs,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Users,
  Briefcase,
  CheckSquare,
  CalendarDays,
  UsersRound,
  Clock,
  LogIn,
  LogOut,
  ArrowRight,
  BarChart3,
  ActivityIcon,
  PieChart as LucidePieChart,
  ListChecks,
  Trophy,
  TrendingUp,
  UserCheck,
  Mail,
  Phone,
  AlertCircle,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CHART_COLORS } from '../config';

import AIInsightsPanel from '../components/AIInsightsPanel';
import AISmartSearch from '../components/AISmartSearch';
import AISummaryWidget from '../components/AISummaryWidget';

import {
  fetchGeminiAIInsights,
  fetchGeminiSearch,
  fetchGeminiSummary,
} from '../utils/geminiApi';

const Dashboard = ({
  userId,
  userProfile,
  db,
  setError,
  setSuccess,
  currentAppId,
  navigateToView,
  theme,
}) => {
  // Example dashboard data state and loading
  const [dashboardData, setDashboardData] = useState({
    leads: 0,
    deals: 0,
    activities: 0,
    contacts: 0,
    // ...add more as needed
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats (adapt this to your real data model)
  useEffect(() => {
    if (!db || !userId) return;
    setLoading(true);

    const fetchStats = async () => {
      try {
        // Example: count leads, deals, activities, contacts for the user
        const leadsSnap = await getDocs(query(collection(db, 'leads'), limit(1)));
        const dealsSnap = await getDocs(query(collection(db, 'deals'), limit(1)));
        const activitiesSnap = await getDocs(query(collection(db, 'activities'), limit(1)));
        const contactsSnap = await getDocs(query(collection(db, 'contacts'), limit(1)));
        setDashboardData({
          leads: leadsSnap.size,
          deals: dealsSnap.size,
          activities: activitiesSnap.size,
          contacts: contactsSnap.size,
        });
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [db, userId, setError]);

  // Main render
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="animate-fadeIn">
      {/* --- AI Features --- */}
      <AIInsightsPanel
        userContext={{ userId, userProfile, stats: dashboardData }}
        fetchGeminiAIInsights={fetchGeminiAIInsights}
      />
      <AISmartSearch
        fetchGeminiSearch={fetchGeminiSearch}
      />
      <AISummaryWidget
        userContext={{ userId, userProfile, stats: dashboardData }}
        fetchGeminiSummary={fetchGeminiSummary}
      />

      {/* --- Example Dashboard widgets (replace with your real UI) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5 flex flex-col items-center">
          <Users className="text-blue-500 mb-2" size={28} />
          <div className="text-2xl font-bold">{dashboardData.leads}</div>
          <div className="text-gray-600 dark:text-gray-300">Leads</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5 flex flex-col items-center">
          <Briefcase className="text-green-500 mb-2" size={28} />
          <div className="text-2xl font-bold">{dashboardData.deals}</div>
          <div className="text-gray-600 dark:text-gray-300">Deals</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5 flex flex-col items-center">
          <ActivityIcon className="text-orange-500 mb-2" size={28} />
          <div className="text-2xl font-bold">{dashboardData.activities}</div>
          <div className="text-gray-600 dark:text-gray-300">Activities</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5 flex flex-col items-center">
          <UserCheck className="text-purple-500 mb-2" size={28} />
          <div className="text-2xl font-bold">{dashboardData.contacts}</div>
          <div className="text-gray-600 dark:text-gray-300">Contacts</div>
        </div>
      </div>
      {/* Add more dashboard content/charts as needed */}
    </div>
  );
};

export default Dashboard;
