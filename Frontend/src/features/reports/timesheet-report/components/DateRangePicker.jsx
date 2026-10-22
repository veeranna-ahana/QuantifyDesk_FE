import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/cn";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const pad = (n) => String(n).padStart(2, "0");
const toIso = (year, month, day) => `${year}-${pad(month + 1)}-${pad(day)}`;

function parseIso(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return { year, month: month - 1, day };
}

function formatLabel(value) {
  const parts = parseIso(value);
  if (!parts) return "";
  return `${pad(parts.day)} ${MONTHS[parts.month].slice(0, 3)} ${parts.year}`;
}

/**
 * One calendar for a whole range: click the start date, then the end date.
 * Values are "YYYY-MM-DD" strings (empty when not set).
 */
export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  className = "",
  triggerClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState("");
  const [view, setView] = useState(() => {
    const base = parseIso(startDate) ?? {
      year: new Date().getFullYear(),
      month: new Date().getMonth(),
    };
    return { year: base.year, month: base.month };
  });
  const rootRef = useRef(null);

  // Start is chosen, end is not yet: the next click completes the range
  const picking = Boolean(startDate) && !endDate;

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target))
        setOpen(false);
    };
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const cells = useMemo(() => {
    const firstWeekday = new Date(view.year, view.month, 1).getDay();
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    return [
      ...Array(firstWeekday).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) =>
        toIso(view.year, view.month, i + 1),
      ),
    ];
  }, [view]);

  const shiftMonth = (delta) =>
    setView((current) => {
      const date = new Date(current.year, current.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });

  const pickDay = (iso) => {
    if (!picking) {
      onChange({ startDate: iso, endDate: "" });
      return;
    }
    const [from, to] = iso < startDate ? [iso, startDate] : [startDate, iso];
    onChange({ startDate: from, endDate: to });
    setHover("");
    setOpen(false);
  };

  // While picking, preview the range up to the day under the pointer
  const rangeEnd = endDate || (picking ? hover : "");
  const [low, high] =
    startDate && rangeEnd && rangeEnd < startDate
      ? [rangeEnd, startDate]
      : [startDate, rangeEnd];

  const hasValue = Boolean(startDate || endDate);

  return (
    <div
      ref={rootRef}
      className={`relative flex w-full flex-col gap-1 ${className}`}
    >
      <span className="text-xs font-medium text-ink-secondary">Date Range</span>
      <button
        type="button"
        aria-label="Date range"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-control-md w-full items-center gap-2 rounded-control border bg-surface-card px-2.5 text-left text-xs",
          open
            ? "border-action-primary ring-2 ring-action-primary-ring"
            : "border-line-field",
          triggerClassName,
        )}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            startDate ? "text-ink-primary" : "text-ink-muted",
          )}
        >
          {startDate ? formatLabel(startDate) : "Select Date"}
        </span>
        <ArrowRight
          className="h-3.5 w-3.5 shrink-0 text-ink-muted"
          aria-hidden="true"
        />
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            endDate ? "text-ink-primary" : "text-ink-muted",
          )}
        >
          {endDate ? formatLabel(endDate) : "End Date"}
        </span>
        <Calendar
          className="h-3.5 w-3.5 shrink-0 text-ink-muted"
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose date range"
          className="absolute left-0 top-full z-50 mt-1 w-[260px] rounded-control border border-line-field bg-surface-card p-3 shadow-lg"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => shiftMonth(-1)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-ink-secondary hover:bg-action-primary-soft"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-ink-primary">
              {MONTHS[view.month]} {view.year}
            </span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => shiftMonth(1)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-ink-secondary hover:bg-action-primary-soft"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-[11px] font-medium text-ink-muted">
            {WEEKDAYS.map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
          </div>

          <div
            className="grid grid-cols-7 gap-y-0.5"
            onMouseLeave={() => setHover("")}
          >
            {cells.map((iso, index) => {
              if (!iso) return <span key={`blank-${index}`} />;
              const isEdge = iso === startDate || iso === endDate;
              const inRange = low && high && iso > low && iso < high;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => pickDay(iso)}
                  onMouseEnter={() => picking && setHover(iso)}
                  aria-label={formatLabel(iso)}
                  aria-pressed={isEdge}
                  className={cn(
                    "h-8 text-xs",
                    isEdge
                      ? "rounded-md bg-action-primary font-semibold text-white"
                      : inRange
                        ? "bg-action-primary-soft text-ink-primary"
                        : "rounded-md text-ink-primary hover:bg-action-primary-soft",
                  )}
                >
                  {Number(iso.slice(8))}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-line-table-head pt-2 text-xs">
            <span className="text-ink-muted">
              {picking ? "Select the end date" : "Select the start date"}
            </span>
            {hasValue && (
              <button
                type="button"
                onClick={() => onChange({ startDate: "", endDate: "" })}
                className="font-medium text-action-primary hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
