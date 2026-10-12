import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";

import { DateRangePicker } from "./DateRangePicker";

export function TimesheetFilters({
  filters,
  onChange,
  onApply,
  onClear,
  summary,
  projects = [],
  employees = [],
}) {
  const update = (key) => (event) =>
    onChange((current) => ({ ...current, [key]: event.target.value }));

  return (
    <Card className="flex flex-wrap items-end gap-3 p-3">
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
        wrapperClassName="w-full sm:w-[139px]"
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
        wrapperClassName="w-full sm:w-[138px]"
      />
      <DateRangePicker
        startDate={filters.startDate}
        endDate={filters.endDate}
        onChange={(range) => onChange((current) => ({ ...current, ...range }))}
      />
      <Button size="md" onClick={onApply} className="w-full sm:w-auto">
        Apply
      </Button>
      <Button
        size="md"
        variant="secondary"
        onClick={onClear}
        className="w-full border-action-primary text-action-primary hover:bg-action-primary-soft sm:w-auto"
      >
        Clear
      </Button>
      {summary}
    </Card>
  );
}
