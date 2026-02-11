import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffRounded';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';

export default function Settings() {
  const { user, updateEmail, updatePassword } = useAuth();
  const { profile, loading: profileLoading, updateUsername } = useProfile(user?.id);

  const [username, setUsername] = useState('');
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState(false);

  const [email, setEmail] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (profile?.username != null && username === '') setUsername(profile.username);
  }, [profile?.username]);

  useEffect(() => {
    if (user?.email != null && email === '') setEmail(user.email);
  }, [user?.email]);

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setUsernameError('');
    setUsernameSuccess(false);
    const value = username.trim();
    if (!value) return;
    setUsernameSaving(true);
    const { error } = await updateUsername(value);
    setUsernameSaving(false);
    if (error) setUsernameError(error.message || 'Failed to update username');
    else setUsernameSuccess(true);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess(false);
    const value = email.trim();
    if (!value || value === user?.email) return;
    setEmailSaving(true);
    const { error } = await updateEmail(value);
    setEmailSaving(false);
    if (error) setEmailError(error.message || 'Failed to update email');
    else setEmailSuccess(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    if (!password || password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    setPasswordSaving(true);
    const { error } = await updatePassword(password);
    setPasswordSaving(false);
    if (error) setPasswordError(error.message || 'Failed to update password');
    else {
      setPasswordSuccess(true);
      setPassword('');
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Settings
      </Typography>

      {/* Username */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Username
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Used as your display name (e.g. in Split activities). Letters, numbers, underscore and hyphen only; 2–32 characters.
          </Typography>
          {profileLoading ? (
            <CircularProgress size={24} />
          ) : (
            <form onSubmit={handleUsernameSubmit}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                <TextField
                  size="small"
                  value={username || profile?.username || ''}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={profile?.username || 'username'}
                  slotProps={{
                    htmlInput: {
                      minLength: 2,
                      maxLength: 32,
                      pattern: '[a-zA-Z0-9_-]+',
                    },
                  }}
                  sx={{ minWidth: 200 }}
                  error={!!usernameError}
                  helperText={usernameError}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={usernameSaving || !username.trim() || username === profile?.username}
                >
                  {usernameSaving ? <CircularProgress size={24} /> : 'Save'}
                </Button>
              </Stack>
              {usernameSuccess && <Alert severity="success" sx={{ mt: 1 }}>Username updated.</Alert>}
            </form>
          )}
        </CardContent>
      </Card>

      {/* Email */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Email
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Your login email. Changing it may require a new confirmation.
          </Typography>
          <form onSubmit={handleEmailSubmit}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
              <TextField
                size="small"
                type="email"
                value={email || user?.email || ''}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={user?.email || 'email@example.com'}
                sx={{ minWidth: 260 }}
                error={!!emailError}
                helperText={emailError}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={emailSaving || !email.trim() || email === user?.email}
              >
                {emailSaving ? <CircularProgress size={24} /> : 'Save'}
              </Button>
            </Stack>
            {emailSuccess && <Alert severity="success" sx={{ mt: 1 }}>Email updated. Check your inbox to confirm.</Alert>}
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Set a new password (at least 6 characters).
          </Typography>
          <form onSubmit={handlePasswordSubmit}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
              <TextField
                size="small"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                slotProps={{
                  htmlInput: { minLength: 6 },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((p) => !p)}
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
                sx={{ minWidth: 200 }}
                error={!!passwordError}
                helperText={passwordError}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={passwordSaving || !password}
              >
                {passwordSaving ? <CircularProgress size={24} /> : 'Update password'}
              </Button>
            </Stack>
            {passwordSuccess && <Alert severity="success" sx={{ mt: 1 }}>Password updated.</Alert>}
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
