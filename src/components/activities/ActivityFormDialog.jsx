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

const empty = { name: '', currency: 'ARS' };

export default function ActivityFormDialog({ open, onClose, onSave }) {
  const [form, setForm] = useState(empty);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (open) setForm(empty);
  }, [open]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name: form.name.trim(), currency: form.currency });
  };

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
              New Activity
            </Typography>
            <Button type="submit" color="primary" variant="contained" size="small">
              Create
            </Button>
          </Toolbar>
        </AppBar>
      ) : (
        <DialogTitle>New Activity</DialogTitle>
      )}

      <DialogContent sx={{ pt: isMobile ? 3 : undefined }}>
        <Stack spacing={2.5} sx={{ mt: isMobile ? 0 : 1 }}>
          <TextField
            label="Activity name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            autoFocus={!isMobile}
            placeholder="e.g. Trip to Bariloche"
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
        </Stack>
      </DialogContent>

      {!isMobile && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" onClick={handleSubmit}>
            Create
          </Button>
        </DialogActions>
      )}
      </form>
    </Dialog>
  );
}
