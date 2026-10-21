import styles from "./ReportHeader.module.css";

function DownloadIcon() {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}

export function ReportHeader({ onExport }) {
  return (
    <header className={styles.header}>
      <div className={styles.titleBlock}>
        <h1 className={styles.title}>Timesheet Report</h1>
        <p className={styles.subtitle}>
          Centralized cross-project employee time tracking and verification log
        </p>
      </div>
      <button
        type="button"
        className={styles.exportButton}
        onClick={onExport}
      >
        <DownloadIcon />
        <span>Export Report</span>
      </button>
    </header>
  );
}
