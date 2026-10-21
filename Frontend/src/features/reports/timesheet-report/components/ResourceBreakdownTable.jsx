import styles from "./ResourceBreakdownTable.module.css";

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

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
    <span className={`${styles.categoryTag} ${categoryClass}`}>
      {category || "—"}
    </span>
  );
}

function PageButton({
  label,
  ariaLabel,
  active,
  disabled,
  onClick,
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      className={`${styles.pageButton} ${active ? styles.activePage : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function pageItems(page, totalPages) {
  if (totalPages <= 4) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (page <= 3) return [1, 2, 3, "ellipsis", totalPages];
  if (page >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis-end", totalPages];
}

export function Pagination({
  totalRecords,
  page,
  pageSize,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const start = totalRecords === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalRecords);

  return (
    <footer className={styles.footer}>
      <span className={styles.footerLabel}>
        Showing {start}-{end} of {totalRecords} records
      </span>
      <nav className={styles.pagination} aria-label="Resource breakdown pagination">
        <PageButton
          label="<"
          ariaLabel="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        />
        {pageItems(page, totalPages).map((item, index) =>
          typeof item === "number" ? (
            <PageButton
              key={item}
              label={String(item)}
              ariaLabel={`Page ${item}`}
              active={item === page}
              onClick={() => onPageChange(item)}
            />
          ) : (
            <span key={`${item}-${index}`} className={styles.ellipsis}>
              ...
            </span>
          ),
        )}
        <PageButton
          label=">"
          ariaLabel="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        />
      </nav>
    </footer>
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
                  <td
                    className={styles.ellipsized}
                    title={row.projectName}
                  >
                    {row.projectName}
                  </td>
                  <td className={styles.ellipsized} title={row.customer}>
                    {row.customer}
                  </td>
                  <td className={styles.memberId}>{row.memberId}</td>
                  <td>{row.memberName}</td>
                  <td
                    className={
                      row.hours > 45 ? styles.overtimeHours : styles.hours
                    }
                  >
                    {Number(row.hours).toFixed(1)} hrs
                  </td>
                  <td className={styles.amount}>
                    {CURRENCY_FORMATTER.format(row.amount)}
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
      <Pagination
        totalRecords={totalRecords}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </section>
  );
}
