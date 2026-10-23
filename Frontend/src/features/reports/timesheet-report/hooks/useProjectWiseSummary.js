import { useEffect, useMemo, useRef, useState } from "react";

import { timesheetReportService } from "../services/timesheetReport.service";
import { exportRowsAsCsv } from "../utils/exportCsv";

const EMPTY_FILTERS = { projectCode: "", projectName: "", parentCategory: "" };

// One API project = one project category, already aggregated by the backend.
function toProjectRow(project) {
  return {
    projectCode: project.projectCode,
    projectName: project.projectName,
    customerName: project.customerName,
    memberCount: Number(project.memberWorked) || 0,
    totalHours: Number(project.totalHours) || 0,
    firstMonthSeen:
      project.firstMonthSeen && project.firstMonthSeen !== "N/A"
        ? project.firstMonthSeen
        : null,
    parentCategory: project.parentCategory,
  };
}

// Backs the "Project-wise Summary" tab via GET /api/hrms/project-wise-summary.
// Note: this endpoint takes no query filters today — the Project/Employee/Date
// filter bar does not narrow this tab's data, only the main Timesheet Report tab.
//
// `enabled` lazy-loads this tab's data — it only fetches once the Project-wise
// Summary tab has actually been opened, instead of firing on every page load
// alongside the other two tabs. Once fetched, the result is kept (fetchedRef),
// so switching tabs back and forth doesn't refetch.
export function useProjectWiseSummary(enabled = true) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const fetchedRef = useRef(false);

  // The backend endpoint takes no query params, so Project Code / Project Name /
  // Project Category filtering for this tab is done client-side against the
  // already-fetched full dataset, same Apply/Clear pattern as the main tab.
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);

  useEffect(() => {
    if (!enabled || fetchedRef.current) return;
    fetchedRef.current = true;

    let active = true;
    setLoading(true);
    timesheetReportService
      .getProjectWiseSummary()
      .then((res) => {
        if (!active) return;
        setError(null);
        setRows((res.projects ?? []).map(toProjectRow));
      })
      .catch((err) => {
        if (!active) return;
        setRows([]);
        fetchedRef.current = false; // allow retry (e.g. revisiting the tab) after a failure
        const timedOut = err.code === "ECONNABORTED" || !err.response;
        setError(
          err.response?.data?.message ||
            (timedOut
              ? "Timed out loading the project-wise summary (the HRMS/PMS sync is slow). Try again."
              : "Failed to load the project-wise summary."),
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [enabled]);

  const options = useMemo(() => {
    const codes = new Map();
    const names = new Map();
    const categories = new Set();
    rows.forEach((row) => {
      if (row.projectCode) codes.set(row.projectCode, row.projectCode);
      if (row.projectName) names.set(row.projectName, row.projectName);
      if (row.parentCategory) categories.add(row.parentCategory);
    });
    const sorted = (map) =>
      [...map.entries()]
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => a.label.localeCompare(b.label));
    return {
      projectCodes: sorted(codes),
      projectNames: sorted(names),
      parentCategories: [...categories]
        .sort()
        .map((value) => ({ value, label: value })),
    };
  }, [rows]);

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (row) =>
          (!filters.projectCode || row.projectCode === filters.projectCode) &&
          (!filters.projectName || row.projectName === filters.projectName) &&
          (!filters.parentCategory ||
            row.parentCategory === filters.parentCategory),
      ),
    [rows, filters],
  );

  const applyFilters = (nextFilters = draftFilters) => {
    setDraftFilters(nextFilters);
    setFilters(nextFilters);
  };

  const clearFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
  };

  // Exports every row matching the applied filters, not just the visible page
  const exportReport = () => {
    exportRowsAsCsv({
      rows: filteredRows,
      header: [
        "Project Code",
        "Project Name",
        "Customer",
        "Members Worked",
        "Total Hours",
        "First Month Seen",
        "Project Category",
      ],
      toRow: (row) => [
        row.projectCode,
        row.projectName,
        row.customerName,
        row.memberCount,
        row.totalHours,
        row.firstMonthSeen,
        row.parentCategory,
      ],
      filenamePrefix: "project-wise-summary",
      emptyMessage: "No project-wise summary records to export",
    });
  };

  return {
    rows: filteredRows,
    totalRecords: filteredRows.length,
    loading,
    error,
    options,
    filters,
    draftFilters,
    setDraftFilters,
    applyFilters,
    clearFilters,
    exportReport,
  };
}
