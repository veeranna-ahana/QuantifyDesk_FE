import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

import { PROJECT_STATUS_OPTIONS, PROJECT_TYPE_OPTIONS } from "../constants";

const withCurrent = (options, value) =>
  value && !options.includes(value) ? [value, ...options] : options;

/**
 * Project Info fields, shared by import step 1 and the project view/edit tab.
 *
 *   mode="import" | "edit": Project Type, NBD ID, O2D ID, Project Code and Sub Category are editable
 *   mode="view":            everything read-only
 * Fields that come from PMS (name, customer, presale ID, dates, status, description) are always
 * read-only — Description in particular is never editable, in any mode, including Edit Project.
 *
 * projectTypeOptions: Project Type values fetched from the backend (project_type_catalog) via
 * GET /api/import-project/project-types. Falls back to the local constant only if that hasn't
 * loaded yet, so the dropdown never renders empty.
 *
 * values: { projectName, projectType, customer, presaleId, nbdId, o2dId, projectCode, subCategory, startDate, endDate, status, description }
 *
 * No placeholder text anywhere: an empty PMS field just displays "—", never example/fake data
 * that could be mistaken for a real value.
 */
const EMPTY = "—";

export function ProjectInfoForm({
  mode,
  values,
  onChange,
  pmsSlot,
  projectTypeOptions,
}) {
  const editable = mode !== "view";
  const set = (field) => (e) => onChange(field, e.target.value);
  const typeOptions = projectTypeOptions?.length
    ? projectTypeOptions
    : PROJECT_TYPE_OPTIONS;
  const show = (v) => v || EMPTY;

  return (
    <Card className="flex flex-col gap-3 p-4">
      {pmsSlot}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Input
          label="Project Name*"
          value={show(values.projectName)}
          readOnly
        />
        <Select
          label="Project Type"
          id="project-type-select"
          placeholder="Select Project Type"
          value={values.projectType}
          options={withCurrent(typeOptions, values.projectType)}
          onChange={set("projectType")}
          disabled={!editable}
          className={editable ? "!bg-white" : undefined}
        />
        <Select
          label="Customer Name"
          id="customer-name-select"
          value={show(values.customer)}
          options={withCurrent([EMPTY], show(values.customer))}
          disabled
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Presale ID" value={show(values.presaleId)} readOnly />
        <Input
          label="NBD ID"
          id="nbd-id-input"
          value={values.nbdId}
          onChange={set("nbdId")}
          readOnly={!editable}
        />
        <Input
          label="O2D ID"
          id="o2d-id-input"
          value={values.o2dId}
          onChange={set("o2dId")}
          readOnly={!editable}
        />
        <Input
          label="Project Code"
          id="project-code-input"
          value={values.projectCode}
          onChange={set("projectCode")}
          readOnly={!editable}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Sub Category"
          id="sub-category-input"
          value={values.subCategory}
          onChange={set("subCategory")}
          readOnly={!editable}
        />
        <Input label="Start Date" value={show(values.startDate)} readOnly />
        <Input label="End Date" value={show(values.endDate)} readOnly />
        <Select
          label="Project Status"
          id="project-status-select"
          value={show(values.status)}
          options={withCurrent(PROJECT_STATUS_OPTIONS, show(values.status))}
          disabled
        />
      </div>

      <Textarea
        label="Description"
        id="description-input"
        rows={3}
        value={show(values.description)}
        readOnly
      />
    </Card>
  );
}
