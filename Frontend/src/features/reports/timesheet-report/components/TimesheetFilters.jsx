import { DateRangeInput } from "./DateRangeInput";
import { TimesheetSummary } from "./TimesheetSummary";
import styles from "./TimesheetFilters.module.css";

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
}) {
  return (
    <label className={styles.selectField}>
      <span className={styles.label}>{label}</span>
      <span className={styles.selectControl}>
        <select
          aria-label={label}
          className={value ? styles.selectedValue : ""}
          value={value}
          onChange={onChange}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={styles.chevron}>
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
  stats,
  projects = [],
  employees = [],
}) {
  const update = (key) => (event) =>
    onChange((current) => ({ ...current, [key]: event.target.value }));

  return (
    <section className={styles.filterCard} aria-label="Timesheet filters">
      <div className={styles.filterRow}>
        <div className={styles.filtersGroup}>
          <Select
            label="Project"
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
          <div className={styles.buttonsGroup}>
            <button
              type="button"
              className={styles.applyButton}
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
              className={styles.clearButton}
              onClick={() => {
                onChange({
                  project: "",
                  employee: "",
                  startDate: "",
                  endDate: "",
                });
                onClear();
              }}
            >
              Clear
            </button>
          </div>
        </div>
        <TimesheetSummary stats={stats} />
      </div>
    </section>
  );
}

export const TimesheetFilters = FilterAndStatsCard;
