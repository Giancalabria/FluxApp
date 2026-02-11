import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Fab,
  Skeleton,
  Stack,
  TextField,
  MenuItem,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/AddRounded';
import DeleteIcon from '@mui/icons-material/DeleteRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownIcon from '@mui/icons-material/TrendingDownRounded';
import SwapHorizIcon from '@mui/icons-material/SwapHorizRounded';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLongRounded';
import { useTransactions } from '../hooks/useTransactions';
import { useAccounts } from '../hooks/useAccounts';
import { useCategories } from '../hooks/useCategories';
import { formatCurrency, formatDate } from '../lib/formatters';
import { TRANSACTION_TYPES, TRANSACTION_TYPE_OPTIONS } from '../constants';
import TransactionFormDialog from '../components/transactions/TransactionFormDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';

function txIcon(type) {
  if (type === TRANSACTION_TYPES.INCOME) return <TrendingUpIcon color="success" />;
  if (type === TRANSACTION_TYPES.EXPENSE) return <TrendingDownIcon color="error" />;
  return <SwapHorizIcon color="secondary" />;
}

const chipColor = { income: 'success', expense: 'error', transfer: 'secondary' };

export default function Transactions() {
  const [typeFilter, setTypeFilter] = useState('');
  const { transactions, loading, createTransaction, deleteTransaction } = useTransactions(
    typeFilter ? { type: typeFilter } : {}
  );
  const { accounts } = useAccounts();
  const { categories } = useCategories();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleSave = async (values) => {
    await createTransaction(values);
    setFormOpen(false);
  };

  const handleDelete = async () => {
    if (deleteTarget) await deleteTransaction(deleteTarget.id);
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Transactions
        </Typography>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" height={72} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Transactions
      </Typography>

      {/* Filter bar */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          select
          size="small"
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          {TRANSACTION_TYPE_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {transactions.length === 0 ? (
        <EmptyState
          icon={ReceiptLongIcon}
          title="No transactions"
          subtitle="Tap the + button to record your first income, expense, or transfer."
          actionLabel="Add Transaction"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <Card>
          <CardContent sx={{ p: { xs: 0.5, sm: 2 } }}>
            <List disablePadding>
              {transactions.map((t) => (
                <ListItem
                  key={t.id}
                  divider
                  sx={{ px: { xs: 1, sm: 2 }, py: 1.5, alignItems: 'flex-start' }}
                >
                  {/* Icon */}
                  <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                    {txIcon(t.type)}
                  </ListItemIcon>

                  {/* Text content — stacks description, date, chip, and amount */}
                  <ListItemText
                    disableTypography
                    primary={
                      <Box sx={{ pr: 5 }}>
                        <Typography variant="body2" fontWeight={500} noWrap>
                          {t.description || t.type}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(t.date)}
                          </Typography>
                          <Chip
                            label={t.type}
                            size="small"
                            color={chipColor[t.type] || 'default'}
                            sx={{ height: 20, fontSize: '0.65rem' }}
                          />
                        </Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          sx={{
                            mt: 0.5,
                            color:
                              t.type === TRANSACTION_TYPES.INCOME
                                ? 'success.main'
                                : t.type === TRANSACTION_TYPES.EXPENSE
                                  ? 'error.main'
                                  : 'secondary.main',
                          }}
                        >
                          {t.type === TRANSACTION_TYPES.EXPENSE ? '−' : '+'}{' '}
                          {formatCurrency(t.amount, t.account?.currency)}
                        </Typography>
                      </Box>
                    }
                  />

                  {/* Delete button */}
                  <ListItemSecondaryAction>
                    <Tooltip title="Delete">
                      <IconButton
                        edge="end"
                        size="small"
                        color="error"
                        onClick={() => setDeleteTarget(t)}
                        sx={{ mt: 0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* FAB */}
      <Fab
        color="primary"
        onClick={() => setFormOpen(true)}
        sx={{
          position: 'fixed',
          bottom: { xs: 'calc(60px + env(safe-area-inset-bottom, 0px) + 16px)', md: 24 },
          right: 24,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Form dialog */}
      <TransactionFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        accounts={accounts}
        categories={categories}
      />

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
