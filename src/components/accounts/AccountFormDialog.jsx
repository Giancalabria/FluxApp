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
  IconButton,
  AppBar,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/CloseRounded';
import { useCurrencies } from '../../hooks/useCurrencies';

const empty = { name: '', currency_code: 'ARS', balance: '' };

export default function AccountFormDialog({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(empty);
  const { currencies } = useCurrencies();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (open) {
      const curr = initial?.currency_code ?? initial?.currency ?? 'ARS';
      setForm(
        initial
          ? { name: initial.name, currency_code: curr, balance: String(initial.balance) }
          : empty
      );
    }
  }, [open, initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'balance') {
      const n = parseFloat(value);
      if (value !== '' && !isNaN(n) && n < 0) return setForm((prev) => ({ ...prev, balance: '0' }));
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, balance: parseFloat(form.balance) || 0 });
  };

  const isEdit = !!initial;
  const title = isEdit ? 'Edit Account' : 'New Account';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      fullScreen={isMobile}
      slotProps={{
        backdrop: {
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)' },
          invisible: false,
        },
      }}
    >
      <form onSubmit={handleSubmit}>
      {isMobile ? (
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 1, flex: 1 }} fontWeight={600}>
              {title}
            </Typography>
            <Button type="submit" color="primary" variant="contained" size="small">
              {isEdit ? 'Save' : 'Create'}
            </Button>
          </Toolbar>
        </AppBar>
      ) : (
        <DialogTitle>{title}</DialogTitle>
      )}

      <DialogContent sx={{ pt: isMobile ? 3 : undefined }}>
        <Stack spacing={2.5} sx={{ mt: isMobile ? 0 : 1 }}>
          <TextField
            label="Account Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            autoFocus={!isMobile}
            placeholder="e.g. Savings, Checking…"
            fullWidth
          />

          <TextField
            label="Currency"
            name="currency_code"
            value={form.currency_code}
            onChange={handleChange}
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
            label="Initial Balance"
            name="balance"
            type="number"
            value={form.balance}
            onChange={handleChange}
            slotProps={{ htmlInput: { step: '0.01', min: 0 } }}
            fullWidth
            sx={{
              '& input[type="number"]': { MozAppearance: 'textfield' },
              '& input[type="number"]::-webkit-outer-spin-button, & input[type="number"]::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
            }}
          />
        </Stack>
      </DialogContent>

      {!isMobile && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            {isEdit ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      )}
      </form>
    </Dialog>
  );
}
