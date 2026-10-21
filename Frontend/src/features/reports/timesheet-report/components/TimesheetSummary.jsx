import styles from "./TimesheetSummary.module.css";

export function StatChip({ label, value, variant }) {
  const hours = value === undefined ? 0 : value;

  return (
    <div className={`${styles.statChip} ${styles[variant]}`}>
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.label}>{label}:</span>
      <span className={styles.value}>
        {Number(hours)} hrs
      </span>
    </div>
  );
}

export function TimesheetSummary({ stats = {} }) {
  return (
    <div className={styles.statsGroup}>
      <StatChip
        label="Total Hours"
        value={stats.total}
        variant="total"
      />
      <StatChip
        label="Approved"
        value={stats.approved}
        variant="success"
      />
      <StatChip
        label="Pending"
        value={stats.pending}
        variant="warning"
      />
    </div>
  );
}
