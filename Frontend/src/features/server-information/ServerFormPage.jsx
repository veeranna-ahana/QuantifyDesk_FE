// src/features/server-information/ServerFormPage.jsx
import { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  AlignLeft,
  ChevronRight,
  LayoutGrid,
  Plus,
  Check,
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
    <div className="flex flex-col gap-5 pb-8">

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-muted">
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

      {/* ── Page title + subtitle ────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">
          {isEdit ? 'Edit Server' : 'Add Server'}
        </h1>
        <p className="mt-0.5 text-[13px] text-ink-secondary">
          Configure and register physical or virtual server host infrastructure
          for enterprise projects.
        </p>
      </div>

      {/* ── Main form card ───────────────────────────────────────────────── */}
      <form
        id="server-form"
        onSubmit={handleSubmit}
        noValidate
        className="rounded-chip border border-line-card bg-surface-card shadow-sm"
      >
        <div className="flex flex-col gap-7 px-6 pb-0 pt-6">

          {/* ═══ Section 1: Server Information ═══════════════════════════ */}
          <SectionCard
            icon={<LayoutGrid className="h-3.5 w-3.5" />}
            title="Server Information"
          >
            {/* Row 1: Server Name | IP Address */}
            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              <Input
                id="server-name"
                label="Server Name"
                required
                placeholder="Enter server name (e.g. srv-ind-alpha-node-02)"
                value={values.serverName}
                onChange={set('serverName')}
                error={errors.serverName}
              />
              <Input
                id="ip-address"
                label="IP Address"
                required
                placeholder="Enter IP address (e.g. 10.24.168.105)"
                value={values.ipAddress}
                onChange={set('ipAddress')}
                error={errors.ipAddress}
              />
            </div>

            {/* Row 2: RAM | CPU */}
            <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              <Input
                id="ram"
                label="RAM Capacity"
                placeholder="e.g. 32 GB"
                value={values.ram}
                onChange={set('ram')}
                error={errors.ram}
              />
              <Input
                id="cpu"
                label="CPU Architecture"
                placeholder="e.g. 8 Core Xeon / EPYC"
                value={values.cpu}
                onChange={set('cpu')}
                error={errors.cpu}
              />
            </div>

            {/* Row 3: Storage | OS */}
            <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              <Input
                id="storage"
                label="Storage"
                placeholder="e.g. 500 GB NVMe SSD"
                value={values.storage}
                onChange={set('storage')}
                error={errors.storage}
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
              />
            </div>

            {/* Row 4: Environment | GPU */}
            <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              <Select
                id="environment"
                label="Environment"
                required
                placeholder="Production"
                options={ENVIRONMENT_OPTIONS}
                value={values.environment}
                onChange={set('environment')}
                error={errors.environment}
              />
              <Input
                id="gpu"
                label="GPU Acceleration"
                placeholder="e.g. NVIDIA A100 / None"
                value={values.gpu}
                onChange={set('gpu')}
                error={errors.gpu}
              />
            </div>

            {/* Row 5: Initial Status | (empty right column) */}
            <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              <Select
                id="status"
                label="Initial Status"
                required
                placeholder="Active"
                options={STATUS_OPTIONS}
                value={values.status}
                onChange={set('status')}
                error={errors.status}
              />
              {/* Empty right cell — intentional per Figma */}
              <div aria-hidden="true" />
            </div>
          </SectionCard>

          {/* ═══ Section 2: Project Assignment ═══════════════════════════ */}
          <SectionCard
            icon={<Share2 className="h-3.5 w-3.5" />}
            title="Project Assignment"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ink-secondary">
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
          >
            <Textarea
              id="description"
              label="Description / Notes"
              placeholder="Enter additional server information or notes (e.g. Rack B4, Tier 3 DC, primary replication node)."
              rows={5}
              value={values.description}
              onChange={set('description')}
              error={errors.description}
            />
          </SectionCard>
        </div>

        {/* ── Footer action bar ──────────────────────────────────────────── */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-line-card px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="server-form"
            variant="primary"
            size="md"
            leftIcon={isEdit ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          >
            {isEdit ? 'Save Changes' : 'Add Server'}
          </Button>
        </div>
      </form>
    </div>
  );
}
