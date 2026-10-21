import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";

function formatHours(value) {
  return `${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} hrs`;
}

function formatMonth(value) {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en", {
    month: "short",
    year: "numeric",
  });
}

function ProjectCode({ children }) {
  return (
    <span className="inline-flex whitespace-nowrap rounded bg-action-primary-soft px-2 py-1 text-[11px] font-semibold text-action-primary">
      {children || "—"}
    </span>
  );
}

function EmptyRow({ columns, loading, label }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={columns}
        className="py-8 text-center text-ink-muted"
      >
        {loading ? "Loading report data..." : `No ${label} found.`}
      </TableCell>
    </TableRow>
  );
}

export function ProjectSummaryTable({ records, loading = false }) {
  const columns = [
    "Project Code",
    "Project Name",
    "Customer Name",
    "Members Worked",
    "Total Hrs",
    "Total Resource Cost",
    "Month Seen",
    "Parent Category",
  ];

  return (
    <Table className="min-w-[1100px]" wrapperClassName="w-full">
      <TableHead>
        <TableRow className="hover:bg-transparent">
          {columns.map((column) => (
            <TableHeaderCell
              key={column}
              className="h-11 whitespace-normal px-3 text-center text-[11px]"
            >
              {column}
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {records.length === 0 ? (
          <EmptyRow columns={columns.length} loading={loading} label="projects" />
        ) : (
          records.map((record) => (
            <TableRow key={record.projectCode || record.projectName}>
              <TableCell className="px-3 py-3">
                <ProjectCode>{record.projectCode}</ProjectCode>
              </TableCell>
              <TableCell className="min-w-[250px] px-3 py-3 font-medium">
                {record.projectName || "—"}
              </TableCell>
              <TableCell className="px-3 py-3 text-ink-secondary">
                {record.customerName || "—"}
              </TableCell>
              <TableCell className="px-3 py-3 text-center">
                <span className="inline-flex min-w-5 justify-center rounded-full bg-action-primary-soft px-1.5 py-1 text-[11px] font-semibold text-action-primary">
                  {record.memberCount}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap px-3 py-3 text-right font-semibold">
                {formatHours(record.totalHours)}
              </TableCell>
              <TableCell className="px-3 py-3 text-right text-ink-muted">
                —
              </TableCell>
              <TableCell className="px-3 py-3 text-center">
                <span className="rounded-full bg-surface-field-disabled px-2.5 py-1 text-[11px] font-medium text-ink-secondary">
                  {formatMonth(record.latestDate)}
                </span>
              </TableCell>
              <TableCell className="px-3 py-3 text-ink-secondary">
                {record.parentCategory || "—"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export function ResourceBreakdownTable({ records, loading = false }) {
  const columns = [
    "Project Code",
    "Project Name",
    "Customer Name",
    "Member ID",
    "Member Name",
    "Logged Hrs",
    "Billing Rate/Cost",
    "Parent Category",
  ];

  return (
    <Table className="min-w-[1100px]" wrapperClassName="w-full">
      <TableHead>
        <TableRow className="hover:bg-transparent">
          {columns.map((column) => (
            <TableHeaderCell
              key={column}
              className="h-11 whitespace-normal px-3 text-center text-[11px]"
            >
              {column}
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {records.length === 0 ? (
          <EmptyRow columns={columns.length} loading={loading} label="resources" />
        ) : (
          records.map((record, index) => (
            <TableRow
              key={`${record.employeeId}-${record.projectCode}-${record.categoryCode}-${index}`}
            >
              <TableCell className="px-3 py-2.5">
                <ProjectCode>{record.projectCode}</ProjectCode>
              </TableCell>
              <TableCell className="min-w-[270px] px-3 py-2.5 font-medium">
                {record.projectName || "—"}
              </TableCell>
              <TableCell className="px-3 py-2.5 text-ink-secondary">
                {record.customerName || "—"}
              </TableCell>
              <TableCell className="whitespace-nowrap px-3 py-2.5 font-mono text-ink-secondary">
                {record.employeeId || "—"}
              </TableCell>
              <TableCell className="whitespace-nowrap px-3 py-2.5 font-medium">
                {record.employeeName || "—"}
              </TableCell>
              <TableCell className="whitespace-nowrap px-3 py-2.5 text-right font-medium">
                {formatHours(record.hoursSpent)}
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right text-ink-muted">
                —
              </TableCell>
              <TableCell className="whitespace-nowrap px-3 py-2.5 text-ink-secondary">
                {record.parentCategory || record.category || "—"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
