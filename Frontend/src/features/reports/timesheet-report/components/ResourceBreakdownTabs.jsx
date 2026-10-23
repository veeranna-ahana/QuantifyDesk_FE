import { cn } from "@/lib/cn";

function SheetIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className="h-4 w-4 stroke-current stroke-[1.6]"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2.25" y="1.75" width="11.5" height="12.5" rx="1.5" />
      <path d="M5 5h6M5 7.5h6M5 10h2.5" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className="h-4 w-4 stroke-current stroke-[1.6]"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1.75 4.5h4l1.5 1.75h7v6.5H1.75V4.5Z" />
      <path d="M1.75 4.5V3.25h4L7.25 5h5.5" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className="h-4 w-4 stroke-current stroke-[1.6]"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="5" r="2.25" />
      <path d="M1.75 13c.35-2.1 1.85-3.25 4.25-3.25s3.9 1.15 4.25 3.25" />
      <path d="M10 3.1a2.2 2.2 0 0 1 0 3.8m1.05 2.2c1.65.35 2.6 1.3 2.95 2.9" />
    </svg>
  );
}

function Tab({ active, icon, label, count, onClick }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 flex-none items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-[13px] font-normal transition-colors",
        active
          ? "bg-action-primary font-medium text-ink-on-primary hover:bg-action-primary-hover"
          : "bg-transparent text-ink-secondary hover:bg-surface-field-disabled hover:text-ink-primary",
      )}
    >
      {icon}
      <span>{label}</span>
      {count && (
        <span
          className={cn(
            "inline-flex min-h-[18px] items-center justify-center rounded-full px-[7px] text-[11px] font-medium leading-[14px]",
            active
              ? "bg-white/90 font-semibold text-action-primary"
              : "bg-action-primary-soft text-ink-secondary",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function ResourceBreakdownTabs({
  activeTab,
  onTabChange,
  timesheetCount,
  timesheetCountLoading = false,
  projectCount,
  projectCountLoading = false,
  resourceCount,
  resourceCountLoading = false,
}) {
  return (
    <div
      role="tablist"
      aria-label="Timesheet report views"
      className="flex h-12 min-h-[48px] w-full min-w-0 flex-none items-center gap-1 rounded-xl border border-line-card bg-surface-card px-2 py-1 shadow-1"
    >
      <Tab
        active={activeTab === "timesheet"}
        icon={<SheetIcon />}
        label="Timesheet Report"
        count={timesheetCountLoading ? "Loading…" : `${timesheetCount} Entries`}
        onClick={() => onTabChange("timesheet")}
      />
      <Tab
        active={activeTab === "projects"}
        icon={<FolderIcon />}
        label="Project-wise Summary"
        count={projectCountLoading ? "Loading…" : `${projectCount} Projects`}
        onClick={() => onTabChange("projects")}
      />
      <Tab
        active={activeTab === "resources"}
        icon={<PeopleIcon />}
        label="Resource Breakdown"
        count={resourceCountLoading ? "Loading…" : `${resourceCount} Logs`}
        onClick={() => onTabChange("resources")}
      />
    </div>
  );
}

export const ReportTabs = ResourceBreakdownTabs;
