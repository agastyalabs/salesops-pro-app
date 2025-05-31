import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert
} from '@mui/material';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your inbox for further instructions');
    } catch (error) {
      setError('Failed to reset password: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%'
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Password Reset
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={loading}
          >
            Reset Password
          </Button>
        </form>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            <Link to="/signin">Back to Sign In</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
