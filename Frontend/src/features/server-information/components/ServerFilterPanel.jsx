import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/Button";

const ENVIRONMENTS = ["Production", "UAT / Staging", "QA", "Development"];
const STATUSES = ["All", "Active", "Maintenance", "Not Active"];
const PROJECTS = [
  { value: "FMS", label: "FMS" },
  { value: "WPT", label: "Work Quantify Tool" },
  { value: "PMS", label: "PMS" },
];

function SectionLabel({ children }) {
  return (
    <h3 className="text-xs font-medium leading-4 tracking-[0.55px] text-badge-neutral-ink">
      {children}
    </h3>
  );
}

export function ServerFilterPanel({
  filters,
  onChange,
  activeCount,
  onReset,
  onCancel,
  onApply,
}) {
  const panelRef = useRef(null);
  const selectedProject =
    filters.projects.length === 0
      ? ""
      : filters.projects.length === 1
        ? filters.projects[0]
        : "__multiple";

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!panelRef.current?.parentElement?.contains(event.target)) onCancel();
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

  const toggleEnvironment = (environment) => {
    const environments = filters.environments.includes(environment)
      ? filters.environments.filter((item) => item !== environment)
      : [...filters.environments, environment];
    onChange({ ...filters, environments });
  };

  const toggleProject = (project) => {
    const selected = filters.projects.includes(project)
      ? filters.projects.filter((item) => item !== project)
      : [...filters.projects, project];
    onChange({ ...filters, projects: selected });
  };

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Filter servers"
      className="absolute right-0 top-[calc(100%+8px)] z-40 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-line-card bg-surface-card shadow-[var(--shadow-3)]"
    >
      <div className="max-h-[min(80vh,460px)] overflow-y-auto px-3 pt-2">
        <div className="flex h-[37px] items-center justify-between border-b border-line-card">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-medium leading-4 text-ink-primary">
              Filter Servers
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

        <div className="flex flex-col gap-4 py-3">
          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">Environment</legend>
            <SectionLabel>Environment</SectionLabel>
            <div className="grid grid-cols-2 gap-x-2 gap-y-2">
              {ENVIRONMENTS.map((environment) => (
                <label
                  key={environment}
                  className="inline-flex min-h-4 cursor-pointer items-center gap-2 text-xs leading-4 text-ink-secondary"
                >
                  <input
                    type="checkbox"
                    checked={filters.environments.includes(environment)}
                    onChange={() => toggleEnvironment(environment)}
                    className="h-3.5 w-3.5 cursor-pointer rounded-[3px] accent-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-ring"
                  />
                  {environment}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="sr-only">Status</legend>
            <SectionLabel>Status</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((status) => {
                const checked = filters.status === status;
                return (
                  <label
                    key={status}
                    className={`inline-flex h-[26px] cursor-pointer items-center gap-1.5 rounded border px-2 text-xs leading-4 text-ink-secondary transition-colors ${
                      "border-line-card bg-surface-card"
                    }`}
                  >
                    <input
                      type="radio"
                      name="server-status-filter"
                      value={status}
                      checked={checked}
                      onChange={() => onChange({ ...filters, status })}
                      className="h-3 w-3 cursor-pointer accent-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-ring"
                    />
                    {status}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-1.5">
            <legend className="sr-only">Assign Project</legend>
            <SectionLabel>Assign Project</SectionLabel>
            <div className="relative">
              <select
                aria-label="Choose a project filter"
                value={selectedProject}
                onChange={(event) =>
                  onChange({
                    ...filters,
                    projects:
                      event.target.value === ""
                        ? []
                        : event.target.value === "__multiple"
                          ? filters.projects
                          : [event.target.value],
                  })
                }
                className="h-[30px] w-full appearance-none rounded-md border border-line-card bg-surface-card px-2.5 pr-8 text-xs text-ink-secondary outline-none focus-visible:ring-2 focus-visible:ring-action-primary-ring"
              >
                <option value="">All Projects</option>
                {filters.projects.length > 1 && (
                  <option value="__multiple">
                    {filters.projects.length} Projects Selected
                  </option>
                )}
                {PROJECTS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
                aria-hidden="true"
              />
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
              {PROJECTS.map(({ value, label }) => (
                <label
                  key={value}
                  className="inline-flex cursor-pointer items-center gap-2 py-1 text-xs leading-4 text-ink-secondary"
                >
                  <input
                    type="checkbox"
                    checked={filters.projects.includes(value)}
                    onChange={() => toggleProject(value)}
                    className="h-3.5 w-3.5 cursor-pointer rounded-[3px] accent-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary-ring"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      <div className="flex h-[49px] items-center justify-end gap-3 border-t border-line px-2">
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
  );
}
