import { Check, RotateCw, Zap } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table';
import { cn } from '@/lib/cn';

const COLUMNS = ['Task Classification', 'Task', 'Owner', 'Role', 'Task Type', 'Unit', 'Risk Category', 'Planned Date', 'Actual & Variance', 'Remarks & Blockers'];

function ClassificationBadge({ value }) {
  const v = (value || '').toUpperCase();
  const base = 'font-bold uppercase tracking-wide';
  if (v.includes('LAST COMPLETED')) return <Badge variant="success" shape="chip" size="sm" className={base}><Check className="h-3 w-3" strokeWidth={3} />Last Completed</Badge>;
  if (v.includes('PROGRESS')) return <Badge variant="info" shape="chip" size="sm" className={base}><RotateCw className="h-3 w-3" strokeWidth={2.5} />In-Progress</Badge>;
  if (v.includes('BLOCKED')) return <Badge variant="danger" shape="chip" size="sm" className={base} dot>Blocked</Badge>;
  return <Badge variant="neutral" shape="chip" size="sm" className={base} dot>{v || 'Not Started'}</Badge>;
}

const Tag = ({ children }) => <Badge variant="neutral" shape="chip" size="sm">{children}</Badge>;

const VARIANCE_VARIANT = { success: 'success', warning: 'warning', neutral: 'neutral' };

/** "Awaiting: ..." / "Blocker: ..." get a coloured lead-in. */
function Remarks({ text }) {
  if (!text) return <span className="text-ink-muted">—</span>;
  const match = /^(awaiting:|blocker:)\s*(.*)$/i.exec(text);
  if (!match) return <span className="text-ink-secondary">{text}</span>;
  const isBlocker = match[1].toLowerCase() === 'blocker:';
  return (
    <span className="text-ink-secondary">
      <span className={cn('font-semibold', isBlocker ? 'text-badge-danger-ink' : 'text-badge-warning-ink')}>{text.slice(0, match[1].length)} </span>
      {match[2]}
    </span>
  );
}

/** Task matrix inside one project card. */
export function ReportTaskTable({ tasks }) {
  return (
    <Table className="min-w-[1180px]">
      <TableHead>
        <TableRow className="hover:bg-transparent">{COLUMNS.map((c) => <TableHeaderCell key={c}>{c}</TableHeaderCell>)}</TableRow>
      </TableHead>
      <TableBody>
        {tasks.length === 0 && <TableRow className="hover:bg-transparent"><TableCell colSpan={COLUMNS.length} className="py-10 text-center text-ink-muted">No tasks matching the selected filters.</TableCell></TableRow>}
        {tasks.map((t, i) => (
          <TableRow key={t.id || i} className="align-top">
            <TableCell><ClassificationBadge value={t.classification} /></TableCell>
            <TableCell className="min-w-[200px]">
              <div className="font-medium">{t.taskName}</div>
              {t.taskCode && <div className="text-[11px] text-ink-muted">{t.taskCode}</div>}
            </TableCell>
            <TableCell className="whitespace-nowrap font-medium">{t.ownerName}</TableCell>
            <TableCell><Tag>{t.role || t.ownerRole || 'Fullstack'}</Tag></TableCell>
            <TableCell><Tag>{t.taskType || 'Development'}</Tag></TableCell>
            <TableCell><Tag>{t.unit || '1 Unit'}</Tag></TableCell>
            <TableCell><Tag>{t.riskCategory || 'NA'}</Tag></TableCell>
            <TableCell className="whitespace-nowrap text-[11px]">
              <div className="font-medium">{t.plannedStart}</div>
              <div className="text-ink-muted">— {t.plannedEnd}</div>
            </TableCell>
            <TableCell className="whitespace-nowrap text-[11px]">
              <div className="font-medium">{t.actualLine1 || '—'}</div>
              <div className="text-ink-muted">{t.actualLine2}</div>
              {t.varianceBadge && (
                <Badge variant={VARIANCE_VARIANT[t.varianceBadge.type] ?? 'neutral'} shape="chip" size="sm" className="mt-1">
                  {t.varianceBadge.type !== 'neutral' && <Zap className="h-2.5 w-2.5" />}
                  {t.varianceBadge.label}
                </Badge>
              )}
            </TableCell>
            <TableCell className="min-w-[220px] text-[12px]"><Remarks text={t.remarks} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
