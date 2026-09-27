import { ArrowRight, Check, Pencil, Plus, UserMinus, X } from 'lucide-react';
import { Fragment, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table';
import { EXISTING_EFFORT_ROWS, IMPORT_EFFORT_ROWS } from '@/features/projects/mock/mockEffort';
import { MOCK_PROJECT_CONTEXT } from '@/features/projects/mock/mockTasks';

import { formatHrs, toHrs, useEffortEstimate } from '../hooks/useEffortEstimate';

import { ProjectContextBar } from './ProjectContextBar';

const DAYS_INPUT = 'w-16 text-center';

/** Inline "new member" row shown under a role's Add Member button. */
function PendingRow({ available, onConfirm, onCancel }) {
  const [name, setName] = useState('');
  const [effortDays, setEffortDays] = useState('');
  const [bufferDays, setBufferDays] = useState('');
  return (
    <TableRow className="bg-action-primary-soft hover:bg-action-primary-soft">
      <TableCell>
        <Select size="md" aria-label="Select member" placeholder="Select member" value={name} options={available} onChange={(e) => setName(e.target.value)} />
      </TableCell>
      <TableCell className="text-center"><Input size="md" type="number" min="0" aria-label="Effort days" value={effortDays} onChange={(e) => setEffortDays(e.target.value)} wrapperClassName="mx-auto w-16" className={DAYS_INPUT} /></TableCell>
      <TableCell className="text-center">{formatHrs(toHrs(effortDays))}</TableCell>
      <TableCell className="text-center"><Input size="md" type="number" min="0" aria-label="Buffer days" value={bufferDays} onChange={(e) => setBufferDays(e.target.value)} wrapperClassName="mx-auto w-16" className={DAYS_INPUT} /></TableCell>
      <TableCell className="text-center">{formatHrs(toHrs(bufferDays))}</TableCell>
      <TableCell className="text-center">{formatHrs(toHrs(effortDays) + toHrs(bufferDays))}</TableCell>
      <TableCell className="text-right">
        <span className="inline-flex gap-1">
          <IconButton label="Cancel" variant="neutral" onClick={onCancel}><X className="h-4 w-4 text-badge-danger-ink" /></IconButton>
          <IconButton label="Confirm" variant="neutral" onClick={() => onConfirm({ name, effortDays, bufferDays })}><Check className="h-4 w-4" /></IconButton>
        </span>
      </TableCell>
    </TableRow>
  );
}

/**
 * Effort estimate table, shared by:
 *   mode="import" - wizard step 3 (empty estimates, editable, Add Member, Back/Next)
 *   mode="edit"   - project edit tab (editable + row actions)
 *   mode="view"   - project view tab (read-only inputs)
 */
export function EffortPanel({ mode, onBack, onNext }) {
  const effort = useEffortEstimate(mode === 'import' ? IMPORT_EFFORT_ROWS : EXISTING_EFFORT_ROWS);
  const [addingRole, setAddingRole] = useState(null);
  const inputRefs = useRef({});
  const canEdit = mode !== 'view';
  const showActions = mode === 'edit';
  const colCount = 7; // Role + 5 value columns + action / spacer column

  return (
    <Card className="flex w-full flex-col overflow-hidden">
      {mode === 'import' && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <h2 className="text-sm font-semibold text-ink-primary">Effort Estimate</h2>
          <ProjectContextBar {...MOCK_PROJECT_CONTEXT} />
        </div>
      )}

      <Table className="min-w-[760px]">
        <TableHead>
          <TableRow className="hover:bg-transparent">
            <TableHeaderCell>Role</TableHeaderCell>
            {['Effort(Days)', 'In Hrs', 'Buffer(Days)', 'In Hrs', 'Total Hrs'].map((h, i) => <TableHeaderCell key={`${h}${i}`} className="text-center">{h}</TableHeaderCell>)}
            <TableHeaderCell className="w-24 text-right">{showActions ? 'Action' : ''}</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {effort.groups.map(({ role, rows }) => {
            const available = effort.allMembers.filter((m) => !rows.some((r) => r.name === m));
            return (
              <Fragment key={role}>
                <TableRow className="bg-surface-field-disabled hover:bg-surface-field-disabled">
                  <TableCell colSpan={colCount - 1} className="font-semibold">{role}</TableCell>
                  <TableCell className="text-right">
                    {canEdit && (
                      <button type="button" disabled={addingRole === role || available.length === 0} onClick={() => setAddingRole(role)} className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-ink-primary hover:text-action-primary disabled:opacity-50">
                        <Plus className="h-3.5 w-3.5" /> Add Member
                      </button>
                    )}
                  </TableCell>
                </TableRow>

                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-center">
                      <Input ref={(el) => { inputRefs.current[r.id] = el; }} size="md" type="number" min="0" aria-label={`Effort days for ${r.name}`} value={r.effortDays} readOnly={!canEdit} onChange={(e) => effort.updateRow(r.id, 'effortDays', e.target.value)} wrapperClassName="mx-auto w-16" className={DAYS_INPUT} />
                    </TableCell>
                    <TableCell className="text-center">{formatHrs(toHrs(r.effortDays))}</TableCell>
                    <TableCell className="text-center">
                      <Input size="md" type="number" min="0" aria-label={`Buffer days for ${r.name}`} value={r.bufferDays} readOnly={!canEdit} onChange={(e) => effort.updateRow(r.id, 'bufferDays', e.target.value)} wrapperClassName="mx-auto w-16" className={DAYS_INPUT} />
                    </TableCell>
                    <TableCell className="text-center">{formatHrs(toHrs(r.bufferDays))}</TableCell>
                    <TableCell className="text-center">{formatHrs(toHrs(r.effortDays) + toHrs(r.bufferDays))}</TableCell>
                    <TableCell className="text-right">
                      {showActions && (
                        <span className="inline-flex gap-1">
                          <IconButton label={`Edit ${r.name}`} variant="neutral" onClick={() => inputRefs.current[r.id]?.focus()}><Pencil className="h-4 w-4" /></IconButton>
                          <IconButton label={`Remove ${r.name}`} variant="neutral" onClick={() => effort.removeMember(r.id)}><UserMinus className="h-4 w-4 text-badge-danger-ink" /></IconButton>
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {addingRole === role && (
                  <PendingRow available={available} onCancel={() => setAddingRole(null)} onConfirm={(v) => { if (effort.addMember(role, v)) setAddingRole(null); }} />
                )}
              </Fragment>
            );
          })}

          <TableRow className="bg-surface-table-head font-semibold hover:bg-surface-table-head">
            <TableCell>TOTAL</TableCell>
            <TableCell className="text-center">{effort.totals.effortDays} days</TableCell>
            <TableCell className="text-center">{formatHrs(effort.totals.effortHrs)}</TableCell>
            <TableCell className="text-center">{effort.totals.bufferDays} days</TableCell>
            <TableCell className="text-center">{formatHrs(effort.totals.bufferHrs)}</TableCell>
            <TableCell className="text-center">{formatHrs(effort.totals.totalHrs)}</TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>

      {canEdit && (
        <div className="flex justify-end gap-3 border-t border-line-card p-4">
          <Button variant="ghost" onClick={onBack}>Back</Button>
          <Button rightIcon={<ArrowRight className="h-4 w-4" />} onClick={onNext}>Next:</Button>
        </div>
      )}
    </Card>
  );
}
