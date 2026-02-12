/**
 * Date range preset labels and logic. All dates in local time, YYYY-MM-DD.
 */

export function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getPresetRange(preset) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();
  const dayOfWeek = today.getDay(); // 0 Sun .. 6 Sat

  switch (preset) {
    case 'all_time':
      return null; // no date filter
    case 'today': {
      const s = toISODate(today);
      return { dateFrom: s, dateTo: s };
    }
    case 'this_week': {
      // Monday = start of week (ISO)
      const daysSinceMonday = (dayOfWeek + 6) % 7;
      const monday = new Date(today);
      monday.setDate(d - daysSinceMonday);
      return { dateFrom: toISODate(monday), dateTo: toISODate(today) };
    }
    case 'last_week': {
      const daysSinceMonday = (dayOfWeek + 6) % 7;
      const lastMonday = new Date(today);
      lastMonday.setDate(d - daysSinceMonday - 7);
      const lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastMonday.getDate() + 6);
      return { dateFrom: toISODate(lastMonday), dateTo: toISODate(lastSunday) };
    }
    case 'this_month': {
      const first = new Date(y, m, 1);
      return { dateFrom: toISODate(first), dateTo: toISODate(today) };
    }
    case 'last_month': {
      const firstLastMonth = new Date(y, m - 1, 1);
      const lastLastMonth = new Date(y, m, 0);
      return { dateFrom: toISODate(firstLastMonth), dateTo: toISODate(lastLastMonth) };
    }
    case 'this_year': {
      const jan1 = new Date(y, 0, 1);
      return { dateFrom: toISODate(jan1), dateTo: toISODate(today) };
    }
    case 'last_year': {
      const jan1Last = new Date(y - 1, 0, 1);
      const dec31Last = new Date(y - 1, 11, 31);
      return { dateFrom: toISODate(jan1Last), dateTo: toISODate(dec31Last) };
    }
    default:
      return null;
  }
}

export const DATE_RANGE_PRESET_OPTIONS = [
  { value: 'all_time', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This week' },
  { value: 'last_week', label: 'Last week' },
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'this_year', label: 'This year' },
  { value: 'last_year', label: 'Last year' },
  { value: 'custom', label: 'Custom' },
];
