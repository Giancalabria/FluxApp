import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useAccounts } from '../hooks/useAccounts';
import { useUserCurrencies } from '../hooks/useUserCurrencies';
import { useCurrencies } from '../hooks/useCurrencies';
import { useFinancialProfile } from '../context/FinancialProfileContext';
import { accountService } from '../services/accountService';

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { activeProfile } = useFinancialProfile();
  const profileId = activeProfile?.id;

  const { profile, loading: profileLoading, updateUsername } = useProfile(user?.id);
  const { accounts, loading: accLoading, refetch: refetchAccounts } = useAccounts(profileId);
  const { currencies: userCurrencies, loading: ucLoading, addCurrency, removeCurrency } = useUserCurrencies(user?.id);
  const { currencies: allCurrencies } = useCurrencies();

  const [nameEdit, setNameEdit] = useState('');
  const [nameEditing, setNameEditing] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  const [newCurrencyCode, setNewCurrencyCode] = useState('');
  const [addCurrencyOpen, setAddCurrencyOpen] = useState(false);
  const [addingCurrency, setAddingCurrency] = useState(false);

  const [newAccountName, setNewAccountName] = useState('');
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [addingAccount, setAddingAccount] = useState(false);
  const [accountError, setAccountError] = useState('');

  const [deleteAccountTarget, setDeleteAccountTarget] = useState(null);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [signOutConfirm, setSignOutConfirm] = useState(false);

  const availableToAdd = allCurrencies.filter(
    (c) => !userCurrencies.some((uc) => uc.currency_code === c.code)
  );

  const handleSaveName = async () => {
    if (!nameEdit.trim()) { setNameError('Ingresá un nombre.'); return; }
    setNameSaving(true);
    const { error } = await updateUsername(nameEdit.trim());
    setNameSaving(false);
    if (error) {
      setNameError(error.message);
    } else {
      setNameEditing(false);
      setNameError('');
    }
  };

  const handleAddCurrency = async () => {
    if (!newCurrencyCode) return;
    setAddingCurrency(true);
    await addCurrency(newCurrencyCode);
    setAddingCurrency(false);
    setAddCurrencyOpen(false);
    setNewCurrencyCode('');
  };

  const handleAddAccount = async () => {
    const name = newAccountName.trim();
    if (!name) { setAccountError('Ingresá un nombre.'); return; }
    setAddingAccount(true);
    const { error } = await accountService.create({
      name,
      financial_profile_id: profileId,
      user_id: user.id,
    });
    setAddingAccount(false);
    if (error) {
      setAccountError(error.message || 'No se pudo crear la cuenta.');
    } else {
      setAddAccountOpen(false);
      setNewAccountName('');
      setAccountError('');
      await refetchAccounts();
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteAccountTarget) return;
    setDeletingAccount(true);
    await accountService.remove(deleteAccountTarget.id);
    setDeletingAccount(false);
    setDeleteAccountTarget(null);
    await refetchAccounts();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100dvh' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', px: 2.5, pt: 'max(env(safe-area-inset-top, 0px), 16px)', pb: 2.5 }}>
        <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.contrastText' }}>
          Mi Perfil
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(242,239,233,0.7)' }}>
          {user?.email}
        </Typography>
      </Box>

      <Box sx={{ px: 2, pt: 2, pb: 4 }}>
        {/* User name card */}
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Nombre
            </Typography>
            {profileLoading ? (
              <CircularProgress size={20} />
            ) : nameEditing ? (
              <Stack spacing={1.5}>
                {nameError && <Alert severity="error" sx={{ py: 0.5 }}>{nameError}</Alert>}
                <TextField
                  label="Tu nombre"
                  value={nameEdit}
                  onChange={(e) => setNameEdit(e.target.value)}
                  fullWidth
                  autoFocus
                  size="small"
                />
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" onClick={handleSaveName} disabled={nameSaving} sx={{ borderRadius: 2, flex: 1 }}>
                    {nameSaving ? <CircularProgress size={20} color="inherit" /> : 'Guardar'}
                  </Button>
                  <Button variant="outlined" onClick={() => { setNameEditing(false); setNameError(''); }} sx={{ borderRadius: 2 }}>
                    Cancelar
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body1" color={profile?.username ? 'text.primary' : 'text.disabled'}>
                  {profile?.username || 'Sin nombre'}
                </Typography>
                <Button
                  size="small"
                  onClick={() => { setNameEditing(true); setNameEdit(profile?.username || ''); }}
                  sx={{ borderRadius: 2, color: 'primary.main' }}
                >
                  Editar
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Currencies card */}
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={700}>Mis monedas</Typography>
              <IconButton
                size="small"
                onClick={() => setAddCurrencyOpen(true)}
                disabled={availableToAdd.length === 0}
                sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' }, width: 30, height: 30 }}
              >
                <AddRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
            {ucLoading ? (
              <CircularProgress size={20} />
            ) : userCurrencies.length === 0 ? (
              <Typography variant="body2" color="text.disabled">Sin monedas. Agregá una.</Typography>
            ) : (
              <List disablePadding>
                {userCurrencies.map((uc, idx) => (
                  <Box key={uc.currency_code}>
                    <ListItem disablePadding sx={{ py: 0.75 }}>
                      <ListItemText
                        primary={uc.currency_code}
                        secondary={allCurrencies.find((c) => c.code === uc.currency_code)?.name}
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => removeCurrency(uc.currency_code)}
                          disabled={userCurrencies.length <= 1}
                        >
                          <DeleteRoundedIcon fontSize="small" sx={{ color: 'error.light' }} />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {idx < userCurrencies.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Accounts card */}
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={700}>Mis cuentas</Typography>
              <IconButton
                size="small"
                onClick={() => setAddAccountOpen(true)}
                sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' }, width: 30, height: 30 }}
              >
                <AddRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
            {accLoading ? (
              <CircularProgress size={20} />
            ) : accounts.length === 0 ? (
              <Typography variant="body2" color="text.disabled">Sin cuentas. Creá una.</Typography>
            ) : (
              <List disablePadding>
                {accounts.map((a, idx) => (
                  <Box key={a.id}>
                    <ListItem disablePadding sx={{ py: 0.75 }}>
                      <ListItemText primary={a.name} primaryTypographyProps={{ fontWeight: 600 }} />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" size="small" onClick={() => setDeleteAccountTarget(a)}>
                          <DeleteRoundedIcon fontSize="small" sx={{ color: 'error.light' }} />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {idx < accounts.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Sign out */}
        <Button
          variant="outlined"
          color="error"
          fullWidth
          startIcon={<LogoutRoundedIcon />}
          onClick={() => setSignOutConfirm(true)}
          sx={{ borderRadius: 2, py: 1.5 }}
        >
          Cerrar sesión
        </Button>
      </Box>

      {/* Add currency dialog */}
      <Dialog open={addCurrencyOpen} onClose={() => setAddCurrencyOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Agregar moneda</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            select
            label="Moneda"
            value={newCurrencyCode}
            onChange={(e) => setNewCurrencyCode(e.target.value)}
            fullWidth
            sx={{ mt: 1 }}
          >
            {availableToAdd.map((c) => (
              <MenuItem key={c.code} value={c.code}>
                {c.symbol} — {c.name} ({c.code})
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCurrencyOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleAddCurrency} disabled={!newCurrencyCode || addingCurrency}>
            {addingCurrency ? <CircularProgress size={20} color="inherit" /> : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add account dialog */}
      <Dialog open={addAccountOpen} onClose={() => setAddAccountOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Nueva cuenta</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {accountError && <Alert severity="error" sx={{ mb: 1.5 }}>{accountError}</Alert>}
          <TextField
            label="Nombre (ej: Santander, Mercado Pago)"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            fullWidth
            autoFocus
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setAddAccountOpen(false); setAccountError(''); }}>Cancelar</Button>
          <Button variant="contained" onClick={handleAddAccount} disabled={addingAccount}>
            {addingAccount ? <CircularProgress size={20} color="inherit" /> : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete account confirm */}
      <Dialog open={!!deleteAccountTarget} onClose={() => setDeleteAccountTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Eliminar cuenta</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            ¿Eliminás la cuenta "{deleteAccountTarget?.name}"? Los gastos asociados no se eliminarán pero quedarán sin cuenta.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAccountTarget(null)}>Cancelar</Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained" disabled={deletingAccount}>
            {deletingAccount ? <CircularProgress size={20} color="inherit" /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sign out confirm */}
      <Dialog open={signOutConfirm} onClose={() => setSignOutConfirm(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Cerrar sesión</DialogTitle>
        <DialogContent>
          <Typography variant="body2">¿Seguro que querés cerrar sesión?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSignOutConfirm(false)}>Cancelar</Button>
          <Button onClick={handleSignOut} color="error" variant="contained">Salir</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
