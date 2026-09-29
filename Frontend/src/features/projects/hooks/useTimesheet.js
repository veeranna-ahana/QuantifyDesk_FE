import { useEffect, useMemo, useState } from "react";

import { getCategoryTimesheets } from "../services/importProjectService";

export const TIMESHEET_PAGE_SIZE = 10;

/**
 * Timesheet Data tab: real HRMS data from GET /api/hrms/timesheets-by-category
 * (projectTimesheet.controller.js), scoped to this project's `sub_category`
 * (== HRMS's `projectcategory_code`) — the same value entered in Step 1 of the
 * Import Project wizard. That endpoint returns one row PER EMPLOYEE for the
 * category (aggregated across all their timesheet entries), not one row per
 * day/task entry, so the table columns reflect that real shape.
 *
 * If the project has no sub_category set, there's nothing to look up — no
 * fetch is made and the panel says so rather than showing stale/empty data.
 */
export function useTimesheet(projectcategoryCode) {
  const [employee, setEmployee] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [applied, setApplied] = useState({ employee: "", from: "", to: "" });
  const [page, setPage] = useState(1);

  const [rawRows, setRawRows] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalEntries: 0,
    totalEmployees: 0,
  });
  const [loading, setLoading] = useState(Boolean(projectcategoryCode));
  const [error, setError] = useState(null);

  useEffect(() => {
    // Nothing to fetch without a category — TimesheetPanel doesn't render the table in this
    // case anyway (see hasCategory below), so there's no need to reset rawRows/summary here.
    if (!projectcategoryCode) return;
    getCategoryTimesheets(projectcategoryCode)
      .then((data) => {
        // axiosInstance's response interceptor already unwraps to response.data (see
        // axiosInstance.js), so this resolved value IS the API body ({ success, total_hours,
        // data: [...] }) directly — NOT an axios response. Reading `res.data` here was a second,
        // incorrect unwrap that silently returned the employee array where an object was
        // expected, making every `data?.total_hours` / `data?.data` lookup below come back
        // undefined — the real cause of the "No timesheet records found" / all-zero totals bug.
        setError(null);
        setRawRows(data?.data || []);
        setSummary({
          total: data?.total_hours ?? 0,
          approved: data?.approved_hours ?? 0,
          pending: data?.pending_hours ?? 0,
          rejected: data?.rejected_hours ?? 0,
          totalEntries: data?.total_entries ?? 0,
          totalEmployees: data?.total_employees ?? 0,
        });
      })
      .catch((err) => {
        setRawRows([]);
        setError(
          err.response?.data?.message || "Failed to load timesheet data.",
        );
      })
      .finally(() => setLoading(false));
  }, [projectcategoryCode]);

  const employees = useMemo(
    () => [...new Set(rawRows.map((r) => r.employee_name).filter(Boolean))],
    [rawRows],
  );

  const rows = useMemo(
    () =>
      rawRows.filter((r) => {
        if (applied.employee && r.employee_name !== applied.employee)
          return false;
        if (
          applied.from &&
          r.to_date &&
          new Date(r.to_date) < new Date(applied.from)
        )
          return false;
        if (
          applied.to &&
          r.from_date &&
          new Date(r.from_date) > new Date(applied.to)
        )
          return false;
        return true;
      }),
    [rawRows, applied],
  );

  const isFiltered = Boolean(applied.employee || applied.from || applied.to);
  const apply = () => {
    setApplied({ employee, from, to });
    setPage(1);
  };
  const totalItems = rows.length;
  const pageRows = rows.slice(
    (page - 1) * TIMESHEET_PAGE_SIZE,
    page * TIMESHEET_PAGE_SIZE,
  );

  return {
    loading,
    error,
    hasCategory: Boolean(projectcategoryCode),
    employees,
    employee,
    setEmployee,
    from,
    setFrom,
    to,
    setTo,
    apply,
    isFiltered,
    rows: pageRows,
    summary,
    page,
    setPage,
    pageSize: TIMESHEET_PAGE_SIZE,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / TIMESHEET_PAGE_SIZE)),
  };
}
