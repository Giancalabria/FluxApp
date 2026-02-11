import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton,
  Button,
  Tooltip,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownIcon from '@mui/icons-material/TrendingDownRounded';
import SwapHorizIcon from '@mui/icons-material/SwapHorizRounded';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardRounded';
import AttachMoneyIcon from '@mui/icons-material/AttachMoneyRounded';
import { useAccounts } from '../hooks/useAccounts';
import { useTransactions } from '../hooks/useTransactions';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { formatCurrency, formatDate } from '../lib/formatters';
import { TRANSACTION_TYPES } from '../constants';

// ─── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, color, icon }) {
  return (
    <Card>
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          py: { xs: 1.5, sm: 2 },
          px: { xs: 1.5, sm: 2 },
          '&:last-child': { pb: { xs: 1.5, sm: 2 } },
        }}
      >
        <Box
          sx={{
            width: { xs: 40, sm: 48 },
            height: { xs: 40, sm: 48 },
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}.main`,
            color: `${color}.contrastText`,
            opacity: 0.85,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" noWrap>
            {label}
          </Typography>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Transaction type icon helper ───────────────────────────────────────────
function txIcon(type) {
  if (type === TRANSACTION_TYPES.INCOME) return <TrendingUpIcon color="success" />;
  if (type === TRANSACTION_TYPES.EXPENSE) return <TrendingDownIcon color="error" />;
  return <SwapHorizIcon color="secondary" />;
}

function txColor(type) {
  if (type === TRANSACTION_TYPES.INCOME) return 'success.main';
  if (type === TRANSACTION_TYPES.EXPENSE) return 'error.main';
  return 'secondary.main';
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { accounts, loading: accLoading } = useAccounts();
  const { transactions, loading: txLoading } = useTransactions();
  const { totalBalanceUsd, monthTotalsUsd, usdArsRate, loading: rateLoading, error: rateError } = useExchangeRates();

  const loading = accLoading || txLoading;

  // Compute totals per currency
  const balanceByCurrency = useMemo(() => {
    const map = {};
    accounts.forEach((a) => {
      map[a.currency] = (map[a.currency] || 0) + Number(a.balance || 0);
    });
    return map;
  }, [accounts]);

  // Total balance in USD (ARS converted at dólar blue; USD, USDT, USDC = 1:1)
  const totalUsd = useMemo(() => totalBalanceUsd(accounts), [accounts, totalBalanceUsd]);

  // This month's income & expense in USD (normalized for comparison / inflation)
  const monthUsd = useMemo(() => monthTotalsUsd(transactions), [transactions, monthTotalsUsd]);

  const recentTx = transactions.slice(0, 6);

  // ─── Skeleton while loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Dashboard
        </Typography>
        <Grid container spacing={1.5}>
          {[1, 2, 3].map((i) => (
            <Grid size={{ xs: 12, sm: 4 }} key={i}>
              <Skeleton variant="rounded" height={80} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Dashboard
      </Typography>

      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {/* Total balance in USD (all currencies converted; ARS = dólar blue) */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Tooltip
            title={
              rateError
                ? rateError
                : usdArsRate != null
                  ? `1 USD ≈ ${Number(usdArsRate).toLocaleString('es-AR')} ARS (dólar blue). USD, USDT, USDC = 1:1.`
                  : 'Loading rate from DolarAPI (dólar blue)…'
            }
          >
            <Box component="span" sx={{ display: 'block' }}>
              <StatCard
                label={rateLoading ? 'Total (USD) …' : 'Total balance (USD)'}
                value={
                  rateLoading
                    ? '…'
                    : totalUsd != null
                      ? formatCurrency(totalUsd, 'USD')
                      : rateError
                        ? '—'
                        : '—'
                }
                color="primary"
                icon={<AttachMoneyIcon />}
              />
            </Box>
          </Tooltip>
        </Grid>

        {/* One card per currency balance */}
        {Object.entries(balanceByCurrency).map(([currency, total]) => (
          <Grid size={{ xs: 12, sm: 4 }} key={currency}>
            <StatCard
              label={`Balance (${currency})`}
              value={formatCurrency(total, currency)}
              color="primary"
              icon={<AccountBalanceWalletIcon />}
            />
          </Grid>
        ))}

        {/* If no accounts yet, show a placeholder card */}
        {Object.keys(balanceByCurrency).length === 0 && (
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              label="Total Balance"
              value="—"
              color="primary"
              icon={<AccountBalanceWalletIcon />}
            />
          </Grid>
        )}

        <Grid size={{ xs: 6, sm: 4 }}>
          <Tooltip title="Converted to USD (ARS at dólar blue). Lets you compare across currencies and inflation.">
            <Box component="span" sx={{ display: 'block' }}>
              <StatCard
                label="Income (month, USD)"
                value={formatCurrency(monthUsd.income, 'USD')}
                color="success"
                icon={<TrendingUpIcon />}
              />
            </Box>
          </Tooltip>
        </Grid>

        <Grid size={{ xs: 6, sm: 4 }}>
          <Tooltip title="Converted to USD (ARS at dólar blue). Lets you compare across currencies and inflation.">
            <Box component="span" sx={{ display: 'block' }}>
              <StatCard
                label="Expenses (month, USD)"
                value={formatCurrency(monthUsd.expense, 'USD')}
                color="error"
                icon={<TrendingDownIcon />}
              />
            </Box>
          </Tooltip>
        </Grid>
      </Grid>

      {/* ── Recent transactions ────────────────────────────────────────────── */}
      <Card>
        <CardContent sx={{ px: { xs: 1.5, sm: 2 }, py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: { xs: 0.5, sm: 0 } }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Recent Transactions
            </Typography>
            <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/transactions')}>
              See all
            </Button>
          </Box>

          {recentTx.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              No transactions yet. Start by adding one!
            </Typography>
          ) : (
            <List disablePadding>
              {recentTx.map((t) => (
                <ListItem key={t.id} divider sx={{ px: { xs: 0.5, sm: 0 }, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>{txIcon(t.type)}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={500} noWrap>
                        {t.description || t.type}
                      </Typography>
                    }
                    secondary={formatDate(t.date)}
                  />
                  <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 1 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ color: txColor(t.type) }} noWrap>
                      {t.type === TRANSACTION_TYPES.EXPENSE ? '− ' : '+ '}
                      {formatCurrency(t.amount, t.account?.currency)}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
