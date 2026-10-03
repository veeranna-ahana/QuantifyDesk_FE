import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

import { getRoles, getTaskTypesByRole } from "../services/importProjectService";

const withCurrent = (options, value) =>
  value && !options.includes(value) ? [value, ...options] : options;

function Detail({ label, value, className }) {
  return (
    <div className={className}>
      <div className="text-[11px] text-ink-muted">{label}</div>
      <div className="text-[13px] font-medium text-ink-primary">
        {value || "—"}
      </div>
    </div>
  );
}

/**
 * Edit Task Details panel: PMS values read-only, Role / Task Type / Unit editable.
 *
 * Role comes from GET /api/import-project/roles (role_task_catalog's distinct roles).
 * Task Type depends on the selected Role — GET /api/import-project/task-catalog?role=X
 * returns that role's task_name list (e.g. role=BA -> "BA-BRD", "BA-TDD", ...). Changing
 * Role clears the current Task Type, since the old value may not belong to the new role's list.
 *
 * IMPORTANT: both Selects use a real `placeholder` (shown only when nothing is chosen yet) —
 * never a placeholder that doubles as a fake pre-selected value. That earlier pattern
 * (`placeholder="Business Analyst"`) LOOKED selected in the closed dropdown but the actual
 * value stayed "", so Save silently persisted nothing for Role/Task Type — only Unit (a plain
 * text input) actually had a real value to save.
 */
export function EditTaskDrawer({
  task,
  values,
  onChange,
  onCancel,
  onSave,
  projectContext,
}) {
  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: async () => (await getRoles())?.roles || [],
    staleTime: 5 * 60 * 1000,
  });

  const taskTypesQuery = useQuery({
    queryKey: ["task-catalog", values.role],
    queryFn: async () =>
      (await getTaskTypesByRole(values.role))?.taskTypes || [],
    enabled: Boolean(values.role),
    staleTime: 5 * 60 * 1000,
  });

  const roleOptions = rolesQuery.data || [];
  const taskTypeOptions = taskTypesQuery.data || [];

  const changeRole = (e) => {
    onChange("role", e.target.value);
    onChange("taskType", ""); // old task type may not belong to the newly picked role
  };

  return (
    <Drawer
      open={Boolean(task)}
      title="Edit Task Details"
      taskId={task?.taskId}
      context={
        task
          ? `Milestone: ${task.milestone ?? "—"} · ${projectContext.projectName} (${projectContext.pmsId})`
          : undefined
      }
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save</Button>
        </>
      }
    >
      {task && (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-chip border border-line-card bg-surface-field-disabled p-3">
            <Detail label="Milestone" value={task.milestone} />
            <Detail label="Task Title" value={task.title} />
            <Detail label="Task Owner" value={task.owner} />
            {/* PMS's own raw status wording (e.g. "YET_TO_START"), same as the Status badge in
                TaskTable — not the translated "Not Started" bucket used internally for filtering. */}
            <Detail label="Status" value={task.statusLabel || task.status} />
            <Detail label="Planned Start" value={task.plannedStart} />
            <Detail label="Actual Start" value={task.actualStart} />
            <Detail label="Planned End" value={task.plannedEnd} />
            <Detail label="Actual End" value={task.actualEnd} />
            <Detail
              label="Risk Category"
              value={task.riskCategory}
              className="col-span-2"
            />
            <Detail label="Remark" value={task.remark} className="col-span-2" />
          </div>
          <Select
            label="Role"
            placeholder="Select Role"
            value={values.role}
            options={withCurrent(roleOptions, values.role)}
            onChange={changeRole}
          />
          <Select
            label="Task Type"
            placeholder={
              values.role ? "Select Task Type" : "Select a Role first"
            }
            value={values.taskType}
            options={withCurrent(taskTypeOptions, values.taskType)}
            onChange={(e) => onChange("taskType", e.target.value)}
            disabled={!values.role}
          />
          <Input
            label="Unit"
            type="number"
            min="0"
            value={values.unit}
            onChange={(e) => onChange("unit", e.target.value)}
          />
        </>
      )}
    </Drawer>
  );
}
