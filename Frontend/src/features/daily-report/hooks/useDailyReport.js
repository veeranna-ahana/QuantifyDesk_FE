import { useEffect, useMemo, useState } from "react";

import api from "@/api/axios";

const EMPTY_METRICS = {
  totalProjects: 0,
  notStartedTasks: 0,
  inProgressTasks: 0,
  lastCompleted: 0,
  totalCompleted: 0,
};
const EMPTY_TABS = [
  { key: "All", label: "All", count: 0 },
  { key: "In Progress", label: "In Progress", count: 0 },
  { key: "On Hold", label: "On Hold", count: 0 },
  { key: "Completed", label: "Completed", count: 0 },
];

const pad = (n) => String(n).padStart(2, "0");
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export function formatReportDate(dateStr) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  const label = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const prefix =
    dateStr === todayISO()
      ? "Today"
      : date.toLocaleDateString("en-US", { weekday: "short" });
  return `${prefix} • ${label}`;
}

function shiftISO(dateStr, days) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, (m || 1) - 1, (d || 1) + days);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toCsvRow(values) {
  return values
    .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
    .join(",");
}

/**
 * Daily Report data, scoped to a single calendar day.
 *
 * Pulls from the real GET /api/daily-reports/overview?date=YYYY-MM-DD endpoint
 * (dailyReport.controller.js's getDailyReportOverview). A task "belongs to" the
 * selected day when the day falls inside its PMS planned window
 * (planned_start_date <= date <= planned_end_date) — confirmed with the user.
 *
 * No mock fallback: if the request fails, metrics/tabs/projects stay empty and
 * `error` is set, rather than showing fabricated numbers.
 */
export function useDailyReport() {
  // The outer All / In Progress / On Hold / Completed tab bar was removed from the UI, so this
  // stays on "All" (no filter) — each project card has its own task filters instead.
  const [globalTab, setGlobalTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [reportDate, setReportDate] = useState(todayISO());

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/api/daily-reports/overview?date=${reportDate}`)
      .then((res) => {
        if (!cancelled) {
          setOverview(res.data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err.response?.data?.message || "Failed to load daily report data.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reportDate]);

  const metrics = overview?.metrics || EMPTY_METRICS;
  const tabs = overview?.global_tabs || EMPTY_TABS;

  const projects = useMemo(() => {
    const list = overview?.projects || [];
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.projectCode?.toLowerCase().includes(q) ||
        (p.tasks || []).some((t) =>
          [t.taskName, t.ownerName, t.remarks].some((v) =>
            (v || "").toLowerCase().includes(q),
          ),
        ),
    );
  }, [overview, searchQuery]);

  const shiftDate = (days) => setReportDate((prev) => shiftISO(prev, days));

  const exportCsv = () => {
    const rows = [
      toCsvRow([
        "Project",
        "Task",
        "Owner",
        "Role",
        "Task Type",
        "Unit",
        "Status",
        "Planned Start",
        "Planned End",
      ]),
    ];
    (overview?.projects || []).forEach((p) => {
      (p.tasks || []).forEach((t) => {
        rows.push(
          toCsvRow([
            p.name,
            t.taskName,
            t.ownerName,
            t.role,
            t.taskType,
            t.unit,
            t.status,
            t.plannedStart,
            t.plannedEnd,
          ]),
        );
      });
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily-report-${reportDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    metrics,
    tabs,
    projects,
    loading,
    error,
    globalTab,
    setGlobalTab,
    searchQuery,
    setSearchQuery,
    reportDate,
    setReportDate,
    shiftDate,
    exportCsv,
  };
}
