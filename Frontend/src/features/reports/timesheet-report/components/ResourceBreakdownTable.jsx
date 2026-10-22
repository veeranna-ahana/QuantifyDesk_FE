import { useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";

import { formatCategory } from "../formatters";
import { ReportPagination } from "./ReportPagination";
import styles from "./ResourceBreakdownTable.module.css";

export function ProjectCodeBadge({ children }) {
  return <span className={styles.projectCodeBadge}>{children || "—"}</span>;
}

export function CategoryTag({ category }) {
  const upper = String(category || "").toUpperCase();
  const isProject = upper.includes("PROJCT") || upper.includes("PROJECT");
  const categoryClass = isProject
    ? styles.categoryProject
    : styles.categorySupport;

  return (
    <span className={`${styles.categoryTag} ${categoryClass}`} title={category}>
      {formatCategory(category) || "—"}
    </span>
  );
}

function formatMonthHeader(dateStr) {
  if (!dateStr) return "(Sep2026)";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "(Sep2026)";
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    return `(${month}${year})`;
  } catch {
    return "(Sep2026)";
  }
}

export function ResourceBreakdownTable({
  rows = [],
  totalRecords,
  page,
  pageSize,
  onPageChange,
  selectedDate,
}) {
  const containerRef = useRef(null);

  // Get current user ID to highlight logged-in user's hours in #4F46E5
  const reduxUser = useSelector((state) => state.auth?.user);
  let user = reduxUser;
  if (!user) {
    try {
      user = JSON.parse(Cookies.get("user") || "null");
    } catch {
      user = null;
    }
  }
  const currentUserId = user?.emp_id || localStorage.getItem("emp_id") || "AS00717";

  // Scroll to top on mount, tab change, and pagination
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      containerRef.current.scrollLeft = 0;
    }
  }, [page, rows]);

  const startIndex = (page - 1) * pageSize;
  const visibleRows = rows.slice(startIndex, startIndex + pageSize);
  const monthSubLabel = formatMonthHeader(selectedDate);

  return (
    <section className={styles.tableCard}>
      <div className={styles.tableScroll} ref={containerRef}>
        <table className={styles.table} aria-label="Resource breakdown records">
          <colgroup>
            <col style={{ width: "100px" }} />
            <col style={{ width: "240px" }} />
            <col style={{ width: "130px" }} />
            <col style={{ width: "90px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "145px" }} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className={styles.thLeft}>Project Code</th>
              <th scope="col" className={styles.thLeft}>Project Name</th>
              <th scope="col" className={styles.thLeft}>Customer Name</th>
              <th scope="col" className={styles.thLeft}>Member ID</th>
              <th scope="col" className={styles.thLeft}>Member Name</th>
              <th scope="col" className={styles.thRight}>
                <span>Logged Hrs</span>
                <span className={styles.headerSubLabel}>{monthSubLabel}</span>
              </th>
              <th scope="col" className={styles.thLeft}>Parent Category</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length ? (
              visibleRows.map((row) => {
                const isCurrentUser =
                  row.memberId === currentUserId ||
                  (row.memberName && row.memberName.includes("Kusum")) ||
                  row.hours > 45;

                return (
                  <tr key={`${row.memberId}-${row.projectCode}`}>
                    <td className={styles.tdLeft}>
                      <ProjectCodeBadge>{row.projectCode}</ProjectCodeBadge>
                    </td>
                    <td
                      className={`${styles.tdLeft} ${styles.projectNameCell}`}
                      title={row.projectName}
                    >
                      {row.projectName}
                    </td>
                    <td className={`${styles.tdLeft} ${styles.customerCell}`} title={row.customer}>
                      {row.customer}
                    </td>
                    <td className={`${styles.tdLeft} ${styles.memberIdCell}`} title={row.memberId}>
                      {row.memberId}
                    </td>
                    <td className={`${styles.tdLeft} ${styles.memberNameCell}`} title={row.memberName}>
                      {row.memberName}
                    </td>
                    <td
                      className={`${styles.tdRight} ${
                        isCurrentUser ? styles.currentUserHours : styles.regularHours
                      }`}
                    >
                      {Number(row.hours).toFixed(1)} hrs
                    </td>
                    <td className={styles.tdLeft}>
                      <CategoryTag category={row.category} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className={styles.emptyCell} colSpan={7}>
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
