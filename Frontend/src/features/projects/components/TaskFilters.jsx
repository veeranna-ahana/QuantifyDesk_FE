import { Search, SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FilterChip } from '@/components/ui/FilterChip';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

import { ProjectContextBar } from './ProjectContextBar';

/** Task Information header: title, search, milestone filter, status tabs, alert chips, bulk update. */
export function TaskFilters({ task, projectContext, showBulk, onBulk }) {
  const { summary, alerts, tab, setTab, search, setSearch, milestoneId, setMilestoneId, milestones } = task;
  const tabs = [
    { id: 'all', label: `All Task (${summary.totalTasks})` },
    { id: 'in-progress', label: 'In Progress', count: summary.inProgress },
    { id: 'last-completed', label: 'Last Completed', count: alerts.lastCompleted },
    { id: 'total-completed', label: 'Total Completed', count: summary.completed },
    { id: 'not-started', label: 'Not Started', count: summary.notStarted },
  ];
  const toggle = (id) => setTab(tab === id ? 'all' : id);

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink-primary">Task Information</h2>
        <ProjectContextBar {...projectContext} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <Input id="task-search" size="md" aria-label="Search tasks" placeholder="Search by task" leadingIcon={<Search className="h-4 w-4" />} value={search} onChange={(e) => setSearch(e.target.value)} wrapperClassName="w-full max-w-xs flex-1" />
          <Select id="milestone-filter" size="md" aria-label="Milestone" placeholder="Milestone" value={milestoneId} onChange={(e) => setMilestoneId(e.target.value)} options={milestones.map((m) => ({ value: m.id, label: m.name }))} wrapperClassName="w-48" />
        </div>
        {showBulk && <Button id="task-bulk-update-btn" leftIcon={<SlidersHorizontal className="h-4 w-4" />} onClick={onBulk}>Bulk Update</Button>}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <FilterTabs items={tabs} value={tab} onChange={setTab} />
        <span aria-hidden="true" className="hidden h-6 w-px bg-line sm:block" />
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip variant="warning" active={tab === 'blockers'} onClick={() => toggle('blockers')}>Blockers ({alerts.blockers})</FilterChip>
          <FilterChip variant="danger" active={tab === 'delayed'} onClick={() => toggle('delayed')}>Delayed ({alerts.delayed})</FilterChip>
          <FilterChip active={tab === 'due'} onClick={() => toggle('due')}>Due Today ({alerts.dueToday})</FilterChip>
        </div>
      </div>
    </Card>
  );
}
