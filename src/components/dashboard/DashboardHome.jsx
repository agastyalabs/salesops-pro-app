import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import StatCards from './StatCards';
import RecentActivities from './RecentActivities';
import PerformanceChart from './PerformanceChart';

export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
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
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch statistics
      const statsData = await fetchStats();
      
      // Fetch recent activities
      const activitiesData = await fetchActivities();
      
      // Fetch performance data
      const performanceData = await fetchPerformanceData();

      // Update state with all data
      setDashboardData({
        stats: statsData,
        activities: activitiesData,
        performance: performanceData
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const leadsQuery = query(collection(db, 'leads'));
    const leadsSnapshot = await getDocs(leadsQuery);
    const totalLeads = leadsSnapshot.size;

    const dealsQuery = query(
      collection(db, 'deals'),
      where('status', '==', 'active')
    );
    const dealsSnapshot = await getDocs(dealsQuery);
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
  };

  const fetchActivities = async () => {
    const activitiesQuery = query(
      collection(db, 'activities'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    const snapshot = await getDocs(activitiesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };

  const fetchPerformanceData = async () => {
    const dates = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return {
      labels: dates.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })),
      leads: [10, 15, 8, 12, 20, 16, 14],
      conversions: [4, 6, 3, 5, 8, 6, 5]
    };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth="xl">
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
