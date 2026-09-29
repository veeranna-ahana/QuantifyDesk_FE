import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import { getImportedProject } from "@/features/projects/services/projectsService";
import { updateImportProject } from "@/features/projects/services/importProjectService";

import { DETAIL_TABS } from "../constants";
import { deriveEffortRowsFromTasks } from "../utils/deriveEffortRows";
import {
  mapViewToDocuments,
  mapViewToEffortRows,
  mapViewToMilestones,
} from "../utils/mapProjectView";

const TAB_IDS = DETAIL_TABS.map((t) => t.id);

/** Applies the Project Info form's edited fields onto the nested project_info sub-object (both snake_case and camelCase keys, since ProjectInfoForm/ProjectInfoPanel use camelCase). */
const applyFormFields = (prevProjectInfo, f) => ({
  ...prevProjectInfo,
  project_type: f.projectType ?? prevProjectInfo?.project_type,
  projectType: f.projectType ?? prevProjectInfo?.projectType,
  nbd_id: f.nbdId ?? prevProjectInfo?.nbd_id,
  nbdId: f.nbdId ?? prevProjectInfo?.nbdId,
  o2d_id: f.o2dId ?? prevProjectInfo?.o2d_id,
  o2dId: f.o2dId ?? prevProjectInfo?.o2dId,
  project_code: f.projectCode ?? prevProjectInfo?.project_code,
  projectCode: f.projectCode ?? prevProjectInfo?.projectCode,
  sub_category: f.subCategory ?? prevProjectInfo?.sub_category,
  subCategory: f.subCategory ?? prevProjectInfo?.subCategory,
  description: f.description ?? prevProjectInfo?.description,
});

/**
 * State + actions for the project view / edit screen (tabs, edit mode, save).
 *
 * Save posts everything the four editable tabs (Project Info, Task Info, Effort Details,
 * Documents Checklist) currently hold, in one PUT to the same `/api/import-project/:id` the
 * Import wizard's Create Project posts to (see updateImportProject / the backend's
 * updateProjectInfo) — task_info is upserted per task, effort_estimate is fully replaced, and
 * document_checklist is upserted per document. After a successful save, the whole project is
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
  const [isEditing, setIsEditing] = useState(false);
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
    // Same Task Info -> Effort Estimate connection as the Create wizard: any (role, owner) pair
    // already tagged in Task Info but not yet an Effort Estimate row gets added here too, so an
    // existing project that was tagged before this feature existed catches up on load.
    const seeded = deriveEffortRowsFromTasks(milestones, baseEffortRows);
    setTaskMilestones(milestones);
    setEffortRows(
      seeded.length ? [...baseEffortRows, ...seeded] : baseEffortRows,
    );
    setDocuments(mapViewToDocuments(data?.documents));
    return data;
  };

  // Wrapped so every Task Info edit in Edit mode also seeds any newly-tagged (role, owner) pair
  // into Effort Estimate — additive only, see deriveEffortRowsFromTasks for the exact rules.
  const handleTaskMilestonesChange = (next) => {
    setTaskMilestones(next);
    setEffortRows((prev) => {
      const seeded = deriveEffortRowsFromTasks(next, prev);
      return seeded.length ? [...prev, ...seeded] : prev;
    });
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

  const save = async (fields) => {
    const info = fields || formData;
    try {
      const payload = {
        project_info: {
          project_type:
            info?.projectType ?? project?.project_info?.project_type ?? null,
          nbd_id: info?.nbdId ?? project?.project_info?.nbd_id ?? null,
          o2d_id: info?.o2dId ?? project?.project_info?.o2d_id ?? null,
          project_code:
            info?.projectCode ?? project?.project_info?.project_code ?? null,
          sub_category:
            info?.subCategory ?? project?.project_info?.sub_category ?? null,
        },
        // Same shape as the Import wizard's Create Project payload (mapPmsSync's pmsTaskId /
        // pmsEmpId), since Task Info's tasks here came from the same mapViewToMilestones mapper.
        tasks: taskMilestones.flatMap((m) =>
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
        ),
        effort_estimates: effortRows.map((r) => ({
          emp_id: r.empId,
          role: r.role,
          effort_days: r.effortDays,
          buffer_days: r.bufferDays,
        })),
        documents: documents
          .filter((d) => d.link)
          .map((d) => ({
            document_id: d.documentId || null,
            document_name: d.documentId ? null : d.name,
            sharepoint_url: d.link,
          })),
      };

      await updateImportProject(id, payload);
      await loadProject(); // reload from the DB so every tab reflects exactly what was saved
      toast.success("Project updated successfully!");
      setIsEditing(false);
      setFormData(null);
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.response?.data?.message || "Failed to update project.");
    }
  };

  // Cancel discards ALL unsaved edits across all four tabs (not just Project Info's `formData`)
  // by refetching the real, currently-saved data from the server — Task Info/Effort
  // Details/Documents Checklist are lifted state here too, so simply flipping `isEditing` off
  // would otherwise leave whatever was typed on those tabs sitting around unsaved.
  const cancelEdit = async () => {
    setIsEditing(false);
    setFormData(null);
    try {
      await loadProject();
    } catch (err) {
      console.error(err);
    }
  };

  const goToTab = (tab, fields) => {
    if (fields) {
      setFormData((prev) => ({ ...prev, ...fields }));
      setProject((prev) =>
        prev
          ? {
              ...prev,
              project_info: applyFormFields(prev.project_info, fields),
            }
          : prev,
      );
    }
    setActiveTab(tab);
  };

  return {
    project,
    loading,
    activeTab,
    setActiveTab,
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    save,
    cancelEdit,
    goToTab,
    taskMilestones,
    setTaskMilestones: handleTaskMilestonesChange,
    effortRows,
    setEffortRows,
    documents,
    setDocuments,
  };
}
