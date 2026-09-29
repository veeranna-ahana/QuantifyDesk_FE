// Maps GET /api/import-project/:id's response sub-objects (task_info, effort_estimates,
// documents) into the exact shapes TaskInfoPanel/useTaskInfo, EffortPanel/useEffortEstimate and
// DocumentChecklist/useDocumentChecklist already expect — the same shapes mapPmsSync.js produces
// for the Import wizard, so the View/Edit screen's tabs can reuse those components unchanged.

import { formatPmsDate, normalizeStatus } from "./mapPmsSync";
import { formatProjectDate } from "./formatProjectDate";

const ICON_BY_DOC_NAME = {
  "brd or cr": "file-text",
  "proposal document": "file-text",
  "effort estimate": "sheet",
  "solution architecture": "layers",
  "db design document": "database",
  "swagger api document": "code",
  "ui/ux": "design",
  "test plan": "clipboard",
  "testcase document": "list",
  "qa signoff": "shield",
  "uat signoff": "check",
  "technical design document": "code",
  "release notes": "tag",
  "risk registry": "alert",
  "user manual": "book",
  "git repository link": "git",
};

/** task_info.milestones (backend shape) -> the milestone/task tree TaskInfoPanel expects. */
export function mapViewToMilestones(milestones = []) {
  return (milestones || []).map((m) => {
    const tasks = (m.tasks || []).map((t) => ({
      id: `T-${t.task_id}`,
      taskId: `T-${t.task_id}`,
      pmsTaskId: t.task_id,
      pmsEmpId: t.emp_id || null,
      milestoneShort: m.milestone_name || "",
      title: t.task_title || "",
      owner: t.owner || "",
      plannedStart: formatPmsDate(t.planned_start_date),
      plannedEnd: formatPmsDate(t.planned_end_date),
      actualStart: formatPmsDate(t.actual_start_date),
      actualEnd: formatPmsDate(t.actual_end_date),
      allocation: t.allocation ?? "—",
      // Raw PMS status (e.g. "COMPLETED") doesn't match statusVariant's lookup keys
      // ("Completed") — normalize it the same way the Import wizard's mapPmsToMilestones does,
      // otherwise the Status badge silently loses its color (falls back to neutral/gray).
      status: normalizeStatus(t.status),
      dependency: t.dependency || "",
      riskCategory: t.risk_category || "",
      remark: t.remark || "",
      role: t.role || "",
      taskType: t.task_type || "",
      unit: t.unit || "",
    }));

    return {
      id: String(m.milestone_id ?? m.milestone_name ?? ""),
      name: m.milestone_name || "",
      totalTasks: m.total_tasks ?? tasks.length,
      completedTasks: m.completed_tasks ?? 0,
      status: m.status || "Not Started",
      statusText: `${m.status || "Not Started"} (${m.completed_tasks ?? 0}/${m.total_tasks ?? tasks.length}) • ${m.percentage ?? 0}%`,
      tasks,
    };
  });
}

/** effort_estimates.members (backend shape) -> the rows EffortPanel/useEffortEstimate expects. */
export function mapViewToEffortRows(members = []) {
  return (members || []).map((r) => ({
    id: `${r.role}-${r.emp_id}`,
    role: r.role || "",
    empId: r.emp_id,
    empName: r.emp_name || "—",
    effortDays: Number(r.effort_days) || 0,
    bufferDays: Number(r.buffer_days) || 0,
  }));
}

/** documents (backend shape, documentsWithStatus) -> the rows DocumentChecklist/useDocumentChecklist expects. */
export function mapViewToDocuments(documents = []) {
  return (documents || []).map((d, i) => ({
    id: d.document_id ? `doc-${d.document_id}` : `custom-${i}`,
    documentId: d.document_id || null,
    name: d.document_name || "Document",
    icon:
      ICON_BY_DOC_NAME[String(d.document_name).toLowerCase()] || "file-text",
    status: d.status || "Pending",
    uploadedBy: d.uploaded_by || "—",
    uploadDate: d.uploaded_date ? formatProjectDate(d.uploaded_date) : "—",
    link: d.sharepoint_url || "",
  }));
}
