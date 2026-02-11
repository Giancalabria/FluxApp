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
import { CURRENCIES } from '../../constants';

const empty = { name: '', currency: 'ARS', balance: '' };

export default function AccountFormDialog({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(empty);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? { name: initial.name, currency: initial.currency, balance: String(initial.balance) }
          : empty
      );
    }
  }, [open, initial]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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
      PaperProps={{ component: 'form', onSubmit: handleSubmit }}
    >
      {/* Mobile: full-screen header */}
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
            name="currency"
            value={form.currency}
            onChange={handleChange}
            select
            required
            fullWidth
          >
            {CURRENCIES.map((c) => (
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
            inputProps={{ step: '0.01' }}
            fullWidth
          />
        </Stack>
      </DialogContent>

      {/* Desktop-only bottom actions */}
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
    </Dialog>
  );
}
