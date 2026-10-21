import styles from "./DataTable.module.css";

const COLUMNS = [
  ["employeeId", "Emp ID", styles.timesheetEmpIdColumn],
  ["employeeName", "Emp Name", styles.timesheetEmpNameColumn],
  ["designation", "Designation", styles.timesheetDesignationColumn],
  ["projectCode", "Project Code", styles.timesheetProjectCodeColumn],
  ["projectName", "Project Name", styles.timesheetProjectNameColumn],
  ["categoryCode", "Cat. Code", styles.timesheetCategoryCodeColumn],
  ["category", "Category", styles.timesheetCategoryColumn],
  ["taskDescription", "Task Description", styles.timesheetTaskColumn],
  ["hoursSpent", "Hours Spent", styles.timesheetHoursColumn],
  ["fromDate", "From Date", styles.timesheetDateColumn],
  ["toDate", "To Date", styles.timesheetDateColumn],
  ["approvalStatus", "Approval Status", styles.timesheetStatusColumn],
  [
    "approvedBy",
    "Approved By",
    `${styles.timesheetApproverColumn} ${styles.timesheetOptionalColumn}`,
  ],
  [
    "submittedOn",
    "Submitted On",
    `${styles.timesheetSubmittedColumn} ${styles.timesheetOptionalColumn}`,
  ],
  ["approvedOn", "Approved On", styles.timesheetApprovedColumn],
];

const FIELD_ALIASES = {
  employeeId: "empId",
  employeeName: "empName",
  categoryCode: "catCode",
  taskDescription: "task",
  hoursSpent: "hours",
  approvalStatus: "status",
};

function valueFor(record, key) {
  return record[key] ?? record[FIELD_ALIASES[key]] ?? "";
}

function formatDate(value) {
  if (!value) return "—";
  if (!/^\d{4}-\d{2}-\d{2}/.test(String(value))) return value;
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusPill({ status }) {
  const statusClass =
    status === "Approved"
      ? styles.statusApproved
      : status === "Submitted"
        ? styles.statusSubmitted
        : styles.statusOther;

  return (
    <span className={`${styles.statusPill} ${statusClass}`}>
      <span className={styles.statusDot} />
      <span className={styles.statusLabel}>{status || "—"}</span>
    </span>
  );
}

export function TimesheetTable({ records = [], loading = false }) {
  return (
    <div className={`${styles.tableBody} ${styles.timesheetFrame}`}>
      <table className={styles.table}>
        <colgroup>
          {COLUMNS.map(([key, , columnClass]) => (
            <col key={key} className={columnClass} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {COLUMNS.map(([, label]) => (
              <th key={label} scope="col">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td className={styles.emptyCell} colSpan={COLUMNS.length}>
                {loading
                  ? "Loading timesheet records..."
                  : "No timesheet records match these filters."}
              </td>
            </tr>
          ) : (
            records.map((record, index) => (
              <tr
                key={`${valueFor(record, "employeeId")}-${record.projectCode}-${record.fromDate}-${index}`}
              >
                {COLUMNS.map(([key]) => {
                  const value = valueFor(record, key);
                  let className = "";
                  let content = value || "—";

                  if (key === "employeeId") className = styles.employeeId;
                  if (key === "employeeName") className = styles.employeeName;
                  if (key === "designation") className = styles.designation;
                  if (key === "projectCode") className = styles.projectCode;
                  if (key === "projectName") className = styles.projectName;
                  if (key === "categoryCode") className = styles.categoryCode;
                  if (key === "taskDescription") className = styles.taskDescription;
                  if (key === "hoursSpent") {
                    className = styles.hours;
                    content = `${Number(value || 0).toFixed(1)} hrs`;
                  }
                  if (["fromDate", "toDate"].includes(key)) {
                    className = `${styles.dateMuted} ${styles.nowrapCell}`;
                    content = formatDate(value);
                  }
                  if (key === "submittedOn") {
                    className = `${styles.submittedDate} ${styles.nowrapCell}`;
                    content = formatDate(value);
                  }
                  if (key === "approvedOn") {
                    className = `${styles.approvedDate} ${styles.nowrapCell}`;
                    content = value ? formatDate(value) : "-";
                  }
                  if (key === "employeeId") {
                    className = `${styles.employeeId} ${styles.nowrapCell}`;
                  }
                  if (key === "approvalStatus") {
                    className = "";
                  }
                  const fullText =
                    key === "approvalStatus" ? String(value || "—") : String(content);

                  return (
                    <td
                      key={key}
                      className={className}
                      title={fullText}
                    >
                      {key === "approvalStatus" ? (
                        <StatusPill status={value} />
                      ) : (
                        content
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
