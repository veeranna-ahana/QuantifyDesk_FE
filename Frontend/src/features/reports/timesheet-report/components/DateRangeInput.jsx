import { useRef, useState } from "react";

import styles from "./DateRangeInput.module.css";

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

function DateField({ label, value, onChange }) {
  const [focused, setFocused] = useState(false);

  return (
    <input
      aria-label={label}
      className={styles.dateField}
      type={focused || value ? "date" : "text"}
      value={value}
      placeholder={label}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function DateRangeInput({ startDate, endDate, onChange }) {
  const rangeRef = useRef(null);

  return (
    <div className={styles.dateFieldGroup}>
      <label className={styles.label}>Date Range</label>
      <div ref={rangeRef} className={styles.dateRange}>
        <DateField
          label="Select Date"
          value={startDate}
          onChange={(value) =>
            onChange((current) => ({ ...current, startDate: value }))
          }
        />
        <span className={styles.rangeIcon}>
          <ArrowRightIcon />
        </span>
        <DateField
          label="End Date"
          value={endDate}
          onChange={(value) =>
            onChange((current) => ({ ...current, endDate: value }))
          }
        />
        <button
          type="button"
          className={styles.calendarButton}
          aria-label="Choose end date"
          onClick={() => {
            const input = rangeRef.current?.querySelector(
              '[aria-label="End Date"]',
            );
            input?.focus();
            input?.showPicker?.();
          }}
        >
          <CalendarIcon />
        </button>
      </div>
    </div>
  );
}
