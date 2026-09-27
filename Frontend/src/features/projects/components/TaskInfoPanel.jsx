import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { MOCK_PROJECT_CONTEXT } from '@/features/projects/mock/mockTasks';

import { useTaskInfo } from '../hooks/useTaskInfo';

import { BulkUpdateTasks } from './BulkUpdateTasks';
import { EditTaskDrawer } from './EditTaskDrawer';
import { MilestoneAccordion } from './MilestoneAccordion';
import { TaskFilters } from './TaskFilters';
import { TaskTable } from './TaskTable';

/**
 * Task Info screen, shared by:
 *   mode="import" - wizard step 2 (filters, edit pencil, bulk update, Back/Next)
 *   mode="edit"   - project edit tab (same + inline risk/remark)
 *   mode="view"   - project view tab (read-only accordion card only)
 */
export function TaskInfoPanel({ mode, onBack, onNext }) {
  const task = useTaskInfo();
  const [bulkOpen, setBulkOpen] = useState(false);
  const canEdit = mode !== 'view';
  const projectContext = MOCK_PROJECT_CONTEXT;

  if (bulkOpen) {
    return (
      <BulkUpdateTasks
        rows={task.bulkRows}
        milestones={task.milestones}
        projectContext={projectContext}
        onCancel={() => setBulkOpen(false)}
        onSave={(values) => { task.applyBulk(values); setBulkOpen(false); }}
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {canEdit && (
        <EditTaskDrawer task={task.drawerTask} values={task.editValues} onChange={task.changeEditValue} onCancel={task.closeDrawer} onSave={task.saveDrawer} projectContext={projectContext} />
      )}

      {canEdit && <TaskFilters task={task} projectContext={projectContext} showBulk onBulk={() => setBulkOpen(true)} />}

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-2 p-3">
          {task.visibleMilestones.length === 0 && <p className="py-8 text-center text-sm text-ink-muted">No milestones match your search.</p>}
          {task.visibleMilestones.map((m) => (
            <MilestoneAccordion key={m.id} milestone={m} expanded={Boolean(task.expanded[m.id])} onToggle={() => task.toggleMilestone(m.id)}>
              <TaskTable tasks={m.tasks} editable={mode === 'edit'} onChange={task.updateTask} onEdit={canEdit ? (t) => task.openDrawer(t, m) : undefined} />
            </MilestoneAccordion>
          ))}
        </div>
        <Pagination page={task.page} totalPages={task.totalPages} totalItems={task.totalItems} pageSize={task.pageSize} onPageChange={task.setPage} itemLabel="tasks" />
      </Card>

      {canEdit && (
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onBack}>Back</Button>
          <Button rightIcon={<ArrowRight className="h-4 w-4" />} onClick={onNext}>Next:</Button>
        </div>
      )}
    </div>
  );
}
