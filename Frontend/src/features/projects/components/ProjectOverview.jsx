import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import { cn } from "@/lib/cn";
import { statusVariant } from "@/lib/status";

import { formatProjectDate } from "../utils/formatProjectDate";

// Literal class names so Tailwind can see them.
const SLICE_FILL = [
  "fill-chart-1",
  "fill-chart-2",
  "fill-chart-3",
  "fill-chart-4",
  "fill-chart-5",
  "fill-chart-6",
];
const SWATCH_BG = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
  "bg-chart-6",
];

const EMPTY_OVERVIEW = {
  team_members: [],
  task_allocation: [],
  team_members_count: 0,
  total_units: 0,
  total_hours_allocated: 0,
  total_hours_utilized: 0,
  completion_percent: 0,
  risk: null,
};

/**
 * Pie chart drawn as plain SVG (no chart library needed).
 * Sliced by Units (from each member's assigned task_info.unit total) — not task count — per the
 * effort-estimation-driven "Work Allocation" definition.
 */
function PieChart({ members }) {
  const size = 160;
  const c = size / 2;
  const r = 62;
  const total = members.reduce((s, m) => s + m.units, 0);
  if (total === 0) return null;
  const starts = members.reduce(
    (acc, m) => [...acc, acc[acc.length - 1] + (m.units / total) * 2 * Math.PI],
    [-Math.PI / 2],
  );
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-40 w-40 overflow-visible"
      role="img"
      aria-label="Work allocation by team member"
    >
      {members.map((m, i) => {
        const sweep = (m.units / total) * 2 * Math.PI;
        const [a1, a2] = [starts[i], starts[i + 1]];
        const [x1, y1] = [c + r * Math.cos(a1), c + r * Math.sin(a1)];
        const [x2, y2] = [c + r * Math.cos(a2), c + r * Math.sin(a2)];
        return (
          <path
            key={m.emp_id}
            d={`M ${c} ${c} L ${x1} ${y1} A ${r} ${r} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`}
            className={cn(SLICE_FILL[i % 6], "stroke-white")}
            strokeWidth={2}
          />
        );
      })}
    </svg>
  );
}

/**
 * Project Overview tab: summary tiles, work allocation pie, team table, allocation / timesheet
 * table. All real data now (from GET /api/import-project/:id's `project_info` + `overview`), no
 * mock fallback.
 *
 * Two things have no real source yet, and show 0/"—" rather than a guessed value:
 *   - Logged Hours (needs HRMS's per-project timesheet data — no confirmed link yet between our
 *     project_code and HRMS's own project_code)
 *   - Risk (PMS has no project-level risk field, and we don't store one locally either)
 */
export function ProjectOverview({ project, overview }) {
  const o = overview || EMPTY_OVERVIEW;
  const name = project?.project_name || "—";
  const code = project?.pms_id ? `PMS-${project.pms_id}` : "—";
  const status = project?.project_status || "—";
  const risk = o.risk; // null until there's a real source — see comment above
  // Planned vs Actual, shown separately — PMS tracks both independently, and a project that's
  // slipped will have them differ (e.g. actual_start_date after planned_start_date, or
  // actual_end_date not set yet on an in-progress project). Falls back to the old single
  // planned-only fields (start_date/end_date) if a not-yet-refreshed API response doesn't have
  // the explicit planned_/actual_ fields yet, so this doesn't regress on stale data.
  const plannedStart = project?.planned_start_date ?? project?.start_date;
  const plannedEnd = project?.planned_end_date ?? project?.end_date;
  const actualStart = project?.actual_start_date;
  const actualEnd = project?.actual_end_date;

  const utilizationPercent =
    o.total_hours_allocated > 0
      ? Math.round((o.total_hours_utilized / o.total_hours_allocated) * 100)
      : null;
  const overUtilized = utilizationPercent !== null && utilizationPercent > 100;

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-ink-primary">{name}</h2>
          <p className="text-xs text-ink-secondary">
            {code} · {o.total_units} Units
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant(status)} dot>
            {status}
          </Badge>
          {risk && (
            <Badge
              variant={
                risk === "Critical" || risk === "High"
                  ? "danger"
                  : risk === "Low"
                    ? "brand"
                    : "warning"
              }
            >
              {risk}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard
          centered
          size="md"
          label="Start Date"
          value={plannedStart ? formatProjectDate(plannedStart) : "—"}
          caption={`Actual: ${actualStart ? formatProjectDate(actualStart) : "—"}`}
        />
        <StatCard
          centered
          size="md"
          label="End Date"
          value={plannedEnd ? formatProjectDate(plannedEnd) : "—"}
          caption={`Actual: ${actualEnd ? formatProjectDate(actualEnd) : "—"}`}
        />
        <StatCard
          centered
          label="Completion"
          value={`${o.completion_percent}%`}
        />
        <StatCard centered label="Team Members" value={o.team_members_count} />
        <StatCard
          centered
          label="Total Hours Allocated"
          value={`${o.total_hours_allocated}h`}
          caption={`Across ${o.team_members_count} members`}
        />
        <StatCard
          centered
          filled={overUtilized}
          tone={overUtilized ? "danger" : undefined}
          label="Total Hours Utilized"
          value={`${o.total_hours_utilized}h`}
          caption={
            utilizationPercent === null
              ? "No logged hours yet"
              : `${overUtilized ? "OVER UTILIZED" : "Utilized"} · ${utilizationPercent}%`
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink-primary">
              Work Allocation
            </h3>
            <span className="text-[11px] text-ink-secondary">
              By team member
            </span>
          </div>
          {o.team_members.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-muted">
              No team members assigned yet.
            </p>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <PieChart members={o.team_members} />
              <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                {o.team_members.map((m, i) => (
                  <li
                    key={m.emp_id}
                    className="flex items-center gap-1.5 text-[11px] text-ink-secondary"
                  >
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        SWATCH_BG[i % 6],
                      )}
                    />
                    {m.emp_name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card className="overflow-hidden">
          <h3 className="px-4 pt-4 text-sm font-semibold text-ink-primary">
            Team Members
          </h3>
          <Table className="mt-2">
            <TableHead>
              <TableRow className="hover:bg-transparent">
                <TableHeaderCell>Member</TableHeaderCell>
                {["Tasks", "Logged", "Done", "Pending"].map((h) => (
                  <TableHeaderCell key={h} className="text-center">
                    {h}
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {o.team_members.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-sm text-ink-muted"
                  >
                    No team members assigned yet.
                  </TableCell>
                </TableRow>
              )}
              {o.team_members.map((m) => (
                <TableRow key={m.emp_id}>
                  <TableCell className="font-medium">
                    {m.emp_name || "—"}
                  </TableCell>
                  <TableCell className="text-center">{m.tasks}</TableCell>
                  <TableCell className="text-center">
                    {m.logged_hours}h
                  </TableCell>
                  <TableCell className="text-center font-semibold text-badge-success-ink">
                    {m.done}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-center font-semibold",
                      m.pending === 0
                        ? "text-badge-success-ink"
                        : "text-badge-warning-ink",
                    )}
                  >
                    {m.pending}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-semibold text-ink-primary">
            Task Allocation &amp; Timesheet Details
          </h3>
          <span className="text-[11px] text-ink-secondary">
            Per member breakdown
          </span>
        </div>
        <Table className="min-w-[980px]">
          <TableHead>
            <TableRow className="hover:bg-transparent">
              {[
                "Team Member",
                "Role",
                "Units",
                "Tasks",
                "Completed",
                "Pending",
                "Alloc. Hours",
                "Logged Hours",
                "Variance",
                "Progress",
                "Status",
              ].map((h) => (
                <TableHeaderCell key={h}>{h}</TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {o.task_allocation.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={11}
                  className="py-8 text-center text-sm text-ink-muted"
                >
                  No effort estimate rows yet.
                </TableCell>
              </TableRow>
            )}
            {o.task_allocation.map((r, i) => (
              <TableRow key={`${r.emp_id}-${r.role}-${i}`}>
                <TableCell className="font-semibold">
                  {r.emp_name || "—"}
                </TableCell>
                <TableCell className="text-ink-secondary">
                  {r.role || "—"}
                </TableCell>
                <TableCell className="font-semibold text-action-primary">
                  {r.units}
                </TableCell>
                <TableCell>{r.tasks}</TableCell>
                <TableCell className="font-semibold text-badge-success-ink">
                  {r.completed}
                </TableCell>
                <TableCell
                  className={cn(
                    "font-semibold",
                    r.pending === 0
                      ? "text-badge-success-ink"
                      : "text-badge-warning-ink",
                  )}
                >
                  {r.pending}
                </TableCell>
                <TableCell>{r.alloc_hours}h</TableCell>
                <TableCell>{r.logged_hours}h</TableCell>
                <TableCell className="text-ink-secondary">
                  {r.variance_hours ?? "—"}
                </TableCell>
                <TableCell>
                  {r.progress_percent === null ? (
                    <span className="text-ink-muted">—</span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ProgressBar
                        value={r.progress_percent}
                        tone="success"
                        className="w-20"
                      />
                      <span className="text-xs font-medium">
                        {r.progress_percent}%
                      </span>
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {r.status ? (
                    <Badge variant={statusVariant(r.status)} size="sm">
                      {r.status}
                    </Badge>
                  ) : (
                    <span className="text-ink-muted">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
