import { cn } from "@/lib/cn";
import { DateRangeInput } from "./DateRangeInput";

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function Select({
  label,
  value,
  options,
  placeholder,
  onChange,
  className,
}) {
  return (
    <label className={cn("flex flex-col gap-0.5", className)}>
      <span className="mb-0.5 whitespace-nowrap text-[12px] font-semibold leading-[14px] text-ink-secondary">
        {label}
      </span>
      <span className="relative flex h-[36px] items-center">
        <select
          aria-label={label}
          value={value}
          onChange={onChange}
          className={cn(
            "h-[36px] w-full appearance-none truncate rounded border border-line-field bg-surface-card py-0 pl-2.5 pr-6 text-[12px] font-normal leading-[14px] outline-none transition-[border-color,box-shadow] focus:border-action-primary focus:ring-2 focus:ring-action-primary-ring/40",
            value ? "text-ink-primary" : "text-ink-muted",
          )}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center text-line-default">
          <ChevronDownIcon />
        </span>
      </span>
    </label>
  );
}

export function FilterAndStatsCard({
  filters,
  onChange,
  onApply,
  onClear,
  projects = [],
  employees = [],
}) {
  const update = (key) => (event) =>
    onChange((current) => ({ ...current, [key]: event.target.value }));

  return (
    <section
      aria-label="Timesheet filters"
      className="flex w-full flex-none flex-wrap items-end gap-3 overflow-visible rounded-lg border border-line-card bg-surface-card px-4 py-3"
    >
      <Select
        label="Project"
        className="w-[220px] flex-none"
        value={filters.project}
        options={projects.map((project) => ({
          value: project.value ?? project.code,
          label: project.label ?? project.name,
        }))}
        placeholder="All Projects"
        onChange={update("project")}
      />
      <Select
        label="Select Employee"
        className="w-[220px] flex-none"
        value={filters.employee}
        options={employees.map((employee) => ({
          value: employee.value ?? employee.id,
          label: employee.label ?? employee.name,
        }))}
        placeholder="Select Employee"
        onChange={update("employee")}
      />
      <DateRangeInput
        startDate={filters.startDate}
        endDate={filters.endDate}
        onChange={(range) => onChange((current) => ({ ...current, ...range }))}
      />
      <button
        type="button"
        className="inline-flex h-[36px] w-[88px] flex-none items-center justify-center rounded bg-action-primary px-3 text-[14px] font-semibold tracking-[0.6px] text-ink-on-primary transition-colors hover:bg-action-primary-hover"
        onClick={() =>
          onApply({
            project: filters.project,
            employee: filters.employee,
            startDate: filters.startDate,
            endDate: filters.endDate,
          })
        }
      >
        Apply
      </button>
      <button
        type="button"
        className="inline-flex h-[36px] w-[80px] flex-none items-center justify-center rounded border border-action-primary bg-surface-card px-3 text-[14px] font-normal tracking-[0.6px] text-action-primary transition-colors hover:bg-action-primary-soft"
        onClick={() => {
          onChange({ project: "", employee: "", startDate: "", endDate: "" });
          onClear();
        }}
      >
        Clear
      </button>
    </section>
  );
}

export const TimesheetFilters = FilterAndStatsCard;
