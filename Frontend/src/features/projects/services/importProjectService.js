import axiosInstance from "@/shared/axiosInstance";

/**
 * Step 1: unique PMS project titles, for the searchable project dropdown that replaced the old
 * free-text PMS ID input. PMS mints a brand-new project_id for each new VERSION of the same
 * project (the old id then goes INACTIVE), but the title stays the same across versions — so the
 * title is what the user picks, and getPmsProjectIdByTitle below resolves it to the current id.
 */
export const getPmsProjectTitles = () =>
  axiosInstance.get("/api/import-project/pms-project-titles");

/** Step 1: resolves a chosen project title to PMS's current (latest-version) project_id. */
export const getPmsProjectIdByTitle = (projectTitle) =>
  axiosInstance.get("/api/import-project/pms-project-id-by-title", {
    params: { project_title: projectTitle },
  });

/** Step 1/2: fetch + pre-fill Project Info + Task Info from PMS for a given (resolved) PMS project ID. */
export const syncPmsProject = (projectId) =>
  axiosInstance.get("/api/import-project/pms-sync", { params: { projectId } });

/** Step 1: backend-maintained Project Type dropdown options (One Time Project / Managed Service / Staff Augmentation). */
export const getProjectTypes = () =>
  axiosInstance.get("/api/import-project/project-types");

/** Step 2/3: distinct Role list from role_task_catalog (BA, UI, TL, FE Dev, BE Dev, Tester, ...). */
export const getRoles = () => axiosInstance.get("/api/import-project/roles");

/** Step 2: Task Type options for a given Role (e.g. role=BA -> "BA-BRD", "BA-TDD", ...), from role_task_catalog. */
export const getTaskTypesByRole = (role) =>
  axiosInstance.get("/api/import-project/task-catalog", { params: { role } });

/** Step 3: active employees (master.emp, flag = 'Active') for the "+ Add Member" picker. */
export const getActiveEmployees = () =>
  axiosInstance.get("/api/import-project/employees");

/** Resolves the logged-in user's name from their own JWT's emp_id (server-side, always correct). */
export const getCurrentUser = () => axiosInstance.get("/api/import-project/me");

/** Step 4: the fixed 16-row document_master list (BRD or CR, Proposal Document, ...). */
export const getDocumentMaster = () =>
  axiosInstance.get("/api/import-project/documents");

/** Final step: persists Steps 1-4 in one call. Backend stamps uploaded_by/uploaded_date itself. */
export const createImportProject = (payload) =>
  axiosInstance.post("/api/import-project", payload);

/**
 * Project View/Edit screen's "Save changes": same payload shape as createImportProject
 * (project_info + tasks + effort_estimates + documents), applied to an existing project.
 * task_info is upserted per (project_info_id, task_id), effort_estimate is fully replaced,
 * document_checklist is upserted per document_id/custom_document_name — see the backend
 * controller's updateProjectInfo for the exact semantics.
 */
export const updateImportProject = (projectInfoId, payload) =>
  axiosInstance.put(`/api/import-project/${projectInfoId}`, payload);

/**
 * Timesheet Data tab: HRMS timesheets for a project's category, grouped one row per employee
 * (projectTimesheet.controller.js's getCategoryTimesheetsGroupedByEmployee). `projectcategoryCode`
 * is project_info.sub_category — the same value entered in Step 1 of the Import Project wizard —
 * which is how HRMS timesheet rows get matched back to a Quantify project.
 */
export const getCategoryTimesheets = (projectcategoryCode) =>
  axiosInstance.get("/api/hrms/timesheets-by-category", {
    params: { projectcategory_code: projectcategoryCode },
  });
