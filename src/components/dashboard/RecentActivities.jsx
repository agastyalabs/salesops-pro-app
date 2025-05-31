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
  Mail,
  Phone,
  Briefcase,
  FileText,
  Calendar,
  CheckSquare
} from 'lucide-react';

export default function RecentActivities({ activities }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'email':
        return <Mail size={20} strokeWidth={1.5} />;
      case 'call':
        return <Phone size={20} strokeWidth={1.5} />;
      case 'deal':
        return <Briefcase size={20} strokeWidth={1.5} />;
      case 'meeting_scheduled':
        return <Calendar size={20} strokeWidth={1.5} />;
      case 'task_completed':
        return <CheckSquare size={20} strokeWidth={1.5} />;
      default:
        return <FileText size={20} strokeWidth={1.5} />;
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
      case 'meeting_scheduled':
        return '#9c27b0';
      case 'task_completed':
        return '#00bcd4';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        bgcolor: 'background.paper',
        borderRadius: 2
      }}
      elevation={0}
    >
      <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Recent Activities
      </Typography>

      <List sx={{ py: 0 }}>
        {activities.map((activity, index) => (
          <ListItem
            key={activity.id}
            sx={{
              px: 2,
              py: 2,
              borderRadius: 1,
              mb: index !== activities.length - 1 ? 1 : 0,
              bgcolor: `${getActivityColor(activity.type)}08`,
              '&:hover': {
                bgcolor: `${getActivityColor(activity.type)}12`
              }
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
              secondary={activity.timestamp?.toDate().toLocaleString()}
              primaryTypographyProps={{
                variant: 'body2',
                color: 'text.primary',
                gutterBottom: true,
                fontWeight: 500
              }}
              secondaryTypographyProps={{
                variant: 'caption',
                color: 'text.secondary',
                sx: { display: 'flex', alignItems: 'center', gap: 0.5 }
              }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
