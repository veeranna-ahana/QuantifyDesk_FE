// Maps the raw GET /api/import-project/pms-sync response (projectDetails,
// milestoneDetails, tasksDetails) into the shapes ProjectInfoForm and
// TaskInfoPanel/useTaskInfo already expect (same shape the mock data used).

const pad2 = (n) => String(n).padStart(2, "0");

/**
 * PMS dates come back as ISO strings like "2026-10-14T18:30:00.000Z" — display as
 * DD/MM/YYYY. That instant is midnight of 15 Oct in IST, so convert in a fixed
 * Asia/Kolkata zone (not UTC getters, which give the previous day, and not local
 * getters, which depend on the browser timezone).
 */
export function formatPmsDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
  return `${pad2(ist.getUTCDate())}/${pad2(ist.getUTCMonth() + 1)}/${ist.getUTCFullYear()}`;
}

/** Task status strings vary in casing/wording — normalize to the 3 buckets the Task Info UI expects. */
export function normalizeStatus(raw) {
  const s = String(raw || "").toLowerCase();
  if (s.includes("progress")) return "In Progress";
  if (s.includes("complete") || s.includes("done")) return "Completed";
  if (s.includes("hold")) return "On Hold";
  return "Not Started";
}

/**
 * Project-level status (projectDetails.status) uses PMS's own vocabulary — confirmed values
 * include "INACTIVE", not just the Completed/In Progress/On Hold/Not Started set Task Info
 * uses. Forcing an unrecognized value like "INACTIVE" into normalizeStatus's 3 buckets would
 * silently show "Not Started", which is simply wrong. Instead: map the values we do recognize,
 * and otherwise just Title Case whatever PMS actually sent — never invent a different status.
 * ProjectInfoForm's Select adds this to its dropdown automatically if it isn't already one of
 * the standard options (via withCurrent), so it still displays correctly either way.
 */
export function normalizeProjectStatus(raw) {
  if (!raw) return "";
  const s = String(raw).toLowerCase();
  if (s.includes("progress")) return "In Progress";
  if (s.includes("complete") || s.includes("done")) return "Completed";
  if (s.includes("hold")) return "On Hold";
  if (s === "not started" || s === "not_started") return "Not Started";
  // Unrecognized PMS status (e.g. "INACTIVE", "ACTIVE") — show it as-is, Title Cased,
  // rather than mis-bucketing it into one of the options above.
  return String(raw)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * projectDetails -> the flat PMS-owned fields ProjectInfoForm's `values` expects.
 *
 * Field names below match the REAL PMS getProjectDetails payload (confirmed from the
 * actual /pms-sync response): project_title, presales_id, planned_start_date,
 * planned_end_date, status, description. The extra `|| projectDetails.xxx` fallbacks
 * are kept only in case a different PMS project ever comes back with the more
 * "obvious" field name instead.
 */
export function mapProjectDetailsToPmsFields(projectDetails) {
  if (!projectDetails) return {};
  return {
    projectName:
      projectDetails.project_title ||
      projectDetails.project_name ||
      projectDetails.title ||
      "",
    customer: projectDetails.customer_name || projectDetails.customer || "",
    presaleId: projectDetails.presales_id || projectDetails.presale_id || "",
    startDate: formatPmsDate(
      projectDetails.planned_start_date || projectDetails.start_date,
    ),
    endDate: formatPmsDate(
      projectDetails.planned_end_date || projectDetails.end_date,
    ),
    description: projectDetails.description || "",
    status: normalizeProjectStatus(projectDetails.status),
  };
}

/** milestoneDetails + tasksDetails -> the milestone/task tree useTaskInfo expects (same shape MOCK_MILESTONES used). */
export function mapPmsToMilestones(milestoneDetails = [], tasksDetails = []) {
  const safeMilestones = milestoneDetails || [];
  const safeTasks = tasksDetails || [];

  const tasksByMilestoneId = new Map();
  for (const t of safeTasks) {
    const key = String(t.project_milestone_id ?? "");
    if (!tasksByMilestoneId.has(key)) tasksByMilestoneId.set(key, []);
    tasksByMilestoneId.get(key).push(t);
  }

  return safeMilestones.map((m) => {
    const milestoneId = String(m.milestone_id ?? "");
    const rawTasks = tasksByMilestoneId.get(milestoneId) || [];

    const tasks = rawTasks.map((t) => {
      const statusBucket = normalizeStatus(t.status);
      return {
        id: `T-${t.task_id}`,
        taskId: `T-${t.task_id}`,
        // Raw PMS task_id (not the "T-123" display id) — this is what task_info.task_id is
        // actually keyed on server-side, so Create Project's payload must send this, not `id`.
        pmsTaskId: t.task_id,
        // PMS's stable per-task id across versions (unlike task_id, which PMS mints fresh for
        // every task on a version bump) — carried through so a later save can re-find this
        // task's task_info row even after its task_id has changed.
        pmsTaskUuid: t.task_uuid || null,
        // PMS's own task assignee (confirmed present on every task in the real payload) —
        // task_info.emp_id defaults to this at Create Project time so it isn't just NULL for
        // every task. Kept separate from `owner` (the display name, which stays a live PMS
        // read) since this is the raw id Create Project's payload actually needs.
        pmsEmpId: t.emp_id || null,
        milestoneShort: m.milestone_title || m.milestone_name || "",
        title: t.task_title || "",
        owner: t.emp_name || "",
        plannedStart: formatPmsDate(t.planned_start_date),
        plannedEnd: formatPmsDate(t.planned_end_date),
        actualStart: formatPmsDate(t.actual_start_date),
        actualEnd: formatPmsDate(t.actual_end_date),
        allocation: "—",
        // PMS's own raw status text (e.g. "STARTED", "YET_TO_START", "COMPLETED") — shown as-is
        // everywhere, never relabeled. `statusBucket` below is internal-only (never shown in the
        // UI), used purely for filtering/counts (TaskFilters, useTaskInfo summary tallies, the
        // milestone completion % just below), which still need Not Started/In Progress/Completed
        // buckets grouping PMS's many possible raw values.
        status: t.status || null,
        statusBucket,
        // Risk Category and Remark are both fields WE fill in (via the Edit Task drawer /
        // inline edit) — they are not PMS data at all, so they start genuinely empty here.
        // `dependency` (PMS's task-ordering field, e.g. "Analysis of Intune Platform") is a
        // different concept entirely and must never be used to fill Risk Category.
        dependency: t.dependency && t.dependency !== "NO" ? t.dependency : "",
        riskCategory: "",
        remark: "",
        role: "",
        taskType: "",
        unit: "",
      };
    });

    const completedTasks = tasks.filter(
      (t) => t.statusBucket === "Completed",
    ).length;
    const totalTasks = tasks.length;
    const percentage =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    const status =
      totalTasks === 0
        ? "Not Started"
        : percentage === 100
          ? "Completed"
          : completedTasks > 0 ||
              tasks.some((t) => t.statusBucket === "In Progress")
            ? "In Progress"
            : "Not Started";

    return {
      id: milestoneId || m.milestone_title,
      name: m.milestone_title || m.milestone_name || "",
      totalTasks,
      completedTasks,
      status,
      statusText: `${status} (${completedTasks}/${totalTasks}) • ${percentage}%`,
      tasks,
    };
  });
}
