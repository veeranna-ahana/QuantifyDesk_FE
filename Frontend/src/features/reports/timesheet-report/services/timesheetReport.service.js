import axiosInstance from "@/shared/axiosInstance";

// axiosInstance's response interceptor already unwraps to response.data.
export const timesheetReportService = {
  // All three HRMS report endpoints below call out to the live external HRMS
  // API (fetchAllEmployeesFromHrms) on every request, and project-wise-summary
  // / resource-breakdown also call the PMS getAllProjects API on top of that —
  // routinely slower than the instance default timeout (10s). They each get a
  // longer timeout so a slow (not broken) HRMS/PMS response doesn't surface as
  // a false "Something went wrong".

  // GET /api/hrms/timesheets-app-dev-designation-report — grouped timesheet rows
  // (one per employee + project category) for active Delivery employees whose
  // designation contains "Application Development". Same team scope as
  // project-wise-summary and resource-breakdown, so all 3 tabs now line up.
  getReport: () =>
    axiosInstance.get("/api/hrms/timesheets-app-dev-designation-report", {
      timeout: 30000,
    }),

  // GET /api/hrms/project-wise-summary — pre-aggregated per project-category totals
  // (App Dev team only; requires auth). Response: { title, totalRecords, projects: [...] }
  getProjectWiseSummary: () =>
    axiosInstance.get("/api/hrms/project-wise-summary", { timeout: 30000 }),

  // GET /api/hrms/resource-breakdown — pre-aggregated per project-category + employee
  // totals (App Dev team only; requires auth). Response: { title, totalRecords, resources: [...] }
  getResourceBreakdown: () =>
    axiosInstance.get("/api/hrms/resource-breakdown", { timeout: 30000 }),
};
