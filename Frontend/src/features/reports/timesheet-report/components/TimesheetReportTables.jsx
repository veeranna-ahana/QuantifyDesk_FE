import { formatCategory, formatINR } from "../formatters";
import { ProjectCodeBadge } from "./ResourceBreakdownTable";
import styles from "./DataTable.module.css";

function EmptyRow({ columns, loading, label }) {
  return (
    <tr>
      <td className={styles.emptyCell} colSpan={columns}>
        {loading ? "Loading report data..." : `No ${label} found.`}
      </td>
    </tr>
  );
}

function ParentCategory({ value }) {
  const categoryClass = value?.includes(":SP:")
    ? styles.categoryProject
    : value?.includes(":SS:")
      ? styles.categorySupport
      : styles.categoryDefault;

  return (
    <span className={`${styles.categoryTag} ${categoryClass}`} title={value}>
      {formatCategory(value) || "—"}
    </span>
  );
}

function formatHours(value) {
  return Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function ProjectSummaryTable({ records, loading = false }) {
  const columns = 8;

  return (
    <div className={styles.scroller}>
      <table className={`${styles.table} ${styles.projectSummaryTable}`}>
        <colgroup>
          <col className={styles.projectCodeColumn} />
          <col className={styles.projectNameColumn} />
          <col className={styles.customerColumn} />
          <col className={styles.memberCountColumn} />
          <col className={styles.totalHoursColumn} />
          <col className={styles.resourceCostColumn} />
          <col className={styles.monthColumn} />
          <col className={styles.parentCategoryColumn} />
        </colgroup>
        <thead>
          <tr className={styles.projectHeaderTwoLine}>
            <th scope="col">Project Code</th>
            <th scope="col">Project Name</th>
            <th scope="col">Customer Name</th>
            <th scope="col">Member Worked</th>
            <th scope="col">
              Total Hrs
              <span className={styles.subLabel}>(SEPT2026)</span>
            </th>
            <th scope="col">Total Resource Cost</th>
            <th scope="col">
              Month Seen
              <span className={styles.subLabel}>Apr-Sep2026</span>
            </th>
            <th scope="col">Parent Category</th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <EmptyRow columns={columns} loading={loading} label="projects" />
          ) : (
            records.map((record) => (
              <tr
                className={styles.projectRow}
                key={record.projectCode || record.projectName}
              >
                <td title={record.projectCode}>
                  <ProjectCodeBadge>{record.projectCode}</ProjectCodeBadge>
                </td>
                <td title={record.projectName}>{record.projectName || "—"}</td>
                <td title={record.customerName}>{record.customerName || "—"}</td>
                <td>
                  <span className={styles.memberCount}>
                    {record.memberCount ?? 0}
                  </span>
                </td>
                <td className={styles.hoursCell}>
                  <strong>{formatHours(record.totalHours)}</strong>
                  <span>hrs</span>
                </td>
                <td className={styles.resourceCost}>
                  {formatINR(record.totalResourceCost)}
                </td>
                <td>
                  <span className={styles.monthPill}>
                    {record.monthSeen || "—"}
                  </span>
                </td>
                <td>
                  <ParentCategory
                    value={record.parentCategory || record.category}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
