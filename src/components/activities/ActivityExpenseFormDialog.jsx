import { useEffect, useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  IconButton,
  AppBar,
  Toolbar,
  useMediaQuery,
  useTheme,
  FormControlLabel,
  Checkbox,
  Box,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/CloseRounded';

const SPLIT_TYPES = { equal: 'equal', custom: 'custom' };

function equalSplitAmounts(total, memberIds) {
  const n = memberIds.length;
  if (n === 0) return {};
  const share = Math.floor((total * 100) / n) / 100;
  const remainder = Math.round((total - share * n) * 100) / 100;
  const amounts = {};
  memberIds.forEach((id, i) => {
    amounts[id] = i === 0 ? share + remainder : share;
  });
  return amounts;
}

export default function ActivityExpenseFormDialog({
  open,
  onClose,
  onSave,
  members,
  currency,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [paidBy, setPaidBy] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [splitType, setSplitType] = useState(SPLIT_TYPES.equal);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [customAmounts, setCustomAmounts] = useState({});
  const [error, setError] = useState('');

  const totalAmount = parseFloat(amount) || 0;
  const customSum = useMemo(
    () => Object.values(customAmounts).reduce((a, b) => a + (parseFloat(b) || 0), 0),
    [customAmounts]
  );
  const isValid =
    totalAmount > 0 &&
    paidBy &&
    selectedMemberIds.length > 0 &&
    (splitType === SPLIT_TYPES.equal ||
      (Math.abs(customSum - totalAmount) < 0.02 && selectedMemberIds.every((id) => (parseFloat(customAmounts[id]) || 0) >= 0)));

  useEffect(() => {
    if (open) {
      setPaidBy('');
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().slice(0, 10));
      setSplitType(SPLIT_TYPES.equal);
      setSelectedMemberIds(members.length ? [members[0].id] : []);
      setCustomAmounts({});
      setError('');
    }
  }, [open, members]);

  useEffect(() => {
    if (splitType === SPLIT_TYPES.equal && selectedMemberIds.length > 0 && totalAmount > 0) {
      setCustomAmounts(equalSplitAmounts(totalAmount, selectedMemberIds));
    }
  }, [splitType, selectedMemberIds, totalAmount]);

  const toggleMember = (id) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const setCustomAmount = (memberId, value) => {
    setCustomAmounts((prev) => ({ ...prev, [memberId]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!isValid) {
      if (splitType === SPLIT_TYPES.custom && Math.abs(customSum - totalAmount) >= 0.02) {
        setError('Split amounts must add up to the total.');
      }
      return;
    }

    const splits = selectedMemberIds.map((member_id) => {
      const amt = splitType === SPLIT_TYPES.equal
        ? (customAmounts[member_id] ?? totalAmount / selectedMemberIds.length)
        : (parseFloat(customAmounts[member_id]) || 0);
      return { member_id, amount: Math.round(amt * 100) / 100 };
    });

    onSave({
      paid_by_member_id: paidBy,
      amount: totalAmount,
      description: description.trim() || null,
      date,
      splits,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
              Add expense
            </Typography>
            <Button type="submit" color="primary" variant="contained" size="small" disabled={!isValid}>
              Save
            </Button>
          </Toolbar>
        </AppBar>
      ) : (
        <DialogTitle>Add expense</DialogTitle>
      )}

      <DialogContent sx={{ pt: isMobile ? 3 : undefined }}>
        <Stack spacing={2.5} sx={{ mt: isMobile ? 0 : 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Amount"
            name="amount"
            type="number"
            value={amount}
            onChange={(e) => {
              const v = e.target.value;
              const n = parseFloat(v);
              if (v !== '' && !isNaN(n) && n < 0) return;
              setAmount(v);
            }}
            slotProps={{ htmlInput: { step: '0.01', min: 0 } }}
            required
            fullWidth
            helperText={currency ? `in ${currency}` : ''}
          />

          <TextField
            label="Description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Dinner, Groceries"
            fullWidth
          />

          <TextField
            label="Date"
            name="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Paid by"
            select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            required
            fullWidth
            SelectProps={{ native: true }}
          >
            <option value="">Select who paid</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </TextField>

          <Typography variant="subtitle2" color="text.secondary">
            Split among
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
            {members.map((m) => (
              <FormControlLabel
                key={m.id}
                control={
                  <Checkbox
                    checked={selectedMemberIds.includes(m.id)}
                    onChange={() => toggleMember(m.id)}
                  />
                }
                label={m.name}
              />
            ))}
          </Stack>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={splitType === SPLIT_TYPES.equal}
                  onChange={() => setSplitType(SPLIT_TYPES.equal)}
                />
              }
              label="Equal split"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={splitType === SPLIT_TYPES.custom}
                  onChange={() => setSplitType(SPLIT_TYPES.custom)}
                />
              }
              label="Custom amounts"
            />
          </Box>

          {selectedMemberIds.length > 0 && (
            <Stack spacing={1}>
              {splitType === SPLIT_TYPES.equal && totalAmount > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Each owes {(totalAmount / selectedMemberIds.length).toFixed(2)} {currency}
                </Typography>
              )}
              {splitType === SPLIT_TYPES.custom &&
                selectedMemberIds.map((id) => {
                  const member = members.find((m) => m.id === id);
                  return (
                    <Box key={id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ minWidth: 80 }}>
                        {member?.name}
                      </Typography>
                      <TextField
                        size="small"
                        type="number"
                        value={customAmounts[id] ?? ''}
                        onChange={(e) => setCustomAmount(id, e.target.value)}
                        slotProps={{ htmlInput: { step: '0.01', min: 0 } }}
                        sx={{ width: 120 }}
                      />
                    </Box>
                  );
                })}
              {splitType === SPLIT_TYPES.custom && (
                <Typography variant="body2" color={Math.abs(customSum - totalAmount) < 0.02 ? 'text.secondary' : 'error.main'}>
                  Sum: {customSum.toFixed(2)} {currency} {Math.abs(customSum - totalAmount) >= 0.02 && '(must equal total)'}
                </Typography>
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>

      {!isMobile && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" onClick={handleSubmit} disabled={!isValid}>
            Save
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
