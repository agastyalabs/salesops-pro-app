import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardHeader,
  Breadcrumbs,
  Link,
  Stack
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export default function Reports() {
  const [timeRange, setTimeRange] = useState('month');

  const metrics = [
    {
      title: 'Total Revenue',
      value: '$524,500',
      change: '+12.5%',
      trend: 'up'
    },
    {
      title: 'New Customers',
      value: '245',
      change: '+8.2%',
      trend: 'up'
    },
    {
      title: 'Average Deal Size',
      value: '$2,140',
      change: '-3.1%',
      trend: 'down'
    },
    {
      title: 'Conversion Rate',
      value: '24.8%',
      change: '+5.3%',
      trend: 'up'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link color="inherit" href="/dashboard">
          Dashboard
        </Link>
        <Typography color="text.primary">Reports</Typography>
      </Breadcrumbs>

      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Reports & Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor your key performance indicators and business metrics
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="day">Last 24 Hours</MenuItem>
            <MenuItem value="week">Last 7 Days</MenuItem>
            <MenuItem value="month">Last 30 Days</MenuItem>
            <MenuItem value="quarter">Last Quarter</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Metrics Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.title}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {metric.title}
              </Typography>
              <Typography variant="h4" component="div" gutterBottom>
                {metric.value}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                {metric.trend === 'up' ? (
                  <TrendingUpIcon color="success" />
                ) : (
                  <TrendingDownIcon color="error" />
                )}
                <Typography
                  variant="body2"
                  color={metric.trend === 'up' ? 'success.main' : 'error.main'}
                >
                  {metric.change}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Detailed Reports */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader 
              title="Revenue Trend" 
              subheader="Monthly revenue performance"
            />
            <CardContent>
              {/* Add Chart Component Here */}
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                  Chart Component Placeholder
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              title="Top Customers" 
              subheader="By revenue"
            />
            <CardContent>
              {/* Add Customer List Component Here */}
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                  Customer List Placeholder
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
