import { cva } from "class-variance-authority";

import { cn } from "@/lib/cn";

const valueStyles = cva("font-semibold leading-tight", {
  variants: {
    tone: {
      default: "text-ink-primary",
      brand: "text-action-primary",
      success: "text-badge-success-ink",
      warning: "text-badge-warning-ink",
      danger: "text-badge-danger-ink",
      info: "text-badge-info-ink",
    },
    size: { md: "text-lg whitespace-nowrap", lg: "text-2xl" },
  },
  defaultVariants: { tone: "default", size: "lg" },
});

/**
 * Metric tile: value + label (+ caption, icon).
 * `centered` centres the text; `filled` tints the whole tile with the tone (used for alerts, e.g. over-utilised).
 */
export function StatCard({
  label,
  value,
  caption,
  tone,
  size,
  icon,
  centered = false,
  filled = false,
  className,
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-start justify-between gap-2 rounded-chip border border-l-[3px] bg-surface-card p-3 shadow-header",
        tone === "danger"
          ? "border-line-card border-l-badge-danger-ink"
          : "border-line-card",
        filled && tone === "danger" ? "bg-badge-danger-bg" : "",
        centered && "items-center justify-center text-center",
        className,
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-col gap-0.5",
          centered && "items-center",
        )}
      >
        <span
          className={cn(
            "order-2 truncate text-xs",
            filled && tone === "danger"
              ? "text-badge-danger-ink"
              : "text-ink-secondary",
          )}
        >
          {label}
        </span>
        <span className={cn(valueStyles({ tone, size }), "order-1")}>
          {value}
        </span>
        {caption && (
          <span
            className={cn(
              "order-3 text-[11px]",
              filled && tone === "danger"
                ? "font-semibold text-badge-danger-ink"
                : "text-ink-muted",
            )}
          >
            {caption}
          </span>
        )}
      </div>
      {icon && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-chip bg-badge-brand-bg text-action-primary">
          {icon}
        </span>
      )}
    </div>
  );
}
