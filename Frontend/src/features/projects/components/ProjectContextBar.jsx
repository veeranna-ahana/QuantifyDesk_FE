import { Building2 } from 'lucide-react';

/** "FMS | PMS ID: PMS-9021" pill shown in the corner of wizard / tab cards. */
export function ProjectContextBar({ projectName, pmsId }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-chip border border-line-field bg-surface-field-disabled px-3 py-1.5 text-xs text-ink-secondary shadow-header">
      <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="font-semibold text-ink-primary">{projectName}</span>
      <span aria-hidden="true" className="h-3 w-px bg-line" />
      <span>PMS ID: {pmsId}</span>
    </div>
  );
}
