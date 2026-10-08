// src/features/server-information/ServerFormPage.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  AlignLeft,
  ChevronRight,
  Plus,
  Check,
  SquareTerminal,
  Share2,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

import {
  ASSIGNED_PROJECT_OPTIONS,
  ENVIRONMENT_OPTIONS,
  OS_OPTIONS,
  STATUS_OPTIONS,
} from './constants';
import { ProjectTagInput } from './components/ProjectTagInput';
import { SectionCard } from './components/SectionCard';
import { useServerForm } from './hooks/useServerForm';

const fieldClassName = 'text-[#171C20]';

/**
 * Add Server  →  /server-information/add
 * Edit Server →  /server-information/:id/edit
 *
 * Receives the server to edit via react-router `location.state.server`.
 * For Add, no state is passed.
 */
export default function ServerFormPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const server = state?.server ?? null;
  const isEdit = Boolean(server);

  const {
    values,
    errors,
    set,
    toggleProject,
    removeProject,
    validate,
    reset,
    projectSearch,
    setProjectSearch,
    projectDropdownOpen,
    setProjectDropdownOpen,
  } = useServerForm(server);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleCancel = () => {
    reset();
    navigate('/server-information');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // TODO: swap for real API call (POST / PUT) when backend is ready
    console.info(`${isEdit ? 'Update' : 'Create'} server:`, values);
    navigate('/server-information', {
      state: {
        successMessage: isEdit
          ? 'Server updated successfully.'
          : 'Server added successfully.',
      },
    });
  };

  return (
    // Full-page wrapper — matches the light page surface
    <div className="flex flex-col gap-2 pb-8 -mt-2">

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs leading-[18px] text-[#6B778C]">
          <Link
            to="/server-information"
            className="transition-colors hover:text-ink-primary"
          >
            Server Information
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="font-medium text-action-primary">
            {isEdit ? 'Edit Server' : 'Add Server'}
          </span>
        </nav>

        <div>
          <h1 className="pt-[3px] text-2xl font-bold leading-[30px] text-[#0B1C30]">
            {isEdit ? 'Edit Server' : 'Add Server'}
          </h1>
          {!isEdit && (
            <p className="text-[13px] leading-5 text-[#6B778C]">
              Configure and register physical or virtual server host infrastructure
              for enterprise projects.
            </p>
          )}
        </div>
      </div>

      {/* ── Main form card ───────────────────────────────────────────────── */}
      <form
        id="server-form"
        onSubmit={handleSubmit}
        noValidate
        className="w-full rounded-chip border border-line-card bg-surface-card shadow-sm [&_label]:leading-5 [&_label]:text-[#6B778C]"
      >
        <div className="flex flex-col gap-2 px-6 pb-0 pt-2">

          {/* ═══ Section 1: Server Information ═══════════════════════════ */}
          <SectionCard
            icon={<SquareTerminal className="h-3.5 w-3.5" />}
            title="Server Information"
          >
            <div className="grid grid-cols-1 gap-x-5 gap-y-[7.5px] xl:grid-cols-2">
              <Input
                id="server-name"
                label="Server Name"
                required
                placeholder="Enter server name (e.g. srv-ind-alpha-node-02)"
                value={values.serverName}
                onChange={set('serverName')}
                error={errors.serverName}
                wrapperClassName="gap-1.5"
                className={fieldClassName}
              />
              <Input
                id="ip-address"
                label="IP Address"
                required
                placeholder="Enter IP address (e.g. 10.24.168.105)"
                value={values.ipAddress}
                onChange={set('ipAddress')}
                error={errors.ipAddress}
                wrapperClassName="gap-1.5"
                className={fieldClassName}
              />
              <Input
                id="ram"
                label="RAM Capacity"
                placeholder="e.g. 32 GB"
                value={values.ram}
                onChange={set('ram')}
                error={errors.ram}
                wrapperClassName="gap-1.5"
                className={fieldClassName}
              />
              <Input
                id="cpu"
                label="CPU Architecture"
                placeholder="e.g. 8 Core Xeon / EPYC"
                value={values.cpu}
                onChange={set('cpu')}
                error={errors.cpu}
                wrapperClassName="gap-1.5"
                className={fieldClassName}
              />
              <Input
                id="storage"
                label="Storage"
                placeholder="e.g. 500 GB NVMe SSD"
                value={values.storage}
                onChange={set('storage')}
                error={errors.storage}
                wrapperClassName="gap-1.5"
                className={fieldClassName}
              />
              <Select
                id="os"
                label="Operating System"
                required
                placeholder="Select OS"
                options={OS_OPTIONS}
                value={values.os}
                onChange={set('os')}
                error={errors.os}
                wrapperClassName="gap-1.5"
                className={fieldClassName}
              />
              <Select
                id="environment"
                label="Environment"
                required
                placeholder="Production"
                options={ENVIRONMENT_OPTIONS}
                value={values.environment}
                onChange={set('environment')}
                error={errors.environment}
                wrapperClassName="gap-1.5"
                className={fieldClassName}
              />
              <Input
                id="gpu"
                label="GPU Acceleration"
                placeholder="e.g. NVIDIA A100 / None"
                value={values.gpu}
                onChange={set('gpu')}
                error={errors.gpu}
                wrapperClassName="gap-1.5"
                className={fieldClassName}
              />
              <Select
                id="status"
                label="Initial Status"
                required
                placeholder="Active"
                options={STATUS_OPTIONS}
                value={values.status}
                onChange={set('status')}
                error={errors.status}
                wrapperClassName="gap-1.5"
                className={fieldClassName}
              />
              <div aria-hidden="true" className="hidden xl:block" />
            </div>
          </SectionCard>

          {/* ═══ Section 2: Project Assignment ═══════════════════════════ */}
          <SectionCard
            icon={<Share2 className="h-3.5 w-3.5" />}
            title="Project Assignment"
            className="py-4"
            iconClassName="bg-[#F5F3FF]"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium leading-5 text-[#6B778C]">
                Allocated Projects{' '}
                <span className="text-badge-danger-ink">*</span>
              </label>
              <ProjectTagInput
                options={ASSIGNED_PROJECT_OPTIONS}
                selected={values.assignedProjects}
                onToggle={toggleProject}
                onRemove={removeProject}
                search={projectSearch}
                onSearchChange={setProjectSearch}
                open={projectDropdownOpen}
                onOpenChange={setProjectDropdownOpen}
                error={errors.assignedProjects}
              />
            </div>
          </SectionCard>

          {/* ═══ Section 3: Additional Information ═══════════════════════ */}
          <SectionCard
            icon={<AlignLeft className="h-3.5 w-3.5" />}
            title="Additional Information"
            className="py-2"
          >
            <Textarea
              id="description"
              label="Description / Notes"
              placeholder="Enter additional server information or notes (e.g. Rack B4, Tier 3 DC, primary replication node)."
              rows={5}
              value={values.description}
              onChange={set('description')}
              error={errors.description}
              wrapperClassName="gap-1.5"
              className="h-[99.25px] min-h-0 resize-y rounded-control border-line-card py-[7px] text-sm leading-5 text-[#171C20]"
            />
          </SectionCard>
        </div>

        {/* ── Footer action bar ──────────────────────────────────────────── */}
        <div className="mt-0 flex items-center justify-end gap-3 border-t border-line-card px-6 py-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleCancel}
            className="h-11 rounded-control px-4 text-base"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="server-form"
            variant="primary"
            size="md"
            leftIcon={isEdit ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            className="h-11 rounded-control px-6 text-base"
          >
            {isEdit ? 'Save Changes' : 'Add Server'}
          </Button>
        </div>
      </form>
    </div>
  );
}
