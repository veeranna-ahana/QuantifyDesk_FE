// Formatting + CSV helpers for the Member Details pages.

const MONTHS = [
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

/** "2021-08-03" / "2021-08-03T00:00:00.000Z" / "2021-08-03 10:00:00" -> "03-Aug-2021" ("—" when empty, raw text when unparseable). */
/** HRMS text arrives with HTML entities ("Automation &amp; Application"); show them as plain text. */
export function decodeEntities(value) {
  if (typeof value !== "string" || !value.includes("&")) return value;
  return new DOMParser().parseFromString(value, "text/html").documentElement
    .textContent;
}

export function formatDate(value) {
  if (!value) return "—";
  const text = String(value).trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
  if (m) return `${m[3]}-${MONTHS[Number(m[2]) - 1]}-${m[1]}`;
  const d = new Date(text);
  if (Number.isNaN(d.getTime())) return text;
  return `${String(d.getDate()).padStart(2, "0")}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
}

/** 4.8 -> "4.8 Years", 1 -> "1.0 Year" */
export function formatExperience(years) {
  if (years === null || years === undefined || years === "") return "—";
  const n = Number(years);
  if (Number.isNaN(n)) return "—";
  return `${n.toFixed(1)} ${n === 1 ? "Year" : "Years"}`;
}

/** API `available`: "immediate" | a date | null -> label shown in "Available From". */
export function formatAvailableFrom(value) {
  if (!value) return "—";
  return String(value).toLowerCase() === "immediate"
    ? "Immediate"
    : formatDate(value);
}

export const isImmediate = (member) =>
  String(member.available || "").toLowerCase() === "immediate";

export function downloadCsv(csv, filename) {
  // The BOM makes Excel read the file as UTF-8
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
