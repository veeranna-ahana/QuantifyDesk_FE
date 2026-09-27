import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

import { ROLE_OPTIONS, TASK_TYPE_OPTIONS } from '../constants';

const withCurrent = (options, value) => (value && !options.includes(value) ? [value, ...options] : options);

function Detail({ label, value, className }) {
  return (
    <div className={className}>
      <div className="text-[11px] text-ink-muted">{label}</div>
      <div className="text-[13px] font-medium text-ink-primary">{value || '—'}</div>
    </div>
  );
}

/** Edit Task Details panel: PMS values read-only, Role / Task Type / Unit editable. */
export function EditTaskDrawer({ task, values, onChange, onCancel, onSave, projectContext }) {
  return (
    <Drawer
      open={Boolean(task)}
      title="Edit Task Details"
      taskId={task?.taskId}
      context={task ? `Milestone: ${task.milestone ?? '—'} · ${projectContext.projectName} (${projectContext.pmsId})` : undefined}
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button onClick={onSave}>Save</Button>
        </>
      }
    >
      {task && (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-chip border border-line-card bg-surface-field-disabled p-3">
            <Detail label="Milestone" value={task.milestone} />
            <Detail label="Task Title" value={task.title} />
            <Detail label="Task Owner" value={task.owner} />
            <Detail label="Status" value={task.status} />
            <Detail label="Planned Start" value={task.plannedStart} />
            <Detail label="Actual Start" value={task.actualStart} />
            <Detail label="Planned End" value={task.plannedEnd} />
            <Detail label="Actual End" value={task.actualEnd} />
            <Detail label="Risk Category" value={task.riskCategory} className="col-span-2" />
            <Detail label="Remark" value={task.remark || 'Completed ahead of schedule.'} className="col-span-2" />
          </div>
          <Select label="Role" placeholder="Business Analyst" value={values.role} options={withCurrent(ROLE_OPTIONS, values.role)} onChange={(e) => onChange('role', e.target.value)} />
          <Select label="Task Type" placeholder="Analysis" value={values.taskType} options={withCurrent(TASK_TYPE_OPTIONS, values.taskType)} onChange={(e) => onChange('taskType', e.target.value)} />
          <Input label="Unit" type="number" min="0" placeholder="98" value={values.unit} onChange={(e) => onChange('unit', e.target.value)} />
        </>
      )}
    </Drawer>
  );
}
