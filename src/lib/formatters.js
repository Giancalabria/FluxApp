/**
 * Format a number as currency.
 * @param {number} amount
 * @param {string} currency – ISO 4217 code (ARS, USD, …)
 */
export function formatCurrency(amount, currency = 'ARS') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string to a readable locale format.
 * @param {string|Date} date
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Abbreviate a number (e.g. 15400 → "15.4k").
 */
export function abbreviateNumber(n) {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return n.toFixed(2);
}
