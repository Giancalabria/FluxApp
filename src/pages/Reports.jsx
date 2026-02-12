import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  LinearProgress,
  Chip,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessIcon from '@mui/icons-material/ExpandLessRounded';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownIcon from '@mui/icons-material/TrendingDownRounded';
import CompareArrowsIcon from '@mui/icons-material/CompareArrowsRounded';
import { useTransactions } from '../hooks/useTransactions';
import { useAccounts } from '../hooks/useAccounts';
import { formatCurrency, formatDate } from '../lib/formatters';
import { getPresetRange } from '../lib/dateRangePresets';
import DateRangeFilter from '../components/common/DateRangeFilter';
import { TRANSACTION_TYPES, EXPENSE_CLASS_OPTIONS } from '../constants';

const classColors = {
  fixed: 'warning',
  variable: 'info',
  essential: 'secondary',
};

function SummaryCard({ label, value, subtitle, color, icon }) {
  return (
    <Card sx={{ height: '100%' }}>
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
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: color ? `${color}.main` : 'action.hover',
            color: color ? `${color}.contrastText` : 'text.secondary',
            flexShrink: 0,
            opacity: 0.9,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            {label}
          </Typography>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            noWrap
            sx={color ? { color: `${color}.main` } : {}}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

function getClassification(t) {
  return t.category?.classification ?? t.classification;
}

export default function Reports() {
  const defaultRange = useMemo(() => getPresetRange('all_time') ?? { dateFrom: null, dateTo: null }, []);
  const [dateRange, setDateRange] = useState(defaultRange);
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);
  const filters = {
    ...(dateRange?.dateFrom && { dateFrom: dateRange.dateFrom }),
    ...(dateRange?.dateTo && { dateTo: dateRange.dateTo }),
    ...(selectedAccountIds.length > 0 && { accountIds: selectedAccountIds }),
  };
  const { transactions, loading } = useTransactions(filters);
  const { accounts } = useAccounts();

  const [expandedClass, setExpandedClass] = useState(null);

  const reportAccounts = useMemo(() => {
    if (selectedAccountIds.length === 0) return accounts;
    return accounts.filter((a) => selectedAccountIds.includes(a.id));
  }, [accounts, selectedAccountIds]);

  const netChangeByAccountId = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      const amount = Number(t.amount);
      const aid = t.account_id;
      const toId = t.to_account_id;
      if (!map[aid]) map[aid] = 0;
      if (t.type === TRANSACTION_TYPES.INCOME) map[aid] += amount;
      if (t.type === TRANSACTION_TYPES.EXPENSE) map[aid] -= amount;
      if (t.type === TRANSACTION_TYPES.TRANSFER) {
        map[aid] -= amount;
        if (toId) {
          if (!map[toId]) map[toId] = 0;
          map[toId] += amount;
        }
      }
    });
    return map;
  }, [transactions]);

  const initialBalanceByAccountId = useMemo(() => {
    const map = {};
    reportAccounts.forEach((a) => {
      const current = Number(a.balance ?? 0);
      const netChange = netChangeByAccountId[a.id] ?? 0;
      map[a.id] = current - netChange;
    });
    return map;
  }, [reportAccounts, netChangeByAccountId]);

  const initialBalanceTotal = useMemo(() => {
    return reportAccounts.reduce((sum, a) => sum + (initialBalanceByAccountId[a.id] ?? 0), 0);
  }, [reportAccounts, initialBalanceByAccountId]);

  const byAccount = useMemo(() => {
    const map = {};
    reportAccounts.forEach((a) => {
      map[a.id] = { account: a, income: 0, expense: 0 };
    });
    transactions.forEach((t) => {
      const amount = Number(t.amount);
      const aid = t.account_id;
      if (!map[aid]) return;
      if (t.type === TRANSACTION_TYPES.INCOME) map[aid].income += amount;
      if (t.type === TRANSACTION_TYPES.EXPENSE) map[aid].expense += amount;
    });
    return map;
  }, [transactions, reportAccounts]);

  const { totals, expensesByClassification } = useMemo(() => {
    let income = 0;
    let expense = 0;
    const byClassification = { fixed: 0, variable: 0, essential: 0, uncategorized: 0 };
    const byClassificationList = { fixed: [], variable: [], essential: [], uncategorized: [] };

    transactions.forEach((t) => {
      const amount = Number(t.amount);
      if (t.type === TRANSACTION_TYPES.INCOME) income += amount;
      if (t.type === TRANSACTION_TYPES.EXPENSE) {
        expense += amount;
        const classification = getClassification(t);
        const key = classification && byClassification[classification] !== undefined ? classification : 'uncategorized';
        byClassification[key] += amount;
        byClassificationList[key].push(t);
      }
    });

    const net = initialBalanceTotal + income - expense;

    return {
      totals: { income, expense, net, initialBalance: initialBalanceTotal, byClassification },
      expensesByClassification: byClassificationList,
    };
  }, [transactions, initialBalanceTotal]);

  const maxClassVal = Math.max(...Object.values(totals.byClassification), 1);

  const toggleExpanded = (key) => {
    setExpandedClass((prev) => (prev === key ? null : key));
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Reports
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center" flexWrap="wrap">
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        <TextField
          select
          SelectProps={{ multiple: true }}
          label="Accounts"
          value={selectedAccountIds}
          onChange={(e) => {
            const v = e.target.value;
            setSelectedAccountIds(Array.isArray(v) ? v : []);
          }}
          size="small"
          sx={{ minWidth: 200 }}
          renderValue={(ids) => {
            if (ids.length === 0) return 'All accounts';
            if (ids.length === 1) return accounts.find((a) => a.id === ids[0])?.name ?? ids[0];
            return `${ids.length} accounts`;
          }}
        >
          {accounts.map((a) => (
            <MenuItem key={a.id} value={a.id}>
              {a.name} ({a.currency_code ?? a.currency})
            </MenuItem>
          ))}
        </TextField>
        {selectedAccountIds.length > 0 && (
          <Chip label={`${selectedAccountIds.length} selected`} size="small" onDelete={() => setSelectedAccountIds([])} />
        )}
      </Stack>

      {loading ? (
        <LinearProgress />
      ) : (
        <>
          <Grid container spacing={1.5} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <SummaryCard
                label="Initial Balance"
                value={formatCurrency(totals.initialBalance)}
                subtitle="Start of period"
                icon={<AccountBalanceWalletIcon fontSize="small" />}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <SummaryCard
                label="Income"
                value={formatCurrency(totals.income)}
                color="success"
                icon={<TrendingUpIcon fontSize="small" />}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <SummaryCard
                label="Expenses"
                value={formatCurrency(totals.expense)}
                color="error"
                icon={<TrendingDownIcon fontSize="small" />}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <SummaryCard
                label="Net"
                value={formatCurrency(totals.net)}
                subtitle="Initial + Income − Expenses"
                color={totals.net >= 0 ? 'success' : 'error'}
                icon={<CompareArrowsIcon fontSize="small" />}
              />
            </Grid>
          </Grid>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                By account
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Income and expenses per account in the selected period.
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Account</TableCell>
                      <TableCell align="right">Income</TableCell>
                      <TableCell align="right">Expenses</TableCell>
                      <TableCell align="right">Net (period)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportAccounts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }} color="text.secondary">
                          No accounts to show. Create accounts or clear the account filter.
                        </TableCell>
                      </TableRow>
                    ) : reportAccounts.map((a) => {
                      const row = byAccount[a.id];
                      const income = row?.income ?? 0;
                      const expense = row?.expense ?? 0;
                      const netPeriod = income - expense;
                      const currency = a.currency_code ?? a.currency;
                      return (
                        <TableRow key={a.id}>
                          <TableCell>{a.name}</TableCell>
                          <TableCell align="right" sx={{ color: 'success.main' }}>
                            {formatCurrency(income, currency)}
                          </TableCell>
                          <TableCell align="right" sx={{ color: 'error.main' }}>
                            −{formatCurrency(expense, currency)}
                          </TableCell>
                          <TableCell align="right" sx={{ color: netPeriod >= 0 ? 'success.main' : 'error.main' }}>
                            {formatCurrency(netPeriod, currency)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {reportAccounts.length > 0 && (
                    <TableRow sx={{ fontWeight: 700, bgcolor: 'action.hover' }}>
                      <TableCell>Total</TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>
                        {formatCurrency(totals.income)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        −{formatCurrency(totals.expense)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: totals.net - totals.initialBalance >= 0 ? 'success.main' : 'error.main' }}>
                        {formatCurrency(totals.income - totals.expense)}
                      </TableCell>
                    </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Expense Breakdown
              </Typography>

              {totals.expense === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  No expenses in this period.
                </Typography>
              ) : (
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                  {EXPENSE_CLASS_OPTIONS.map((opt) => {
                    const amount = totals.byClassification[opt.value] || 0;
                    const pct = totals.expense > 0 ? (amount / totals.expense) * 100 : 0;
                    const list = expensesByClassification[opt.value] || [];
                    const isExpanded = expandedClass === opt.value;

                    return (
                      <Box key={opt.value}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 0.5,
                            mb: 0.5,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => toggleExpanded(opt.value)}
                              disabled={list.length === 0}
                              aria-expanded={isExpanded}
                              sx={{ p: 0.25 }}
                            >
                              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                            <Chip label={opt.label} size="small" color={classColors[opt.value] || 'default'} />
                          </Box>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {formatCurrency(amount)} ({pct.toFixed(0)}%)
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          {opt.description}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(amount / maxClassVal) * 100}
                          color={classColors[opt.value] || 'primary'}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Collapse in={isExpanded}>
                          <List dense disablePadding sx={{ mt: 1, bgcolor: 'action.hover', borderRadius: 1, py: 0 }}>
                            {list.map((t) => (
                              <ListItem key={t.id} divider sx={{ py: 0.75 }}>
                                <ListItemText
                                  primary={t.description || t.category?.name || 'Expense'}
                                  secondary={formatDate(t.date)}
                                  primaryTypographyProps={{ variant: 'body2' }}
                                  secondaryTypographyProps={{ variant: 'caption' }}
                                />
                                <Typography variant="body2" fontWeight={600} color="error.main">
                                  −{formatCurrency(t.amount, t.account?.currency_code ?? t.account?.currency)}
                                </Typography>
                              </ListItem>
                            ))}
                          </List>
                        </Collapse>
                      </Box>
                    );
                  })}

                  {totals.byClassification.uncategorized > 0 && (() => {
                    const list = expensesByClassification.uncategorized || [];
                    const isExpanded = expandedClass === 'uncategorized';
                    return (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => toggleExpanded('uncategorized')}
                              aria-expanded={isExpanded}
                              sx={{ p: 0.25 }}
                            >
                              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                            <Chip label="Uncategorized" size="small" />
                          </Box>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {formatCurrency(totals.byClassification.uncategorized)} (
                            {((totals.byClassification.uncategorized / totals.expense) * 100).toFixed(0)}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(totals.byClassification.uncategorized / maxClassVal) * 100}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Collapse in={isExpanded}>
                          <List dense disablePadding sx={{ mt: 1, bgcolor: 'action.hover', borderRadius: 1, py: 0 }}>
                            {list.map((t) => (
                              <ListItem key={t.id} divider sx={{ py: 0.75 }}>
                                <ListItemText
                                  primary={t.description || t.category?.name || 'Expense'}
                                  secondary={formatDate(t.date)}
                                  primaryTypographyProps={{ variant: 'body2' }}
                                  secondaryTypographyProps={{ variant: 'caption' }}
                                />
                                <Typography variant="body2" fontWeight={600} color="error.main">
                                  −{formatCurrency(t.amount, t.account?.currency_code ?? t.account?.currency)}
                                </Typography>
                              </ListItem>
                            ))}
                          </List>
                        </Collapse>
                      </Box>
                    );
                  })()}
                </Stack>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
