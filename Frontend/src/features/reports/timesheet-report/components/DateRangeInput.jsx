import { useRef, useState } from "react";

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </svg>
  );
}

function DateField({ label, value, onChange, inputRef, flexClass }) {
  const [focused, setFocused] = useState(false);

  return (
    <input
      ref={inputRef}
      aria-label={label}
      className={`min-w-0 ${flexClass} border-0 bg-transparent p-0 text-[12px] font-normal leading-[14px] text-ink-primary outline-none placeholder:text-ink-muted [&::-webkit-calendar-picker-indicator]:hidden`}
      type={focused ? "date" : "text"}
      value={value}
      placeholder={label}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function DateRangeInput({ startDate, endDate, onChange }) {
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  const openPicker = (inputRef) => () => {
    const input = inputRef.current;
    input?.focus();
    window.requestAnimationFrame(() => input?.showPicker?.());
  };

  return (
    <div className="flex w-[260px] flex-none flex-col gap-0.5">
      <span className="mb-0.5 whitespace-nowrap text-[12px] font-semibold leading-[14px] text-ink-secondary">
        Date Range
      </span>
      <div className="flex h-[36px] w-full min-w-0 items-center gap-1.5 rounded border border-line-field bg-surface-card px-2.5 transition-colors focus-within:border-action-primary focus-within:ring-2 focus-within:ring-action-primary-ring/40">
        <DateField
          label="Select Date"
          value={startDate}
          inputRef={startDateRef}
          flexClass="flex-[1.15_1_0]"
          onChange={(value) => onChange({ startDate: value })}
        />
        <button
          type="button"
          aria-label="Choose start date"
          className="flex h-4 w-4 flex-none items-center justify-center border-0 bg-transparent p-0 text-line-default hover:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-action-primary"
          onClick={openPicker(startDateRef)}
        >
          <CalendarIcon />
        </button>
        <span className="flex h-4 w-4 flex-none items-center justify-center text-line-default">
          <ArrowRightIcon />
        </span>
        <DateField
          label="End Date"
          value={endDate}
          inputRef={endDateRef}
          flexClass="flex-[0.85_1_0]"
          onChange={(value) => onChange({ endDate: value })}
        />
        <button
          type="button"
          aria-label="Choose end date"
          className="flex h-4 w-4 flex-none items-center justify-center border-0 bg-transparent p-0 text-line-default hover:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-action-primary"
          onClick={openPicker(endDateRef)}
        >
          <CalendarIcon />
        </button>
      </div>
    </div>
  );
}
