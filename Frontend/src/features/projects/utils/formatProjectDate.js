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

// PMS timestamps ("2026-10-14T18:30:00.000Z") are real instants: 18:30Z == 00:00 IST of the
// NEXT day, i.e. the calendar date PMS means is 15 Oct. Convert in a fixed Asia/Kolkata zone so
// the result never depends on the viewer's browser timezone.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Parses either a plain "YYYY-MM-DD" (locally-owned dates), a MySQL "YYYY-MM-DD HH:mm:ss", or a
 * full PMS ISO timestamp. ISO timestamps are converted to their IST calendar date.
 */
function parseDateOnly(dateStr) {
  if (!dateStr) return null;
  const sql = /^(\d{4})-(\d{2})-(\d{2}) \d{2}:\d{2}/.exec(dateStr);
  if (sql)
    return { y: Number(sql[1]), m: Number(sql[2]) - 1, day: Number(sql[3]) };
  if (dateStr.includes("T")) {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return null;
    const ist = new Date(d.getTime() + IST_OFFSET_MS);
    return {
      y: ist.getUTCFullYear(),
      m: ist.getUTCMonth(),
      day: ist.getUTCDate(),
    };
  }
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return { y: d.getFullYear(), m: d.getMonth(), day: d.getDate() };
}

/** "2023-03-19" or "2023-03-19T18:30:00.000Z" -> "19 Mar, 2023" */
export const formatProjectDate = (dateStr) => {
  const p = parseDateOnly(dateStr);
  if (!p) return "—";
  return `${String(p.day).padStart(2, "0")} ${MONTHS_SHORT[p.m]}, ${p.y}`;
};

/** "2026-03-15" or "2023-03-19T18:30:00.000Z" -> "15 Mar 26" */
export const formatShortDate = (dateStr) => {
  const p = parseDateOnly(dateStr);
  if (!p) return "—";
  return `${String(p.day).padStart(2, "0")} ${MONTHS_SHORT[p.m]} ${String(p.y).slice(-2)}`;
};

/** "2026-04-27" or "2023-03-19T18:30:00.000Z" -> "27 Apr 2026" */
export const formatDayMonthYear = (dateStr) => {
  const p = parseDateOnly(dateStr);
  if (!p) return "—";
  return `${String(p.day).padStart(2, "0")} ${MONTHS_SHORT[p.m]} ${p.y}`;
};

export const formatDateRange = (startDate, endDate) =>
  `${formatProjectDate(startDate)} - ${formatProjectDate(endDate)}`;
