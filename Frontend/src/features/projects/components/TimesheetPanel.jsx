import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import { statusVariant } from "@/lib/status";

import { useTimesheet } from "../hooks/useTimesheet";
import { formatProjectDate } from "../utils/formatProjectDate";

// One row per employee (aggregated across all their timesheet entries for this project
// category) — this is the real shape GET /api/hrms/timesheets-by-category returns, not a
// row per day/task entry.
const COLUMNS = [
  "Emp Id",
  "Emp Name",
  "Designation",
  "Department",
  "Project Code",
  "Category",
  "From Date",
  "To Date",
  "Total Hours",
  "Approved",
  "Pending",
  "Rejected",
  "Status",
  "Last Approved By",
  "Last Approved On",
];

/** Timesheet Data tab: filters, hour summary pills, per-employee table, pagination. */
export function TimesheetPanel({ projectcategoryCode }) {
  const ts = useTimesheet(projectcategoryCode);

  if (!ts.hasCategory) {
    return (
      <Card className="p-8 text-center text-sm text-ink-muted">
        No project category is set for this project, so there's nothing to look
        up in HRMS timesheets yet.
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-4 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <Select
            size="md"
            label="Select Employee"
            placeholder="Select Employee"
            value={ts.employee}
            options={ts.employees}
            onChange={(e) => ts.setEmployee(e.target.value)}
            wrapperClassName="w-44"
          />
          <Input
            size="md"
            type="date"
            label="From"
            value={ts.from}
            onChange={(e) => ts.setFrom(e.target.value)}
            wrapperClassName="w-40"
          />
          <Input
            size="md"
            type="date"
            label="To"
            value={ts.to}
            onChange={(e) => ts.setTo(e.target.value)}
            wrapperClassName="w-40"
          />
          <Button onClick={ts.apply}>Apply</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral" shape="chip" dot>
            Total Hours: {ts.summary.total} hrs
          </Badge>
          <Badge variant="success" shape="chip" dot>
            Approved: {ts.summary.approved} hrs
          </Badge>
          <Badge variant="warning" shape="chip" dot>
            Pending: {ts.summary.pending} hrs
          </Badge>
          <Badge variant="danger" shape="chip" dot>
            Rejected: {ts.summary.rejected} hrs
          </Badge>
        </div>
      </div>

      {ts.error && (
        <p className="px-4 pb-2 text-xs text-badge-danger-ink">{ts.error}</p>
      )}

      <Table
        className="min-w-[1400px]"
        wrapperClassName="max-h-[55vh] overflow-y-auto"
      >
        <TableHead>
          <TableRow className="hover:bg-transparent">
            {COLUMNS.map((c) => (
              <TableHeaderCell
                key={c}
                className="sticky top-0 z-20 bg-surface-table-head shadow-[0_1px_0_0_rgba(0,0,0,0.08)]"
              >
                {c}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {ts.loading && (
            <TableRow>
              <TableCell
                colSpan={COLUMNS.length}
                className="py-8 text-center text-ink-muted"
              >
                Loading timesheet data…
              </TableCell>
            </TableRow>
          )}
          {!ts.loading && ts.rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={COLUMNS.length}
                className="py-8 text-center text-ink-muted"
              >
                No timesheet records found.
              </TableCell>
            </TableRow>
          )}
          {!ts.loading &&
            ts.rows.map((r) => (
              <TableRow key={r.employee_id}>
                <TableCell className="font-semibold">
                  {r.employee_id || "—"}
                </TableCell>
                <TableCell className="font-medium">
                  {r.employee_name || "—"}
                </TableCell>
                <TableCell className="text-ink-secondary">
                  {r.designation || "—"}
                </TableCell>
                <TableCell className="text-ink-secondary">
                  {r.department || "—"}
                </TableCell>
                <TableCell>{r.project_code || "—"}</TableCell>
                <TableCell className="text-ink-secondary">
                  {r.projectcategory_name || r.projectcategory_code || "—"}
                </TableCell>
                <TableCell>
                  {r.from_date ? formatProjectDate(r.from_date) : "—"}
                </TableCell>
                <TableCell>
                  {r.to_date ? formatProjectDate(r.to_date) : "—"}
                </TableCell>
                <TableCell>{r.total_hours ?? 0} hrs</TableCell>
                <TableCell>{r.approved_hours ?? 0} hrs</TableCell>
                <TableCell>{r.pending_hours ?? 0} hrs</TableCell>
                <TableCell>{r.rejected_hours ?? 0} hrs</TableCell>
                <TableCell>
                  <Badge
                    variant={statusVariant(r.overall_status)}
                    dot
                    size="sm"
                  >
                    {r.overall_status || "—"}
                  </Badge>
                </TableCell>
                <TableCell>{r.last_approved_by || "—"}</TableCell>
                <TableCell className="text-ink-secondary">
                  {r.last_approved_on
                    ? formatProjectDate(r.last_approved_on)
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <Pagination
        page={ts.page}
        totalPages={ts.totalPages}
        totalItems={ts.totalItems}
        pageSize={ts.pageSize}
        onPageChange={ts.setPage}
        itemLabel="employees"
      />
    </Card>
  );
}
