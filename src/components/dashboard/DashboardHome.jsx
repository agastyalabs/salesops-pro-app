import { Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardHome() {
  const { currentUser } = useAuth();

  return (
    <>
      <Typography paragraph>
        Welcome {currentUser?.email}!
      </Typography>
      <Typography paragraph>
        This is your dashboard home page. You can view your key metrics and recent activities here.
      </Typography>
    </>
  );
}
