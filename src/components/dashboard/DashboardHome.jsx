import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Alert, 
  CircularProgress,
  Paper
} from '@mui/material';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import StatCards from './StatCards';
import RecentActivities from './RecentActivities';
import PerformanceChart from './PerformanceChart';

export default function DashboardHome() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalLeads: 0,
      activeDeals: 0,
      conversionRate: 0,
      totalRevenue: 0
    },
    activities: [],
    performance: {
      labels: [],
      leads: [],
      conversions: []
    }
  });

  useEffect(() => {
    if (!currentUser) {
      setError('Please log in to view the dashboard');
      setLoading(false);
      return;
    }
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const fetchDashboardData = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, activitiesData, performanceData] = await Promise.all([
        fetchStats(),
        fetchActivities(),
        fetchPerformanceData()
      ]);

      setDashboardData({
        stats: statsData,
        activities: activitiesData,
        performance: performanceData
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const leadsQuery = query(
        collection(db, 'leads'),
        where('organizationId', '==', currentUser.uid)
      );
      const dealsQuery = query(
        collection(db, 'deals'),
        where('organizationId', '==', currentUser.uid),
        where('status', '==', 'active')
      );

      const [leadsSnapshot, dealsSnapshot] = await Promise.all([
        getDocs(leadsQuery),
        getDocs(dealsQuery)
      ]);

      const totalLeads = leadsSnapshot.size;
      const activeDeals = dealsSnapshot.size;

      let totalRevenue = 0;
      dealsSnapshot.forEach(doc => {
        const deal = doc.data();
        totalRevenue += deal.value || 0;
      });

      const conversionRate = totalLeads > 0 
        ? ((activeDeals / totalLeads) * 100).toFixed(1)
        : 0;

      return {
        totalLeads,
        activeDeals,
        conversionRate,
        totalRevenue
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw new Error(`Failed to fetch statistics: ${error.message}`);
    }
  };

  const fetchActivities = async () => {
    try {
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('organizationId', '==', currentUser.uid),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(activitiesQuery);
      
      if (snapshot.empty) {
        return [];
      }

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw new Error(`Failed to fetch activities: ${error.message}`);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);

      const performanceQuery = query(
        collection(db, 'activities'),
        where('organizationId', '==', currentUser.uid),
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'asc')
      );

      const snapshot = await getDocs(performanceQuery);
      const dates = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const dailyData = dates.map(date => ({
        date,
        leads: 0,
        conversions: 0
      }));

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const date = data.timestamp.toDate().toISOString().split('T')[0];
        const index = dailyData.findIndex(item => item.date === date);
        if (index !== -1) {
          if (data.type === 'lead') dailyData[index].leads++;
          if (data.type === 'conversion') dailyData[index].conversions++;
        }
      });

      return {
        labels: dailyData.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })),
        leads: dailyData.map(d => d.leads),
        conversions: dailyData.map(d => d.conversions)
      };
    } catch (error) {
      console.error('Error fetching performance data:', error);
      throw new Error(`Failed to fetch performance data: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          gap: 2
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error"
          icon={<AlertCircle />}
          action={
            <Typography 
              variant="button" 
              component="button"
              onClick={fetchDashboardData}
              sx={{ 
                cursor: 'pointer',
                textDecoration: 'underline',
                bgcolor: 'transparent',
                border: 'none',
                color: 'inherit',
                '&:hover': { opacity: 0.8 }
              }}
            >
              Retry
            </Typography>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box 
      component="main"
      sx={{ 
        flexGrow: 1, 
        py: 4,
        bgcolor: 'background.default',
        minHeight: '100vh'
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Here's your business overview.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StatCards stats={dashboardData.stats} />
          </Grid>
          
          <Grid item xs={12} md={8}>
            <PerformanceChart data={dashboardData.performance} />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <RecentActivities activities={dashboardData.activities} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
