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
  });
  const [isLoading, setIsLoading] = useState(true);
  const [punchStatus, setPunchStatus] = useState({
    status: 'out',
    lastPunchTime: null,
    isLoading: true,
  });

  // Get current geolocation
  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
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
        () => {
          resolve(null);
        }
      );
    });
  }, []);

  // Punch status (In/Out)
  useEffect(() => {
    if (!userId || !db) {
      setPunchStatus((prev) => ({ ...prev, isLoading: false }));
      return;
    }
    const attendanceLogRef = collection(
      db,
      `artifacts/${currentAppId}/users/${userId}/attendanceLog`
    );
    const q = query(attendanceLogRef, orderBy('timestamp', 'desc'), limit(1));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const lastPunch = snapshot.docs[0].data();
          setPunchStatus({
            status: lastPunch.type === 'punch-in' ? 'in' : 'out',
            lastPunchTime: lastPunch.timestamp ? lastPunch.timestamp.toDate() : null,
            isLoading: false,
          });
        } else {
          setPunchStatus({
            status: 'out',
            lastPunchTime: null,
            isLoading: false,
          });
        }
      },
      () => {
        setError('Could not fetch punch status.');
        setPunchStatus((prev) => ({ ...prev, isLoading: false }));
      }
    );
    return () => unsubscribe();
  }, [userId, db, currentAppId, setError]);

  // Dashboard data (leads, deals, contacts, activities)
  useEffect(() => {
    if (!userId || !db) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    const leadsPath = `artifacts/${currentAppId}/users/${userId}/leads`;
    const dealsPath = `artifacts/${currentAppId}/users/${userId}/deals`;
    const contactsPath = `artifacts/${currentAppId}/users/${userId}/contacts`;
    const activitiesPath = `artifacts/${currentAppId}/users/${userId}/activities`;

    const unsubLeadsCount = onSnapshot(collection(db, leadsPath), (snapshot) => {
      setDashboardData((prev) => ({
        ...prev,
        totalLeads: snapshot.size,
      }));
    });

    const unsubContactsCount = onSnapshot(collection(db, contactsPath), (snapshot) => {
      setDashboardData((prev) => ({
        ...prev,
        totalContacts: snapshot.size,
      }));
    });

    const fetchAggregates = async () => {
      try {
        const [dealsSnapshot, activitiesSnapshot, leadsFullSnapshot] = await Promise.all([
          getDocs(collection(db, dealsPath)),
          getDocs(collection(db, activitiesPath)),
          getDocs(collection(db, leadsPath)),
        ]);
        const deals = dealsSnapshot.docs.map((d) => d.data());
        const activities = activitiesSnapshot.docs.map((d) => d.data());
        const leads = leadsFullSnapshot.docs.map((d) => d.data());

        // Lead Status Pie
        const leadStatusCounts = leads.reduce((acc, lead) => {
          acc[lead.status || 'Unknown'] = (acc[lead.status || 'Unknown'] || 0) + 1;
          return acc;
        }, {});
        const leadStatusData = Object.entries(leadStatusCounts).map(([name, value]) => ({
          name,
          value,
        }));

        // Deals
        let openDealsValue = 0;
        const dealStageCounts = deals.reduce((acc, deal) => {
          acc[deal.stage || 'Unknown'] = (acc[deal.stage || 'Unknown'] || 0) + 1;
          if (!['Closed Won', 'Closed Lost'].includes(deal.stage)) {
            openDealsValue += typeof deal.value === 'number' ? deal.value : 0;
          }
          return acc;
        }, {});
        const dealStageData = Object.entries(dealStageCounts).map(([name, value]) => ({
          name,
          value,
        }));
        const openDealsCount = deals.filter(
          (d) => !['Closed Won', 'Closed Lost'].includes(d.stage)
        ).length;

        // Activities
        const activityTypeCounts = activities.reduce((acc, act) => {
          acc[act.type || 'Unknown'] = (acc[act.type || 'Unknown'] || 0) + 1;
          return acc;
        }, {});
        const activityTypeData = Object.entries(activityTypeCounts).map(([name, value]) => ({
          name,
          value,
        }));

        const activityStatusCounts = activities.reduce((acc, act) => {
          acc[act.status || 'Unknown'] = (acc[act.status || 'Unknown'] || 0) + 1;
          return acc;
        }, {});
        const activityStatusData = Object.entries(activityStatusCounts).map(([name, value]) => ({
          name,
          value,
        }));

        const activeTasks = activities.filter(
          (a) => a.type === 'Task' && ['Open', 'In Progress'].includes(a.status)
        ).length;

        const today = new Date();
        const todayStart = new Date(today.setHours(0, 0, 0, 0));
        const nextWeekEnd = new Date(todayStart);
        nextWeekEnd.setDate(todayStart.getDate() + 7);

        const upcomingMeetings = activities.filter(
          (a) =>
            a.type === 'Meeting' &&
            a.status === 'Scheduled' &&
            a.dueDate?.toDate() >= todayStart &&
            a.dueDate?.toDate() < nextWeekEnd
        ).length;

        setDashboardData((prev) => ({
          ...prev,
          openDealsCount,
          openDealsValue,
          activeTasks,
          upcomingMeetings,
          leadStatusData,
          dealStageData,
          activityTypeData,
          activityStatusData,
        }));
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAggregates();

    return () => {
      unsubLeadsCount();
      unsubContactsCount();
    };
  }, [userId, db, currentAppId, setError]);

  // Handle punch in/out
  const handlePunch = async (type) => {
    if (!userId || !db) {
      setError('User not authenticated or database unavailable.');
      return;
    }
    setPunchStatus((prev) => ({ ...prev, isLoading: true }));
    setError(null);
    setSuccess(null);
    try {
      const location = await getCurrentLocation();
      const attendanceLogRef = collection(
        db,
        `artifacts/${currentAppId}/users/${userId}/attendanceLog`
      );
      const newPunch = {
        type,
        timestamp: serverTimestamp(),
        timezoneOffset: new Date().getTimezoneOffset(),
        location,
      };
      await addDoc(attendanceLogRef, newPunch);
      setSuccess(
        `Successfully Punched ${
          type === 'punch-in' ? 'In' : 'Out'
        }! ${location ? 'Location captured.' : 'Location not captured.'}`
      );
    } catch (error) {
      setError(
        `Failed to Punch ${type === 'punch-in' ? 'In' : 'Out'}: ${error.message}`
      );
    }
  };

  // Stat card component
  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    description,
    isLoadingCard,
    onClick,
  }) => {
    const colors = {
      blue: 'bg-blue-500 dark:bg-blue-600',
      green: 'bg-green-500 dark:bg-green-600',
      yellow: 'bg-yellow-500 dark:bg-yellow-600',
      purple: 'bg-purple-500 dark:bg-purple-600',
      teal: 'bg-teal-500 dark:bg-teal-600',
      pink: 'bg-pink-500 dark:bg-pink-600',
      indigo: 'bg-indigo-500 dark:bg-indigo-600',
    };
    return (
      <div
        className={`p-6 rounded-xl shadow-lg text-white ${colors[color]} transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer`}
        onClick={onClick}
        tabIndex={0}
        role="button"
        aria-pressed="false"
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick && onClick()}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center">
              <Icon size={24} className="mr-2" />
              <span className="text-lg font-semibold">{title}</span>
            </div>
            <div className="text-3xl font-bold">
              {isLoadingCard ? '...' : value}
            </div>
            <div className="text-sm mt-1">{description}</div>
          </div>
        </div>
      </div>
    );
  };

  if (!userProfile) return <LoadingSpinner text="Loading dashboard..." />;

  // Stat cards
  const displayStats = [
    {
      title: 'Total Leads',
      value: dashboardData.totalLeads,
      icon: Users,
      color: 'blue',
      description: 'All leads in your pipeline.',
      onClick: () => navigateToView('leads'),
    },
    {
      title: 'Open Deals',
      value: dashboardData.openDealsCount,
      icon: Briefcase,
      color: 'green',
      description: `Value: $${dashboardData.openDealsValue.toLocaleString()}`,
      onClick: () => navigateToView('deals'),
    },
    {
      title: 'Total Contacts',
      value: dashboardData.totalContacts,
      icon: UsersRound,
      color: 'indigo',
      description: 'All contacts managed.',
      onClick: () => navigateToView('contacts'),
    },
    {
      title: 'Active Tasks',
      value: dashboardData.activeTasks,
      icon: CheckSquare,
      color: 'teal',
      description: 'Tasks needing attention.',
      onClick: () => navigateToView('activities'),
    },
    {
      title: 'Upcoming Meetings',
      value: dashboardData.upcomingMeetings,
      icon: CalendarDays,
      color: 'pink',
      description: 'Meetings in next 7 days.',
      onClick: () => navigateToView('activities'),
    },
  ];

  // Tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-700 p-2 shadow-lg rounded border dark:border-gray-600 text-xs">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, i) => (
            <div key={i} className="flex items-center">
              <span
                className="inline-block w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}: {entry.value}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fadeIn">
      {/* Punch In/Out Section */}
      <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
          <Clock size={22} className="mr-2 text-blue-500 dark:text-blue-400" />
          Daily Attendance
        </h3>
        {punchStatus.isLoading ? (
          <LoadingSpinner text="Fetching punch status..." />
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {punchStatus.status === 'out' ? (
              <button
                onClick={() => handlePunch('punch-in')}
                className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md flex items-center justify-center"
              >
                <LogIn size={20} className="mr-2" /> Punch In
              </button>
            ) : (
              <button
                onClick={() => handlePunch('punch-out')}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md flex items-center justify-center"
              >
                <LogOut size={20} className="mr-2" /> Punch Out
              </button>
            )}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {punchStatus.status === 'in' ? (
                <>
                  Currently{' '}
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    Punched In
                  </span>
                  {punchStatus.lastPunchTime &&
                    ` since ${punchStatus.lastPunchTime.toLocaleTimeString()}`}
                </>
              ) : (
                <>
                  Currently{' '}
                  <span className="font-semibold text-red-500 dark:text-red-400">
                    Punched Out
                  </span>
                  {punchStatus.lastPunchTime &&
                    ` since ${punchStatus.lastPunchTime.toLocaleTimeString()}`}
                </>
              )}
            </div>
          </div>
        )}
        <button
          onClick={() => navigateToView('mylog')}
          className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
        >
          View My Activity Log <ArrowRight size={16} className="ml-1" />
        </button>
      </div>

      <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-2">
        Welcome,{' '}
        <span className="capitalize">
          {userProfile.email ? userProfile.email.split('@')[0] : 'User'}
        </span>
        !
        {userProfile.role === 'admin' && (
          <span className="text-sm font-normal text-orange-500 dark:text-orange-400 ml-2">
            (Admin)
          </span>
        )}
      </h2>
      <p className="text-md text-gray-600 dark:text-gray-400 mb-8">
        Here's your sales performance at a glance.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {displayStats.map((stat) => (
          <StatCard key={stat.title} {...stat} isLoadingCard={isLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
            <LucidePieChart size={22} className="mr-2 text-blue-500" /> Lead Status
          </h3>
          {isLoading ? (
            <LoadingSpinner text="Loading chart..." />
          ) : dashboardData.leadStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dashboardData.leadStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {dashboardData.leadStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-10">
              No lead data for chart.
            </p>
          )}
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
            <BarChart3 size={22} className="mr-2 text-green-500" /> Deal Pipeline
          </h3>
          {isLoading ? (
            <LoadingSpinner text="Loading chart..." />
          ) : dashboardData.dealStageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={dashboardData.dealStageData}
                margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis
                  dataKey="name"
                  stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'}
                />
                <YAxis
                  allowDecimals={false}
                  stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend iconSize={10} />
                <Bar
                  dataKey="value"
                  name="Deals"
                  fill="#34d399"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-10">
              No deal data for chart.
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
            <ActivityIcon size={22} className="mr-2 text-purple-500" /> Activity Types
          </h3>
          {isLoading ? (
            <LoadingSpinner text="Loading chart..." />
          ) : dashboardData.activityTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dashboardData.activityTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {dashboardData.activityTypeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-10">
              No activity data for chart.
            </p>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
            <ListChecks size={22} className="mr-2 text-orange-500" /> Activity Statuses
          </h3>
          {isLoading ? (
            <LoadingSpinner text="Loading chart..." />
          ) : dashboardData.activityStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={dashboardData.activityStatusData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={80}
                  tick={{ fontSize: 10 }}
                  stroke={theme === 'dark' ? '#9ca3af' : '#4b5563'}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend iconSize={10} />
                <Bar
                  dataKey="value"
                  name="Activity Count"
                  fill="#f97316"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-10">
              No activity status data.
            </p>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .recharts-legend-item-text { fill: ${
          theme === 'dark' ? '#D1D5DB' : '#1F2937'
        } !important; }
        .recharts-tooltip-label { color: ${
          theme === 'dark' ? '#D1D5DB' : '#1F2937'
        } !important; }
        .recharts-cartesian-axis-tick-value tspan { fill: ${
          theme === 'dark' ? '#9ca3af' : '#4b5563'
        } !important; }
      `}</style>
    </div>
  );
};

export default Dashboard;
