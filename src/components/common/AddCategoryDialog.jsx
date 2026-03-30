import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useFinancialProfile } from '../../context/FinancialProfileContext';
import { categoryService } from '../../services/categoryService';
import { EXPENSE_CLASS_OPTIONS } from '../../constants';

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {(category: object | null) => void} [props.onCreated] — called with created row on success
 */
export default function AddCategoryDialog({ open, onClose, onCreated }) {
  const { user } = useAuth();
  const { activeProfile } = useFinancialProfile();
  const profileId = activeProfile?.id;

  const [name, setName] = useState('');
  const [classification, setClassification] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setName('');
      setClassification('');
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
    const { data, error: err } = await categoryService.create({
      name: trimmed,
      classification: classification || null,
      financial_profile_id: profileId,
      user_id: user.id,
    });
    setSaving(false);
    if (err) {
      setError(err.message || 'No se pudo crear la categoría.');
      return;
    }
    onCreated?.(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Nueva categoría</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <TextField
            label="Nombre (ej: Supermercado, Salud)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            select
            label="Tipo (opcional)"
            value={classification}
            onChange={(e) => setClassification(e.target.value)}
            fullWidth
          >
            <MenuItem value=""><em>Sin tipo</em></MenuItem>
            {EXPENSE_CLASS_OPTIONS.map((c) => (
              <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
            ))}
          </TextField>
        </Stack>
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
