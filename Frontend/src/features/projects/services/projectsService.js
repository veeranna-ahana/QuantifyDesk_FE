// src/features/projects/services/projectsService.js
import axiosInstance from "@/shared/axiosInstance";

/** GET /api/import-project row -> the shape ProjectsTable/useProjects already expect. */
function mapImportedProject(p) {
  return {
    id: p.project_info_id,
    pmsId: p.project_id,
    projectName: p.project_title || `PMS Project ${p.project_id}`,
    customer: p.customer_name || "—",
    // Not confirmed against a real getAllProjects list response yet — see the backend
    // controller's comment. Shows '—' rather than a guessed/fake name until confirmed.
    owner: p.project_coordinator || "—",
    status: p.status || "Not Started",
    startDate: p.planned_start_date || "",
    endDate: p.planned_end_date || "",
    actualStartDate: p.actual_start_date || "",
    actualEndDate: p.actual_end_date || "",
    description: p.description || "",
    // ── Locally owned (ours, not PMS) ─────────────────────────────────
    projectType: p.project_type || "—",
    nbdId: p.nbd_id || "—",
    o2dId: p.o2d_id || "—",
    projectCode: p.project_code || "—",
    subCategory: p.sub_category || "—",
    createdAt: p.created_at || null,
  };
}

/** Fetch all imported projects for the Projects table — real data, no mock fallback. */
export const getProjects = async () => {
  const data = await axiosInstance.get("/api/import-project");
  return (data?.projects || []).map(mapImportedProject);
};

/**
 * Fetch a single imported project's full view (Project Info + Task Info + Effort Estimates +
 * Documents + Overview) — GET /api/import-project/:projectInfoId, the same endpoint that backs
 * the wizard's own "view after create" data. Real data, no mock fallback.
 *
 * Only the Project Overview tab consumes this so far (see useProjectDetails.js) — Task
 * Info/Effort/Documents tabs on this View/Edit screen are still their own separate, not-yet-
 * wired scope (flagged in earlier passes), so they don't read from this response yet.
 */
export const getImportedProject = (projectInfoId) =>
  axiosInstance.get(`/api/import-project/${projectInfoId}`);

/**
 * Import projects from a file upload.
 * Future: axiosInstance.post('/projects/import', formData)
 */
export const importProjects = (file) =>
  new Promise((resolve) => {
    setTimeout(() => {
      // console.log("Import Project clicked – file:", file?.name ?? "none");
      resolve({ success: true });
    }, 300);
  });
