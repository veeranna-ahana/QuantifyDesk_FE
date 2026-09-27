import { ChevronDown, Search } from "lucide-react";
import { Fragment } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Select } from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import { cn } from "@/lib/cn";

import { EMPLOYEE_ROLE_FILTERS } from "../mock/mockDashboard";
import { EmployeeDetails } from "./EmployeeDetails";

const utilTone = (pct) =>
  pct >= 100 ? "danger" : pct >= 80 ? "success" : "warning";
const UTIL_TEXT = {
  danger: "text-badge-danger-ink",
  success: "text-badge-success-ink",
  warning: "text-badge-warning-ink",
};
const HEAD =
  "bg-surface-card text-[11px] font-medium uppercase tracking-wider text-ink-muted";

export function EmployeeUtilization({ d }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-card p-3">
        <div>
          <h2 className="text-sm font-semibold text-ink-primary">
            Employee Utilization
          </h2>
          <p className="text-xs text-ink-muted">
            {d.employees.length} resources shown · click a row for details
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            aria-label="Search employee"
            placeholder="Search employee…"
            leadingIcon={<Search className="h-4 w-4" />}
            value={d.employeeSearch}
            onChange={(e) => d.setEmployeeSearch(e.target.value)}
            size="sm"
            wrapperClassName="w-48"
          />
          <Select
            aria-label="Role"
            size="sm"
            options={EMPLOYEE_ROLE_FILTERS}
            value={d.roleFilter}
            onChange={(e) => d.setRoleFilter(e.target.value)}
            wrapperClassName="w-36"
          />
        </div>
      </div>
      <Table className="min-w-[860px]">
        <TableHead>
          <TableRow className="hover:bg-transparent">
            <TableHeaderCell className={HEAD}>Employee</TableHeaderCell>
            <TableHeaderCell className={HEAD}>
              Assigned Projects
            </TableHeaderCell>
            <TableHeaderCell className={HEAD}>
              Occupied Days &amp; Window
            </TableHeaderCell>
            <TableHeaderCell className={HEAD}>
              Total Utilization
            </TableHeaderCell>
            <TableHeaderCell className={cn(HEAD, "w-12")}>
              <span className="sr-only">Expand</span>
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {d.employees.map((e) => {
            const open = d.expandedId === e.id;
            const tone = utilTone(e.utilPct);
            return (
              <Fragment key={e.id}>
                <TableRow
                  className={cn(
                    "cursor-pointer",
                    open && "bg-surface-field-disabled",
                  )}
                  onClick={() => d.toggleExpanded(e.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={e.name} size="lg" />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{e.name}</span>
                        <span className="text-[11px] text-ink-muted">
                          {e.id}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {e.projects?.length ? (
                        e.projects.map((p) => (
                          <Badge
                            key={p}
                            variant="neutral"
                            shape="chip"
                            size="sm"
                            className="text-[10px] font-semibold"
                          >
                            {p}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-ink-muted">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[200px]">
                    <div className="text-xs font-medium">{e.days}</div>
                    {e.window && (
                      <div className="text-[11px] text-ink-muted">
                        {e.window}
                      </div>
                    )}
                    <ProgressBar
                      value={e.windowPct ?? 70}
                      className="mt-1.5 h-1"
                    />
                  </TableCell>
                  <TableCell className="min-w-[180px]">
                    <div className="flex items-center gap-2">
                      <ProgressBar
                        value={e.utilPct}
                        tone={tone}
                        className="w-28"
                      />
                      <span
                        className={cn("text-xs font-bold", UTIL_TEXT[tone])}
                      >
                        {e.utilPct}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-chip",
                        open
                          ? "bg-badge-brand-bg text-action-primary"
                          : "text-ink-muted",
                      )}
                    >
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          "h-3.5 w-3.5 transition-transform",
                          open && "rotate-180",
                        )}
                      />
                    </span>
                  </TableCell>
                </TableRow>
                {open && (
                  <tr>
                    <td
                      colSpan={5}
                      className="border-b border-line-card bg-surface-card px-4 pb-4 pt-2"
                    >
                      <EmployeeDetails employee={e} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
          {d.employees.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={5}
                className="py-8 text-center text-ink-muted"
              >
                No employees match your search.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
