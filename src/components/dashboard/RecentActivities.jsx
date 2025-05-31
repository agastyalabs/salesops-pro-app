import React from 'react';
import { 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar,
  Box 
} from '@mui/material';
import { 
  Mail as MailIcon,
  Phone as PhoneIcon,
  BusinessCenter as BusinessCenterIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

export default function RecentActivities({ activities }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'email':
        return <MailIcon />;
      case 'call':
        return <PhoneIcon />;
      case 'deal':
        return <BusinessCenterIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'email':
        return '#2196f3';
      case 'call':
        return '#4caf50';
      case 'deal':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        bgcolor: 'background.paper'
      }}
      elevation={0}
    >
      <Typography variant="h6" gutterBottom>
        Recent Activities
      </Typography>

      <List sx={{ py: 0 }}>
        {activities.map((activity, index) => (
          <ListItem
            key={activity.id}
            sx={{
              px: 0,
              py: 2,
              borderBottom: index !== activities.length - 1 ? 1 : 0,
              borderColor: 'divider'
            }}
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor: `${getActivityColor(activity.type)}20`,
                  color: getActivityColor(activity.type)
                }}
              >
                {getActivityIcon(activity.type)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={activity.description}
              secondary={new Date(activity.timestamp?.toDate()).toLocaleString()}
              primaryTypographyProps={{
                variant: 'body2',
                color: 'text.primary',
                gutterBottom: true
              }}
              secondaryTypographyProps={{
                variant: 'caption',
                color: 'text.secondary'
              }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
