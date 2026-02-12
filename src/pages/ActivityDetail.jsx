import { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Skeleton,
  Fab,
  Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import AddIcon from '@mui/icons-material/AddRounded';
import DeleteIcon from '@mui/icons-material/DeleteRounded';
import PersonAddIcon from '@mui/icons-material/PersonAddRounded';
import ReceiptIcon from '@mui/icons-material/ReceiptLongRounded';
import { useActivity } from '../hooks/useActivity';
import { useActivityExpenses } from '../hooks/useActivityExpenses';
import { formatCurrency, formatDate } from '../lib/formatters';
import { computeSettlement } from '../lib/settlement';
import ActivityExpenseFormDialog from '../components/activities/ActivityExpenseFormDialog';
import ActivityMemberFormDialog from '../components/activities/ActivityMemberFormDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';

export default function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activity, members, loading: actLoading, error: actError, addMember, removeMember } = useActivity(id);
  const { expenses, loading: expLoading, createExpense, deleteExpense } = useActivityExpenses(id);

  const [tab, setTab] = useState(0);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [deleteExpenseTarget, setDeleteExpenseTarget] = useState(null);
  const [deleteMemberTarget, setDeleteMemberTarget] = useState(null);
  const [memberError, setMemberError] = useState('');

  const loading = actLoading || expLoading;

  const handleSaveExpense = async (payload) => {
    const { error } = await createExpense({ activity_id: id, ...payload });
    if (!error) setExpenseDialogOpen(false);
  };

  const handleAddMember = async (payload) => {
    setMemberError('');
    const { error } = await addMember({ activity_id: id, ...payload });
    if (error) setMemberError(error.message);
  };

  const handleDeleteExpense = async () => {
    if (deleteExpenseTarget) await deleteExpense(deleteExpenseTarget.id);
    setDeleteExpenseTarget(null);
  };

  const handleDeleteMember = async () => {
    if (deleteMemberTarget) {
      const { error } = await removeMember(deleteMemberTarget.id);
      if (error) setMemberError(error.message);
    }
    setDeleteMemberTarget(null);
  };

  if (loading && !activity) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rounded" height={48} sx={{ mt: 2 }} />
        <Skeleton variant="rounded" height={200} sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (actError || !activity) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/activities')} sx={{ mb: 2 }}>
          Back
        </Button>
        <Alert severity="error">{actError || 'Activity not found.'}</Alert>
      </Box>
    );
  }

  const currency = activity.currency;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/activities')} sx={{ mb: 1 }}>
        Back
      </Button>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          {activity.name}
        </Typography>
        <Chip label={currency} size="small" color="primary" variant="outlined" />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          People
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          {members.map((m) => (
            <Chip
              key={m.id}
              label={m.name}
              size="small"
              onDelete={members.length > 1 ? () => setDeleteMemberTarget(m) : undefined}
            />
          ))}
          <Button size="small" startIcon={<PersonAddIcon />} onClick={() => setMemberDialogOpen(true)}>
            Add person
          </Button>
        </Box>
        {memberError && (
          <Alert severity="error" sx={{ mt: 1 }} onClose={() => setMemberError('')}>
            {memberError}
          </Alert>
        )}
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Expenses" id="activity-tab-0" aria-controls="activity-tabpanel-0" />
        <Tab label="Settle up" id="activity-tab-1" aria-controls="activity-tabpanel-1" />
      </Tabs>

      <Box role="tabpanel" hidden={tab !== 0} id="activity-tabpanel-0" aria-labelledby="activity-tab-0">
        {tab === 0 && (
          <>
            {expenses.length === 0 ? (
              <EmptyState
                icon={ReceiptIcon}
                title="No expenses yet"
                subtitle={
                  members.length === 0
                    ? 'Add at least one person above, then add an expense.'
                    : 'Add an expense and split it among the people above.'
                }
                actionLabel={members.length > 0 ? 'Add expense' : undefined}
                onAction={members.length > 0 ? () => setExpenseDialogOpen(true) : undefined}
              />
            ) : (
              <List disablePadding>
                {expenses.map((e) => {
                  const paidBy = e.paid_by_member ?? e.paid_by_member_id;
                  const paidByName = typeof paidBy === 'object' && paidBy?.name ? paidBy.name : 'Someone';
                  return (
                    <ListItem key={e.id} divider sx={{ px: 0 }}>
                      <ListItemText
                        primary={e.description || 'Expense'}
                        secondary={`${formatDate(e.date)} · ${paidByName} paid ${formatCurrency(e.amount, currency)}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          size="small"
                          color="error"
                          onClick={() => setDeleteExpenseTarget(e)}
                          aria-label="Delete"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            )}
            {expenses.length > 0 && members.length > 0 && (
              <Fab
                color="primary"
                size="medium"
                onClick={() => setExpenseDialogOpen(true)}
                sx={{
                  position: 'fixed',
                  bottom: { xs: 'calc(60px + env(safe-area-inset-bottom, 0px) + 16px)', md: 24 },
                  right: 24,
                }}
              >
                <AddIcon />
              </Fab>
            )}
          </>
        )}
      </Box>

      <Box role="tabpanel" hidden={tab !== 1} id="activity-tabpanel-1" aria-labelledby="activity-tab-1">
        {tab === 1 && (
          <SettleUpPanel members={members} expenses={expenses} currency={currency} />
        )}
      </Box>

      <ActivityExpenseFormDialog
        open={expenseDialogOpen}
        onClose={() => setExpenseDialogOpen(false)}
        onSave={handleSaveExpense}
        members={members}
        currency={currency}
      />

      <ActivityMemberFormDialog
        open={memberDialogOpen}
        onClose={() => { setMemberDialogOpen(false); setMemberError(''); }}
        onSave={handleAddMember}
      />

      <ConfirmDialog
        open={!!deleteExpenseTarget}
        title="Delete expense"
        message="Are you sure you want to delete this expense? This cannot be undone."
        onConfirm={handleDeleteExpense}
        onCancel={() => setDeleteExpenseTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteMemberTarget}
        title="Remove person"
        message={
          deleteMemberTarget
            ? `Remove "${deleteMemberTarget.name}" from this activity? They must have no expense shares first.`
            : ''
        }
        onConfirm={handleDeleteMember}
        onCancel={() => setDeleteMemberTarget(null)}
      />
    </Box>
  );
}

function SettleUpPanel({ members, expenses, currency }) {
  const splits = expenses.flatMap((e) =>
    (e.expense_splits || []).map((s) => ({
      expense_id: e.id,
      member_id: s.member_id,
      amount: Number(s.amount),
    }))
  );
  const suggestions = computeSettlement(members, expenses, splits);

  if (suggestions.length === 0) {
    return (
      <EmptyState
        icon={ReceiptIcon}
        title="No balances to settle"
        subtitle="Add expenses and split them to see who should pay whom."
      />
    );
  }

  return (
    <List disablePadding>
      {suggestions.map((s, i) => {
        const fromMember = members.find((m) => m.id === s.fromMemberId);
        const toMember = members.find((m) => m.id === s.toMemberId);
        return (
          <ListItem key={i} sx={{ px: 0 }}>
            <ListItemText
              primary={`${fromMember?.name ?? 'Someone'} should pay ${toMember?.name ?? 'Someone'}`}
              secondary={formatCurrency(s.amount, currency)}
            />
          </ListItem>
        );
      })}
    </List>
  );
}
