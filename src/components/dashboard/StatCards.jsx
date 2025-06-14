import React from 'react';
import { Grid, Paper, Box, Typography } from '@mui/material';
import { 
  Users,
  Briefcase,
  TrendingUp,
  DollarSign 
} from 'lucide-react';

export default function StatCards({ stats }) {
  const cards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: <Users size={24} strokeWidth={1.5} />,
      color: '#2196f3',
      trend: '+12%'
    },
    {
      title: 'Active Deals',
      value: stats.activeDeals,
      icon: <Briefcase size={24} strokeWidth={1.5} />,
      color: '#4caf50',
      trend: '+5%'
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      icon: <TrendingUp size={24} strokeWidth={1.5} />,
      color: '#ff9800',
      trend: '+2.5%'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: <DollarSign size={24} strokeWidth={1.5} />,
      color: '#9c27b0',
      trend: '+8%'
    }
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: `${card.color}10`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3
              }
            }}
            elevation={0}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box 
                sx={{ 
                  p: 1, 
                  borderRadius: 2, 
                  bgcolor: `${card.color}20`,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {card.icon}
              </Box>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                {card.trend}
                <TrendingUp size={16} strokeWidth={1.5} />
              </Typography>
            </Box>

            <Typography variant="h4" sx={{ mb: 1, color: card.color, fontWeight: 600 }}>
              {card.value}
            </Typography>

            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              {card.title}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
