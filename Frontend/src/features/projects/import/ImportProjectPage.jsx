import { ArrowRight, Check } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import SearchableSelect from "@/components/ui/SearchableSelect/SearchableSelect";
import { Stepper } from "@/components/ui/Stepper";

import { DocumentChecklist } from "../components/DocumentChecklist";
import { EffortPanel } from "../components/EffortPanel";
import { ProjectInfoForm } from "../components/ProjectInfoForm";
import { TaskInfoPanel } from "../components/TaskInfoPanel";
import { useImportProjectWizard } from "../hooks/useImportProjectWizard";

/** Import Project wizard: 1 Project Info -> 2 Task Info -> 3 Effort Estimate -> 4 Document Checklist. */
export default function ImportProjectPage() {
  const wiz = useImportProjectWizard();

  // Step 1's PMS project selection: a searchable TITLE dropdown, not a typed numeric PMS ID.
  // Picking a title resolves it to PMS's current project_id and syncs automatically — see
  // useImportProjectWizard's selectProjectTitle for why (PMS mints a new project_id per version).
  const pmsRow = (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-ink-primary">
        Project Name
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <SearchableSelect
          id="pms-project-title-select"
          value={wiz.projectTitle}
          onChange={wiz.setProjectTitle}
          options={wiz.projectTitleOptions}
          loading={wiz.loadingProjectTitles || wiz.syncing}
          disabled={wiz.syncing}
          placeholder="Enter Project Name to sync"
          className="w-full max-w-[20rem]"
        />
        {wiz.syncing && (
          <span className="text-xs font-medium text-ink-secondary">
            Syncing…
          </span>
        )}
        {wiz.synced && !wiz.syncing && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-badge-success-ink">
            <Check className="h-3.5 w-3.5" />
            Synced
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader title="Import Project" />
      <Stepper
        steps={wiz.steps}
        currentStep={wiz.step}
        onStepChange={wiz.goTo}
      />

      {wiz.step === 1 && (
        <>
          <ProjectInfoForm
            mode="import"
            values={wiz.values}
            onChange={wiz.changeValue}
            pmsSlot={pmsRow}
            projectTypeOptions={wiz.projectTypeOptions}
            synced={wiz.synced}
          />
          <div className="flex justify-end gap-3">
            <Button id="import-cancel-btn" variant="ghost" onClick={wiz.cancel}>
              Cancel
            </Button>
            <Button
              id="import-next-btn"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={wiz.next}
            >
              Next
            </Button>
          </div>
        </>
      )}
      {wiz.step === 2 && (
        <TaskInfoPanel
          mode="import"
          onBack={wiz.back}
          onNext={wiz.next}
          milestones={wiz.taskMilestones}
          onMilestonesChange={wiz.setTaskMilestones}
          projectContext={{
            projectName: wiz.values.projectName,
            pmsId: wiz.pmsId,
          }}
        />
      )}
      {wiz.step === 3 && (
        <EffortPanel
          mode="import"
          onBack={wiz.back}
          onNext={wiz.next}
          rows={wiz.effortRows}
          onRowsChange={wiz.setEffortRows}
          projectContext={{
            projectName: wiz.values.projectName,
            pmsId: wiz.pmsId,
          }}
        />
      )}
      {wiz.step === 4 && (
        <DocumentChecklist
          mode="import"
          onBack={wiz.back}
          onSubmit={wiz.create}
          docs={wiz.documents}
          onDocsChange={wiz.setDocuments}
          submitting={wiz.creating}
          projectContext={{
            projectName: wiz.values.projectName,
            pmsId: wiz.pmsId,
          }}
        />
      )}
    </div>
  );
}
