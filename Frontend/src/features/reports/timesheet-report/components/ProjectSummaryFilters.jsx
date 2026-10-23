import { Select } from "./TimesheetFilters";

// Filter bar for the "Project-wise Summary" tab. The backend endpoint takes no
// query params, so these filters are applied client-side against the already
// loaded dataset (see useProjectWiseSummary's filteredRows).
export function ProjectSummaryFilters({
  filters,
  onChange,
  onApply,
  onClear,
  projectCodes = [],
  projectNames = [],
  parentCategories = [],
}) {
  const update = (key) => (event) =>
    onChange((current) => ({ ...current, [key]: event.target.value }));

  return (
    <section
      aria-label="Project-wise summary filters"
      className="flex w-full flex-none flex-wrap items-end gap-3 overflow-visible rounded-lg border border-line-card bg-surface-card px-4 py-3"
    >
      <Select
        label="Project Code"
        className="w-[220px] flex-none"
        value={filters.projectCode}
        options={projectCodes}
        placeholder="All Project Codes"
        onChange={update("projectCode")}
      />
      <Select
        label="Project Name"
        className="w-[220px] flex-none"
        value={filters.projectName}
        options={projectNames}
        placeholder="All Project Names"
        onChange={update("projectName")}
      />
      <Select
        label="Project Category"
        className="w-[220px] flex-none"
        value={filters.parentCategory}
        options={parentCategories}
        placeholder="All Categories"
        onChange={update("parentCategory")}
      />
      <button
        type="button"
        className="inline-flex h-[36px] w-[88px] flex-none items-center justify-center rounded bg-action-primary px-3 text-[14px] font-semibold tracking-[0.6px] text-ink-on-primary transition-colors hover:bg-action-primary-hover"
        onClick={() => onApply(filters)}
      >
        Apply
      </button>
      <button
        type="button"
        className="inline-flex h-[36px] w-[80px] flex-none items-center justify-center rounded border border-action-primary bg-surface-card px-3 text-[14px] font-normal tracking-[0.6px] text-action-primary transition-colors hover:bg-action-primary-soft"
        onClick={() => {
          onChange({ projectCode: "", projectName: "", parentCategory: "" });
          onClear();
        }}
      >
        Clear
      </button>
    </section>
  );
}
