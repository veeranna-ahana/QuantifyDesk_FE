import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Download,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const EMPTY_FILTERS = {
  availabilityStatuses: [],
  experience: "all",
  timing: "",
};

const AVAILABILITY_OPTIONS = [
  {
    id: "available",
    label: "Available (100%)",
    countKey: "available",
    countClass:
      "bg-[color:var(--color-member-available-bg)] text-[color:var(--color-member-available-text)]",
  },
  {
    id: "partial",
    label: "Partially Available",
    countKey: "partial",
    countClass:
      "bg-[color:var(--color-member-partial-bg)] text-[color:var(--color-member-partial-text)]",
  },
  {
    id: "allocated",
    label: "Fully Allocated (100%)",
    countKey: "allocated",
    countClass:
      "bg-[color:var(--color-member-allocated-bg)] text-[color:var(--color-member-allocated-text)]",
  },
];

const EXPERIENCE_OPTIONS = [
  { id: "all", label: "All" },
  { id: "under-3", label: "< 3 Yrs" },
  { id: "3-to-5", label: "3-5 Yrs" },
  { id: "5-plus", label: "5+ Yrs" },
];

const TIMING_OPTIONS = [
  { id: "immediate", label: "Immediate (< 7 Days)" },
  { id: "next-30-days", label: "Next 30 Days" },
  { id: "future", label: "Future Allocation (> 30 Days)" },
];

function FilterSection({ label, children }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-medium leading-4 tracking-[0.6px] text-badge-neutral-ink">
        {label}
      </h3>
      {children}
    </section>
  );
}

function FilterCheckbox({ checked, onChange, children }) {
  return (
    <label className="inline-flex min-w-0 cursor-pointer items-center gap-[9px] text-xs leading-4 text-[color:var(--color-status-neutral-text)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border border-[color:var(--color-status-neutral-border)] bg-surface-card peer-checked:border-action-primary peer-checked:bg-action-primary peer-focus-visible:ring-2 peer-focus-visible:ring-action-primary-ring">
        {checked && (
          <span className="text-xs font-bold leading-none text-ink-on-primary">
            ✓
          </span>
        )}
      </span>
      <span className="min-w-0">{children}</span>
    </label>
  );
}

function MemberFilterPopover({
  filters,
  onChange,
  availabilityCounts,
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

  const toggleAvailability = (status) => {
    const selected = filters.availabilityStatuses.includes(status)
      ? filters.availabilityStatuses.filter((value) => value !== status)
      : [...filters.availabilityStatuses, status];
    onChange({ ...filters, availabilityStatuses: selected });
  };

  const activeCount = [
    filters.availabilityStatuses.length > 0,
    filters.experience !== "all",
    Boolean(filters.timing),
  ].filter(Boolean).length;

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Filter members"
      className="absolute right-0 top-[calc(100%+8px)] z-40 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-line-card bg-surface-card p-2 font-roboto shadow-[var(--shadow-3)]"
    >
      <div className="flex flex-col gap-2">
        <div className="flex h-[37px] items-center justify-between border-b border-line-card">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-medium leading-4 text-[color:var(--color-member-title)]">
              Filter Members
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

        <div className="h-[307px] overflow-y-auto">
          <div className="flex flex-col gap-2 py-1">
            <FilterSection label="Availability Status">
              <div className="flex flex-col">
                {AVAILABILITY_OPTIONS.map((option) => {
                  const checked =
                    filters.availabilityStatuses.includes(option.id);
                  return (
                    <div
                      key={option.id}
                      className="flex h-[34px] items-center justify-between rounded-lg px-[5px]"
                    >
                      <FilterCheckbox
                        checked={checked}
                        onChange={() => toggleAvailability(option.id)}
                      >
                        {option.label}
                      </FilterCheckbox>
                      <span
                        className={`inline-flex min-w-5 items-center justify-center rounded-full px-2 py-0.5 text-[11px] leading-4 ${option.countClass}`}
                      >
                        {availabilityCounts[option.countKey]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </FilterSection>

            <FilterSection label="Experience Range">
              <div
                role="group"
                aria-label="Experience range"
                className="flex h-8 items-center gap-1.5 rounded-lg bg-badge-neutral-bg p-1"
              >
                {EXPERIENCE_OPTIONS.map((option) => {
                  const selected = filters.experience === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        onChange({ ...filters, experience: option.id })
                      }
                      className={`flex h-6 flex-1 items-center justify-center rounded-md px-1 text-xs leading-4 transition-colors ${
                        selected
                          ? "bg-surface-card font-semibold text-action-primary"
                          : "text-[color:var(--color-status-neutral-text)] hover:bg-surface-card"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </FilterSection>

            <FilterSection label="Availability Timing">
              <div className="flex flex-col gap-1.5">
                {TIMING_OPTIONS.map((option) => {
                  const selected = filters.timing === option.id;
                  return (
                    <label
                      key={option.id}
                      className="inline-flex h-6 cursor-pointer items-center gap-2 text-xs leading-4 text-[color:var(--color-status-neutral-text)]"
                    >
                      <input
                        type="radio"
                        name="member-availability-timing"
                        value={option.id}
                        checked={selected}
                        onChange={() =>
                          onChange({ ...filters, timing: option.id })
                        }
                        className="h-4 w-4 cursor-pointer accent-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-ring"
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </FilterSection>
          </div>
        </div>

        <div className="flex h-[49px] items-center justify-end gap-3 border-t border-line pt-2">
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

export function MemberFilters({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  availabilityCounts,
  onSkillAnalytics,
  onExport,
}) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const activeCount = [
    filters.availabilityStatuses.length > 0,
    filters.experience !== "all",
    Boolean(filters.timing),
  ].filter(Boolean).length;

  const openPopover = () => {
    if (popoverOpen) {
      setPopoverOpen(false);
      return;
    }
    setDraftFilters({
      availabilityStatuses: [...filters.availabilityStatuses],
      experience: filters.experience,
      timing: filters.timing,
    });
    setPopoverOpen(true);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        aria-label="Search members"
        placeholder="Search by employee name, ID or project..."
        leadingIcon={
          <Search className="h-[var(--size-member-search-icon)] w-[var(--size-member-search-icon)] text-[color:var(--color-member-table-heading)]" />
        }
        size="lg"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        onClear={() => onSearchChange('')}
        wrapperClassName="min-w-48 flex-1 sm:flex-none sm:w-64 lg:w-[var(--size-member-search-width)]"
        className="placeholder:text-[color:var(--color-member-table-heading)]"
      />
      <div className="relative">
        <Button
          variant="secondary"
          size="md"
          leftIcon={
            <SlidersHorizontal className="h-[var(--size-member-filter-icon)] w-[var(--size-member-filter-icon)]" />
          }
          aria-expanded={popoverOpen}
          aria-haspopup="dialog"
          onClick={openPopover}
          className={`h-control-lg w-[var(--size-member-filter-width)] gap-1 rounded-control px-4 text-xs font-semibold tracking-[0.6px] text-action-primary shadow-header ${
            popoverOpen || activeCount > 0
              ? "bg-action-primary-soft"
              : "hover:bg-action-primary-soft"
          }`}
        >
          Filter
        </Button>
        {popoverOpen && (
          <MemberFilterPopover
            filters={draftFilters}
            onChange={setDraftFilters}
            availabilityCounts={availabilityCounts}
            onApply={() => {
              onFiltersChange(draftFilters);
              setPopoverOpen(false);
            }}
            onCancel={() => setPopoverOpen(false)}
            onReset={() => setDraftFilters({ ...EMPTY_FILTERS })}
          />
        )}
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          leftIcon={<BarChart3 className="h-4 w-4" />}
          onClick={onSkillAnalytics}
          className="h-9 w-[var(--size-member-skill-button-width)] px-4 text-sm font-semibold"
        >
          Skill Analytics
        </Button>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={
            <Download className="h-[var(--size-member-export-icon)] w-[var(--size-member-export-icon)]" />
          }
          onClick={onExport}
          className="h-9 w-[var(--size-member-export-button-width)] gap-2 px-3 text-xs font-semibold text-action-primary hover:bg-action-primary-soft"
        >
          Export Report
        </Button>
      </div>
    </div>
  );
}
