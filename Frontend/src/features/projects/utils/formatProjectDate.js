// src/features/projects/utils/formatProjectDate.js

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Parses either a plain "YYYY-MM-DD" (locally-owned dates) or a full PMS ISO timestamp like
 * "2023-03-19T18:30:00.000Z" (blindly appending "T00:00:00" to that, which is what this file
 * used to do, produces "...000ZT00:00:00" — not a valid date string, hence "Invalid Date").
 *
 * For a full ISO timestamp, reads UTC calendar fields rather than local ones: PMS's
 * "18:30:00.000Z" is really midnight IST stored as UTC, so a local getDate()/getMonth() in an
 * IST browser rolls it over to the next calendar day — same reasoning as mapPmsSync.js's
 * formatPmsDate, applied here too so the Projects table doesn't show dates one day ahead.
 */
function parseDateOnly(dateStr) {
  if (!dateStr) return null;
  if (dateStr.includes("T")) {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return null;
    return { y: d.getUTCFullYear(), m: d.getUTCMonth(), day: d.getUTCDate() };
  }
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return { y: d.getFullYear(), m: d.getMonth(), day: d.getDate() };
}

/** "2023-03-19" or "2023-03-19T18:30:00.000Z" -> "Mar 19, 2023" */
export const formatProjectDate = (dateStr) => {
  const p = parseDateOnly(dateStr);
  if (!p) return "—";
  return `${MONTHS_SHORT[p.m]} ${String(p.day).padStart(2, "0")}, ${p.y}`;
};

/** "2026-03-15" or "2023-03-19T18:30:00.000Z" -> "15 Mar 26" */
export const formatShortDate = (dateStr) => {
  const p = parseDateOnly(dateStr);
  if (!p) return "—";
  return `${String(p.day).padStart(2, "0")} ${MONTHS_SHORT[p.m]} ${String(p.y).slice(-2)}`;
};

export const formatDateRange = (startDate, endDate) =>
  `${formatProjectDate(startDate)} - ${formatProjectDate(endDate)}`;
