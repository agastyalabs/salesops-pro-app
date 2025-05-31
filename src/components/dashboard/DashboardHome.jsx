import { useState, useEffect } from 'react';
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
        // Check if any data exists
        const customersQuery = query(
          collection(db, 'customers'),
          where('organizationId', '==', currentUser.uid),
          limit(1)
        );
        const customersSnapshot = await getDocs(customersQuery);

        // Get total customers
        const customersCountQuery = query(
          collection(db, 'customers'),
          where('organizationId', '==', currentUser.uid)
        );
        const customersCountSnapshot = await getDocs(customersCountQuery);
        
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
          totalCustomers: customersCountSnapshot.size,
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

      {/* Recent Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Recent Activities" />
            <CardContent>
              <List>
                {metrics.recentActivities.length > 0 ? (
                  metrics.recentActivities.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>{activity.type?.[0]?.toUpperCase() || 'A'}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={activity.description}
                          secondary={activity.timestamp?.toDate?.().toLocaleString() || 'N/A'}
                        />
                      </ListItem>
                      {index < metrics.recentActivities.length - 1 && <Divider />}
                    </React.Fragment>
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

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Quick Actions" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => navigate('/dashboard/customers/new')}
                  >
                    <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography>Add Customer</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => navigate('/dashboard/deals/new')}
                  >
                    <BusinessCenterIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography>New Deal</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
