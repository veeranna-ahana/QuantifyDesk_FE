import { Building2, Calendar, Hash, Loader2, Pencil, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { statusVariant } from '@/lib/status';

import { DocumentChecklist } from '../components/DocumentChecklist';
import { EffortPanel } from '../components/EffortPanel';
import { ProjectInfoPanel } from '../components/ProjectInfoPanel';
import { ProjectOverview } from '../components/ProjectOverview';
import { TaskInfoPanel } from '../components/TaskInfoPanel';
import { TimesheetPanel } from '../components/TimesheetPanel';
import { DETAIL_TABS } from '../constants';
import { useProjectDetails } from '../hooks/useProjectDetails';

const TAB_ORDER = DETAIL_TABS.map((t) => t.id);
const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

// eslint-disable-next-line no-unused-vars
function Meta({ icon: Icon, children }) {
  return <span className="inline-flex items-center gap-1 text-xs text-ink-secondary"><Icon className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />{children}</span>;
}

/** Project view / edit screen: header, tab bar and the active tab's panel. */
export default function ProjectDetailsPage() {
  const navigate = useNavigate();
  const d = useProjectDetails();

  if (d.loading) {
    return <div className="flex min-h-[300px] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-action-primary" aria-label="Loading" /></div>;
  }

  const p = d.project;
  const name = p?.project_name || p?.projectName || p?.name || 'FMS';
  const status = p?.status || 'Completed';
  const pmsId = p?.pms_id || p?.pmsId || p?.project_code || p?.projectCode || p?.code || 'PMS-9021';
  const client = p?.client_name || p?.customer || 'Ahana IT';
  const owner = p?.team_lead || p?.owner || 'Sarah J.';
  const start = p?.start_date || p?.startDate;
  const end = p?.end_date || p?.endDate;
  const range = `${start ? fmt(start) : 'Aug 01, 2024'} - ${end ? fmt(end) : 'Oct 15, 2024'}`;

  const back = () => d.setActiveTab(TAB_ORDER[Math.max(0, TAB_ORDER.indexOf(d.activeTab) - 1)]);
  const mode = d.isEditing ? 'edit' : 'view';

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-secondary">
          <button type="button" onClick={() => navigate('/projects')} className="hover:text-action-primary">Projects</button>
          <span aria-hidden="true">›</span>
          <span className="font-semibold text-ink-primary">{d.isEditing ? 'Edit' : 'View'}</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-ink-primary">{name}</h1>
              <Badge variant={statusVariant(status)} shape="chip" dot size="sm">{status}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <Meta icon={Hash}>{pmsId}</Meta>
              <Meta icon={Building2}>{client}</Meta>
              <Meta icon={User}>{owner}</Meta>
              <Meta icon={Calendar}>{range}</Meta>
            </div>
          </div>
          {d.activeTab === 'Project Info' && !d.isEditing && (
            <Button id="edit-project-btn" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => d.setIsEditing(true)}>Edit Project</Button>
          )}
        </div>
      </div>

      <Tabs items={DETAIL_TABS} value={d.activeTab} onChange={d.setActiveTab} />

      <div className="w-full">
        {d.activeTab === 'Project Overview' && <ProjectOverview project={p} />}
        {d.activeTab === 'Project Info' && (
          <ProjectInfoPanel project={p} isEditing={d.isEditing} onCancel={() => d.setIsEditing(false)} onNext={(fields) => d.goToTab('Task Info', fields)} onFormChange={d.setFormData} />
        )}
        {d.activeTab === 'Task Info' && <TaskInfoPanel mode={mode} onBack={back} onNext={() => d.goToTab('Effort Details')} />}
        {d.activeTab === 'Effort Details' && <EffortPanel mode={mode} onBack={back} onNext={() => d.goToTab('Documents Checklist')} />}
        {d.activeTab === 'Documents Checklist' && <DocumentChecklist mode={mode} onBack={back} onSubmit={() => d.save(d.formData)} />}
        {d.activeTab === 'Timesheet Data' && <TimesheetPanel />}
      </div>
    </div>
  );
}
