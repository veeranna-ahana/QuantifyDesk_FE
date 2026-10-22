import styles from "./ResourceBreakdownTabs.module.css";

function SheetIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
      <rect x="2.25" y="1.75" width="11.5" height="12.5" rx="1.5" />
      <path d="M5 5h6M5 7.5h6M5 10h2.5" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
      <path d="M1.75 4.5h4l1.5 1.75h7v6.5H1.75V4.5Z" />
      <path d="M1.75 4.5V3.25h4L7.25 5h5.5" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2.25" />
      <path d="M1.75 13c.35-2.1 1.85-3.25 4.25-3.25s3.9 1.15 4.25 3.25" />
      <path d="M10 3.1a2.2 2.2 0 0 1 0 3.8m1.05 2.2c1.65.35 2.6 1.3 2.95 2.9" />
    </svg>
  );
}

function Tab({ active, icon, label, count, onClick }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`${styles.tab} ${active ? styles.activeTab : ""}`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
      {count && (
        <span className={`${styles.countBadge} ${active ? styles.activeBadge : ""}`}>
          {count}
        </span>
      )}
    </button>
  );
}

export function ResourceBreakdownTabs({
  activeTab,
  onTabChange,
  projectCount,
  resourceCount,
}) {
  return (
    <div className={styles.tabBar} role="tablist" aria-label="Timesheet report views">
      <Tab
        active={activeTab === "timesheet"}
        icon={<SheetIcon />}
        label="Timesheet Report"
        onClick={() => onTabChange("timesheet")}
      />
      <Tab
        active={activeTab === "projects"}
        icon={<FolderIcon />}
        label="Project-wise Summary"
        count={`${projectCount} Projects`}
        onClick={() => onTabChange("projects")}
      />
      <Tab
        active={activeTab === "resources"}
        icon={<PeopleIcon />}
        label="Resource Breakdown"
        count={`${resourceCount} Logs`}
        onClick={() => onTabChange("resources")}
      />
    </div>
  );
}

export const ReportTabs = ResourceBreakdownTabs;
