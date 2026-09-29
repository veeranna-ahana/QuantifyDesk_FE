import { useEffect, useMemo, useState } from "react";

import api from "@/api/axios";

const initialsOf = (name) =>
  (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
const has = (value, q) => String(value).toLowerCase().includes(q.toLowerCase());

// Health Overview bar tones — same labels/tones the mock used, now driven by the real
// `health_overview.buckets` from GET /api/import-project/dashboard/overview.
const HEALTH_TONE = {
  "On Track": "success",
  "In Progress": "brand",
  "At Risk": "danger",
  Delayed: "warning",
  Completed: "brand",
};

// Status Distribution donut color-token index — same order/colors the mock used, now driven by
// the real `status_distribution.buckets`.
const DISTRIBUTION_CHART = {
  Active: 5,
  Completed: 2,
  "On Hold": 7,
  Delayed: 3,
};

/**
 * Data + filters for the Dashboard.
 *
 * Cards / Health Overview / Status Distribution / Project Delivery Performance all come from
 * ONE real endpoint — GET /api/import-project/dashboard/overview (quantifyDashboard.controller.js)
 * — scoped to actual imported projects (project_info + live PMS + our task_info units), no mock
 * fallback. This is a DIFFERENT endpoint from the old, unrelated GET /api/dashboard (legacy
 * projects/tasks/users tables) — that one is not used here.
 *
 * Employee Utilization is now real too, from the same controller:
 *   - GET /api/import-project/dashboard/all-employees — the table (every employee with any
 *     task_info/effort_estimate assignment across imported projects; assigned days/hours are
 *     ours, logged hours come from hrms_timesheet).
 *   - GET /api/import-project/dashboard/employee/:emp_id — one employee's per-project drill-down
 *     (kpis/matrix), fetched lazily the first time a row is expanded and cached.
 * Role filter options come from the real role_task_catalog list (GET /api/import-project/roles —
 * the same one Effort Estimate/Task Info use), and each employee's `role` is taken from their
 * first project that has one tagged (task_info.role, falling back to effort_estimate.role). There
 * is still no single "designation" field anywhere, so someone tagged with different roles across
 * different projects only shows one of them here — real data, just not necessarily complete.
 * "Window"/"Available bandwidth" also have no real source yet (no capacity-calendar data) and
 * are left blank/using the UI's own default, per the user: leave hour-dependent bits as-is,
 * integrate whatever is actually available.
 */
export function useDashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeRows, setEmployeeRows] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState({}); // emp_id -> { kpis, matrix }
  const [roleOptions, setRoleOptions] = useState(["All Roles"]);

  const [projectSearch, setProjectSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [riskFilter, setRiskFilter] = useState("All Risk");

  const [employeeSearch, setEmployeeSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    api
      .get("/api/import-project/dashboard/overview")
      .then((res) => setOverview(res.data))
      .catch((err) =>
        setError(
          err.response?.data?.message || "Failed to load dashboard data.",
        ),
      )
      .finally(() => setLoading(false));
    api
      .get("/api/import-project/dashboard/all-employees")
      .then((res) => setEmployeeRows(res.data?.employees || []))
      .catch(() => setEmployeeRows([]));
    // Same role_task_catalog list Effort Estimate/Task Info use in the Import Project wizard —
    // not a separate hardcoded list, so it always matches what a task/effort row can actually be
    // tagged with.
    api
      .get("/api/import-project/roles")
      .then((res) => setRoleOptions(["All Roles", ...(res.data?.roles || [])]))
      .catch(() => setRoleOptions(["All Roles"]));
  }, []);

  // Fires whenever a row is expanded, fetching that employee's drill-down once and caching it.
  // Deliberately a useEffect keyed off `expandedId` — NOT a side effect fired from inside the
  // toggleExpanded/setExpandedId updater. Calling setState (this fetch's own setEmployeeDetails)
  // from inside another state updater function is undefined-behavior territory in React (updater
  // functions are supposed to be pure) — that was the original bug here: it happened to work the
  // first time (lucky timing) but silently failed to fire for every row after, leaving the
  // accordion open with no loading/error state ever set.
  useEffect(() => {
    if (expandedId) fetchEmployeeDetail(expandedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedId]);

  const fetchEmployeeDetail = (empId) => {
    if (employeeDetails[empId]) return; // already fetched (or currently loading/errored)
    setEmployeeDetails((prev) => ({ ...prev, [empId]: { loading: true } }));
    api
      .get(`/api/import-project/dashboard/employee/${empId}`)
      .then((res) => {
        const data = res.data;
        const kpis = [
          {
            label: "TOTAL ALLOCATED PROJECTS",
            value: String(data.total_projects ?? 0),
            sub: "Active assignments",
          },
          {
            label: "ASSIGNED DAYS",
            value: `${data.totals?.total_assigned_days ?? 0}d`,
            sub: "Effort + buffer days",
          },
          {
            label: "ASSIGNED HOURS",
            value: `${data.totals?.total_assigned_hours ?? 0}h`,
            sub: "From effort estimate",
          },
          {
            label: "LOGGED HOURS",
            value: `${data.totals?.total_logged_hours ?? 0}h`,
            sub: "From timesheet",
          },
        ];
        const matrix = (data.projects || []).map((p) => {
          const pct = p.total_tasks_in_project
            ? Math.round((p.completed_tasks / p.total_tasks_in_project) * 100)
            : 0;
          return {
            code: p.project_code || "—",
            role: p.role || null,
            meta: `${p.assigned_task_count} tasks · ${p.assigned_units} units`,
            name: p.description || p.project_code || "—",
            pct,
            statusText: `${p.completed_tasks}/${p.total_tasks_in_project || 0} tasks completed`,
            stats: [
              { label: "COMPLETED", value: p.completed_tasks, tone: "success" },
              { label: "PENDING", value: p.pending_tasks, tone: "warning" },
              {
                label: "ALLOCATED",
                value: `${p.assigned_hours}h`,
                tone: "brand",
              },
              {
                label: "LOGGED",
                value: `${p.logged_hours}h`,
                tone: p.logged_hours > p.assigned_hours ? "danger" : "success",
              },
            ],
          };
        });
        setEmployeeDetails((prev) => ({ ...prev, [empId]: { kpis, matrix } }));
      })
      .catch((err) => {
        // Surface the real failure instead of a silently blank accordion — this is what was
        // happening before: a failed fetch fell back to { kpis: [], matrix: [] }, which rendered
        // as an empty, seemingly "stuck" expanded row with no clue why.
        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to load employee details.";
        console.error(`Employee detail fetch failed for ${empId}:`, message);
        setEmployeeDetails((prev) => ({
          ...prev,
          [empId]: { error: message },
        }));
      });
  };

  const cards = overview?.cards || {
    all_projects: 0,
    in_progress: 0,
    completed: 0,
    delayed: 0,
  };
  const kpis = {
    totalProjects: cards.all_projects,
    inProgress: cards.in_progress,
    completed: cards.completed,
    delayed: cards.delayed,
  };

  const health = useMemo(
    () =>
      (overview?.health_overview?.buckets || []).map((b) => ({
        label: b.status,
        count: b.count,
        tone: HEALTH_TONE[b.status] ?? "neutral",
      })),
    [overview],
  );

  const distribution = useMemo(
    () =>
      (overview?.status_distribution?.buckets || []).map((b) => ({
        name: b.status,
        value: b.percentage,
        chart: DISTRIBUTION_CHART[b.status] ?? 1,
      })),
    [overview],
  );

  const allProjects = useMemo(
    () =>
      (overview?.delivery_performance || []).map((p) => ({
        id: p.project_info_id,
        name: p.project_title || `PMS Project ${p.project_id}`,
        code: p.project_code || "—",
        units: p.units,
        completion: p.completion_percentage,
        // Risk is always null for now (PMS hasn't shipped task-level risk_category yet — see the
        // backend controller's comment) — shown as '—', never a guessed value.
        risk: p.risk,
        status: p.status,
      })),
    [overview],
  );

  const projects = useMemo(
    () =>
      allProjects.filter(
        (p) =>
          (!projectSearch ||
            has(p.name, projectSearch) ||
            has(p.code, projectSearch)) &&
          (statusFilter === "All Status" || p.status === statusFilter) &&
          (riskFilter === "All Risk" || p.risk === riskFilter),
      ),
    [allProjects, projectSearch, statusFilter, riskFilter],
  );

  const employees = useMemo(() => {
    const base = employeeRows.map((u) => {
      const assignedHours = Number(u.total_assigned_hours) || 0;
      const loggedHours = Number(u.total_logged_hours) || 0;
      // There's still no single employee "designation" field anywhere — role is per-project
      // (task_info.role / effort_estimate.role), and one person can be tagged with different
      // roles on different projects. Rather than fabricate one designation, this takes the role
      // from their first project that has one — real data, just not necessarily "the" role if
      // they're multi-role across projects. null (not a guessed value) when none of their
      // projects have a role tagged yet.
      const role = (u.projects || []).map((p) => p.role).find(Boolean) || null;
      return {
        id: u.emp_id,
        name: u.emp_name || u.emp_id,
        initials: initialsOf(u.emp_name || u.emp_id),
        role,
        projects: (u.projects || []).map((p) => p.project_code).filter(Boolean),
        days: `${u.total_assigned_days ?? 0} business days`,
        // No capacity-calendar data yet for a date window — left blank; ProgressBar below already
        // falls back to a neutral default when windowPct is unset, not a fabricated real value.
        window: "",
        windowPct: undefined,
        utilPct:
          assignedHours > 0
            ? Math.round((loggedHours / assignedHours) * 100)
            : 0,
        ...employeeDetails[u.emp_id],
      };
    });
    return base.filter(
      (e) =>
        (!employeeSearch ||
          has(e.name, employeeSearch) ||
          has(e.id, employeeSearch)) &&
        (roleFilter === "All Roles" || e.role === roleFilter),
    );
  }, [employeeRows, employeeDetails, employeeSearch, roleFilter]);

  const toggleExpanded = (id) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return {
    loading,
    error,
    kpis,
    health,
    distribution,
    projects,
    projectSearch,
    setProjectSearch,
    statusFilter,
    setStatusFilter,
    riskFilter,
    setRiskFilter,
    employees,
    employeeSearch,
    setEmployeeSearch,
    roleFilter,
    setRoleFilter,
    roleOptions,
    expandedId,
    toggleExpanded,
  };
}
