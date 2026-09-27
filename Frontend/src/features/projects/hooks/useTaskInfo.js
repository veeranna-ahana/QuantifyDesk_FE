import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { MOCK_MILESTONES, MOCK_TASK_ALERTS, MOCK_TASK_SUMMARY } from '@/features/projects/mock/mockTasks';

export const TASK_PAGE_SIZE = 10;

const TAB_STATUS = {
  'in-progress': 'In Progress',
  'last-completed': 'Completed',
  'total-completed': 'Completed',
  'not-started': 'Not Started',
};

/**
 * State + derived data for the Task Info screens (import step 2 and project view/edit).
 * Owns: milestone/task data, search + milestone + status filters, pagination,
 * the Edit Task drawer and bulk updates.
 * Today it reads mock data; swapping in the real API only changes the initial state here.
 */
export function useTaskInfo() {
  const [milestones, setMilestones] = useState(MOCK_MILESTONES);
  const [search, setSearch] = useState('');
  const [milestoneId, setMilestoneId] = useState('');
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState({ [MOCK_MILESTONES[0].id]: true });

  const [drawerTask, setDrawerTask] = useState(null);
  const [editValues, setEditValues] = useState({ role: '', taskType: '', unit: '' });

  const updateTask = useCallback((taskId, patch) => {
    setMilestones((prev) => prev.map((m) => ({ ...m, tasks: m.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)) })));
  }, []);

  const visibleMilestones = useMemo(() => {
    const q = search.trim().toLowerCase();
    return milestones
      .filter((m) => !milestoneId || m.id === milestoneId)
      .map((m) => {
        let tasks = m.tasks;
        if (TAB_STATUS[tab]) tasks = tasks.filter((t) => t.status === TAB_STATUS[tab]);
        if (q) tasks = tasks.filter((t) => t.title.toLowerCase().includes(q) || t.taskId.toLowerCase().includes(q));
        return { ...m, tasks };
      })
      .filter((m) => (search.trim() ? m.name.toLowerCase().includes(q) || m.tasks.length > 0 : tab === 'all' || m.tasks.length > 0));
  }, [milestones, search, milestoneId, tab]);

  const toggleMilestone = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // ── Edit drawer ──
  const openDrawer = (task, milestone) => {
    setDrawerTask({ ...task, milestone: milestone?.name });
    setEditValues({ role: task.role ?? '', taskType: task.taskType ?? '', unit: task.unit ?? '' });
  };
  const closeDrawer = () => setDrawerTask(null);
  const changeEditValue = (field, value) => setEditValues((prev) => ({ ...prev, [field]: value }));
  const saveDrawer = () => {
    if (!drawerTask) return;
    updateTask(drawerTask.id, editValues);
    toast.success(`Task ${drawerTask.taskId} updated successfully!`);
    closeDrawer();
  };

  // ── Bulk update ──
  const bulkRows = useMemo(
    () =>
      milestones.flatMap((m) =>
        m.tasks.map((t) => ({
          id: t.id,
          taskId: t.taskId,
          title: t.title,
          milestoneId: m.id,
          milestoneName: m.name,
          owner: t.owner,
          role: 'Business Analyst',
          taskType: 'Analysis',
          unit: '1',
        })),
      ),
    [milestones],
  );
  const applyBulk = (valuesById) => {
    setMilestones((prev) => prev.map((m) => ({ ...m, tasks: m.tasks.map((t) => (valuesById[t.id] ? { ...t, ...valuesById[t.id] } : t)) })));
    toast.success(`Successfully updated ${Object.keys(valuesById).length} tasks!`);
  };

  const totalPages = Math.max(1, Math.ceil(MOCK_TASK_SUMMARY.totalTasks / TASK_PAGE_SIZE));

  return {
    milestones,
    visibleMilestones,
    summary: MOCK_TASK_SUMMARY,
    alerts: MOCK_TASK_ALERTS,
    search, setSearch: (v) => { setSearch(v); setPage(1); },
    milestoneId, setMilestoneId: (v) => { setMilestoneId(v); setPage(1); },
    tab, setTab: (v) => { setTab(v); setPage(1); },
    page, setPage, totalPages, pageSize: TASK_PAGE_SIZE, totalItems: MOCK_TASK_SUMMARY.totalTasks,
    expanded, toggleMilestone,
    updateTask,
    drawerTask, editValues, openDrawer, closeDrawer, changeEditValue, saveDrawer,
    bulkRows, applyBulk,
  };
}
