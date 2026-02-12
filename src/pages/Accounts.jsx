import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Fab,
  Chip,
  Skeleton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/AddRounded';
import EditIcon from '@mui/icons-material/EditRounded';
import DeleteIcon from '@mui/icons-material/DeleteRounded';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import { useAccounts } from '../hooks/useAccounts';
import { formatCurrency } from '../lib/formatters';
import AccountFormDialog from '../components/accounts/AccountFormDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';

export default function Accounts() {
  const { accounts, loading, createAccount, updateAccount, deleteAccount } = useAccounts();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleSave = async (values) => {
    if (editing) {
      await updateAccount(editing.id, values);
    } else {
      await createAccount(values);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (account) => {
    setEditing(account);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (deleteTarget) await deleteAccount(deleteTarget.id);
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>Accounts</Typography>
        <Grid container spacing={2}>
          {[1, 2, 3].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rounded" height={140} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>Accounts</Typography>

      {accounts.length === 0 ? (
        <EmptyState
          icon={AccountBalanceWalletIcon}
          title="No accounts yet"
          subtitle="Create your first account to start tracking your finances."
          actionLabel="Add Account"
          onAction={openNew}
        />
      ) : (
        <Grid container spacing={2}>
          {accounts.map((acc) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={acc.id}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {acc.name}
                    </Typography>
                    <Chip label={acc.currency_code ?? acc.currency} size="small" color="primary" variant="outlined" />
                  </Box>
                  <Typography variant="h5" fontWeight={700} sx={{ mt: 2 }}>
                    {formatCurrency(acc.balance, acc.currency_code ?? acc.currency)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(acc)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(acc)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Fab
        color="primary"
        onClick={openNew}
        sx={{
          position: 'fixed',
          bottom: { xs: 'calc(60px + env(safe-area-inset-bottom, 0px) + 16px)', md: 24 },
          right: 24,
        }}
      >
        <AddIcon />
      </Fab>

      <AccountFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSave={handleSave}
        initial={editing}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Account"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
