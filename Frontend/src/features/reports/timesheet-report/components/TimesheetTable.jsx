import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/Table";

const COLUMNS = [
  ["employeeId", "Emp ID", "whitespace-nowrap"],
  ["employeeName", "Emp Name", "whitespace-nowrap font-semibold"],
  ["designation", "Designation", "whitespace-nowrap"],
  ["projectCode", "Project Code", "whitespace-nowrap font-mono"],
  ["projectName", "Project Name", "whitespace-nowrap font-semibold text-action-primary"],
  ["categoryCode", "Cat. Code", "whitespace-nowrap font-mono text-ink-muted"],
  ["category", "Category", "whitespace-nowrap"],
  ["taskDescription", "Task Description", "min-w-[var(--size-timesheet-task-description)] whitespace-nowrap text-ink-primary"],
  ["hoursSpent", "Hours Spent", "whitespace-nowrap text-right font-semibold"],
  ["fromDate", "From Date", "whitespace-nowrap"],
  ["toDate", "To Date", "whitespace-nowrap"],
  ["approvalStatus", "Approval Status", "whitespace-nowrap"],
  ["approvedBy", "Approved By", "whitespace-nowrap"],
  ["submittedOn", "Submitted On", "whitespace-nowrap"],
  ["approvedOn", "Approved On", "whitespace-nowrap"],
];

function formatDate(value) {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function TimesheetTable({ records }) {
  return (
    <Table className="min-w-[var(--size-timesheet-table-min-width)]" wrapperClassName="w-full">
      <TableHead>
        <TableRow className="hover:bg-transparent">
          {COLUMNS.map(([, label]) => (
            <TableHeaderCell key={label} className="h-8 px-2 text-[11px]">
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
              No timesheet records match these filters.
            </TableCell>
          </TableRow>
        ) : (
          records.map((record) => (
            <TableRow key={record.id}>
              {COLUMNS.map(([key, , className]) => (
                <TableCell
                  key={key}
                  className={`px-2 py-2 text-xs text-ink-secondary ${className}`}
                >
                  {key === "approvalStatus" ? (
                    <Badge
                      variant={record.approvalStatus === "Approved" ? "success" : "brand"}
                      size="sm"
                      dot
                    >
                      {record.approvalStatus}
                    </Badge>
                  ) : key === "hoursSpent" ? (
                    `${record.hoursSpent.toFixed(1)} hrs`
                  ) : key === "fromDate" || key === "toDate" || key === "submittedOn" || key === "approvedOn" ? (
                    formatDate(record[key])
                  ) : (
                    record[key]
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
