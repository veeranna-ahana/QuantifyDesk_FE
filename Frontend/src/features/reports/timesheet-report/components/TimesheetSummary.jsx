import styles from "./TimesheetSummary.module.css";

function SummaryItem({ label, value, variant }) {
  return (
    <div className={`${styles.statChip} ${styles[variant]}`}>
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.label}>{label}:</span>
      <span className={styles.value}>
        {Number(value || 0).toLocaleString()} hrs
      </span>
    </div>
  );
}

export function TimesheetSummary({ stats = {} }) {
  return (
    <div className={styles.statsGroup}>
      <SummaryItem
        label="Total Hours"
        value={stats.total}
        variant="total"
      />
      <SummaryItem
        label="Approved"
        value={stats.approved}
        variant="success"
      />
      <SummaryItem
        label="Pending"
        value={stats.pending}
        variant="warning"
      />
    </div>
  );
}
