import { ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { FilterChip } from '@/components/ui/FilterChip';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { IconButton } from '@/components/ui/IconButton';
import { ProgressBar } from '@/components/ui/ProgressBar';

import { ReportTaskTable } from './ReportTaskTable';

const GLOBAL_FILTERS = {
  'In Progress': (t) => t.status === 'In Progress',
  Completed: (t) => t.status === 'Completed',
  'On Hold': (t) => t.status === 'Blocked' || t.status === 'On Hold',
};

const PROJECT_FILTERS = {
  'in-progress': (t) => t.status === 'In Progress',
  'last-completed': (t) => t.classification.includes('LAST COMPLETED'),
  'total-completed': (t) => t.status === 'Completed',
  'not-started': (t) => t.status === 'Not Started',
  blockers: (t) => t.isBlocker || t.status === 'Blocked',
  delayed: (t) => t.isDelayed,
  'due-today': (t) => t.isDueToday,
};

/** One project: header (lead, team, progress) + quick filters + task table. */
export function ProjectReportCard({ project, globalTab, searchQuery }) {
  const [collapsed, setCollapsed] = useState(false);
  const [filter, setFilter] = useState('all');
  const c = project.tabCounts;

  const tasks = useMemo(() => {
    let list = project.tasks;
    if (GLOBAL_FILTERS[globalTab]) list = list.filter(GLOBAL_FILTERS[globalTab]);
    if (PROJECT_FILTERS[filter]) list = list.filter(PROJECT_FILTERS[filter]);
    const q = searchQuery.trim().toLowerCase();
    if (q) list = list.filter((t) => [t.taskName, t.ownerName, t.remarks].some((v) => (v || '').toLowerCase().includes(q)));
    return list;
  }, [project.tasks, globalTab, filter, searchQuery]);

  const tabs = [
    { id: 'all', label: `All Task (${c.all})` },
    { id: 'in-progress', label: 'In Progress', count: c.inProgress },
    { id: 'last-completed', label: 'Last Completed', count: c.lastCompleted },
    { id: 'total-completed', label: 'Total Completed', count: c.totalCompleted },
    { id: 'not-started', label: 'Not Started', count: c.notStarted },
  ];
  const toggle = (id) => setFilter(filter === id ? 'all' : id);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-1.5 border-b border-line-card px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-ink-primary">{project.name}</h2>
            <Badge variant="neutral" shape="chip" size="sm">{project.projectCode}</Badge>
            <Badge variant="success" size="sm">{project.statusTag}</Badge>
          </div>
          <span className="text-[11px] text-ink-muted">Overall Project Milestone</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink-secondary">
            <span>Lead: <b className="font-medium text-ink-primary">{project.lead}</b></span>
            <span aria-hidden="true">•</span>
            <span>Team: <b className="font-semibold text-action-primary">{project.teamMembersCount} Members</b></span>
            <span aria-hidden="true">•</span>
            <span>Timeline: <b className="font-medium text-ink-primary">{project.timeline}</b></span>
            <span aria-hidden="true">•</span>
            <span><b className="font-semibold text-ink-primary">{project.activeTasksCount}</b> Active Tasks</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="whitespace-nowrap text-xs font-bold text-ink-primary">{project.milestoneCompletion}% Completed</span>
            <ProgressBar value={project.milestoneCompletion} className="w-24" />
            <IconButton label={collapsed ? 'Expand' : 'Collapse'} variant="neutral" size="sm" onClick={() => setCollapsed((v) => !v)}>
              {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </IconButton>
          </div>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="flex flex-wrap items-center gap-3 border-b border-line-card px-4 py-2">
            <FilterTabs items={tabs} value={filter} onChange={setFilter} />
            <span aria-hidden="true" className="hidden h-5 w-px bg-line sm:block" />
            <div className="flex flex-wrap items-center gap-2">
              <FilterChip variant="warning" active={filter === 'blockers'} onClick={() => toggle('blockers')}>Blockers ({c.blockers})</FilterChip>
              <FilterChip variant="danger" active={filter === 'delayed'} onClick={() => toggle('delayed')}>Delayed ({c.delayed})</FilterChip>
              <FilterChip active={filter === 'due-today'} onClick={() => toggle('due-today')}>Due Today ({c.dueToday})</FilterChip>
            </div>
          </div>
          <ReportTaskTable tasks={tasks} />
        </>
      )}
    </Card>
  );
}
