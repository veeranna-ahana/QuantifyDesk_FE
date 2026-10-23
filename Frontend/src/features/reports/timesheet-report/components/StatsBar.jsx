import { TimesheetSummary } from "./TimesheetSummary";

// Total Hours / Approved / Pending badges — shown above the table regardless
// of which tab (Timesheet Report / Project-wise Summary / Resource Breakdown)
// is active.
export function StatsBar({ stats }) {
  return (
    <section
      aria-label="Timesheet stats"
      className="flex h-[52px] w-full flex-none items-center gap-2.5 whitespace-nowrap rounded-lg border border-line-card bg-surface-card px-4 py-2.5"
    >
      <TimesheetSummary stats={stats} />
    </section>
  );
}
