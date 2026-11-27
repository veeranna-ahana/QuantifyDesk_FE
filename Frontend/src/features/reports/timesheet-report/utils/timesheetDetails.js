const dateOnly = (value) => {
  if (!value) return "";
  const s = String(value).trim();
  // Backend sends DD/MM/YYYY. Normalize to YYYY-MM-DD so existing
  // TimesheetTable's formatDate() renders it consistently.
  const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (ddmmyyyy) {
    const [, dd, mm, yyyy] = ddmmyyyy;
    return `${yyyy}-${mm}-${dd}`;
  }
  return s.slice(0, 10);
};

function decodeEntities(value) {
  if (typeof value !== "string" || !value.includes("&")) return value;
  return new DOMParser().parseFromString(value, "text/html").documentElement
    .textContent;
}

/**
 * Maps one raw ProjectDetails entry from
 * /timesheets-app-dev-designation-employee-category into the same shape
 * TimesheetTable already understands (see toRecord in useTimesheetReport).
 */
export function toDetailRecord(raw, header = {}) {
  const hoursSpent = Number(raw.number_of_hours) || 0;
  const status = raw.approval_status || "";
  const normalized = status.toLowerCase();

  return {
    employeeId: header.employee_id || "",
    employeeName: decodeEntities(header.employee_name) || "",
    designation: decodeEntities(header.designation) || "",
    projectCode: raw.project_code || "",
    projectName: decodeEntities(raw.project_name) || "",
    categoryCode: raw.projectcategory_code || "",
    category: decodeEntities(raw.projectcategory_name) || "",
    taskDescription: decodeEntities(raw.task_description || raw.remarks) || "",
    hoursSpent,
    fromDate: dateOnly(raw["From Date"]),
    toDate: dateOnly(raw["To Date"]),
    approvalStatus: status,
    approvedBy: decodeEntities(raw.approved_by) || "",
    submittedOn: dateOnly(raw.submitted_on),
    approvedOn: dateOnly(raw.approved_on),
    // For the status-based hour split, one raw entry is entirely one status
    approvedHours: normalized === "approved" ? hoursSpent : 0,
    pendingHours: normalized === "pending" ? hoursSpent : 0,
    rejectedHours: normalized === "rejected" ? hoursSpent : 0,
  };
}