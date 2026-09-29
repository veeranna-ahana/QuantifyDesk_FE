import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { WIZARD_STEPS } from "../constants";
import {
  syncPmsProject,
  getProjectTypes,
  createImportProject,
} from "../services/importProjectService";
import { deriveEffortRowsFromTasks } from "../utils/deriveEffortRows";
import {
  mapPmsToMilestones,
  mapProjectDetailsToPmsFields,
} from "../utils/mapPmsSync";

const EMPTY_PMS = {
  projectName: "",
  customer: "",
  presaleId: "",
  startDate: "",
  endDate: "",
  description: "",
  status: "",
};
const EMPTY_FORM = {
  projectType: "",
  nbdId: "",
  o2dId: "",
  projectCode: "",
  subCategory: "",
};

/**
 * State for the 4-step Import Project wizard: current step, PMS sync (real API,
 * via react-query) and the manual fields. Project Type options come from the
 * backend (project_type_catalog), not a hardcoded frontend list.
 */
export function useImportProjectWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [pmsId, setPmsIdRaw] = useState("");
  const [synced, setSynced] = useState(false);
  const [pms, setPms] = useState(EMPTY_PMS);
  const [form, setForm] = useState(EMPTY_FORM);
  const [taskMilestones, setTaskMilestones] = useState([]);
  const [effortRows, setEffortRows] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [creating, setCreating] = useState(false);

  // Backend-maintained Project Type dropdown (One Time Project / Managed
  // Service / Staff Augmentation). No value is auto-selected — the user must
  // explicitly pick one; the field starts on the "Select Project Type" placeholder.
  const projectTypesQuery = useQuery({
    queryKey: ["project-types"],
    queryFn: async () => {
      const data = await getProjectTypes();
      return { projectTypes: data?.projectTypes || [] };
    },
    staleTime: 5 * 60 * 1000,
  });

  const setPmsId = (v) => {
    setPmsIdRaw(v);
    setSynced(false);
  };

  // Task Info (Step 2) -> Effort Estimate (Step 3) connection: whenever a task's Role tag
  // changes, any newly-tagged (role, PMS owner) pair not already an Effort Estimate row gets
  // added automatically — additive only, never removes or overwrites a row the user has already
  // filled hours into. See deriveEffortRowsFromTasks for the exact rules.
  const handleTaskMilestonesChange = (next) => {
    setTaskMilestones(next);
    setEffortRows((prev) => {
      const seeded = deriveEffortRowsFromTasks(next, prev);
      return seeded.length ? [...prev, ...seeded] : prev;
    });
  };

  const syncMutation = useMutation({
    mutationFn: (id) => syncPmsProject(id),
    onSuccess: (data) => {
      const { projectDetails, milestoneDetails, tasksDetails } = data || {};
      if (!projectDetails) {
        toast.error("Project not found in PMS.");
        setSynced(false);
        return;
      }
      setPms(mapProjectDetailsToPmsFields(projectDetails));
      // Freshly synced tasks always start with role='' (see mapPmsToMilestones), so this can't
      // seed anything yet — routed through the same handler anyway so the two never drift apart.
      // (handleSync below already cleared form/effortRows/documents before this call went out,
      // so this seeds from a clean slate, not a previous project's rows.)
      handleTaskMilestonesChange(
        mapPmsToMilestones(milestoneDetails, tasksDetails),
      );
      setSynced(true);
    },
    onError: (err) => {
      const message =
        err.response?.data?.message || "Failed to sync project from PMS.";
      toast.error(message);
      setSynced(false);
      // Nothing else to reset here — handleSync already cleared every field below before this
      // request was even sent, so a rejected/failed sync (e.g. a non-APPROVED PMS status) is
      // never left showing the PREVIOUS PMS ID's data, which is what made a rejected sync look
      // like it had silently kept and carried forward the old project's values.
    },
  });

  const handleSync = () => {
    if (!pmsId.trim()) return;
    // Clear every field BEFORE the request goes out (not just on success) — otherwise a sync
    // that fails or gets rejected (e.g. status isn't APPROVED) leaves whatever the PREVIOUS PMS
    // ID populated still sitting in the form/Task Info/Effort Estimate/Documents, which is wrong
    // for this new PMS ID regardless of whether the new sync itself succeeds.
    setPms(EMPTY_PMS);
    setForm(EMPTY_FORM);
    setTaskMilestones([]);
    setEffortRows([]);
    setDocuments([]);
    syncMutation.mutate(pmsId.trim());
  };

  /** Single object in the shape ProjectInfoForm expects. */
  const values = { ...pms, ...form };
  const changeValue = (field, value) => {
    if (field === "description") return; // description is a read-only PMS field, in every mode
    setForm((f) => ({ ...f, [field]: value }));
  };

  return {
    step,
    steps: WIZARD_STEPS,
    goTo: (id) => id < step && setStep(id), // only completed steps are clickable
    next: () => setStep((s) => Math.min(s + 1, WIZARD_STEPS.length)),
    back: () => setStep((s) => Math.max(s - 1, 1)),
    cancel: () => navigate("/projects"),
    // Collects Steps 1-4 into the shape POST /api/import-project expects, and sends only what
    // we actually own — PMS-owned fields (title, dates, status, description, task title/owner,
    // dependency, etc.) are never sent, since the backend re-derives all of that live from PMS
    // by pms_project_id. `documents` only includes rows that actually got a link — a document
    // left "Pending" just isn't sent, and stays Pending until someone adds a link later.
    create: async () => {
      if (!pmsId.trim()) {
        toast.error("Sync a PMS project first.");
        return;
      }
      setCreating(true);
      try {
        const payload = {
          pms_project_id: pmsId.trim(),
          project_info: {
            project_type: form.projectType || null,
            nbd_id: form.nbdId || null,
            o2d_id: form.o2dId || null,
            project_code: form.projectCode || null,
            sub_category: form.subCategory || null,
          },
          tasks: taskMilestones.flatMap((m) =>
            (m.tasks || [])
              .filter((t) => t.pmsTaskId)
              .map((t) => ({
                pms_task_id: t.pmsTaskId,
                // Defaults to PMS's own assignee for this task (confirmed present on every
                // task) — role/task_type/unit are ours to overlay, emp_id currently has no
                // separate overlay UI, so this is what task_info.emp_id gets at creation.
                emp_id: t.pmsEmpId || null,
                role: t.role || null,
                task_type: t.taskType || null,
                unit: t.unit || null,
              })),
          ),
          effort_estimates: effortRows.map((r) => ({
            emp_id: r.empId,
            role: r.role,
            effort_days: r.effortDays,
            buffer_days: r.bufferDays,
          })),
          // A checklist document is either one of the 16 fixed document_master rows
          // (documentId set) or a custom one from "Add Document" (documentId null, only a
          // name) — send whichever identifier it actually has, not just document_id, or a
          // custom document's link silently never gets persisted.
          documents: documents
            .filter((d) => d.link)
            .map((d) => ({
              document_id: d.documentId || null,
              document_name: d.documentId ? null : d.name,
              sharepoint_url: d.link,
            })),
        };

        // axiosInstance's response interceptor already unwraps to response.data, so this IS
        // the { message, project_info_id, pms_project_id } body, not an axios response.
        const data = await createImportProject(payload);
        toast.success(data?.message || "Project created successfully!");
        navigate("/projects");
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to create project.";
        toast.error(message);
      } finally {
        setCreating(false);
      }
    },
    creating,
    pmsId,
    setPmsId,
    synced,
    syncing: syncMutation.isPending,
    handleSync,
    values,
    changeValue,
    // The wizard hook is the one thing that survives step navigation (its own state isn't
    // unmounted when a step's component is), so Task Info's edits are written back here via
    // setTaskMilestones rather than living in TaskInfoPanel/useTaskInfo's own local state —
    // otherwise leaving and returning to Step 2 silently discarded every edit. Wrapped so every
    // Task Info change also seeds any newly-tagged (role, owner) pair into Effort Estimate.
    taskMilestones,
    setTaskMilestones: handleTaskMilestonesChange,
    // Same reasoning as taskMilestones above: Effort Estimate's added/removed members must live
    // here, not in EffortPanel/useEffortEstimate's own state, or they're lost on step navigation.
    effortRows,
    setEffortRows,
    // Document Checklist (Step 4): same reasoning — added links must live here so they survive
    // step navigation, and this is also what gets sent (as `documents`) to Create Project.
    documents,
    setDocuments,
    projectTypeOptions: projectTypesQuery.data?.projectTypes || [],
  };
}
