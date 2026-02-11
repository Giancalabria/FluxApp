import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  LinearProgress,
  Chip,
} from '@mui/material';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency } from '../lib/formatters';
import { TRANSACTION_TYPES, EXPENSE_CLASS_OPTIONS } from '../constants';

const classColors = {
  fixed: 'warning',
  variable: 'info',
  essential: 'secondary',
};

export default function Reports() {
  const { transactions, loading } = useTransactions();

  // Period filter (current month by default)
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const defaultTo = now.toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(defaultFrom);
  const [dateTo, setDateTo] = useState(defaultTo);

  // Filter transactions in date range
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (dateFrom && t.date < dateFrom) return false;
      if (dateTo && t.date > dateTo) return false;
      return true;
    });
  }, [transactions, dateFrom, dateTo]);

  // Totals
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    const byClassification = { fixed: 0, variable: 0, essential: 0, uncategorized: 0 };

    filtered.forEach((t) => {
      const amount = Number(t.amount);
      if (t.type === TRANSACTION_TYPES.INCOME) income += amount;
      if (t.type === TRANSACTION_TYPES.EXPENSE) {
        expense += amount;
        if (t.classification && byClassification[t.classification] !== undefined) {
          byClassification[t.classification] += amount;
        } else {
          byClassification.uncategorized += amount;
        }
      }
    });

    return { income, expense, net: income - expense, byClassification };
  }, [filtered]);

  const maxClassVal = Math.max(...Object.values(totals.byClassification), 1);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Reports
      </Typography>

      {/* Date range picker — stacked on mobile */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }}>
        <TextField
          label="From"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          size="small"
          fullWidth
        />
        <TextField
          label="To"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          size="small"
          fullWidth
        />
      </Stack>

      {loading ? (
        <LinearProgress />
      ) : (
        <>
          {/* Summary cards — single column on xs, 3-up on sm+ */}
          <Grid container spacing={1.5} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card>
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="caption" color="text.secondary">
                    Income
                  </Typography>
                  <Typography variant="h6" color="success.main" fontWeight={700} noWrap>
                    {formatCurrency(totals.income)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Card>
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="caption" color="text.secondary">
                    Expenses
                  </Typography>
                  <Typography variant="h6" color="error.main" fontWeight={700} noWrap>
                    {formatCurrency(totals.expense)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Card>
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="caption" color="text.secondary">
                    Net
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    noWrap
                    color={totals.net >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatCurrency(totals.net)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Expense breakdown by classification */}
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

                    return (
                      <Box key={opt.value}>
                        {/* Top line: chip + amount — wraps on mobile */}
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
                          <Chip label={opt.label} size="small" color={classColors[opt.value] || 'default'} />
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {formatCurrency(amount)} ({pct.toFixed(0)}%)
                          </Typography>
                        </Box>
                        {/* Description on its own line for clarity */}
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          {opt.description}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(amount / maxClassVal) * 100}
                          color={classColors[opt.value] || 'primary'}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    );
                  })}

                  {/* Uncategorized */}
                  {totals.byClassification.uncategorized > 0 && (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Chip label="Uncategorized" size="small" />
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
                    </Box>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
