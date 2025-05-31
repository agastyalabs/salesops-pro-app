import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  BusinessCenter as BusinessCenterIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const MetricCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: `${color}.main`, mr: 2 }}>
          {icon}
        </Avatar>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" gutterBottom>
        {typeof value === 'number' && title.includes('Revenue') 
          ? `$${value.toLocaleString()}` 
          : value.toLocaleString()}
      </Typography>
    </CardContent>
  </Card>
);

const ActivityItem = ({ activity, showDivider }) => (
  <>
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        <Avatar>{activity.type?.[0]?.toUpperCase() || 'A'}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={activity.description}
        secondary={activity.timestamp?.toDate?.().toLocaleString() || 'N/A'}
      />
    </ListItem>
    {showDivider && <Divider />}
  </>
);

const QuickActionCard = ({ icon, title, onClick, color }) => (
  <Paper
    sx={{
      p: 2,
      textAlign: 'center',
      cursor: 'pointer',
      '&:hover': { bgcolor: 'action.hover' },
      transition: 'background-color 0.3s'
    }}
    onClick={onClick}
  >
    {React.cloneElement(icon, { sx: { fontSize: 40, color: `${color}.main`, mb: 1 } })}
    <Typography>{title}</Typography>
  </Paper>
);

export default function DashboardHome() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    activeDeals: 0,
    monthlyRevenue: 0,
    recentActivities: []
  });

  useEffect(() => {
    async function fetchDashboardData() {
      if (!currentUser) return;

      try {
        // Get total customers
        const customersQuery = query(
          collection(db, 'customers'),
          where('organizationId', '==', currentUser.uid)
        );
        const customersSnapshot = await getDocs(customersQuery);
        
        // Get active deals
        const dealsQuery = query(
          collection(db, 'deals'),
          where('organizationId', '==', currentUser.uid),
          where('status', '==', 'active')
        );
        const dealsSnapshot = await getDocs(dealsQuery);

        // Calculate revenue (from closed deals in current month)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const revenueQuery = query(
          collection(db, 'deals'),
          where('organizationId', '==', currentUser.uid),
          where('status', '==', 'won'),
          where('closedAt', '>=', startOfMonth)
        );
        const revenueSnapshot = await getDocs(revenueQuery);
        const monthlyRevenue = revenueSnapshot.docs.reduce((sum, doc) => sum + (doc.data().value || 0), 0);

        // Get recent activities
        const activitiesQuery = query(
          collection(db, 'activities'),
          where('organizationId', '==', currentUser.uid),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const activitiesSnapshot = await getDocs(activitiesQuery);
        const recentActivities = activitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setMetrics({
          totalCustomers: customersSnapshot.size,
          activeDeals: dealsSnapshot.size,
          monthlyRevenue,
          recentActivities
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set fallback data if fetch fails
        setMetrics({
          totalCustomers: 0,
          activeDeals: 0,
          monthlyRevenue: 0,
          recentActivities: []
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [currentUser]);

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome back!
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Here's what's happening with your business today
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Customers"
            value={metrics.totalCustomers}
            icon={<PersonIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Deals"
            value={metrics.activeDeals}
            icon={<BusinessCenterIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Monthly Revenue"
            value={metrics.monthlyRevenue}
            icon={<AttachMoneyIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Growth"
            value="+12.5%"
            icon={<TrendingUpIcon />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Recent Activities and Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Recent Activities" />
            <CardContent>
              <List>
                {metrics.recentActivities.length > 0 ? (
                  metrics.recentActivities.map((activity, index) => (
                    <ActivityItem
                      key={activity.id}
                      activity={activity}
                      showDivider={index < metrics.recentActivities.length - 1}
                    />
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No recent activities" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Quick Actions" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <QuickActionCard
                    icon={<PersonIcon />}
                    title="Add Customer"
                    onClick={() => navigate('/dashboard/customers/new')}
                    color="primary"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <QuickActionCard
                    icon={<BusinessCenterIcon />}
                    title="New Deal"
                    onClick={() => navigate('/dashboard/deals/new')}
                    color="success"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
