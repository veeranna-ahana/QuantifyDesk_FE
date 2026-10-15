import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import { getImportedProject } from "@/features/projects/services/projectsService";
import { updateImportProject } from "@/features/projects/services/importProjectService";

import { DETAIL_TABS } from "../constants";
import {
  mapViewToDocuments,
  mapViewToEffortRows,
  mapViewToMilestones,
} from "../utils/mapProjectView";

const TAB_IDS = DETAIL_TABS.map((t) => t.id);

/**
 * State + actions for the project view / edit screen (tabs, edit mode, save).
 *
 * Each editable tab (Project Info, Task Info, Effort Details, Documents Checklist) has its own
 * Edit / Update: saveTab PUTs only that tab's section to `/api/import-project/:id` (the same
 * endpoint the Import wizard uses) — task_info is upserted per task, effort_estimate is fully
 * replaced, document_checklist is upserted per document. After a successful save, the project is
 * refetched so every tab (and Project Overview) shows exactly what's now in the DB, rather than
 * trusting an optimistic local patch.
 */
export function useProjectDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "Project Overview",
  );
  // Which tab is currently being edited (null = viewing). Each of the four editable tabs has its
  // own Edit / Cancel / Update, and Update saves only that tab.
  const [editingTab, setEditingTab] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);

  // Task Info / Effort Details / Documents Checklist tabs need their own lifted state (same
  // controlled-hook pattern as the Import wizard) so edits survive switching tabs, which
  // unmounts each panel. Seeded from the real view API response below — no mock fallback.
  const [taskMilestones, setTaskMilestones] = useState([]);
  const [effortRows, setEffortRows] = useState([]);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && TAB_IDS.includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  // getImportedProject returns { project_info, task_info, effort_estimates, documents,
  // overview } — `project` here is that whole response, not just project_info, so consumers
  // (ProjectDetailsPage, ProjectOverview) read the sub-object they need.
  const loadProject = async () => {
    const data = await getImportedProject(id);
    setProject(data);
    const milestones = mapViewToMilestones(data?.task_info?.milestones);
    const baseEffortRows = mapViewToEffortRows(data?.effort_estimates?.members);
    setTaskMilestones(milestones);
    setEffortRows(baseEffortRows);
    setDocuments(mapViewToDocuments(data?.documents));
    return data;
  };

  // Task Info no longer auto-seeds Effort Estimate rows (see the Import wizard's
  // useImportProjectWizard.js for the full rationale) — tagging a task's Role in Task Info no
  // longer adds that task's owner as a member under that role here; members are added manually.
  const handleTaskMilestonesChange = (next) => {
    setTaskMilestones(next);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        await loadProject();
      } catch (err) {
        console.error(err);
        if (mounted) {
          setProject(null);
          setTaskMilestones([]);
          setEffortRows([]);
          setDocuments([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Saves ONLY the given tab. The backend leaves any section that isn't in the body untouched,
  // so e.g. updating Effort Details can never overwrite Task Info or the Documents Checklist.
  const saveTab = async (tab, fields) => {
    const info = fields || formData;
    const payload = {};
    if (tab === "Project Info") {
      payload.project_info = {
        project_type:
          info?.projectType ?? project?.project_info?.project_type ?? null,
        nbd_id: info?.nbdId ?? project?.project_info?.nbd_id ?? null,
        o2d_id: info?.o2dId ?? project?.project_info?.o2d_id ?? null,
        project_code:
          info?.projectCode ?? project?.project_info?.project_code ?? null,
        sub_category:
          info?.subCategory ?? project?.project_info?.sub_category ?? null,
        tech_stack_ids:
          info?.techStackIds ?? project?.project_info?.tech_stack_ids ?? [],
        tech_lead_emp_id:
          info?.techLeadEmpId ??
          project?.project_info?.tech_lead_emp_id ??
          null,
        project_manager_emp_id:
          info?.projectManagerEmpId ??
          project?.project_info?.project_manager_emp_id ??
          null,
      };
    } else if (tab === "Task Info") {
      // Same shape as the Import wizard's payload (pmsTaskId / pmsEmpId from mapViewToMilestones).
      payload.tasks = taskMilestones.flatMap((m) =>
        (m.tasks || [])
          .filter((t) => t.pmsTaskId)
          .map((t) => ({
            pms_task_id: t.pmsTaskId,
            emp_id: t.pmsEmpId || null,
            role: t.role || null,
            task_type: t.taskType || null,
            unit: t.unit || null,
            // Risk Category / Remark are PMS-owned, read-only fields — never sent back.
          })),
      );
    } else if (tab === "Effort Details") {
      payload.effort_estimates = effortRows.map((r) => ({
        emp_id: r.empId,
        role: r.role,
        effort_days: Number(r.effortDays) || 0,
        buffer_days: Number(r.bufferDays) || 0,
      }));
    } else if (tab === "Documents Checklist") {
      payload.documents = documents
        .filter((d) => d.link)
        .map((d) => ({
          document_id: d.documentId || null,
          document_name: d.documentId ? null : d.name,
          sharepoint_url: d.link,
        }));
    } else return;

    setSaving(true);
    try {
      await updateImportProject(id, payload);
      await loadProject(); // reload from the DB so every tab reflects exactly what was saved
      toast.success(`${tab} updated successfully!`);
      setEditingTab(null);
      setFormData(null);
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.response?.data?.message || "Failed to update project.");
    } finally {
      setSaving(false);
    }
  };

  // Cancel discards the unsaved edits (every editable tab's state is lifted here) by refetching
  // what is currently saved on the server.
  const cancelEdit = async () => {
    setEditingTab(null);
    setFormData(null);
    try {
      await loadProject();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (tab) => {
    setActiveTab(tab);
    setEditingTab(tab);
  };

  // Leaving a tab mid-edit would leave stale unsaved state behind, so confirm and discard it.
  const changeTab = (tab) => {
    if (editingTab && tab !== editingTab) {
      if (!window.confirm("You have unsaved changes. Discard them?")) return;
      cancelEdit();
    }
    setActiveTab(tab);
  };

  return {
    project,
    loading,
    activeTab,
    setActiveTab,
    changeTab,
    editingTab,
    startEdit,
    saving,
    formData,
    setFormData,
    saveTab,
    cancelEdit,
    taskMilestones,
    setTaskMilestones: handleTaskMilestonesChange,
    effortRows,
    setEffortRows,
    documents,
    setDocuments,
  };
}
