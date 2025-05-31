import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';

export default function LandingPage() {
  const features = [
    {
      icon: <AutoGraphIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Advanced Analytics',
      description: 'Gain valuable insights with our powerful analytics tools and interactive dashboards.'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Secure Platform',
      description: 'Enterprise-grade security ensuring your data is protected at all times.'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'High Performance',
      description: 'Lightning-fast performance with real-time updates and seamless integration.'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'background.default',
          pt: 12,
          pb: 6
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                component="h1"
                variant="h2"
                color="text.primary"
                gutterBottom
                sx={{ fontWeight: 800 }}
              >
                Transform Your Sales Operations
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                paragraph
                sx={{ mb: 4 }}
              >
                Streamline your sales process, boost productivity, and drive revenue growth with our comprehensive SalesOps Pro platform.
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    component={RouterLink}
                    to="/signup"
                    variant="contained"
                    size="large"
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Get Started
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    component={RouterLink}
                    to="/signin"
                    variant="outlined"
                    size="large"
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Sign In
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              {/* You can add an illustration or image here */}
              <Box
                sx={{
                  height: 400,
                  bgcolor: 'primary.light',
                  borderRadius: 4,
                  opacity: 0.1
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }} maxWidth="lg">
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 4,
                }}
                elevation={0}
              >
                {feature.icon}
                <Typography variant="h5" component="h2" sx={{ mt: 2, mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
