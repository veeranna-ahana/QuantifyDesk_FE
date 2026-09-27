import { AlertTriangle } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatCard } from '@/components/ui/StatCard';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table';
import { cn } from '@/lib/cn';
import { statusVariant } from '@/lib/status';

import { OVERVIEW_ALLOCATION, OVERVIEW_SUMMARY, OVERVIEW_TEAM } from '../mock/mockOverview';
import { formatProjectDate } from '../utils/formatProjectDate';

// Literal class names so Tailwind can see them.
const SLICE_FILL = ['fill-chart-1', 'fill-chart-2', 'fill-chart-3', 'fill-chart-4', 'fill-chart-5', 'fill-chart-6'];
const SWATCH_BG = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5', 'bg-chart-6'];

/** Pie chart drawn as plain SVG (no chart library needed). */
function PieChart({ members }) {
  const size = 160;
  const c = size / 2;
  const r = 62;
  const total = members.reduce((s, m) => s + m.tasks, 0);
  const starts = members.reduce((acc, m) => [...acc, acc[acc.length - 1] + (m.tasks / total) * 2 * Math.PI], [-Math.PI / 2]);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-40 w-40 overflow-visible" role="img" aria-label="Work allocation by team member">
      {members.map((m, i) => {
        const sweep = (m.tasks / total) * 2 * Math.PI;
        const [a1, a2] = [starts[i], starts[i + 1]];
        const [x1, y1] = [c + r * Math.cos(a1), c + r * Math.sin(a1)];
        const [x2, y2] = [c + r * Math.cos(a2), c + r * Math.sin(a2)];
        return <path key={m.name} d={`M ${c} ${c} L ${x1} ${y1} A ${r} ${r} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`} className={cn(SLICE_FILL[i % 6], 'stroke-white')} strokeWidth={2} />;
      })}
    </svg>
  );
}

/** Project Overview tab: summary tiles, work allocation pie, team table, allocation / timesheet table. */
export function ProjectOverview({ project }) {
  const o = OVERVIEW_SUMMARY;
  const name = project?.project_name || project?.projectName || project?.name || o.projectName;
  const code = project?.project_code || project?.projectCode || project?.code || project?.pmsId || o.projectCode;
  const status = project?.status || o.onTrackStatus;
  const risk = project?.risk || o.riskLevel;
  const completion = project?.completion ?? o.completion;
  const startDate = project?.start_date || project?.startDate;
  const endDate = project?.end_date || project?.endDate;

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-ink-primary">{name}</h2>
          <p className="text-xs text-ink-secondary">{code} · {project?.units ?? o.units} Units</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant(status)} dot>{status}</Badge>
          <Badge variant={risk === 'Critical' || risk === 'High' ? 'danger' : risk === 'Low' ? 'brand' : 'warning'}>{risk}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard centered size="md" label="Start Date" value={startDate ? formatProjectDate(startDate) : o.startDate} />
        <StatCard centered size="md" label="End Date" value={endDate ? formatProjectDate(endDate) : o.endDate} />
        <StatCard centered label="Completion" value={`${completion}%`} />
        <StatCard centered label="Team Members" value={o.teamMembersCount} />
        <StatCard centered label="Total Hours Allocated" value={`${o.totalHoursAllocated}h`} caption="Across 6 members" />
        <StatCard centered filled tone="danger" label="Total Hours Utilized" value={`${o.totalHoursUtilized}h`} caption={<span className="inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3" />OVER UTILIZED · {o.utilizationPercent}%</span>} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink-primary">Work Allocation</h3>
            <span className="text-[11px] text-ink-secondary">By team member</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <PieChart members={OVERVIEW_TEAM} />
            <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1">
              {OVERVIEW_TEAM.map((m, i) => (
                <li key={m.name} className="flex items-center gap-1.5 text-[11px] text-ink-secondary"><span className={cn('h-2.5 w-2.5 rounded-full', SWATCH_BG[i % 6])} />{m.name}</li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <h3 className="px-4 pt-4 text-sm font-semibold text-ink-primary">Team Members</h3>
          <Table className="mt-2">
            <TableHead>
              <TableRow className="hover:bg-transparent">
                <TableHeaderCell>Member</TableHeaderCell>
                {['Tasks', 'Logged', 'Done', 'Pending'].map((h) => <TableHeaderCell key={h} className="text-center">{h}</TableHeaderCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {OVERVIEW_TEAM.map((m) => (
                <TableRow key={m.name}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="text-center">{m.tasks}</TableCell>
                  <TableCell className="text-center">{m.logged}</TableCell>
                  <TableCell className="text-center font-semibold text-badge-success-ink">{m.done}</TableCell>
                  <TableCell className={cn('text-center font-semibold', m.pending === 0 ? 'text-badge-success-ink' : 'text-badge-warning-ink')}>{m.pending}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-semibold text-ink-primary">Task Allocation &amp; Timesheet Details</h3>
          <span className="text-[11px] text-ink-secondary">Per member breakdown</span>
        </div>
        <Table className="min-w-[980px]">
          <TableHead>
            <TableRow className="hover:bg-transparent">
              {['Team Member', 'Role', 'Units', 'Tasks', 'Completed', 'Pending', 'Alloc. Hours', 'Logged Hours', 'Variance', 'Progress', 'Status'].map((h) => <TableHeaderCell key={h}>{h}</TableHeaderCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            {OVERVIEW_ALLOCATION.map((r) => (
              <TableRow key={r.member}>
                <TableCell className="font-semibold">{r.member}</TableCell>
                <TableCell className="text-ink-secondary">{r.role}</TableCell>
                <TableCell className="font-semibold text-action-primary">{r.units}</TableCell>
                <TableCell>{r.tasks}</TableCell>
                <TableCell className="font-semibold text-badge-success-ink">{r.completed}</TableCell>
                <TableCell className={cn('font-semibold', r.pending === 0 ? 'text-badge-success-ink' : 'text-badge-warning-ink')}>{r.pending}</TableCell>
                <TableCell>{r.allocHours}</TableCell>
                <TableCell>{r.loggedHours}</TableCell>
                <TableCell className={cn('font-semibold', r.overrun ? 'text-badge-danger-ink' : 'text-badge-warning-ink')}>{r.variance}</TableCell>
                <TableCell><span className="flex items-center gap-2"><ProgressBar value={r.progress} tone="success" className="w-20" /><span className="text-xs font-medium">{r.progress}%</span></span></TableCell>
                <TableCell><Badge variant={statusVariant(r.status)} size="sm">{r.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
