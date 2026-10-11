import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";

const PROJECTS = [
  "FMS",
  "DTS_AUTOMATION1",
  "Cloud Migration Q1",
  "Security Audit FY24",
  "Mobile App Revamp",
];

const EMPLOYEES = [
  "Devanshi Shah",
  "Rahul Sharma",
  "Priya Nair",
  "Amit Patel",
  "Navithkumar V",
  "Sneha Reddy",
  "Bedasur V",
];

export function TimesheetFilters({
  filters,
  onChange,
  onApply,
  summary,
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
        options={[{ value: "", label: "All Projects" }, ...PROJECTS]}
        wrapperClassName="w-full sm:w-[139px]"
      />
      <Select
        label="Select Employee"
        aria-label="Select Employee"
        size="md"
        value={filters.employee}
        onChange={update("employee")}
        options={[{ value: "", label: "Select Employee" }, ...EMPLOYEES]}
        wrapperClassName="w-full sm:w-[138px]"
      />
      <div className="flex w-full flex-col gap-1 sm:w-[189px]">
        <span className="text-xs font-medium text-ink-secondary">Date Range</span>
        <div className="flex h-control-md items-center gap-2 rounded-control border border-line-field bg-surface-card px-2.5 focus-within:border-action-primary focus-within:ring-2 focus-within:ring-action-primary-ring">
          <div className="relative min-w-0 flex-1">
            <input
              aria-label="Start date"
              type="date"
              value={filters.startDate}
              onChange={update("startDate")}
              className="w-full min-w-0 border-0 bg-transparent px-0 text-xs text-ink-secondary outline-none [&::-webkit-calendar-picker-indicator]:hidden"
            />
          </div>
          <ArrowRight
            className="h-3.5 w-3.5 shrink-0 text-ink-muted"
            aria-hidden="true"
          />
          <div className="relative min-w-0 flex-1">
            <input
              aria-label="End date"
              type="date"
              value={filters.endDate}
              onChange={update("endDate")}
              className="w-full min-w-0 border-0 bg-transparent px-0 text-xs text-ink-secondary outline-none"
            />
          </div>
        </div>
      </div>
      <Button size="md" onClick={onApply} className="w-full sm:w-auto">
        Apply
      </Button>
      {summary}
    </Card>
  );
}
