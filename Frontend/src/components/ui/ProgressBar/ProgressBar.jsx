import { cva } from "class-variance-authority";

import { cn } from "@/lib/cn";

const fillStyles = cva("h-full rounded-full transition-all", {
  variants: {
    tone: {
      brand: "bg-action-primary",
      success: "bg-progress-success",
      warning: "bg-badge-warning-ink",
      danger: "bg-badge-danger-ink",
    },
  },
  defaultVariants: { tone: "brand" },
});

export function ProgressBar({ value, tone, className }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-badge-neutral-line",
        className,
      )}
    >
      <div className={fillStyles({ tone })} style={{ width: `${pct}%` }} />
    </div>
  );
}
