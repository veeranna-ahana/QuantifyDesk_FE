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

const AVAILABILITY_STATUS_FIELDS = [
  "availability_status",
  "availabilityStatus",
  "availability",
  "allocation_status",
  "allocationStatus",
];
const ALLOCATION_FIELDS = [
  "allocation_percentage",
  "allocationPercentage",
  "allocated_percentage",
  "allocatedPercentage",
  "allocation",
];

function getAvailabilityValue(member) {
  return member.availabilityValue ?? member.available ?? "";
}

export function getAvailabilityStatus(member) {
  const statusText = AVAILABILITY_STATUS_FIELDS.map((field) => member[field])
    .find((value) => typeof value === "string" && value.trim())
    ?.trim()
    .toLowerCase();
  if (statusText) {
    if (statusText.includes("partial")) return "partial";
    if (statusText.includes("fully allocated") || statusText === "allocated") {
      return "allocated";
    }
    if (statusText.includes("available")) return "available";
  }

  const allocation = ALLOCATION_FIELDS.map((field) => member[field]).find(
    (value) => value !== null && value !== undefined && value !== "",
  );
  if (allocation !== undefined) {
    const percentage = Number(allocation);
    if (!Number.isNaN(percentage)) {
      if (percentage <= 0) return "available";
      if (percentage < 100) return "partial";
      return "allocated";
    }
  }

  const rawAvailable = String(getAvailabilityValue(member)).trim();
  if (!rawAvailable) return "unknown";
  if (rawAvailable.toLowerCase() === "immediate") return "available";
  return "allocated";
}

function parseAvailabilityDate(value) {
  const text = String(value || "").trim();
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
  if (dateOnly) {
    const date = new Date(
      Date.UTC(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])),
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
}

export function matchesMemberFilters(member, filters, today = new Date()) {
  const availabilityStatus = getAvailabilityStatus(member);
  if (
    filters.availabilityStatuses.length > 0 &&
    !filters.availabilityStatuses.includes(availabilityStatus)
  ) {
    return false;
  }

  const experience = Number(member.experience);
  if (filters.experience !== "all") {
    if (!Number.isFinite(experience)) return false;
    if (filters.experience === "under-3" && experience >= 3) return false;
    if (
      filters.experience === "3-to-5" &&
      (experience < 3 || experience >= 5)
    ) {
      return false;
    }
    if (filters.experience === "5-plus" && experience < 5) return false;
  }

  if (!filters.timing) return true;
  const rawAvailability = String(getAvailabilityValue(member)).trim();
  if (rawAvailability.toLowerCase() === "immediate") {
    return filters.timing === "immediate";
  }
  const availableDate = parseAvailabilityDate(rawAvailability);
  if (!availableDate) return false;
  const todayUtc = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  const daysUntilAvailable = Math.ceil(
    (availableDate.getTime() - todayUtc) / 86_400_000,
  );

  if (filters.timing === "immediate") {
    return daysUntilAvailable >= 0 && daysUntilAvailable <= 7;
  }
  if (filters.timing === "next-30-days") {
    return daysUntilAvailable > 7 && daysUntilAvailable <= 30;
  }
  return filters.timing === "future" && daysUntilAvailable > 30;
}

export function countMembersByAvailability(members) {
  return members.reduce(
    (counts, member) => {
      const status = getAvailabilityStatus(member);
      if (status in counts) counts[status] += 1;
      return counts;
    },
    { available: 0, partial: 0, allocated: 0 },
  );
}

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
