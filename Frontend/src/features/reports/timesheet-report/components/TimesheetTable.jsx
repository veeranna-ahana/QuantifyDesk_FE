import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";

const COLUMNS = [
  ["employeeId", "Emp ID", "whitespace-nowrap"],
  ["employeeName", "Emp Name", "whitespace-nowrap font-semibold"],
  ["designation", "Designation", "whitespace-nowrap"],
  ["projectCode", "Project Code", "whitespace-nowrap font-mono"],
  [
    "projectName",
    "Project Name",
    "whitespace-nowrap font-semibold text-action-primary",
  ],
  ["categoryCode", "Cat. Code", "whitespace-nowrap font-mono text-ink-muted"],
  ["category", "Category", "whitespace-nowrap"],
  ["taskDescription", "Task Description", "min-w-[220px]"],
  ["hoursSpent", "Hours Spent", "whitespace-nowrap text-right font-semibold"],
  ["fromDate", "From Date", "whitespace-nowrap"],
  ["toDate", "To Date", "whitespace-nowrap"],
  ["approvalStatus", "Approval Status", "whitespace-nowrap"],
  ["approvedBy", "Approved By", "whitespace-nowrap"],
  ["submittedOn", "Submitted On", "whitespace-nowrap"],
  ["approvedOn", "Approved On", "whitespace-nowrap"],
];

const STATUS_VARIANTS = {
  Approved: "success",
  Rejected: "danger",
  Pending: "brand",
  Mixed: "warning",
};

function formatDate(value) {
  if (!value) return "—";
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function TimesheetTable({ records, loading = false }) {
  return (
    <Table
      className="w-full min-w-[var(--size-timesheet-table-min-width)]"
      wrapperClassName="w-full"
    >
      <TableHead>
        <TableRow className="hover:bg-transparent">
          {COLUMNS.map(([, label]) => (
            <TableHeaderCell key={label} className="h-9 px-2 text-xs">
              {label}
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {records.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell
              colSpan={COLUMNS.length}
              className="py-8 text-center text-ink-muted"
            >
              {loading
                ? "Loading timesheet records..."
                : "No timesheet records match these filters."}
            </TableCell>
          </TableRow>
        ) : (
          records.map((record, index) => (
            <TableRow
              key={`${record.employeeId}-${record.projectCode}-${record.categoryCode}-${record.fromDate}-${index}`}
            >
              {COLUMNS.map(([key, , className]) => (
                <TableCell
                  key={key}
                  className={`px-2 py-1.5 text-xs text-ink-secondary ${className}`}
                >
                  {key === "approvalStatus" ? (
                    <Badge
                      variant={
                        STATUS_VARIANTS[record.approvalStatus] ?? "neutral"
                      }
                      size="sm"
                      dot
                    >
                      {record.approvalStatus || "—"}
                    </Badge>
                  ) : key === "hoursSpent" ? (
                    `${Number(record.hoursSpent || 0).toFixed(1)} hrs`
                  ) : key === "taskDescription" ? (
                    record.taskDescription || "—"
                  ) : key === "fromDate" ||
                    key === "toDate" ||
                    key === "submittedOn" ||
                    key === "approvedOn" ? (
                    formatDate(record[key])
                  ) : (
                    record[key] || "—"
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
