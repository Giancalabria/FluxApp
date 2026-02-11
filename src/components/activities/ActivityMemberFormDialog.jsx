import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  IconButton,
  AppBar,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/CloseRounded';

const empty = { name: '' };

export default function ActivityMemberFormDialog({ open, onClose, onSave }) {
  const [form, setForm] = useState(empty);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (open) setForm(empty);
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    onSave({ name });
    setForm(empty);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      fullScreen={isMobile}
      slots={{ paper: 'form' }}
      slotProps={{ paper: { onSubmit: handleSubmit } }}
    >
      {isMobile ? (
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 1, flex: 1 }} fontWeight={600}>
              Add person
            </Typography>
            <Button type="submit" color="primary" variant="contained" size="small">
              Add
            </Button>
          </Toolbar>
        </AppBar>
      ) : (
        <DialogTitle>Add person</DialogTitle>
      )}

      <DialogContent sx={{ pt: isMobile ? 3 : undefined }}>
        <Stack spacing={2.5} sx={{ mt: isMobile ? 0 : 1 }}>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={(e) => setForm({ name: e.target.value })}
            required
            autoFocus={!isMobile}
            placeholder="e.g. Maria, John"
            fullWidth
          />
        </Stack>
      </DialogContent>

      {!isMobile && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" onClick={handleSubmit}>
            Add
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
