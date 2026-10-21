import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

import { DateRangePicker } from "./DateRangePicker";
import { TimesheetSummary } from "./TimesheetSummary";
import styles from "./TimesheetFilters.module.css";

export function TimesheetFilters({
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
            aria-label="Project"
            size="md"
            value={filters.project}
            onChange={update("project")}
            options={[
              { value: "", label: "All Projects" },
              ...projects.map((project) => ({
                value: project.code,
                label: project.name,
              })),
            ]}
            wrapperClassName={styles.selectField}
            className={styles.selectControl}
          />
          <Select
            label="Select Employee"
            aria-label="Select Employee"
            size="md"
            value={filters.employee}
            onChange={update("employee")}
            options={[
              { value: "", label: "Select Employee" },
              ...employees.map((employee) => ({
                value: employee.id,
                label: employee.name,
              })),
            ]}
            wrapperClassName={styles.selectField}
            className={styles.selectControl}
          />
          <DateRangePicker
            startDate={filters.startDate}
            endDate={filters.endDate}
            onChange={(range) =>
              onChange((current) => ({ ...current, ...range }))
            }
            className={styles.dateRange}
            triggerClassName={styles.dateRangeTrigger}
          />
          <Button
            size="md"
            onClick={() =>
              onApply({
                project: filters.project,
                employee: filters.employee,
                startDate: filters.startDate,
                endDate: filters.endDate,
              })
            }
            className={styles.applyButton}
          >
            Apply
          </Button>
          <Button
            size="md"
            variant="secondary"
            onClick={() => {
              onChange({
                project: "",
                employee: "",
                startDate: "",
                endDate: "",
              });
              onClear();
            }}
            className={styles.clearButton}
          >
            Clear
          </Button>
        </div>
        <TimesheetSummary stats={stats} />
      </div>
    </section>
  );
}
