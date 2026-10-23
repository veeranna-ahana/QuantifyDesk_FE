import { useEffect, useMemo, useRef, useState } from "react";

import { timesheetReportService } from "../services/timesheetReport.service";

const EMPTY_FILTERS = { projectCode: "", projectName: "", memberName: "" };

// One API resource = one employee within one project category, already
// aggregated by the backend.
function toResourceRow(resource) {
  return {
    projectCode: resource.projectCode,
    projectName: resource.projectName,
    customer: resource.customerName,
    memberId: resource.Emp_id,
    memberName: resource.Emp_Name,
    hours: Number(resource.loggedHours) || 0,
    category: resource.parentCategory,
  };
}

// Backs the "Resource Breakdown" tab via GET /api/hrms/resource-breakdown.
// Note: this endpoint takes no query filters today — the Project/Employee/Date
// filter bar does not narrow this tab's data, only the main Timesheet Report tab.
//
// `enabled` lazy-loads this tab's data — it only fetches once the Resource
// Breakdown tab has actually been opened, instead of firing on every page
// load alongside the other two tabs. Once fetched, the result is kept
// (fetchedRef), so switching tabs back and forth doesn't refetch.
export function useResourceBreakdown(enabled = true) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const fetchedRef = useRef(false);

  // The backend endpoint takes no query params, so Project Code / Project Name /
  // Member Name filtering for this tab is done client-side against the
  // already-fetched full dataset, same Apply/Clear pattern as the other tabs.
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);

  useEffect(() => {
    if (!enabled || fetchedRef.current) return;
    fetchedRef.current = true;

    let active = true;
    setLoading(true);
    timesheetReportService
      .getResourceBreakdown()
      .then((res) => {
        if (!active) return;
        setError(null);
        setRows((res.resources ?? []).map(toResourceRow));
      })
      .catch((err) => {
        if (!active) return;
        setRows([]);
        fetchedRef.current = false; // allow retry (e.g. revisiting the tab) after a failure
        const timedOut = err.code === "ECONNABORTED" || !err.response;
        setError(
          err.response?.data?.message ||
            (timedOut
              ? "Timed out loading the resource breakdown (the HRMS/PMS sync is slow). Try again."
              : "Failed to load the resource breakdown."),
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
    const members = new Map();
    rows.forEach((row) => {
      if (row.projectCode) codes.set(row.projectCode, row.projectCode);
      if (row.projectName) names.set(row.projectName, row.projectName);
      if (row.memberName) members.set(row.memberName, row.memberName);
    });
    const sorted = (map) =>
      [...map.entries()]
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => a.label.localeCompare(b.label));
    return {
      projectCodes: sorted(codes),
      projectNames: sorted(names),
      memberNames: sorted(members),
    };
  }, [rows]);

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (row) =>
          (!filters.projectCode || row.projectCode === filters.projectCode) &&
          (!filters.projectName || row.projectName === filters.projectName) &&
          (!filters.memberName || row.memberName === filters.memberName),
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
  };
}
