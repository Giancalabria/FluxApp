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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessIcon from '@mui/icons-material/ExpandLessRounded';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency, formatDate } from '../lib/formatters';
import { getPresetRange } from '../lib/dateRangePresets';
import DateRangeFilter from '../components/common/DateRangeFilter';
import { TRANSACTION_TYPES, EXPENSE_CLASS_OPTIONS } from '../constants';

const classColors = {
  fixed: 'warning',
  variable: 'info',
  essential: 'secondary',
};

function getClassification(t) {
  return t.category?.classification ?? t.classification;
}

export default function Reports() {
  const defaultRange = useMemo(() => getPresetRange('all_time') ?? { dateFrom: null, dateTo: null }, []);
  const [dateRange, setDateRange] = useState(defaultRange);
  const filters = {
    ...(dateRange?.dateFrom && { dateFrom: dateRange.dateFrom }),
    ...(dateRange?.dateTo && { dateTo: dateRange.dateTo }),
  };
  const { transactions, loading } = useTransactions(filters);

  const [expandedClass, setExpandedClass] = useState(null);

  // Totals and expenses grouped by classification
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

    return {
      totals: { income, expense, net: income - expense, byClassification },
      expensesByClassification: byClassificationList,
    };
  }, [transactions]);

  const maxClassVal = Math.max(...Object.values(totals.byClassification), 1);

  const toggleExpanded = (key) => {
    setExpandedClass((prev) => (prev === key ? null : key));
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Reports
      </Typography>

      <DateRangeFilter value={dateRange} onChange={setDateRange} sx={{ mb: 3 }} />

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
                                  −{formatCurrency(t.amount, t.account?.currency)}
                                </Typography>
                              </ListItem>
                            ))}
                          </List>
                        </Collapse>
                      </Box>
                    );
                  })}

                  {/* Uncategorized */}
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
                                  −{formatCurrency(t.amount, t.account?.currency)}
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
