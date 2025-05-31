import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function DashboardMetrics({ metrics }) {
  const getPercentageChange = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getColorForChange = (change) => {
    if (change > 0) return 'success.main';
    if (change < 0) return 'error.main';
    return 'text.secondary';
  };

  const formatValue = (value, type) => {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  return (
    <Grid container spacing={3}>
      {metrics.map((metric) => (
        <Grid item xs={12} sm={6} md={3} key={metric.id}>
          <Paper 
            sx={{ 
              p: 3,
              height: '100%',
              '&:hover': {
                transform: 'translateY(-4px)',
                transition: 'transform 0.2s ease-in-out'
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography color="text.secondary" variant="subtitle2">
                  {metric.label}
                </Typography>
                <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                  {formatValue(metric.value, metric.format)}
                </Typography>
              </Box>
              {metric.icon}
            </Box>

            {metric.previousValue && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getPercentageChange(metric.value, metric.previousValue) > 0 ? (
                  <TrendingUp size={16} color="success" />
                ) : (
                  <TrendingDown size={16} color="error" />
                )}
                <Typography
                  variant="body2"
                  sx={{ 
                    color: getColorForChange(
                      getPercentageChange(metric.value, metric.previousValue)
                    )
                  }}
                >
                  {Math.abs(getPercentageChange(metric.value, metric.previousValue)).toFixed(1)}%
                  {' from last period'}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
