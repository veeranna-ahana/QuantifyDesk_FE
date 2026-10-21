import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { timesheetReportService } from "../services/timesheetReport.service";

const PAGE_SIZE = 10;

const EMPTY_FILTERS = { project: "", employee: "", startDate: "", endDate: "" };

const dateOnly = (value) => (value ? String(value).slice(0, 10) : "");

// The HRMS data arrives with HTML entities ("Automation &amp; Application"); show them as text
function decodeEntities(value) {
  if (typeof value !== "string" || !value.includes("&")) return value;
  return new DOMParser().parseFromString(value, "text/html").documentElement
    .textContent;
}

// One API row = one employee within one project category (already grouped by the backend)
function toRecord(row) {
  return {
    employeeId: row.employee_id,
    employeeName: decodeEntities(row.employee_name),
    designation: decodeEntities(row.designation),
    projectCode: row.project_code,
    projectName: decodeEntities(row.project_name),
    customerName: decodeEntities(row.customer_name),
    categoryCode: row.projectcategory_code,
    category: decodeEntities(row.projectcategory_name),
    parentCategory: decodeEntities(row.parent_category),
    taskDescription: decodeEntities(row.task_description || row.remarks),
    hoursSpent: Number(row.total_hours) || 0,
    approvedHours: Number(row.approved_hours) || 0,
    pendingHours: Number(row.pending_hours) || 0,
    rejectedHours: Number(row.rejected_hours) || 0,
    fromDate: dateOnly(row.from_date),
    toDate: dateOnly(row.to_date),
    approvalStatus: row.overall_status,
    approvedBy: decodeEntities(row.last_approved_by),
    submittedOn: dateOnly(row.last_submitted_on),
    approvedOn: dateOnly(row.last_approved_on),
  };
}

function csvRow(values) {
  return values
    .map((value) => {
      let text = String(value ?? "");
      if (/^[=+\-@]/.test(text)) text = `'${text}`; // keep Excel from reading it as a formula
      return `"${text.replace(/"/g, '""')}"`;
    })
    .join(",");
}

export function useTimesheetReport() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    timesheetReportService
      .getReport()
      .then((res) => {
        if (!active) return;
        const rows = (res.categories ?? []).flatMap((category) =>
          (category.data ?? []).map(toRecord),
        );
        setAllRecords(rows);
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err.response?.data?.message || "Failed to load the timesheet report",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const options = useMemo(() => {
    const projects = new Map();
    const employees = new Map();
    allRecords.forEach((record) => {
      if (record.projectCode)
        projects.set(
          record.projectCode,
          record.projectName || record.projectCode,
        );
      if (record.employeeId)
        employees.set(
          record.employeeId,
          record.employeeName || record.employeeId,
        );
    });
    const sorted = (map, key) =>
      [...map.entries()]
        .map(([id, name]) => ({ [key]: id, name }))
        .sort((a, b) => a.name.localeCompare(b.name));
    return {
      projects: sorted(projects, "code"),
      employees: sorted(employees, "id"),
    };
  }, [allRecords]);

  const filteredRecords = useMemo(
    () =>
      allRecords.filter(
        (record) =>
          (!filters.project || record.projectCode === filters.project) &&
          (!filters.employee || record.employeeId === filters.employee) &&
          (!filters.startDate || record.fromDate >= filters.startDate) &&
          (!filters.endDate || record.toDate <= filters.endDate),
      ),
    [allRecords, filters],
  );

  const summary = useMemo(
    () =>
      filteredRecords.reduce(
        (totals, record) => ({
          totalHours: totals.totalHours + record.hoursSpent,
          approvedHours: totals.approvedHours + record.approvedHours,
          pendingHours: totals.pendingHours + record.pendingHours,
          rejectedHours: totals.rejectedHours + record.rejectedHours,
        }),
        { totalHours: 0, approvedHours: 0, pendingHours: 0, rejectedHours: 0 },
      ),
    [filteredRecords],
  );

  const applyFilters = (nextFilters = draftFilters) => {
    if (
      nextFilters.startDate &&
      nextFilters.endDate &&
      nextFilters.startDate > nextFilters.endDate
    ) {
      toast.error("Start date must be on or before the end date", {
        id: "timesheet-date-range",
      });
      return;
    }
    setDraftFilters(nextFilters);
    setFilters(nextFilters);
    setPage(1);
  };

  const clearFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  // Exports every row matching the applied filters, not just the visible page
  const exportReport = () => {
    try {
      const all = filteredRecords;
      if (all.length === 0) {
        toast.error("No timesheet records to export");
        return;
      }

      const header = [
        "Emp ID",
        "Emp Name",
        "Designation",
        "Project Code",
        "Project Name",
        "Cat. Code",
        "Category",
        "Task Description",
        "Hours Spent",
        "From Date",
        "To Date",
        "Approval Status",
        "Approved By",
        "Submitted On",
        "Approved On",
      ];
      const rows = all.map((record) => [
        record.employeeId,
        record.employeeName,
        record.designation,
        record.projectCode,
        record.projectName,
        record.categoryCode,
        record.category,
        record.taskDescription,
        record.hoursSpent,
        record.fromDate,
        record.toDate,
        record.approvalStatus,
        record.approvedBy,
        record.submittedOn,
        record.approvedOn,
      ]);
      // The BOM makes Excel read the file as UTF-8
      const blob = new Blob(["﻿", [header, ...rows].map(csvRow).join("\r\n")], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `timesheet-report-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to export the report");
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;

  return {
    draftFilters,
    setDraftFilters,
    options,
    records: filteredRecords.slice(start, start + PAGE_SIZE),
    filteredRecords,
    totalRecords: filteredRecords.length,
    page: currentPage,
    pageSize: PAGE_SIZE,
    totalPages,
    summary,
    loading,
    error,
    applyFilters,
    clearFilters,
    setPage,
    exportReport,
  };
}
