import { ArrowRight, Check, RefreshCw } from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Stepper } from '@/components/ui/Stepper';

import { DocumentChecklist } from '../components/DocumentChecklist';
import { EffortPanel } from '../components/EffortPanel';
import { ProjectInfoForm } from '../components/ProjectInfoForm';
import { TaskInfoPanel } from '../components/TaskInfoPanel';
import { useImportProjectWizard } from '../hooks/useImportProjectWizard';

/** Import Project wizard: 1 Project Info -> 2 Task Info -> 3 Effort Estimate -> 4 Document Checklist. */
export default function ImportProjectPage() {
  const wiz = useImportProjectWizard();

  const pmsRow = (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-ink-primary">PMS ID</span>
      <div className="flex flex-wrap items-center gap-2">
        <Input id="pms-id-input" aria-label="PMS ID" placeholder="Enter PMS ID to sync" value={wiz.pmsId} onChange={(e) => wiz.setPmsId(e.target.value)} wrapperClassName="w-full max-w-[16rem]" />
        <Button id="pms-sync-btn" isLoading={wiz.syncing} disabled={!wiz.pmsId.trim()} leftIcon={<RefreshCw className="h-3.5 w-3.5" />} onClick={wiz.handleSync}>
          {wiz.syncing ? 'Syncing…' : 'Sync'}
        </Button>
        {wiz.synced && <span className="inline-flex items-center gap-1 text-xs font-medium text-badge-success-ink"><Check className="h-3.5 w-3.5" />Synced</span>}
      </div>
    </div>
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader title="Import Project" />
      <Stepper steps={wiz.steps} currentStep={wiz.step} onStepChange={wiz.goTo} />

      {wiz.step === 1 && (
        <>
          <ProjectInfoForm mode="import" values={wiz.values} onChange={wiz.changeValue} pmsSlot={pmsRow} synced={wiz.synced} />
          <div className="flex justify-end gap-3">
            <Button id="import-cancel-btn" variant="ghost" onClick={wiz.cancel}>Cancel</Button>
            <Button id="import-next-btn" rightIcon={<ArrowRight className="h-4 w-4" />} onClick={wiz.next}>Next</Button>
          </div>
        </>
      )}
      {wiz.step === 2 && <TaskInfoPanel mode="import" onBack={wiz.back} onNext={wiz.next} />}
      {wiz.step === 3 && <EffortPanel mode="import" onBack={wiz.back} onNext={wiz.next} />}
      {wiz.step === 4 && <DocumentChecklist mode="import" onBack={wiz.back} onSubmit={wiz.create} />}
    </div>
  );
}
