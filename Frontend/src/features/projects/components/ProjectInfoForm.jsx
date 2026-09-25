import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

import { PROJECT_STATUS_OPTIONS, PROJECT_TYPE_OPTIONS } from '../constants';

const withCurrent = (options, value) => (value && !options.includes(value) ? [value, ...options] : options);

/** Label with an optional "FROM PMS" tag (shown after a PMS sync in the import wizard). */
const pmsLabel = (text, show) => (
  <span className="inline-flex items-center gap-1.5">
    {text}
    {show && <Badge variant="brand" size="sm" className="px-1.5 py-0.5 text-[9px] uppercase">From PMS</Badge>}
  </span>
);

/**
 * Project Info fields, shared by import step 1 and the project view/edit tab.
 *
 *   mode="import" | "edit": Project Type, NBD ID, O2D ID, Project Code, Sub Category and Description are editable
 *   mode="view":            everything read-only
 * Fields that come from PMS (name, customer, presale ID, dates, status) are always read-only.
 *
 * values: { projectName, projectType, customer, presaleId, nbdId, o2dId, projectCode, subCategory, startDate, endDate, status, description }
 */
export function ProjectInfoForm({ mode, values, onChange, pmsSlot, synced = false }) {
  const editable = mode !== 'view';
  const set = (field) => (e) => onChange(field, e.target.value);
  const ph = mode === 'import';

  return (
    <Card className="flex flex-col gap-3 p-4">
      {pmsSlot}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Input label={pmsLabel('Project Name*', synced)} value={values.projectName} placeholder={ph ? 'FMS' : undefined} readOnly />
        <Select label="Project Type" id="project-type-select" placeholder={ph ? 'One Time Project' : undefined} value={values.projectType} options={withCurrent(PROJECT_TYPE_OPTIONS, values.projectType)} onChange={set('projectType')} disabled={!editable} />
        <Select label={pmsLabel('Customer Name', synced)} id="customer-name-select" value={values.customer} options={withCurrent([], values.customer)} placeholder={values.customer ? undefined : 'Ahana IT'} disabled />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input label={pmsLabel('Presale ID', synced)} value={values.presaleId} placeholder="Presale ID" readOnly />
        <Input label="NBD ID" id="nbd-id-input" placeholder="eg 1234" value={values.nbdId} onChange={set('nbdId')} readOnly={!editable} />
        <Input label="O2D ID" id="o2d-id-input" placeholder="eg 1234" value={values.o2dId} onChange={set('o2dId')} readOnly={!editable} />
        <Input label="Project Code" id="project-code-input" placeholder="eg 1234" value={values.projectCode} onChange={set('projectCode')} readOnly={!editable} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Sub Category" id="sub-category-input" placeholder="FMS" value={values.subCategory} onChange={set('subCategory')} readOnly={!editable} />
        <Input label={pmsLabel('Start Date', synced)} value={values.startDate} placeholder={ph ? '09/08/2026' : undefined} readOnly />
        <Input label={pmsLabel('End Date', synced)} value={values.endDate} placeholder={ph ? '08/09/2026' : undefined} readOnly />
        <Select label={pmsLabel('Project Status', synced)} id="project-status-select" value={values.status} options={withCurrent(PROJECT_STATUS_OPTIONS, values.status)} placeholder={values.status ? undefined : 'Completed'} disabled />
      </div>

      <Textarea label={pmsLabel('Description', synced)} id="description-input" rows={ph ? 4 : 3} placeholder="Enter high-level project objectives and scope..." value={values.description} onChange={set('description')} readOnly={!editable} />
    </Card>
  );
}
