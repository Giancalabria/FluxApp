import { useState, useEffect } from 'react';
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
  IconButton,
  InputAdornment,
  Collapse,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffRounded';
import { useAuth } from '../context/AuthContext';

/** True when the app is already opened as installed PWA (no browser UI). */
function isStandalone() {
  if (typeof window === 'undefined') return true;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [showInstallHint, setShowInstallHint] = useState(false);

  useEffect(() => {
    const hideHint = sessionStorage.getItem('fluxapp-hide-install-hint');
    setShowInstallHint(!isStandalone() && !hideHint);
  }, []);

  const dismissInstallHint = () => {
    setShowInstallHint(false);
    sessionStorage.setItem('fluxapp-hide-install-hint', '1');
  };

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

          <Collapse in={showInstallHint}>
            <Alert
              severity="info"
              onClose={dismissInstallHint}
              sx={{ mb: 2 }}
              slotProps={{
                closeButton: { 'aria-label': 'Dismiss' },
              }}
            >
              <Typography variant="body2" component="span">
                <strong>Use without the browser bar:</strong> Tap Chrome&apos;s menu (⋮) at the top right → &quot;Add to Home screen&quot; or &quot;Install app&quot;. Then open FluxApp from your home screen.
              </Typography>
            </Alert>
          </Collapse>

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
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                inputProps={{ minLength: 6 }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          size="small"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
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
