import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download, ListFilter, Search } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

import {
  EMPTY_CHECKLIST_FILTERS,
  PROJECT_STATUSES,
  getActiveChecklistFilterCount,
} from "../constants";

function FilterSection({ label, children, className = "" }) {
  return (
    <section className={`flex flex-col gap-2 ${className}`}>
      <h3 className="text-xs font-medium leading-4 text-badge-neutral-ink">
        {label}
      </h3>
      {children}
    </section>
  );
}

function FilterCheckbox({ checked, onChange, children, className = "" }) {
  return (
    <label
      className={`inline-flex min-w-0 cursor-pointer items-center gap-2 text-xs leading-4 text-ink-secondary ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border border-badge-neutral-line bg-surface-card peer-checked:border-action-primary peer-checked:bg-action-primary peer-focus-visible:ring-2 peer-focus-visible:ring-action-primary-ring">
        {checked && (
          <span className="text-[11px] font-bold leading-none text-ink-on-primary">
            ✓
          </span>
        )}
      </span>
      <span className="min-w-0">{children}</span>
    </label>
  );
}

function ChecklistFilterPopover({
  filters,
  onChange,
  activeCount,
  documentTypes,
  onApply,
  onCancel,
  onReset,
}) {
  const popoverRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!popoverRef.current?.parentElement?.contains(event.target)) onCancel();
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  const toggleSelection = (key, value) => {
    const currentValues = filters[key];
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];
    onChange({ ...filters, [key]: nextValues });
  };

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Filter checklist"
      className="absolute left-0 top-[calc(100%+8px)] z-40 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-line-card bg-surface-card p-2 font-roboto shadow-[var(--shadow-3)]"
    >
      <div className="flex flex-col gap-2">
        <div className="flex h-[37px] items-center justify-between border-b border-line-card px-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-medium leading-4 text-ink-primary">
              Filter Checklist
            </h2>
            <span className="rounded bg-badge-brand-bg px-1.5 py-0.5 text-[10px] leading-4 text-badge-brand-ink">
              {activeCount} Active
            </span>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="text-xs leading-4 text-action-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-ring"
          >
            Reset
          </button>
        </div>

        <div className="flex max-h-[212px] flex-col gap-4 overflow-y-auto pr-1">
          <FilterSection label="Project Status">
            <div className="grid grid-cols-3 gap-2">
              {PROJECT_STATUSES.map((status) => (
                <FilterCheckbox
                  key={status}
                  checked={filters.projectStatuses.includes(status)}
                  onChange={() => toggleSelection("projectStatuses", status)}
                  className={
                    filters.projectStatuses.includes(status)
                      ? "font-medium text-ink-primary"
                      : ""
                  }
                >
                  {status}
                </FilterCheckbox>
              ))}
            </div>
          </FilterSection>

          <FilterSection
            label="Document Status"
            className="border-t border-line-card pt-3"
          >
            <div className="flex flex-col gap-1.5">
              <FilterCheckbox
                checked={filters.documentStatuses.includes("available")}
                onChange={() =>
                  toggleSelection("documentStatuses", "available")
                }
              >
                Available
              </FilterCheckbox>
              <FilterCheckbox
                checked={filters.documentStatuses.includes("pending")}
                onChange={() => toggleSelection("documentStatuses", "pending")}
                className={
                  filters.documentStatuses.includes("pending")
                    ? "font-medium text-badge-danger-ink"
                    : ""
                }
              >
                Pending / Not Available
              </FilterCheckbox>
            </div>
          </FilterSection>

          <FilterSection
            label="Document Type"
            className="border-t border-line-card pt-3"
          >
            <div className="relative">
              <select
                aria-label="Document type"
                value={filters.documentType}
                onChange={(event) =>
                  onChange({ ...filters, documentType: event.target.value })
                }
                className="h-[30px] w-full appearance-none rounded-lg border border-line-card bg-surface-card px-2.5 pr-8 text-xs text-ink-secondary outline-none focus-visible:ring-2 focus-visible:ring-action-primary-ring"
              >
                <option value="">
                  All {documentTypes.length || 16} Documents
                </option>
                {documentTypes.map((documentType) => (
                  <option key={documentType} value={documentType}>
                    {documentType}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
                aria-hidden="true"
              />
            </div>
          </FilterSection>
        </div>

        <div className="flex h-[49px] items-center justify-end gap-3 border-t border-line px-1 pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onCancel}
            className="h-8 w-[99px] rounded-lg border-line px-3 text-base font-normal leading-6"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onApply}
            className="h-8 w-[138px] rounded-lg px-3 text-base font-semibold leading-6 shadow-[var(--shadow-1)]"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ChecklistReportFilters({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  activeFilterCount,
  documentTypes,
  onExport,
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(EMPTY_CHECKLIST_FILTERS);

  const openPopover = () => {
    if (popoverOpen) {
      setPopoverOpen(false);
      return;
    }
    setDraftFilters({
      projectStatuses: [...filters.projectStatuses],
      documentStatuses: [...filters.documentStatuses],
      documentType: filters.documentType,
    });
    setPopoverOpen(true);
  };

  const applyFilters = () => {
    onFiltersChange(draftFilters);
    setPopoverOpen(false);
  };

  return (
    <Card className="flex flex-wrap items-center gap-2 rounded-control border-0 p-2 shadow-none lg:h-[60px] lg:flex-nowrap lg:justify-between">
      <Input
        aria-label="Search projects and documents"
        placeholder="Search by Project name"
        leadingIcon={
          <Search className="relative left-[3px] h-[13.5px] w-[13.5px] text-ink-muted" />
        }
        size="lg"
        className="pl-12 text-sm leading-4"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        onClear={() => onSearchChange('')}
        wrapperClassName="w-full min-w-0 sm:w-[var(--size-project-checklist-search-width)] sm:flex-none"
      />
      <div className="relative">
        <Button
          variant="secondary"
          size="md"
          leftIcon={<ListFilter className="h-[13.5px] w-[13.5px]" />}
          aria-expanded={popoverOpen}
          aria-haspopup="dialog"
          onClick={openPopover}
          className={`h-control-lg w-[80.5px] gap-1 border-action-primary px-4 text-xs font-semibold tracking-[0.6px] shadow-header ${
            popoverOpen || activeFilterCount > 0
              ? "bg-action-primary-soft text-action-primary"
              : "text-action-primary hover:bg-action-primary-soft"
          }`}
        >
          Filter
        </Button>
        {popoverOpen && (
          <ChecklistFilterPopover
            filters={draftFilters}
            onChange={setDraftFilters}
            activeCount={getActiveChecklistFilterCount(draftFilters)}
            documentTypes={documentTypes}
            onApply={applyFilters}
            onCancel={() => setPopoverOpen(false)}
            onReset={() => setDraftFilters({ ...EMPTY_CHECKLIST_FILTERS })}
          />
        )}
      </div>
      <Button
        variant="secondary"
        size="md"
        leftIcon={<Download className="h-3 w-3" />}
        onClick={onExport}
        className="ml-auto h-9 w-[122.67px] shrink-0 border-action-primary px-2 text-xs text-action-primary hover:bg-action-primary-soft"
      >
        Export Report
      </Button>
    </Card>
  );
}
