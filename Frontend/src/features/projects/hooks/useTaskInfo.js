import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";

export const MILESTONE_PAGE_SIZE = 10;

const TAB_STATUS = {
  "in-progress": "In Progress",
  "last-completed": "Completed",
  "total-completed": "Completed",
  "not-started": "Not Started",
};

// No mock fallback: Blockers/Delayed/Due Today/Last Completed logic against real PMS data
// hasn't been defined yet, so these show 0 rather than a fake number until that's specified.
const EMPTY_ALERTS = { lastCompleted: 0, blockers: 0, delayed: 0, dueToday: 0 };

/**
 * State + derived data for the Task Info screens (import step 2 and project view/edit).
 * Owns: search + milestone + status filters, pagination, the Edit Task drawer, bulk updates.
 *
 * `milestones` (real PMS milestone/task data — [] if not yet synced, no mock fallback) and
 * `onMilestonesChange` are CONTROLLED: this hook does NOT keep its own copy of the milestone/task
 * data in local state. It used to (`useState(initialMilestones)`), which caused a real bug — the
 * Import wizard conditionally renders each step (`{wiz.step === 2 && <TaskInfoPanel/>}`), so
 * leaving Task Info UNMOUNTS this hook entirely; coming back remounted it fresh from the original
 * `initialMilestones` prop, silently discarding every edit made via the Edit Task drawer or Bulk
 * Update. Making it controlled means edits are written back up to the caller (ultimately the
 * wizard hook's own state) via `onMilestonesChange`, which survives the remount.
 */
export function useTaskInfo(milestones, onMilestonesChange) {
  const safeMilestones = milestones || [];
  const [search, setSearch] = useState("");
  const [milestoneId, setMilestoneId] = useState("");
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState({ [safeMilestones[0]?.id]: true });

  const [drawerTask, setDrawerTask] = useState(null);
  const [editValues, setEditValues] = useState({
    role: "",
    taskType: "",
    unit: "",
  });

  const updateTask = useCallback(
    (taskId, patch) => {
      onMilestonesChange(
        safeMilestones.map((m) => ({
          ...m,
          tasks: m.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
        })),
      );
    },
    [safeMilestones, onMilestonesChange],
  );

  const visibleMilestones = useMemo(() => {
    const q = search.trim().toLowerCase();
    return safeMilestones
      .filter((m) => !milestoneId || m.id === milestoneId)
      .map((m) => {
        let tasks = m.tasks;
        if (TAB_STATUS[tab])
          tasks = tasks.filter((t) => t.status === TAB_STATUS[tab]);
        if (q)
          tasks = tasks.filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              t.taskId.toLowerCase().includes(q),
          );
        return { ...m, tasks };
      })
      .filter((m) =>
        search.trim()
          ? m.name.toLowerCase().includes(q) || m.tasks.length > 0
          : tab === "all" || m.tasks.length > 0,
      );
  }, [safeMilestones, search, milestoneId, tab]);

  const toggleMilestone = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // ── Edit drawer ──
  const openDrawer = (task, milestone) => {
    setDrawerTask({ ...task, milestone: milestone?.name });
    setEditValues({
      role: task.role ?? "",
      taskType: task.taskType ?? "",
      unit: task.unit ?? "",
    });
  };
  const closeDrawer = () => setDrawerTask(null);
  const changeEditValue = (field, value) =>
    setEditValues((prev) => ({ ...prev, [field]: value }));
  const saveDrawer = () => {
    if (!drawerTask) return;
    updateTask(drawerTask.id, editValues);
    toast.success(`Task ${drawerTask.taskId} updated successfully!`);
    closeDrawer();
  };

  // ── Bulk update ──
  const bulkRows = useMemo(
    () =>
      safeMilestones.flatMap((m) =>
        m.tasks.map((t) => ({
          id: t.id,
          taskId: t.taskId,
          title: t.title,
          milestoneId: m.id,
          milestoneName: m.name,
          owner: t.owner,
          role: t.role || "",
          taskType: t.taskType || "",
          unit: t.unit || "",
        })),
      ),
    [safeMilestones],
  );
  const applyBulk = (valuesById) => {
    onMilestonesChange(
      safeMilestones.map((m) => ({
        ...m,
        tasks: m.tasks.map((t) =>
          valuesById[t.id] ? { ...t, ...valuesById[t.id] } : t,
        ),
      })),
    );
    toast.success(
      `Successfully updated ${Object.keys(valuesById).length} tasks!`,
    );
  };

  const summary = useMemo(() => {
    let total = 0,
      completed = 0,
      inProgress = 0,
      notStarted = 0,
      milestoneCompleted = 0;
    safeMilestones.forEach((m) => {
      total += m.totalTasks;
      completed += m.completedTasks;
      inProgress += m.tasks.filter((t) => t.status === "In Progress").length;
      notStarted += m.tasks.filter((t) => t.status === "Not Started").length;
      if (m.status === "Completed") milestoneCompleted++;
    });
    return {
      totalMilestones: safeMilestones.length,
      milestonesCompleted: milestoneCompleted,
      totalTasks: total,
      completed,
      inProgress,
      notStarted,
    };
  }, [safeMilestones]);

  const totalPages = Math.max(
    1,
    Math.ceil(visibleMilestones.length / MILESTONE_PAGE_SIZE),
  );

  const paginatedMilestones = useMemo(() => {
    const start = (page - 1) * MILESTONE_PAGE_SIZE;
    return visibleMilestones.slice(start, start + MILESTONE_PAGE_SIZE);
  }, [visibleMilestones, page]);

  return {
    milestones: safeMilestones,
    visibleMilestones,
    paginatedMilestones,
    summary,
    alerts: EMPTY_ALERTS,
    search,
    setSearch: (v) => {
      setSearch(v);
      setPage(1);
    },
    milestoneId,
    setMilestoneId: (v) => {
      setMilestoneId(v);
      setPage(1);
    },
    tab,
    setTab: (v) => {
      setTab(v);
      setPage(1);
    },
    page,
    setPage,
    totalPages,
    pageSize: MILESTONE_PAGE_SIZE,
    totalItems: visibleMilestones.length,
    expanded,
    toggleMilestone,
    updateTask,
    drawerTask,
    editValues,
    openDrawer,
    closeDrawer,
    changeEditValue,
    saveDrawer,
    bulkRows,
    applyBulk,
  };
}
