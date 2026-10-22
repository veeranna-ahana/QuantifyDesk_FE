import { useEffect, useRef, useState } from "react";
import styles from "./DataTable.module.css";

const COLUMNS = [
  { key: "employeeId",     label: "Emp ID",          minWidth: 80,  sticky: "id" },
  { key: "employeeName",   label: "Emp Name",         minWidth: 120, sticky: "name" },
  { key: "designation",    label: "Designation",      minWidth: 140 },
  { key: "projectCode",    label: "Project Code",     minWidth: 100 },
  { key: "projectName",    label: "Project Name",     minWidth: 150 },
  { key: "categoryCode",   label: "Cat. Code",        minWidth: 100 },
  { key: "category",       label: "Category",         minWidth: 130 },
  { key: "taskDescription",label: "Task Description", minWidth: 280 },
  { key: "hoursSpent",     label: "Hours Spent",      minWidth: 90 },
  { key: "fromDate",       label: "From Date",        minWidth: 100 },
  { key: "toDate",         label: "To Date",          minWidth: 100 },
  { key: "approvalStatus", label: "Approval Status",  minWidth: 120 },
  { key: "approvedBy",     label: "Approved By",      minWidth: 120 },
  { key: "submittedOn",    label: "Submitted On",     minWidth: 110 },
  { key: "approvedOn",     label: "Approved On",      minWidth: 110 },
];

// Sticky left offset for Emp Name = Emp ID width (80px)
const EMP_ID_WIDTH = 80;

const FIELD_ALIASES = {
  employeeId:      "empId",
  employeeName:    "empName",
  categoryCode:    "catCode",
  taskDescription: "task",
  hoursSpent:      "hours",
  approvalStatus:  "status",
};

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function valueFor(record, key) {
  return record[key] ?? record[FIELD_ALIASES[key]] ?? "";
}

function formatDate(value) {
  if (!value) return "—";
  const str = String(value).trim();
  if (/^\d{2}\s+[A-Za-z]{3}\s+\d{4}$/.test(str)) {
    return str;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const [year, month, day] = str.slice(0, 10).split("-").map(Number);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const dd = String(day).padStart(2, "0");
      const mmm = MONTH_NAMES[month - 1];
      return `${dd} ${mmm} ${year}`;
    }
  }
  return str;
}

function StatusPill({ status }) {
  const normalized = String(status || "").trim().toLowerCase();
  const statusClass =
    normalized === "approved"
      ? styles.statusApproved
      : normalized === "submitted"
        ? styles.statusSubmitted
        : normalized === "pending"
          ? styles.statusPending
          : normalized === "rejected"
            ? styles.statusRejected
            : styles.statusOther;

  return (
    <span className={`${styles.statusPill} ${statusClass}`}>
      <span className={styles.statusDot} />
      <span className={styles.statusLabel}>{status || "—"}</span>
    </span>
  );
}

export function TimesheetTable({ records = [], loading = false }) {
  const containerRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleScroll = () => {
      setIsScrolled(el.scrollLeft > 2);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Reset vertical and horizontal scroll to 0 on every records change (mount + pagination + apply/clear)
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      containerRef.current.scrollLeft = 0;
      setIsScrolled(false);
    }
  }, [records]);

  return (
    <div className={styles.tableContainer} ref={containerRef}>
      <table className={styles.table}>
        <colgroup>
          {COLUMNS.map((col) => (
            <col
              key={col.key}
              style={{ minWidth: `${col.minWidth}px`, width: `${col.minWidth}px` }}
            />
          ))}
        </colgroup>
        <thead>
          <tr>
            {COLUMNS.map((col) => {
              let thClass = "";
              let thStyle = {};
              if (col.sticky === "id") {
                thClass = styles.stickyIdHeader;
                thStyle = { left: 0 };
              } else if (col.sticky === "name") {
                thClass = `${styles.stickyNameHeader} ${isScrolled ? styles.hasShadow : ""}`;
                thStyle = { left: `${EMP_ID_WIDTH}px` };
              }

              return (
                <th key={col.key} scope="col" className={thClass} style={thStyle}>
                  {col.label}
                </th>
              );
            })}
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
                key={
                  record.id
                    ? `record-${record.id}`
                    : `${valueFor(record, "employeeId")}-${record.projectCode}-${record.fromDate}-${index}`
                }
              >
                {COLUMNS.map((col) => {
                  const key = col.key;
                  const value = valueFor(record, key);
                  let className = "";
                  let tdStyle = {};
                  let content = value || "—";
                  let cellTitle = undefined;

                  if (col.sticky === "id") {
                    className = `${styles.employeeId} ${styles.stickyIdCell}`;
                    tdStyle = { left: 0 };
                    content = <span className={styles.empIdText}>{value || "—"}</span>;
                  } else if (col.sticky === "name") {
                    className = `${styles.employeeName} ${styles.stickyNameCell} ${isScrolled ? styles.hasShadow : ""}`;
                    tdStyle = { left: `${EMP_ID_WIDTH}px` };
                    content = <span className={styles.empNameText}>{value || "—"}</span>;
                  } else if (key === "designation") {
                    className = styles.designation;
                    content = <span className={styles.designationText}>{value || "—"}</span>;
                  } else if (key === "projectCode") {
                    className = styles.projectCode;
                    content = <span className={styles.projectCodeText}>{value || "—"}</span>;
                  } else if (key === "projectName") {
                    className = styles.projectName;
                    content = <span className={styles.projectNameLink}>{value || "—"}</span>;
                  } else if (key === "categoryCode") {
                    className = styles.categoryCode;
                    content = <span className={styles.catCodeText}>{value || "—"}</span>;
                  } else if (key === "category") {
                    className = styles.category;
                    content = <span className={styles.categoryText}>{value || "—"}</span>;
                  } else if (key === "taskDescription") {
                    className = styles.taskDescription;
                    cellTitle = String(value || "");
                    content = <span className={styles.taskText}>{value || "—"}</span>;
                  } else if (key === "hoursSpent") {
                    className = styles.hours;
                    const num = Number(value || 0).toFixed(1);
                    content = (
                      <span className={styles.hoursContent}>
                        <span className={styles.hoursValue}>{num}</span>
                        <span className={styles.hoursUnit}> hrs</span>
                      </span>
                    );
                  } else if (["fromDate", "toDate"].includes(key)) {
                    className = styles.dateMuted;
                    content = <span className={styles.dateText}>{formatDate(value)}</span>;
                  } else if (key === "approvalStatus") {
                    className = styles.statusCell;
                  } else if (key === "approvedBy") {
                    className = styles.approver;
                    content = <span className={styles.approverText}>{value || "—"}</span>;
                  } else if (key === "submittedOn") {
                    className = styles.submittedDate;
                    content = <span className={styles.submittedDateText}>{formatDate(value)}</span>;
                  } else if (key === "approvedOn") {
                    const isApproved = String(valueFor(record, "approvalStatus")).toLowerCase() === "approved";
                    className = isApproved ? styles.approvedDateSuccess : styles.approvedDateMuted;
                    content = (
                      <span className={isApproved ? styles.approvedDateTextSuccess : styles.approvedDateTextMuted}>
                        {value ? formatDate(value) : "-"}
                      </span>
                    );
                  }

                  return (
                    <td
                      key={key}
                      className={className}
                      style={tdStyle}
                      title={cellTitle}
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
