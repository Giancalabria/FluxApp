import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    const { error: err } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (err) {
      setError(err.message);
    } else if (isSignUp) {
      // Account created — clear the form and switch to sign-in view
      setEmail('');
      setPassword('');
      setIsSignUp(false);
      setInfo('Account created! You can now sign in.');
    } else {
      navigate('/dashboard');
    }

    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight={800} color="primary" textAlign="center" gutterBottom>
            FluxApp
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {info && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {info}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                inputProps={{ minLength: 6 }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>
            </Stack>
          </form>

          <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Link
              component="button"
              variant="body2"
              onClick={() => {
                setIsSignUp((prev) => !prev);
                setError('');
                setInfo('');
              }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
