import { Eye } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table';
import { statusVariant } from '@/lib/status';

import { formatShortDate } from '../utils/formatProjectDate';

const PROJECT_TYPES = ['Time & Material', 'Fixed Price', 'Retainer Contract', 'Internal RnD', 'One Time Project'];
/** Deterministic project type from pmsId (placeholder until the API returns it). */
const projectType = (pmsId) => PROJECT_TYPES[parseInt(pmsId?.replace(/\D/g, '') || '0', 10) % PROJECT_TYPES.length];

function TimelineRow({ label, from, to, running }) {
  return (
    <div className="flex items-center gap-2 text-xs text-ink-secondary">
      <span className="w-8 font-semibold text-ink-primary">{label}</span>
      <span>{from}</span>
      <span aria-hidden="true" className="h-px w-2 bg-line" />
      {running ? <span className="font-medium text-badge-warning-ink">Running</span> : <span>{to}</span>}
    </div>
  );
}

const COLS = ['Project', 'Customer/O2D/NBD ID', 'Timeline', 'Owner', 'Status', 'Action'];

export function ProjectsTable({ projects, loading, error, pageSize, onView }) {
  return (
    <Table className="min-w-[860px]">
      <TableHead>
        <TableRow className="hover:bg-transparent">
          {COLS.map((c, i) => (
            <TableHeaderCell key={c} className={i === 4 ? 'text-center' : i === 5 ? 'text-right' : undefined}>{c}</TableHeaderCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {loading &&
          Array.from({ length: pageSize }).map((_, i) => (
            <TableRow key={i} className="hover:bg-transparent">
              <TableCell><div className="flex flex-col gap-1.5"><Skeleton className="h-2.5 w-16" /><Skeleton className="h-3 w-32" /><Skeleton className="h-2.5 w-24" /></div></TableCell>
              <TableCell><div className="flex flex-col gap-1.5"><Skeleton className="h-3 w-32" /><Skeleton className="h-2.5 w-24" /></div></TableCell>
              <TableCell><div className="flex flex-col gap-1.5"><Skeleton className="h-3 w-40" /><Skeleton className="h-3 w-40" /></div></TableCell>
              <TableCell><Skeleton className="h-3 w-16" /></TableCell>
              <TableCell><Skeleton className="mx-auto h-5 w-20" /></TableCell>
              <TableCell />
            </TableRow>
          ))}

        {!loading && error && (
          <TableRow className="hover:bg-transparent"><TableCell colSpan={6} className="py-8 text-center text-badge-danger-ink">{error}</TableCell></TableRow>
        )}
        {!loading && !error && projects.length === 0 && (
          <TableRow className="hover:bg-transparent"><TableCell colSpan={6} className="py-8 text-center text-ink-muted">No projects match your search.</TableCell></TableRow>
        )}

        {!loading && !error && projects.map((p) => {
          const planStart = formatShortDate(p.startDate);
          return (
            <TableRow key={p.id}>
              <TableCell>
                <div className="text-[11px] text-ink-muted">ID: {p.pmsId}</div>
                <div className="font-semibold text-ink-primary">{p.projectName}</div>
                <div className="text-[11px] text-ink-muted">Project Type: {projectType(p.pmsId)}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{p.customer}</div>
                <div className="text-[11px] text-ink-muted">O2D: d01234 &nbsp; NBD: d01234</div>
              </TableCell>
              <TableCell>
                <TimelineRow label="PLAN" from={planStart} to={formatShortDate(p.endDate)} />
                <TimelineRow label="ACT" from={p.actualStartDate ? formatShortDate(p.actualStartDate) : planStart} to={formatShortDate(p.endDate)} running={p.status === 'In Progress'} />
              </TableCell>
              <TableCell>{p.owner}</TableCell>
              <TableCell className="text-center"><Badge variant={statusVariant(p.status)}>{p.status}</Badge></TableCell>
              <TableCell className="text-right">
                <IconButton label={`View ${p.projectName}`} onClick={() => onView(p)}><Eye className="h-4 w-4" /></IconButton>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
