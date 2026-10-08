// src/lib/date.js

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Formats a date string (YYYY-MM-DD or ISO string) to DD-MMM-YYYY (e.g. 10-Sep-2026).
 * Returns '—' for empty/invalid values.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';

  // Fast path for plain YYYY-MM-DD format
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-');
    const mIdx = parseInt(month, 10) - 1;
    if (mIdx >= 0 && mIdx <= 11) {
      return `${day}-${MONTHS_SHORT[mIdx]}-${year}`;
    }
  }

  // Fallback for full ISO dates or timestamp strings
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;

  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = MONTHS_SHORT[d.getUTCMonth()];
  const year = d.getUTCFullYear();

  return `${day}-${month}-${year}`;
}
