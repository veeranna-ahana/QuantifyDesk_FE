import { Fragment, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { useEmployeeCategoryDetails } from "../hooks/useEmployeeCategoryDetails";

const COLUMNS = [
  { key: "employeeId", label: "Emp ID", minWidth: 100, sticky: "id" },
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

const baseCell =
  "border-b border-[#F1F5F9] px-2.5 py-1.5 align-top text-[12px] whitespace-normal break-words";

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

function ChevronIcon({ open }) {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "transition-transform duration-150",
        open ? "rotate-90" : "rotate-0",
      )}
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

/* ---------- Sub-table that renders the drill-down rows ---------- */

const SUB_COLUMNS = [
  { key: "projectCode", label: "Project Code", width: 100 },
  { key: "hours",       label: "Hours",        width: 80  },
  { key: "fromDate",    label: "From Date",    width: 80 },
  { key: "toDate",      label: "To Date",      width: 80 },
  { key: "status",      label: "Status",       width: 80 },
  { key: "approvedBy",  label: "Approved By",  width: 100 },
  { key: "submittedOn", label: "Submitted On", width: 80 },
  { key: "approvedOn",  label: "Approved On",  width: 80 },
];

const SUB_MIN_WIDTH = SUB_COLUMNS.reduce((s, c) => s + c.width, 0); // 1010

function DetailSubTable({ records, loading, error }) {
  if (loading) {
    return (
      <div className="px-4 py-3 text-[12px] text-ink-muted">
        Loading timesheet details…
      </div>
    );
  }
  if (error) {
    return (
      <div className="m-3 rounded-md border border-badge-danger-line bg-badge-danger-bg px-3 py-1.5 text-[12px] leading-4 text-badge-danger-ink">
        {error}
      </div>
    );
  }
  if (!records.length) {
    return (
      <div className="px-4 py-3 text-[12px] text-ink-muted">
        No timesheet entries for this category.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border-y border-line-table-head bg-surface-subtle">
      <table
        className="border-separate border-spacing-0 text-left text-[12px] leading-4"
        style={{ minWidth: SUB_MIN_WIDTH, width: "100%", tableLayout: "fixed" }}
      >
        <colgroup>
          {SUB_COLUMNS.map((c) => (
            <col key={c.key} style={{ width: c.width }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {SUB_COLUMNS.map((c) => (
              <th
                key={c.key}
                scope="col"
                className="h-8 whitespace-nowrap border-b border-line-table-head bg-surface-table-head px-2.5 text-[11px] font-semibold text-ink-secondary"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr
              key={`${r.projectCode}-${r.fromDate}-${i}`}
              className="hover:bg-surface-field-disabled"
            >
              <td
                className="border-b border-[#F1F5F9] px-2.5 py-1.5 font-mono text-[11px] text-ink-muted overflow-hidden"
                title={r.projectCode}
              >
                <span className="block truncate">{r.projectCode || "—"}</span>
              </td>
              
              <td className="border-b border-[#F1F5F9] px-2.5 py-1.5 tabular-nums">
                <span className="font-bold text-ink-primary">
                  {r.hoursSpent}
                </span>
                <span className="ml-0.5 text-[11px] text-ink-muted"> hrs</span>
              </td>
              <td className="border-b border-[#F1F5F9] px-2.5 py-1.5 text-ink-secondary">
                {formatDate(r.fromDate)}
              </td>
              <td className="border-b border-[#F1F5F9] px-2.5 py-1.5 text-ink-secondary">
                {formatDate(r.toDate)}
              </td>
              <td className="border-b border-[#F1F5F9] px-2.5 py-1.5">
                <StatusPill status={r.approvalStatus} />
              </td>
              <td className="border-b border-[#F1F5F9] px-2.5 py-1.5 text-ink-secondary">
                {r.approvedBy || "—"}
              </td>
              <td className="border-b border-[#F1F5F9] px-2.5 py-1.5 text-ink-muted">
                {formatDate(r.submittedOn)}
              </td>
              <td className="border-b border-[#F1F5F9] px-2.5 py-1.5 text-ink-muted">
                {formatDate(r.approvedOn)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TimesheetTable({ records = [], loading = false }) {
  const containerRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedKey, setExpandedKey] = useState(null); // key -> bool
  const { load, get } = useEmployeeCategoryDetails();

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

  const toggleExpand = (record) => {
    const empId = record.employeeId;
    const cat = record.categoryCode;
    if (!empId || !cat) return;
    const key = `${empId}|${cat}`;

    // Toggle off if same row clicked again; otherwise open the new one only.
    setExpandedKey((prev) => (prev === key ? null : key));
    load(empId, cat);
  };

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

              const expandKey = `${record.employeeId}|${record.categoryCode}`;
              const isExpandable = !!record.employeeId && !!record.categoryCode;
              const isOpen = expandedKey === expandKey;
              const detail = get(record.employeeId, record.categoryCode);

              return (
                <Fragment key={rowKey}>
                  <tr className="group transition-colors hover:bg-surface-field-disabled">
                    {COLUMNS.map((col) => {
                      const value = valueFor(record, col.key);
                      const isStickyId = col.sticky === "id";
                      const isStickyName = col.sticky === "name";

                      if (isStickyId) {
                        return (
                          <td
                            key={col.key}
                            className={cn(
                              baseCell,
                              "sticky left-0 z-[2] bg-surface-card group-hover:bg-surface-field-disabled text-ink-muted",
                            )}
                          >
                            <div className="flex items-center gap-1">
                              {isExpandable ? (
                                <button
                                  type="button"
                                  aria-label={
                                    isOpen
                                      ? "Collapse details"
                                      : "Expand details"
                                  }
                                  aria-expanded={isOpen}
                                  onClick={() => toggleExpand(record)}
                                  className="flex h-4 w-4 flex-none items-center justify-center rounded text-ink-muted hover:bg-action-primary-soft hover:text-action-primary"
                                >
                                  <ChevronIcon open={isOpen} />
                                </button>
                              ) : (
                                <span className="inline-block h-4 w-4 flex-none" />
                              )}
                              <span>{value || "—"}</span>
                            </div>
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
                            <td
                              key={col.key}
                              className={baseCell}
                              title={value}
                            >
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
                  {isOpen && (
                    <tr>
                      <td
                        colSpan={COLUMNS.length}
                        className="p-0 bg-surface-card"
                      >
                        <DetailSubTable
                          records={detail?.records || []}
                          loading={detail?.loading}
                          error={detail?.error}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}