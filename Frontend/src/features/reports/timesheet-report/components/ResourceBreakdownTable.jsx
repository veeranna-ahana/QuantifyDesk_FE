import { formatCategory, formatINR } from "../formatters";
import { ReportPagination } from "./ReportPagination";
import styles from "./ResourceBreakdownTable.module.css";

export function ProjectCodeBadge({ children }) {
  return <span className={styles.projectCodeBadge}>{children || "—"}</span>;
}

export function CategoryTag({ category }) {
  const categoryClass = category?.includes(":SP:")
    ? styles.categoryProject
    : category?.includes(":SS:")
      ? styles.categorySupport
      : styles.categoryDefault;

  return (
    <span className={`${styles.categoryTag} ${categoryClass}`} title={category}>
      {formatCategory(category) || "—"}
    </span>
  );
}

export function ResourceBreakdownTable({
  rows,
  totalRecords,
  page,
  pageSize,
  onPageChange,
}) {
  const startIndex = (page - 1) * pageSize;
  const visibleRows = rows.slice(startIndex, startIndex + pageSize);

  return (
    <section className={styles.tableCard}>
      <div className={styles.tableScroll}>
        <table className={styles.table} aria-label="Resource breakdown records">
          <colgroup>
            <col className={styles.projectCodeColumn} />
            <col className={styles.projectNameColumn} />
            <col className={styles.customerColumn} />
            <col className={styles.memberIdColumn} />
            <col className={styles.memberNameColumn} />
            <col className={styles.hoursColumn} />
            <col className={styles.amountColumn} />
            <col className={styles.categoryColumn} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Project Code</th>
              <th scope="col">Project Name</th>
              <th scope="col">Customer Name</th>
              <th scope="col">Member ID</th>
              <th scope="col">Member Name</th>
              <th scope="col">
                Logged Hrs
                <span className={styles.headerSubLabel}>(Sep2026)</span>
              </th>
              <th scope="col">Billing Rate/Cost</th>
              <th scope="col">Parent Category</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length ? (
              visibleRows.map((row) => (
                <tr key={`${row.memberId}-${row.projectCode}`}>
                  <td>
                    <ProjectCodeBadge>{row.projectCode}</ProjectCodeBadge>
                  </td>
                  <td className={styles.ellipsized} title={row.projectName}>
                    {row.projectName}
                  </td>
                  <td className={styles.ellipsized} title={row.customer}>
                    {row.customer}
                  </td>
                  <td className={styles.memberId} title={row.memberId}>
                    {row.memberId}
                  </td>
                  <td title={row.memberName}>{row.memberName}</td>
                  <td
                    className={
                      row.hours > 45 ? styles.overtimeHours : styles.hours
                    }
                  >
                    {Number(row.hours).toFixed(1)} hrs
                  </td>
                  <td className={styles.amount}>
                    {formatINR(row.amount)}
                  </td>
                  <td>
                    <CategoryTag category={row.category} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className={styles.emptyCell} colSpan={8}>
                  No resource records available on this page.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ReportPagination
        totalRecords={totalRecords}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </section>
  );
}
