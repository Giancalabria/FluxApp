import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { financialProfileService } from '../services/financialProfileService';
import { categoryService } from '../services/categoryService';
import { useFinancialProfile } from '../context/FinancialProfileContext';
import { PAY_FREQUENCY_OPTIONS, FINANCIAL_GOAL_OPTIONS } from '../constants';
import { useCurrencies } from '../hooks/useCurrencies';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refetchProfiles, setActiveProfileId } = useFinancialProfile();
  const { currencies } = useCurrencies();

  const [name, setName] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState('ARS');
  const [salary, setSalary] = useState('');
  const [payFrequency, setPayFrequency] = useState('monthly');
  const [goal, setGoal] = useState('spend_less');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!user?.id) {
      setError('You must be signed in.');
      return;
    }
    const n = name.trim();
    if (!n) {
      setError('Enter a profile name.');
      return;
    }
    const salaryNum = parseFloat(salary);
    if (!Number.isFinite(salaryNum) || salaryNum < 0) {
      setError('Enter a valid salary amount.');
      return;
    }

    setSaving(true);
    const now = new Date().toISOString();
    const { data: profile, error: pErr } = await financialProfileService.create({
      user_id: user.id,
      name: n,
      preferred_currency_code: preferredCurrency,
      salary_amount: salaryNum,
      pay_frequency: payFrequency,
      financial_goal: goal,
      onboarding_completed_at: now,
    });

    if (pErr || !profile) {
      setSaving(false);
      setError(pErr?.message || 'Could not create profile.');
      return;
    }

    const { error: cErr } = await categoryService.seedDefaultsForProfile(user.id, profile.id);
    if (cErr) {
      setSaving(false);
      setError(cErr.message || 'Profile created but categories failed to seed.');
      return;
    }

    await refetchProfiles();
    setActiveProfileId(profile.id);
    setSaving(false);
    navigate('/dashboard', { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ maxWidth: 480, width: 1 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Set up your workspace
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Each workspace has one currency forever. To track in another currency, create another workspace later in
            Settings.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Workspace name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                placeholder="e.g. Personal, Argentina"
              />

              <TextField
                label="Preferred currency (cannot change later)"
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                select
                required
                fullWidth
              >
                {currencies.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.symbol} — {c.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Salary"
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                required
                fullWidth
                slotProps={{ htmlInput: { step: '0.01', min: 0 } }}
              />

              <TextField
                label="How often are you paid?"
                value={payFrequency}
                onChange={(e) => setPayFrequency(e.target.value)}
                select
                fullWidth
              >
                {PAY_FREQUENCY_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Your objective"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                select
                fullWidth
              >
                {FINANCIAL_GOAL_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>

              <Button type="submit" variant="contained" size="large" disabled={saving} sx={{ mt: 1 }}>
                {saving ? <CircularProgress size={24} color="inherit" /> : 'Continue'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
