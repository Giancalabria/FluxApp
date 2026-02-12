import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Alert,
  IconButton,
  AppBar,
  Toolbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/CloseRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownIcon from '@mui/icons-material/TrendingDownRounded';
import SwapHorizIcon from '@mui/icons-material/SwapHorizRounded';
import { TRANSACTION_TYPES, EXPENSE_CLASS_OPTIONS } from '../../constants';

const emptyForm = {
  type: 'expense',
  account_id: '',
  to_account_id: '',
  amount: '',
  description: '',
  category_id: '',
  classification: '',
  date: new Date().toISOString().slice(0, 10),
  exchange_rate: '',
};

export default function TransactionFormDialog({ open, onClose, onSave, accounts, categories }) {
  const [form, setForm] = useState(emptyForm);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (open) setForm(emptyForm);
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'amount' || name === 'exchange_rate') {
      const n = parseFloat(value);
      if (value !== '' && !isNaN(n) && n < 0) return setForm((prev) => ({ ...prev, [name]: '0' }));
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleTypeChange = (_, val) => {
    if (val) setForm((prev) => ({ ...prev, type: val, to_account_id: '', exchange_rate: '' }));
  };

  // Determine if transfer involves different currencies
  const fromAccount = accounts.find((a) => a.id === form.account_id);
  const toAccount = accounts.find((a) => a.id === form.to_account_id);
  const needsExchangeRate =
    form.type === TRANSACTION_TYPES.TRANSFER &&
    fromAccount &&
    toAccount &&
    fromAccount.currency !== toAccount.currency;

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      type: form.type,
      account_id: form.account_id,
      amount: parseFloat(form.amount) || 0,
      description: form.description,
      date: form.date,
    };

    if (form.type === TRANSACTION_TYPES.EXPENSE) {
      payload.category_id = form.category_id || null;
      payload.classification = form.classification || null;
    }

    if (form.type === TRANSACTION_TYPES.INCOME) {
      payload.category_id = form.category_id || null;
    }

    if (form.type === TRANSACTION_TYPES.TRANSFER) {
      payload.to_account_id = form.to_account_id;
      if (needsExchangeRate) {
        payload.exchange_rate = parseFloat(form.exchange_rate) || null;
      }
    }

    onSave(payload);
  };

  const isTransfer = form.type === TRANSACTION_TYPES.TRANSFER;
  const isExpense = form.type === TRANSACTION_TYPES.EXPENSE;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
      <form onSubmit={handleSubmit}>
      {/* Mobile: full-screen header bar */}
      {isMobile ? (
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 1, flex: 1 }} fontWeight={600}>
              New Transaction
            </Typography>
            <Button type="submit" color="primary" variant="contained" size="small">
              Save
            </Button>
          </Toolbar>
        </AppBar>
      ) : (
        <DialogTitle>New Transaction</DialogTitle>
      )}

      <DialogContent sx={{ pt: isMobile ? 3 : undefined }}>
        <Stack spacing={2.5} sx={{ mt: isMobile ? 0 : 1 }}>
          {/* Type toggle */}
          <ToggleButtonGroup
            value={form.type}
            exclusive
            onChange={handleTypeChange}
            fullWidth
            size="small"
          >
            <ToggleButton value="income" color="success">
              <TrendingUpIcon sx={{ mr: 0.5 }} fontSize="small" /> Income
            </ToggleButton>
            <ToggleButton value="expense" color="error">
              <TrendingDownIcon sx={{ mr: 0.5 }} fontSize="small" /> Expense
            </ToggleButton>
            <ToggleButton value="transfer" color="secondary">
              <SwapHorizIcon sx={{ mr: 0.5 }} fontSize="small" /> Transfer
            </ToggleButton>
          </ToggleButtonGroup>

          {/* From account */}
          <TextField
            label={isTransfer ? 'From Account' : 'Account'}
            name="account_id"
            value={form.account_id}
            onChange={handleChange}
            select
            required
            fullWidth
          >
            {accounts.map((a) => (
              <MenuItem key={a.id} value={a.id}>
                {a.name} ({a.currency})
              </MenuItem>
            ))}
          </TextField>

          {/* To account (transfer only) */}
          {isTransfer && (
            <TextField
              label="To Account"
              name="to_account_id"
              value={form.to_account_id}
              onChange={handleChange}
              select
              required
              fullWidth
            >
              {accounts
                .filter((a) => a.id !== form.account_id)
                .map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name} ({a.currency})
                  </MenuItem>
                ))}
            </TextField>
          )}

          {/* Exchange rate warning + field */}
          {needsExchangeRate && (
            <>
              <Alert severity="info" variant="outlined" sx={{ fontSize: '0.85rem' }}>
                Different currencies ({fromAccount.currency} → {toAccount.currency}).
                Enter the exchange rate below.
              </Alert>
              <TextField
                label={`1 ${fromAccount.currency} = ? ${toAccount.currency}`}
                name="exchange_rate"
                type="number"
                value={form.exchange_rate}
                onChange={handleChange}
                slotProps={{ htmlInput: { step: '0.0001', min: 0 } }}
                required
                fullWidth
                sx={{
                  '& input[type="number"]': { MozAppearance: 'textfield' },
                  '& input[type="number"]::-webkit-outer-spin-button, & input[type="number"]::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none',
                    margin: 0,
                  },
                }}
              />
              {form.exchange_rate && form.amount && (
                <Typography variant="body2" color="text.secondary">
                  {fromAccount.currency} {parseFloat(form.amount).toFixed(2)} ≈{' '}
                  {toAccount.currency}{' '}
                  {(parseFloat(form.amount) * parseFloat(form.exchange_rate)).toFixed(2)}
                </Typography>
              )}
            </>
          )}

          {/* Amount */}
          <TextField
            label="Amount"
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            slotProps={{ htmlInput: { step: '0.01', min: 0 } }}
            required
            fullWidth
            sx={{
              '& input[type="number"]': { MozAppearance: 'textfield' },
              '& input[type="number"]::-webkit-outer-spin-button, & input[type="number"]::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
            }}
          />

          {/* Description */}
          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="e.g. Monthly salary, Groceries…"
            fullWidth
          />

          {/* Date */}
          <TextField
            label="Date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />

          {/* Category (income & expense) */}
          {!isTransfer && (
            <TextField
              label="Category"
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              select
              fullWidth
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          {/* Classification (expense only) */}
          {isExpense && (
            <TextField
              label="Classification"
              name="classification"
              value={form.classification}
              onChange={handleChange}
              select
              fullWidth
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {EXPENSE_CLASS_OPTIONS.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label} — {c.description}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Stack>
      </DialogContent>

      {/* Desktop-only bottom actions (mobile uses the top bar Save button) */}
      {!isMobile && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </DialogActions>
      )}
      </form>
    </Dialog>
  );
}
