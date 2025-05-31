import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

export default function SubscriptionPlans() {
  const { plans, subscription, updateSubscription } = useSubscription();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    setOpenDialog(true);
  };

  const handleConfirmChange = async () => {
    try {
      await updateSubscription(selectedPlan);
      setOpenDialog(false);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Subscription Plans
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Choose the plan that best fits your needs
      </Typography>

      <Grid container spacing={3}>
        {Object.entries(plans).map(([planId, plan]) => (
          <Grid item xs={12} md={4} key={planId}>
            <Card 
              variant="outlined"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                ...(subscription?.plan.toUpperCase() === planId && {
                  border: '2px solid',
                  borderColor: 'primary.main',
                }),
              }}
            >
              <CardHeader
                title={plan.name}
                subheader={
                  <Typography variant="h4" color="primary" gutterBottom>
                    ${plan.price}
                    <Typography variant="caption" color="text.secondary">
                      /month
                    </Typography>
                  </Typography>
                }
                action={
                  subscription?.plan.toUpperCase() === planId && (
                    <Chip
                      label="Current Plan"
                      color="primary"
                      size="small"
                    />
                  )
                }
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <List>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  variant={subscription?.plan.toUpperCase() === planId ? "outlined" : "contained"}
                  fullWidth
                  disabled={subscription?.plan.toUpperCase() === planId}
                  onClick={() => handlePlanSelect(planId)}
                >
                  {subscription?.plan.toUpperCase() === planId ? "Current Plan" : "Select Plan"}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Subscription Change</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to change your subscription to the {selectedPlan} plan?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmChange} variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
