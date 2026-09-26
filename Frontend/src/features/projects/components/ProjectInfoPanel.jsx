import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';

import { ProjectInfoForm } from './ProjectInfoForm';

const DEFAULT_DESCRIPTION =
  'Implementation of the new Fleet Management System (FMS) for Enterprise IT Operations. This project involves migrating legacy data, setting up new server infrastructure, and training core personnel on the updated compliance tracking modules. High-level objectives include a 20% reduction in reporting latency and full integration with the existing HR datastore.';

/** Reads a project value that may arrive as snake_case or camelCase. */
const pick = (project, ...keys) => keys.map((k) => project?.[k]).find((v) => v) || '';

/** Project Info tab (view + edit). Editable fields are held locally and reported to the page via onFormChange. */
export function ProjectInfoPanel({ project, isEditing, onCancel, onNext, onFormChange }) {
  const navigate = useNavigate();

  // Display values (fallbacks match the Figma placeholders until the API returns everything)
  const display = {
    projectName: pick(project, 'project_name', 'projectName', 'name') || 'FMS',
    projectType: pick(project, 'project_type', 'projectType') || 'One Time Project',
    customer: pick(project, 'client_name', 'customer') || 'Ahana IT',
    presaleId: pick(project, 'presale_id', 'presaleId'),
    nbdId: pick(project, 'nbd_id', 'nbdId') || '1234',
    o2dId: pick(project, 'o2d_id', 'o2dId') || '1234',
    projectCode: pick(project, 'project_code', 'projectCode') || '1234',
    subCategory: pick(project, 'sub_category', 'subCategory') || 'FMS',
    startDate: project?.formStartDate || '09/08/2026',
    endDate: project?.formEndDate || '08/09/2026',
    status: project?.status || 'Completed',
    description: project?.description || DEFAULT_DESCRIPTION,
  };
  const pmsId = project?.pmsDisplayId || 'PMS1234';

  const initialEditable = () => ({ projectType: display.projectType, nbdId: display.nbdId, o2dId: display.o2dId, projectCode: display.projectCode, subCategory: display.subCategory, description: display.description });
  const [editable, setEditable] = useState(initialEditable);

  // Reset the draft whenever the project loads or edit mode toggles.
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => { setEditable(initialEditable()); }, [project, isEditing]);
  useEffect(() => { onFormChange?.(editable); }, [editable, onFormChange]);

  const handleCancel = () => {
    if (isEditing) { setEditable(initialEditable()); onCancel?.(); } else navigate('/projects');
  };

  return (
    <div className="flex flex-col gap-4">
      <ProjectInfoForm
        mode={isEditing ? 'edit' : 'view'}
        values={{ ...display, ...editable }}
        onChange={(field, value) => setEditable((prev) => ({ ...prev, [field]: value }))}
        pmsSlot={
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-ink-primary">PMS ID</span>
            <span className="w-full max-w-[16rem] rounded-control border border-line-field bg-surface-field-disabled px-3 py-2.5 text-sm text-ink-secondary">{pmsId}</span>
          </div>
        }
      />
      {isEditing && (
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
          <Button rightIcon={<ArrowRight className="h-4 w-4" />} onClick={() => onNext?.(editable)}>Next:</Button>
        </div>
      )}
    </div>
  );
}
