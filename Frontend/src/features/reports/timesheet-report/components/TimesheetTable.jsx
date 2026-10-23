import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

const COLUMNS = [
  { key: "employeeId", label: "Emp ID", minWidth: 80, sticky: "id" },
  { key: "employeeName", label: "Emp Name", minWidth: 120, sticky: "name" },
  { key: "designation", label: "Designation", minWidth: 140 },
  { key: "projectCode", label: "Project Code", minWidth: 100 },
  { key: "projectName", label: "Project Name", minWidth: 150 },
  { key: "categoryCode", label: "Cat. Code", minWidth: 100 },
  { key: "category", label: "Category", minWidth: 130 },
  { key: "taskDescription", label: "Task Description", minWidth: 280 },
  { key: "hoursSpent", label: "Hours Spent", minWidth: 90 },
  { key: "fromDate", label: "From Date", minWidth: 100 },
  { key: "toDate", label: "To Date", minWidth: 100 },
  { key: "approvalStatus", label: "Approval Status", minWidth: 120 },
  { key: "approvedBy", label: "Approved By", minWidth: 120 },
  { key: "submittedOn", label: "Submitted On", minWidth: 110 },
  { key: "approvedOn", label: "Approved On", minWidth: 110 },
];

// Sticky left offset for the Emp Name column (after the 80px Emp ID column)
const EMP_ID_WIDTH = 80;
const TABLE_MIN_WIDTH = COLUMNS.reduce((sum, col) => sum + col.minWidth, 0); // 1750px

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
  // Already in "DD MMM YYYY" form (e.g. "12 Mar 2026") — pass through.
  if (/^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$/.test(value)) return value;
  // "YYYY-MM-DD" -> "DD MMM YYYY"
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (isoMatch) {
    const monthNames = [
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
    const [, year, month, day] = isoMatch;
    const monthName = monthNames[Number(month) - 1];
    if (monthName) return `${Number(day)} ${monthName} ${year}`;
  }
  return value;
}

function StatusPill({ status }) {
  const normalized = String(status || "").toLowerCase();
  let variant = "neutral";
  let label = status || "—";

  if (normalized.includes("approv")) variant = "success";
  else if (normalized.includes("submit")) variant = "brand";
  else if (normalized.includes("pend")) variant = "warning";
  else if (normalized.includes("reject")) variant = "danger";
  else if (!status) return <span className="text-ink-muted">—</span>;

  return (
    <Badge variant={variant} shape="pill" size="sm" dot className="font-medium">
      {label}
    </Badge>
  );
}

export function TimesheetTable({ records = [], loading = false }) {
  const containerRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => setIsScrolled(el.scrollLeft > 2);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      containerRef.current.scrollLeft = 0;
    }
  }, [records]);

  const stickyShadow = isScrolled
    ? "shadow-[3px_0_6px_-2px_rgba(0,0,0,0.08)]"
    : "";

  return (
    <div
      ref={containerRef}
      className="h-full w-full flex-1 min-h-0 overflow-auto figma-table-scroll"
    >
      <table
        className="border-separate border-spacing-0 text-left text-[12px] leading-4"
        style={{
          minWidth: `${TABLE_MIN_WIDTH}px`,
          width: "100%",
          tableLayout: "fixed",
        }}
      >
        <colgroup>
          {COLUMNS.map((col) => (
            <col
              key={col.key}
              style={{
                minWidth: `${col.minWidth}px`,
                width: `${col.minWidth}px`,
              }}
            />
          ))}
        </colgroup>
        <thead className="sticky top-0 z-10">
          <tr>
            {COLUMNS.map((col) => {
              const isStickyId = col.sticky === "id";
              const isStickyName = col.sticky === "name";
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "h-[34px] whitespace-nowrap border-b border-line-table-head bg-surface-table-head px-2.5 text-[12px] font-semibold text-ink-secondary",
                    (isStickyId || isStickyName) &&
                      "sticky top-0 z-[12] !bg-surface-table-head",
                    isStickyName && stickyShadow,
                  )}
                  style={
                    isStickyId
                      ? { left: 0 }
                      : isStickyName
                        ? { left: `${EMP_ID_WIDTH}px` }
                        : undefined
                  }
                >
                  {col.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td
                colSpan={COLUMNS.length}
                className="py-8 px-4 text-center text-[12px] text-ink-muted"
              >
                {loading
                  ? "Loading timesheet records..."
                  : "No timesheet records match these filters."}
              </td>
            </tr>
          ) : (
            records.map((record, index) => {
              const rowKey = record.id
                ? `record-${record.id}`
                : `${valueFor(record, "employeeId")}-${record.projectCode}-${record.fromDate}-${index}`;

              return (
                <tr
                  key={rowKey}
                  className="group transition-colors hover:bg-surface-field-disabled"
                >
                  {COLUMNS.map((col) => {
                    const value = valueFor(record, col.key);
                    const isStickyId = col.sticky === "id";
                    const isStickyName = col.sticky === "name";
                    const baseCell =
                      "border-b border-[#F1F5F9] px-2.5 py-1.5 align-top text-[12px] whitespace-normal break-words";

                    if (isStickyId) {
                      return (
                        <td
                          key={col.key}
                          className={cn(
                            baseCell,
                            "sticky left-0 z-[2] bg-surface-card group-hover:bg-surface-field-disabled text-ink-muted",
                          )}
                        >
                          {value || "—"}
                        </td>
                      );
                    }
                    if (isStickyName) {
                      return (
                        <td
                          key={col.key}
                          className={cn(
                            baseCell,
                            "sticky z-[2] bg-surface-card group-hover:bg-surface-field-disabled font-semibold text-ink-primary",
                            stickyShadow,
                          )}
                          style={{ left: `${EMP_ID_WIDTH}px` }}
                        >
                          {value || "—"}
                        </td>
                      );
                    }

                    switch (col.key) {
                      case "designation":
                        return (
                          <td
                            key={col.key}
                            className={cn(baseCell, "text-ink-muted")}
                          >
                            {value || "—"}
                          </td>
                        );
                      case "projectCode":
                        return (
                          <td
                            key={col.key}
                            className={cn(
                              baseCell,
                              "font-mono text-[11px] text-ink-muted",
                            )}
                          >
                            {value || "—"}
                          </td>
                        );
                      case "projectName":
                        return (
                          <td key={col.key} className={baseCell} title={value}>
                            <span className="cursor-pointer font-medium text-badge-brand-ink transition-colors hover:text-action-primary-hover hover:underline">
                              {value || "—"}
                            </span>
                          </td>
                        );
                      case "categoryCode":
                        return (
                          <td
                            key={col.key}
                            className={cn(
                              baseCell,
                              "font-mono text-[11px] text-ink-muted/80",
                            )}
                          >
                            {value || "—"}
                          </td>
                        );
                      case "category":
                        return (
                          <td
                            key={col.key}
                            className={cn(baseCell, "text-ink-secondary")}
                          >
                            {value || "—"}
                          </td>
                        );
                      case "taskDescription":
                        return (
                          <td
                            key={col.key}
                            className={cn(baseCell, "text-ink-primary")}
                            title={value}
                          >
                            {value || "—"}
                          </td>
                        );
                      case "hoursSpent":
                        return (
                          <td
                            key={col.key}
                            className={cn(baseCell, "tabular-nums")}
                          >
                            {value !== "" && value != null ? (
                              <>
                                <span className="font-bold text-ink-primary">
                                  {value}
                                </span>
                                <span className="ml-0.5 text-[11px] text-ink-muted">
                                  {" "}
                                  hrs
                                </span>
                              </>
                            ) : (
                              "—"
                            )}
                          </td>
                        );
                      case "fromDate":
                      case "toDate":
                        return (
                          <td
                            key={col.key}
                            className={cn(baseCell, "text-ink-secondary")}
                          >
                            {formatDate(value)}
                          </td>
                        );
                      case "approvalStatus":
                        return (
                          <td
                            key={col.key}
                            className={cn(baseCell, "overflow-visible")}
                          >
                            <StatusPill status={value} />
                          </td>
                        );
                      case "approvedBy":
                        return (
                          <td
                            key={col.key}
                            className={cn(
                              baseCell,
                              "font-medium text-ink-secondary",
                            )}
                          >
                            {value || "—"}
                          </td>
                        );
                      case "submittedOn":
                        return (
                          <td
                            key={col.key}
                            className={cn(baseCell, "text-ink-muted")}
                          >
                            {formatDate(value)}
                          </td>
                        );
                      case "approvedOn": {
                        const status = String(
                          valueFor(record, "approvalStatus") || "",
                        ).toLowerCase();
                        const isApproved = status.includes("approv");
                        return (
                          <td
                            key={col.key}
                            className={cn(
                              baseCell,
                              isApproved
                                ? "font-medium text-badge-success-ink"
                                : "text-ink-muted",
                            )}
                          >
                            {value ? formatDate(value) : "-"}
                          </td>
                        );
                      }
                      default:
                        return (
                          <td key={col.key} className={baseCell}>
                            {value || "—"}
                          </td>
                        );
                    }
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
