import { useEffect, useRef } from "react";
import styles from "./DataTable.module.css";

function getMonthLabel(filters) {
  if (filters?.endDate || filters?.startDate) {
    const dStr = filters.endDate || filters.startDate;
    const d = new Date(dStr);
    if (!isNaN(d.getTime())) {
      const monthNames = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEPT",
        "OCT",
        "NOV",
        "DEC",
      ];
      return `(${monthNames[d.getMonth()]}${d.getFullYear()})`;
    }
  }
  return "(SEPT2026)";
}

function ParentCategoryPill({ value }) {
  if (!value) return "—";
  const str = String(value);
  const isProject = /proj/i.test(str);
  return (
    <span
      className={
        isProject
          ? styles.parentCategoryProject
          : styles.parentCategorySupport
      }
      title={str}
    >
      {str}
    </span>
  );
}

export function ProjectSummaryTable({
  records = [],
  loading = false,
  filters,
}) {
  const containerRef = useRef(null);
  const monthLabel = getMonthLabel(filters);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      containerRef.current.scrollLeft = 0;
    }
  }, [records]);

  return (
    <div className={styles.tableContainer} ref={containerRef}>
      <table className={`${styles.table} ${styles.projectSummaryTable}`}>
        <colgroup>
          <col style={{ width: "110px" }} />
          <col style={{ width: "290px" }} />
          <col style={{ width: "140px" }} />
          <col style={{ width: "90px" }} />
          <col style={{ width: "90px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "160px" }} />
        </colgroup>
        <thead>
          <tr className={styles.projectSummaryHeaderRow}>
            <th scope="col" className={styles.thCenter}>
              Project Code
            </th>
            <th scope="col" className={styles.thLeft}>
              Project Name
            </th>
            <th scope="col" className={styles.thCenter}>
              Customer Name
            </th>
            <th scope="col" className={styles.thCenter}>
              <div className={styles.wrappedHeader}>
                <span>Member</span>
                <span>Worked</span>
              </div>
            </th>
            <th scope="col" className={styles.thCenter}>
              <div className={styles.totalHrsHeader}>
                <span>Total Hrs</span>
                <span className={styles.totalHrsSub}>{monthLabel}</span>
              </div>
            </th>
            <th scope="col" className={styles.thCenter}>
              <div className={styles.wrappedHeader}>
                <span>First Month</span>
                <span>Seen</span>
              </div>
            </th>
            <th scope="col" className={styles.thCenter}>
              Parent Category
            </th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td className={styles.emptyCell} colSpan={7}>
                {loading
                  ? "Loading project summary..."
                  : "No projects found."}
              </td>
            </tr>
          ) : (
            records.map((record, index) => {
              const code = record.projectCode || "—";
              const name = record.projectName || "—";
              const customer = record.customerName || "—";
              const members =
                record.memberCount != null ? record.memberCount : "—";
              const hours =
                record.totalHours != null
                  ? Number(record.totalHours).toFixed(1)
                  : "—";
              const firstMonth =
                record.monthSeen || record.firstMonthSeen || "—";
              const parentCat =
                record.parentCategory || record.category || "—";

              return (
                <tr
                  key={record.projectCode || index}
                  className={styles.projectSummaryRow}
                >
                  <td className={styles.tdCenter}>
                    <span className={styles.projectCodeBadge}>{code}</span>
                  </td>
                  <td className={styles.tdLeft}>
                    <span className={styles.projectNameCell} title={name}>
                      {name}
                    </span>
                  </td>
                  <td className={styles.tdCenter}>
                    <span className={styles.customerNameCell}>
                      {customer}
                    </span>
                  </td>
                  <td className={styles.tdCenter}>
                    <span className={styles.memberWorkedCircle}>
                      {members}
                    </span>
                  </td>
                  <td className={styles.tdCenter}>
                    <div className={styles.totalHrsCell}>
                      <span className={styles.totalHrsValue}>{hours}</span>
                      <span className={styles.totalHrsUnit}>hrs</span>
                    </div>
                  </td>
                  <td className={styles.tdCenter}>
                    <span className={styles.firstMonthPill}>
                      {firstMonth}
                    </span>
                  </td>
                  <td className={styles.tdCenter}>
                    <ParentCategoryPill value={parentCat} />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
