import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useFinancialProfile } from '../../context/FinancialProfileContext';
import { accountService } from '../../services/accountService';

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {(account: object | null) => void} [props.onCreated] — called with created row on success
 */
export default function AddAccountDialog({ open, onClose, onCreated }) {
  const { user } = useAuth();
  const { activeProfile } = useFinancialProfile();
  const profileId = activeProfile?.id;

  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setName('');
      setError('');
    }
  }, [open]);

  const handleClose = () => {
    if (!saving) onClose();
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Ingresá un nombre.');
      return;
    }
    if (!user?.id || !profileId) {
      setError('Perfil no disponible.');
      return;
    }
    setSaving(true);
    setError('');
    const { data, error: err } = await accountService.create({
      name: trimmed,
      financial_profile_id: profileId,
      user_id: user.id,
    });
    setSaving(false);
    if (err) {
      setError(err.message || 'No se pudo crear la cuenta.');
      return;
    }
    onCreated?.(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Nueva cuenta</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}
        <TextField
          label="Nombre (ej: Santander, Mercado Pago)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          autoFocus
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? <CircularProgress size={20} color="inherit" /> : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
