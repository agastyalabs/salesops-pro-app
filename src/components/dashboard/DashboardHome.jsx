import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { collection, query, limit, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardHome() {
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    activeDeals: 0,
    totalRevenue: 0,
    recentActivities: []
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch customers count
        const customersQuery = query(
          collection(db, 'customers'),
          where('organizationId', '==', currentUser.uid)
        );
        const customersSnap = await getDocs(customersQuery);
        
        // Fetch active deals
        const dealsQuery = query(
          collection(db, 'deals'),
          where('organizationId', '==', currentUser.uid),
          where('status', '==', 'active')
        );
        const dealsSnap = await getDocs(dealsQuery);
        
        // Calculate total revenue
        let revenue = 0;
        dealsSnap.forEach(doc => {
          revenue += doc.data().value || 0;
        });

        // Fetch recent activities
        const activitiesQuery = query(
          collection(db, 'activities'),
          where('organizationId', '==', currentUser.uid),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const activitiesSnap = await getDocs(activitiesQuery);
        const activities = [];
        activitiesSnap.forEach(doc => {
          activities.push({ id: doc.id, ...doc.data() });
        });

        setMetrics({
          totalCustomers: customersSnap.size,
          activeDeals: dealsSnap.size,
          totalRevenue: revenue,
          recentActivities: activities
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    }

    fetchDashboardData();
  }, [currentUser]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome back!
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Customers
            </Typography>
            <Typography variant="h4">
              {metrics.totalCustomers}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Active Deals
            </Typography>
            <Typography variant="h4">
              {metrics.activeDeals}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Revenue
            </Typography>
            <Typography variant="h4">
              ${metrics.totalRevenue.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Recent Activities</Typography>
                <Button color="primary">View All</Button>
              </Box>
              <List>
                {metrics.recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemText
                        primary={activity.description}
                        secondary={new Date(activity.timestamp).toLocaleString()}
                      />
                    </ListItem>
                    {index < metrics.recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
