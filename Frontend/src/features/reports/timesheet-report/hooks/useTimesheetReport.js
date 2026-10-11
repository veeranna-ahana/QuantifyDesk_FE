import { useMemo, useState } from "react";

import { mockTimesheetRecords } from "../mock/mockTimesheetReport";

const PAGE_SIZE = 10;

function toCsvRow(values) {
  return values
    .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
    .join(",");
}

export function useTimesheetReport() {
  const [filters, setFilters] = useState({
    project: "",
    employee: "",
    startDate: "",
    endDate: "",
  });
  const [draftFilters, setDraftFilters] = useState(filters);
  const [page, setPage] = useState(1);

  const filteredRecords = useMemo(
    () =>
      mockTimesheetRecords.filter((record) => {
        const matchesProject =
          !filters.project || record.projectName === filters.project;
        const matchesEmployee =
          !filters.employee || record.employeeName === filters.employee;
        const matchesStart =
          !filters.startDate || record.fromDate >= filters.startDate;
        const matchesEnd = !filters.endDate || record.toDate <= filters.endDate;
        return (
          matchesProject && matchesEmployee && matchesStart && matchesEnd
        );
      }),
    [filters],
  );

  const summary = useMemo(
    () =>
      filteredRecords.reduce(
        (totals, record) => {
          totals.total += record.hoursSpent;
          if (record.approvalStatus === "Approved") {
            totals.approved += record.hoursSpent;
          } else {
            totals.pending += record.hoursSpent;
          }
          return totals;
        },
        { total: 0, approved: 0, pending: 0 },
      ),
    [filteredRecords],
  );

  const applyFilters = () => {
    setFilters(draftFilters);
    setPage(1);
  };

  const exportReport = () => {
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
    const rows = filteredRecords.map((record) =>
      [
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
      ],
    );
    const blob = new Blob(
      [[header, ...rows].map(toCsvRow).join("\n")],
      { type: "text/csv" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "timesheet-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const start = (page - 1) * PAGE_SIZE;

  return {
    draftFilters,
    setDraftFilters,
    records: filteredRecords.slice(start, start + PAGE_SIZE),
    totalRecords: filteredRecords.length,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE)),
    summary,
    applyFilters,
    setPage,
    exportReport,
  };
}
