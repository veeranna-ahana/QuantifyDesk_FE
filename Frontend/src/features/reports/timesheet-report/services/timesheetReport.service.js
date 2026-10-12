import axiosInstance from "@/shared/axiosInstance";

// axiosInstance's response interceptor already unwraps to response.data.
export const timesheetReportService = {
  // GET /api/hrms/timesheets-all-categories-report — one entry per project category,
  // each holding its employees' grouped timesheet rows.
  getReport: () =>
    axiosInstance.get("/api/hrms/timesheets-all-categories-report"),
};
