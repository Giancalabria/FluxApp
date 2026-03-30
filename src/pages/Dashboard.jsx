import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  MenuItem,
  TextField,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useFinancialProfile } from '../context/FinancialProfileContext';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useAccounts } from '../hooks/useAccounts';
import { useProfile } from '../hooks/useProfile';
import { useUserCurrencies } from '../hooks/useUserCurrencies';
import { useCurrencies } from '../hooks/useCurrencies';
import { CHART_PALETTE } from '../constants';
import { formatCurrency } from '../lib/formatters';

function getWeekRange(offset = 0) {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return {
    from: monday.toISOString().slice(0, 10),
    to: sunday.toISOString().slice(0, 10),
    label: `${monday.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} – ${sunday.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}`,
  };
}

function getMonthRange(offset = 0) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return {
    from: first.toISOString().slice(0, 10),
    to: last.toISOString().slice(0, 10),
    label: first.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }),
  };
}

const CUSTOM_TOOLTIP = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 2 }}>
        <Typography variant="body2" fontWeight={600}>{payload[0].name}</Typography>
        <Typography variant="body2" color="text.secondary">{payload[0].value?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</Typography>
      </Box>
    );
  }
  return null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeProfile } = useFinancialProfile();
  const profileId = activeProfile?.id;
  const { profile } = useProfile(user?.id);
  const username = profile?.username || user?.email?.split('@')[0] || 'usuario';

  const { currencies: userCurrencies, loading: ucLoading, addCurrency } = useUserCurrencies(user?.id);
  const { currencies: allCurrencies } = useCurrencies();

  const [activeCurrencyIdx, setActiveCurrencyIdx] = useState(0);
  const [periodMode, setPeriodMode] = useState('month'); // 'week' | 'month'
  const [periodOffset, setPeriodOffset] = useState(0);
  const [addCurrencyOpen, setAddCurrencyOpen] = useState(false);
  const [newCurrency, setNewCurrency] = useState('');
  const [addingCurrency, setAddingCurrency] = useState(false);

  const activeCurrency = userCurrencies[activeCurrencyIdx]?.currency_code ?? null;

  const range = useMemo(
    () => (periodMode === 'week' ? getWeekRange(periodOffset) : getMonthRange(periodOffset)),
    [periodMode, periodOffset]
  );

  const { transactions, loading: txLoading } = useTransactions({
    financialProfileId: profileId,
    currencyCode: activeCurrency || undefined,
    dateFrom: range.from,
    dateTo: range.to,
  });

  const { categories } = useCategories(profileId);
  const { accounts } = useAccounts(profileId);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a.name])), [accounts]);

  const totalSpent = useMemo(
    () => transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0),
    [transactions]
  );

  const byCategory = useMemo(() => {
    const map = new Map();
    transactions.forEach((t) => {
      const name = t.category?.name ?? categoryMap.get(t.category_id) ?? 'Sin categoría';
      map.set(name, (map.get(name) ?? 0) + Number(t.amount || 0));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions, categoryMap]);

  const byAccount = useMemo(() => {
    const map = new Map();
    transactions.forEach((t) => {
      const name = t.account?.name ?? accountMap.get(t.account_id) ?? 'Sin cuenta';
      map.set(name, (map.get(name) ?? 0) + Number(t.amount || 0));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions, accountMap]);

  const availableToAdd = allCurrencies.filter(
    (c) => !userCurrencies.some((uc) => uc.currency_code === c.code)
  );

  const handleAddCurrency = async () => {
    if (!newCurrency) return;
    setAddingCurrency(true);
    await addCurrency(newCurrency);
    setAddingCurrency(false);
    setAddCurrencyOpen(false);
    setNewCurrency('');
    setActiveCurrencyIdx(userCurrencies.length);
  };

  const loading = ucLoading || txLoading;

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', px: 2.5, pt: 'max(env(safe-area-inset-top, 0px), 16px)', pb: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: 'primary.contrastText' }}>
              FluxApp
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(242,239,233,0.75)', mt: 0.25 }}>
              Hola, {username} 👋
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        {/* Currency tabs + Total Spent Card (attached) */}
        <Box sx={{ mt: 1.5 }}>
          {ucLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={20} /></Box>
          ) : (
            <Stack
              direction="row"
              spacing={1}
              sx={{
                overflowX: 'auto',
                px: 0.5,
                py: 0.75,
                bgcolor: 'transparent',
                mb: -1, // overlap card like attached tabs
                ml: -1,
              }}
            >
              {userCurrencies.map((uc, idx) => (
                <Chip
                  key={uc.currency_code}
                  label={uc.currency_code}
                  onClick={() => setActiveCurrencyIdx(idx)}
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    height: 34,
                    borderRadius: 2,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    border: '1px solid',
                    borderColor: idx === activeCurrencyIdx ? 'primary.main' : 'divider',
                    bgcolor: idx === activeCurrencyIdx ? 'primary.main' : 'background.paper',
                    color: idx === activeCurrencyIdx ? 'primary.contrastText' : 'text.primary',
                    boxShadow: idx === activeCurrencyIdx ? '0 6px 18px rgba(44,95,45,0.18)' : 'none',
                    zIndex: idx === activeCurrencyIdx ? 2 : 0,
                    '& .MuiChip-label': { px: 1.25 },
                    '&:hover': {
                      bgcolor: idx === activeCurrencyIdx ? 'primary.dark' : 'action.hover',
                    },
                  }}
                />
              ))}
              <Chip
                icon={<AddRoundedIcon fontSize="small" />}
                label="Moneda"
                variant="outlined"
                onClick={() => setAddCurrencyOpen(true)}
                sx={{
                  fontWeight: 700,
                  height: 34,
                  borderRadius: 2,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  color: 'text.secondary',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  '& .MuiChip-label': { px: 1.1 },
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              />
            </Stack>
          )}

          <Card
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderRadius: 2,
              borderTopLeftRadius: 2,
              borderTopRightRadius: 2,
              border: 'none',
              boxShadow: '0 4px 20px rgba(44,95,45,0.25)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
            <Typography variant="caption" sx={{ color: 'rgba(242,239,233,0.7)', textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Total gastado
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', height: 60 }}><CircularProgress size={32} sx={{ color: 'primary.light' }} /></Box>
            ) : (
              <Typography variant="h3" fontWeight={800} sx={{ mt: 0.5, mb: 2, color: '#F2EFE9' }}>
                {activeCurrency ? formatCurrency(totalSpent, activeCurrency) : '—'}
              </Typography>
            )}
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/expenses')}
                sx={{
                  flex: 1,
                  color: '#F2EFE9',
                  borderColor: 'rgba(242,239,233,0.5)',
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'rgba(242,239,233,0.1)', borderColor: '#F2EFE9' },
                }}
              >
                Ir a mis Gastos
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddCircleOutlineRoundedIcon />}
                onClick={() => navigate('/add')}
                sx={{
                  bgcolor: '#97BC62',
                  color: '#1A3D1B',
                  borderRadius: 2,
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#A8C877' },
                }}
              >
                Agregar
              </Button>
            </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Date period filter */}
        <Card sx={{ mt: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={0.5}>
                {['week', 'month'].map((m) => (
                  <Chip
                    key={m}
                    label={m === 'week' ? 'Semana' : 'Mes'}
                    size="small"
                    onClick={() => { setPeriodMode(m); setPeriodOffset(0); }}
                    sx={{
                      fontWeight: 600,
                      bgcolor: periodMode === m ? 'primary.main' : 'transparent',
                      color: periodMode === m ? 'primary.contrastText' : 'text.secondary',
                      border: '1px solid',
                      borderColor: periodMode === m ? 'primary.main' : 'divider',
                    }}
                  />
                ))}
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <IconButton size="small" onClick={() => setPeriodOffset((p) => p - 1)}>
                  <ArrowBackIosNewRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </IconButton>
                <Typography variant="body2" fontWeight={600} sx={{ minWidth: 120, textAlign: 'center', color: 'text.primary' }}>
                  {range.label}
                </Typography>
                <IconButton size="small" onClick={() => setPeriodOffset((p) => p + 1)} disabled={periodOffset >= 0}>
                  <ArrowForwardIosRoundedIcon fontSize="small" sx={{ color: periodOffset >= 0 ? 'action.disabled' : 'text.secondary' }} />
                </IconButton>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Charts */}
        {!loading && transactions.length === 0 && (
          <Card sx={{ mt: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Sin gastos en este período
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                {activeCurrency ? `Moneda: ${activeCurrency}` : 'Seleccioná una moneda'}
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddCircleOutlineRoundedIcon />}
                onClick={() => navigate('/add')}
                sx={{ mt: 2, borderRadius: 2 }}
              >
                Cargar gasto
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && byCategory.length > 0 && (
          <Card sx={{ mt: 2 }}>
            <CardContent sx={{ pb: '16px !important' }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Gastos por categoría
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {byCategory.map((_, i) => (
                      <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {!loading && byAccount.length > 0 && (
          <Card sx={{ mt: 2, mb: 2 }}>
            <CardContent sx={{ pb: '16px !important' }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Gastos por cuenta
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={byAccount} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {byAccount.map((_, i) => (
                      <Cell key={i} fill={CHART_PALETTE[(i + 3) % CHART_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CUSTOM_TOOLTIP />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Add currency dialog */}
      <Dialog open={addCurrencyOpen} onClose={() => setAddCurrencyOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Agregar moneda</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            select
            label="Moneda"
            value={newCurrency}
            onChange={(e) => setNewCurrency(e.target.value)}
            fullWidth
            sx={{ mt: 1 }}
          >
            {availableToAdd.map((c) => (
              <MenuItem key={c.code} value={c.code}>
                {c.symbol} — {c.name} ({c.code})
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            fullWidth
            onClick={handleAddCurrency}
            disabled={!newCurrency || addingCurrency}
            sx={{ mt: 2, borderRadius: 2 }}
          >
            {addingCurrency ? <CircularProgress size={22} color="inherit" /> : 'Agregar'}
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
