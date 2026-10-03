import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/Button";

import { getProjectTypes } from "../services/importProjectService";
import { formatProjectDate } from "../utils/formatProjectDate";

import { ProjectInfoForm } from "./ProjectInfoForm";

/** Reads a project value that may arrive as snake_case or camelCase. */
const pick = (project, ...keys) =>
  keys.map((k) => project?.[k]).find((v) => v) || "";

/**
 * Project Info tab (view + edit). Editable fields are held locally and reported to the page via
 * onFormChange.
 *
 * `display` reads the real `project_info` shape from GET /api/import-project/:id (project_name,
 * project_type, customer_name, presale_id, nbd_id, o2d_id, project_code, sub_category,
 * start_date, end_date, project_status, description, pms_id) — no mock fallback for any field.
 * This matters beyond just showing '—' correctly: `editable` (what Save actually submits) is
 * seeded FROM `display`, so a fake fallback here would silently get written to the DB as a real
 * value the moment someone hits Save without touching that field.
 */
export function ProjectInfoPanel({
  project,
  isEditing,
  onCancel,
  onNext,
  onFormChange,
}) {
  const navigate = useNavigate();

  const { data: projectTypesData } = useQuery({
    queryKey: ["project-types"],
    queryFn: getProjectTypes,
    staleTime: 5 * 60 * 1000,
  });
  const projectTypeOptions = projectTypesData?.projectTypes || [];

  const display = {
    projectName: pick(project, "project_name", "projectName", "name") || "—",
    projectType: pick(project, "project_type", "projectType"),
    customer: pick(project, "customer_name", "client_name", "customer") || "—",
    presaleId: pick(project, "presale_id", "presaleId"),
    nbdId: pick(project, "nbd_id", "nbdId"),
    o2dId: pick(project, "o2d_id", "o2dId"),
    projectCode: pick(project, "project_code", "projectCode"),
    subCategory: pick(project, "sub_category", "subCategory"),
    startDate: project?.start_date
      ? formatProjectDate(project.start_date)
      : "—",
    endDate: project?.end_date ? formatProjectDate(project.end_date) : "—",
    status: pick(project, "project_status", "status") || "—",
    description: project?.description || "—",
  };
  const initialEditable = () => ({
    projectType: display.projectType,
    nbdId: display.nbdId,
    o2dId: display.o2dId,
    projectCode: display.projectCode,
    subCategory: display.subCategory,
    description: display.description,
  });
  const [editable, setEditable] = useState(initialEditable);

  // Reset the draft whenever the project loads or edit mode toggles.
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => {
    setEditable(initialEditable());
  }, [project, isEditing]);
  useEffect(() => {
    onFormChange?.(editable);
  }, [editable, onFormChange]);

  const handleCancel = () => {
    if (isEditing) {
      setEditable(initialEditable());
      onCancel?.();
    } else navigate("/projects");
  };

  return (
    <div className="flex flex-col gap-4">
      <ProjectInfoForm
        mode={isEditing ? "edit" : "view"}
        values={{ ...display, ...editable }}
        onChange={(field, value) =>
          setEditable((prev) => ({ ...prev, [field]: value }))
        }
        projectTypeOptions={projectTypeOptions}
      />
      {isEditing && (
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            rightIcon={<ArrowRight className="h-4 w-4" />}
            onClick={() => onNext?.(editable)}
          >
            Next:
          </Button>
        </div>
      )}
    </div>
  );
}
