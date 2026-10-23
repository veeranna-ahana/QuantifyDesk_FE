import { cn } from "@/lib/cn";

const VARIANT_STYLES = {
  total: {
    chip: "border-badge-neutral-line bg-badge-neutral-bg",
    dot: "bg-badge-neutral-ink",
    label: "text-badge-neutral-ink",
    value: "text-ink-primary",
  },
  success: {
    chip: "border-badge-success-line bg-badge-success-bg",
    dot: "bg-badge-success-ink",
    label: "text-badge-success-ink",
    value: "text-badge-success-ink",
  },
  warning: {
    chip: "border-badge-warning-line bg-badge-warning-bg",
    dot: "bg-badge-warning-ink",
    label: "text-badge-warning-ink",
    value: "text-badge-warning-ink",
  },
};

// Round to 2 decimals and drop a trailing ".00" so whole numbers stay clean
// (floating-point summation of many rows otherwise leaves noise like
// 26938.499999999978 instead of 26938.5).
function formatHours(value) {
  const rounded = Math.round((Number(value) || 0) * 100) / 100;
  return rounded % 1 === 0
    ? rounded.toFixed(0)
    : rounded.toFixed(2).replace(/0$/, "");
}

export function StatChip({ label, value, variant }) {
  const hours = value === undefined ? 0 : value;
  const v = VARIANT_STYLES[variant] || VARIANT_STYLES.total;

  return (
    <div
      className={cn(
        "inline-flex h-[30px] flex-none items-center gap-1.5 whitespace-nowrap rounded-lg border px-1 py-1.5 text-[11px]",
        v.chip,
      )}
    >
      <span
        className={cn("h-2 w-2 flex-none rounded-full", v.dot)}
        aria-hidden="true"
      />
      <span className={cn("text-[11px] font-normal", v.label)}>{label}:</span>
      <span className={cn("text-[11px] font-normal", v.value)}>
        {formatHours(hours)} hrs
      </span>
    </div>
  );
}

export function TimesheetSummary({ stats = {} }) {
  return (
    <div className="flex flex-none items-center gap-2.5 whitespace-nowrap">
      <StatChip label="Total Hours" value={stats.total} variant="total" />
      <StatChip label="Approved" value={stats.approved} variant="success" />
      <StatChip label="Pending" value={stats.pending} variant="warning" />
    </div>
  );
}
