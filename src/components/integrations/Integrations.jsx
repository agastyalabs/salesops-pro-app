import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  Switch,
  Breadcrumbs,
  Link,
  Divider,
  Alert,
  Stack,
  Chip
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

export default function Integrations() {
  const [integrations, setIntegrations] = useState([
    {
      id: 1,
      name: 'Salesforce',
      description: 'Sync customer data and interactions with Salesforce CRM',
      status: 'connected',
      lastSync: '2025-05-31 07:15:23',
      icon: '🔄'
    },
    {
      id: 2,
      name: 'HubSpot',
      description: 'Integrate marketing automation and lead tracking',
      status: 'disconnected',
      icon: '📊'
    },
    {
      id: 3,
      name: 'Stripe',
      description: 'Process payments and manage subscriptions',
      status: 'connected',
      lastSync: '2025-05-31 07:28:45',
      icon: '💳'
    },
    {
      id: 4,
      name: 'Slack',
      description: 'Get notifications and updates in your Slack channels',
      status: 'connected',
      lastSync: '2025-05-31 07:25:12',
      icon: '💬'
    }
  ]);

  const handleToggleIntegration = (id) => {
    setIntegrations(integrations.map(integration => {
      if (integration.id === id) {
        return {
          ...integration,
          status: integration.status === 'connected' ? 'disconnected' : 'connected',
          lastSync: integration.status === 'disconnected' ? new Date().toISOString() : integration.lastSync
        };
      }
      return integration;
    }));
  };

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
        <Typography color="text.primary">Integrations</Typography>
      </Breadcrumbs>

      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Integrations
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Connect your favorite tools and services to enhance your workflow
        </Typography>
      </Box>

      {/* Status Overview */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2">
            {integrations.filter(i => i.status === 'connected').length} of {integrations.length} integrations are active
          </Typography>
          <Chip 
            label="All Systems Operational" 
            color="success" 
            size="small"
            icon={<CheckCircleIcon />}
          />
        </Stack>
      </Alert>

      {/* Integrations Grid */}
      <Grid container spacing={3}>
        {integrations.map((integration) => (
          <Grid item xs={12} md={6} key={integration.id}>
            <Card variant="outlined">
              <CardHeader
                title={
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h6">
                      {integration.icon} {integration.name}
                    </Typography>
                    {integration.status === 'connected' ? (
                      <Chip 
                        label="Connected" 
                        color="success" 
                        size="small"
                        icon={<CheckCircleIcon />}
                      />
                    ) : (
                      <Chip 
                        label="Disconnected" 
                        color="default" 
                        size="small"
                        icon={<Pen
