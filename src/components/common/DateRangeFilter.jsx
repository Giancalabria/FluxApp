import { useMemo } from 'react';
import { Stack, TextField, MenuItem } from '@mui/material';
import {
  getPresetRange,
  toISODate,
  DATE_RANGE_PRESET_OPTIONS,
} from '../../lib/dateRangePresets';

function detectPreset(dateFrom, dateTo) {
  if (!dateFrom || !dateTo) return 'custom';
  for (const opt of DATE_RANGE_PRESET_OPTIONS) {
    if (opt.value === 'custom') continue;
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

  const handlePresetChange = (presetValue) => {
    if (presetValue === 'custom') {
      onChange({ dateFrom: dateFrom || toISODate(new Date()), dateTo: dateTo || toISODate(new Date()) });
      return;
    }
    const r = getPresetRange(presetValue);
    if (r) onChange(r);
  };

  const handleFromChange = (e) => {
    const from = e.target.value;
    onChange({ dateFrom: from, dateTo: dateTo || from });
  };

  const handleToChange = (e) => {
    onChange({ dateFrom: dateFrom || e.target.value, dateTo: e.target.value });
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
      {preset === 'custom' && (
        <>
          <TextField
            label="From"
            type="date"
            value={dateFrom || ''}
            onChange={handleFromChange}
            slotProps={{ inputLabel: { shrink: true } }}
            size={size}
            sx={{ minWidth: 160 }}
          />
          <TextField
            label="To"
            type="date"
            value={dateTo || ''}
            onChange={handleToChange}
            slotProps={{ inputLabel: { shrink: true } }}
            size={size}
            sx={{ minWidth: 160 }}
          />
        </>
      )}
    </Stack>
  );
}
