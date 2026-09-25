import { ChevronDown, Pencil } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table';
import { statusVariant } from '@/lib/status';

const RISK_OPTIONS = ['No Dependency', 'Blocked', 'Dependency', 'Delayed'];

const COLUMNS = ['Task ID', 'Milestone', 'Task Title', 'Owner', 'Planned Start', 'Planned End', 'Actual Start', 'Actual End', 'Allocation', 'Status', 'Risk Category', 'Remark'];
const EDITABLE_COLUMNS = ['Role', 'Task Type', 'Unit'];

/**
 * Tasks of one milestone.
 * - onEdit: shows the pencil column (import + edit modes)
 * - editable: risk category and remark become inline inputs (edit mode)
 */
export function TaskTable({ tasks, onEdit, editable = false, onChange }) {
  return (
    <Table className="min-w-[1250px] whitespace-nowrap border-t border-line-card">
      <TableHead>
        <TableRow className="hover:bg-transparent">
          {COLUMNS.map((c) => <TableHeaderCell key={c}>{c}</TableHeaderCell>)}
          {EDITABLE_COLUMNS.map((c) => <TableHeaderCell key={c} className="text-action-primary">{c}</TableHeaderCell>)}
          {onEdit && <TableHeaderCell className="text-center">Action</TableHeaderCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {tasks.map((t) => (
          <TableRow key={t.id}>
            <TableCell className="font-mono text-xs text-ink-muted">{t.taskId}</TableCell>
            <TableCell>{t.milestoneShort || 'Discovery'}</TableCell>
            <TableCell className="font-semibold">{t.title}</TableCell>
            <TableCell>{t.owner}</TableCell>
            <TableCell>{t.plannedStart}</TableCell>
            <TableCell>{t.plannedEnd}</TableCell>
            <TableCell>{t.actualStart}</TableCell>
            <TableCell>{t.actualEnd ?? '—'}</TableCell>
            <TableCell className="font-semibold">{t.allocation}</TableCell>
            <TableCell><Badge variant={statusVariant(t.status)} size="sm">{t.status}</Badge></TableCell>
            <TableCell>
              {editable ? (
                <Select size="md" aria-label={`Risk category for ${t.taskId}`} value={t.riskCategory || 'No Dependency'} options={RISK_OPTIONS} onChange={(e) => onChange(t.id, { riskCategory: e.target.value })} className="text-xs" />
              ) : (
                <span className="inline-flex items-center gap-1 text-xs">{t.riskCategory || 'No Dependency'}<ChevronDown className="h-3 w-3 text-ink-muted" /></span>
              )}
            </TableCell>
            <TableCell>
              {editable ? (
                <Input size="md" aria-label={`Remark for ${t.taskId}`} placeholder="Add remark..." value={t.remark || ''} onChange={(e) => onChange(t.id, { remark: e.target.value })} className="text-xs" />
              ) : (
                <span className="text-xs text-ink-muted">{t.remark || 'Add remark...'}</span>
              )}
            </TableCell>
            <TableCell>{t.role}</TableCell>
            <TableCell>{t.taskType}</TableCell>
            <TableCell className="font-semibold">{t.unit}</TableCell>
            {onEdit && (
              <TableCell className="text-center">
                <IconButton label={`Edit ${t.taskId}`} onClick={() => onEdit(t)}><Pencil className="h-4 w-4" /></IconButton>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
