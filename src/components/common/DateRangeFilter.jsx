import { useMemo, useState } from 'react';
import { Stack, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import {
  getPresetRange,
  toISODate,
  DATE_RANGE_PRESET_OPTIONS,
} from '../../lib/dateRangePresets';

function detectPreset(dateFrom, dateTo) {
  if (!dateFrom && !dateTo) return 'all_time';
  if (!dateFrom || !dateTo) return 'custom';
  for (const opt of DATE_RANGE_PRESET_OPTIONS) {
    if (opt.value === 'custom' || opt.value === 'all_time') continue;
    const r = getPresetRange(opt.value);
    if (r && r.dateFrom === dateFrom && r.dateTo === dateTo) return opt.value;
  }
  return 'custom';
}

export default function DateRangeFilter({ value, onChange, size = 'small', sx }) {
  const { dateFrom, dateTo } = value || {};
  const preset = useMemo(
    () => detectPreset(dateFrom, dateTo),
    [dateFrom, dateTo]
  );

  const [customOpen, setCustomOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(() => dateFrom || toISODate(new Date()));
  const [customTo, setCustomTo] = useState(() => dateTo || toISODate(new Date()));

  const handlePresetChange = (presetValue) => {
    if (presetValue === 'custom') {
      const today = toISODate(new Date());
      setCustomFrom(dateFrom || today);
      setCustomTo(dateTo || today);
      setCustomOpen(true);
      return;
    }
    const r = getPresetRange(presetValue);
    if (r) onChange(r);
    else onChange({ dateFrom: null, dateTo: null }); // all_time
  };

  const handleCustomApply = () => {
    const from = customFrom || customTo || toISODate(new Date());
    const to = customTo || customFrom || toISODate(new Date());
    onChange({ dateFrom: from, dateTo: to });
    setCustomOpen(false);
  };

  const handleCustomCancel = () => {
    setCustomOpen(false);
  };

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={sx} alignItems={{ sm: 'center' }}>
      <TextField
        select
        label="Period"
        value={preset}
        onChange={(e) => handlePresetChange(e.target.value)}
        size={size}
        sx={{ minWidth: 160 }}
      >
        {DATE_RANGE_PRESET_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>

      <Dialog open={customOpen} onClose={handleCustomCancel} slotProps={{ paper: { sx: { minWidth: 320 } } }}>
        <DialogTitle>Select date range</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="From"
              type="date"
              value={customFrom || ''}
              onChange={(e) => setCustomFrom(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              size={size}
              fullWidth
            />
            <TextField
              label="To"
              type="date"
              value={customTo || ''}
              onChange={(e) => setCustomTo(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              size={size}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCustomCancel}>Cancel</Button>
          <Button variant="contained" onClick={handleCustomApply}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
