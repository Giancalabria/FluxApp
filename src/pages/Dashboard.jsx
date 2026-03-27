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
import { useFinancialProfile } from '../context/FinancialProfileContext';
import { formatCurrency, formatDate } from '../lib/formatters';
import { TRANSACTION_TYPES } from '../constants';
import { transactionDisplayAmount } from '../lib/transactionDisplay';

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

export default function Dashboard() {
  const navigate = useNavigate();
  const { activeProfile } = useFinancialProfile();
  const profileId = activeProfile?.id;
  const profileCcy = activeProfile?.preferred_currency_code ?? 'ARS';

  const { accounts, loading: accLoading } = useAccounts(profileId);
  const { transactions, loading: txLoading } = useTransactions({ financialProfileId: profileId });
  const { totalBalanceInProfileCurrency, monthTotalsInProfileCurrency, loading: rateLoading, error: rateError } =
    useExchangeRates();

  const loading = accLoading || txLoading;

  const balanceByCurrency = useMemo(() => {
    const map = {};
    accounts.forEach((a) => {
      const c = a.currency_code ?? a.currency;
      map[c] = (map[c] || 0) + Number(a.balance || 0);
    });
    return map;
  }, [accounts]);

  const totalProfile = useMemo(
    () => totalBalanceInProfileCurrency(accounts, profileCcy),
    [accounts, profileCcy, totalBalanceInProfileCurrency]
  );

  const monthProfile = useMemo(
    () => monthTotalsInProfileCurrency(transactions, profileCcy),
    [transactions, profileCcy, monthTotalsInProfileCurrency]
  );

  const recentTx = transactions.slice(0, 6);

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

      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Tooltip
            title={
              rateError
                ? rateError
                : `Balances in accounts are converted to ${profileCcy} using the blue dollar rate when needed (ARS ↔ USD family).`
            }
          >
            <Box component="span" sx={{ display: 'block' }}>
              <StatCard
                label={rateLoading ? `Total (${profileCcy}) …` : `Total balance (${profileCcy})`}
                value={rateLoading ? '…' : formatCurrency(totalProfile, profileCcy)}
                color="primary"
                icon={<AttachMoneyIcon />}
              />
            </Box>
          </Tooltip>
        </Grid>

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
          <StatCard
            label={`Income (month, ${profileCcy})`}
            value={formatCurrency(monthProfile.income, profileCcy)}
            color="success"
            icon={<TrendingUpIcon />}
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 4 }}>
          <StatCard
            label={`Expenses (month, ${profileCcy})`}
            value={formatCurrency(monthProfile.expense, profileCcy)}
            color="error"
            icon={<TrendingDownIcon />}
          />
        </Grid>
      </Grid>

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
              {recentTx.map((t) => {
                const { amount, currency } = transactionDisplayAmount(t, profileCcy);
                return (
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
                        {formatCurrency(amount, currency)}
                      </Typography>
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
