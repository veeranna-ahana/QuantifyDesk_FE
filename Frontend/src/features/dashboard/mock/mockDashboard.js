// Cards / Health Overview / Status Distribution / Project Delivery Performance / Employee
// Utilization are all real now (GET /api/import-project/dashboard/overview,
// /all-employees, /employee/:emp_id) — no mock data. Only static filter-option lists remain here.

export const PROJECT_STATUS_FILTERS = [
  "All Status",
  "On Track",
  "In Progress",
  "At Risk",
  "Delayed",
  "Completed",
];
export const PROJECT_RISK_FILTERS = [
  "All Risk",
  "Low",
  "Medium",
  "High",
  "Critical",
];
// Employee Role filter options come from the real role_task_catalog API (GET
// /api/import-project/roles), fetched in useDashboard.js — no static list here anymore.
