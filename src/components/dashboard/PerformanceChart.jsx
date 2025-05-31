import React, { useState } from 'react';
import { Paper, Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function PerformanceChart({ data }) {
  const [timeframe, setTimeframe] = useState('week');

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Leads',
        data: data.leads,
        borderColor: '#2196f3',
        backgroundColor: '#2196f320',
        tension: 0.4
      },
      {
        label: 'Conversions',
        data: data.conversions,
        borderColor: '#4caf50',
        backgroundColor: '#4caf5020',
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        minHeight: 400,
        bgcolor: 'background.paper'
      }}
      elevation={0}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">
          Performance Overview
        </Typography>
        <ToggleButtonGroup
          size="small"
          value={timeframe}
          exclusive
          onChange={(e, value) => value && setTimeframe(value)}
        >
          <ToggleButton value="week">Week</ToggleButton>
          <ToggleButton value="month">Month</ToggleButton>
          <ToggleButton value="year">Year</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ height: 300 }}>
        <Line data={chartData} options={options} />
      </Box>
    </Paper>
  );
}
